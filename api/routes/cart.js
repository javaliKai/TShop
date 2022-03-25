const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth-middleware');
const { check, validationResult } = require('express-validator');

const Cart = require('../../models/Cart');

/**
 * @route   GET from endpoint api/cart/:user
 * @desc    Fetch the user cart
 * @access  Private
 */
router.get('/', [authMiddleware], async (req, res) => {
  // Get the user id from req.user set by the auth middleware
  const user = req.user.id;

  try {
    // Get the user cart
    const userCart = await Cart.findOne({ user });

    // Just give empty array when the user doesn't have cart yet
    if (!userCart) {
      return res.send([]);
    }

    res.json(userCart.itemList);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error!');
    process.exit(1);
  }
});

/**
 * @route   PUT from endpoint api/cart/
 * @desc    Add item to cart
 * @access  Private
 */
router.put(
  '/',
  [
    authMiddleware,
    [
      // check('user', 'Please provide the user ID!')
      //   .notEmpty(),
      check('itemId', 'Item ID is required!').notEmpty(),
      check('name', 'Item name is required!').notEmpty(),
      check('price', 'Item price is required!').notEmpty(),
      check('quantity', 'Item quantity is required!').notEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get data from the req
    const { itemId, name, price, quantity } = req.body;

    try {
      // If item exists in the db, just increase the quantity
      let userCart = await Cart.findOne({ user: req.user.id }); // user.id is received from JWT

      if (!userCart) {
        // Create a new user cart
        userCart = new Cart({ user: req.user.id, itemList: [] });
      }

      const itemInCart = userCart.itemList.find(
        (item) => item.itemId === String(itemId)
      );

      if (itemInCart) {
        itemInCart.quantity += 1;
        await userCart.save();
        return res.json(userCart);
      } else if (!itemInCart) {
        // Create a new entry in Cart model
        userCart.itemList.unshift({ itemId, name, price, quantity });
        await userCart.save();
        return res.json(userCart);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error!');
      process.exit(1);
    }
  }
);

/**
 * @route   DELETE from endpoint api/cart/:item_id
 * @desc    Delete a specific item
 * @access  Private
 */
router.delete('/:item_id', [authMiddleware], async (req, res) => {
  // Get item id from URL params
  const itemId = req.params.item_id;

  // Get current user
  const user = req.user.id;

  try {
    // Find the user cart
    const userCart = await Cart.findOne({ user });
    if (!userCart) {
      return res.status(400).json({ error: [{ msg: 'Cart not found!' }] });
    }

    // Filter the cart, exclude the pointed item
    userCart.itemList = userCart.itemList.filter((item) => {
      item.itemId !== itemId;
    });

    // Save changes
    await userCart.save();

    res.send(userCart);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error!');
    process.exit(1);
  }
});

/**
 * @route   PUT from endpoint api/cart/:item_id
 * @desc    Update quantity of a specific item
 * @access  Private
 */
router.put(
  '/:item_id',
  [
    authMiddleware,
    [check('quantity', 'Please provide a cart data (quantity)').notEmpty()],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Get item id from URL params
    const itemId = req.params.item_id;

    // Get user from req.user.id
    const user = req.user.id;

    // Get the request body
    const { quantity } = req.body;
    if (quantity < 0) {
      return res.status(400).json({ error: [{ msg: 'Invalid quantity!' }] });
    }

    try {
      // Get user cart
      const userCart = await Cart.findOne({ user });
      if (!userCart || userCart.itemList.length === 0) {
        return res.status(400).json({ error: [{ msg: 'Cart is empty!' }] });
      }

      // Update the quanity (decrement/increment will be handled at the front-end)
      if (quantity === 0) {
        // Delete the item
        userCart.itemList = userCart.itemList.filter(
          (item) => item.itemId !== itemId
        );
        await userCart.save();
        return res.json(userCart);
      }

      if (quantity > 0) {
        // Update the quantity
        const cartItem = userCart.itemList.find((item) => {
          return item.itemId === itemId;
        });

        cartItem.quantity = quantity;
        await userCart.save();
        res.json(userCart);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error!');
      process.exit(1);
    }
  }
);
module.exports = router;
