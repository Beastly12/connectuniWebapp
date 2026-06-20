# ConnectUni Web

Frontend web application for ConnectUni — a university networking platform that enables students, alumni, and industry professionals to connect through mentorship, communities, events, and professional networking.

![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6)
![Vite](https://img.shields.io/badge/Vite-Build_Tool-646CFF)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-Data_Fetching-FF4154)
![AWS](https://img.shields.io/badge/AWS-Deployed-FF9900)

## 🚀 Live Demo

### Production Application

https://d1hl36km7a0922.cloudfront.net

### Backend API

https://connectuni-api.ddns.net

### API Documentation

https://connectuni-api.ddns.net/docs

---

## 📖 Overview

ConnectUni Web is the primary user-facing interface of the ConnectUni platform.

Built using React and TypeScript, the application provides a responsive and modern experience for students, alumni, and industry professionals to discover opportunities, engage with communities, participate in events, and build mentorship relationships.

The frontend communicates with the FastAPI backend through REST APIs and WebSockets to deliver both real-time and asynchronous experiences.

---

## ✨ Key Features

### 🔐 Authentication & Account Management

- User Registration
- Secure Login
- Email Verification
- Password Reset
- Session Persistence
- Protected Routes
- Role-Based User Experiences

---

### 👤 Profile Management

Users can create and manage professional profiles including:

- Academic Information
- Professional Experience
- Skills
- Interests
- Career Goals
- Profile Completion Tracking

Supported user roles:

- Students
- Alumni
- Industry Professionals

---

### 🎯 Mentorship Platform

The mentorship system allows users to:

- Discover Mentors
- Search Mentors by Expertise
- Send Mentorship Requests
- Manage Active Mentorships
- Track Milestones
- Share Resources
- Schedule Sessions
- Submit Reviews

---

### 👥 Communities

Community functionality includes:

- Create Communities
- Join Communities
- Community Discovery
- Community Management
- Community Discussions
- Community Messaging
- Membership Administration

---

### 📅 Events

Users can:

- Discover Events
- Create Events
- RSVP to Events
- Manage Attendance
- Track Upcoming Activities

---

### 💬 Real-Time Communication

Integrated WebSocket support provides:

- Community Chat
- Live Messaging
- Real-Time Notifications
- Instant Updates

---

### 🔔 Notifications

Notification capabilities include:

- Event Updates
- Community Activity
- Mentorship Requests
- Session Reminders
- System Announcements

---

## 🏗 Frontend Architecture

```text
Pages
  │
  ▼

Components
  │
  ▼

Custom Hooks
  │
  ▼

API Services
  │
  ▼

TanStack Query
  │
  ▼

FastAPI Backend
```

### Design Principles

- Component-Based Architecture
- Reusable UI Components
- Separation of Concerns
- Type-Safe Development
- Responsive Design
- API-Driven Architecture

---

## 🛠 Technology Stack

### Core

- React
- TypeScript
- Vite

### State & Data Management

- TanStack Query
- React Context API

### Routing

- React Router

### Networking

- Axios
- WebSockets

### Styling

- Modern Responsive UI
- Mobile-Friendly Layouts

### Tooling

- ESLint
- TypeScript Compiler
- Vite Build System

---

## 💡 Engineering Highlights

### Type-Safe Frontend

The application leverages TypeScript throughout the codebase to provide:

- Compile-Time Safety
- Better Refactoring Support
- Improved Developer Experience
- Reduced Runtime Errors

---

### Optimised Data Fetching

TanStack Query is used for:

- API Caching
- Background Refetching
- Optimistic Updates
- Request Deduplication
- Loading State Management

---

### Real-Time User Experience

WebSocket integration enables:

- Community Chat
- Live Updates
- Instant Notifications

without requiring page refreshes.

---

### Cross-Platform Consistency

The web application shares business workflows with the Flutter mobile application through a common backend API, ensuring consistent behaviour across platforms.

---

## 📸 Screenshots

### Dashboard

```text
docs/screenshots/dashboard.png
```

### Mentorship Platform

```text
docs/screenshots/mentorship.png
```

### Communities

```text
docs/screenshots/communities.png
```

### Events

```text
docs/screenshots/events.png
```

> Add screenshots here to significantly improve recruiter engagement.

---

## 🔗 Platform Ecosystem

### Backend API

https://github.com/Beastly12/connectunibackend-diss

### Mobile Application

https://github.com/Beastly12/ConnectUniMobileApp

---

## 🚀 Local Development

### Clone Repository

```bash
git clone https://github.com/Beastly12/connectuniWebapp.git
cd connectuniWebapp
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=
VITE_WS_URL=
```

### Start Development Server

```bash
npm run dev
```

Application will run at:

```text
http://localhost:5173
```

---

## 📦 Build for Production

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## 📈 Future Enhancements

- Push Notifications
- Advanced Search
- AI-Powered Recommendations
- Enhanced Community Moderation
- Calendar Integrations
- Rich Media Messaging

---

## 👨‍💻 Author

**Dafe**

Software Engineer

GitHub: https://github.com/Beastly12

---

## 📄 License

This project is licensed under the MIT License.
