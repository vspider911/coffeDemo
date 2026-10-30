# cafe

Демо-сайт кофейни «Зерно» на чистом HTML, CSS и JavaScript без зависимостей (шрифты подключаются из Google Fonts).

- меню с фильтром по разделам: кофе, другие напитки, выпечка, зерно домой; у каждого раздела своё фото (при «Всё» — под колонкой кофе, при выборе раздела — справа от списка);
- объём или вес каждой позиции, аллергены у выпечки, добавки (молоко, сироп, помол);
- блок «Зерно недели» с ценами на напиток и пачку зерна;
- часы работы по дням и статус «Открыто / Закрыто» по текущему времени;
- фото обжарки в разделе «О нас»;
- удобства для гостей, карта гостя, контакты, схема проезда;
- форма бронирования столика с выбором числа гостей и проверкой телефона и времени по часам работы (демо, данные никуда не отправляются);
- блок «Обжариваем маленькими партиями»: фото зерна в рамке и шесть принципов, номер партии прокручивается как счётчик;
- гид «Как заварить дома»: карточки V60, френч-пресса, колд брю и эспрессо с подробным рецептом в окне;
- коллаж из фотографий зала, лента фото «Подписаться в Telegram»;
- первый экран по мотивам референса: бумажный стаканчик кофе, вырезанный по контуру, и крупное слово «Зерно» поверх него; экран закрепляется при прокрутке — заголовок и слово уезжают вверх, снизу выезжает горстка зёрен, стакан приподнимается и падает в неё (с отскоком и разлетающимися зёрнами), затем появляется второй кадр «Сварим / сегодня.»; при прокрутке назад — обратная анимация: зёрна по тем же дугам запрыгивают в горстку, стакан приседает, выпрыгивает с перелётом и мягко встаёт на место, горстка пружинит и уезжает вниз (на телефоне и планшете — та же анимация, текст второго кадра над стаканом; статичная версия, где стакан сразу стоит в горстке, — только при системной настройке «уменьшить движение» и на очень низких экранах, например телефон лёжа);
- полоса-анонс над шапкой, закреплённая снизу плашка «Забронировать», подписка на новости обжарки в подвале (демо);
- мобильное меню навигации, подсветка текущего раздела, учёт `prefers-reduced-motion`, работа с клавиатуры и скринридером.
- адаптивная вёрстка для телефонов;
- все картинки в WebP и грузятся сразу при открытии страницы (без ленивой загрузки); стакан и горстка зёрен первого экрана — с приоритетом, фото разделов меню скачиваются заранее.

Позиции меню, рецепты, цены и часы работы задаются в начале `script.js` (`MENU`, `RECIPES`, `HOURS`).

## Запуск

Откройте `index.html` в браузере. Или запустите локальный сервер:

```sh
python3 -m http.server 8000
```

и перейдите на http://localhost:8000.

## Изображения

`img/menu/*.webp` — фото с [Unsplash](https://unsplash.com) по [лицензии Unsplash](https://unsplash.com/license) (бесплатно, в том числе для коммерческого использования), обрезаны до 240×240:

- `espresso.webp` — https://images.unsplash.com/photo-1610889556528-9a770e32642f
- `americano.webp` — https://images.unsplash.com/photo-1504630083234-14187a9df0f5
- `cappuccino.webp` — https://images.unsplash.com/photo-1572442388796-11668a67e53d
- `latte.webp` — https://images.unsplash.com/photo-1541167760496-1628856ab772
- `raf.webp` — https://images.unsplash.com/photo-1517487881594-2787fef5ebf7
- `iced-latte.webp` — https://images.unsplash.com/photo-1517701604599-bb29b565090c
- `v60.webp` — https://images.unsplash.com/photo-1442512595331-e89e73853f31
- `matcha.webp` — https://images.unsplash.com/photo-1515823064-d6e0c04616a7
- `cocoa.webp` — https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed
- `tea.webp` — https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9
- `croissant.webp` — https://images.unsplash.com/photo-1555507036-ab1f4038808a
- `cheesecake.webp` — https://images.unsplash.com/photo-1524351199678-941a58a3df50
- `cookie.webp` — https://images.unsplash.com/photo-1558961363-fa8fdf82db35
- `beans-ethiopia.webp` — https://images.unsplash.com/photo-1587734195503-904fca47e0e9
- `beans-colombia.webp` — https://images.unsplash.com/photo-1442550528053-c431ecb55509
- `beans-brazil.webp` — https://images.unsplash.com/photo-1447933601403-0c6688de566e

`img/espresso.webp` — фото Rachel Michetti (Pikolo Espresso Bar), лицензия CC0 (без ограничений). Взято из набора тестовых изображений [scikit-image](https://scikit-image.org/docs/stable/api/skimage.data.html#skimage.data.coffee).

Фото новых блоков — тоже с [Unsplash](https://unsplash.com) по [лицензии Unsplash](https://unsplash.com/license), обрезаны под размер блока:

- `img/hero-cup.webp` — фото стаканчика предоставлено владельцем сайта; фон удалён, стаканчик вырезан по контуру
- `img/standards-bean.webp` — https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6
- `img/brew/v60.webp` — https://images.unsplash.com/photo-1513267048331-5611cad62e41
- `img/brew/french-press.webp` — https://images.unsplash.com/photo-1445116572660-236099ec97a0
- `img/brew/cold-brew.webp` — https://images.unsplash.com/photo-1517959105821-eaf2591984ca
- `img/brew/espresso.webp` — https://images.unsplash.com/photo-1511920170033-f8396924c348
- `img/gallery/table.webp` — https://images.unsplash.com/photo-1534040385115-33dcb3acba5b
- `img/gallery/hands.webp` — https://images.unsplash.com/photo-1495774856032-8b90bbb32b32
- `img/gallery/cheers.webp` — https://images.unsplash.com/photo-1495474472287-4d71bcdd2085
- `img/gallery/bar.webp` — https://images.unsplash.com/photo-1453614512568-c4024d13c247
- `img/gallery/cup.webp` — https://images.unsplash.com/photo-1551030173-122aabc4489c
- `img/feed/1.webp` — https://images.unsplash.com/photo-1509042239860-f550ce710b93
- `img/feed/2.webp` — https://images.unsplash.com/photo-1507133750040-4a8f57021571
- `img/feed/3.webp` — https://images.unsplash.com/photo-1498804103079-a6351b050096
- `img/feed/4.webp` — https://images.unsplash.com/photo-1525480122447-64809d765ec4
- `img/feed/5.webp` — https://images.unsplash.com/photo-1611564494260-6f21b80af7ea
- `img/feed/6.webp` — https://images.unsplash.com/photo-1516743619420-154b70a65fea
- `img/feed/7.webp` — https://images.unsplash.com/photo-1497636577773-f1231844b336
- `img/sections/menu-coffee.webp` — https://images.unsplash.com/photo-1609050471053-8636409f9f5b
- `img/sections/menu-other.webp` — https://images.unsplash.com/photo-1624893578106-a98840591afc
- `img/sections/menu-food.webp` — https://images.unsplash.com/photo-1747459707229-7b1b7c8367e0
- `img/sections/menu-beans.webp` — https://images.unsplash.com/photo-1777383504831-d0f3c6e0486e
- `img/sections/about-roasting.webp` — https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb
- `img/beans-pile.webp`, `img/beans-front.webp`, `img/bean-1.webp` … `img/bean-4.webp` — фото горстки зёрен предоставлено владельцем сайта; фон удалён, тени и цвет подправлены, передние и отдельные зёрна вырезаны из этого же фото
