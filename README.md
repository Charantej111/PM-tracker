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
   - Secure authentication and persistence powered by **Supabase**.
   - Cloud database synchronization for all learning goals, projects, notes, and skills.
   - Automatic theme detection and profile settings sync.

2. **Core Dashboard**
   - **Daily Streak Tracker**: Tracks consecutive days studied; tracks activity log and grows dynamically upon daily check-in.
   - **Activity Heatmap**: Tracks study frequency logs over the year.
   - **Achievements Grid**: Unlocks milestone badges (e.g. 7-day, 14-day streaks, completed projects) which dynamically appear in the user profile page.
   - **Generic Goals System**: Supports custom Goal Titles, Target Values, Current Values, and custom units (e.g. `Hours`, `Projects`, `%`). Automatically derives progress percentages and remaining units.

3. **Projects Kanban Board**
   - Drag-and-drop columns (`To Do`, `In Progress`, `Completed`).
   - Project creation, editing, and deletion modals.
   - Supports external normalized project links.
   - Local draft note editing with a safe **Save** button (decoupled from live typing to avoid keystroke lag).

4. **Interactive Career Calendar**
   - Complete scheduling board supporting event creation, deletion, dragging, and completion marking.
   - Local timezone-safe date-formatting (`formatDateKey`) mapping.

5. **Rich-Text Notes**
   - Searchable, tagged rich-text workspace with editor commands (Bold, Italic, Bullet Lists).
   - Wrapped inside a sandbox `NotesErrorBoundary` to keep the rest of the application dashboard stable in case of DOM manipulation errors.
   - Decoupled react-state rendering for latency-free typing.

6. **Roadmap & Skills Self-Assessment**
   - **Hierarchical Roadmap**: Manage custom learning pathways using nested **Main Topics** and **Sub-topics** with support for drag-and-drop sorting (powered by `@dnd-kit`).
   - **Progress & Tracking**: Set priorities, estimate study hours, write topic-specific rich notes, and mark topics complete.
   - **Competency Ratings**: Rate and track competency levels (from Beginner to Expert) with responsive progress feedback.

7. **Resources Library**
   - Bookmark-ready grid supporting custom course links (YouTube, Coursera, LinkedIn Learning).
   - Category filtering and complete resource CRUD operations.

---

## 🛠️ Quality Improvements & Architectural Reliability

1. **URL Normalization & Safe Links**
   - Unified `normalizeUrl(url)` helper automatically corrects input formats (e.g. prepends `https://` if missing).
   - External links (in Projects and Resources) safely render with `target="_blank" rel="noopener noreferrer"` targets, displaying conditional link buttons only if a link is provided.

2. **Weekly Reflections Schema Mapping**
   - Centralized mapping via `formatReviewReflection(review)` bridges old and new DB structures (`wins`/`learned`, `challenges`/`challenge`, `improvements`/`improved`, `next_focus`/`focusNextWeek`).
   - The Weekly Review card and PDF report render identical reflection layouts.
   - Key metrics are derived dynamically from active stats.

3. **Optimistic Database Sync & Rollbacks**
   - Subtopic updates under `updateSubTopic()` calculate a single normalized payload upfront, applying the exact same payload to React state and Supabase queries.
   - State rollbacks are triggered on API failure to restore the pre-update state, preventing data synchronization drift.

4. **High-Resolution PDF Report Engine**
   - Modern Executive Summary layout with dynamic Insights, Recommendations, and vector-drawn progress bars.
   - **Vector Chart Legend**: Computes total counts and percentages dynamically below the project status donut chart.
   - **Empty State**: Hides chart components if zero projects exist and prints `"No project data available for visualization."` cleanly instead.

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
│   │   └── ReportCharts.jsx    # Custom SVG analytics charts
│   ├── components/             # Reusable UI (Buttons, Cards, PageShell, Inputs, etc.)
│   ├── context/
│   │   ├── AppContext.jsx      # Global React Context provider & state handlers
│   │   └── AuthContext.jsx     # Supabase Authentication context
│   ├── data/
│   │   ├── db.js               # Supabase database query methods
│   │   └── defaultData.js      # Initial user database state schema
│   ├── layouts/
│   │   └── AppLayout.jsx       # Standard dashboard shell (Sidebar, Header, Main Outlet)
│   ├── pages/                  # All page containers (Dashboard, Projects, Calendar, Notes...)
│   └── utils/
│       ├── helpers.js          # Helper utilities (Date utilities, tag-parsers, normalization)
├── netlify.toml                # Netlify SPA redirect rewrites config
├── tailwind.config.js          # Tailwind styling overrides
└── package.json                # Project dependencies and script runner configurations
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation
1. Clone the repository and install the dependencies:
```bash
npm install
```

2. Set up your Supabase environment variables in a `.env` file at the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Locally (Development)
Start the local Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Run via Docker (Alternative)
A `Dockerfile` and `docker-compose.yml` are provided for containerized local development.

1. Build and start the services in the background:
   ```bash
   docker compose up -d
   ```
2. The application will be accessible at `http://localhost:5173`.
3. To stop and clean up the containers:
   ```bash
   docker compose down
   ```

### Build for Production
To build the optimized static asset bundle:
```bash
npm run build
```
The output files will be built inside the `/dist` directory, ready to be served.

---

## 🌐 Netlify Deployment
This application requires all routes to rewrite to `/index.html` so client-side routing works smoothly. The repo is configured out-of-the-box using two fallbacks:
- `netlify.toml` at the project root.
- `public/_redirects` copied directly into the `/dist` output folder.
