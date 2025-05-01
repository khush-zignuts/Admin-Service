# 🎉 Real-Time Event Management System

A real-time event management platform built with **Node.js + Express + Sequelize** on the backend. The system supports authentication, event booking, chat, push notifications (via Firebase), email alerts, access (admin, organizer, user), and more.

---

## 📁 Project Structure

Admin-Service/
├─ .vscode/
│  └─ settings.json
├─ api/
│  ├─ controllers/
│  │  ├─ admin/
│  │  │  ├─ auth/
│  │  │  │  └─ AdminAuthController.js
│  │  │  ├─ event/
│  │  │  │  └─ AdminEventController.js
│  │  │  ├─ organizer/
│  │  │  │  └─ AdminOrganizerController.js
│  │  │  ├─ user/
│  │  │  │  └─ AdminUserController.js
│  │  │  └─ index.js
│  │  ├─ organizer/
│  │  │  ├─ auth/
│  │  │  │  └─ AuthController.js
│  │  │  ├─ booking/
│  │  │  │  └─ BookEventController.js
│  │  │  ├─ chat/
│  │  │  │  └─ ChatController.js
│  │  │  ├─ event/
│  │  │  │  └─ EventController.js
│  │  │  ├─ message/
│  │  │  │  └─ MessageController.js
│  │  │  └─ index.js
│  │  └─ index.js
│  ├─ helper/
│  │  ├─ formattedDate.js
│  │  ├─ sendEmail.js
│  │  ├─ sendNotification.js
│  │  ├─ sendPushNotification.js
│  │  └─ startEventReminderJob.js
│  ├─ middleware/
│  │  ├─ checkAdmin.js
│  │  └─ checkOrganizer.js
│  ├─ models/
│  │  ├─ Admin.js
│  │  ├─ Booking.js
│  │  ├─ Chat.js
│  │  ├─ CommanFields.js
│  │  ├─ EmailQueue.js
│  │  ├─ Event.js
│  │  ├─ EventFeedback.js
│  │  ├─ index.js
│  │  ├─ Message.js
│  │  ├─ Notification.js
│  │  ├─ Organizer.js
│  │  ├─ SocketIO.js
│  │  └─ User.js
│  ├─ public/
│  │  ├─ app.js
│  │  ├─ chat.html
│  │  ├─ firebase-messaging-sw.js
│  │  ├─ index.html
│  │  └─ login.html
│  ├─ routes/
│  │  ├─ admin/
│  │  │  ├─ auth/
│  │  │  │  └─ authRoutes.js
│  │  │  ├─ event/
│  │  │  │  └─ eventRoutes.js
│  │  │  ├─ organizer/
│  │  │  │  └─ organizerRoutes.js
│  │  │  ├─ user/
│  │  │  │  └─ userRoutes.js
│  │  │  └─ index.js
│  │  ├─ organizer/
│  │  │  ├─ auth/
│  │  │  │  └─ authRoutes.js
│  │  │  ├─ book/
│  │  │  │  └─ bookeventroutes.js
│  │  │  ├─ chat/
│  │  │  │  └─ chatRoutes.js
│  │  │  ├─ event/
│  │  │  │  └─ eventRoutes.js
│  │  │  ├─ message/
│  │  │  │  └─ messageRoutes.js
│  │  │  └─ index.js
│  │  └─ index.js
│  └─ utils/
│     ├─ comparePassword.js
│     ├─ generateUUID.js
│     ├─ hashPw.js
│     └─ verifyOtp.js
├─ assets/
│  └─ templates/
│     ├─ event-acceptance-email.hbs
│     ├─ event-decline-email.hbs
│     ├─ event-reminder-email.hbs
│     └─ otp-verification-email.hbs
├─ config/
│  ├─ bootstrap.js
│  ├─ constant.js
│  ├─ data.json
│  ├─ db.js
│  ├─ firebase.js
│  ├─ socketIO.js
│  └─ validationRules.js
├─ .env
├─ .gitignore
├─ package-lock.json
├─ package.json
├─ server.js
└─ temp.js


---

## ✨ Features

### ✅ Common Features

- JWT-based authentication
-  access (Admin, Organizer, User)
- Firebase Cloud Messaging (FCM) push notifications
- Real-time messaging using Socket.IO
- Email templates via Handlebars (OTP, event reminder, etc.)
- Cron jobs for automated reminders
- Booking capacity check
- Sequelize ORM with PostgreSQL

### 🎨 Frontend (`react-auth-app`)

- Firebase integration for notifications
- Modular components (AcceptUser, DeclineUser, Chat)
- Realtime interaction with backend APIs
- Easily extendable UI

### 🔧 Backend (`Admin-Service`)

- Models for Event, Booking, Notification, Message, EmailQueue, etc.
- Helpers for sending push/email notifications
- Middleware for authentication & authorization
- Public pages for chat, login (in `public/`)

---

## 💠 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/event-management-system.git
cd event-management-system
```

### 2. Setup Environment Variables

#### 🔐 Backend (`Admin-Service/.env`)

```env
PORT=5000
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

#### 🔐 Frontend (`react-auth-app/.env`)

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_VAPID_KEY=...
```

---

## 📦 Installation

### 🔧 Backend

```bash
cd Admin-Service
npm install
npx sequelize db:migrate
npm run dev
```

### 💻 Frontend

```bash
cd react-auth-app
npm install
npm run dev
```

---

## 🥮 API Overview (Backend)

| Endpoint                        | Method | Description                          |
|---------------------------------|--------|--------------------------------------|
| `/api/admin/auth/login`         | POST   | Admin login                          |
| `/api/organizer/event`          | POST   | Create a new event                   |
| `/api/organizer/book/event`     | POST   | Book an event (capacity checked)     |
| `/api/organizer/chat`           | GET    | Get chat history                     |
| `/api/organizer/message/send`   | POST   | Send real-time message               |

More routes organized under `routes/` and `controllers/`.

---

## 🔔 Firebase Cloud Messaging (FCM)

- Set up Firebase project
- Add FCM credentials to both frontend and backend `.env` files
- Add `firebase-messaging-sw.js` to `public/` folders
- Ensure push permissions are handled in frontend React components

---

## 📬 Email Templates

Located in `Admin-Service/assets/templates/`:

- `otp-verification-email.hbs`
- `event-reminder-email.hbs`
- `event-acceptance-email.hbs`
- `event-decline-email.hbs`

---

## 📸 UI Components (Frontend)

- `AcceptUser.jsx`: Trigger accept route and show notification
- `DeclineUser.jsx`: Trigger decline route and send notification
- `Chat.jsx`: Real-time one-to-one chat via Socket.IO

---

## 🖔 Background Jobs

- `startEventReminderJob.js`: Sends reminders via cron
- Runs periodically to notify users about upcoming events

---

## 🛠️ Tech Stack

**Frontend:** React, Vite, Firebase, Tailwind (optional)<br>
**Backend:** Node.js, Express, Sequelize, PostgreSQL<br>
**Real-time:** Socket.IO<br>
**Notifications:** Firebase Cloud Messaging (FCM), Nodemailer<br>
**Job Scheduler:** Node-Cron

---

## 🙌 Acknowledgements

- [Firebase](https://firebase.google.com/)
- [Socket.IO](https://socket.io/)
- [Sequelize](https://sequelize.org/)
- [Vite](https://vitejs.dev/)
- [Express](https://expressjs.com/)

