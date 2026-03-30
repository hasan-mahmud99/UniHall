const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  listMyHallInterviews,
  updateMyHallInterviewScore,
  getMyHallInterviewApplicationDetails,
  markMyHallInterviewAbsent,
} = require("../controllers/interviewController");

const router = express.Router();
router.use(authMiddleware);

router.get("/", listMyHallInterviews);
router.get("/:interviewId/application", getMyHallInterviewApplicationDetails);
router.put("/:interviewId/score", updateMyHallInterviewScore);
router.put("/:interviewId/absent", markMyHallInterviewAbsent);

module.exports = router;
