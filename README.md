# 🎓💼 InternFlow — Multi-University Internship Management & Tracking Platform

A modern, cloud-based platform connecting students, university administrators, and company HR professionals into a single seamless workflow for finding, applying, and approving internship placements — designed for deployment on **Amazon Web Services (AWS)**.

## ✨ Features

- **Centralized Job Board** — Students can browse and search for active internship opportunities from partnered companies in a clean Card View format.
- **One-Click Apply & S3 CV Upload** — Seamless application process allowing students to send their profile and upload their CVs directly to AWS S3.
- **Real-Time Application Tracking** — Students monitor the status of their applications (Pending, Reviewing, Accepted, Rejected).
- **Dynamic Role-Based Dashboards** — Real-time analytics and live activity feeds tailored for Students, HRs, and University Admins (`/api/dashboard/stats`).
- **HR Applicant Review Pipeline** — Company HR can post jobs, review student profiles, preview uploaded CVs directly, and manage application statuses.
- **University Approval Workflow** — University administrators monitor student progress and officially approve verified internship placements.
- **Database Integrity & Anti-Duplication** — Enforced Prisma compound unique constraints preventing race-condition duplicate submissions.
- **Role-Based Access Control (RBAC)** — Secure authentication system separating Student, Company HR, and University Admin workflows.

## 🏗️ Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                              Amazon VPC                                      │
│                                                                              │
│  ┌─────────────┐     ┌──────────────────────────────────────────────────┐   │
│  │ Amazon S3 + │     │           Amazon EC2 / ECS                       │   │
│  │ CloudFront  │     │                                                  │   │
│  │ (Frontend)  │     │  ┌─────────────────────────────────────────┐    │   │
│  │             │     │  │  Backend Service (Node.js + Express)    │    │   │
│  │ React Build │────▶│  │  REST API + Multer (S3 Upload)          │    │   │
│  │ Static Site │     │  └────────────┬────────────────────────────┘    │   │
│  └─────────────┘     │               │                                  │   │
│                      │     ┌─────────▼─────────┐                       │   │
│  ┌──────────┐        │     │  Elastic Load     │                       │   │
│  │ Route 53 │────────│────▶│  Balancer (ALB)   │                       │   │
│  │ (DNS)    │        │     └───────────────────┘                       │   │
│  └──────────┘        └──────────────────────────────────────────────────┘   │
│                                       │                                      │
│                      ┌────────────────▼────────────────┐                    │
│                      │   Amazon RDS PostgreSQL 16      │                    │
│                      │   (Multi-AZ, managed database)  │                    │
│                      └─────────────────────────────────┘                    │
│                                                                              │
│  Security Groups: Frontend SG ─ Backend SG ─ Database SG                   │
└──────────────────────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌──────────────────┐   ┌────────────────────┐
│ Amazon S3        │   │ Amazon CloudWatch  │
│ (CV & Resume     │   │ (Monitoring &      │
│  File Storage)   │   │  Logging)          │
└──────────────────┘   └────────────────────┘
```

## ☁️ AWS Cloud Technology Components

### Main Components

| Component Name | AWS Service | Description |
|---|---|---|
| DNS Management | Amazon Route 53 | Domain name resolution and routing for the application |
| Container Registry | Amazon ECR | Fully managed Docker container registry for backend images |
| Application Hosting | Amazon EC2 / ECS | Virtual servers or serverless container hosting for the Node.js backend |
| Frontend Hosting | Amazon S3 + CloudFront | Static site hosting with global CDN for fast React app delivery |
| File Storage | Amazon S3 | Secure cloud storage for uploading student CVs and Resumes |
| Database | Amazon RDS PostgreSQL | Managed relational database for users, jobs, and applications |
| Load Balancing | Elastic Load Balancing (ALB) | Distributes traffic to the backend API |
| Monitoring & Logging | Amazon CloudWatch | Application logs, performance metrics, and health alarms |

### Micro Components

| Component Name | Description |
|---|---|
| Amazon Virtual Private Cloud (VPC) | Isolated virtual network containing all AWS resources |
| Security Groups | Firewall rules controlling inbound/outbound traffic per resource |
| AWS Identity and Access Management (IAM) | Manages permissions for services, especially for S3 file uploads |
| Elastic Load Balancing (ELB) | Distributes network traffic to improve application scalability |

### Cloud Technology Summary

| Component | Technology |
|---|---|
| **Application Hosting** | Node.js backend deployed on Amazon EC2 / ECS |
| **Frontend Hosting** | React static build on Amazon S3 with CloudFront CDN |
| **Database** | Amazon RDS PostgreSQL for structured relational data |
| **File Storage** | Amazon S3 via `multer-s3` for handling multipart file uploads |
| **Deployment** | Docker containers pushed to Amazon ECR, deployed via docker-compose/ECS |
| **Monitoring & Reliability** | Amazon CloudWatch for logs and Elastic Load Balancing for uptime |
| **Network & Security** | Amazon VPC with Security Groups and IAM policies |

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React |
| Backend | Node.js, Express, TypeScript |
| File Uploads | Multer, AWS SDK v3 (`@aws-sdk/client-s3`), `multer-s3` |
| Database | Amazon RDS PostgreSQL + Prisma ORM |
| Application Hosting | Amazon EC2 / Amazon ECS |
| Frontend Hosting | Amazon S3 + Amazon CloudFront |
| Load Balancer | Elastic Load Balancing (ALB) |
| DNS | Amazon Route 53 |
| Deployment | Docker + Docker Compose (local & EC2) |
| Project Management | Jira Software (Agile Scrum Board & Sprint Tracking) |

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- AWS Account & Credentials (Optional for local dev, required for S3 uploads)

### Docker Compose (Recommended)

```bash
# 1. Clone and configure
git clone https://github.com/Justsaucz/InternFlow.git
cd InternFlow
cp backend/.env.example backend/.env
# Edit .env to add your AWS Keys and JWT Secret

# 2. Start everything
docker compose up -d --build

# 3. Setup Database Schema
cd backend
npx prisma migrate deploy

# 4. Open the app
# Frontend: http://localhost:3000
# Backend:  http://localhost:4000
```

### First Use

1. Open `http://localhost:3000`
2. Register an account (Choose Student, Company HR, or University Admin)
3. **Company**: Post a new internship position.
4. **Student**: Browse jobs, upload CV/Resume, and submit an application.
5. **Company**: Review applicants, inspect uploaded CVs, and click "Accept".
6. **University**: Review placed students and click "Approve Placement" for academic validation.

## 📂 Project Structure

```text
├── docker-compose.yml          # Local dev orchestration (mirrors EC2 setup)
│
├── backend/
│   ├── .env.example            # Environment variables template (AWS Keys, DB)
│   ├── Dockerfile              # Backend build definition
│   ├── prisma/schema.prisma    # Database schema (User, JobPost, Application, Document)
│   └── src/
│       ├── index.ts            # Express server entry point
│       ├── middleware/         # Auth (JWT) & Role verification
│       ├── routes/             # REST API (auth, dashboard, jobs, applications, student, admin, upload)
│       └── types/              # TypeScript interfaces
│
├── frontend/
│   ├── Dockerfile              # Frontend build stage
│   └── src/
│       ├── App.tsx             # Root with routing
│       ├── index.css           # Tailwind configurations
│       ├── components/         # Reusable UI components
│       └── pages/              # Role-specific Dashboards & Landing Page
│           ├── admin/          # University workflows (Approvals, Directory)
│           ├── company/        # HR workflows (Job creation, Applicant review)
│           ├── student/        # Job search, My applications, Profile
│           └── Home.tsx        # Modern Landing Page
```

## ☁️ AWS Deployment Guide

### Step 1: Push Docker Image or Clone on EC2

The simplest deployment method is provisioning an **Amazon EC2** instance (Ubuntu 24.04, t3.small), installing Docker, and cloning this repository directly.

```bash
ssh -i "path/to/key.pem" ubuntu@<EC2_IP>
git clone https://github.com/Justsaucz/InternFlow.git
cd InternFlow
cp backend/.env.example backend/.env
# Edit .env with your RDS URL and S3 Bucket Keys
docker compose up -d --build
```

### Step 2: Configure Amazon S3 for File Uploads

1. Go to AWS S3 and create a bucket (e.g., `internflow-bucket`).
2. Go to AWS IAM and create a user with programmatic access.
3. Attach the `AmazonS3FullAccess` policy (or a custom restricted policy).
4. Copy the `Access Key` and `Secret Key` into your `.env` file.

### Step 3: Setup Amazon RDS PostgreSQL

```bash
aws rds create-db-instance \
  --db-instance-identifier internflow-db \
  --engine postgres \
  --engine-version 16 \
  --db-instance-class db.t3.micro \
  --allocated-storage 20 \
  --master-username admin \
  --master-user-password <STRONG_PASSWORD> \
  --vpc-security-group-ids <DB_SG_ID>
```
Once created, update your `DATABASE_URL` in the `.env` file to point to this RDS endpoint.

## 🔗 REST API

Key endpoints:
- `POST /api/auth/register` — Register a new user (Student/HR/Admin)
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/dashboard/stats` — Role-based live analytics & activity metrics
- `POST /api/upload` — Upload CV/Resume to AWS S3 (Returns S3 URL)
- `GET /api/jobs` — List all active job postings
- `POST /api/jobs` — Create a new job posting (HR only)
- `GET /api/jobs/company` — List jobs posted by logged-in HR
- `POST /api/applications` — Apply to a job with CV upload
- `GET /api/applications/my` — Student view of submitted applications
- `GET /api/applications/company` — Company HR view of incoming applicants
- `PATCH /api/applications/:id/status` — Accept or Reject an applicant (HR)
- `GET /api/applications/university` — University Admin view of student placements
- `PATCH /api/applications/:id/approve` — Final approval of placement (Uni Admin)
- `GET /api/student/profile` — Fetch student academic profile
- `PUT /api/student/profile` — Update student profile & skills
- `GET /api/admin/students` — University student directory

## 🔒 Security

- **Role-Based Access Control (RBAC)**: Strict API route protection ensuring Students cannot access HR routes, and HR cannot approve internships.
- **JWT Auth**: Tokens used for session management.
- **Password Hashing**: `bcrypt` used for securing user credentials.
- **IAM Policies**: AWS SDK uses dedicated IAM keys with least-privilege access for S3 uploads.
- **Network Isolation**: EC2/RDS deployed in VPC with restricted Security Groups.

## 📈 Scalability on AWS

| Concern | AWS Solution |
|---|---|
| Multiple server instances | Migrate from single EC2 to ECS Fargate with auto-scaling |
| File Storage | Amazon S3 ensures infinite scalability for CV uploads |
| Database performance | Amazon RDS Multi-AZ with read replicas |
| Global latency | CloudFront CDN for frontend static assets |

## 👥 Team Responsibilities

| Person | Area |
|---|---|
| 1 | Frontend Dashboards (Student, HR, University UI) |
| 2 | Backend Auth & RBAC Logic |
| 3 | Database Design (Prisma Schema) & Workflows |
| 4 | File Upload Integration (Multer + AWS S3) |
| 5 | DevOps & AWS infrastructure (EC2, RDS, S3, Docker) |
| 6 | Testing/QA + Documentation |

## 📄 License

MIT
