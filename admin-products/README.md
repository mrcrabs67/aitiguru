# Admin Products

React + TypeScript + Vite приложение для авторизации и управления списком товаров.

## Стек и почему он выбран

- **React + TypeScript** — типобезопасная и предсказуемая разработка UI.
- **Vite** — быстрый dev-server и сборка без лишней инфраструктуры.
- **@tanstack/react-query** — работа с серверным состоянием (загрузка/обновление списка товаров, кэш, refetch).
- **react-hook-form** — простой и производительный контроль форм (страница логина).
- **SCSS modules** — изолированные стили компонентов и удобная кастомизация под макеты.

Для текущего объёма проекта это оптимальный баланс между скоростью разработки и контролем над UI.

## Запуск

```bash
npm install
npm run dev
```

Сборка и проверка:

```bash
npm run lint
npm run build
```

## Логотип на странице логина

Положите файл логотипа в `public/assets/login/` с одним из имён:

- `logo-circle.png`
- `logo-circle.jpg`
- `logo-circle.jpeg`
- `logo-circle.webp`
- `logo-circle.svg`

Дополнительно поддерживаются файлы в корне `public/`:

- `public/logo-circle.png`
- `public/logo-circle.jpg`
- `public/logo-circle.jpeg`
- `public/logo-circle.webp`
- `public/logo-circle.svg`

Если файл не найден, отображается fallback-иконка.

## Поведение таблицы товаров

- По умолчанию чекбоксы строк не выбраны.
- Верхний чекбокс выбирает/снимает выбор со всех видимых строк.
- При частичном выборе верхний чекбокс переходит в состояние `indeterminate`.
