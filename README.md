# AI-Powered Digital Hospital Management System — Intelligent Healthcare Assistant

A modern Digital Hospital Management System featuring a custom AI-powered hospital assistant integrated with the Google Gemini API. The AI assistant is configured with custom hospital-related data and scripts, allowing it to generate responses based on the specific information provided by the system.

🤖 Custom AI Hospital Assistant

The core feature of this project is an AI-powered chatbot built using the Google Gemini API.

Rather than relying only on Gemini's general knowledge, the chatbot is provided with custom hospital data, predefined scripts, system information, and specific instructions. This allows the AI assistant to respond according to the information and context defined for the Digital Hospital Management System.

How the AI Bot Works

User Question → Custom Hospital Data/Instructions → Gemini API → AI Response

The custom data acts as the knowledge and context layer, while Gemini provides the natural-language understanding and response generation.

This approach allows the chatbot to provide more project-specific and context-aware responses related to the hospital system.

## ✨ Features

### 👨‍💼 Admin
- Dashboard overview and hospital statistics
- User management
- Doctor management
- Patient management
- Appointment management
- Department management
- Staff/account administration

### 👨‍⚕️ Doctor
- Doctor dashboard and schedule
- View assigned patients
- Update patient diagnosis information
- Create prescriptions
- View billing information
- Update doctor profile

### 🧑‍🤝‍🧑 Patient
- Patient dashboard
- View and book appointments
- Cancel appointments
- Browse available doctors
- View medical records
- View prescriptions
- View billing information
- Pay outstanding bills
- Update profile

### 👩‍⚕️ Nurse
- Nurse dashboard
- View and manage assigned tasks
- Complete nursing tasks
- View patients
- Medication management
- Create and view reports
- Update nurse profile

### 💬 Communication
- User-to-user messaging
- Conversation history
- Contacts by role
- Notifications and read/unread status

### 🤖 AI Assistant
The project includes a **MediCare AI Assistant** powered by Google's Gemini API.

It can:
- Answer general questions
- Provide hospital-related information
- Answer configured hospital FAQs
- Provide navigation actions based on the user's role
- Use optional Google Search grounding for supported general questions
- Apply safety rules for medical/emergency questions
- Prevent requests for other users' private information

If no Gemini API key is configured, the assistant can still use the application's configured FAQ responses.

## 🛠️ Technology Stack

### Frontend
- React
- Vite
- React DOM
- Lucide React
- JavaScript / JSX
- CSS

### Backend
- Node.js
- Express.js
- MySQL2
- JSON Web Tokens (JWT)
- bcrypt
- Express Rate Limit

### Database
- MySQL
- Persistent local JSON fallback database
- SQL schema and seed data included in `database/medical_hms.sql`

## 📁 Project Structure

```text
HMS/
├── backend/
│   ├── config/
│   │   ├── assistantFaq.js
│   │   ├── db.js
│   │   ├── hospitalKnowledge.js
│   │   └── jwt.js
│   ├── middleware/
│   │   └── optionalAuth.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── ai.js
│   │   ├── auth.js
│   │   ├── doctor.js
│   │   ├── messages.js
│   │   ├── nurse.js
│   │   └── patient.js
│   ├── services/
│   │   ├── aiAssistant.js
│   │   └── hospitalData.js
│   ├── test/
│   ├── package.json
│   └── server.js
│
├── database/
│   ├── medical_hms.sql
│   └── local_db.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── dashboards/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── package.json
└── README.md
```

## ⚙️ Requirements

Before running the project, install:

- **Node.js** 18+ recommended
- **npm**
- **MySQL 8+ or MariaDB** if you want to use the MySQL database
- A **Google Gemini API key** if you want full AI-generated responses

> The backend includes a local JSON database fallback, so MySQL is not strictly required for basic local development.

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
cd YOUR-REPOSITORY
```

Replace the repository URL with your GitHub repository URL.

### 2. Install dependencies

From the project root:

```bash
npm run install:all
```

This installs the root, backend, and frontend dependencies.

Alternatively:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend --legacy-peer-deps
```

## 🔐 Environment Configuration

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
NODE_ENV=development

GEMINI_API_KEY=
GEMINI_MODEL=gemini-3-flash-preview
GEMINI_ENABLE_GOOGLE_SEARCH=false

CORS_ORIGINS=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=medical_hms
DB_PORT=3306
```

### Environment variables

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `NODE_ENV` | Application environment |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Gemini model used by the AI assistant |
| `GEMINI_ENABLE_GOOGLE_SEARCH` | Enables optional Google Search grounding |
| `CORS_ORIGINS` | Allowed frontend origin(s) |
| `DB_HOST` | MySQL server host |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name |
| `DB_PORT` | MySQL server port |

**Never commit your real `.env` file or API keys to GitHub.**

## 🗄️ MySQL Database Setup

If you want to use MySQL:

1. Start MySQL/MariaDB.
2. Create the database and tables using:

```bash
mysql -u root -p < database/medical_hms.sql
```

Or open `database/medical_hms.sql` in MySQL Workbench and execute it.

3. Update `backend/.env` with your MySQL credentials.

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=medical_hms
DB_PORT=3306
```

The SQL file contains the database schema and sample seed data.

## ▶️ Running the Application

### Start frontend and backend together

From the project root:

```bash
npm start
```

The application will normally be available at:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

Backend health check:

```text
http://localhost:5000/status
```

### Run separately

Backend:

```bash
npm run server
```

Frontend:

```bash
npm run client
```

### Build the frontend

```bash
npm run build
```

### Preview the production frontend build

```bash
cd frontend
npm run preview
```

## 🧪 Testing

Backend tests use Node's built-in test runner.

From the project root:

```bash
npm test --prefix backend
```

Or:

```bash
cd backend
npm test
```

## 🔑 Demo Accounts

The SQL seed file contains sample accounts for testing.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@medicare.com` | `admin123` |
| Doctor | `sarath@medicare.com` | `doctor123` |
| Patient | `oshan@medicare.com` | `patient123` |
| Nurse | `amaya@medicare.com` | `nurse123` |

> These are development/demo credentials from the included seed data. Do not use them in a production deployment.

## 🔌 API Overview

The backend exposes REST endpoints under `/api`.

| Module | Base route | Purpose |
|---|---|---|
| Authentication | `/api/auth` | Login and registration |
| Admin | `/api/admin` | Users, doctors, patients, appointments, departments |
| Doctor | `/api/doctor` | Doctor dashboard, patients, prescriptions, billing |
| Patient | `/api/patient` | Appointments, doctors, records, prescriptions, billing |
| Nurse | `/api/nurse` | Tasks, patients, medications, reports |
| Messages | `/api/messages` | Messaging and notifications |
| AI | `/api/ai` | AI assistant and hospital information |

Health/status endpoint:

```http
GET /status
```

## 🗃️ Database

The MySQL schema contains modules for:

- Roles
- Users
- Departments
- Doctors
- Patients
- Nurses
- Appointments
- Billing
- Medical Records
- Medications
- Messages
- Notifications
- Prescriptions
- Prescription Items
- Reports
- Settings
- Tasks

### Local database fallback

If the backend cannot connect to MySQL, it automatically falls back to a persistent JSON database using:

```text
database/local_db.json
```

This allows the application to continue operating during local development without an active MySQL server.

## 🔒 Security Notes

The project includes several security-related mechanisms:

- Password hashing with `bcryptjs`
- JWT-based authentication
- Role-aware application dashboards
- CORS configuration
- Request rate limiting for the AI assistant
- Environment variables for secrets
- AI prompt-safety protections
- Restrictions against exposing other users' private information

For production use, additional security hardening is recommended, including secure secret management, HTTPS, stronger authorization checks, production database credentials, audit logging, and deployment-specific configuration.

## 🤖 AI Assistant Configuration

To enable Gemini-powered responses:

1. Obtain a Google Gemini API key.
2. Add it to `backend/.env`:

```env
GEMINI_API_KEY=your_api_key_here
```

3. Restart the backend.

Optional Google Search grounding:

```env
GEMINI_ENABLE_GOOGLE_SEARCH=true
```

The assistant is designed to provide general information rather than diagnosis or medication prescriptions. Emergency or potentially serious medical questions are directed toward appropriate professional/emergency care.

## 📦 Production Notes

Before deploying:

- Set production environment variables.
- Never expose API keys in frontend code.
- Use a production MySQL/MariaDB instance.
- Use HTTPS.
- Replace development/demo credentials.
- Configure `CORS_ORIGINS` for the production frontend domain.
- Review authentication and authorization rules.
- Remove or protect development/test endpoints.
- Do not commit `.env`, `node_modules`, or other generated/private files.

## 📝 GitHub Upload Checklist

Before pushing this project to GitHub, make sure you do **not** upload:

```text
backend/.env
node_modules/
```

The repository already contains `.gitignore` rules for environment files and frontend build output.

If `node_modules` was previously tracked by Git, remove it from tracking before pushing:

```bash
git rm -r --cached backend/node_modules frontend/node_modules
```

Then commit the changes:

```bash
git add .
git commit -m "Add Hospital Management System"
git push
```

## 🌐 Future Improvements

Possible future enhancements include:

- Online payment gateway integration
- Real-time chat using WebSockets
- Email/SMS notifications
- Advanced appointment scheduling
- Prescription PDF generation
- Medical report uploads
- Audit logs
- Two-factor authentication
- Docker deployment
- Cloud database integration
- Automated CI/CD
- More comprehensive automated tests

## 👨‍💻 Project

**MediCare Hospital Management System**

A full-stack academic/software project designed to demonstrate modern web development, role-based access, hospital workflows, REST APIs, database management, and AI-assisted user interaction.

## 👨‍💻 Author

**S.D Nuwan Tharanga**
---

## 📄 License

This project is intended for educational and academic use.
