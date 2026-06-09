# MUN Conference Portal — Product Specification (v1.0)

## Project Overview

A web-based conference management platform for a school Model United Nations (MUN) conference.

The platform allows delegates, chairs, and administrators to access conference information, view resolutions, submit amendments, and manage committee operations through a centralized portal.

Primary goals:

* Replace paper-heavy workflows
* Make resolutions accessible live
* Streamline amendment submission
* Centralize committee logistics
* Reduce administrative overhead

Target users:

* Delegates
* Committee Chairs
* Conference Administrators

Deployment target:

* Web application hosted on Vercel (preferred) or school infrastructure.

---

# 1. Functional Requirements

---

## 1.1 Authentication

### Purpose

Allow conference participants to securely access conference information.

### Requirements

Users log in using:

* Email address
* Unique conference access code

Accounts are pre-created.

No:

* Public signup
* Password reset
* Registration inside application

### Login Flow

User:

```
Email
Access Code
```

System:

```
Validate credentials
→ Create session
→ Redirect based on role
```

Roles:

* Delegate
* Chair
* Admin

---

## 1.2 Delegate Dashboard

### Purpose

Provide delegates with conference information and access to resolutions.

### Features

Display:

Profile:

* Name
* School
* Country / Delegation
* Committee
* Room Number

Conference:

* Committee details
* School map
* Resolution access

Actions:

* View resolutions
* Filter resolutions
* Submit amendments (restricted)

---

## 1.3 Resolution System

### Purpose

Allow users to browse conference resolutions.

### Visibility Rules

All authenticated users may:

* View ALL resolutions

Filtering:

* Committee
* Country
* Delegation
* Resolution status
* Search

---

### Resolution Metadata

Each resolution contains:

```text
Title
Topic
Country
Committee
Status
Creation Date
Uploaded By
```

---

### Resolution Content

Resolution source:

```
.docx upload
```

Stored as:

```text
Original DOCX
+
Rendered HTML
(Optional PDF)
```

Display:

Primary:

* HTML-rendered version

Optional:

* Open official PDF view

Formatting goals:

* Preserve:

  * Bold
  * Underline
  * Numbering
  * Paragraph spacing
  * Headers
  * Lists

Resolution text is NOT stored as plain text.

---

## 1.4 Amendment System

### Purpose

Allow delegates to suggest modifications to resolutions.

### Rules

Delegates:

* May view all resolutions
* May submit amendments ONLY to resolutions in their own committee

Validation:

```text
user.committee_id
==
resolution.committee_id
```

Server-side validation required.

---

### Amendment Submission

Fields:

```text
Resolution
Proposed Amendment
Optional Explanation
Timestamp
```

Workflow:

```
Submit
→ Pending
→ Chair Review
→ Approved / Rejected
```

Statuses:

* Pending
* Approved
* Rejected

---

## 1.5 Chair Dashboard

### Purpose

Allow committee chairs to manage committee content.

### Access

Only resolutions belonging to assigned committee.

### Features

Resolutions:

* Upload DOCX
* Edit metadata
* Replace resolution file
* Publish

Amendments:

* View pending
* Approve
* Reject

Committee:

* View delegates

---

## 1.6 Admin Dashboard

### Purpose

Provide complete conference oversight.

### Features

Users:

* Create
* Edit
* Delete
* Assign roles

Committees:

* Manage

Resolutions:

* Manage globally

Conference:

* View all activity

---

## 1.7 CSV Import System

### Purpose

Bulk-create users.

### Input

CSV exported from spreadsheet.

Columns:

```csv
name
email
school
country
committee
allergies
role
```

Import Process:

```
Upload CSV
→ Parse
→ Generate codes
→ Create users
→ Assign committees
```

Generated:

```text
login_code
```

---

## 1.8 Navigation / Venue System

### Purpose

Help users navigate conference.

Display:

* Committee room
* Room number
* School map image

Optional:

* Floor maps

---

# 2. Non-Functional Requirements

Performance:

* Page load < 2 seconds

Availability:

* Entire conference duration

Scalability:

* 100–500 concurrent users

Security:

* Session authentication
* Role-based authorization
* Backend validation

Mobile:

* Responsive design

Browser Support:

* Chrome
* Safari
* Firefox
* Edge

---

# 3. Database Schema

---

## Users

```sql
id
name
email
login_code
school
country
committee_id
role
allergies
created_at
```

---

## Committees

```sql
id
name
room_number
chair_user_id
```

---

## Resolutions

```sql
id
title
topic
country
committee_id

original_docx_path
rendered_html
pdf_path

status

uploaded_by
created_at
updated_at
```

---

## Amendments

```sql
id

resolution_id
user_id

text
description

status

created_at
reviewed_at
reviewed_by
```

---

# 4. System Architecture

Frontend:

```text
Next.js
```

Backend:

```text
Next.js API Routes
```

Database:

```text
SQLite
```

ORM:

```text
Prisma
```

Storage:

```text
Local / Vercel Blob
```

Deployment:

```text
Vercel
```

---

# 5. Permission Matrix

| Action            |       Delegate | Chair | Admin |
| ----------------- | -------------: | ----: | ----: |
| Login             |              ✓ |     ✓ |     ✓ |
| View resolutions  |              ✓ |     ✓ |     ✓ |
| Submit amendment  | Committee only |     ✓ |     ✓ |
| Upload resolution |              ✗ |     ✓ |     ✓ |
| Approve amendment |              ✗ |     ✓ |     ✓ |
| Manage users      |              ✗ |     ✗ |     ✓ |
| View room info    |              ✓ |     ✓ |     ✓ |

---

# 6. Pages

```text
/login

/dashboard

/resolutions

/resolution/[id]

/committee

/chair

/admin
```

---

# 7. MVP Scope (Build Order)

Phase 1

* Database
* Authentication

Phase 2

* Delegate dashboard
* Resolution viewing

Phase 3

* Amendment system

Phase 4

* Chair tools

Phase 5

* Admin tools

Phase 6

* CSV import

Phase 7

* Deployment

---

## Success Criteria

Conference participants can:

* Log in successfully
* View resolutions with preserved formatting
* Submit amendments correctly
* Access committee logistics
* Operate without paper distribution

Conference organizers can:

* Upload participants
* Publish resolutions
* Review amendments
* Run conference operations from the portal


