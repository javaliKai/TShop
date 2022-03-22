const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/User');

/**
 * @route   POST from endpoint api/auth/
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/',
  [check('email', '').isEmail(), check('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      // Check whether user exists in db
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User is not registered!' }] });
      }

      // Check whether password match
      const passwordIsMatch = await bcrypt.compare(password, user.password);
      if (!passwordIsMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Wrong email or password!' }] });
      }

      // Creating payload for JWT
      const payload = {
        user: {
          id: user.id,
        },
      };

      // Generate JWT
      jwt.sign(
        payload,
        config.get('jwtToken'),
        // expires in 3 hours
        { expiresIn: '3h' },
        (error, token) => {
          if (error) throw error;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error!');
      process.exit(1);
    }
  }
);

module.exports = router;
