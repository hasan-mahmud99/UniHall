const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const { uploadBase64, uploadNoticeBase64, uploadRenewalBase64 } = require('../controllers/uploadController')
const router = express.Router()

router.use(authMiddleware)

// Upload application documents (base64)
router.post('/base64', uploadBase64)

// Upload notice document (base64)
router.post('/notices/base64', uploadNoticeBase64)

// Upload renewal proof document (base64)
router.post('/renewals/base64', uploadRenewalBase64)

router.get('/noop', (req, res) => res.json({ ok: true }))
module.exports = router
