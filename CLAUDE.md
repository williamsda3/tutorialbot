# CLAUDE.md — Portfolio Project Mentor

## Project Overview

An AI-powered portfolio project mentor that guides users from "I need a portfolio" to a finished, deployed, interview-ready project. It adapts to who the user is, what roles they're targeting, their experience level, and how much they know.

This is NOT a course platform or a template library. It's a personalized mentorship experience powered by the Claude API, with dynamic project generation, screenshot-based feedback, and persistent progress tracking.

## Core User Flow

### Phase 1 — Discovery (Light Conversational)

A short chat (3-5 exchanges) that gathers:

- **Target role** — What job are they going after? (Data analyst, frontend dev, full-stack engineer, ML engineer, etc.)
- **Industry interest** — Healthcare, finance, e-commerce, gaming, etc. This flavors the project theme.
- **Current skills & tools** — What languages, frameworks, and tools have they actually used? Not what they've "learned" — what they've built with.
- **Experience level** — Have they built anything from scratch before? Completed tutorials? Shipped to production? This is nuanced, not just beginner/intermediate/advanced.
- **Comfort zone preference** — Do they want something achievable and confidence-building, or something that stretches them? This single question dramatically changes recommendations.

This creates a **user profile** that persists, can be edited later, and carries context into all future interactions.

Discovery should feel like talking to a knowledgeable friend, NOT filling out a form. The bot asks naturally, responds to what they say, and infers where possible rather than interrogating.

### Phase 2 — Project Recommendations (Dynamically Generated)

Based on the discovery profile, generate 2-3 tailored project ideas. Each recommendation includes:

- **Project title** — Specific and descriptive
- **One-sentence pitch** — Why this project fits their goals
- **Skills demonstrated** — What an interviewer will see
- **Dataset or tech stack** — What they'll work with
- **Final deliverable** — What the finished product looks like
- **Estimated timeline** — Realistic for their skill level
- **Difficulty calibration** — Appropriate to their experience and comfort preference

Projects must be:
- Achievable at the user's level (beginners get beginner projects, not watered-down advanced ones)
- Relevant to their target role and industry
- Interesting enough to sustain motivation
- Demonstrative of skills that actually matter for the role they want

The user picks a project or asks for more options.

### Phase 3 — Guided Build (Step-by-Step Mentorship)

Once a project is selected, dynamically generate a full step-by-step plan. The structure follows a consistent pattern but content is fully customized:

**For data/analytics projects:**
1. Environment Setup & Data Download
2. Data Cleaning & Preparation
3. Exploratory Data Analysis
4. Deep-Dive Analysis
5. Dashboard / Visualization
6. Stakeholder Summary / Write-Up
7. Polish & Publish (GitHub, README, interview prep)

**For programming projects:**
1. Environment Setup & Project Scaffold
2. Architecture & Design Decisions
3. Core Feature Build
4. Additional Features & Polish
5. Testing & Error Handling
6. Deployment
7. Documentation & Publish (GitHub, README, demo, interview prep)

Each step includes:
- Clear explanation of what to do and why
- Code snippets / starter code calibrated to skill level
- Practical tips and common pitfalls
- Checkpoint criteria — how to know when the step is done
- Quick-action suggestions to keep momentum

## Supported Project Types

### Data & Analytics
- Exploratory data analysis (EDA) projects
- Interactive dashboards (Tableau, Power BI, Streamlit)
- SQL analysis projects
- A/B testing and statistical analysis
- Data pipeline / ETL projects

### Frontend / UI
- Landing pages and portfolio sites
- React/Vue component libraries
- Browser-based games or interactive tools
- Dashboard UIs

### Full-Stack
- CRUD applications
- Real-time apps (chat, collaboration)
- API + frontend integration projects
- Auth and user management

### Backend / API
- REST and GraphQL APIs
- CLI tools
- Microservices
- Database design projects

### ML / AI
- Model training and evaluation
- Data pipelines for ML
- Model deployment and inference endpoints
- AI-powered applications

### Mobile
- React Native or Flutter apps
- Cross-platform projects

## Experience Level Adaptation

The bot adapts along multiple dimensions based on user experience:

### Beginners
- **Steps are smaller and more granular** — don't assume knowledge
- **Explanations include the "why"** — not just what to do but why it matters
- **Code snippets are more complete** — closer to copy-paste with explanation
- **Tone is encouraging** — normalize getting stuck, celebrate small wins
- **Projects have clear, achievable scope** — visible results early, room to extend
- **Datasets are clean** — no messy data wrangling as a first step
- **Tech stacks are well-documented** — popular frameworks with good community support
- **Check-ins are more frequent** — "how's it going?" after each step

### Intermediate
- **Steps are standard granularity** — assume basic competence
- **Explanations focus on best practices** — not just working code but good code
- **Code snippets are partial** — show the pattern, let them implement
- **Tone is collaborative** — peer-to-peer, not teacher-student
- **Projects have moderate scope** — some ambiguity to work through
- **Encourage their own design decisions** — multiple valid approaches

### Advanced
- **Steps are high-level** — describe outcomes, not procedures
- **Guidance focuses on architecture, trade-offs, and polish**
- **Code snippets are minimal** — pseudocode or patterns only
- **Tone is direct** — focus on the "so what" and interview positioning
- **Projects are ambitious** — real complexity, production considerations
- **Push on edge cases** — what happens at scale, under failure, with bad input

## Screenshot Review Feature

Users can upload screenshots via:
- File picker (📎 button)
- Drag and drop into the chat area
- Paste from clipboard (Ctrl/Cmd+V)

Up to 4 images per message. Images are sent to Claude's vision API with project-aware context.

### What the bot evaluates based on screenshot type:

- **Code screenshot** — Check for errors, suggest improvements, evaluate style and readability
- **Chart / visualization** — Evaluate clarity, labeling, color choices, what insight it communicates, design polish
- **Dashboard** — Evaluate layout, information hierarchy, filter design, overall story
- **Error / terminal output** — Help debug, explain what went wrong, suggest fixes
- **Running application UI** — Give UX feedback, check responsiveness, suggest improvements
- **GitHub repo / README** — Evaluate structure, documentation quality, presentation

The bot always relates feedback back to the specific project and current step.

## Persistence Requirements

### User Profile
- Discovery answers (target role, skills, experience, preferences)
- Editable after creation
- Persists across sessions
- Informs all future interactions and recommendations

### Projects
- Users can have multiple projects (concurrent or sequential)
- Each project stores:
  - Project definition (title, description, generated plan)
  - Current step
  - Full conversation history per step (including screenshot feedback)
  - Decisions made and context discussed
  - Completion status per step
- When returning to a project, the bot references previous context: "Last time you were working on the correlation heatmap and I suggested better axis labels — how did that go?"

### Chat History
- Full message history per project, including images
- Conversation context carries forward within a project
- Recent history (last ~6 messages) sent to Claude API for context
- Older history summarized or available for reference

## Tech Stack Decisions

These are recommendations — adjust based on what makes sense as you build:

- **Frontend**: React (you're comfortable with it, component-based works well for the chat UI, sidebar, progress tracking)
- **Backend**: Node.js with Express or Fastify
- **Database**: PostgreSQL or SQLite for persistence (user profiles, projects, progress, chat history)
- **AI**: Claude API (Sonnet for most interactions, vision for screenshot review)
- **Auth**: TBD — could start simple (email/password or just a name entry) and add OAuth later
- **Deployment**: TBD — Vercel/Netlify for frontend, Railway/Fly.io for backend, or self-hosted via Cloudflare Tunnel during dev
- **File Storage**: Uploaded images need to be stored if chat history persists — could use S3/R2 or base64 in database for small volumes

## API & Cost Considerations

Every message hits the Claude API. Image analysis is more expensive than text-only.

Strategies to manage cost:
- Cache step content that doesn't need dynamic generation (the pre-built responses for common questions)
- Use a hybrid approach: pre-built responses for predictable interactions (step walkthroughs, common questions), API calls for dynamic responses (screenshot review, custom questions, project generation)
- Consider rate limiting or message caps for free tier
- Conversation history sent to API should be trimmed to recent context (last ~6 messages) plus a system-level summary of older context

## System Prompt Architecture

The system prompt is the product's secret weapon. It needs to be layered:

**Base layer** — Always present. Defines the bot's role, tone, and formatting rules (HTML output, practical focus, concise responses).

**User profile layer** — Injected from persistence. The user's target role, skills, experience level, comfort preference. Changes how the bot communicates and what it assumes.

**Project layer** — Injected when in a guided build. The full project plan, current step, what's been completed, key decisions made. Keeps the bot contextually aware.

**Step layer** — Specific instructions for the current step. What to cover, what code to provide, what to evaluate if screenshots are shared.

The quality of these prompts IS the product. Invest heavily in prompt engineering. Test with real users at different skill levels. Iterate constantly.

## Key Design Principles

1. **Ship over perfect** — A finished beginner project beats an abandoned advanced one. The bot should reinforce this constantly.
2. **Show, don't tell** — Code snippets, visual examples, and concrete feedback over abstract advice.
3. **Motivation is a feature** — The progress tracking, encouraging tone for beginners, and celebration of milestones aren't nice-to-haves. They're core to people actually finishing.
4. **Interview-ready is the bar** — Every piece of guidance should be filtered through "can they talk about this in an interview?" If they can't explain it, they shouldn't ship it.
5. **The bot is a mentor, not a crutch** — Give enough to unblock, make them do the thinking. The sweet spot between "here's what to do next, figure it out" and "here's the exact code to copy."

## File Structure (Suggested)

```
/
├── CLAUDE.md                  # This file
├── README.md                  # Public-facing project description
├── package.json
├── .env                       # API keys, database URL
│
├── /client                    # Frontend
│   ├── /src
│   │   ├── /components
│   │   │   ├── Chat.jsx             # Main chat interface
│   │   │   ├── MessageBubble.jsx    # Individual messages (text + images)
│   │   │   ├── ImageUpload.jsx      # Upload, drag-drop, paste handling
│   │   │   ├── ImagePreview.jsx     # Preview bar before sending
│   │   │   ├── Sidebar.jsx          # Step navigation + progress
│   │   │   ├── ProgressTracker.jsx  # Progress bar and step indicators
│   │   │   ├── QuickActions.jsx     # Clickable suggestion buttons
│   │   │   ├── ProjectSelector.jsx  # Phase 2 — pick a project
│   │   │   └── DiscoveryChat.jsx    # Phase 1 — onboarding conversation
│   │   ├── /pages
│   │   │   ├── Home.jsx             # Landing / dashboard — see projects
│   │   │   ├── Discovery.jsx        # New user onboarding
│   │   │   └── Project.jsx          # Active project workspace
│   │   ├── /hooks
│   │   │   ├── useChat.js           # Chat state management
│   │   │   ├── useProject.js        # Project state and progress
│   │   │   └── useProfile.js        # User profile management
│   │   ├── /utils
│   │   │   ├── api.js               # Backend API calls
│   │   │   └── imageUtils.js        # Base64 conversion, resize, etc.
│   │   └── App.jsx
│   └── index.html
│
├── /server                    # Backend
│   ├── index.js               # Express/Fastify entry
│   ├── /routes
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── profile.js         # User profile CRUD
│   │   ├── projects.js        # Project CRUD and progress
│   │   ├── chat.js            # Chat history and message handling
│   │   └── ai.js              # Claude API proxy (keeps API key server-side)
│   ├── /services
│   │   ├── claude.js          # Claude API integration (text + vision)
│   │   ├── projectGenerator.js # Dynamic project plan generation
│   │   └── promptBuilder.js   # System prompt assembly (base + profile + project + step layers)
│   ├── /models
│   │   ├── User.js            # User profile schema
│   │   ├── Project.js         # Project definition + progress schema
│   │   └── Message.js         # Chat message schema (text + image refs)
│   └── /db
│       ├── setup.js           # Database initialization
│       └── migrations/        # Schema migrations
│
└── /prompts                   # System prompt templates
    ├── base.md                # Core bot identity and rules
    ├── discovery.md           # Phase 1 discovery conversation prompts
    ├── recommendation.md      # Phase 2 project generation prompts
    ├── guided-data.md         # Phase 3 template for data projects
    ├── guided-frontend.md     # Phase 3 template for frontend projects
    ├── guided-fullstack.md    # Phase 3 template for full-stack projects
    ├── guided-backend.md      # Phase 3 template for backend projects
    ├── guided-ml.md           # Phase 3 template for ML projects
    └── screenshot-review.md   # Screenshot evaluation prompts by type
```

## Current State

A working prototype exists as a single HTML file with:
- ✅ Chat interface with sidebar step navigation
- ✅ Pre-built step content for one project (Sleep Quality Analysis)
- ✅ Quick-action buttons for common questions
- ✅ Claude API integration for dynamic responses
- ✅ Image upload (file picker, drag-drop, clipboard paste)
- ✅ Image preview before sending with remove functionality
- ✅ Image lightbox for viewing full-size
- ✅ Vision API integration for screenshot analysis
- ✅ Progress bar and step tracking
- ✅ Typing indicators and smooth animations

Needs to be built:
- ⬜ Phase 1 — Discovery conversation flow
- ⬜ Phase 2 — Dynamic project recommendation and generation
- ⬜ User authentication
- ⬜ Backend API (Claude proxy, persistence)
- ⬜ Database (user profiles, projects, chat history, images)
- ⬜ User profile persistence and editing
- ⬜ Multiple concurrent projects per user
- ⬜ Dynamic step-by-step plan generation (not just pre-built content)
- ⬜ Experience-level adaptation in bot responses
- ⬜ Context carryover between sessions ("last time you were working on...")
- ⬜ Programming project support (frontend, full-stack, backend, ML, mobile)
- ⬜ Project completion and "next project" flow
- ⬜ Landing page / marketing site
- ⬜ Deployment pipeline

## Development Priorities (Suggested Order)

1. **Break the HTML prototype into a React app** with proper component structure
2. **Build the backend** with Express, database setup, and Claude API proxy
3. **Implement auth and user profiles** — simplest viable approach first
4. **Build the discovery flow** (Phase 1) — this gates everything else
5. **Build dynamic project generation** (Phase 2) — the prompt engineering here is critical
6. **Generalize the guided build** (Phase 3) — make it work off dynamically generated plans instead of hardcoded content
7. **Add programming project support** — new prompt templates, different step structures
8. **Polish persistence** — context carryover, session resumption, multi-project management
9. **Deploy and test with real users**
10. **Iterate on prompt quality** — this never stops