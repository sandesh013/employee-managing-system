# Employee Management System (MERN Stack)

A full role-based HRMS: Admin, HR, Manager, and Employee dashboards, built on
the MERN stack (MongoDB, Express, React, Node.js).

**Start here → [SETUP.md](./SETUP.md)** for Windows/PowerShell/VS Code setup,
dependency installation, MongoDB Atlas connection, and how to run the project.

## Stack
- Frontend: React 19 + Vite + Tailwind CSS + Redux Toolkit + React Router + Chart.js
- Backend: Node.js + Express + MongoDB (Atlas) + JWT + Multer + PDFKit + Nodemailer
- Deployment (later): Vercel (frontend), Render (backend)

## What's implemented
All 12 modules from the original brief are built and wired end-to-end:

| Module | Backend API | Frontend page |
|---|---|---|
| Authentication (JWT, register, login, forgot/reset password, roles) | ✅ | ✅ |
| Employees (CRUD, linked login accounts) | ✅ | ✅ |
| Departments (CRUD, employee counts) | ✅ | ✅ |
| Attendance (check-in/out, working hours, late/half-day detection) | ✅ | ✅ |
| Leave (apply, approve/reject) | ✅ | ✅ |
| Tasks (assign, status updates) | ✅ | ✅ |
| Payroll (generate payslip, PDF download) | ✅ | ✅ |
| Documents (upload/download/delete, Cloudinary-ready) | ✅ | ✅ (via Profile page) |
| Notifications (in-app, auto-created on key actions) | ✅ | ✅ (topbar bell) |
| Performance reviews (rating + comments) | ✅ | ✅ |
| Analytics (dashboard stats + charts) | ✅ | ✅ |
| Profile (personal details, emergency contact, documents) | ✅ | ✅ |

Role-based access is enforced on the backend (middleware) as well as the
frontend (sidebar links + protected routes), so it's consistent regardless of
which side you check.

## Quick start (after following SETUP.md)

```powershell
cd backend
npm run seed   # creates a ready-to-use admin + sample employee account
npm run dev
```
```powershell
cd frontend
npm run dev
```

Log in with:
- **Admin:** `admin@ems.com` / `admin123`
- **Sample employee:** `employee@ems.com` / `employee123`

Or register your own account from the Login page (self-registration always
creates an `employee` role account with a linked employee profile).

## Advanced features (added on top of the 12 core modules)

| Feature | What it does | Where to find it |
|---|---|---|
| **Geo-Location Attendance** | Captures your browser-reported location at check-in/check-out and stores it with the attendance record. Admin/HR/Manager can click "View" to open the location in Google Maps. | Attendance page |
| **Face Recognition Attendance** | Enroll your face once (webcam), then get an optional face-match step before check-in. Runs entirely in your browser using `face-api.js` — no photos are ever uploaded anywhere, only a 128-number "descriptor" is saved. **This is a demo-grade convenience feature, not a secure biometric system** — lighting, camera quality, and glasses/masks can affect matches, so a failed match still lets you check in normally rather than locking you out. | Enroll on the Profile page; verify on the Attendance page |
| **Employee Productivity Score** | A transparent 0-100 score computed from data already in the system: 40% task completion rate, 40% attendance rate, 20% punctuality — no AI or external service involved, so it's easy to explain and audit. | Employee's own Dashboard; a full leaderboard for Admin/HR/Manager on the Performance page |
| **Workforce Analytics** | Adds a 7-day attendance trend chart and org-wide task completion rate + average productivity score to the main dashboard. | Dashboard (Admin/HR/Manager view) |

### A note on Face Recognition specifically
This uses TensorFlow.js models running fully client-side (`frontend/public/models/`, ~6.8MB, loaded once). It needs:
- A working webcam and browser permission to use it
- Reasonable lighting and one face in frame

Because it's genuinely hard to make 100% reliable in a student project, a non-matching face **never blocks** check-in — it just skips the "face verified" badge and checks in normally, so nobody gets locked out of their own attendance.


- **File uploads** (documents, payslips) save to the backend's local `uploads/`
  folder and are served at `/uploads/...`. Add real Cloudinary credentials to
  `backend/.env` and uploads will automatically go to the cloud instead — no
  code changes needed.
- **Emails** (password reset) print to the backend terminal instead of
  actually sending, unless you add real SMTP credentials to `backend/.env`.
- These fallbacks mean every module works fully offline/locally without
  needing paid third-party accounts, while still being production-ready once
  you add real credentials.
