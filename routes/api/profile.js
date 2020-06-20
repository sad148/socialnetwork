const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile')
const User = require('../../models/User');
const {check, validationResult} = require('express-validator');
// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);
    if(!profile) {
      res.status(400).json({msg: 'There is no profile for this user'})
    }
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
})

// @route   POST api/profile/
// @desc    Create or update a user profile
// @access  Private

router.post('/', [
  auth, 
  [
    check('status', 'Status is required').not().isEmpty(), 
    check('skills', 'Skills is required').not().isEmpty()
  ]
], async(req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }
  const {
    company,
    location,
    website,
    bio,
    skills,
    status,
    githubusername,
    youtube,
    twitter,
    instagram,
    linkedin,
    facebook
  } = req.body;
  
  // Build profile obj
  const profileFields = {};
  profileFields.user = req.user.id;
  if(company) profileFields.company = company;
  if(website) profileFields.website = website;
  if(location) profileFields.location = location;
  if(bio) profileFields.bio = bio;
  if(status) profileFields.status = status;
  if(githubusername) profileFields.githubusername = githubusername;
  if(skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim());
  }

  //Build social object
  profileFields.social = {};
  if(youtube) profileFields.social.youtube = youtube;
  if(twitter) profileFields.social.twitter = twitter;
  if(instagram) profileFields.social.instagram = instagram;
  if(linkedin) profileFields.social.linkedin = linkedin;
  if(facebook) profileFields.social.facebook = facebook;

  try {
    let profile = await Profile.findOne({user: req.user.id});
    if(profile) {
      //Update
      profile = await Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields}, {new: true});
      return res.json(profile);
    }

    //Create
    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);

  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error')
  }

  res.send('Hello');
})


// @route   GET api/profile/
// @desc    Get all profiles
// @access  Public
router.get('/', async(req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (error) {
    console.error(error)
    res.status(500).json('Server error')
  }
});


// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async(req, res) => {
  try {
    const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);
    if(!profile) {
      res.status(400).json({msg: "Profile not found"});
    }
    res.json(profile);
  } catch (error) {
    console.error(error)
    if(error.kind == 'ObjectId') {
      res.status(400).json({msg: "Profile not found"});
    }
    res.status(500).json('Server error')
  }
});

module.exports = router;