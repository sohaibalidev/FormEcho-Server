const express = require("express");
const {
  getSubmissions,
  getSubmission,
} = require("../controllers/submission.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.route("/").get(getSubmissions);

router.route("/:id").get(getSubmission);

module.exports = router;
