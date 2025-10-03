# Complaints System Documentation

## Overview
The complaints system is a **hall-specific, role-based feature** that allows students to report issues and hall administrators/staff to review and respond to them.

## Access Control

### Who Can Access Complaints?

#### ✅ **Students** (Can File & View Own)
- Can file new complaints about their hall
- Can view only their own complaints
- Can attach optional proof files
- See admin responses and status updates
- **Hall-bound:** Complaints automatically tied to their assigned hall

#### ✅ **Hall Administrators** (Can Review & Respond)
- Can view all complaints **from their assigned hall only**
- Can update complaint status
- Can add response notes visible to students
- Cannot see complaints from other halls
- **Hall-bound:** Only see complaints from their hall

#### ✅ **Hall Staff** (Can Review & Respond)
- Same permissions as Hall Administrators
- Can view all complaints **from their assigned hall only**
- Can update status and add responses
- **Hall-bound:** Only see complaints from their hall

#### ❌ **Exam Controllers** (No Access)
- Exam controllers have **no access** to the complaints system
- No hall boundaries apply to their role
- Complaints link hidden from navigation for exam controllers

## Features

### For Students

#### Filing a Complaint
1. Navigate to **Complaints** page
2. Fill in the form:
   - **Title** (required): Brief summary of the issue
   - **Description** (required): Detailed explanation
   - **Attachments** (optional): Upload proof files (images, PDFs, etc.)
3. Click **Submit Complaint**
4. Complaint is automatically assigned to student's hall
5. Initial status: **Open**

#### Viewing My Complaints
- See all your filed complaints
- View current status (Open, In Progress, Resolved, Closed)
- Read admin responses and notes
- See attached files
- Track complaint history

### For Admins & Staff

#### Reviewing Hall Complaints
- See all complaints filed by students **in your hall only**
- View complaint details:
  - Student name
  - Filing date
  - Description
  - Attachments
  - Current status
  - Previous responses (if any)

#### Responding to Complaints
1. Read the complaint details
2. Add response notes (optional but recommended)
3. Update status:
   - **In Progress**: Acknowledged, working on it
   - **Resolved**: Issue fixed
   - **Closed**: No further action needed
4. Response notes are visible to the student

## Status Workflow

```
Open → In Progress → Resolved → Closed
  ↓         ↓            ↓
  ⤷─────────⤷────────────⤷ Can jump to any status
```

### Status Meanings
- **Open**: New complaint, awaiting review
- **In Progress**: Admin/staff is working on it
- **Resolved**: Issue has been fixed
- **Closed**: Complaint finalized, no further action

## Data Structure

### Complaint Object
```javascript
{
  id: 'c-1234567890',
  userId: 'student-ash',           // Who filed it
  hallId: 'hall-ash',              // Which hall (auto-assigned)
  title: 'Room AC not working',
  body: 'Detailed description...',
  attachments: ['proof.jpg', 'receipt.pdf'], // Optional files
  status: 'Open',                  // Current status
  createdAt: 1696204800000,        // Timestamp
  reviewedBy: 'admin-ash',         // Who reviewed (admin/staff ID)
  reviewNotes: 'Maintenance scheduled', // Admin response
  updatedAt: 1696291200000         // Last update timestamp
}
```

## Hall Isolation Rules

### ✅ Hall-Specific Data
- Each complaint is tied to exactly **one hall**
- Students can only file complaints about their assigned hall
- Admins/staff see only complaints from their assigned hall
- No cross-hall visibility

### Example Scenario
- **Student at ASH** files complaint → Complaint saved with `hallId: 'hall-ash'`
- **Admin of ASH** logs in → Sees only ASH complaints
- **Admin of MUH** logs in → Sees only MUH complaints (NOT ASH complaints)
- **Exam Controller** logs in → Cannot access complaints at all

## Security & Validation

### Student Validation
- Only users with `role: 'student'` can file complaints
- Complaint is automatically linked to student's `hallId`
- Cannot file complaints for other halls

### Admin/Staff Validation
- Can only view complaints where `complaint.hallId === user.hallId`
- Can only update complaints from their hall
- Response is tracked with reviewer's user ID

## UI Features

### Student View
- Clean complaint form with validation
- File upload with preview
- Status badges with color coding:
  - 🟡 Open: Yellow
  - 🔵 In Progress: Blue
  - 🟢 Resolved: Green
  - ⚫ Closed: Gray
- Admin response highlighted in blue box

### Admin/Staff View
- List of hall complaints
- Expandable complaint cards
- Quick status update buttons
- Response notes textarea
- Student information display
- Attachment preview

### Exam Controller View
- "No Access" message
- Complaints link hidden in navigation

## Testing

### Test as Student (ASH)
```
Email: student.ash@nstu.edu.bd
Password: student123
Hall: ASH
```
1. Navigate to Complaints
2. File a test complaint with attachments
3. See it appear in "My Complaints"

### Test as Admin (ASH)
```
Email: admin.ash@nstu.edu.bd
Password: ash123
Hall: ASH
```
1. Navigate to Complaints
2. See complaints from ASH students only
3. Add response notes
4. Update status to "In Progress"
5. Student will see your response

### Test Hall Isolation
1. Login as **admin.ash@nstu.edu.bd** → See ASH complaints
2. Logout and login as **admin.muh@nstu.edu.bd** → See MUH complaints (different list)
3. Verify no cross-hall data leakage

### Test Exam Controller
```
Email: exam@nstu.edu.bd
Password: exam123
```
1. Notice "Complaints" link missing from nav
2. Try to visit `/complaints` directly → See "No Access" message

## Integration with Other Features

### Related to Users
- Complaint submission requires active login
- Student role validation on creation
- Admin/staff role validation on review

### Related to Halls
- Every complaint linked to a hall
- Hall data used for filtering
- Hall background images in dashboard context

### Related to Notifications
- Future: Could trigger notifications when:
  - Student files complaint → Notify hall admin
  - Admin responds → Notify student

## Future Enhancements
- [ ] Email notifications on status changes
- [ ] File upload to actual storage (currently just names)
- [ ] Complaint categories (Maintenance, Security, Food, etc.)
- [ ] Priority levels (Low, Medium, High, Urgent)
- [ ] Complaint analytics for admins
- [ ] Student satisfaction ratings after resolution
- [ ] Bulk status updates
- [ ] Export complaints report

## API Methods

### `createComplaint({ userId, title, body, attachments })`
- Creates new complaint
- Validates student role
- Auto-assigns hall from user
- Returns complaint object

### `listComplaints(filter)`
- Lists complaints
- Filter by `userId` (for students)
- Filter by `hallId` (for admins/staff)
- Returns array of complaints

### `updateComplaintStatus(id, status, reviewedBy, reviewNotes)`
- Updates complaint status
- Logs reviewer ID
- Adds response notes
- Updates timestamp
- Returns updated complaint
