const Post = require('../models/Post');
const User = require('../models/User');

exports.createPost = async (req, res) => {
  try {
    if (req.user.role !== 'celeb') {
      return res.status(403).json({ success: false, message: 'Only celebrities can create posts.' });
    }

    const { content } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newPost = new Post({
      author: req.user.id,
      content,
      image: imagePath,
    });

    await newPost.save();
    res.status(201).json({ success: true, post: newPost });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
};



exports.getFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('following');
    const followedCelebIds = user.following
      .filter(u => u.role === 'celeb')
      .map(c => c._id);

    const posts = await Post.find({ author: { $in: followedCelebIds } })
      .sort({ createdAt: -1 })
      .populate('author', 'username role');

    res.status(200).json({ success: true, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch feed' });
  }
};

