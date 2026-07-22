# Employee Management System — Setup Guide (Windows 11 + VS Code)

This covers everything: environment setup, dependency installation, MongoDB
Atlas connection, and running the **complete, fully-built** application —
every module (Auth, Employees, Departments, Attendance, Leave, Tasks,
Payroll, Documents, Notifications, Performance, Analytics, Profile) is
already implemented and wired together.
Everything below runs in **PowerShell**, inside **VS Code**, using **npm** only.

---

## 1. Prerequisites (install these first if you haven't)

| Tool | Check if installed | Download |
|---|---|---|
| Node.js (LTS) | `node -v` | https://nodejs.org |
| Git (optional but recommended) | `git --version` | https://git-scm.com |
| VS Code | — | https://code.visualstudio.com |
| MongoDB Atlas account (free tier) | — | https://www.mongodb.com/cloud/atlas |

Open PowerShell and confirm:

```powershell
node -v
npm -v
```

You should see version numbers, not an error.

---

## 2. Project folder structure

```
employee-management-system/
├── backend/
│   ├── config/db.js            # MongoDB Atlas connection
│   ├── controllers/            # 10 controllers — one per module (auth, employee, department,
│   │                           #   attendance, leave, task, payroll, document, notification,
│   │                           #   performance, analytics)
│   ├── middlewares/             # authMiddleware (JWT + roles), uploadMiddleware (Multer),
│   │                           #   validate.js, errorHandler.js
│   ├── models/                  # 10 Mongoose schemas (User, Employee, Department, Attendance,
│   │                           #   Leave, Task, Payroll, Document, Notification, PerformanceReview)
│   ├── routes/                  # matching Express routers, mounted in app.js
│   ├── services/                # emailService.js (Nodemailer), cloudinaryService.js
│   ├── validators/              # express-validator rule sets per module
│   ├── utils/                   # generateToken, asyncHandler, generateEmployeeId
│   ├── uploads/                 # local file storage (documents, generated payslip PDFs)
│   ├── seed.js                  # creates a ready-to-use admin + sample employee
│   ├── app.js / server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/          # Sidebar, Topbar, ProtectedRoute, StatCard, Badge, Modal, Loader
    │   ├── pages/                # Login, Register, Forgot/Reset Password, Dashboard, Employees,
    │   │                        #   Departments, Attendance, Leaves, Tasks, Payroll, Performance, Profile
    │   ├── layouts/DashboardLayout.jsx
    │   ├── redux/
    │   │   ├── store.js
    │   │   └── slices/           # one slice per module, all using createAsyncThunk + Axios
    │   ├── services/api.js       # Axios instance with JWT auto-attached
    │   ├── App.jsx                # full route tree with role-based protected routes
    │   └── main.jsx
    ├── tailwind.config.js
    ├── package.json
    └── .env.example
```

---

## 3. Install dependencies

Open the project folder in VS Code (`code .` from inside `employee-management-system`), then open a PowerShell terminal (**Terminal → New Terminal**) and run:

### Backend

```powershell
cd backend
npm install
```

### Frontend

```powershell
cd ..\frontend
npm install
```

> Note for Windows: `bcryptjs` (not `bcrypt`) is used deliberately — it's pure JavaScript, so it installs cleanly on Windows without needing native build tools.

---

## 4. Set up MongoDB Atlas (your cloud database)

1. Go to https://cloud.mongodb.com and sign in / sign up.
2. Click **Build a Database** → choose the **free M0** tier.
3. Pick any cloud provider/region close to you → **Create**.
4. Under **Security → Database Access**: create a database user (username + password). Save these — you'll need them.
5. Under **Security → Network Access**: click **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) for local development.
6. Go to **Database → Connect → Drivers**, copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<username>` and `<password>` with your real credentials, and add a database name before the `?` (e.g. `/ems?`).

---

## 5. Configure environment variables

### Backend

```powershell
cd backend
copy .env.example .env
```

Open `.env` in VS Code and paste in your real `MONGO_URI` from step 4. Also set a `JWT_SECRET` (any long random string).

### Frontend

```powershell
cd ..\frontend
copy .env.example .env
```

Leave `VITE_API_BASE_URL` as `http://localhost:5000/api` for local development.

---

## 6. Seed a ready-to-use admin account (recommended first step)

Instead of manually editing the database to create your first admin, run:

```powershell
cd backend
npm run seed
```

This creates:
- **Admin:** `admin@ems.com` / `admin123`
- **Sample employee:** `employee@ems.com` / `employee123` (in a sample "Engineering" department)

You can re-run this safely — it skips creating accounts that already exist.

---

## 7. Run the project

Open **two** PowerShell terminals in VS Code (use the `+` icon to split).

**Terminal 1 — Backend:**
```powershell
cd backend
npm run dev
```
You should see `MongoDB Atlas connected: ...` and `Server running ... on port 5000`.

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm run dev
```
Vite will print a local URL, usually `http://localhost:5173`.

### Quick test

Visit `http://localhost:5000/api/health` in your browser — you should see:
```json
{ "success": true, "message": "EMS API is running" }
```

Visit `http://localhost:5173` and log in with the admin account from step 6.
You should land on a full analytics dashboard with sidebar navigation to
Employees, Departments, Attendance, Leaves, Tasks, Payroll, Performance, and
Profile — every module is live and connected to your MongoDB Atlas database.

---

## 8. Everything is built — what to try first

1. **Log in as admin** → go to **Departments** → add one or two departments.
2. Go to **Employees** → add a new employee (this creates both their login
   account and their HR profile in one step).
3. **Log out, log in as that new employee** (password defaults to
   `changeme123` unless you set one) → check in on the **Attendance** page,
   apply for **Leave**, view **Tasks**, upload a document on **Profile**.
4. **Log back in as admin** → approve the leave request, assign a task,
   generate a payslip (downloadable as a real PDF) on **Payroll**, and leave a
   **Performance** review.
5. Check the **Dashboard** — the charts and stat cards update live from your
   real data.

If anything doesn't behave as expected, tell your project partner what you
see (screenshot of the browser console or the backend terminal helps) and
we'll debug it together.

