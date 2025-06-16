const Post = require('../models/Post');

exports.createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    const newPost = new Post({
      author: req.user.id,  // this comes from the JWT auth middleware
      content,
      image
    });

    await newPost.save();
    res.status(201).json({ success: true, post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username role');  // show author's username and role
    res.status(200).json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch feed' });
  }
};
