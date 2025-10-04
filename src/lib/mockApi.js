// Simple in-browser mock API using localStorage to simulate backend
// Data model keys
const KEYS = {
  users: 'uh_users',
  session: 'uh_session',
  forms: 'uh_forms',
  applications: 'uh_applications',
  seats: 'uh_seats',
  waitlist: 'uh_waitlist',
  complaints: 'uh_complaints',
  notifications: 'uh_notifications',
  renewals: 'uh_renewals',
  halls: 'uh_halls',
  results: 'uh_results',
  seatPlanUploads: 'uh_seat_plan_uploads'
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function ensureSeedData() {
  // NSTU Halls of Residence (official data from nstu.edu.bd)
  const masterHalls = [
    { id: 'hall-ash', name: 'Basha Shaheed Abdus Salam Hall', shortName: 'ASH', category: 'Male', capacity: 400, established: 2006,
      localImg: '/halls/ASH.jpg', img: 'https://nstu.edu.bd/assets/images/accommodation/ASH.jpg', fallbackImg: 'https://images.unsplash.com/photo-1520637736862-4d197d17c155?w=800',
      provost: { name: 'Md. Farid Dewan', phone: '+8801717386048', email: 'provost.ash@nstu.edu.bd' },
      address: 'Basha Shaheed Abdus Salam Hall, NSTU Campus, Sonapur, Noakhali-3814' },
    { id: 'hall-muh', name: 'Bir Muktijuddha Abdul Malek Ukil Hall', shortName: 'MUH', category: 'Male', capacity: 350, established: 2010,
      localImg: '/halls/MUH.jpg', img: 'https://nstu.edu.bd/assets/images/accommodation/MUH.jpg', fallbackImg: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      provost: { name: 'Hall Provost', phone: '+880-XXXX-XXXXXX', email: 'provost.muh@nstu.edu.bd' },
      address: 'Bir Muktijuddha Abdul Malek Ukil Hall, NSTU Campus, Sonapur, Noakhali-3814' },
    { id: 'hall-bkh', name: 'Hazrat Bibi Khadiza Hall', shortName: 'BKH', category: 'Female', capacity: 300, established: 2008,
      localImg: '/halls/BKH.jpg', img: 'https://nstu.edu.bd/assets/images/accommodation/BKH.jpg', fallbackImg: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
      provost: { name: 'Hall Provost', phone: '+880-XXXX-XXXXXX', email: 'provost.bkh@nstu.edu.bd' },
      address: 'Hazrat Bibi Khadiza Hall, NSTU Campus, Sonapur, Noakhali-3814' },
    { id: 'hall-jsh', name: 'July Shaheed Smriti Chhatri Hall', shortName: 'JSH', category: 'Female', capacity: 280, established: 2012,
      localImg: '/halls/BMH.jpg', img: 'https://nstu.edu.bd/assets/images/accommodation/JSH.jpg', fallbackImg: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      provost: { name: 'Hall Provost', phone: '+880-XXXX-XXXXXX', email: 'provost.jsh@nstu.edu.bd' },
      address: 'July Shaheed Smriti Chhatri Hall, NSTU Campus, Sonapur, Noakhali-3814' },
    { id: 'hall-nfh', name: 'Nabab Foyzunnessa Choudhurani Hall', shortName: 'NFH', category: 'Female', capacity: 320, established: 2014,
      localImg: '/halls/FMH.jpg', img: 'https://nstu.edu.bd/assets/images/accommodation/NFH.jpg', fallbackImg: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
      provost: { name: 'Hall Provost', phone: '+880-XXXX-XXXXXX', email: 'provost.nfh@nstu.edu.bd' },
      address: 'Nabab Foyzunnessa Choudhurani Hall, NSTU Campus, Sonapur, Noakhali-3814' }
  ]
  if (!read(KEYS.halls)) {
    write(KEYS.halls, masterHalls)
  }
  // Normalize/upgrade existing halls to ensure local images and correct codes are set
  let hallsNow = read(KEYS.halls, [])
  if (Array.isArray(hallsNow) && hallsNow.length) {
    let changed = false
    // Normalize existing and ensure all master halls are present
    const normalized = hallsNow.map(h => {
      const sn = h.shortName || ''
      const expectedLocal = sn === 'JSH' ? '/halls/BMH.jpg' : sn === 'NFH' ? '/halls/FMH.jpg' : (sn ? `/halls/${sn}.jpg` : (h.localImg || ''))
      const expectedRemote = sn ? `https://nstu.edu.bd/assets/images/accommodation/${sn}.jpg` : (h.img || '')
      const next = { ...h }
      if (expectedLocal && next.localImg !== expectedLocal) { next.localImg = expectedLocal; changed = true }
      if (expectedRemote && next.img !== expectedRemote) { next.img = expectedRemote; changed = true }
      return next
    })
    
    // Merge with master halls and deduplicate
    const byShort = new Map()
    const masterByShort = new Map(masterHalls.map(m => [m.shortName, m]))
    
    const combined = [...normalized, ...masterHalls]
    combined.forEach(h => {
      if (!h.shortName) return
      const m = masterByShort.get(h.shortName) || {}
      const merged = { ...m, ...h, id: m.id || h.id }
      const prev = byShort.get(merged.shortName)
      if (!prev || (merged.localImg && !prev.localImg)) {
        byShort.set(merged.shortName, merged)
      }
    })
    
    const deduped = masterHalls.map(m => byShort.get(m.shortName)).filter(Boolean)
    if (changed || deduped.length !== hallsNow.length) {
      write(KEYS.halls, deduped)
      changed = true
    }
  }
  const existingUsers = read(KEYS.users)
  if (!existingUsers) {
    const halls = read(KEYS.halls, [])
    write(KEYS.users, [
      // Admin credentials for each hall
    { id: 'admin-ash', name: 'Admin - Abdus Salam Hall', email: 'admin.ash@nstu.edu.bd', role: 'admin', hallId: 'hall-ash', password: 'ash123' },
    { id: 'admin-muh', name: 'Admin - Abdul Malek Ukil Hall', email: 'admin.muh@nstu.edu.bd', role: 'admin', hallId: 'hall-muh', password: 'muh123' },
    { id: 'admin-bkh', name: 'Admin - Bibi Khadiza Hall', email: 'admin.bkh@nstu.edu.bd', role: 'admin', hallId: 'hall-bkh', password: 'bkh123' },
      { id: 'admin-jsh', name: 'Admin - July Shaheed Hall', email: 'admin.jsh@nstu.edu.bd', role: 'admin', hallId: 'hall-jsh', password: 'jsh123' },
      { id: 'admin-nfh', name: 'Admin - Foyzunnessa Hall', email: 'admin.nfh@nstu.edu.bd', role: 'admin', hallId: 'hall-nfh', password: 'nfh123' },
      
      // Student credentials for each hall
    { id: 'student-ash', name: 'Ahmed Rahman', email: 'student.ash@nstu.edu.bd', role: 'student', hallId: 'hall-ash', password: 'student123' },
    { id: 'student-muh', name: 'Karim Ahmed', email: 'student.muh@nstu.edu.bd', role: 'student', hallId: 'hall-muh', password: 'student123' },
    { id: 'student-bkh', name: 'Fatima Khan', email: 'student.bkh@nstu.edu.bd', role: 'student', hallId: 'hall-bkh', password: 'student123' },
      { id: 'student-jsh', name: 'Ayesha Ali', email: 'student.jsh@nstu.edu.bd', role: 'student', hallId: 'hall-jsh', password: 'student123' },
      { id: 'student-nfh', name: 'Nasreen Begum', email: 'student.nfh@nstu.edu.bd', role: 'student', hallId: 'hall-nfh', password: 'student123' },

      // Other roles
      { id: 'exam-1', name: 'Exam Controller', email: 'exam@nstu.edu.bd', role: 'examcontroller', password: 'exam123' },
      { id: 'staff-1', name: 'Hall Staff', email: 'staff@nstu.edu.bd', role: 'staff', hallId: 'hall-ash', password: 'staff123' }
    ])
  } else {
    // Ensure all hall admins exist
    const halls = read(KEYS.halls, [])
    const users = Array.isArray(existingUsers) ? existingUsers : []
    
    // Add missing hall admins
    const hallAdmins = [
    { id: 'admin-ash', name: 'Admin - Abdus Salam Hall', email: 'admin.ash@nstu.edu.bd', role: 'admin', hallId: 'hall-ash', password: 'ash123' },
    { id: 'admin-muh', name: 'Admin - Abdul Malek Ukil Hall', email: 'admin.muh@nstu.edu.bd', role: 'admin', hallId: 'hall-muh', password: 'muh123' },
    { id: 'admin-bkh', name: 'Admin - Bibi Khadiza Hall', email: 'admin.bkh@nstu.edu.bd', role: 'admin', hallId: 'hall-bkh', password: 'bkh123' },
      { id: 'admin-jsh', name: 'Admin - July Shaheed Hall', email: 'admin.jsh@nstu.edu.bd', role: 'admin', hallId: 'hall-jsh', password: 'jsh123' },
      { id: 'admin-nfh', name: 'Admin - Foyzunnessa Hall', email: 'admin.nfh@nstu.edu.bd', role: 'admin', hallId: 'hall-nfh', password: 'nfh123' }
    ]
    
    hallAdmins.forEach(admin => {
      if (!users.some(u => u.email === admin.email)) {
        users.push(admin)
      }
    })
    
    // Add other essential users if missing
    if (!users.some(u => u.email === 'exam@nstu.edu.bd')) {
      users.push({ id: `exam-${Date.now()}`, name: 'Exam Controller', email: 'exam@nstu.edu.bd', role: 'examcontroller', password: 'exam123' })
    }
    if (!users.some(u => u.email === 'staff@nstu.edu.bd')) {
      users.push({ id: `staff-${Date.now()}`, name: 'Hall Staff', email: 'staff@nstu.edu.bd', role: 'staff', hallId: 'hall-ash', password: 'staff123' })
    }
    
    write(KEYS.users, users)
  }
  if (!read(KEYS.forms)) {
    const defaultForm = {
      id: 'form-1', name: 'Hall Admission Form', active: true, hallId: null, createdAt: Date.now(),
      schema: [
        { id: 'f1', label: 'Full Name', type: 'text', required: true },
        { id: 'f2', label: 'Student ID', type: 'text', required: true },
        { id: 'f3', label: 'Department', type: 'dropdown', options: ['CSE','EEE','ICE','BBA'], required: true },
        { id: 'f4', label: 'Session (e.g., 2019-20)', type: 'text', required: true },
        { id: 'f5', label: 'Date of Birth', type: 'date' },
        { id: 'f6', label: 'Guardian Contact', type: 'text' },
        { id: 'f7', label: 'Quota', type: 'checkbox', options: ['Freedom Fighter','Tribal','None'] }
      ]
    }
    write(KEYS.forms, [defaultForm])
  }
  if (!read(KEYS.seats)) {
    // Seed different seat maps for each hall to make them look distinct
    const halls = read(KEYS.halls, [])
    const seats = []
    halls.forEach((hall, idx) => {
      // Each hall has different number of floors, rooms, and bed configurations
      const floors = idx === 0 ? 3 : idx === 1 ? 4 : idx === 2 ? 2 : idx === 3 ? 3 : 2 // ASH:3, MUH:4, BKH:2, JSH:3, NFH:2
      const roomsPerFloor = idx === 0 ? 4 : idx === 1 ? 5 : idx === 2 ? 3 : idx === 3 ? 4 : 3
      const bedsPerRoom = idx % 2 === 0 ? 2 : 3 // Alternate 2 and 3 beds per room
      
      for (let floor = 1; floor <= floors; floor++) {
        const roomStart = floor * 100 + 1
        for (let room = roomStart; room < roomStart + roomsPerFloor; room++) {
          for (let bed = 1; bed <= bedsPerRoom; bed++) {
            // Vary the status to make halls look different
            const statusOptions = ['Available', 'Available', 'Available', 'Occupied', 'Reserved']
            const status = Math.random() > 0.7 ? statusOptions[3 + idx % 2] : 'Available'
            seats.push({ 
              id: `${hall.id}-${floor}-${room}-${bed}`, 
              hallId: hall.id, 
              floor, 
              room, 
              bed, 
              status, 
              studentId: status === 'Occupied' ? `student-${hall.shortName}-${Math.floor(Math.random()*100)}` : null 
            })
          }
        }
      }
    })
    write(KEYS.seats, seats)
  }
  if (!read(KEYS.notifications)) {
    const halls = read(KEYS.halls, [])
    const notifications = []
    halls.forEach((hall, idx) => {
      // Different notifications for each hall
      const notifContent = [
        { title: 'Admission Open', body: 'Hall admission applications are now being accepted for the new session.' },
        { title: 'Seat Allocation Complete', body: 'Room assignments have been posted. Check your dashboard.' },
        { title: 'Maintenance Notice', body: 'Scheduled maintenance on 2nd floor next week.' },
        { title: 'Cultural Program', body: 'Annual cultural program registration is now open.' },
        { title: 'Fee Reminder', body: 'Hall fees for this semester are due by end of month.' }
      ]
      const content = notifContent[idx % notifContent.length]
      notifications.push({ 
        id: `n-${hall.id}`, 
        title: `${hall.shortName}: ${content.title}`, 
        body: content.body, 
        date: Date.now() - (idx * 86400000), // Stagger dates
        hallId: hall.id 
      })
    })
    write(KEYS.notifications, notifications)
  }
  if (!read(KEYS.applications)) {
    // Seed sample applications for different halls
    const halls = read(KEYS.halls, [])
    const users = read(KEYS.users, [])
    const applications = []
    
    halls.forEach((hall, hallIdx) => {
      // Each hall gets 3-5 sample applications with different statuses
      const appCount = 3 + (hallIdx % 3)
      for (let i = 0; i < appCount; i++) {
        const statuses = ['Submitted', 'Under Review', 'Approved', 'Rejected']
        const status = statuses[i % statuses.length]
        const student = users.find(u => u.role === 'student' && u.hallId === hall.id)
        
        applications.push({
          id: `app-${hall.id}-${i}`,
          userId: student?.id || `student-${hall.shortName}-${i}`,
          formId: 'form-1',
          data: {
            fullName: `Student ${hall.shortName} ${i+1}`,
            studentId: `${hall.shortName}202${4+hallIdx}-000${i+1}`,
            department: ['CSE', 'EEE', 'ICE', 'BBA'][i % 4],
            session: `202${4+hallIdx}-2${5+hallIdx}`
          },
          attachments: {},
          status,
          createdAt: Date.now() - ((hallIdx * 10 + i) * 86400000),
          paymentDone: status === 'Approved' && i % 2 === 0,
          hallId: hall.id
        })
      }
    })
    
    write(KEYS.applications, applications)
  }
  
  // Seed demo complaints with actions/status (force reseed if empty)
  const existingComplaints = read(KEYS.complaints, [])
  if (existingComplaints.length === 0) {
    const halls = read(KEYS.halls, [])
    const users = read(KEYS.users, [])
    const complaints = []
    
    halls.forEach((hall, hallIdx) => {
      const student = users.find(u => u.role === 'student' && u.hallId === hall.id)
      
      // Add 2 demo complaints per hall with different statuses
      complaints.push({
        id: `complaint-${hall.id}-1`,
        userId: student?.id || `student-${hall.shortName}-1`,
        hallId: hall.id,
        subject: 'Water Supply Issue',
        description: 'There is no water supply in the 3rd floor bathroom for the last 2 days.',
        status: 'Resolved',
        response: 'Water pump has been fixed. Supply restored on 2nd Oct.',
        createdAt: Date.now() - (7 * 86400000), // 7 days ago
        resolvedAt: Date.now() - (2 * 86400000) // 2 days ago
      })
      
      complaints.push({
        id: `complaint-${hall.id}-2`,
        userId: student?.id || `student-${hall.shortName}-2`,
        hallId: hall.id,
        subject: 'Electricity Problem in Room 305',
        description: 'Power socket not working. Need urgent repair for study purposes.',
        status: 'In Progress',
        response: 'Electrician has been notified. Will be fixed within 24 hours.',
        createdAt: Date.now() - (1 * 86400000), // 1 day ago
        resolvedAt: null
      })
    })
    
    write(KEYS.complaints, complaints)
  }
  
  // Seed demo renewals (force reseed if empty)
  const existingRenewals = read(KEYS.renewals, [])
  if (existingRenewals.length === 0) {
    const halls = read(KEYS.halls, [])
    const users = read(KEYS.users, [])
    const renewals = []
    
    halls.forEach((hall, hallIdx) => {
      const students = users.filter(u => u.role === 'student' && u.hallId === hall.id)
      
      students.slice(0, 2).forEach((student, idx) => {
        renewals.push({
          id: `renewal-${hall.id}-${idx}`,
          userId: student.id,
          hallId: hall.id,
          status: idx === 0 ? 'Approved' : 'Pending',
          requestedAt: Date.now() - ((idx + 1) * 5 * 86400000),
          approvedAt: idx === 0 ? Date.now() - (2 * 86400000) : null
        })
      })
    })
    
    write(KEYS.renewals, renewals)
  }
  
  // Seed demo waitlist entries (force reseed if empty)
  const existingWaitlist = read(KEYS.waitlist, [])
  if (existingWaitlist.length === 0) {
    const halls = read(KEYS.halls, [])
    const waitlist = []
    
    halls.forEach((hall, hallIdx) => {
      // Add 2-3 waitlist entries per hall
      for (let i = 0; i < 2; i++) {
        waitlist.push({
          id: `waitlist-${hall.id}-${i}`,
          studentName: `Waitlist Student ${hall.shortName} ${i+1}`,
          studentId: `${hall.shortName}202${5+hallIdx}-W00${i+1}`,
          email: `waitlist${i+1}.${hall.shortName.toLowerCase()}@student.nstu.edu.bd`,
          phone: `017${hallIdx}${i}000000`,
          department: ['CSE', 'EEE', 'ICE', 'BBA', 'MBA'][i % 5],
          session: `202${5+hallIdx}-2${6+hallIdx}`,
          position: i + 1,
          hallId: hall.id,
          addedAt: Date.now() - ((i + 1) * 3 * 86400000) // Staggered dates
        })
      }
    })
    
    write(KEYS.waitlist, waitlist)
  }
  
  if (!read(KEYS.results)) write(KEYS.results, [])
  if (!read(KEYS.seatPlanUploads)) write(KEYS.seatPlanUploads, [])

  // Seed a default student for quick testing
  const usersNow = read(KEYS.users, [])
  if (!usersNow.some(u => u.email === 'student1@student.nstu.edu.bd')) {
    const studentId = 'MUH2025-0001'
    const hallId = HALL_PREFIX_MAP['MUH']
    usersNow.push({ id: `u-${Date.now()}`, name: 'Test Student', email: 'student1@student.nstu.edu.bd', role: 'student', password: 'student123', studentId, hallId })
    write(KEYS.users, usersNow)
  }
}

export function resetDemoData() {
  // Clear all application keys to reseed
  Object.values(KEYS).forEach(k => localStorage.removeItem(k))
  localStorage.removeItem('uh_pending_registration')
  ensureSeedData()
}

export function getSessionUser() {
  // Return session, enriched with latest user info (hallId, studentId) if missing
  const sess = read(KEYS.session, null)
  if (!sess) return null
  if (sess.hallId && sess.studentId !== undefined) return sess
  const users = read(KEYS.users, [])
  const u = users.find(x => x.id === sess.id || x.email === sess.email)
  if (!u) return sess
  const enriched = { ...sess, hallId: u.hallId ?? sess.hallId, studentId: u.studentId ?? sess.studentId }
  write(KEYS.session, enriched)
  return enriched
}
export function logout() {
  localStorage.removeItem(KEYS.session)
}
export async function login(email, password) {
  const users = read(KEYS.users, [])
  const u = users.find(x => x.email === email && x.password === password)
  if (!u) throw new Error('Invalid credentials')
  // Persist hallId and studentId to enable hall-scoped UI (e.g., backgrounds)
  write(KEYS.session, { id: u.id, name: u.name, role: u.role, email: u.email, hallId: u.hallId ?? null, studentId: u.studentId })
  return getSessionUser()
}
export async function register({ name, email, password }) {
  const users = read(KEYS.users, [])
  if (users.some(u => u.email === email)) throw new Error('Email already exists')
  // Only students can self-register, and they must use student email domain
  if (!/^[^@]+@student\.nstu\.edu\.bd$/i.test(email)) {
    throw new Error('Only students can register with @student.nstu.edu.bd emails')
  }
  // Expect studentId and derive hall from its prefix
  const pending = pendingRegistration()
  const studentId = pending?.studentId
  if (!studentId) throw new Error('Student ID is required')
  const hallId = deriveHallFromStudentId(studentId)
  if (!hallId) throw new Error('Invalid Student ID prefix. Cannot determine hall.')
  const newUser = { id: `u-${Date.now()}`, name, email, role: 'student', password, studentId, hallId }
  users.push(newUser)
  write(KEYS.users, users)
  write(KEYS.session, { id: newUser.id, name: newUser.name, role: newUser.role, email: newUser.email, hallId: newUser.hallId })
  return getSessionUser()
}

// User queries
export function getUserById(userId) {
  const users = read(KEYS.users, [])
  return users.find(u => u.id === userId) || null
}

// Forms
export function getFormById(formId) {
  const forms = read(KEYS.forms, [])
  return forms.find(f => f.id === formId) || null
}

export function getActiveFormForHall(hallId) {
  const forms = read(KEYS.forms, [])
  // Prefer hall-specific active form, else a global active form
  return forms.find(f => f.active && f.hallId === hallId) || forms.find(f => f.active && (f.hallId == null)) || null
}
export function listForms(filter = {}) {
  let forms = read(KEYS.forms, [])
  if (filter.hallId !== undefined) forms = forms.filter(f => f.hallId === filter.hallId)
  return forms
}
export function saveForm(form) {
  const forms = read(KEYS.forms, [])
  const idx = forms.findIndex(f => f.id === form.id)
  if (idx >= 0) forms[idx] = form; else forms.push(form)
  write(KEYS.forms, forms)
  return form
}
export function createForm(payload) {
  const form = { id: `form-${Date.now()}`, active: false, hallId: payload.hallId ?? null, createdAt: Date.now(), ...payload }
  const forms = read(KEYS.forms, [])
  forms.push(form)
  write(KEYS.forms, forms)
  return form
}
export function setActiveForm(id, hallId) {
  const forms = read(KEYS.forms, [])
  // Deactivate all forms for this hall (including global null if hallId is null)
  forms.forEach(f => { if (f.hallId === hallId) f.active = false })
  const form = forms.find(f => f.id === id)
  if (form) { form.active = true; form.hallId = hallId }
  write(KEYS.forms, forms)
}

// Applications
export function submitApplication({ userId, formId, data, attachments }) {
  const apps = read(KEYS.applications, [])
  const user = read(KEYS.users, []).find(u => u.id === userId)
  const app = { id: `app-${Date.now()}`, userId, formId, data, attachments: attachments || {}, status: 'Submitted', createdAt: Date.now(), paymentDone: false, hallId: user?.hallId || null }
  apps.push(app)
  write(KEYS.applications, apps)
  return app
}
export function listApplications(filter = {}) {
  let apps = read(KEYS.applications, [])
  if (filter.userId) apps = apps.filter(a => a.userId === filter.userId)
  if (filter.hallId) apps = apps.filter(a => a.hallId === filter.hallId)
  if (filter.formId) apps = apps.filter(a => a.formId === filter.formId)
  return apps
}
export function updateApplicationStatus(id, status) {
  const apps = read(KEYS.applications, [])
  const a = apps.find(x => x.id === id)
  if (a) a.status = status
  write(KEYS.applications, apps)
  return a
}
export function markPayment(id, paid) {
  const apps = read(KEYS.applications, [])
  const a = apps.find(x => x.id === id)
  if (a) a.paymentDone = paid
  write(KEYS.applications, apps)
  return a
}

// Seats
export function listSeats(filter = {}) {
  let seats = read(KEYS.seats, [])
  if (filter.hallId) seats = seats.filter(s => s.hallId === filter.hallId)
  return seats
}
export function updateSeat(id, patch) {
  const seats = read(KEYS.seats, [])
  const s = seats.find(x => x.id === id)
  if (s) Object.assign(s, patch)
  write(KEYS.seats, seats)
  return s
}
export function assignSeatToStudent(seatId, studentId) {
  return updateSeat(seatId, { status: 'Occupied', studentId })
}

// Waitlist: derived from apps not paid after approved
export function listWaitlist(filter = {}) {
  let apps = read(KEYS.applications, [])
  apps = apps.filter(a => a.status === 'Approved' && !a.paymentDone)
  if (filter.hallId) apps = apps.filter(a => a.hallId === filter.hallId)
  return apps
}

// Renewals
export function requestRenewal(userId) {
  const renewals = read(KEYS.renewals, [])
  const r = { id: `r-${Date.now()}`, userId, status: 'Requested', createdAt: Date.now() }
  renewals.push(r)
  write(KEYS.renewals, renewals)
  return r
}
export function listRenewals() { return read(KEYS.renewals, []) }
export function updateRenewal(id, status) {
  const renewals = read(KEYS.renewals, [])
  const r = renewals.find(x => x.id === id)
  if (r) r.status = status
  write(KEYS.renewals, renewals)
  return r
}

// Notifications
export function listNotifications(filter = {}) {
  let list = read(KEYS.notifications, [])
  if (filter.hallId) list = list.filter(n => n.hallId === filter.hallId)
  return list
}
export function createNotification(title, body, hallId) {
  const list = read(KEYS.notifications, [])
  const n = { id: `n-${Date.now()}`, title, body, hallId: hallId || null, date: Date.now() }
  list.push(n)
  write(KEYS.notifications, list)
  return n
}

// Complaints (hall-specific, only students can file)
export function createComplaint({ userId, title, body, attachments }) {
  const users = read(KEYS.users, [])
  const user = users.find(u => u.id === userId)
  if (!user || user.role !== 'student') throw new Error('Only students can file complaints')
  
  const list = read(KEYS.complaints, [])
  const c = { 
    id: `c-${Date.now()}`, 
    userId, 
    hallId: user.hallId, // Complaint tied to student's hall
    title, 
    body, 
    attachments: attachments || [], // Array of file names/URLs
    status: 'Open', 
    createdAt: Date.now(),
    reviewedBy: null,
    reviewNotes: ''
  }
  list.push(c)
  write(KEYS.complaints, list)
  return c
}

export function listComplaints(filter = {}) {
  let list = read(KEYS.complaints, [])
  if (filter.userId) list = list.filter(c => c.userId === filter.userId)
  if (filter.hallId) list = list.filter(c => c.hallId === filter.hallId)
  return list
}

export function updateComplaintStatus(id, status, reviewedBy, reviewNotes) {
  const list = read(KEYS.complaints, [])
  const c = list.find(x => x.id === id)
  if (c) {
    c.status = status
    if (reviewedBy) c.reviewedBy = reviewedBy
    if (reviewNotes) c.reviewNotes = reviewNotes
    c.updatedAt = Date.now()
  }
  write(KEYS.complaints, list)
  return c
}

// Halls
export function listHalls() { return read(KEYS.halls, []) }
export function getHallById(id) { return read(KEYS.halls, []).find(h => h.id === id) }
export function updateUserHall(userId, hallId) {
  const users = read(KEYS.users, [])
  const u = users.find(x => x.id === userId)
  if (u) u.hallId = hallId
  write(KEYS.users, users)
  const sess = getSessionUser()
  if (sess?.id === userId) write(KEYS.session, { ...sess, hallId })
  return u
}

// Results upload (by exam controller)
export function createResultUpload({ hallId, name, content, rows }) {
  const list = read(KEYS.results, [])
  const item = { id: `res-${Date.now()}`, hallId, name, content, rows: rows || [], createdAt: Date.now() }
  list.push(item)
  write(KEYS.results, list)
  return item
}
export function listResults(filter = {}) {
  let list = read(KEYS.results, [])
  if (filter.hallId) list = list.filter(i => i.hallId === filter.hallId)
  return list
}

// Seat plan upload (by exam controller)
export function createSeatPlanUpload({ hallId, name, content, rows }) {
  const list = read(KEYS.seatPlanUploads, [])
  const item = { id: `sp-${Date.now()}`, hallId, name, content, rows: rows || [], createdAt: Date.now() }
  list.push(item)
  write(KEYS.seatPlanUploads, list)
  return item
}
export function listSeatPlanUploads(filter = {}) {
  let list = read(KEYS.seatPlanUploads, [])
  if (filter.hallId) list = list.filter(i => i.hallId === filter.hallId)
  return list
}

// Registration handoff (simple temp storage to pass studentId from UI to register call)
const PENDING_REG_KEY = 'uh_pending_registration'
export function setPendingRegistration(data) { write(PENDING_REG_KEY, data) }
export function pendingRegistration() { return read(PENDING_REG_KEY, {}) }
export function clearPendingRegistration() { localStorage.removeItem(PENDING_REG_KEY) }

// Map student ID prefixes to halls
const HALL_PREFIX_MAP = {
  MUH: 'hall-muh', // Bir Muktijuddha Abdul Malek Ukil Hall
  ASH: 'hall-ash', // Basha Shaheed Abdus Salam Hall
  BKH: 'hall-bkh', // Hazrat Bibi Khadiza Hall
  JSH: 'hall-jsh', // July Shaheed Smriti Chhatri Hall
  NFH: 'hall-nfh'  // Nabab Foyzunnessa Choudhurani Hall
}
export function deriveHallFromStudentId(studentId) {
  if (!studentId) return null
  const prefix = String(studentId).trim().slice(0,3).toUpperCase()
  return HALL_PREFIX_MAP[prefix] || null
}
