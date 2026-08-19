# AdhiEMB – Digital Embroidery Design Marketplace

## Description
AdhiEMB is a digital marketplace for embroidery designs. It allows designers to upload their creations and customers to purchase and download them.

## Tech Stack
- **Backend**: Java 21, Spring Boot 3, Spring Security, JWT, Spring Data JPA, MySQL, Flyway
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, React Router, React Query, React Hook Form

## Architecture Overview
The system consists of a React frontend SPA and a Spring Boot REST API backend, backed by a MySQL database. Both frontend and backend can be containerized using Docker and orchestrated using Docker Compose.

## Prerequisites
- Java 21
- Node.js 18+
- MySQL 8
- Maven

## Getting Started

1. **Clone repo**
   ```bash
   git clone <repository-url>
   cd ecommere_digital_marketing
   ```

2. **Database setup:**
   ```sql
   CREATE DATABASE adhiemb_db;
   ```

3. **Backend:**
   ```bash
   cd adhiemb-backend
   mvn spring-boot:run
   ```

4. **Frontend:**
   ```bash
   cd adhiemb-frontend
   npm install
   npm run dev
   ```

## Default Accounts
| Role | Email | Password |
|---|---|---|
| Owner | owner@adhiemb.com | Owner@123 |
| Admin | admin@adhiemb.com | Admin@123 |

## API Documentation
Once the backend is running, access Swagger UI at:
http://localhost:8080/swagger-ui.html

## Project Structure
```
/
├── adhiemb-backend/     # Spring Boot application
├── adhiemb-frontend/    # React/Vite application
├── docker/              # Docker configurations (Compose, MySQL, Nginx)
└── README.md
```

## Phase Development Plan
- Phase 1: MVP with core marketplace features (auth, products, cart).
- Phase 2: Advanced search, filtering, order history, and user profiles.
- Phase 3: Analytics, reporting, designer dashboard, and marketing tools.

## License
MIT
