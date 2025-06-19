module.exports = (req, res, next) => {
  console.log('user role:', req.user.role);
  if (req.user.role !== 'celeb') {
    return res.status(403).json({ msg: 'Only celebrities can perform this action.' });
  }
  next();
};
