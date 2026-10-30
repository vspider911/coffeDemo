const CATEGORIES = [
  { id: 'coffee', title: 'Кофе', photo: 'menu-coffee', alt: 'Эспрессо льётся из рожка кофемашины', caption: 'Эспрессо на зерне недели' },
  { id: 'other', title: 'Другие напитки', photo: 'menu-other', alt: 'Матчу просеивают через ситечко в чашку', caption: 'Матча, которую взбиваем венчиком' },
  { id: 'food', title: 'Выпечка', photo: 'menu-food', alt: 'Круассаны на противне сразу после духовки', caption: 'Круассаны из печи к восьми утра' },
  { id: 'beans', title: 'Зерно домой', photo: 'menu-beans', alt: 'Обжаренное зерно остывает в лотке ростера', caption: 'Обжарка по четвергам, партиями по 12 кг' },
];

const MENU = [
  { id: 1, pic: 'espresso', cat: 'coffee', name: 'Эспрессо', size: '30 мл', desc: 'Двойной шот на зерне недели.', price: 150 },
  { id: 2, pic: 'americano', cat: 'coffee', name: 'Американо', size: '250 мл', desc: 'Эспрессо, разбавленный горячей водой.', price: 180 },
  { id: 3, pic: 'cappuccino', cat: 'coffee', name: 'Капучино', size: '250 мл', desc: 'Эспрессо с бархатной молочной пеной.', price: 220 },
  { id: 4, pic: 'latte', cat: 'coffee', name: 'Латте', size: '350 мл', desc: 'Мягкий кофе с большим количеством молока.', price: 240 },
  { id: 5, pic: 'raf', cat: 'coffee', name: 'Раф', size: '350 мл', desc: 'Сливочный кофе с ванильным сахаром.', price: 280 },
  { id: 6, pic: 'iced-latte', cat: 'coffee', name: 'Айс-латте', size: '350 мл', desc: 'Холодный латте со льдом.', price: 260 },
  { id: 12, pic: 'v60', cat: 'coffee', name: 'Фильтр V60', size: '250 мл', desc: 'Ручная заварка в воронке, зерно на выбор.', price: 230 },
  { id: 7, pic: 'matcha', cat: 'other', name: 'Матча латте', size: '350 мл', desc: 'Японский чай матча на молоке.', price: 290 },
  { id: 8, pic: 'cocoa', cat: 'other', name: 'Какао', size: '250 мл', desc: 'Горячий шоколадный напиток.', price: 200 },
  { id: 13, pic: 'tea', cat: 'other', name: 'Чай в чайнике', size: '400 мл', desc: 'Чёрный, зелёный или травяной.', price: 220 },
  { id: 9, pic: 'croissant', cat: 'food', name: 'Круассан', size: '70 г', desc: 'Слоёный, со сливочным маслом.', allergens: 'глютен, молоко, яйца', price: 170 },
  { id: 10, pic: 'cheesecake', cat: 'food', name: 'Чизкейк', size: '120 г', desc: 'Нью-Йорк, нежный и плотный.', allergens: 'глютен, молоко, яйца', price: 320 },
  { id: 11, pic: 'cookie', cat: 'food', name: 'Печенье', size: '60 г', desc: 'Овсяное с шоколадной крошкой.', allergens: 'глютен, молоко, следы орехов', price: 120 },
  { id: 14, pic: 'beans-ethiopia', cat: 'beans', name: 'Эфиопия Иргачеффе', size: '250 г', desc: 'Бергамот, жасмин. Для эспрессо и фильтра.', price: 890 },
  { id: 15, pic: 'beans-colombia', cat: 'beans', name: 'Колумбия Уила', size: '250 г', desc: 'Красное яблоко, карамель. Универсальная обжарка.', price: 790 },
  { id: 16, pic: 'beans-brazil', cat: 'beans', name: 'Бразилия Серрадо', size: '250 г', desc: 'Орех, молочный шоколад. Хорош с молоком.', price: 690 },
];

// Рецепты для блока «Как заварить дома»
const RECIPES = {
  v60: {
    title: 'Воронка V60',
    params: [['Соотношение', '1 : 16'], ['Время', '3 мин'], ['Помол', 'Средне-мелкий, как морская соль'], ['Вода', '92–94 °C']],
    ingredients: [['Кофе, свежемолотый', '15 г'], ['Вода', '250 г'], ['Бумажный фильтр', '1 шт.']],
    steps: [
      'Промойте фильтр горячей водой, чтобы ушёл бумажный привкус, и слейте воду.',
      'Засыпьте кофе и встряхните воронку, чтобы слой лёг ровно.',
      'Налейте 40 г воды и подождите 40 секунд — кофе «расцветёт» и отдаст газ.',
      'К 1:00 доливайте тонкой струёй по спирали до 150 г.',
      'К 1:45 долейте до 250 г, держа струю в центре.',
      'Протекание закончится около 3:00. Если дольше 3:30, в следующий раз смелите крупнее.',
    ],
    bean: 'Подойдёт: Эфиопия Иргачеффе — светлая обжарка раскрывается в воронке лучше всего.',
  },
  french: {
    title: 'Френч-пресс',
    params: [['Соотношение', '1 : 15'], ['Время', '8 мин'], ['Помол', 'Крупный, как панировочные сухари'], ['Вода', '93–95 °C']],
    ingredients: [['Кофе, свежемолотый', '30 г'], ['Вода', '450 г']],
    steps: [
      'Засыпьте кофе, залейте всю воду сразу и запустите таймер.',
      'На 4:00 трижды аккуратно перемешайте «шапку».',
      'Снимите ложкой пену и всплывшие частицы.',
      'Поставьте поршень на поверхность, но не нажимайте. Подождите ещё 4 минуты — мелкие частицы осядут сами.',
      'Опустите поршень только до поверхности и сразу разлейте весь кофе.',
      'Не оставляйте кофе на гуще — он продолжит завариваться и станет горьким.',
    ],
    bean: 'Подойдёт: Колумбия Уила — карамель и яблоко, плотное тело.',
  },
  coldbrew: {
    title: 'Колд брю',
    params: [['Соотношение', '1 : 8, концентрат'], ['Время', '12–14 ч'], ['Помол', 'Очень крупный'], ['Подача', 'Со льдом, 1 : 1 с водой или молоком']],
    ingredients: [['Кофе, свежемолотый', '100 г'], ['Холодная фильтрованная вода', '800 г'], ['Щепотка соли', 'по желанию']],
    steps: [
      'Смелите кофе крупнее, чем для френч-пресса: мелкие частицы сделают напиток мутным.',
      'Смешайте кофе и холодную воду в большой банке и перемешайте один раз.',
      'Оставьте на 12–14 часов при комнатной температуре или на 18–20 в холодильнике.',
      'Процедите через сито, а затем ещё раз через бумажный фильтр. Гущу не отжимайте.',
      'Щепотка соли на литр убирает горечь и подчёркивает сладость.',
      'Разбавьте 1 : 1 водой или молоком и подавайте со льдом. В холодильнике хранится до 10 дней.',
    ],
    bean: 'Подойдёт: Бразилия Серрадо — орех и молочный шоколад, мягко и сладко.',
  },
  espresso: {
    title: 'Эспрессо',
    params: [['Соотношение', '1 : 2'], ['Время', '27–30 сек'], ['Помол', 'Мелкий'], ['Вода', '93 °C']],
    ingredients: [['Кофе, свежемолотый', '18 г'], ['Выход в чашке', '36–40 г']],
    steps: [
      'Прогрейте холдер и чашку.',
      'Насыпьте кофе, разбейте комочки иглой или распределителем.',
      'Разровняйте и темперуйте ровно, без перекоса.',
      'Запустите пролив и остановите на 36–40 г, это примерно 27–30 секунд.',
      'Пролилось за 20 секунд и кисло — смелите мельче. Дольше 35 секунд и горчит — крупнее.',
    ],
    bean: 'Подойдёт: зерно недели — Эфиопия Иргачеффе, или Колумбия Уила для напитков с молоком.',
  },
};

// 0 — воскресенье; [открытие, закрытие] в часах
const HOURS = [[8, 22], [7, 22], [7, 22], [7, 22], [7, 22], [7, 22], [8, 22]];

const $ = (sel) => document.querySelector(sel);
const formatPrice = (n) => `${n.toLocaleString('ru-RU')} ₽`;
const pad = (n) => String(n).padStart(2, '0');

const menuPhoto = (cat) => `
  <figure class="menu__photo">
    <img src="img/sections/${cat.photo}.webp" width="900" height="1125" alt="${cat.alt}">
    <figcaption>${cat.caption}</figcaption>
  </figure>`;

// «Всё»: слева кофе и фото под ним, справа остальные разделы.
// Один раздел: список слева, фото этого раздела справа.
function renderMenu(filter = 'all') {
  const list = $('#menuList');
  list.classList.toggle('is-single', filter !== 'all');
  if (filter === 'all') {
    const [first, ...rest] = CATEGORIES;
    list.innerHTML = `
      <div class="menu__col">${renderGroups([first])}${menuPhoto(first)}</div>
      <div class="menu__col">${renderGroups(rest)}</div>`;
  } else {
    const cat = CATEGORIES.find((c) => c.id === filter);
    list.innerHTML = `<div class="menu__col">${renderGroups([cat])}</div>${menuPhoto(cat)}`;
  }
}

function renderGroups(cats) {
  return cats.map((cat) => `
    <section class="menu__group">
      <h3 class="menu__cat"><span class="menu__num">0${CATEGORIES.indexOf(cat) + 1}</span>${cat.title}</h3>
      <ul class="menu__list">
        ${MENU.filter((i) => i.cat === cat.id).map((item) => `
          <li class="item">
            <img class="item__pic" src="img/menu/${item.pic}.webp" width="80" height="80" alt="">
            <div class="item__body">
              <div class="item__line">
                <span class="item__name">${item.name}</span>
                <span class="item__dots"></span>
                <span class="item__price">${formatPrice(item.price)}</span>
              </div>
              <p class="item__desc"><span class="item__size">${item.size}</span> · ${item.desc}</p>
              ${item.allergens ? `<p class="item__allergens">Содержит: ${item.allergens}</p>` : ''}
            </div>
          </li>
        `).join('')}
      </ul>
    </section>
  `).join('');
}

function getOpenState(now = new Date()) {
  const day = now.getDay();
  const [open, close] = HOURS[day];
  const hour = now.getHours() + now.getMinutes() / 60;
  const isOpen = hour >= open && hour < close;
  let text;
  if (isOpen) {
    const minutesLeft = Math.round((close - hour) * 60);
    text = minutesLeft <= 60
      ? `Открыто до ${close}:00, закроемся через ${minutesLeft} мин`
      : `Открыто до ${close}:00`;
  } else if (hour < open) {
    text = `Закрыто, откроемся в ${open}:00`;
  } else {
    text = `Закрыто, откроемся завтра в ${HOURS[(day + 1) % 7][0]}:00`;
  }
  return { isOpen, text };
}

function renderOpenStatus() {
  const { isOpen, text } = getOpenState();
  document.querySelectorAll('[data-open-status]').forEach((el) => {
    el.textContent = text;
    el.classList.toggle('is-open', isOpen);
  });
}

/* Мобильная навигация */
function toggleNav(open) {
  $('#nav').classList.toggle('is-open', open);
  $('#navToggle').setAttribute('aria-expanded', String(open));
  $('#navToggle').setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
}

$('#navToggle').addEventListener('click', () => toggleNav(!$('#nav').classList.contains('is-open')));
$('#nav').addEventListener('click', (e) => { if (e.target.closest('a')) toggleNav(false); });
document.addEventListener('click', (e) => {
  if (!e.target.closest('.header')) toggleNav(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && $('#nav').classList.contains('is-open')) {
    toggleNav(false);
    $('#navToggle').focus();
  }
});

/* Подсветка текущего раздела в навигации */
const navLinks = [...document.querySelectorAll('.nav a')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => {
        const current = a.getAttribute('href') === `#${entry.target.id}`;
        a.classList.toggle('is-current', current);
        if (current) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((a) => {
    const section = document.querySelector(a.getAttribute('href'));
    if (section) observer.observe(section);
  });
}

$('#filters').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-filter]');
  if (!btn) return;
  document.querySelectorAll('.filter').forEach((b) => {
    b.classList.toggle('is-active', b === btn);
    b.setAttribute('aria-pressed', String(b === btn));
  });
  renderMenu(btn.dataset.filter);
});

/* Первый экран: стакан стоит в центре, а текст уезжает мимо него, как на референсе */
const hero = $('#hero');
const heroStage = $('#heroStage');
const heroFinale = $('#heroFinale');
const heroGlass = $('#heroGlass');
const heroPile = $('#heroPile');
// анимация везде, кроме системной настройки «уменьшить движение» и слишком низких экранов (телефон лёжа)
const heroAnimQuery = window.matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 540px)');
const clamp01 = (n) => Math.min(1, Math.max(0, n));
let heroTicking = false;

function updateHero() {
  heroTicking = false;
  if (!hero.classList.contains('hero--anim')) return;
  const scrollable = hero.offsetHeight - heroStage.offsetHeight;
  const p = clamp01(-hero.getBoundingClientRect().top / scrollable);
  const pf = clamp01((p - 0.45) / 0.35);
  const pp = clamp01(p / 0.3);          // горстка выезжает снизу
  const pl = clamp01(p / 0.36);         // стакан приподнимается перед падением
  const H = heroStage.clientHeight;
  hero.style.setProperty('--p', p.toFixed(4));
  hero.style.setProperty('--pf', pf.toFixed(4));
  hero.style.setProperty('--pp', pp.toFixed(4));
  hero.style.setProperty('--pl', pl.toFixed(4));
  hero.style.setProperty('--lift', `${(-0.12 * H * pl).toFixed(1)}px`);
  hero.style.setProperty('--lift-drop', `${(-0.12 * H).toFixed(1)}px`);
  // куда приземлится стакан: донышко уходит на 72 % высоты горстки
  const glassStart = parseFloat(getComputedStyle(heroGlass).top);
  const land = heroPile.offsetTop + heroPile.offsetHeight * 0.72 - heroGlass.offsetHeight / 2 - glassStart;
  hero.style.setProperty('--land', `${land.toFixed(1)}px`);
  heroFinale.classList.toggle('is-hidden', pf < 0.02);

  // падение запускается по порогу и идёт по времени; запас между порогами, чтобы не дёргалось на границе
  const dropped = hero.classList.contains('is-dropped');
  if (!dropped && p >= 0.4) {
    hero.classList.remove('is-rising');
    hero.classList.add('is-dropped');
  } else if (dropped && p < 0.32) {
    hero.classList.remove('is-dropped');
    hero.classList.add('is-rising');
  }
}

heroGlass.addEventListener('animationend', (e) => {
  if (e.animationName === 'glass-rise') hero.classList.remove('is-rising');
});

function requestHeroUpdate() {
  if (heroTicking) return;
  heroTicking = true;
  requestAnimationFrame(updateHero);
}

function setupHeroAnim() {
  const on = heroAnimQuery.matches;
  hero.classList.toggle('hero--anim', on);
  if (!on) {
    ['--p', '--pf', '--pp', '--pl', '--lift', '--lift-drop', '--land'].forEach((v) => hero.style.removeProperty(v));
    hero.classList.remove('is-dropped', 'is-rising');
    heroFinale.classList.remove('is-hidden');
  }
  updateHero();
}

window.addEventListener('scroll', requestHeroUpdate, { passive: true });
window.addEventListener('resize', requestHeroUpdate);
if (heroAnimQuery.addEventListener) heroAnimQuery.addEventListener('change', setupHeroAnim);
setupHeroAnim();

/* Рецепт в модальном окне */
const recipe = $('#recipe');

function openRecipe(id) {
  const r = RECIPES[id];
  if (!r) return;
  $('#recipeTitle').textContent = r.title;
  $('#recipeParams').innerHTML = r.params.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  $('#recipeIngredients').innerHTML = r.ingredients.map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`).join('');
  $('#recipeSteps').innerHTML = r.steps.map((step) => `<li>${step}</li>`).join('');
  $('#recipeBean').textContent = r.bean;
  if (typeof recipe.showModal === 'function') recipe.showModal();
  else recipe.setAttribute('open', '');
  document.body.style.overflow = 'hidden';
}

function closeRecipe() {
  if (typeof recipe.close === 'function') recipe.close();
  else recipe.removeAttribute('open');
}

document.querySelectorAll('[data-recipe]').forEach((btn) => {
  btn.addEventListener('click', () => openRecipe(btn.dataset.recipe));
});
$('#recipeClose').addEventListener('click', closeRecipe);
recipe.addEventListener('close', () => { document.body.style.overflow = ''; });
// клик по затемнению вокруг окна закрывает его
recipe.addEventListener('click', (e) => { if (e.target === recipe) closeRecipe(); });

/* Номер партии прокручивается, как счётчик */
function initOdometer(el) {
  const value = el.dataset.odometer;
  el.innerHTML = [...value].map(() =>
    `<span class="odometer__digit">${'0123456789'.split('').map((d) => `<span>${d}</span>`).join('')}</span>`
  ).join('');
  const digits = [...el.children];
  const spin = () => digits.forEach((col, i) => {
    col.style.transform = `translateY(-${Number(value[i]) * 20}px)`;
  });
  if (!('IntersectionObserver' in window)) { spin(); return; }
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { spin(); io.disconnect(); }
  }, { threshold: 0.6 });
  io.observe(el);
}
document.querySelectorAll('[data-odometer]').forEach(initOdometer);

/* Нижняя плашка: появляется после первого экрана, прячется у формы бронирования */
if ('IntersectionObserver' in window) {
  const hidden = new Set(['hero']);
  const dockIo = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const key = entry.target.id;
      if (entry.isIntersecting) hidden.add(key);
      else hidden.delete(key);
    });
    $('#dock').classList.toggle('is-visible', hidden.size === 0);
  });
  dockIo.observe($('.hero'));
  dockIo.observe($('#contacts'));
}

/* Подписка на новости обжарки (демо) */
$('#subscribeForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('#subscribeEmail');
  const msg = $('#subscribeMsg');
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
  msg.classList.toggle('is-error', !ok);
  if (!ok) {
    input.setAttribute('aria-invalid', 'true');
    msg.textContent = 'Проверьте адрес почты — например, name@mail.ru';
    input.focus();
    return;
  }
  input.removeAttribute('aria-invalid');
  msg.textContent = 'Готово! Это демо-сайт, письма приходить не будут.';
  e.target.reset();
});

/* Бронирование: не в прошлом и в часы работы */
const form = $('#contactForm');
const timeInput = form.elements.time;
const toLocalInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

// min — начало сегодняшнего дня: от него браузер отсчитывает шаг в 15 минут,
// а прошедшее время сегодня отсекает validateBooking
function updateMinTime() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  timeInput.min = toLocalInput(today);
}

function validateBooking(data) {
  const digits = String(data.get('phone')).replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 11) return ['phone', 'Проверьте номер телефона — в нём должно быть 10–11 цифр.'];
  const date = new Date(data.get('time'));
  if (Number.isNaN(date.getTime())) return ['time', 'Укажите дату и время.'];
  if (date < new Date()) return ['time', 'Это время уже прошло — выберите другое.'];
  const [open, close] = HOURS[date.getDay()];
  const hour = date.getHours() + date.getMinutes() / 60;
  if (hour < open || hour > close - 1) {
    return ['time', `В этот день бронируем с ${open}:00 до ${close - 1}:00.`];
  }
  return null;
}

form.addEventListener('input', (e) => e.target.removeAttribute('aria-invalid'));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const msg = $('#formMsg');
  const error = validateBooking(data);
  if (error) {
    const [field, text] = error;
    form.elements[field].setAttribute('aria-invalid', 'true');
    form.elements[field].focus();
    msg.textContent = text;
    msg.classList.add('is-error');
    return;
  }
  const when = new Date(data.get('time')).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  msg.classList.remove('is-error');
  msg.textContent = `${String(data.get('name')).trim()}, спасибо! Столик на ${data.get('guests')} — ${when}. Это демо-версия, заявка никуда не отправлена.`;
  form.reset();
  updateMinTime();
});

renderMenu();
// фото разделов меню появляются только по фильтру — скачиваем их заранее, чтобы переключение было мгновенным
CATEGORIES.forEach((cat) => { new Image().src = `img/sections/${cat.photo}.webp`; });
renderOpenStatus();
updateMinTime();
setInterval(() => { renderOpenStatus(); updateMinTime(); }, 60 * 1000);
