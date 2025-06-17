const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController');
const { register, login } = require("../controllers/authController");
const authMiddleware = require('../middlewares/authMiddleware');
// const { followUser, unfollowUser } = require("../controllers/userController");
// const auth = require("../middlewares/authMiddleware");

// Auth Routes
router.post("/register", register);
router.post("/login", login);
router.get('/me', authMiddleware, authController.getMe);

// // Follow Routes
// router.post("/follow/:id", auth, followUser);
// router.post("/unfollow/:id", auth, unfollowUser);

module.exports = router;
