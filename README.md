# PrimeGift Backend

A production-ready backend for **PrimeGift**, a digital gift voucher platform that enables users to purchase, manage, and redeem branded digital gift cards securely.

🌐 **Live Website:** https://www.primegift.in

---

# Overview

PrimeGift is an online platform developed for secure digital voucher distribution. It allows users to browse available gift vouchers, place orders, complete payments, and manage transactions through a reliable backend system.

The backend is designed using a modular MVC architecture with secure authentication, REST APIs, MongoDB database, and scalable service layers.

---

# Features

- User Registration & Login
- JWT Authentication
- Forgot Password
- Secure Authorization
- Product & Category Management
- Digital Voucher Management
- Order Management
- Payment Integration
- Transaction History
- User Profile Management
- Admin APIs
- Background Jobs
- Error Handling
- RESTful API Architecture

---

# Tech Stack

## Backend
- Node.js
- Express.js

## Database
- MongoDB
- Mongoose

## Authentication
- JWT (JSON Web Token)

## API
- REST APIs

## Architecture
- MVC Architecture
- Middleware Based Request Handling
- Service Layer Architecture

## Version Control
- Git
- GitHub

---

# Project Structure

```
PrimeGiftBackend/
│
├── config/
├── controllers/
├── jobs/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
│
├── app.js
├── server.js
├── package.json
└── package-lock.json
```

---

# Modules

### Authentication
- User Registration
- User Login
- JWT Authentication
- Forgot Password

### Product Management
- Product Listing
- Categories
- Product Details

### Order Management
- Create Orders
- Order Tracking
- Order History

### Voucher Management
- Voucher Generation
- Voucher Delivery
- Voucher Status

### Payment
- Payment Processing
- Transaction Verification
- Payment History

### Admin
- Manage Products
- Manage Orders
- Manage Users
- Dashboard APIs

---

# Security Features

- JWT Authentication
- Protected Routes
- Password Encryption
- Input Validation
- Middleware-based Authorization
- Secure API Design

---

# REST APIs

Some of the APIs included are:

- User Authentication APIs
- Product APIs
- Category APIs
- Order APIs
- Transaction APIs
- Voucher APIs
- Admin APIs

---

# Installation

Clone the repository

```bash
git clone https://github.com/vivekyadav1050/Primegiftbackend.git
```

Move into project

```bash
cd Primegiftbackend
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
PORT=5000

MONGODB_URI=your_database_url

JWT_SECRET=your_secret_key
```

Run the project

```bash
npm start
```

or

```bash
npm run dev
```

---

# Learning Outcomes

During the development of this project, I gained practical experience in:

- Backend Development
- REST API Design
- JWT Authentication
- MongoDB Database Design
- MVC Architecture
- Error Handling
- Production Deployment
- Git & GitHub Workflow

---

# Future Improvements

- AI-based Product Recommendation
- Analytics Dashboard
- Notification Service
- Email Automation
- Admin Reports
- Microservices Architecture
- Docker Deployment

---

# Live Project

https://www.primegift.in

---

# Author

**Vivek Yadav**

GitHub:
https://github.com/vivekyadav1050

---

## License

This project is developed for educational and commercial learning purposes.
