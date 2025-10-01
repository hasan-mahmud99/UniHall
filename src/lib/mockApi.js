// Simple in-browser mock API using localStorage to simulate backend
// Data model keys
const KEYS = {
  users: 'uh_users',
  session: 'uh_session',
  forms: 'uh_forms',
  applications: 'uh_applications',
  seats: 'uh_seats',
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
  // Halls (5 total: 2 male, 3 female)
  if (!read(KEYS.halls)) {
    const halls = [
      { id: 'hall-ash', name: 'Basha Shaheed Abdus Salam Hall', category: 'Male', img: 'https://nstu.edu.bd/assets/images/accommodation/ASH.jpg' },
      { id: 'hall-bmau', name: 'Bir Muktijuddha Abdul Malek Ukil Hall', category: 'Male', img: 'https://nstu.edu.bd/assets/images/accommodation/AMU.jpg' },
      { id: 'hall-hbk', name: 'Hazrat Bibi Khadiza Hall', category: 'Female', img: 'https://nstu.edu.bd/assets/images/accommodation/HBK.jpg' },
      { id: 'hall-jsh', name: 'July Shaheed Smriti Chhatri Hall', category: 'Female', img: 'https://nstu.edu.bd/assets/images/accommodation/JSH.jpg' },
      { id: 'hall-nfh', name: 'Nabab Foyzunnessa Choudhurani Hall', category: 'Female', img: 'https://nstu.edu.bd/assets/images/accommodation/NFH.jpg' }
    ]
    write(KEYS.halls, halls)
  }
  const existingUsers = read(KEYS.users)
  if (!existingUsers) {
    const halls = read(KEYS.halls, [])
    write(KEYS.users, [
      { id: 'admin-1', name: 'Hall Admin (ASH)', email: 'admin@nstu.edu.bd', role: 'admin', hallId: halls[0]?.id, password: 'admin123' },
      { id: 'exam-1', name: 'Exam Controller', email: 'exam@nstu.edu.bd', role: 'examcontroller', hallId: halls[0]?.id, password: 'exam123' },
      { id: 'staff-1', name: 'Hall Staff', email: 'staff@nstu.edu.bd', role: 'staff', hallId: halls[0]?.id, password: 'staff123' }
    ])
  } else {
    // Ensure the default NSTU admin exists even if previous seeds are present
    const halls = read(KEYS.halls, [])
    const users = Array.isArray(existingUsers) ? existingUsers : []
    const hasNstuAdmin = users.some(u => u.email === 'admin@nstu.edu.bd' && u.role === 'admin')
    if (!hasNstuAdmin) {
      users.push({ id: `admin-${Date.now()}`, name: 'Hall Admin (ASH)', email: 'admin@nstu.edu.bd', role: 'admin', hallId: halls[0]?.id, password: 'admin123' })
    }
    const hasExam = users.some(u => u.email === 'exam@nstu.edu.bd' && u.role === 'examcontroller')
    if (!hasExam) users.push({ id: `exam-${Date.now()}`, name: 'Exam Controller', email: 'exam@nstu.edu.bd', role: 'examcontroller', hallId: halls[0]?.id, password: 'exam123' })
    const hasStaff = users.some(u => u.email === 'staff@nstu.edu.bd' && u.role === 'staff')
    if (!hasStaff) users.push({ id: `staff-${Date.now()}`, name: 'Hall Staff', email: 'staff@nstu.edu.bd', role: 'staff', hallId: halls[0]?.id, password: 'staff123' })
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
    // Seed small seat maps for each hall: floors 1-2, rooms 101-103, 2 beds
    const halls = read(KEYS.halls, [])
    const seats = []
    for (const hall of halls) {
      for (let floor = 1; floor <= 2; floor++) {
        for (let room = 101; room <= 103; room++) {
          for (let bed = 1; bed <= 2; bed++) {
            seats.push({ id: `${hall.id}-${floor}-${room}-${bed}`, hallId: hall.id, floor, room, bed, status: 'Available', studentId: null })
          }
        }
      }
    }
    write(KEYS.seats, seats)
  }
  if (!read(KEYS.notifications)) {
    const halls = read(KEYS.halls, [])
    write(KEYS.notifications, [
      { id: 'n1', title: 'Welcome to UniHall', body: 'Admission form is now open.', date: Date.now(), hallId: halls[0]?.id }
    ])
  }
  if (!read(KEYS.applications)) write(KEYS.applications, [])
  if (!read(KEYS.complaints)) write(KEYS.complaints, [])
  if (!read(KEYS.renewals)) write(KEYS.renewals, [])
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
  return read(KEYS.session, null)
}
export function logout() {
  localStorage.removeItem(KEYS.session)
}
export async function login(email, password) {
  const users = read(KEYS.users, [])
  const u = users.find(x => x.email === email && x.password === password)
  if (!u) throw new Error('Invalid credentials')
  write(KEYS.session, { id: u.id, name: u.name, role: u.role, email: u.email })
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

// Forms
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

// Complaints
export function createComplaint({ userId, title, body }) {
  const list = read(KEYS.complaints, [])
  const c = { id: `c-${Date.now()}`, userId, title, body, status: 'Open', createdAt: Date.now() }
  list.push(c)
  write(KEYS.complaints, list)
  return c
}
export function listComplaints(filter = {}) {
  let list = read(KEYS.complaints, [])
  if (filter.userId) list = list.filter(c => c.userId === filter.userId)
  return list
}
export function updateComplaintStatus(id, status) {
  const list = read(KEYS.complaints, [])
  const c = list.find(x => x.id === id)
  if (c) c.status = status
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
  MUH: 'hall-bmau', // Bir Muktijuddha Abdul Malek Ukil Hall
  ASH: 'hall-ash',  // Basha Shaheed Abdus Salam Hall
  BKH: 'hall-hbk',  // Hazrat Bibi Khadiza Hall
  JSH: 'hall-jsh',  // July Shaheed Smriti Chhatri Hall
  NFH: 'hall-nfh'   // Nabab Foyzunnessa Choudhurani Hall
}
export function deriveHallFromStudentId(studentId) {
  if (!studentId) return null
  const prefix = String(studentId).trim().slice(0,3).toUpperCase()
  return HALL_PREFIX_MAP[prefix] || null
}
