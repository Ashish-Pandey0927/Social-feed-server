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
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = 3;
  const skip = (page - 1) * limit;

  try {
    const user = await User.findById(userId);
    const followingIds = user.following;

    const posts = await Post.find({
      author: { $in: followingIds }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username role");

    res.json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching feed" });
  }
};


