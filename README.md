# InternFlow

Internship and Cooperative and Work-Integrated Education (CWIE) Management Platform.

**DES424 | Cloud-based Application Development**<br>
Digital Engineering Department, Semester 1, Academic Year 2026<br>
Sirindhorn International Institute of Technology (SIIT), Thammasat University<br>
**Group 6**

## Application Demo

**[Open InternFlow on AWS](https://d3lithmz8huyc9.cloudfront.net/)**<br>
[Sign in](https://d3lithmz8huyc9.cloudfront.net/#/login) · [Create an account](https://d3lithmz8huyc9.cloudfront.net/#/register)

The AWS demonstration is operated on demand to conserve the course cloud budget. When the backend and database are paused, the landing page may remain available, but sign-in and other data-dependent functions will be unavailable. The project team must resume the cloud resources before a demonstration.

## Project Description

### Overview

InternFlow connects students and company HR in one internship workflow: discovering opportunities, submitting applications, reviewing candidates, confirming a placement, recording daily work, and completing an employer evaluation.

The application supports student and company accounts. Company HR also performs the mentor role for logbook approval and evaluation. This repository contains the **DES424 Project version**; the separate Teerayut submission may contain different features.

### Application Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js 24, Express 5, TypeScript |
| Database | PostgreSQL 16, Prisma 7 |
| Authentication | JSON Web Tokens (JWT), bcrypt password hashing |
| File storage | Local storage for development; private Amazon S3 storage on AWS |
| Testing | Robot Framework with SeleniumLibrary; Node.js API regression tests |
| Packaging | Docker production builds and Docker Compose for local deployment |

Frontend source is located in [frontend](frontend), backend source in [backend](backend), and the database schema and migrations in [backend/prisma](backend/prisma).

### Cloud Services Usage

InternFlow is deployed on AWS in the **Asia Pacific (Sydney), ap-southeast-2** Region. Amazon CloudFront provides the public HTTPS endpoint and delivers the React frontend from a private S3 bucket using Origin Access Control (OAC). API and public image requests are forwarded to an Application Load Balancer.

The Node.js Express API runs on ECS Fargate in private application subnets. PostgreSQL runs on a private RDS instance, and uploaded files are stored in a separate private S3 bucket. IAM roles control service access, ECR stores container images, and CloudWatch collects application logs.

The demonstration uses **one ECS task and a Single-AZ RDS instance**. Although subnet pairs span two Availability Zones, this configuration does not provide full Multi-AZ application availability. Browser-to-CloudFront connections use HTTPS; CloudFront-to-ALB traffic uses HTTP in the current deployment.

### Deployment Configuration

Deployment is performed manually using the AWS CLI in CloudShell. Backend and migration images are built with Docker, pushed to ECR, and used by ECS. The frontend is built into static files, uploaded to S3, and refreshed through CloudFront cache invalidation.

The production Dockerfiles are [backend/Dockerfile.production](backend/Dockerfile.production) and [frontend/Dockerfile.production](frontend/Dockerfile.production). The frontend Docker build exports static assets for AWS; a frontend container does not run on ECS.

Automatic GitHub Actions deployment is not configured. Files in [deploy/aws](deploy/aws) are templates that require account-specific values; they are not a complete record of the live configuration.

### Software Testing and QA

Robot Framework and SeleniumLibrary test the main browser workflows:

- Authentication and sign-out.
- Job discovery and application submission.
- Application pipeline and placement commitment.
- Daily logbook entry and review.
- Mentor review and internship evaluation.

The report-style scripts are located in [backend/tests/robot/report_style_ui](backend/tests/robot/report_style_ui). Their 30 test cases represent workflow steps across five modules, including browser setup and closure; they are not 30 separate business requirements.

The AWS deployment was also checked through real browser and API workflows, including file access permissions, exclusive placement commitment, logbook approval, evaluations, and cancellation history. These cloud checks are separate from the local Robot Framework results.

## Project Features

### Students

- Register, sign in, and maintain a student profile with academic details and skills.
- Search and filter internship postings and view job requirements.
- Apply with a cover message, uploaded documents, and portfolio links.
- Track application statuses and view offers.
- Commit to one placement within InternFlow; competing active applications are closed automatically.
- Request placement cancellation for company review.
- Record daily tasks, hours worked, work modality, problems, solutions, and learning outcomes after placement commitment.
- View approved hours, mentor feedback, and the printable internship evaluation report.

### Company HR and Mentors

- Register, sign in, and maintain a company profile and logo.
- Create, edit, and close internship postings.
- Review applicants and access documents associated with their own applications.
- Update screening, interview, offer, and rejection statuses. Interview details are coordinated outside the application.
- Review placement cancellation requests.
- Inspect daily logs, approve entries, and provide ratings and feedback.
- Complete an employer evaluation covering work quality, punctuality, and teamwork.

### Workflow and Data Protection

- Role-based access separates student and company actions.
- Academic information and private documents are restricted to the owner and authorized related employers.
- Public profile images are handled separately from private application documents.
- Approved logbook entries are protected from student changes.
- Historical placement records remain available after cancellation.
- Job deletion is blocked when protected placement, logbook, or evaluation history exists; the posting can be closed instead.
- Thai/English interface support and responsive layouts are available, with some text remaining in English.

## Cloud Resources

| AWS Service | Purpose |
| --- | --- |
| Amazon CloudFront | Public HTTPS access, frontend delivery, and routing to the API origin |
| Amazon S3 | Separate private buckets for frontend assets, uploads, and application configuration |
| Amazon ECS with AWS Fargate | One backend task with 0.25 vCPU and 0.5 GB memory |
| Amazon ECR | Backend runtime and database migration container images |
| Amazon RDS | PostgreSQL 16.15, Single-AZ db.t4g.micro, 20 GB gp3 storage |
| Application Load Balancer | Routes requests to the API on port 4000 and checks /api/ready |
| Amazon VPC and Subnets | Separate public, private application, and isolated database tiers |
| Security Groups | Restrict traffic between CloudFront, the ALB, ECS, and RDS |
| AWS IAM | ECS execution and task roles for the required AWS permissions |
| Amazon CloudWatch | Backend and migration logs with seven-day retention |

## Local Deployment

### Prerequisites

- Git.
- Docker with Docker Compose for the container setup.
- Alternatively, Node.js 24 and PostgreSQL 16 for native development.
- Python 3.10+ and Google Chrome for Robot Framework tests.

An AWS account is not required to run the application locally with local file storage.

### Installation with Docker Compose

1. Clone the repository and enter its directory.

   ~~~powershell
   git clone https://github.com/Justsaucz/InternFlow.git
   cd InternFlow
   ~~~

2. Copy the local deployment environment example.

   ~~~powershell
   Copy-Item deploy/.env.example deploy/.env.local
   ~~~

3. Open deploy/.env.local and set separate random hexadecimal values of at least 32 characters for DB_PASSWORD and JWT_SECRET. Keep this file private.

4. Build and start the application.

   ~~~powershell
   docker compose -f deploy/compose.local.yml --env-file deploy/.env.local up -d --build --wait
   ~~~

5. Open **http://127.0.0.1:8088** and register a student or company account.

This setup starts PostgreSQL, applies database migrations, starts the API, and serves the frontend through Nginx. It does not create AWS resources or automatically seed demo accounts.

To stop the local containers while retaining the database and uploaded files:

~~~powershell
docker compose -f deploy/compose.local.yml --env-file deploy/.env.local down
~~~

### Native Development

Create backend/.env from [backend/.env.example](backend/.env.example). Set DATABASE_URL for an existing local PostgreSQL database, choose a strong JWT_SECRET, and keep STORAGE_MODE=local.

Install and start the backend:

~~~powershell
cd backend
npm ci
npx prisma generate
npm run db:migrate
npm run dev
~~~

In another terminal, install and start the frontend from the repository root:

~~~powershell
cd frontend
npm ci
npm run dev
~~~

Open **http://localhost:3000**. The API runs on port **4000** by default. Run database migrations only against the intended database.

## Running Tests

Install both frontend and backend dependencies and configure backend/.env for local PostgreSQL first. The test database user needs permission to create temporary databases.

From the backend directory:

~~~powershell
npm test
node --test tests/migrations.test.cjs tests/config.test.cjs
python -m pip install -r tests/robot/requirements.txt
python tests/robot/report_style_ui/run_ui_tests.py --outputdir ../../output/InternFlow_Robot_UI_Style
~~~

The Robot runner starts isolated local services with fictional test data. It produces report.html, log.html, output.xml, and browser screenshots in the output directory. See the [browser test instructions](backend/tests/robot/report_style_ui/README.md) for fixture details.

## Project Scope

The DES424 version focuses on the internship application, placement, logbook, and evaluation workflow. AI portfolio screening, OCR verification, questionnaires, automated notifications, password recovery, email verification, and paid promotions are not implemented in this version.

The printable evaluation report records employer feedback; it is not university accreditation or an automatically issued completion certificate. Placement exclusivity applies to activity inside InternFlow and cannot prevent a student from accepting an opportunity outside the platform.

Keep environment files, credentials, private uploads, and database backups out of the repository.
