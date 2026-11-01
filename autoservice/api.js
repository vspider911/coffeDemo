/*
  Слой данных. Если сайт запущен через server.js — работает с API.
  Если сайт открыт как статика (GitHub Pages, Vercel, файл с диска) — хранит записи
  в localStorage браузера, чтобы запись, трекер ремонта и админка всё равно работали.
*/
(() => {
  const KEY = 'techbox_bookings_v1';
  const digits = (v) => String(v || '').replace(/\D/g, '');
  const mskNow = () => { const d = new Date(); return new Date(d.getTime() + (d.getTimezoneOffset() + 180) * 60000); };
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const json = async (url, opts = {}) => {
    const r = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(body.error || 'Ошибка сервера'), { status: r.status });
    return body;
  };

  const ready = (async () => {
    if (location.protocol === 'file:') return 'local';
    try {
      const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 1500);
      const r = await fetch('api/health', { signal: ctrl.signal, cache: 'no-store' });
      clearTimeout(t);
      return r.ok && (await r.json()).ok ? 'server' : 'local';
    } catch { return 'local'; }
  })();

  // ---------- localStorage ----------
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || { seq: 1000, bookings: [] }; } catch { return { seq: 1000, bookings: [] }; } };
  const store = (db) => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* приватный режим */ } };

  const demoOrder = () => {
    const now = mskNow(); const at = (h) => new Date(Date.now() - h * 3600000).toISOString();
    return { id: 1000, status: 'in_work', date: ymd(now), minute: Math.max(9, Math.min(now.getHours() - 1, 20)) * 60, service: 'Замена передних колодок', car: 'Kia Rio', works: ['Замена передних колодок', 'Замена тормозной жидкости'], total: 3000,
      history: [{ status: 'new', at: at(26) }, { status: 'confirmed', at: at(25) }, { status: 'in_work', at: at(0.6) }] };
  };

  const local = {
    async busy(date) { return load().bookings.filter((b) => b.date === date && b.status !== 'cancelled').map((b) => b.minute); },
    async create(data) {
      const db = load();
      if (db.bookings.some((b) => b.date === data.date && b.minute === data.minute && b.status !== 'cancelled')) throw new Error('Это время уже занято. Выберите другое.');
      const now = new Date().toISOString();
      const b = { ...data, id: ++db.seq, status: 'new', createdAt: now, history: [{ status: 'new', at: now }] };
      db.bookings.push(b); store(db); return b;
    },
    async track(id, phone) {
      const last4 = digits(phone).slice(-4);
      if (+id === 1000 && last4 === '0000') return demoOrder();
      const b = load().bookings.find((x) => x.id === +id);
      if (!b || digits(b.phone).slice(-4) !== last4) throw new Error('Заказ не найден. Проверьте номер и телефон.');
      return b;
    },
    async list(token) { if (token !== 'demo') throw Object.assign(new Error('Неверный пароль'), { status: 401 }); return load().bookings.sort((a, b) => (a.date + String(a.minute).padStart(4, '0')).localeCompare(b.date + String(b.minute).padStart(4, '0'))); },
    async setStatus(token, id, status) {
      if (token !== 'demo') throw Object.assign(new Error('Неверный пароль'), { status: 401 });
      const db = load(); const b = db.bookings.find((x) => x.id === +id);
      if (!b) throw new Error('Заказ не найден');
      if (b.status !== status) { b.status = status; b.history.push({ status, at: new Date().toISOString() }); store(db); }
      return b;
    },
  };

  // ---------- сервер ----------
  const server = {
    async busy(date) { return (await json('api/slots?date=' + date)).busy; },
    async create(data) { return json('api/bookings', { method: 'POST', body: JSON.stringify(data) }); },
    async track(id, phone) { return json(`api/bookings/${encodeURIComponent(id)}?phone=${digits(phone).slice(-4)}`); },
    async list(token) { return (await json('api/admin/bookings', { headers: { 'X-Admin-Token': token } })).bookings; },
    async setStatus(token, id, status) { return json('api/admin/bookings/' + id, { method: 'PATCH', headers: { 'X-Admin-Token': token }, body: JSON.stringify({ status }) }); },
  };

  const pick = async () => ((await ready) === 'server' ? server : local);
  window.TB_API = {
    ready, ymd, mskNow,
    STATUS: {
      new: 'Заявка принята', confirmed: 'Запись подтверждена', in_work: 'Машина в работе',
      ready: 'Готово — можно забирать', done: 'Выдана клиенту', cancelled: 'Запись отменена',
    },
    busy: async (date) => (await pick()).busy(date),
    create: async (data) => (await pick()).create(data),
    track: async (id, phone) => (await pick()).track(id, phone),
    list: async (token) => (await pick()).list(token),
    setStatus: async (token, id, status) => (await pick()).setStatus(token, id, status),
  };
})();
