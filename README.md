# Registrar Service Management System (RSMS)
### Sorsogon State University – Bulan Campus

A digital transformation system for the Registrar's Office that replaces manual logbooks and inefficient request monitoring with a modern, integrated web-based platform.

---

## System Overview

RSMS consists of three integrated interfaces sharing one backend and one database:

| Interface | Port | Purpose |
|-----------|------|---------|
| Registrar Dashboard | :5173 | Staff/Admin operations, monitoring, analytics |
| Kiosk System | :5174 | On-campus visitor sign-in and document requests |
| Public Portal | :5175 | Announcements, FAQs, and request tracking for students |

---

## Core Features

### Registrar Dashboard
- Digital visitor logbook management with queue system
- Service request monitoring and status tracking
- User and staff account management
- Announcement and FAQ management
- Audit trail for all system actions
- AI-Assisted Generative Analysis Reports (powered by Google Gemini)

### Kiosk System
- Walk-in visitor digital sign-in (replaces manual logbook)
- Document request submission with tracking code generation
- Queue number assignment for organized service flow
- Pick-up queue for claiming ready documents

### Public Portal
- Registrar announcements and advisories feed
- Frequently Asked Questions (FAQs)
- Document request status tracking via tracking code

---

## Technology Stack

### Backend
- **Framework:** NestJS + TypeScript
- **Database:** PostgreSQL + TypeORM
- **Authentication:** JWT + bcrypt
- **AI Integration:** Google Gemini API (analytics report generation)

### Frontend
- **Framework:** React + Vite + TypeScript
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand
- **Data Fetching:** TanStack Query

---

## System Architecture
