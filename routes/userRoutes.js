const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { followCeleb } = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware");
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

// Routes
router.post("/register", register);
router.post("/login", login);

// Follow Route
router.post("/follow/:celebId", auth, userController.followCeleb);

// Search Route
// routes/userRoutes.js
router.get('/search', authMiddleware, userController.searchCelebrities);


module.exports = router;
