module.exports = (req, res, next) => {
  if (req.user.role !== 'celeb') {
    return res.status(403).json({ msg: 'Only celebrities can perform this action.' });
  }
  next();
};
