# AWS Architecture — StudySync

This document describes the AWS cloud architecture used for deploying and running the StudySync collaborative whiteboard application.

## Architecture Overview

StudySync is deployed as a containerized application on AWS, using managed services for database, hosting, networking, and monitoring.

```text
                         ┌──────────────┐
                         │  End Users   │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │ Route 53     │  DNS resolution
                         │ (DNS)        │  studysync.example.com
                         └──────┬───────┘
                                │
                  ┌─────────────┼─────────────┐
                  │                           │
           ┌──────▼───────┐           ┌──────▼───────┐
           │ CloudFront   │           │ ALB          │
           │ (CDN)        │           │ (Load        │
           │              │           │  Balancer)   │
           └──────┬───────┘           └──────┬───────┘
                  │                           │
           ┌──────▼───────┐           ┌──────▼───────┐
           │ S3 Bucket    │           │ ECS Fargate  │
           │ (Frontend)   │           │ (Backend)    │
           │              │           │              │
           │ React build  │           │ Node.js +    │
           │ static files │           │ Express +    │
           └──────────────┘           │ Socket.IO    │
                                      └──────┬───────┘
                                              │
                                      ┌──────▼───────┐
                                      │ RDS          │
                                      │ PostgreSQL   │
                                      │ (Database)   │
                                      └──────────────┘
```

## Main Components

| Component Name | AWS Service | Description |
|---|---|---|
| Amazon Route 53 | DNS | Domain name server that routes user requests to the correct AWS resources |
| Amazon Elastic Container Registry (ECR) | Container Registry | Fully managed container registry offering high-performance hosting for Docker images |
| Amazon Elastic Container Service (ECS) | Application Hosting | Runs highly secure, reliable, and scalable containers using Fargate (serverless) |
| Amazon Simple Storage Service (S3) | Frontend Hosting | Stores the React build output and serves it as a static website |
| Amazon Relational Database Service (RDS) | Database | Managed PostgreSQL 16 database for storing sessions, users, and AI summaries |
| Amazon CloudFront | CDN | Content delivery network that caches frontend assets globally for low-latency access |
| Elastic Load Balancing (ALB) | Load Balancer | Application Load Balancer that distributes HTTP/WebSocket traffic across ECS tasks |
| Amazon CloudWatch | Monitoring | Collects application logs, tracks metrics, and triggers health alarms |

## Micro Components

| Component Name | Description |
|---|---|
| Amazon Virtual Private Cloud (VPC) | Provides an isolated virtual network for all AWS resources, with public and private subnets |
| Security Groups | Acts as a virtual firewall that controls inbound and outbound traffic for each resource |
| AWS Identity and Access Management (IAM) | Securely manages identities and access to AWS services and resources |
| Elastic Load Balancing (ELB) | Distributes network traffic to improve application scalability and availability |
| Amazon Machine Images (AMI) | Supported and maintained image by AWS that provides the information required to launch an instance |

## Cloud Technology Component Mapping

| Component | Technology |
|---|---|
| **Application Hosting** | Node.js backend deployed on Amazon ECS Fargate |
| **Frontend Hosting** | React static build served via Amazon S3 + CloudFront CDN |
| **Database** | Amazon RDS PostgreSQL 16 for session, user, and summary data |
| **Real-Time Communication** | Socket.IO WebSockets via ALB with sticky sessions |
| **AI Integration** | Google Gemini API (external) for AI-powered session summaries |
| **Deployment** | Docker containers pushed to Amazon ECR, orchestrated by ECS |
| **Monitoring & Reliability** | Amazon CloudWatch for logging and metrics, ELB for traffic distribution |
| **Storage** | Amazon S3 for static frontend assets and canvas export files |
| **Network & Security** | Amazon VPC with Security Groups and IAM role-based access control |

## Security Architecture

### Network Security
- **VPC**: All resources are deployed within a private VPC
- **Public Subnets**: ALB and NAT Gateway only
- **Private Subnets**: ECS tasks and RDS instances (no direct internet access)

### Security Groups

| Security Group | Inbound Rules | Outbound Rules |
|---|---|---|
| ALB SG | Port 80/443 from `0.0.0.0/0` | Port 4000 to Backend SG |
| Backend SG | Port 4000 from ALB SG only | Port 5432 to Database SG, HTTPS to internet (Gemini API) |
| Database SG | Port 5432 from Backend SG only | None |

### IAM Roles

| Role | Purpose |
|---|---|
| ECS Task Execution Role | Allows ECS to pull images from ECR and write logs to CloudWatch |
| ECS Task Role | Allows the backend application to access S3 (canvas exports) |

## Deployment Flow

```text
Developer → git push → GitHub Actions (CI/CD)
                           │
                           ├─ Build backend Docker image
                           ├─ Push to Amazon ECR
                           ├─ Update ECS service (rolling deployment)
                           │
                           ├─ Build frontend (npm run build)
                           ├─ Sync dist/ to Amazon S3
                           └─ Invalidate CloudFront cache
```

## Cost Estimation (Development/Small Scale)

| Service | Estimated Monthly Cost |
|---|---|
| ECS Fargate (1 task, 0.5 vCPU, 1GB) | ~$15 |
| RDS PostgreSQL (db.t3.micro) | ~$15 |
| S3 + CloudFront | ~$1-5 |
| Route 53 | ~$0.50 |
| CloudWatch | Free tier |
| **Total** | **~$32-36/month** |
