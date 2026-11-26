# LifeQuest ⚔️
### Gamified Time Management & Productivity Progression System

> **DO WORK → COMPLETE QUEST → EARN XP → LEVEL UP → SHAPE RADAR POLYGON → MAINTAIN STREAK → SEE PROGRESS**

LifeQuest is a modern, responsive full-stack productivity web and mobile platform that turns everyday study sessions, habits, and tasks into an engaging Role-Playing Game (RPG). Built with **React 18 + Vite**, **FastAPI (Python)**, **MySQL & SQLite dual-engine**, and **Capacitor for Android Mobile Deployment**.

---

## 🌟 Core Features & Enhancements

### 1. 🛡️ Role-Based Access Control (RBAC) & Admin Dashboard
- **Role System**: Distinguishes between regular `user` and `admin` roles.
- **Sole Master Admin**: Pre-configured account for `parth` with exclusive administrative powers.
- **System Telemetry KPIs**: Administrators can view real-time system stats (total users, active accounts, completed quests, system study hours, total XP generated).
- **User Moderation**: Search, paginate, toggle user activation (deactivate/activate), update user roles, and reset progress.
- **Safety Guards**: Prevents administrators from accidentally deactivating or revoking their own admin privileges.

### 2. 🔮 Fully Customizable Skill System & Dynamic Polygon Radar
- **Arbitrary Skill Definitions**: Users are not limited to fixed categories. Add, rename, edit, toggle (active/inactive), and delete custom skills with 10 custom colors and 14 icons.
- **Dynamic $N$-Sided Polygon Radar**: Uses SVG math and Recharts to adapt the skill radar shape to the exact number of active skills:
  - $N=2$: Dual-axis balance indicator
  - $N=3$: Equilateral Triangle
  - $N=4$: Square / Diamond
  - $N=5$: Pentagon
  - $N=6$: Hexagon
  - $N=7$: Heptagon
  - $N=8+$: Octagon Matrix
- **Data Preservation**: Deleting a skill preserves all task definitions (`ondelete="SET NULL"`), and historical completed XP remains permanently immutable.

### 3. 🌙 Cyber-RPG Dark Mode & ☀️ Clean Light Mode
- **Dual Visual Themes**: Instant toggle between an immersive Cyber-RPG Dark theme and a high-contrast Clean Light theme.
- **Persistent Preference**: Synced with browser `localStorage`.
- **Theme-Adaptive Visuals**: Glassmorphic cards, custom scrollbars, and radar charts seamlessly adapt their color schemes to the active theme.

### 4. 🔥 Burnout-Free Streak System & Weekly Rest Day Limit
- **Passive Streak Decay**: If days pass without completing tasks or logging valid rest days, the streak automatically decays and resets to `0`.
- **Weekly Rest Day Limit**: Users can take a **maximum of 3 Rest Days per calendar week** (Monday to Sunday) to protect their streak during illness or planned recovery. Exceeding 3 rest days will break the streak.
- **Streak in Danger Banner**: Displays an urgent countdown to midnight (~X hours left) on the dashboard when an active streak is at risk.

### 5. 📱 Android Mobile App (Capacitor) & Push Notifications
- **Android APK Container**: Wrapped using **Capacitor** (`io.lifequest.app`) with native Android configuration in `frontend/android/`.
- **Cloud APK Builder**: Automated GitHub Actions workflow (`.github/workflows/build_apk.yml`) to compile and download `app-debug.apk` directly from GitHub.
- **Scheduled Mobile Alarms**:
  - **9:00 AM Daily**: *"⚔️ LifeQuest: New Daily Quests Available!"*
  - **8:00 PM Daily**: *"🔥 Streak in Danger!"* (Less than 4 hours left before midnight).
- **Haptic Feedback**: Physical phone vibration on quest completion and level-ups.
- **Persistent Desktop Notifications**: Browser desktop popups with `requireInteraction: true` (stays on screen over other apps until dismissed) and an audible Web Audio chime 🔊.
- **Navbar Notification Bell**: Real-time notification drawer with unread badge counter.

### 6. ⏱️ Focus Stopwatch & Time Adherence Telemetry
- Integrated stopwatch tracking Planned duration vs. Actual duration ($\Delta t = t_{\text{actual}} - t_{\text{planned}}$).
- Logs focus minutes directly to database telemetry.

### 7. 🎯 52-Week Activity Heatmap & Analytics
- 12-month GitHub-style productivity heatmap with 5 color intensity tiers and Rest Day indicators.
- Daily, Weekly (7-day trend line), and Monthly progression views.
- Explainable daily productivity score (0–100%) based on completion rate, priority weighting, and focus time.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS (Dark/Light), Recharts, Lucide React, Axios, Canvas Confetti |
| **Mobile App** | Capacitor 8 (Android Studio / Gradle Container), Local Notifications, Haptics |
| **Backend** | Python 3.11+, FastAPI (ASGI / Starlette), Uvicorn, Pydantic v2 |
| **ORM & Databases** | SQLAlchemy 2.0 ORM with **Dual-Engine Architecture**: <br>• **Primary:** MySQL (port 3306 via PyMySQL) <br>• **Fallback:** SQLite 3 (`lifequest.db`) with zero configuration |
| **Security** | JWT (HMAC-SHA256) Bearer Authentication & Bcrypt password hashing |
| **CI / CD** | GitHub Actions (Cloud Android APK Compilation) |

---

## 🔑 Login & Account Credentials

### 🛡️ Master Admin Account
- **Username / Email**: `parth` / `parthgupta1001pg@gmail.com`
- **Password**: `P@rth1028`
- **Access**: Full platform access + dedicated **Admin Panel** for user management & telemetry KPIs.

### 🎮 Demo / Trial User Account
- **Username / Email**: `quest_hero` / `hero@lifequest.io`
- **Password**: `demo123`
- **Access**: Standard user permissions with pre-populated tasks, custom skills, and Level 3 XP (no admin access).
- *(Or click the **"One-Click Demo Login"** button on the Sign In page).*

---

## 🚀 Running the Project Locally

### 1. Automatic 1-Click Launch (Recommended)
Double-click **`start_anywhere.bat`** (or in VS Code, press `Ctrl + Shift + P` → `Tasks: Run Task` → `Launch LifeQuest (Full Stack)`).

### 2. Manual Startup

#### Backend (FastAPI):
```bash
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- API Base URL: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

#### Frontend (React + Vite):
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 📱 Building the Android Mobile App (.apk)

### Option A: Cloud Build via GitHub Actions (Zero Local Software Needed)
1. Push to branch `main` on GitHub.
2. Go to the **Actions** tab on your GitHub repository.
3. Click the completed **"Build Android APK"** run.
4. Download the **`LifeQuest-Android-APK`** artifact zip containing `app-debug.apk`!

### Option B: Local Android Studio Build
1. Open **Android Studio**.
2. Select **Open Project** → choose `frontend/android`.
3. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
