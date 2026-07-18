# MediConnect

MediConnect is a modern, AI-powered healthcare appointment booking and digital consultation platform. Designed to bridge the communication gap between patients and medical specialists, it offers a secure portal for scheduling consultations, updating electronic health records, and interacting with a context-aware AI clinical assistant.

---

## Core Features

### Patient Portal
* **Dashboard Summary**: Real-time counter metrics tracking upcoming appointments and diagnostic logs.
* **Specialist Search**: Advanced search filters to find healthcare providers by medical specialty, experience, and fees.
* **Booking System**: Dynamic schedule slots calculated directly from the doctor's custom working hours and specialty-specific duration policies.
* **Digital Health History**: Read-only timeline review of all historical consultation forms, symptoms, prescriptions, and follow-up directives.

### Doctor Workspace
* **Agenda Manager**: Overview of today's accepted schedule, pending booking requests, and historical appointments.
* **Consultation Editor**: Streamlined clinical editor to save symptoms, log diagnoses, prescribe treatments, and set follow-up targets.
* **Office Schedule Planner**: Real-time tools to configure weekly working hours and mark specific calendar dates as unavailable or leave periods.

### Intelligent & Secure Services
* **AI Medical Assistant**: Interactive chatbot client integrated with OpenRouter API for symptom descriptions and general wellness advice.
* **Unified Dialog System**: Custom modal confirmations (replacing standard browser alert prompts) matching the application style sheet tokens.
* **Authentication**: Password hashing via bcrypt and transaction authorization using JsonWebTokens (JWT).

---

## Tech Stack

### Frontend Client
* **Core**: React 19, HTML5, CSS3, JavaScript (ES6+)
* **Routing**: React Router 7 (Single Page Application configuration)
* **API Requests**: Native Fetch API with asynchronous loading state overlays

### Backend Server
* **Framework**: Node.js, Express.js
* **CORS**: Origin validation whitelist checks against environment variables

### Database Layer
* **Storage**: MongoDB
* **ORM**: Mongoose

### AI Integration
* **API Provider**: OpenRouter API
* **Fallback**: Automatic offline demonstration modes when keys are unconfigured

---

## Project Architecture

```text
+------------------+             +-------------------+             +------------------+
|                  |  HTTP Fetch  |                   |  Mongoose   |                  |
|  React Frontend  | <==========> |  Express Backend  | <=========> |   MongoDB Host   |
|  (Client Port)   |  (API Proxy) |   (Server Port)   |   (CORS)    |  (Database Port) |
|                  |              |                   |             |                  |
+------------------+              +-------------------+             +------------------+
        ^                                  |
        |                                  | OpenRouter API
        | Chat Messages                    v
        |                          +-------------------+
        +--------------------------|   AI Model API    |
                                   +-------------------+
```

---

## Directory Structure

```text
project/
├── client/                 # React frontend application
│   ├── public/             # Vector favicons, images, and static assets
│   ├── src/
│   │   ├── components/     # Icons, ProtectedRoute, and NotificationProvider
│   │   ├── pages/          # Home, Dashboard, Profile, Booking, Consultation pages
│   │   ├── App.jsx         # App routes and shell layouts
│   │   └── main.jsx        # App entry point
│   ├── index.html          # Default template layout
│   └── package.json        # Frontend package configuration
│
├── server/                 # Express backend application
│   ├── config/             # Mongoose database client setup
│   ├── controllers/        # Route controllers (auth, record, AI chat business logic)
│   ├── middleware/         # Auth verification and CORS whitelist middlewares
│   ├── models/             # Schema definitions (User, Doctor, HealthRecord, Appointment)
│   ├── routes/             # REST route bindings
│   ├── services/           # OpenRouter API integration layer
│   ├── utils/              # Seeder scripts
│   ├── server.js           # Server starter file
│   └── package.json        # Backend package configuration
│
├── .gitignore              # Files ignored by Git
├── .env.example            # Environment configuration template
└── README.md               # Root documentation
```

---

## Installation & Configuration Guide

### 1. Prerequisite Installations
* **Node.js** (v18 or higher recommended)
* **MongoDB Community Server** (running locally on port 27017 or a remote MongoDB Atlas cluster)

### 2. Repository Cloning
Clone the repository to your local directory:
```bash
git clone https://github.com/your-username/mediconnect.git
cd mediconnect
```

### 3. Environment Variables Configuration
Copy the template environment configuration file into the server subdirectory and edit your keys:
```bash
cp .env.example server/.env
```

Open `server/.env` and update the placeholders:
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/mediconnect
JWT_SECRET=your_jwt_signature_secret_key
OPENROUTER_API_KEY=your_openrouter_credentials_key
FRONTEND_URL=http://localhost:5173
```

### 4. Backend Server Setup
Install the backend node modules and seed the development database:
```bash
cd server
npm install
npm run seed
npm start
```
The server will bind and listen on `http://localhost:5001`.

### 5. Frontend Client Setup
Open a separate terminal window, install frontend packages, and launch the dev client:
```bash
cd client
npm install
npm run dev
```
The client dashboard will compile and open at `http://localhost:5173`.

---

## Environment Variables Description

* **PORT**: The network port target for the Express backend server (default: `5001`).
* **MONGO_URI**: The database host connection string for Mongoose.
* **JWT_SECRET**: The cryptographic signature key used to encode and verify patient/doctor session tokens.
* **OPENROUTER_API_KEY**: The authorization bearer key utilized to query AI completions.
* **FRONTEND_URL**: The client application origin url used by CORS to block unauthorised API calls.

---

## Future Improvements Roadmap
- Implement WebSockets/Socket.io to enable real-time chat between doctor and patient profiles.
- Support file attachments (PDF/Images) inside consultation reports for diagnostic test results.
- Implement automated prescription refills and medication alerts.

---

## License

This project is licensed under the terms of the [MIT License](LICENSE).
