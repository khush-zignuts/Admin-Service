Here's the updated `README.md` file including the full structure and features of your **Admin-Service** project for the real-time event management system:

---

# 🎉 Real-Time Event Management System

A real-time event management platform built with **Node.js + Express + Sequelize** on the backend. The system supports authentication, event booking, chat, push notifications (via Firebase), email alerts, role-based access (admin, organizer, user), and more.

---

## 📁 Project Structure

```
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
```

---

## ✨ Features

### ✅ Common Features

- JWT-based authentication
- Role-based access (Admin, Organizer, User)
- Firebase Cloud Messaging (FCM) push notifications
- Real-time messaging using Socket.IO
- Email templates via Handlebars (OTP, event reminder, etc.)
- Cron jobs for automated reminders
- Event booking with capacity checks
- Sequelize ORM with PostgreSQL

---

### 🎨 Frontend (`react-auth-app`)

- Firebase integration for push notifications
- Modular UI components (AcceptUser, DeclineUser, Chat)
- Interacts with backend APIs in real time
- Easy-to-extend React components

---

### 🔧 Backend (`Admin-Service`)

- Organized MVC structure
- Models for User, Admin, Organizer, Event, Booking, Notification, Message, Chat, EmailQueue, etc.
- Helper utilities for email and push notifications
- Public frontend pages (`chat.html`, `login.html`) served from `/public`
- Cron scheduler for event reminders

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

More available in `routes/` and `controllers/`.

---

## 🔔 Firebase Cloud Messaging (FCM)

- Configure Firebase project
- Add credentials in both frontend and backend `.env`
- Register service worker (`firebase-messaging-sw.js`) in `/public`
- Ensure user grants notification permission in React app

---

## 📬 Email Templates

Located in `Admin-Service/assets/templates/`:

- `otp-verification-email.hbs`
- `event-reminder-email.hbs`
- `event-acceptance-email.hbs`
- `event-decline-email.hbs`

---

## 📸 UI Components (Frontend)

- `AcceptUser.jsx`: Accepts user for event & sends notification
- `DeclineUser.jsx`: Declines user & sends notification
- `Chat.jsx`: Real-time private chat with Socket.IO

---

## 🖔 Background Jobs

- Cron job `startEventReminderJob.js`
- Automatically notifies participants about upcoming events

---

## 🛠️ Tech Stack

**Frontend:** React, Vite, Firebase, TailwindCSS (optional)  
**Backend:** Node.js, Express, Sequelize, PostgreSQL  
**Real-time:** Socket.IO  
**Notifications:** Firebase Cloud Messaging (FCM), Nodemailer (email)  
**Templating:** Handlebars  
**Job Scheduler:** Node Cron

---

Would you like help generating a `README.md` file directly from this so you can copy and paste it easily?
