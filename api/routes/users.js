const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/User');

/**
 * @route   POST from endpoint api/users/
 * @desc    Register user
 * @access  Public
 */
router.post(
  '/',
  [
    check('email', 'Please input a valid email').isEmail(),
    check(
      'password',
      'Please enter password with 6 or more characters'
    ).isLength(6),
    check('fullName', 'Please enter your full name').not().isEmpty(),
    check('age', 'Please enter your age').isNumeric(),
    check('address.country', 'Please enter your country').not().isEmpty(),
    check('address.state', 'Please enter your state').not().isEmpty(),
    check('address.street', 'Please enter your street').not().isEmpty(),
    check('address.postalCode', 'Please enter your postal code')
      .not()
      .isEmpty(),
    check('phoneNumber', 'Please include your phone number').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email,
      password,
      fullName,
      age,
      address,
      country,
      state,
      street,
      postalCode,
      phoneNumber,
    } = req.body;

    try {
      // Make sure the user is NOT registered
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Email is registered to another user!' }] });
      }

      // Create a new user
      user = new User({
        email,
        password,
        fullName,
        age,
        address,
        country,
        state,
        street,
        postalCode,
        phoneNumber,
      });

      // Configure password with bcrypt
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Save the user data to db collection
      await user.save();

      // Give the JWT as response
      const payload = {
        user: {
          email: user.email,
          id: user.id,
        },
      };

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

/**
 * @route   GET from endpoint api/users/
 * @desc    Fetch all users
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error!');
    process.exit(1);
  }
});

/**
 * @route   GET from endpoint api/users/:user_id
 * @desc    Fetch a user by id
 * @access  Private
 */
router.get('/:user_id', async (req, res) => {
  const userID = req.params.user_id;
  try {
    const user = await User.findById(userID);
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error!');
    process.exit(1);
  }
});

module.exports = router;
