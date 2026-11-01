#!/usr/bin/env node
/*
  Мини-бэкенд демо-сайта «ТехБокс» — без зависимостей, нужен только Node.js 18+.

    node server.js                 → http://localhost:3000
    PORT=8080 ADMIN_TOKEN=secret node server.js

  Отдаёт статику из этой папки и API:
    GET   /api/health                       — проверка, что сервер жив
    GET   /api/slots?date=YYYY-MM-DD        — занятые слоты дня (минуты от полуночи)
    POST  /api/bookings                     — создать запись
    GET   /api/bookings/:id?phone=1234      — статус ремонта (последние 4 цифры телефона)
    GET   /api/admin/bookings               — все записи      (заголовок X-Admin-Token)
    PATCH /api/admin/bookings/:id           — сменить статус  (заголовок X-Admin-Token)

  Записи хранятся в data/bookings.json.
*/
const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'bookings.json');
const PORT = Number(process.env.PORT) || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'demo';

// Часы работы берём из того же config.js, что и сайт
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'config.js'), 'utf8'), sandbox);
const CFG = sandbox.window.SITE_DEFAULTS;
const OPEN = Number(CFG.open) || 9;
const CLOSE = Number(CFG.close) || 21;

const STATUSES = ['new', 'confirmed', 'in_work', 'ready', 'done', 'cancelled'];

// ---------- хранилище ----------
fs.mkdirSync(DATA_DIR, { recursive: true });
let db = { seq: 1000, bookings: [] };
try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch { /* первый запуск */ }
const save = () => {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
};

// ---------- время по Москве ----------
const mskNow = () => { const d = new Date(); return new Date(d.getTime() + (d.getTimezoneOffset() + 180) * 60000); };
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s + 'T00:00:00'));

// ---------- помощники ----------
const digits = (v) => String(v || '').replace(/\D/g, '');
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const send = (res, code, body, headers = {}) => {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(body));
};
const readBody = (req) => new Promise((resolve, reject) => {
  let size = 0; const chunks = [];
  req.on('data', (c) => { size += c.length; if (size > 16 * 1024) { reject(Object.assign(new Error('Слишком большой запрос'), { code: 413 })); req.destroy(); } else chunks.push(c); });
  req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch { reject(Object.assign(new Error('Некорректный JSON'), { code: 400 })); } });
  req.on('error', reject);
});

// простое ограничение частоты для создания записей: 8 в минуту с одного IP
const hits = new Map();
const limited = (ip) => {
  const t = Date.now(); const arr = (hits.get(ip) || []).filter((x) => t - x < 60000);
  arr.push(t); hits.set(ip, arr); return arr.length > 8;
};

const publicView = (b) => ({ id: b.id, status: b.status, date: b.date, minute: b.minute, service: b.service, car: b.car, works: b.works, total: b.total, history: b.history });

// Демонстрационный заказ № 1000 (телефон …0000) — всегда «в работе», чтобы было что показать в трекере
const demoOrder = () => {
  const now = mskNow(); const at = (h) => new Date(Date.now() - h * 3600000).toISOString();
  return { id: 1000, status: 'in_work', date: ymd(now), minute: Math.max(OPEN, Math.min(now.getHours() - 1, CLOSE - 1)) * 60, service: 'Замена передних колодок', car: 'Kia Rio', works: ['Замена передних колодок', 'Замена тормозной жидкости'], total: 3000,
    history: [{ status: 'new', at: at(26) }, { status: 'confirmed', at: at(25) }, { status: 'in_work', at: at(0.6) }] };
};

// ---------- API ----------
async function api(req, res, url) {
  const p = url.pathname;
  const ip = req.socket.remoteAddress || '';

  if (p === '/api/health' && req.method === 'GET') return send(res, 200, { ok: true, open: OPEN, close: CLOSE });

  if (p === '/api/slots' && req.method === 'GET') {
    const date = url.searchParams.get('date') || '';
    if (!isDate(date)) return send(res, 400, { error: 'Нужна дата в формате YYYY-MM-DD' });
    const busy = db.bookings.filter((b) => b.date === date && b.status !== 'cancelled').map((b) => b.minute);
    return send(res, 200, { date, busy });
  }

  if (p === '/api/bookings' && req.method === 'POST') {
    if (limited(ip)) return send(res, 429, { error: 'Слишком много заявок. Попробуйте через минуту или позвоните нам.' });
    const b = await readBody(req);
    const date = String(b.date || '');
    const minute = Number(b.minute);
    const phone = digits(b.phone);
    if (!isDate(date)) return send(res, 400, { error: 'Выберите день записи.' });
    if (!Number.isInteger(minute) || minute % 30 || minute < OPEN * 60 || minute > (CLOSE - 1) * 60) return send(res, 400, { error: 'Выберите время в часы работы.' });
    if (phone.length < 10 || phone.length > 15) return send(res, 400, { error: 'Укажите телефон — мастер перезвонит для подтверждения.' });
    const now = mskNow(); const today = ymd(now);
    const max = new Date(now); max.setDate(max.getDate() + 13);
    if (date < today || date > ymd(max)) return send(res, 400, { error: 'Записаться можно на ближайшие две недели.' });
    if (date === today && minute <= now.getHours() * 60 + now.getMinutes() + 30) return send(res, 400, { error: 'Это время уже прошло — выберите другое.' });
    if (db.bookings.some((x) => x.date === date && x.minute === minute && x.status !== 'cancelled')) return send(res, 409, { error: 'Это время только что заняли. Выберите другое.' });

    const works = Array.isArray(b.works) ? b.works.slice(0, 20).map((w) => clean(w, 80)).filter(Boolean) : [];
    const booking = {
      id: ++db.seq,
      status: 'new',
      date, minute,
      service: clean(b.service, 120) || 'Не указано',
      car: clean(b.car, 60),
      phone: '+' + (phone.length === 11 && phone[0] === '8' ? '7' + phone.slice(1) : phone),
      name: clean(b.name, 60),
      note: clean(b.note, 500),
      works,
      total: Math.max(0, Math.min(10_000_000, Math.round(Number(b.total) || 0))),
      createdAt: new Date().toISOString(),
      history: [{ status: 'new', at: new Date().toISOString() }],
    };
    db.bookings.push(booking); save();
    console.log(`[запись] №${booking.id} ${date} ${Math.floor(minute / 60)}:${String(minute % 60).padStart(2, '0')} ${booking.phone} — ${booking.service}`);
    return send(res, 201, publicView(booking));
  }

  let m = p.match(/^\/api\/bookings\/(\d{1,7})$/);
  if (m && req.method === 'GET') {
    const id = Number(m[1]); const last4 = digits(url.searchParams.get('phone')).slice(-4);
    if (last4.length < 4) return send(res, 400, { error: 'Введите последние 4 цифры телефона.' });
    if (id === 1000 && last4 === '0000') return send(res, 200, demoOrder());
    const b = db.bookings.find((x) => x.id === id);
    if (!b || digits(b.phone).slice(-4) !== last4) return send(res, 404, { error: 'Заказ не найден. Проверьте номер и телефон.' });
    return send(res, 200, publicView(b));
  }

  if (p.startsWith('/api/admin/')) {
    if (req.headers['x-admin-token'] !== ADMIN_TOKEN) return send(res, 401, { error: 'Неверный пароль' });
    if (p === '/api/admin/bookings' && req.method === 'GET') {
      return send(res, 200, { bookings: [...db.bookings].sort((a, b) => (a.date + String(a.minute).padStart(4, '0')).localeCompare(b.date + String(b.minute).padStart(4, '0'))) });
    }
    m = p.match(/^\/api\/admin\/bookings\/(\d{1,7})$/);
    if (m && req.method === 'PATCH') {
      const b = db.bookings.find((x) => x.id === Number(m[1]));
      if (!b) return send(res, 404, { error: 'Заказ не найден' });
      const body = await readBody(req);
      if (!STATUSES.includes(body.status)) return send(res, 400, { error: 'Неизвестный статус' });
      if (b.status !== body.status) { b.status = body.status; b.history.push({ status: body.status, at: new Date().toISOString() }); save(); }
      return send(res, 200, b);
    }
  }

  return send(res, 404, { error: 'Не найдено' });
}

// ---------- статика ----------
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.json': 'application/json' };
const PRIVATE = /^\/(data|server\.js|package\.json)(\/|$)|\/\./;

function serveStatic(req, res, url) {
  let p = decodeURIComponent(url.pathname);
  if (PRIVATE.test(p)) { res.writeHead(404); return res.end('Not found'); }
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, path.normalize(p));
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Страница не найдена'); }
    const ext = path.extname(file);
    res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': ext === '.webp' ? 'public, max-age=604800' : 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname.startsWith('/api/')) await api(req, res, url);
    else if (req.method === 'GET' || req.method === 'HEAD') serveStatic(req, res, url);
    else send(res, 405, { error: 'Метод не поддерживается' });
  } catch (e) {
    if (!res.headersSent) send(res, e.code >= 400 && e.code < 500 ? e.code : 500, { error: e.code ? e.message : 'Ошибка сервера' });
    if (!e.code) console.error(e);
  }
}).listen(PORT, () => console.log(`ТехБокс: http://localhost:${PORT}  (админка: /admin.html, пароль: ${ADMIN_TOKEN === 'demo' ? 'demo' : 'из ADMIN_TOKEN'})`));
