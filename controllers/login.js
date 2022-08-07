const jwt = require('jsonwebtoken'); // The web token library
const bcrypt = require('bcrypt'); // The password hashing library
const loginRouter = require('express').Router(); // The express router
const User = require('../models/user'); // Our mongo User model

loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body;
  /*
    Request body will be of the form:
    {
      username: String
      password: String
    }
  */

  const user = await User.findOne({ username });
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash);
  // bcrypt.compare checks the plaintext password against its hash

  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: 'invalid username or password',
    });
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(
    userForToken,
    process.env.SECRET,
    { expiresIn: 60 * 60 },
  );
  // Generate a token based on the username and id using SECRET

  return res
    .status(200)
    .send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
