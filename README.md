# ⚔️ BitFocus — Gamified Pomodoro Productivity App

BitFocus is a **full-stack productivity application** that transforms your work sessions into an RPG boss-battle experience. Complete tasks using the Pomodoro technique, deal damage to pixel-art monsters, level up, and track your productivity streaks — all backed by a Spring Boot REST API with persistent session logging.

---

## Features

- **Pomodoro Timer** — 25/5/15-minute focus and break cycles with a beautiful animated timer ring
- **Boss Battle System** — Each task spawns a boss with HP calculated from difficulty and estimated sessions; defeating tasks deals visual damage with critical hit effects
- **Quest Log** — Add, prioritize (High / Medium / Low), and track tasks with Pomodoro dots
- **XP & Leveling** — Earn XP per completed session and quest; level up with a persistent progress bar
- **Streak Tracker** — Daily activity streaks displayed in the header
- **Activity Calendar** — GitHub-style heatmap of your focus sessions this month
- **Energy Tracker** — Rate your energy after each session (Drained → Unstoppable)
- **Battle Stats** — Sessions completed, total focus time, bosses defeated, and power score
- **Rank System** — Rookie Hero → Apprentice → Warrior → Champion → Legendary → MYTHIC ⚡
- **Insights Panel** — Auto-generated motivational insights based on your productivity data
- **Customizable Timer** — Edit focus, short break, and long break durations via the ⚙️ Settings menu
- **Particle Background** — Animated ambient particle canvas

---

## Architecture

```
BitFocus-main/
├── backend/                          # Spring Boot application (serves everything)
│   └── src/main/
│       ├── java/com/bitfocus/backend/
│       │   ├── task/                 # Task entity, CRUD, service, controller
│       │   ├── session/              # Focus session lifecycle management
│       │   ├── stats/                # Aggregate productivity statistics
│       │   ├── ml/                   # ML integration service (task analysis)
│       │   ├── game/                 # RPG game logic utilities
│       │   └── views/                # Vaadin views (legacy)
│       └── resources/
│           ├── application.properties
│           └── static/               # Frontend (HTML, CSS, JS, monster.png)
│               ├── index.html
│               ├── script.js
│               ├── styles.css
│               └── monster.png
├── frontend/                         # Legacy standalone frontend
├── ml/                               # ML model/scripts
└── bitfocus/                         # Additional project files
```

**Stack:**
| Layer | Technology |
|-------|-----------|
| Backend | Java 17 + Spring Boot 3.2.5 |
| ORM | Spring Data JPA + Hibernate |
| Database | H2 (in-memory, dev) / MySQL (production) |
| Frontend | Vanilla HTML + CSS + JavaScript |
| Build | Maven |
| UI Framework | Vaadin 24 (integrated) |

---

## Getting Started

### Prerequisites

- **Java 17+**
- **Maven 3.8+**

### Run the Application

```bash
cd backend
mvn spring-boot:run
```

Then open your browser at: **[http://localhost:8080](http://localhost:8080)**

> The app uses an **in-memory H2 database** by default — no database setup required. Data resets on each server restart.

---

## Database

### H2 (Default — Development)

No configuration needed. The H2 console is accessible at:

**[http://localhost:8080/h2-console](http://localhost:8080/h2-console)**

| Field | Value |
|-------|-------|
| JDBC URL | `jdbc:h2:mem:focusflow` |
| Username | `sa` |
| Password | `password` |

### MySQL (Production)

Replace the contents of `application.properties` with:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bitfocus
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```

---

## REST API Reference

### Tasks — `/api/tasks`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | Get all active tasks |
| `GET` | `/api/tasks/all` | Get all tasks (including completed) |
| `GET` | `/api/tasks/{id}` | Get task by ID |
| `POST` | `/api/tasks` | Create a new task |
| `DELETE` | `/api/tasks/{id}` | Delete a task |
| `POST` | `/api/tasks/{id}/pomodoro?completed=true` | Apply a Pomodoro to a task |

**Create Task — Request Body:**
```json
{
  "taskTitle": "Study for exam",
  "taskPriority": 3,
  "estimatedPomodoros": 4
}
```

> Priority: `1` = Low, `2` = Medium, `3` = High

---

### Sessions — `/api/sessions`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/sessions/start` | Start a focus session |
| `POST` | `/api/sessions/end` | End and log a focus session |

**Start Session:**
```json
{ "taskId": 1 }
```

**End Session:**
```json
{
  "sessionId": 42,
  "taskId": 1,
  "endTime": "2025-05-02T20:00:00.000Z",
  "completed": true,
  "interruptionCount": 0,
  "energyLevel": 4
}
```

---

### Stats — `/api/stats`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | Get aggregate productivity statistics |

**Response:**
```json
{
  "totalSessions": 12,
  "totalFocusTime": 18000,
  "productivityScore": 85.5
}
```

---

## How to Play

1. **Add a Quest** — Click `＋ Add` in the Quest Log, name your task, set priority and estimated Pomodoros
2. **Select a Quest** — Click on a task in the quest log to activate it and spawn your boss
3. **Start Focus** — Hit the ▶ play button to begin a 25-minute focus session
4. **Complete Sessions** — Each completed Pomodoro deals damage to the boss
5. **Defeat the Boss** — Complete all Pomodoros for a task to defeat it and earn 120 XP
6. **Take Breaks** — Switch to Short or Long Break mode between sessions
7. **Track Progress** — Watch your level, streak, and battle stats grow over time

---

## Configuration

### Timer Durations (via Settings Modal)

Click the **⚙️** icon in the top-right header to open Settings. You can customize:
- **Focus Duration** (default: 25 min)
- **Short Break** (default: 5 min)
- **Long Break** (default: 15 min)

Settings are saved to localStorage and persist across page refreshes.

---

## Roadmap / Potential Improvements

- [ ] User authentication (Spring Security + sessions)
- [ ] MySQL persistence for production deployment
- [ ] Task deadline reminders and overdue alerts
- [ ] Mobile-responsive layout improvements
- [ ] Boss variety — different monster images per task type
- [ ] Sound effects and background music
- [ ] Weekly/monthly stats dashboards
- [ ] Export focus data as CSV

---

## Dependencies

| Dependency | Version | Purpose |
|-----------|---------|---------|
| Spring Boot | 3.2.5 | Application framework |
| Spring Data JPA | — | Database ORM |
| H2 Database | — | In-memory dev database |
| MySQL Connector/J | — | Production database driver |
| Vaadin | 24.x | UI framework (integrated) |
| canvas-confetti | 1.6.0 | Victory confetti animation (CDN) |
| Google Fonts | — | Cinzel, Orbitron, Nunito typefaces |

---

## Development Notes

- The frontend lives entirely in `src/main/resources/static/` and is served directly by Spring Boot's embedded Tomcat
- `script.js` manages all UI state locally and syncs with the backend via `fetch()` calls on load
- Timer preferences are saved to `localStorage` under the key `fq_state`
- The ML integration (`MLIntegrationService`) attempts to classify tasks by topic/difficulty; falls back to default values gracefully when unavailable

---
