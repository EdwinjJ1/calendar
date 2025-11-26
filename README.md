# 🌈 NEON Calendar - Artistic Todo & Event Manager

An **artistic** calendar and todo management application with **3D animations**, **neon vibes**, and **hand-drawn aesthetics** - inspired by bryantcodes.art. Built with Next.js 15.

## ✨ Features

### 🌍 Multilingual Support
- **English & Chinese**: Full bilingual support with next-intl
- **Language Switcher**: Floating button in top-right corner
- **Cookie Persistence**: Remembers your language preference
- **Easy to Extend**: Add new languages by creating JSON files

### 🎨 Artistic Design
- **Neon Green + Dark Theme**: Cyberpunk-inspired color scheme
- **3D Card Effects**: Rotating hover animations on all cards
- **Hand-Drawn Borders**: Artistic squiggly borders with dashed overlays
- **Particle Background**: Animated particle system for dynamic ambiance
- **Floating Elements**: Smooth floating animations throughout
- **Glow Effects**: Neon glow on all interactive elements

### 📅 Calendar
- **Multiple Views**: Month, week, day, and agenda views with neon styling
- **Quick Creation**: Click on calendar to instantly create events
- **3D Events**: Event cards with 3D hover effects
- **🤖 AI Import**: Upload markdown study plans and auto-convert to calendar events!
- **Export to .ics**: One-click export to Apple Calendar

### ✅ Todos
- **Neon Priority Tags**: High/Medium/Low with glowing badges
- **Drag & Drop**: Smooth reordering with @dnd-kit
- **Hand-Drawn Style**: Artistic todo cards with neon borders
- **Custom Categories**: Tag your tasks with glowing chips
- **Due Dates**: Track deadlines with style
- **Export to .ics**: Share todos as calendar events

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4 + Custom CSS animations
- **Calendar UI**: react-big-calendar
- **3D Animations**: Framer Motion
- **Particles**: particles.js
- **Drag & Drop**: @dnd-kit
- **Date Utils**: date-fns
- **ICS Export**: ical-generator
- **TypeScript**: Full type safety
- **i18n**: next-intl for multilingual support
- **Design**: Neon + Hand-drawn aesthetic inspired by bryantcodes.art

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── page.tsx          # Home page
│   ├── calendar/         # Calendar page
│   ├── todos/            # Todos page
│   └── globals.css       # Global styles
├── components/
│   ├── calendar/         # Calendar components
│   ├── todos/            # Todo components
│   └── ui/               # Shared UI components
├── lib/
│   ├── constants.ts      # App constants (no magic numbers)
│   ├── storage.ts        # localStorage utilities
│   └── icsExport.ts      # ICS file generation
└── types/
    └── index.ts          # TypeScript types
```

## Configuration

All configuration is centralized in `lib/constants.ts`:
- Storage keys
- Priority levels and colors
- Date formats
- Calendar views
- Limits and thresholds

No magic numbers or hardcoded values in the codebase.

## Multilingual Support

The app supports English and Chinese with easy language switching:

1. Click the language switcher in the top-right corner
2. Choose between **English** or **中文**
3. The page reloads with your selected language
4. Preference is saved in cookies for future visits

See [I18N_GUIDE.md](./docs/I18N_GUIDE.md) for detailed documentation on:
- Adding new translations
- Supporting additional languages
- Using translations in components
- Translation best practices

## 🎯 Design Philosophy

### Code
- **No Magic Numbers**: All config centralized in `lib/constants.ts`
- **No Hardcoding**: Colors, sizes, and limits all in CSS variables
- **Maximum Library Usage**: Leverage existing libraries instead of reinventing
- **Simple & Maintainable**: Clean TypeScript with clear type definitions

### Visual
- **Neon Cyberpunk**: Inspired by bryantcodes.art's artistic direction
- **3D Depth**: Every element has dimension and responds to interaction
- **Hand-Drawn Feel**: Organic, artistic borders and shapes
- **Micro-Interactions**: Delightful animations on every action

## 🤖 AI Import Feature

### Automatically convert your study plans to calendar events!

**Supported Format:**
```markdown
# 2025年11月17日 复习计划

## 时间安排

- **上午 11:00 - 下午 2:30:**
  - **科目:** COMP1521
  - **目标:** 复习核心知识点

- **下午 4:00 - 下午 6:30:**
  - **科目:** COMP1531
  - **目标:** 完成Bonus任务
```

**How to Use:**
1. Click "🤖 AI Import from Markdown" button
2. Either:
   - Upload your `.md` file, OR
   - Paste your schedule text
3. Click "🔮 Parse Schedule"
4. Preview detected events
5. Click "📥 Import All"

**Supported Time Formats:**
- 中文: `上午 11:00`, `下午 2:30`, `晚上 8:00`
- English: `11:00 AM`, `2:30 PM`
- 24-hour: `14:30`, `20:00`

## Export to Apple Calendar

1. Click "Export to Apple Calendar" button
2. Download the .ics file
3. Open with Apple Calendar (or any calendar app)
4. Events/todos will be imported automatically

## Data Storage

All data is stored locally in your browser using localStorage:
- Events: `calendar_events`
- Todos: `calendar_todos`

Data persists across sessions and is automatically saved on every change.

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Safari: ✅ Full support
- Firefox: ✅ Full support

## License

MIT
