# Security Specification & Threat Model

## 1. Data Invariants
1. **User Identity & Role Immutability**: A user can only create their own user document (`request.auth.uid == userId`). The `role` field cannot be elevated to `admin` or mutated arbitrarily by client requests.
2. **PII and Profile Privacy**: Candidate contact details and non-public profiles are only visible to the profile owner or to verified companies if the student explicitly set `profileVisibility: "public"`.
3. **Company Verification Integrity**: A company document can only be created by its verified recruiter (`ownerUid == request.auth.uid`). The `verificationStatus` field starts as `"pending"` and cannot be escalated to `"verified"` by the company user.
4. **Job Posting Authorization**: Jobs can only be created, updated, or closed by the company that owns the `companyId` (`request.auth.uid == companyId`). Unverified companies cannot make active public job postings.
5. **Application Boundary**: A student can only apply as themselves (`candidateUid == request.auth.uid`). Only the job-owning company can modify application review states (`under_review`, `shortlisted`, `interview`, `selected`, `rejected`).
6. **Quiz Tampering Prevention**: Quiz answers cannot be altered after submission. Only active quizzes can be taken. Official score calculations cannot be arbitrarily overridden.
7. **Size & Schema Enforcements**: Every text field has length boundaries (`size() <= MAX`) to protect against Denial of Wallet and storage exhaustion attacks.

---

## 2. The "Dirty Dozen" Threat Payloads (Must be rejected)

1. **Payload 1 (Ghost Admin Privilege Escalation)**: Attacker attempts to set `role: "admin"` on registration to access privileged data.
2. **Payload 2 (Self-Verification Bypass)**: Unverified company recruiter attempts to update `companies/{id}` with `verificationStatus: "verified"`.
3. **Payload 3 (Profile Identity Spoofing)**: Attacker attempts to write or update `/users/victimUid` with their own auth token.
4. **Payload 4 (Private Profile Scraping)**: Recruiter attempts to query or read candidate `/users/student123` where `profileVisibility == "private"`.
5. **Payload 5 (Impersonated Job Creation)**: Attacker attempts to post a job on behalf of a top tech MNC by setting `companyId: "google-uid"`.
6. **Payload 6 (Job Hijacking)**: Attacker attempts to edit or delete another company's active job listing.
7. **Payload 7 (Application Status Forgery)**: Student applicant attempts to update their own application status directly to `"selected"`.
8. **Payload 8 (Unauthorized Application Snooping)**: Non-owner recruiter attempts to read applications submitted to another company's job.
9. **Payload 9 (Quiz Score Manipulation)**: Student attempts to update `quizAttempts/{id}` setting `score: 100` and `percentage: 100`.
10. **Payload 10 (Denial-of-Wallet String Injection)**: Attacker attempts to create a profile bio with 2MB junk text.
11. **Payload 11 (Unauthenticated Data Write)**: Unauthenticated visitor attempts to create or modify user profiles or job postings.
12. **Payload 12 (Direct Object Reference Poisoning)**: User attempts to write to an invalid path ID with SQL/Script injection characters.

---

## 3. Security Rule Assertions
- All 12 payloads must be blocked and return `PERMISSION_DENIED`.
- Catch-all fallback rule `match /{document=**} { allow read, write: if false; }` enforces default-deny.
- Verified identity checking via `request.auth.uid`.
