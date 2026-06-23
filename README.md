# PM Career OS 🚀

**PM Career OS** is a premium, feature-rich personal workspace designed specifically for Product Managers. It provides a central hub to manage learning goals, self-assess core skills, track portfolio projects via a Kanban board, schedule career milestones on an interactive calendar, organize rich-text notes, and save external study resources.

---

## 🎨 Design & Aesthetic System
The interface is crafted around a premium **white and royal blue** SaaS aesthetic, supporting unified **Light and Dark Modes**:
- **Palette**: Harmonious slate/blue gradients, subtle borders, and vivid blue accent highlights.
- **Animations**: Fluid, premium slide-in modals and category transitions powered by **Framer Motion**.
- **Interactive UI**: Micro-interactions, hover scaling, dynamic progress rings, and Duolingo-style milestone celebrations.

---

## 🚀 Key Features

1. **Authentication & Persistence**
   - Client-side signup and login with persistence powered by `localStorage`.
   - Automatic theme detection and settings sync.
   - Profile-based account data import/export as JSON.

2. **Core Dashboard**
   - **Daily Streak Tracker**: Tracks consecutive days studied; starts at `0` and grows dynamically upon daily check-in.
   - **Activity Heatmap**: Tracks study frequency logs over the year.
   - **Achievements Grid**: Unlocks milestone badges (e.g. 7-day, 14-day streaks, completed projects) which dynamically appear in the user profile page.
   - **Motivation Widget**: Shows daily target metrics.

3. **Projects Kanban Board**
   - Drag-and-drop columns (`To Do`, `In Progress`, `Completed`).
   - Project creation, editing, and deletion modals.
   - local draft note editing with a safe **Save** button (decoupled from live typing to avoid keystroke lag).

4. **Interactive Career Calendar**
   - Complete scheduling board supporting event creation, deletion, dragging, and completion marking.
   - Local timezone-safe date-formatting (`formatDateKey`) mapping.

5. **Rich-Text Notes**
   - Searchable, tagged rich-text workspace with editor commands (Bold, Italic, Bullet Lists).
   - Wrapped inside a sandbox `NotesErrorBoundary` to keep the rest of the application dashboard stable in case of DOM manipulation errors.
   - Decoupled react-state rendering for latency-free typing.

6. **Roadmap & Skills Self-Assessment**
   - Mapped checklist categories for key PM knowledge areas (Analytics, Strategy, Technical, UX, etc.).
   - Interactive competency sliders to rate and track skill level gains.

7. **Resources Library**
   - Bookmark-ready grid supporting custom course links (YouTube, Coursera, LinkedIn Learning).
   - Category filtering and complete resource CRUD operations.

---

## 📁 Repository Structure

```text
├── public/
│   └── _redirects              # Netlify client-side routing fallback rule
├── src/
│   ├── App.jsx                 # Routing config, Protected Routes, Global Modals
│   ├── main.jsx                # Application root with context & error boundaries
│   ├── index.css               # Global tailwind tokens and Light/Dark CSS variables
│   ├── charts/
│   │   └── AnalyticsCharts.jsx # Custom SVG analytics charts
│   ├── components/             # Reusable UI (Buttons, Cards, PageShell, Inputs, etc.)
│   ├── context/
│   │   └── AppContext.jsx      # Global React Context provider & state handlers
│   ├── data/
│   │   └── defaultData.js      # Initial user database state schema
│   ├── hooks/
│   │   └── useLocalStorage.js  # State sync with browser localStorage
│   ├── layouts/
│   │   └── AppLayout.jsx       # Standard dashboard shell (Sidebar, Header, Main Outlet)
│   ├── pages/                  # All page containers (Dashboard, Projects, Calendar, Notes...)
│   └── utils/
│       └── helpers.js          # Helper utilities (Date utilities, tag parsers, initials)
├── netlify.toml                # Netlify SPA redirect rewrites config
├── tailwind.config.js          # Tailwind styling overrides
└── package.json                # Project dependencies and script runner configurations
```

---

## 🛠️ Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation
Clone the repository and install the dependencies using `pnpm` (or `npm`/`yarn`):
```bash
pnpm install
```

### Run Locally (Development)
Start the local Vite development server:
```bash
pnpm dev
```
Open your browser and navigate to `http://localhost:5173`.

### Build for Production
To build the optimized static asset bundle:
```bash
pnpm build
```
The output files will be built inside the `/dist` directory, ready to be served.

---

## 🌐 Netlify Deployment
This application requires all routes to rewrite to `/index.html` so client-side routing works smoothly. The repo is configured out-of-the-box using two fallbacks:
- `netlify.toml` at the project root.
- `public/_redirects` copied directly into the `/dist` output folder.
