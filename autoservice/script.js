(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = (n) => Math.round(n).toLocaleString('ru-RU') + ' ₽';
  const pad = (n) => String(n).padStart(2, '0');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const digits = (v) => String(v || '').replace(/\D/g, '');
  const API = window.TB_API;

  // ---------- Настройки: config.js + параметры ссылки ----------
  const params = new URLSearchParams(location.search);
  const S = { ...window.SITE_DEFAULTS };
  for (const k of Object.keys(S)) if (params.has(k) && params.get(k).trim()) S[k] = params.get(k).trim().slice(0, 200);
  S.open = Math.min(23, Math.max(0, parseInt(S.open, 10) || 9));
  S.close = Math.min(24, Math.max(S.open + 1, parseInt(S.close, 10) || 21));
  const ru7 = (d) => (d.length === 11 && d[0] === '8' ? '7' + d.slice(1) : d);
  const telDigits = ru7(digits(S.phone));
  const waDigits = ru7(digits(S.wa));
  const tg = String(S.tg || '').replace(/^@|^https?:\/\/t\.me\//, '');

  // Цвет акцента и контрастный текст на нём
  const hex = /^[0-9a-f]{6}$/i.test(S.color) ? S.color : 'ff5a1f';
  const rgb = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty('--accent', `#${hex}`);
  rootStyle.setProperty('--accent-rgb', rgb.join(','));
  rootStyle.setProperty('--on-accent', lum > 0.6 ? '#111315' : '#ffffff');

  const hoursShort = `${S.open}–${S.close}`;
  const prettyPhone = telDigits.length === 11 && telDigits[0] === '7'
    ? `+7 (${telDigits.slice(1, 4)}) ${telDigits.slice(4, 7)}-${telDigits.slice(7, 9)}-${telDigits.slice(9)}` : S.phone;
  const plural = (n, a, b, c) => { n = Math.abs(n) % 100; const n1 = n % 10; return n > 10 && n < 20 ? c : n1 > 1 && n1 < 5 ? b : n1 === 1 ? a : c; };
  const years = S.since && +S.since > 1950 ? new Date().getFullYear() - +S.since : 0;
  const boxes = parseInt(S.boxes, 10) || 0;
  const T = {
    name: S.name, city: S.city, address: S.address, metro: S.metro, phone: prettyPhone, rating: S.rating, hoursShort,
    hoursText: `${S.days} ${hoursShort}`,
    hoursFull: `${S.days} ${S.open}:00–${S.close % 24 || 24}:00`,
    daysText: /ежедн/i.test(S.days) ? 'ежедневно, без выходных' : S.days,
    ratingText: S.votes ? `${S.votes} ${plural(+digits(S.votes), 'оценка', 'оценки', 'оценок')} на Яндекс Картах` : 'средняя оценка клиентов',
    votesText: S.votes ? `из ${S.votes} ${plural(+digits(S.votes), 'оценки', 'оценок', 'оценок')} на Яндекс Картах` : 'по отзывам клиентов',
    years: years > 0 ? `${years} ${plural(years, 'год', 'года', 'лет')}` : 'Опыт',
    boxesText: boxes ? `${boxes} ${plural(boxes, 'пост', 'поста', 'постов')}, свой склад запчастей` : 'свой склад запчастей',
  };
  $$('[data-t]').forEach((el) => { const v = T[el.dataset.t]; if (v != null) el.textContent = v; });
  document.title = `${S.name}${/автосервис|сто\b|техцентр/i.test(S.name) ? '' : ' — автосервис'}${S.city ? ' в ' + (S.city === 'Москва' ? 'Москве' : S.city) : ''}`;
  if (!S.metro) $$('[data-metro-row]').forEach((el) => el.remove());

  $$('[data-tel]').forEach((a) => (a.href = 'tel:+' + telDigits));
  const waBase = waDigits ? `https://wa.me/${waDigits}` : '';
  $$('[data-wa]').forEach((a) => (waBase ? (a.href = waBase) : a.remove()));
  $$('[data-tg]').forEach((a) => (tg ? (a.href = 'https://t.me/' + encodeURIComponent(tg)) : a.remove()));
  if (!waBase && !tg) $$('[data-wa-row]').forEach((el) => el.remove());
  $$('[data-map]').forEach((a) => (a.href = /^https?:\/\//.test(S.map) ? S.map : 'https://yandex.ru/maps/?text=' + encodeURIComponent(`${S.name} ${S.city} ${S.address}`)));

  const brands = S.brands.split(',').map((b) => b.trim()).filter(Boolean);
  const brandItems = brands.map((b) => `<li>${esc(b)}</li>`).join('');
  $('#brands').innerHTML = brandItems + brandItems.replace(/<li>/g, '<li aria-hidden="true">');

  // ---------- Уведомление ----------
  const toastEl = $('#toast'); let toastT;
  const toast = (text) => { toastEl.textContent = text; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2600); };

  // ---------- Прайс и калькулятор ----------
  const GROUPS = window.SITE_PRICES || [];
  const CLASSES = window.SITE_CAR_CLASSES || [{ id: 'car', title: 'Легковой', k: 1 }];
  let klass = CLASSES[0];
  const priceFor = (base) => (base ? Math.round((base * klass.k) / 50) * 50 : 0);
  const fromPrice = (g) => Math.min(...g.items.map((i) => i[2]).filter(Boolean));
  const ALL = GROUPS.flatMap((g) => g.items.map(([name, note, price, hours]) => ({ name, note, price, hours: hours || 0, group: g.id })));

  $$('[data-from]').forEach((el) => {
    const g = GROUPS.find((x) => x.id === el.dataset.from);
    el.textContent = g && isFinite(fromPrice(g)) ? 'от ' + money(fromPrice(g)) : 'по запросу';
  });

  const carClass = $('#carClass');
  carClass.innerHTML = '<span class="carclass__label">Класс авто:</span>' + CLASSES.map((c, i) =>
    `<button type="button" role="radio" class="carclass__btn" data-id="${c.id}" aria-checked="${i === 0}">${esc(c.title)}${c.k !== 1 ? ` <small>×${String(c.k).replace('.', ',')}</small>` : ''}</button>`).join('');

  const tabs = $('#tabs'), calc = $('#calc');
  tabs.innerHTML = GROUPS.map((g) => `<button class="tab" type="button" role="tab" data-cat="${g.id}">${esc(g.title)}<i data-count="${g.id}"></i></button>`).join('');
  calc.innerHTML = GROUPS.map((g) => `<div class="calc__group" role="tabpanel" data-group="${g.id}">${g.items.map(([name, note, price, hours]) => {
    const id = 'w' + ALL.findIndex((w) => w.name === name);
    return `<label class="calc__row" for="${id}"><input type="checkbox" id="${id}" data-name="${esc(name)}" data-base="${price || 0}" data-hours="${hours || 0}">
      <span class="calc__box" aria-hidden="true"></span>
      <span class="calc__name">${esc(name)}${note ? `<small>${esc(note)}</small>` : ''}</span>
      <span class="calc__time">${hours ? (hours < 1 ? Math.round(hours * 60) + ' мин' : String(hours).replace('.', ',') + ' ч') : ''}</span>
      <span class="calc__price" data-price>—</span></label>`;
  }).join('')}</div>`).join('');

  const showCat = (id) => {
    $$('.tab', tabs).forEach((t) => t.setAttribute('aria-selected', t.dataset.cat === id));
    $$('.calc__group', calc).forEach((g) => (g.hidden = g.dataset.group !== id));
  };
  tabs.addEventListener('click', (e) => { const t = e.target.closest('.tab'); if (t) showCat(t.dataset.cat); });
  $$('.svc[data-cat]').forEach((a) => a.addEventListener('click', () => showCat(a.dataset.cat)));
  showCat(GROUPS[0]?.id);

  const picked = () => $$('input:checked', calc);
  const fmtHours = (h) => { const m = Math.round(h * 60); return m < 60 ? `≈ ${m} мин` : `≈ ${String(Math.round(h * 2) / 2).replace('.', ',')} ч`; };
  const calcState = () => {
    const p = picked();
    return { items: p.map((i) => ({ name: i.dataset.name, price: priceFor(+i.dataset.base), hours: +i.dataset.hours })), byRequest: p.some((i) => !+i.dataset.base) };
  };
  const update = (bump = true) => {
    $$('.calc__row', calc).forEach((row) => { const i = $('input', row); $('[data-price]', row).textContent = +i.dataset.base ? 'от ' + money(priceFor(+i.dataset.base)) : 'по запросу'; });
    const { items, byRequest } = calcState();
    const total = items.reduce((s, i) => s + i.price, 0);
    const hours = items.reduce((s, i) => s + i.hours, 0);
    $('#sumItems').innerHTML = items.length
      ? items.map((i) => `<li><span>${esc(i.name)}</span><span>${i.price ? money(i.price) : '—'}</span><button type="button" class="summary__rm" data-rm="${esc(i.name)}" aria-label="Убрать: ${esc(i.name)}">×</button></li>`).join('')
      : '<li class="summary__empty">Пока ничего не выбрано</li>';
    $('#sumTime').textContent = hours ? fmtHours(hours) : '—';
    $('#sumClear').hidden = !items.length;
    const st = $('#sumTotal');
    st.textContent = (byRequest && total ? 'от ' : '') + money(total);
    if (bump) { st.classList.remove('bump'); void st.offsetWidth; st.classList.add('bump'); }
    GROUPS.forEach((g) => { const n = $$(`.calc__group[data-group="${g.id}"] input:checked`, calc).length; const el = $(`[data-count="${g.id}"]`, tabs); el.textContent = n || ''; el.hidden = !n; });
  };
  calc.addEventListener('change', () => update());
  carClass.addEventListener('click', (e) => {
    const b = e.target.closest('.carclass__btn'); if (!b) return;
    klass = CLASSES.find((c) => c.id === b.dataset.id);
    $$('.carclass__btn', carClass).forEach((x) => x.setAttribute('aria-checked', x === b));
    update();
  });
  $('#sumItems').addEventListener('click', (e) => {
    const b = e.target.closest('[data-rm]'); if (!b) return;
    const i = $$('input', calc).find((x) => x.dataset.name === b.dataset.rm); if (i) i.checked = false; update();
  });
  $('#sumClear').addEventListener('click', () => { picked().forEach((i) => (i.checked = false)); update(); });
  const setWorks = (names, replace = false) => {
    $$('input', calc).forEach((i) => { if (names.includes(i.dataset.name)) i.checked = true; else if (replace) i.checked = false; });
    const first = ALL.find((w) => names.includes(w.name)); if (first) showCat(first.group);
    update();
  };
  calc.querySelector('input').checked = true;
  update(false);

  // ---------- Что беспокоит ----------
  const SYM = window.SITE_SYMPTOMS || [];
  const symBox = $('#symptoms'), symAns = $('#symptomAnswer');
  symBox.innerHTML = SYM.map((s, i) => `<button type="button" class="chip" role="tab" data-id="${s.id}" aria-selected="${i === 0}">${esc(s.title)}</button>`).join('');
  const renderSym = (id) => {
    const s = SYM.find((x) => x.id === id); if (!s) return;
    $$('.chip', symBox).forEach((c) => c.setAttribute('aria-selected', c.dataset.id === id));
    const works = s.works.map((n) => ALL.find((w) => w.name === n)).filter(Boolean);
    const sum = works.reduce((t, w) => t + priceFor(w.price), 0);
    const urgent = /не откладывать|ближайшие/i.test(s.urgency);
    symAns.innerHTML = `
      <div class="help__text">
        <span class="urgency${urgent ? ' urgency--hot' : ''}">${esc(s.urgency)}</span>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.text)}</p>
      </div>
      <div class="help__works">
        <p class="help__label">Что обычно делаем</p>
        <ul>${works.map((w) => `<li><span>${esc(w.name)}</span><b>${w.price ? 'от ' + money(priceFor(w.price)) : 'по запросу'}</b></li>`).join('')}</ul>
        <div class="help__sum"><span>Ориентир за работу</span><strong>${sum ? 'от ' + money(sum) : 'по запросу'}</strong></div>
        <div class="help__actions">
          <button type="button" class="btn btn--sm" data-sym-book="${s.id}">Записаться</button>
          <button type="button" class="btn btn--sm btn--ghost" data-sym-calc="${s.id}">Открыть в калькуляторе</button>
        </div>
      </div>`;
  };
  symBox.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) renderSym(c.dataset.id); });
  symAns.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sym-book],[data-sym-calc]'); if (!b) return;
    const s = SYM.find((x) => x.id === (b.dataset.symBook || b.dataset.symCalc));
    setWorks(s.works, true);
    if (b.dataset.symBook) { fillBookingFromCalc(); $('#fNote').value = s.title; $('#booking').scrollIntoView({ behavior: 'smooth' }); }
    else { $('#prices').scrollIntoView({ behavior: 'smooth' }); toast('Работы добавлены в расчёт'); }
  });
  if (SYM[0]) renderSym(SYM[0].id);

  // ---------- Онлайн-запись ----------
  const sel = $('#fService');
  const baseOptions = GROUPS.map((g) => `<optgroup label="${esc(g.title)}">${g.items.map(([name, , price]) => `<option value="${esc(name)}">${esc(name)}${price ? ' — от ' + money(price) : ''}</option>`).join('')}</optgroup>`).join('') + '<option value="Другое">Другое — опишу ниже</option>';
  sel.innerHTML = baseOptions;
  let bookingWorks = null; // работы из калькулятора, привязанные к записи
  const fillBookingFromCalc = () => {
    const { items, byRequest } = calcState();
    if (!items.length) { bookingWorks = null; sel.innerHTML = baseOptions; return; }
    const total = items.reduce((s, i) => s + i.price, 0);
    bookingWorks = { items, total };
    const label = items.length === 1 ? items[0].name : `По расчёту: ${items.length} ${plural(items.length, 'работа', 'работы', 'работ')}`;
    sel.innerHTML = `<option value="calc">${esc(label)} — ${total ? 'от ' + money(total) : 'по запросу'}${byRequest && total ? ' + по запросу' : ''}</option>` + baseOptions;
    sel.value = 'calc';
  };
  $('#sumBook').addEventListener('click', fillBookingFromCalc);
  sel.addEventListener('change', () => { if (sel.value !== 'calc') bookingWorks = null; });

  // Псевдослучайная, но стабильная занятость, чтобы расписание выглядело живым.
  let seed = 0; for (const ch of S.name) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const pseudoBusy = (date, min) => {
    let x = (seed ^ (date.getDate() * 7919 + date.getMonth() * 104729 + min * 31)) >>> 0;
    x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0;
    return x % 100 < 35;
  };
  const DOW = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const now = API.mskNow();
  const days = [...Array(7)].map((_, i) => { const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d; });
  const realBusy = {}; // дата → минуты, занятые настоящими записями
  let dayIdx = 0, slot = null;
  const dayLabel = (i) => (i === 0 ? 'сегодня' : i === 1 ? 'завтра' : DOW[days[i].getDay()]);
  const fmtM = (m) => `${Math.floor(m / 60)}:${pad(m % 60)}`;
  const slotsFor = (i) => {
    const d = days[i], key = API.ymd(d), out = [];
    const nowM = now.getHours() * 60 + now.getMinutes();
    for (let m = S.open * 60; m <= (S.close - 1) * 60; m += 30) {
      const past = i === 0 && m <= nowM + 30;
      out.push({ m, off: past || pseudoBusy(d, m) || (realBusy[key] || []).includes(m) });
    }
    return out;
  };
  if (!slotsFor(0).some((s) => !s.off)) dayIdx = 1;

  const renderDays = () => {
    $('#days').innerHTML = days.map((d, i) => {
      const free = slotsFor(i).filter((s) => !s.off).length;
      return `<button type="button" class="day" aria-pressed="${i === dayIdx}" data-i="${i}" ${free ? '' : 'disabled'}><span>${dayLabel(i)}</span><b>${d.getDate()}</b><small>${free ? free + ' своб.' : 'нет мест'}</small></button>`;
    }).join('');
  };
  const renderSlots = () => {
    $('#slots').innerHTML = slotsFor(dayIdx).map((s) => `<button type="button" class="slot" data-m="${s.m}" ${s.off ? 'disabled aria-label="' + fmtM(s.m) + ' занято"' : ''} aria-pressed="${!!slot && slot.i === dayIdx && slot.m === s.m}">${fmtM(s.m)}</button>`).join('');
  };
  const whenText = () => slot ? `${dayLabel(slot.i)[0].toUpperCase() + dayLabel(slot.i).slice(1)}, ${days[slot.i].getDate()} ${MON[days[slot.i].getMonth()]}, ${fmtM(slot.m)}` : '';
  const renderPicked = () => { $('#picked').textContent = slot ? whenText() : 'Выберите время слева'; $('#picked').classList.toggle('is-set', !!slot); };
  const loadBusy = async (i) => {
    const key = API.ymd(days[i]);
    try { realBusy[key] = await API.busy(key); } catch { /* показываем без реальной занятости */ }
  };
  $('#days').addEventListener('click', async (e) => {
    const b = e.target.closest('.day'); if (!b || b.disabled) return;
    dayIdx = +b.dataset.i; renderDays(); renderSlots();
    await loadBusy(dayIdx); renderSlots();
  });
  $('#slots').addEventListener('click', (e) => {
    const b = e.target.closest('.slot'); if (!b || b.disabled) return;
    slot = { i: dayIdx, m: +b.dataset.m }; renderSlots(); renderPicked();
    if (innerWidth < 1025) $('#form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  renderDays(); renderSlots(); renderPicked();
  Promise.all(days.map((_, i) => loadBusy(i))).then(() => { renderDays(); renderSlots(); });

  // Маска телефона
  const fPhone = $('#fPhone');
  fPhone.addEventListener('input', () => {
    let d = digits(fPhone.value);
    if (!d) { fPhone.value = ''; return; }
    if (d[0] === '8') d = '7' + d.slice(1); else if (d[0] !== '7') d = '7' + d;
    d = d.slice(0, 11);
    let out = '+7';
    if (d.length > 1) out += ' (' + d.slice(1, 4);
    if (d.length >= 4) out += ')';
    if (d.length > 4) out += ' ' + d.slice(4, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    if (d.length > 9) out += '-' + d.slice(9, 11);
    fPhone.value = out;
  });

  const ok = $('#formOk');
  const formMsg = (html, err) => { ok.hidden = false; ok.className = 'form__ok' + (err ? ' is-err' : ''); ok.innerHTML = html; };
  $('#form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = fPhone.value.trim();
    if (!slot) { formMsg('Выберите день и время слева.', true); $('#slots').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (digits(phone).length < 11) { formMsg('Укажите телефон — мастер перезвонит для подтверждения.', true); fPhone.focus(); return; }
    if (!$('#fAgree').checked) { formMsg('Нужно согласие на обработку данных.', true); return; }
    const service = sel.value === 'calc' && bookingWorks ? sel.options[sel.selectedIndex].text : sel.value;
    const data = {
      date: API.ymd(days[slot.i]), minute: slot.m, service, phone,
      name: $('#fName').value.trim(), car: $('#fCar').value.trim(), note: $('#fNote').value.trim(),
      works: bookingWorks ? bookingWorks.items.map((i) => i.name) : [], total: bookingWorks ? bookingWorks.total : 0,
    };
    const btn = $('#fSubmit'); btn.disabled = true; btn.textContent = 'Отправляем…';
    try {
      const b = await API.create(data);
      const when = whenText();
      const key = data.date; realBusy[key] = [...(realBusy[key] || []), data.minute];
      slot = null; renderDays(); renderSlots(); renderPicked();
      formMsg(`<b>Заявка № ${b.id} принята</b> на ${esc(when.toLowerCase())}. Мастер перезвонит на ${esc(phone)} для подтверждения.
        <span class="form__ok-actions"><button type="button" class="linkbtn" data-track="${b.id}" data-phone="${digits(phone).slice(-4)}">Следить за статусом →</button></span>`);
      if (waBase) {
        const text = `Здравствуйте! Хочу записаться в ${S.name}.\nЗаявка № ${b.id}\nКогда: ${when}\nУслуга: ${service}${data.works.length > 1 ? '\nРаботы: ' + data.works.join(', ') : ''}\nМашина: ${data.car || '—'}\nТелефон: ${phone}${data.note ? '\nКомментарий: ' + data.note : ''}`;
        ok.insertAdjacentHTML('beforeend', `<a class="btn btn--sm btn--wa" href="${waBase}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">Продублировать в WhatsApp</a>`);
      }
    } catch (err) {
      formMsg(esc(err.message || 'Не удалось отправить. Позвоните нам.'), true);
      await loadBusy(slot.i); renderDays(); renderSlots();
    } finally { btn.disabled = false; btn.textContent = 'Записаться'; }
  });
  ok.addEventListener('click', (e) => {
    const b = e.target.closest('[data-track]'); if (!b) return;
    $('#tId').value = b.dataset.track; $('#tPhone').value = b.dataset.phone;
    $('#track').scrollIntoView({ behavior: 'smooth' }); runTrack();
  });

  // ---------- Статус ремонта ----------
  const STEPS = ['new', 'confirmed', 'in_work', 'ready', 'done'];
  const trackRes = $('#trackResult');
  const fmtDT = (iso) => { const d = new Date(iso); return d.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' }); };
  const renderTrack = (b) => {
    const cancelled = b.status === 'cancelled';
    const cur = STEPS.indexOf(b.status);
    const at = (st) => (b.history || []).filter((h) => h.status === st).pop()?.at;
    const d = new Date(b.date + 'T00:00:00');
    trackRes.innerHTML = `
      <div class="order">
        <div class="order__head">
          <div><span class="order__id">Заказ № ${b.id}</span><h3>${esc(API.STATUS[b.status] || b.status)}</h3></div>
          <span class="order__badge order__badge--${b.status}">${cancelled ? 'отменён' : STEPS.indexOf(b.status) + 1 + ' из ' + STEPS.length}</span>
        </div>
        <dl class="order__meta">
          <div><dt>Запись</dt><dd>${d.getDate()} ${MON[d.getMonth()]}, ${fmtM(b.minute)}</dd></div>
          ${b.car ? `<div><dt>Автомобиль</dt><dd>${esc(b.car)}</dd></div>` : ''}
          <div><dt>Работы</dt><dd>${esc(b.works && b.works.length ? b.works.join(', ') : b.service)}</dd></div>
          ${b.total ? `<div><dt>Предварительно</dt><dd>от ${money(b.total)}</dd></div>` : ''}
        </dl>
        ${cancelled ? '<p class="order__cancel">Запись отменена. Если это ошибка — позвоните нам.</p>' : `
        <ol class="timeline">${STEPS.map((st, i) => `<li class="${i < cur ? 'is-done' : i === cur ? 'is-cur' : ''}"><b>${esc(API.STATUS[st])}</b>${at(st) ? `<span>${fmtDT(at(st))}</span>` : ''}</li>`).join('')}</ol>`}
      </div>`;
  };
  const runTrack = async () => {
    const id = digits($('#tId').value), ph = digits($('#tPhone').value);
    if (!id) { trackRes.innerHTML = '<p class="track__err">Введите номер заказа.</p>'; return; }
    if (ph.length !== 4) { trackRes.innerHTML = '<p class="track__err">Введите последние 4 цифры телефона.</p>'; return; }
    trackRes.innerHTML = '<p class="track__wait">Ищем заказ…</p>';
    try { renderTrack(await API.track(id, ph)); } catch (err) { trackRes.innerHTML = `<p class="track__err">${esc(err.message)}</p>`; }
  };
  $('#trackForm').addEventListener('submit', (e) => { e.preventDefault(); runTrack(); });
  $('#trackDemo').addEventListener('click', () => { $('#tId').value = '1000'; $('#tPhone').value = '0000'; runTrack(); });

  // ---------- Открыто / закрыто ----------
  const setStatus = () => {
    const t = API.mskNow(); const h = t.getHours() + t.getMinutes() / 60;
    const open = h >= S.open && h < S.close;
    const left = S.close - h;
    const text = open ? (left <= 1 ? `Открыто · ещё ${Math.max(1, Math.round(left * 60))} мин` : `Открыто до ${S.close % 24 || 24}:00`)
      : (h < S.open ? `Закрыто · откроемся в ${S.open}:00` : `Закрыто · завтра с ${S.open}:00`);
    $$('[data-status]').forEach((el) => { el.classList.toggle('is-open', open); el.classList.toggle('is-closed', !open); $('b', el).textContent = text; });
    $$('[data-status-text]').forEach((el) => (el.textContent = open ? `до ${S.close % 24 || 24}:00` : `с ${S.open}:00`));
  };
  setStatus(); setInterval(setStatus, 60000);

  // ---------- Меню ----------
  const burger = $('#burger'), nav = $('#nav');
  const setMenu = (on) => { nav.classList.toggle('is-open', on); burger.setAttribute('aria-expanded', on); burger.setAttribute('aria-label', on ? 'Закрыть меню' : 'Открыть меню'); document.body.classList.toggle('menu-open', on); };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // Шапка с тенью при прокрутке и подсветка текущего раздела
  const header = $('.header');
  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if ('IntersectionObserver' in window) {
    const links = $$('.nav a[href^="#"]:not(.nav__cta)');
    const spy = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((a) => { const s = $(a.getAttribute('href')); if (s) spy.observe(s); });
  }

  // ---------- Появление при прокрутке ----------
  const els = $$('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const sibs = [...e.target.parentElement.children].filter((c) => c.classList.contains('reveal'));
      e.target.style.transitionDelay = (sibs.indexOf(e.target) % 4) * 70 + 'ms';
      e.target.classList.add('is-in'); io.unobserve(e.target);
    }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
  } else els.forEach((el) => el.classList.add('is-in'));
})();
