#  PrimeGift Backend

> A production-ready backend powering **PrimeGift**, a digital gift voucher platform that enables users to browse, purchase, and manage branded digital gift vouchers securely.

 **Live Website:** https://www.primegift.in

---

#  About PrimeGift

PrimeGift is a full-stack digital voucher platform developed to provide customers with a secure and seamless experience for purchasing branded digital gift cards.

The platform integrates with an **authorized third-party voucher aggregator** through secure REST APIs to fetch and deliver digital vouchers from multiple brands.

PrimeGift focuses on secure authentication, reliable payment processing, order management, transaction tracking, and scalable backend architecture.

---

#  Key Features

## User Module

* User Registration
* Secure Login
* JWT Authentication
* Forgot Password
* Profile Management
* Change Password

---

## Product Module

* Product Listing
* Product Details
* Category Management
* Search Products
* Offers & Discounts

---

## Voucher Module

* Digital Voucher Purchase
* Voucher Delivery
* Voucher Status Tracking
* Integration with Authorized Third-Party Voucher Aggregator

---

## Order Module

* Create Orders
* Order Tracking
* Order History
* Order Status

---

## Payment Module

* Secure Payment Integration
* Transaction Verification
* Payment History
* Failed Payment Handling

---

## Admin Module

* User Management
* Product Management
* Order Management
* Voucher Management
* Dashboard APIs

---

## Security

* JWT Authentication
* Protected Routes
* Role-Based Authorization
* Password Encryption
* Input Validation
* Middleware-Based Security

---

# 🛠 Tech Stack

## Frontend

* React.js

## Backend

* Node.js
* Express.js

## Database

* MongoDB
* Mongoose ODM

## Authentication

* JWT (JSON Web Token)

## API

* RESTful APIs

## Integrations

* Payment Gateway
* Authorized Third-Party Voucher Aggregator API

## Version Control

* Git
* GitHub

---

# 🏗 Architecture

```
                React Frontend
                      │
               REST API Requests
                      │
          Node.js + Express Backend
                      │
       ┌──────────────┴──────────────┐
       │                             │
 MongoDB Database          Third-Party Services
                                   │
                     Voucher Aggregator API
                                   │
                          Digital Gift Brands
```

---

# 📂 Project Structure

```
PrimeGiftBackend/

├── config/
│
├── controllers/
│
├── middleware/
│
├── models/
│
├── routes/
│
├── services/
│
├── jobs/
│
├── utils/
│
├── app.js
├── server.js
├── package.json
└── package-lock.json
```

---

# 📌 Folder Description

## config

Application configuration files including database connection, environment variables, and server configuration.

---

## controllers

Contains API controllers responsible for handling client requests and returning responses.

---

## middleware

Authentication, authorization, validation, and request-processing middleware.

---

## models

MongoDB models and schemas using Mongoose.

---

## routes

Defines all REST API endpoints.

---

## services

Contains business logic separated from controllers.

---

## jobs

Background scheduled jobs and automated tasks.

---

## utils

Reusable helper functions and utility methods.

---

# 🔐 Security Features

* JWT Authentication
* Protected APIs
* Role-Based Access Control
* Password Hashing
* Request Validation
* Secure Middleware
* Error Handling
* Environment Variable Protection

---

#  API Modules

* Authentication APIs
* User APIs
* Product APIs
* Category APIs
* Voucher APIs
* Order APIs
* Payment APIs
* Transaction APIs
* Admin APIs

---

#  Project Workflow

```
User Login
      │
JWT Authentication
      │
Browse Products
      │
Select Voucher
      │
Payment Processing
      │
Voucher Aggregator API
      │
Voucher Generated
      │
Order Saved
      │
Transaction Recorded
      │
Voucher Delivered
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/vivekyadav1050/Primegiftbackend.git
```

---

## Move into Project

```bash
cd Primegiftbackend
```

---

## Install Dependencies

```bash
npm install
```

---

## Create Environment File

Create a `.env` file.

```env
PORT=5000

MONGODB_URI=your_database_url

JWT_SECRET=your_secret_key

PAYMENT_API_KEY=your_payment_key
```

---

## Run Development Server

```bash
npm run dev
```

---

## Production

```bash
npm start
```

---

# 💡 Learning Outcomes

This project helped me gain practical experience in:

* Backend Development
* Node.js
* Express.js
* MongoDB
* REST API Design
* JWT Authentication
* MVC Architecture
* Middleware Design
* Production Deployment
* Git Workflow
* Secure API Development
* Third-Party API Integration
* Payment Workflow
* Business Logic Implementation

---

#  Future Enhancements

* AI-Based Product Recommendation
* Email Notification System
* Push Notifications
* Analytics Dashboard
* Admin Reporting
* Docker Deployment
* CI/CD Pipeline
* Microservices Migration
* API Documentation using Swagger

---

#  Live Project

https://www.primegift.in

---

#  Developer

**Vivek Yadav**

GitHub

https://github.com/vivekyadav1050

---

#  License

This repository is shared for portfolio and educational purposes.

Unauthorized commercial reuse or redistribution of the source code is prohibited.
