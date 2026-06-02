# 🏆 Athvexa Backend

The core API engine for **Athvexa**, a gamified sports social platform for athletes, coaches, and sports academies.

Built with **Spring Boot (Java 17)** and integrated with **Supabase PostgreSQL**, **JWT Authentication**, and **Cloudinary**.

---

## 🚀 Features

- 🔐 JWT Authentication & Role-based Access Control
- 🏅 Gamified Ranking System with live point calculations
- 💬 Real-time Chat API (messaging + unread tracking)
- 👍 Posts, Likes & Community Engagement APIs
- 👤 Athlete & Coach Profile Management
- ☁️ Cloudinary Media Upload & Management
- 📊 Sport-based Leaderboards & Ranking Engine

---

## 🛠️ Tech Stack

- Spring Boot (v3+)
- Java 17
- Spring Security + JWT
- PostgreSQL (Supabase)
- Cloudinary (Media Storage)
- Docker (Containerized Deployment)

---

## 📂 Project Architecture

```text
com.athvexa/
├── AthvexaApplication.java
├── config/         → Security, CORS, Cloudinary setup
├── controller/     → REST API endpoints
├── dto/            → Data Transfer Objects
├── model/          → JPA Entities
├── repository/     → Database layer
└── service/        → Business logic (ranking, chat, points)