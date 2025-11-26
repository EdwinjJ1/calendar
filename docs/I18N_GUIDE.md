# Internationalization (i18n) Guide

This project uses **next-intl** for multilingual support, currently supporting English (en) and Chinese (zh).

## Quick Start

### 1. Using Translations in Components

```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('home'); // 'home' is the namespace

  return <h1>{t('title')}</h1>; // Reads from home.title
}
```

### 2. Adding New Translations

Edit the JSON files in `/i18n/messages/`:

**`en.json`**:
```json
{
  "myPage": {
    "title": "Hello World",
    "subtitle": "Welcome!"
  }
}
```

**`zh.json`**:
```json
{
  "myPage": {
    "title": "你好世界",
    "subtitle": "欢迎！"
  }
}
```

### 3. Language Switcher

The `<LanguageSwitcher />` component is available in the top-right corner:
- Stores user preference in cookies
- Automatically reloads the page with new locale
- Supports smooth animations

```tsx
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

<LanguageSwitcher />
```

## Project Structure

```
i18n/
├── request.ts          # next-intl configuration (reads locale from cookies)
└── messages/
    ├── en.json        # English translations
    └── zh.json        # Chinese translations

lib/
└── locale.ts          # Locale utilities (setLocale, getLocale)

components/ui/
└── LanguageSwitcher.tsx  # Language switcher component
```

## Translation Organization

Translations are organized by page/feature:

```json
{
  "home": { ... },        // Home page
  "calendar": { ... },    // Calendar page
  "todos": { ... },       // Todos page
  "common": { ... }       // Shared translations
}
```

## Adding a New Language

1. Create new message file: `/i18n/messages/[locale].json`
2. Add locale to `/lib/locale.ts`:
```typescript
export const LOCALES = {
  EN: 'en',
  ZH: 'zh',
  FR: 'fr',  // New language
} as const;

export const LOCALE_NAMES = {
  en: 'English',
  zh: '中文',
  fr: 'Français',  // New language
} as const;
```

## Special Features

### Line Breaks in Translations

Use `\n` in JSON and split in component:

```json
{
  "title": "NEON\nCalendar"
}
```

```tsx
{t('title').split('\n').map((line, i) => (
  <span key={i}>
    {line}
    {i < t('title').split('\n').length - 1 && <br />}
  </span>
))}
```

### Dynamic Values

```json
{
  "welcome": "Welcome, {name}!"
}
```

```tsx
{t('welcome', { name: 'John' })}
```

## Configuration Files

### `/i18n/request.ts`
- Reads locale from cookies (`NEXT_LOCALE`)
- Falls back to 'en' if no cookie is set
- Dynamically imports the correct message file

### `/lib/locale.ts`
- `setLocale(locale)`: Set and save user's language preference
- `getLocale()`: Get current language from cookie
- `LOCALES`: Available language codes
- `LOCALE_NAMES`: Display names for each language

## Best Practices

1. **Always use translation keys**: Never hardcode text in components
2. **Organize by feature**: Keep translations grouped by page/feature
3. **Keep keys consistent**: Use the same structure in all language files
4. **Test both languages**: Ensure UI works with different text lengths
5. **Use namespaces**: Group related translations under a common key

## Example: Complete Component

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function WelcomePage() {
  const t = useTranslations('welcome');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <button>{t('button')}</button>
    </div>
  );
}
```

**Translations** (`en.json` and `zh.json`):
```json
{
  "welcome": {
    "title": "Welcome!",
    "description": "Get started with your tasks",
    "button": "Continue"
  }
}
```

## Cookie Details

- **Name**: `NEXT_LOCALE`
- **Values**: `en` or `zh`
- **Max Age**: 1 year
- **Path**: `/` (site-wide)
- **Automatically set** by `<LanguageSwitcher />`

## Need Help?

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js i18n Guide](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
