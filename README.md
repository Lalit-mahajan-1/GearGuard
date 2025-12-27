# GearGuard - Ultimate Maintenance Tracker

GearGuard is a full-stack MERN application designed to manage equipment maintenance, teams, and requests with an Odoo-style simplified interface.

## 🚀 Features
- **Maintenance Kanban Board**: Drag & Drop interface for managing request status.
- **Equipment Management**: Track assets, assignments, and history.
- **Smart Logic**:
  - Auto-assigns teams based on equipment.
  - Updates equipment status (Scrap/Operational) based on request outcome.
- **Team Management**: Organize technicians into specialized teams.
- **Dashboard**: Real-time overview of maintenance health.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, ShadCN-style Components, React Query/Axios.
- **Backend**: Node.js, Express, MongoDB, Mongoose.
- **Auth**: JWT with specialized roles (Admin, Manager, Technician, User).

## 📦 Installation

### Prerequisites
- Node.js installed
- MongoDB locally running or URI configurable

### 1. Setup Backend
```bash
cd server
npm install
node seeder.js  # Seeds the database with demo data
npm run dev     # Starts server on port 5000
```
*Create a `.env` file in `/server` if not exists (default provided):*
```env
MONGO_URI=mongodb://localhost:27017/gearguard
JWT_SECRET=your_secret
PORT=5000
```

### 2. Setup Frontend
```bash
cd client
npm install
npm run dev     # Starts client on port 5173
```

## 🔑 Login Credentials (Demo Data)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@example.com` | `123456` |
| **Manager** | `manager@example.com` | `123456` |
| **Technician 1** | `tom@example.com` | `123456` |
| **Technician 2** | `steve@example.com` | `123456` |

## 🧪 Testing the Workflows
1. **Login as Manager**: Go to Dashboard, check stats.
2. **Create Request**: Go to "Requests" -> "New Request". Select "Conveyor Belt". Notice it auto-assigns to "Mechanics" team.
3. **Kanban**: Drag the new request from "New" to "In Progress".
4. **Equipment**: Go to "Equipment" -> Select an item. Click the "Maintenance Requests" smart button to see history.

Enjoy building with GearGuard!
