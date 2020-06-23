const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator/check');
const Profile = require('../../models/Profile')
const User = require('../../models/User');
const Posts = require('../../models/Posts');
// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', [auth, [
  check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {

  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()})
  }

  try {
    const user = await User.findById(req.user.id).select('-password');

    const newPost = new Posts({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    })

    const post = await newPost.save();
    res.json(post);
  } catch (error) {
    console.log(error)
    res.status(500).send('Server error')
  }
})

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async(req, res) => {
  try {
    //Sort posts by most recent first
    const posts = await Posts.find().sort({ date: -1});
    res.json(posts);
  } catch (error) {
    console.log(error)
    res.status(500).send('Server error');
  }
});

// @route   GET api/posts/:post_id
// @desc    Get post by id
// @access  Private
router.get('/:post_id', auth, async(req, res) => {
  try {
    const post = await Posts.findById(req.params.post_id);
    if(!post) {
      return res.status(404).json({msg: 'Post not found'});
    }
    res.json(post);
  } catch (error) {
    console.log(error)
    if(error.kind == 'ObjectId') {
      return res.status(404).json({msg: 'Post not found'});
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/posts/:post_id
// @desc    Delete a post
// @access  Private
router.delete('/:post_id', auth, async(req, res) => {
  try {
    const post = await Posts.findById(req.params.post_id);

    //Check user
    if(post.user.toString() !== req.user.id) {
      return res.status(401).json({msg: 'User not authorized'});
    } else {
      await post.remove();  
    }
    res.json({msg: 'Post removed'});
  } catch (error) {
    console.log(error)
    if(error.kind == 'ObjectId') {
      return res.status(404).json({msg: 'Post not found'});
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;