const express = require('express');
const multer = require('multer');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middlewares/authMiddleware');
const isCeleb = require('../middlewares/isCeleb');
const upload  = require('../middlewares/upload'); // Import the multer setup

// Setup multer
// const storage = multer.memoryStorage(); // or diskStorage if you want to save files locally
// const upload = multer({ storage });

// ✅ Use multer to handle multipart/form-data for image upload
router.post('/create', auth, isCeleb, upload.single('image'), postController.createPost);

// ✅ Feed route stays unchanged
router.get('/feed', auth, postController.getFeed);

module.exports = router;
