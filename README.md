# MediTrack - Complete Clinic Management System
### 📋 Project Overview

MediTrack is a full-stack healthcare application with three distinct user roles: Patients, Doctors, and Admin/Clinic Staff. The system enables comprehensive clinic management, appointment scheduling, and patient record management.

### 🏗 Architecture

```
meditrack/
├── backend/                 # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/         # Database and environment config
│   │   ├── models/         # Mongoose schemas
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── utils/          # Helper functions
│   │   └── server.js       # Entry point
│   ├── package.json
│   └── .env
│
└── frontend/               # React + TypeScript + Vite
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Page components
    │   ├── services/       # API calls
    │   ├── store/          # State management (Zustand)
    │   ├── types/          # TypeScript interfaces
    │   ├── utils/          # Helper functions
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    ├── vite.config.ts
    └── tailwind.config.js
```


### 🚀 Setup Instructions
- Backend Setup

1. Navigate to backend directory:

``` bash   
cd backend
```

2. Install dependencies:

```bash
 npm install
```

3. Create .env file:

``` bash
cp .env.example .env
```

4. Update .env with your values:

- MongoDB connection string (local or Atlas)
- JWT secrets
- Port configuration

5. Start the server:

```bash
 # Development
   npm run dev
   
# Production
   npm start
```

- Frontend Setup

1. Navigate to frontend directory:

``` bash
cd frontend
```

2. Install dependencies:

```bash
 npm install
```

3. Create .env file:

``` bash
  VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:

```bash
npm run dev
```

5. Build for production:

``` bash
npm run build
```
