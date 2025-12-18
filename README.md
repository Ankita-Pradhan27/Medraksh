# 🏥 Medraksh - Smart Prescription & Medicine Reminder

![MERN Stack](https://img.shields.io/badge/MERN-Full%20Stack-blue)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED)
![Testing](https://img.shields.io/badge/Tests-Jest%20%26%20Supertest-green)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

**Medraksh** is a full-stack healthcare application designed to improve medication adherence. It allows users to digitize prescriptions, schedule automated reminders, and track their health progress. 

Unlike simple CRUD apps, Medraksh integrates **OCR (Optical Character Recognition)** to read prescriptions automatically and uses a **Background Job Scheduler** to send real email alerts.

---

## 🚀 Key Features

* **🤖 AI-Powered OCR:** Automatically extracts medicine names and dosages from uploaded prescription images using `Tesseract.js`.
* **🔔 Smart Notifications:** Background scheduler (`node-cron`) sends real-time email alerts (`Nodemailer`) when it's time to take medicine.
* **📊 Adherence Analytics:** Visualizes daily medication progress using interactive charts (`Recharts`).
* **🐳 Fully Containerized:** Runs instantly on any machine using **Docker & Docker Compose**.
* **🧪 Automated Testing:** Robust integration tests (`Jest` + `Supertest`) ensure API reliability.
* **📱 Progressive Web App (PWA):** Installable on mobile devices for offline access.
* **🔐 Secure Authentication:** JWT-based login with password hashing (`bcrypt`).

---

## 🛠️ Tech Stack

### **Frontend**
* React.js (Hooks, Context API)
* Recharts (Data Visualization)
* Axios (API Communication)
* CSS3 (Responsive Design)

### **Backend**
* Node.js & Express (RESTful API)
* MongoDB & Mongoose (Database)
* Tesseract.js (OCR Engine)
* Nodemailer (Email Service)
* Node-Cron (Job Scheduling)

### **DevOps & Quality Assurance**
* Docker & Docker Compose
* Jest & Supertest (Integration Testing)
* GitHub Actions (CI/CD Ready)

---

## ⚙️ Installation & Setup

### **Option 1: Run with Docker (Recommended)**

```bash
git clone https://github.com/your-username/medraksh.git
cd medraksh
```

Create `.env` file in `backend/`:

```env
MONGO_URI=mongodb://mongo:27017/medraksh
JWT_SECRET=your_secret_key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=5000
```

Run the app:

```bash
docker compose up --build
```

Frontend: http://localhost:3000  
Backend: http://localhost:5000

---

### **Option 2: Manual Setup**

#### Backend
```bash
cd backend
npm install
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

---

## 📂 Project Structure

```bash
Medraksh/
├── backend/
├── frontend/
└── docker-compose.yml
```

---

## 🔮 Future Roadmap

- Drug Interaction Checker
- Caregiver Mode
- Voice Commands

---

## 📄 License

MIT License
