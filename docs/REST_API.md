# 📡 InternFlow — REST API Documentation

## Base URL

```
http://localhost:4000/api
```

## Authentication

All protected endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Tokens are obtained from `/api/auth/login` or `/api/auth/register` and expire after 24 hours.

---

## 1. Authentication & User Profiles

### POST `/api/auth/register`
Register a new account (Role: `STUDENT` or `COMPANY_HR`).

**Body:**
```json
{
  "email": "student@test.com",
  "password": "password123",
  "name": "Somchai Student",
  "role": "STUDENT"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid-string",
    "email": "student@test.com",
    "name": "Somchai Student",
    "role": "STUDENT"
  },
  "token": "jwt_token_string"
}
```

### POST `/api/auth/login`
Authenticate existing user.

**Body:**
```json
{
  "email": "student@test.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid-string",
    "email": "student@test.com",
    "name": "Somchai Student",
    "role": "STUDENT"
  },
  "token": "jwt_token_string"
}
```

### GET `/api/student/profile`
Fetch authenticated student's profile details.

**Headers:** `Authorization: Bearer <token>` (Student only)

**Response (200):**
```json
{
  "id": "profile-id",
  "userId": "user-id",
  "studentId": "64010123",
  "major": "Computer Science",
  "faculty": "Engineering",
  "university": "Thammasat University (SIIT)",
  "year": 3,
  "gpa": 3.75,
  "skills": ["React", "Node.js", "TypeScript"],
  "bio": "Passionate software engineering intern.",
  "avatarUrl": "https://s3.ap-southeast-1.amazonaws.com/...",
  "user": {
    "id": "user-id",
    "name": "Somchai Student",
    "email": "student@test.com",
    "avatarUrl": null
  }
}
```

### PUT `/api/student/profile`
Update student academic details and skills.

**Body:**
```json
{
  "name": "Somchai Student",
  "studentId": "64010123",
  "major": "Computer Science",
  "faculty": "Engineering",
  "university": "Thammasat University (SIIT)",
  "year": 3,
  "gpa": 3.75,
  "bio": "Software developer looking for backend role.",
  "skills": ["React", "TypeScript", "PostgreSQL"],
  "avatarUrl": "https://..."
}
```

---

## 2. Corporate Job Postings

### GET `/api/jobs`
List all active internship postings (Public / Authenticated).

**Query Params:** `?search=developer&isRemote=true&faculty=Engineering`

### POST `/api/jobs`
Create a new internship listing.

**Headers:** `Authorization: Bearer <token>` (Company HR only)

**Body:**
```json
{
  "title": "Frontend Developer Intern",
  "department": "Engineering",
  "description": "Develop modern React web interfaces.",
  "requirements": "Proficiency in JavaScript/TypeScript & Tailwind CSS.",
  "location": "Bangkok, Thailand",
  "isRemote": false,
  "positions": 2,
  "allowance": "15,000 THB/month",
  "workingHours": "Mon-Fri 09:00 - 18:00",
  "contactEmail": "hr@techcorp.com",
  "contactPhone": "02-123-4567"
}
```

### PUT `/api/jobs/:id`
Edit an active internship posting (Company HR owner only).

### DELETE `/api/jobs/:id`
Delete an internship listing with safe cascade cleanup.

---

## 3. 3-Stage Application Pipeline

### POST `/api/applications`
Submit an internship application with multi-artifact documents & external links.

**Body:**
```json
{
  "jobPostId": "job-id",
  "coverLetter": "I am excited to apply for this internship...",
  "documents": [
    { "title": "Resume CV", "fileUrl": "https://s3.../resume.pdf", "type": "RESUME" },
    { "title": "GitHub Profile", "fileUrl": "https://github.com/somchai", "type": "LINK" }
  ]
}
```

### GET `/api/applications/my`
List authenticated student's submitted applications and real-time statuses (`PENDING`, `REVIEWING`, `ACCEPTED`, `REJECTED`).

### GET `/api/applications/company`
List all candidates applying to jobs posted by the authenticated company HR.

### PATCH `/api/applications/:id/status`
Update candidate status (`ACCEPTED` or `REJECTED`).

**Body:**
```json
{
  "status": "ACCEPTED"
}
```

---

## 4. Weekly Logbook & Mentor Sign-Off

### POST `/api/logbook`
Create or update a weekly work journal.

**Body:**
```json
{
  "weekNumber": 1,
  "hoursWorked": 40,
  "workModality": "ONSITE",
  "objectives": ["Setup local development environment", "Review architecture docs"],
  "tasksCompleted": ["Configured PostgreSQL and Docker", "Ran test suite"],
  "challengesFaced": "Faced minor dependency conflicts with Tailwind v4",
  "solutionsFound": "Resolved using latest Vite Tailwind plugin configuration",
  "supervisorName": "John Mentor",
  "attachments": [
    { "title": "Week 1 Summary Slides", "url": "https://s3.../week1.pdf" }
  ]
}
```

### GET `/api/logbook/my`
Fetch authenticated student's weekly logs and total approved hour counts.

### GET `/api/logbook/student/:studentId`
Inspect weekly logs of an intern placed at the company (HR / Mentor).

### PUT `/api/logbook/:id/approve`
Company Mentor signs off and awards weekly rating.

**Body:**
```json
{
  "approved": true,
  "rating": 5,
  "feedback": "Excellent work during the first week on-site!"
}
```

---

## 5. Employer Performance Evaluation & Reports

### GET `/api/evaluations/company`
List all active interns placed at the company and their evaluation rubric status.

### POST `/api/evaluations/submit`
Submit final 3-category rubric assessment.

**Body:**
```json
{
  "applicationId": "application-id",
  "workQualityScore": 5,
  "punctualityScore": 5,
  "teamworkScore": 5,
  "feedback": "Outstanding performance and proactive attitude throughout the internship."
}
```

### GET `/api/evaluations/report/:studentId`
Generate official internship completion certificate & performance assessment report.

### POST `/api/upload`
Upload files (PDFs, Images) directly to AWS S3.

**Form-Data:** `file: <binary>`, `type: "AVATAR" | "RESUME" | "LOGBOOK"`
