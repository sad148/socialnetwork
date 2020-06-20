const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const config = require('config')
const {check, validationResult} = require('express-validator/check');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req, res) => {
  try {
    //Get user from the db except the password
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error')
  }
})

// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post('/', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please is required').exists()
] , async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  const {email, password} = req.body;
  try {
    let user = await User.findOne({email});
    if(!user) {
      return res.status(400).json({errors: [{
        msg: 'Invalid credentials'
      }]})
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
      return res.status(400).json({errors: [{
        msg: 'Invalid credentials'
      }]})
    }

    const payload = {
      user: {
        id: user.id //we get the id after the user is saved in the db
      }
    }

    jwt.sign(
      payload, 
      config.get('jwtSecret'), 
      {expiresIn: 360000},
      (err, token) => {
        if(err) throw error;
        res.json({token});
      })
  } catch (error) {
   console.error(error) ;
   res.status(500).send('Server error');
  }
})

module.exports = router;