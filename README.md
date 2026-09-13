# LifeQuest ⚔️
### Gamified Time Management & Productivity Management System

> **DO WORK → COMPLETE TASK → EARN XP → LEVEL UP → IMPROVE SKILLS → MAINTAIN STREAK → SEE PROGRESS**

LifeQuest turns real-life personal productivity, habits, and study into an engaging RPG progression system while remaining clean, responsive, and practical for daily workflows.

---

## 🌟 Core Features

1. **User Authentication & Privacy**
   - JWT-based bearer authentication with bcrypt password hashing.
   - User data isolation (every player only accesses their own quests, activities, streaks, and trophies).
   - Fast 1-Click Demo Login (`quest_hero` / `secretpassword123`).

2. **Permanent Task vs. Daily Instance System**
   - Users create tasks once with recurrence rules (One-time, Daily, Weekly, Custom Mon-Sun).
   - Occurrences are generated automatically each day.
   - **Immutable Historical Records**: Past completed work and earned XP are permanently locked and never alter if a task definition is subsequently changed or re-scoped.

3. **Character Level & Exponential XP System**
   - Earn XP from easy (10-25 XP), medium (30-50 XP), hard (60-100 XP), or custom bounties.
   - Character level progression curve: $\text{Level}(XP) = \max\left(1, \left\lfloor (XP / 100)^{1 / 1.5} \right\rfloor + 1\right)$.
   - Dynamic Level-Up celebratory modal with confetti and rank tier advancement.

4. **6-Skill Hexagon Matrix**
   - The 6 canonical skills: **Coding**, **Study**, **Fitness**, **Focus**, **Learning**, and **Time Management**.
   - Completed tasks feed XP directly into their associated attribute.
   - Central interactive Recharts Radar/Hexagon visualization that grows as your real-life skills develop.

5. **Streak System & Rest Day Protection**
   - Current Streak flame counter and Personal Best streak records.
   - **Rest Day Mechanism**: Users can designate selected dates as Rest Days, which preserve active streaks from breaking without requiring work.

6. **Focus Stopwatch & Time Tracking**
   - Live interactive stopwatch with Start, Pause, Resume, and Stop & Save controls.
   - Tracks Planned duration vs. Actual duration and calculates the difference (e.g. `+12 min`).
   - Saves actual productive minutes directly to database telemetry.

7. **Understandable Daily Productivity Score**
   - Simple, explainable metric (0–100%):
     - **60%** from scheduled quest completion rate.
     - **25%** weighted by priority (Urgent/High tasks earn higher weight).
     - **15%** from focus duration adherence.

8. **Daily Missions**
   - Automatically generated from today's active tasks (e.g., "Complete 1 hour of coding", "Complete college study", "Exercise for 30 minutes").
   - Completing all 3 daily objectives rewards a **+100 Bonus XP Bounty**.

9. **Analytics & 52-Week GitHub-Style Heatmap**
   - 12-month (365 days / 52 weeks) activity heatmap with 5 color intensity tiers and Rest Day indicators.
   - Interactive hover tooltips showing date, XP, quests completed, focus time, and productivity score.
   - Daily, Weekly (7-day bar chart & trend line), and Monthly (30-day cumulative progression area chart & skill breakdown) views.

10. **Trophy Hall & Achievements**
    - Initial achievements: *First Step of the Hero*, *Centurion (100 XP)*, *Sevenfold Fire (7-Day Streak)*, *Master of Syntax (10h Coding)*, *Scholar's Dedication (20 Study sessions)*, *Ascended Paragon (Level 10)*, and *Unstoppable Momentum (30 Days)*.
    - Automatic unlocking with celebratory audio/toast alerts and bonus XP.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18 with Vite
  - Tailwind CSS (Cyber/RPG Dark theme)
  - Lucide React icons
  - Recharts (Radar, Area, Bar, and Line charts)
  - Axios with JWT request/response interceptors
  - Canvas Confetti for celebratory level-up effects
  - Responsive design for Desktop, Tablet, and Mobile
- **Backend**:
  - Python 3.13
  - FastAPI
  - Pydantic v2 & Pydantic-Settings
  - SQLAlchemy 2.0 ORM
  - Uvicorn
  - PyJWT & Bcrypt
- **Database**:
  - PostgreSQL (compatible with pgAdmin)
  - Configured with automatic graceful SQLite fallback (`sqlite:///./lifequest.db`) if local PostgreSQL credentials or service are not yet configured.

---

## 🚀 Running the Application

### 1. Start the Backend

```bash
cd backend
# Activate virtual environment
.\.venv\Scripts\Activate.ps1    # or source .venv/bin/activate on Unix

# Run Uvicorn dev server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- API Base URL: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```
- Frontend UI: `http://localhost:5173`

---

## 🔑 Demo Account Credentials

- **Username**: `quest_hero`
- **Password**: `secretpassword123`
*(Or click the "One-Click Demo Login" button on the Sign In page)*
