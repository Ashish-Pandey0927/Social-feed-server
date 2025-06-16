const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middlewares/authMiddleware');

router.post('/create', auth, postController.createPost);
router.get('/feed', auth, postController.getFeed); // optional, for feed

module.exports = router;
