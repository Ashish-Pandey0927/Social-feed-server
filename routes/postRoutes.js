const express = require("express");
const upload = require("../middlewares/upload");
const auth = require("../middlewares/authMiddleware");
const isCeleb = require("../middlewares/isCeleb");
const Post = require("../models/Post");
const User = require("../models/User");

module.exports = (redisPublisher) => {
  const router = express.Router();

  // Create Post + Notify followers
  router.post(
    "/create",
    auth,
    isCeleb,
    upload.single("image"),
    async (req, res) => {
      try {
        const { caption } = req.body;
        const imagePath = req.file?.filename;

        const newPost = await Post.create({
          author: req.user._id,
          caption,
          image: imagePath,
        });

        // Fetch followers of the celeb
        const celeb = await User.findById(req.user._id);
        const followers = celeb.followers || [];

        // Publish new post event
        redisPublisher.publish(
          "new_post",
          JSON.stringify({
            authorId: req.user._id,
            authorUsername: celeb.username, // Add this
            followers,
            post: {
              _id: newPost._id,
              caption: newPost.caption,
              image: newPost.image,
              createdAt: newPost.createdAt,
            },
          })
        );

        res.status(201).json(newPost);
      } catch (error) {
        console.error("Create Post Error:", error);
        res
          .status(500)
          .json({ message: "Something went wrong while creating post" });
      }
    }
  );

  // Get Feed (unchanged)
router.get("/feed", auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    // Fetch posts from users the current user is following
    const posts = await Post.find({
      author: { $in: currentUser.following },
    })
      .sort({ createdAt: -1 })
      .populate("author", "username profilePic"); // Include more info if needed

    res.json(posts);
  } catch (error) {
    console.error("Feed Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch feed" });
  }
});

return router;
}
