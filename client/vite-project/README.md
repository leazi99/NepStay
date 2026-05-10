# KaamSathi Role-Based Test Cases

This checklist is organized by role and can be used for manual QA execution.

## Test Case Template

| Field | Description |
|---|---|
| Test Case ID | Unique ID, for example `ADM-001` |
| Priority | High / Medium / Low |
| Precondition | Required setup before running test |
| Steps | Action steps to execute |
| Expected Result | Expected system behavior |
| Actual Result | Fill during execution |
| Status | Pass / Fail / Blocked |

---

## Admin Test Cases

| Test Case ID | Priority | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| ADM-001 | High | Valid admin account exists | Login with valid admin email/password | Redirected to admin dashboard |
| ADM-002 | High | Logged in as employer or jobseeker | Open `/admin-dashboard` | Access denied and redirected to role dashboard |
| ADM-003 | High | Logged in as admin | Open admin dashboard | Overview cards load (users, employers, jobseekers, payments) |
| ADM-004 | Medium | Admin dashboard users tab open | Search by name/email, filter by role | Matching users shown, page reset works |
| ADM-005 | High | Target user exists | Change user role in admin panel | Role is updated and persists after refresh |
| ADM-006 | High | Admin logged in | Try changing own role from admin to non-admin | Blocked with validation error |
| ADM-007 | High | Target non-admin user exists | Suspend user with valid days (1-365) and reason | Suspension stored and user access blocked |
| ADM-008 | Medium | Admin logged in | Set invalid suspension days (0 or >365) | Validation error returned |
| ADM-009 | High | User has missing ID docs | Set verification status to pending/verified | Blocked until required docs are present |
| ADM-010 | Medium | Jobs exist | Delete one job from admin jobs section | Job removed and not visible on refresh |
| ADM-011 | High | Payments exist | Update payment status | Payment status updates and persists |
| ADM-012 | Medium | Admin logged in | Use pagination in users/jobs/payments/reports sections | Correct pages load without data duplication |

---

## Employer Test Cases

| Test Case ID | Priority | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| EMP-001 | High | Logged in as employer | Open `/employer-dashboard` | Dashboard loads successfully |
| EMP-002 | High | Logged in as employer | Open `/saved-jobs` | Access denied and redirected |
| EMP-003 | High | Employer logged in | Create job with valid required fields | Job created successfully |
| EMP-004 | High | Employer logged in | Submit job form with missing required fields | Validation shown, no job created |
| EMP-005 | Medium | Employer has at least one job | Edit existing job and save | Updated fields reflected in listing/details |
| EMP-006 | Medium | Employer has open job | Toggle job open/closed | Status badge and availability update |
| EMP-007 | High | Job has applicants | Open applicants page for that job | Applicant list loads with profile/status |
| EMP-008 | High | Applicant exists | Update applicant status (Accepted/Rejected) | Status updates and persists |
| EMP-009 | Medium | Analytics endpoint available or fallback data possible | Load employer dashboard | Analytics visible; fallback message shown if service incomplete |
| EMP-010 | High | Eligible application exists for payment | Initiate and complete payment flow | Payment created/confirmed with correct status |
| EMP-011 | Medium | Completed payment exists | Submit review (1-5 stars) | Review saved and removed from pending eligible reviews |
| EMP-012 | Medium | Employer profile exists | Update company profile (name/logo/website) | Profile updates persist after refresh |

---

## Jobseeker Test Cases

| Test Case ID | Priority | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| JS-001 | High | Logged out | Open `/freelancer-dashboard` and `/job/:jobId` | Jobs are browsable without login |
| JS-002 | High | Logged out | Click Apply on any job | Redirected to login/auth flow |
| JS-003 | High | Logged in as jobseeker | Apply to a job | Application created with pending status |
| JS-004 | High | Jobseeker has applied jobs | Open job dashboard | Applied jobs section shows submitted jobs and statuses |
| JS-005 | Medium | Logged in as jobseeker | Save and unsave a job | Saved state toggles and list updates |
| JS-006 | Medium | Jobseeker profile exists | Update profile fields (bio, education, specialization) | Profile changes persist |
| JS-007 | High | Logged in as jobseeker | Upload resume file | Resume URL saved and accessible |
| JS-008 | High | Logged in as jobseeker | Upload student ID card | Student ID URL saved and displayed |
| JS-009 | Medium | Chat room exists | Send message in messages page | Message delivered and visible |
| JS-010 | Medium | Notifications exist | Mark one and mark all as read | Read states update correctly |
| JS-011 | Medium | Completed payment eligible for review exists | Submit review from pending tab | Review succeeds and pending item removed |
| JS-012 | High | Logged in as jobseeker | Try `/employer-dashboard` or `/admin-dashboard` | Redirected to jobseeker dashboard |

---

## Cross-Role Security Checks

| Test Case ID | Priority | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| SEC-001 | High | No auth token | Call protected endpoint | Returns `401` unauthorized |
| SEC-002 | High | Expired token | Access protected route/API | Session rejected and re-login required |
| SEC-003 | High | Suspended user account | Login/access protected APIs | Returns `403` suspended response |
| SEC-004 | High | Non-admin token | Call admin endpoint | Returns `403` forbidden |
| SEC-005 | High | Role changed manually in frontend state | Navigate to protected route | Backend and route guards still enforce real role |


