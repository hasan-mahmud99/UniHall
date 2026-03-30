const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const MAX_FILE_BYTES = 5 * 1024 * 1024
const MAX_RENEWAL_BYTES = 10 * 1024 * 1024

function ensureUploadsDir(subdir) {
  // uploads/ lives at the repo root (sibling of Backend/)
  const dir = path.resolve(__dirname, '..', '..', '..', 'uploads', subdir)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

// Accepts { files: [{ fieldId, fileName, contentType, data }] } where data is base64 string
async function uploadBase64(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const role = String(req.user?.role || '').toLowerCase()
    if (role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can upload application documents' })
    }

    const { files } = req.body || {}
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files provided' })
    }

    const uploadsDir = ensureUploadsDir('pending')
    const results = []

    for (const f of files) {
      if (!f || !f.data) continue
      const id = crypto.randomUUID()
      const ext = (f.fileName && path.extname(f.fileName)) || ''
      const safeName = `${id}${ext}`
      const filePath = path.join(uploadsDir, safeName)

      const base64 = String(f.data).replace(/^data:[^;]+;base64,/, '')
      const buffer = Buffer.from(base64, 'base64')

      if (buffer.length > MAX_FILE_BYTES) {
        return res.status(413).json({
          success: false,
          message: 'File is too large. Maximum size is 5MB.'
        })
      }

      fs.writeFileSync(filePath, buffer)

      results.push({
        fieldId: f.fieldId || null,
        url: `/uploads/pending/${safeName}`,
        name: f.fileName || safeName,
        type: f.contentType || 'application/octet-stream'
      })
    }

    return res.json({ success: true, files: results })
  } catch (err) {
    next(err)
  }
}

async function uploadRenewalBase64(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const role = String(req.user?.role || '').toLowerCase()
    if (role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can upload renewal documents' })
    }

    const uploadsDir = ensureUploadsDir('renewals')

    // Accept either { fileName, mimeType/contentType, dataUrl/data }
    // or { files: [{ fileName, contentType, data }] }
    const body = req.body || {}
    let fileName = body.fileName || body.name || null
    let contentType = body.mimeType || body.contentType || null
    let data = body.dataUrl || body.data || null

    if (!data && Array.isArray(body.files) && body.files[0]) {
      fileName = body.files[0].fileName || body.files[0].name || fileName
      contentType = body.files[0].contentType || body.files[0].mimeType || contentType
      data = body.files[0].data || body.files[0].dataUrl || data
    }

    if (!data) {
      return res.status(400).json({ success: false, message: 'No file data provided' })
    }

    const id = crypto.randomUUID()
    const ext = (fileName && path.extname(fileName)) || ''
    const safeName = `${id}${ext}`
    const filePath = path.join(uploadsDir, safeName)

    const base64 = String(data).replace(/^data:[^;]+;base64,/, '')
    const buffer = Buffer.from(base64, 'base64')

    if (buffer.length > MAX_RENEWAL_BYTES) {
      return res.status(413).json({
        success: false,
        message: 'File is too large. Maximum size is 10MB.'
      })
    }

    fs.writeFileSync(filePath, buffer)

    return res.json({
      success: true,
      file: {
        url: `/uploads/renewals/${safeName}`,
        name: fileName || safeName,
        type: contentType || 'application/octet-stream'
      }
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { uploadBase64, uploadRenewalBase64 }

async function uploadNoticeBase64(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const r = String(req.user?.role || '').toLowerCase()
    if (r !== 'admin' && r !== 'examcontroller') {
      return res.status(403).json({ success: false, message: 'Only admins/exam controllers can upload notice documents' })
    }

    const uploadsDir = ensureUploadsDir('notices')

    // Accept either { fileName, mimeType/contentType, dataUrl/data }
    // or { files: [{ fileName, contentType, data }] }
    const body = req.body || {}
    let fileName = body.fileName || body.name || null
    let contentType = body.mimeType || body.contentType || null
    let data = body.dataUrl || body.data || null

    if (!data && Array.isArray(body.files) && body.files[0]) {
      fileName = body.files[0].fileName || body.files[0].name || fileName
      contentType = body.files[0].contentType || body.files[0].mimeType || contentType
      data = body.files[0].data || body.files[0].dataUrl || data
    }

    if (!data) {
      return res.status(400).json({ success: false, message: 'No file data provided' })
    }

    const id = crypto.randomUUID()
    const ext = (fileName && path.extname(fileName)) || ''
    const safeName = `${id}${ext}`
    const filePath = path.join(uploadsDir, safeName)

    const base64 = String(data).replace(/^data:[^;]+;base64,/, '')
    const buffer = Buffer.from(base64, 'base64')

    if (buffer.length > MAX_FILE_BYTES) {
      return res.status(413).json({
        success: false,
        message: 'File is too large. Maximum size is 5MB.'
      })
    }

    fs.writeFileSync(filePath, buffer)

    return res.json({
      success: true,
      file: {
        url: `/uploads/notices/${safeName}`,
        name: fileName || safeName,
        type: contentType || 'application/octet-stream'
      }
    })
  } catch (err) {
    next(err)
  }
}

module.exports.uploadNoticeBase64 = uploadNoticeBase64
