const User = require('../models/User');

exports.followCeleb = async (req, res) => {
  const celebId = req.params.celebId;
  const userId = req.user?._id;

  console.log("User ID:", userId);
  console.log("Celebrity ID:", celebId);

  if (!userId) return res.status(401).json({ msg: 'Unauthorized - User missing' });
  if (!celebId || celebId.length !== 24) return res.status(400).json({ msg: 'Invalid celeb ID' });

  try {
    const celeb = await User.findById(celebId);
    if (!celeb || celeb.role !== 'celeb') {
      return res.status(404).json({ msg: 'Celebrity not found' });
    }

    const user = await User.findById(userId);
    if (user.following.includes(celebId)) {
      return res.status(400).json({ msg: 'Already following this celebrity' });
    }

    user.following.push(celebId);
    celeb.followers.push(userId);

    await user.save();
    await celeb.save();

    res.json({ msg: `You are now following ${celeb.username}` });
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ msg: 'Server error' });
  }
};


exports.searchCelebrities = async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      role: 'celeb',
      username: { $regex: query, $options: 'i' }
    }).select('_id username');

    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};