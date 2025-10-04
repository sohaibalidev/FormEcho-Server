const express = require("express");
const {
  getUsers,
  updateUser,
  getStats,
  getAllSubmissions,
} = require("../controllers/admin.controller");
const { protect, admin } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);
router.use(admin);

router.get("/users", getUsers);
router.put("/users/:id", updateUser);
router.get("/stats", getStats);
router.get("/submissions", getAllSubmissions);

module.exports = router;
