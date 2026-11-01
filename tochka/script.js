/* ТОЧКА — автосервис. Демоверсия. Без зависимостей. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function reducedMotion() { return reduceMotionQuery.matches; }

  var rub = new Intl.NumberFormat('ru-RU');
  function formatRub(value) { return rub.format(value).replace(/\s/g, ' ') + ' ₽'; }

  function plural(n, one, few, many) {
    var mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  }

  /* ------------------------------------------------------------------
     Шапка: высота, состояние при прокрутке
     ------------------------------------------------------------------ */
  var header = document.getElementById('header');

  function headerHeight() { return header ? header.offsetHeight : 0; }

  function syncHeaderHeight() {
    root.style.setProperty('--header-h', headerHeight() + 'px');
  }

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 4);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', syncHeaderHeight);
  onScroll();

  /* ------------------------------------------------------------------
     Мобильное меню
     ------------------------------------------------------------------ */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  var mobileQuery = window.matchMedia('(max-width: 859px)');

  function isMenuOpen() { return burger.getAttribute('aria-expanded') === 'true'; }

  function openMenu() {
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Закрыть меню');
    nav.classList.add('is-open');
    document.body.classList.add('is-locked');
  }

  function closeMenu(returnFocus) {
    if (!isMenuOpen()) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
    nav.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    if (returnFocus) burger.focus();
  }

  burger.addEventListener('click', function () {
    if (isMenuOpen()) closeMenu(false); else openMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isMenuOpen()) closeMenu(true);
  });

  // Удержание фокуса в открытом меню на телефоне
  nav.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !isMenuOpen()) return;
    var items = [burger].concat(Array.prototype.slice.call(nav.querySelectorAll('a')));
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === nav.querySelector('a')) {
      e.preventDefault(); burger.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  function onMobileChange() { if (!mobileQuery.matches) closeMenu(false); }
  if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', onMobileChange);
  else mobileQuery.addListener(onMobileChange);

  /* ------------------------------------------------------------------
     Плавная навигация по якорям с учётом высоты шапки
     ------------------------------------------------------------------ */
  function scrollToTarget(target) {
    var top = target.id === 'top'
      ? 0
      : target.getBoundingClientRect().top + window.scrollY - headerHeight() - 8;
    window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href').slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    var menuWasOpen = isMenuOpen();
    closeMenu(false);

    // Если меню было открыто, ждём снятия блокировки прокрутки
    var go = function () {
      scrollToTarget(target);
      if (id !== 'top') {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
      try {
        if (history.pushState) history.pushState(null, '', id === 'top' ? location.pathname + location.search : '#' + id);
      } catch (err) { /* в изолированном фрейме история может быть недоступна */ }
    };
    if (menuWasOpen) requestAnimationFrame(go); else go();
  });

  // Корректная позиция при открытии страницы по ссылке с якорем
  window.addEventListener('load', function () {
    syncHeaderHeight();
    if (location.hash.length > 1) {
      var t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (t) window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY - headerHeight() - 8);
    }
  });

  /* ------------------------------------------------------------------
     Подсветка текущего раздела в навигации
     ------------------------------------------------------------------ */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var sectionMap = {
    services: 'services',
    about: 'about',
    price: 'price',
    steps: 'price',
    contacts: 'contacts'
  };

  if ('IntersectionObserver' in window) {
    var visibleSections = {};
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visibleSections[entry.target.id] = entry.isIntersecting; });
      var current = null;
      ['services', 'about', 'price', 'steps', 'contacts'].forEach(function (id) {
        if (visibleSections[id]) current = sectionMap[id];
      });
      navLinks.forEach(function (link) {
        var active = current && link.getAttribute('href') === '#' + current;
        link.classList.toggle('is-active', !!active);
        if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Object.keys(sectionMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     Услуги: раскрывающийся список и смена фото
     ------------------------------------------------------------------ */
  var services = Array.prototype.slice.call(document.querySelectorAll('.svc'));
  var mediaImages = Array.prototype.slice.call(document.querySelectorAll('.services__img'));
  var caption = document.getElementById('services-caption');

  function showMedia(item) {
    var key = item.getAttribute('data-service');
    mediaImages.forEach(function (img) {
      img.classList.toggle('is-active', img.getAttribute('data-media') === key);
    });
    var text = item.getAttribute('data-caption');
    if (caption && caption.textContent !== text) {
      caption.classList.add('is-changing');
      setTimeout(function () {
        caption.textContent = text;
        caption.classList.remove('is-changing');
      }, reducedMotion() ? 0 : 180);
    }
  }

  function setOpen(item, open) {
    var btn = item.querySelector('.svc__toggle');
    item.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  }

  services.forEach(function (item) {
    var btn = item.querySelector('.svc__toggle');
    btn.addEventListener('click', function () {
      var willOpen = !item.classList.contains('is-open');
      services.forEach(function (other) { if (other !== item) setOpen(other, false); });
      setOpen(item, willOpen);
      if (willOpen) showMedia(item);
    });
    // На десктопе фото меняется уже при наведении — как предпросмотр
    btn.addEventListener('mouseenter', function () {
      if (window.matchMedia('(hover: hover) and (min-width: 900px)').matches) showMedia(item);
    });
  });

  var svcList = document.querySelector('.svc-list');
  if (svcList) {
    svcList.addEventListener('mouseleave', function () {
      var open = document.querySelector('.svc.is-open');
      if (open) showMedia(open);
    });
  }

  /* ------------------------------------------------------------------
     Калькулятор
     ------------------------------------------------------------------ */
  var calc = document.getElementById('calc');
  var totalEl = document.getElementById('calc-total');
  var countEl = document.getElementById('calc-count');
  var listEl = document.getElementById('calc-list');
  var classEl = document.getElementById('summary-class');
  var shownTotal = 0;
  var tweenFrame = null;

  function calcState() {
    var classInput = calc.querySelector('input[name="carClass"]:checked');
    var k = parseFloat(classInput.getAttribute('data-k'));
    var items = [];
    Array.prototype.forEach.call(calc.querySelectorAll('input[name="work"]'), function (input) {
      var base = parseInt(input.getAttribute('data-base'), 10);
      var price = Math.round(base * k / 50) * 50;
      var label = input.closest('.option');
      label.querySelector('[data-price]').textContent = formatRub(price);
      if (input.checked) {
        items.push({
          name: label.querySelector('.option__name').textContent,
          price: price,
          cat: input.getAttribute('data-cat')
        });
      }
    });
    var total = items.reduce(function (sum, it) { return sum + it.price; }, 0);
    return { className: classInput.getAttribute('data-label'), items: items, total: total };
  }

  function animateTotal(to) {
    if (tweenFrame) cancelAnimationFrame(tweenFrame);
    var from = shownTotal;
    if (reducedMotion() || from === to) {
      shownTotal = to;
      totalEl.textContent = formatRub(to);
      return;
    }
    var start = null, duration = 360;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      var value = Math.round((from + (to - from) * eased) / 10) * 10;
      totalEl.textContent = formatRub(p === 1 ? to : value);
      if (p < 1) tweenFrame = requestAnimationFrame(step);
      else { shownTotal = to; tweenFrame = null; }
    }
    tweenFrame = requestAnimationFrame(step);
  }

  function renderCalc() {
    var state = calcState();
    animateTotal(state.total);
    classEl.textContent = '· ' + state.className;
    countEl.textContent = state.items.length
      ? state.items.length + ' ' + plural(state.items.length, 'работа', 'работы', 'работ')
      : 'Работы не выбраны';

    listEl.textContent = '';
    if (!state.items.length) {
      var empty = document.createElement('li');
      empty.className = 'summary__empty';
      empty.textContent = 'Отметьте хотя бы одну работу';
      listEl.appendChild(empty);
    }
    state.items.forEach(function (it) {
      var li = document.createElement('li');
      var name = document.createElement('span');
      var price = document.createElement('span');
      name.textContent = it.name;
      price.textContent = formatRub(it.price);
      li.appendChild(name);
      li.appendChild(price);
      listEl.appendChild(li);
    });
    return state;
  }

  if (calc) {
    calc.addEventListener('change', renderCalc);
    calc.addEventListener('submit', function (e) { e.preventDefault(); });
    calc.addEventListener('reset', function () { setTimeout(renderCalc, 0); });
    shownTotal = calcState().total;
    renderCalc();
  }

  /* ------------------------------------------------------------------
     Модальное окно записи
     ------------------------------------------------------------------ */
  var modal = document.getElementById('booking');
  var dialog = modal.querySelector('.modal__dialog');
  var form = document.getElementById('booking-form');
  var formView = document.getElementById('booking-form-view');
  var successView = document.getElementById('booking-success');
  var successTitle = document.getElementById('booking-success-title');
  var summaryEl = document.getElementById('booking-summary');
  var calcNote = document.getElementById('booking-calc');
  var fields = {
    name: document.getElementById('f-name'),
    phone: document.getElementById('f-phone'),
    service: document.getElementById('f-service'),
    date: document.getElementById('f-date')
  };
  var outside = [document.querySelector('.skip-link'), header, document.getElementById('main'), document.querySelector('.footer')];
  var opener = null;
  var closeTimer = null;
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function isoDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayISO() { return isoDate(new Date()); }
  function maxISO() { var d = new Date(); d.setDate(d.getDate() + 60); return isoDate(d); }

  function setDateLimits() {
    fields.date.min = todayISO();
    fields.date.max = maxISO();
  }

  function setInert(value) {
    outside.forEach(function (el) {
      if (!el) return;
      if (value) { el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); }
      else { el.removeAttribute('inert'); el.removeAttribute('aria-hidden'); }
    });
  }

  function lockScroll(lock) {
    if (lock) {
      var scrollbar = window.innerWidth - root.clientWidth;
      document.body.style.paddingRight = scrollbar > 0 ? scrollbar + 'px' : '';
      header.style.paddingRight = scrollbar > 0 ? scrollbar + 'px' : '';
      document.body.classList.add('is-locked');
    } else {
      document.body.style.paddingRight = '';
      header.style.paddingRight = '';
      if (!isMenuOpen()) document.body.classList.remove('is-locked');
    }
  }

  function showFormView() {
    successView.hidden = true;
    formView.hidden = false;
  }

  function resetForm() {
    form.reset();
    Object.keys(fields).forEach(function (key) { clearError(fields[key]); });
  }

  function openModal(trigger) {
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    opener = trigger || document.activeElement;
    closeMenu(false);
    setDateLimits();

    if (!successView.hidden) { resetForm(); showFormView(); }

    // Предвыбор услуги
    var preset = trigger && trigger.getAttribute('data-service');
    calcNote.hidden = true;
    if (trigger && trigger.hasAttribute('data-from-calc') && calc) {
      var state = calcState();
      if (state.items.length) {
        preset = state.items[0].cat;
        calcNote.textContent = 'Из калькулятора: ' + state.className.toLowerCase() + ' класс, ' +
          state.items.length + ' ' + plural(state.items.length, 'работа', 'работы', 'работ') +
          ' — предварительно ' + formatRub(state.total) + '.';
        calcNote.hidden = false;
      }
    }
    if (preset) fields.service.value = preset;

    modal.hidden = false;
    setInert(true);
    lockScroll(true);
    // Перерисовка перед запуском перехода
    void dialog.offsetWidth;
    modal.classList.add('is-open');

    var firstEmpty = [fields.name, fields.phone, fields.service, fields.date].filter(function (f) { return !f.value; })[0];
    (firstEmpty || fields.name).focus({ preventScroll: true });
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.classList.remove('is-open');
    setInert(false);
    lockScroll(false);
    var finish = function () {
      modal.hidden = true;
      closeTimer = null;
      if (!successView.hidden) { resetForm(); showFormView(); }
    };
    if (reducedMotion()) finish(); else closeTimer = setTimeout(finish, 280);

    if (opener && document.contains(opener) && typeof opener.focus === 'function') {
      opener.focus({ preventScroll: true });
    }
    opener = null;
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-open-booking]');
    if (trigger) { e.preventDefault(); openModal(trigger); return; }
    if (e.target.closest('[data-close-modal]') && !modal.hidden) closeModal();
  });

  modal.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if (e.key !== 'Tab') return;

    var focusable = Array.prototype.filter.call(dialog.querySelectorAll(FOCUSABLE), function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  // Если фокус всё же ушёл за пределы окна — возвращаем его
  document.addEventListener('focusin', function (e) {
    if (!modal.hidden && modal.classList.contains('is-open') && !modal.contains(e.target)) {
      var f = dialog.querySelector(FOCUSABLE);
      if (f) f.focus();
    }
  });

  /* --- Маска телефона --- */
  // Возвращает 10 цифр номера без кода страны
  function phoneDigits(value) {
    var v = value.trim();
    if (/^\+7/.test(v)) return v.slice(2).replace(/\D/g, '').slice(0, 10);
    var d = v.replace(/\D/g, '');
    if (d.length > 10 && /^[78]/.test(d)) d = d.slice(1);
    return d.slice(0, 10);
  }

  function formatPhone(d) {
    var out = '+7 (' + d.slice(0, 3);
    if (d.length >= 3) out += ')';
    if (d.length > 3) out += ' ' + d.slice(3, 6);
    if (d.length > 6) out += '-' + d.slice(6, 8);
    if (d.length > 8) out += '-' + d.slice(8, 10);
    return out;
  }

  function caretToEnd(input) {
    var len = input.value.length;
    try { input.setSelectionRange(len, len); } catch (err) { /* не все типы полей поддерживают */ }
  }

  var lastPhoneDigits = '';

  fields.phone.addEventListener('input', function (e) {
    var digits = phoneDigits(fields.phone.value);
    // Если Backspace стёр только скобку или дефис, убираем и предыдущую цифру,
    // иначе маска сразу вернёт символ на место
    if (e.inputType === 'deleteContentBackward' && digits === lastPhoneDigits) {
      digits = digits.slice(0, -1);
    }
    lastPhoneDigits = digits;
    fields.phone.value = formatPhone(digits);
    caretToEnd(fields.phone);
    if (fields.phone.getAttribute('aria-invalid') === 'true') validateField('phone');
  });

  fields.phone.addEventListener('focus', function () {
    if (!fields.phone.value) fields.phone.value = '+7 (';
    lastPhoneDigits = phoneDigits(fields.phone.value);
    caretToEnd(fields.phone);
    // Клик мышью ставит курсор уже после события focus — переносим его в конец ещё раз
    setTimeout(function () { caretToEnd(fields.phone); }, 0);
  });

  fields.phone.addEventListener('blur', function () {
    if (!phoneDigits(fields.phone.value).length) fields.phone.value = '';
  });

  /* --- Проверка полей --- */
  function setError(input, message) {
    var errorEl = document.getElementById(input.id + '-error');
    input.setAttribute('aria-invalid', 'true');
    errorEl.textContent = message;
  }

  function clearError(input) {
    var errorEl = document.getElementById(input.id + '-error');
    input.removeAttribute('aria-invalid');
    errorEl.textContent = '';
  }

  function validateField(key) {
    var input = fields[key];
    var value = input.value.trim();
    var message = '';

    if (key === 'name') {
      if (!value) message = 'Укажите имя.';
      else if (value.length < 2) message = 'Имя слишком короткое.';
      else if (!/^[A-Za-zА-Яа-яЁё\s\-']+$/.test(value)) message = 'Используйте только буквы.';
    }
    if (key === 'phone') {
      var digits = phoneDigits(value);
      if (!digits.length) message = 'Укажите телефон.';
      else if (digits.length < 10) message = 'Номер неполный: нужно 10 цифр после +7.';
    }
    if (key === 'service') {
      if (!value) message = 'Выберите услугу.';
    }
    if (key === 'date') {
      if (!value) message = 'Выберите дату.';
      else if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) message = 'Введите дату полностью.';
      else if (value < todayISO()) message = 'Нельзя выбрать прошедшую дату.';
      else if (value > maxISO()) message = 'Запись открыта только на 60 дней вперёд.';
    }

    if (message) setError(input, message); else clearError(input);
    return !message;
  }

  Object.keys(fields).forEach(function (key) {
    var input = fields[key];
    input.addEventListener('blur', function () {
      if (input.value || input.getAttribute('aria-invalid') === 'true') validateField(key);
    });
    input.addEventListener('change', function () {
      if (input.getAttribute('aria-invalid') === 'true') validateField(key);
    });
    if (key !== 'phone') {
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') validateField(key);
      });
    }
  });

  function formatDateHuman(iso) {
    var parts = iso.split('-');
    var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    return d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    setDateLimits();
    var firstInvalid = null;
    ['name', 'phone', 'service', 'date'].forEach(function (key) {
      if (!validateField(key) && !firstInvalid) firstInvalid = fields[key];
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    var rows = [
      ['Имя', fields.name.value.trim()],
      ['Телефон', fields.phone.value],
      ['Услуга', fields.service.options[fields.service.selectedIndex].text],
      ['Дата', formatDateHuman(fields.date.value)]
    ];
    summaryEl.textContent = '';
    rows.forEach(function (row) {
      var wrap = document.createElement('div');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = row[0];
      dd.textContent = row[1];
      wrap.appendChild(dt);
      wrap.appendChild(dd);
      summaryEl.appendChild(wrap);
    });

    formView.hidden = true;
    successView.hidden = false;
    dialog.scrollTop = 0;
    successTitle.focus();
  });

  /* ------------------------------------------------------------------
     Режим работы: сегодняшний день и статус «открыто»
     ------------------------------------------------------------------ */
  (function () {
    var statusEl = document.getElementById('open-status');
    if (!statusEl) return;
    var now = new Date();
    var day = now.getDay();
    var minutes = now.getHours() * 60 + now.getMinutes();
    var weekday = day >= 1 && day <= 5;
    var openAt = weekday ? 8 * 60 : 10 * 60;
    var closeAt = weekday ? 21 * 60 : 18 * 60;

    Array.prototype.forEach.call(document.querySelectorAll('.hours tr'), function (row) {
      var days = row.getAttribute('data-days').split(',').map(Number);
      row.classList.toggle('is-today', days.indexOf(day) !== -1);
    });

    if (minutes >= openAt && minutes < closeAt) {
      statusEl.textContent = 'Сейчас открыто · до ' + (closeAt / 60) + ':00';
      statusEl.classList.add('is-open');
    } else {
      var tomorrow = (day + (minutes >= closeAt ? 1 : 0)) % 7;
      var nextOpen = tomorrow >= 1 && tomorrow <= 5 ? '8:00' : '10:00';
      statusEl.textContent = 'Сейчас закрыто · откроемся ' + (minutes >= closeAt ? 'завтра' : 'сегодня') + ' в ' + nextOpen;
    }
  })();

  /* ------------------------------------------------------------------
     Появление элементов при прокрутке
     ------------------------------------------------------------------ */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('.reveal, .steps'));

  if ('IntersectionObserver' in window && !reducedMotion()) {
    // Небольшая задержка для соседних элементов одной группы
    var groups = new Map();
    revealItems.forEach(function (el) {
      var parent = el.parentElement;
      var index = groups.get(parent) || 0;
      groups.set(parent, index + 1);
      el.style.setProperty('--reveal-delay', Math.min(index, 4) * 70 + 'ms');
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------------
     Изображения: запасной фон при ошибке загрузки
     ------------------------------------------------------------------ */
  Array.prototype.forEach.call(document.querySelectorAll('.media img'), function (img) {
    function fail() {
      var box = img.closest('.media');
      if (!box) return;
      box.classList.add('is-broken');
      if (img.alt) box.setAttribute('data-fallback', img.alt);
    }
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fail();
    else img.addEventListener('error', fail, { once: true });
  });

  /* ------------------------------------------------------------------
     Мелочи
     ------------------------------------------------------------------ */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  syncHeaderHeight();
})();
