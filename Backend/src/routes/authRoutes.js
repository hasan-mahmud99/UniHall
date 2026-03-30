const express = require("express");
const {
  handleLogin,
  handleRegister,
  handleMe,
  handleFirebaseLogin,
  handleFirebaseRegister,
  handleCheckRegistration,
  handleForgotPassword,
  handleResetPassword,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", handleLogin);
router.post("/firebase/login", handleFirebaseLogin);
router.post("/register", handleRegister);
router.post("/firebase/register", handleFirebaseRegister);
router.post("/check-registration", handleCheckRegistration);
router.post("/forgot-password", handleForgotPassword);
router.post("/reset-password", handleResetPassword);
router.get("/me", authMiddleware, handleMe);

module.exports = router;
