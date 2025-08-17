# 🚀 Discord Cleaner

Современное desktop приложение для безопасной очистки ваших сообщений в Discord с множественными профилями и продвинутой фильтрацией.

![Discord Cleaner](https://img.shields.io/badge/Discord-Cleaner-7289da?style=for-the-badge&logo=discord&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-37-9feaf9?style=for-the-badge&logo=electron&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Основные возможности

- 🔐 **Безопасность**: Удаление только ваших собственных сообщений
- 👥 **Множественные профили**: Управление несколькими Discord аккаунтами
- 🎯 **Продвинутая фильтрация**: По датам, контенту, авторам и типам сообщений
- 📊 **Мониторинг прогресса**: Отслеживание процесса очистки в реальном времени
- 💾 **Экспорт логов**: Сохранение детальных отчетов о процессе очистки
- 🌟 **Современный UI**: Закругленный и гладкий интерфейс с анимациями
- ⚡ **Rate Limiting**: Соблюдение лимитов Discord API для безопасности
- 🎨 **Discord Theme**: Интерфейс в стиле Discord с темной темой

## 🛠️ Технический стек

- **Frontend**: React 19 + TypeScript
- **Desktop**: Electron 37
- **Styling**: Tailwind CSS v4 + Custom CSS
- **Build Tool**: Vite
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)
- **Notifications**: Sonner

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ 
- pnpm
- Git

### Установка

```bash
git clone https://github.com/resoufish/discord-cleaner.git
cd discord-cleaner
pnpm install
````

### Запуск в режиме разработки

```bash
# Web версия
pnpm vite:dev

# Desktop версия (Electron)
pnpm electron:dev
```

### Сборка

```bash
# Сборка Web
pnpm vite:build

# Сборка Electron под конкретную ОС
# ⚠️ macOS сборка возможна только на macOS
pnpm electron:build:windows   # Windows
pnpm electron:build:linux     # Linux
pnpm electron:build:mac       # macOS
```

### Сборка сразу под все платформы

```bash
pnpm build:all
# ⚠️ На Windows сборка macOS не выполнится, нужно использовать macOS runner или CI
```

## 🔐 Получение Discord токена

1. Откройте Discord в браузере
2. Нажмите F12 (Developer Tools)
3. Перейдите в Network tab
4. Обновите страницу (F5)
5. Найдите любой XHR запрос к discordapp.com
6. В Headers найдите "authorization" header
7. Скопируйте значение токена

⚠️ **ВАЖНО**: Никогда не делитесь своим токеном с другими людьми!

## 🎯 Функции безопасности

* ✅ Удаление только ваших сообщений
* ✅ Локальное хранение токенов
* ✅ Соблюдение rate limits Discord API
* ✅ Возможность остановки процесса в любой момент
* ✅ Детальное логирование всех операций

## 🔧 Конфигурация

### Tailwind CSS

Проект использует Tailwind CSS v4 с кастомными CSS переменными и темной темой.

### TypeScript

Строгая конфигурация TypeScript с проверкой неиспользуемых переменных.

### Electron

Конфигурация для создания desktop приложения с поддержкой Windows, macOS и Linux.

## 🤝 Участие в разработке

1. Fork проекта
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Создайте Pull Request

## 📝 Лицензия

Распространяется под MIT лицензией. См. `LICENSE` для подробностей.

## ⚠️ Дисклеймер

Это приложение предназначено только для управления вашими собственными сообщениями Discord. Использование для нарушения условий обслуживания Discord запрещено. Используйте на свой страх и риск.

## 📞 Поддержка

* 🐛 Issues: [GitHub Issues](https://github.com/resoufish/discord-cleaner/issues)

## 🏆 Благодарности

* Discord за предоставление API
* React и Electron сообществам
* Всем контрибьюторам проекта (мне xd)

---

**Сделано с ❤️ resoufish**