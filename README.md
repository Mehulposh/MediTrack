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


## Users
| Role | Email | Password |
|------ |-------|--------------|
|Admin | test2@example.com | password123 |
|Doctor | test21@example.com | test21@example.com  |
|Patient | mehulposhattiwar4995@gmail.com | 12345678 |


## Screen Shots
- Login
 <img width="100" height="300" alt="image" src="https://github.com/user-attachments/assets/6abf91e8-c9fd-45ba-9470-ebeee2a3c983" />

- Register 
<img width="100" height="300" alt="image" src="https://github.com/user-attachments/assets/3bc1aa28-0818-4cf4-99ed-318c6d997591" />

- Admin Dashboard
<img width="300" height="100" alt="image" src="https://github.com/user-attachments/assets/53761669-1b34-4acc-89e8-d8a191035e5d" />
<img width="300" height="100" alt="image" src="https://github.com/user-attachments/assets/7ee26107-710c-43e4-9db6-290c47cd2711" />
<img width="300" height="100" alt="image" src="https://github.com/user-attachments/assets/02b0077a-2fee-4783-88a3-fb9d607c9bac" />
<img width="300" height="100" alt="image" src="https://github.com/user-attachments/assets/387a150d-5936-42ba-8b45-683553e37418" />
<img width="300" height="100" alt="image" src="https://github.com/user-attachments/assets/6563a763-b4de-4170-aa73-44916d4a234b" />
<img width="300" height="100" alt="image" src="https://github.com/user-attachments/assets/2de7676d-3673-473a-a245-6e9d39b1d924" />


- Doctor Dashboard
<img width="300" height="100" alt="image" src="https://github.com/user-attachments/assets/28666f11-30be-470b-9934-2c808de5e854" />
<img width="300" height="100" alt="image" src="https://github.com/user-attachments/assets/761b5538-46b3-417a-aee4-039063280398" />
<img width="300" height="100" alt="image" src="https://github.com/user-attachments/assets/a4da328e-3007-4798-82ef-851a2dc76fcd" />
<img width="300" height="100" alt="image" src="https://github.com/user-attachments/assets/730635c4-ea10-431c-b265-166502768273" />
<img width="300" height="100" alt="image" src="https://github.com/user-attachments/assets/adccf8af-afe0-47a8-9068-6f84b5942f88" />

- Patient Dashboard
<img width="300" height="100" alt="image" src="https://github.com/user-attachments/assets/39da40b1-a1bf-4fc1-bb5b-5e954cc7bafb" />
<img width="300" height="100" alt="image" src="https://github.com/user-attachments/assets/2f939011-884c-4047-9098-85b81aff449f" />
<img width="300" height="100" alt="image" src="https://github.com/user-attachments/assets/c8514ac0-8cce-443d-9f24-4b8fd9db393f" />
<img width="300" height="100" alt="image" src="https://github.com/user-attachments/assets/8d2f9293-f2cd-42fa-b1f1-9c2023180040" />
<img width="300" height="100" alt="image" src="https://github.com/user-attachments/assets/e331a7b0-a085-4e46-8567-61cd6730872e" />
<img width="300" height="100" alt="image" src="https://github.com/user-attachments/assets/dd242790-9cc0-40e2-b047-6711bbd22ce3" />

## 📘 API Documentation (Swagger)

MediTrack API is fully documented using SwaggerHub:  
👉 **https://app.swaggerhub.com/apis-docs/mehulposh/MediTrack-ApiEndpoints/1.0.0**

