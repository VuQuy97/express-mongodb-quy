const router = require('express').Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

// models
const User = require('../model/User');

// @route   GET api/users
// @desc    Get all users
router.get('/', async (_, res) => {
  // code login to save data in DB
  try {
    const users = await User.find().sort({ createAt: -1 });
    res.status(200).json({
      isSuccess: true,
      data: users,
    })
  } catch(err) {
    res.status(500).json({
      msg: "Get users fail",
      isSuccess: false,
    })
  }
});

// @route   GET api/users/:id
// @desc    Get one users
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    res.status(200).json({
      isSuccess: true,
      data: user,
    })
  } catch(err) {
    res.status(500).json({
      msg: "User not found",
      isSuccess: false,
    })
  }
});

// @route   PUT api/users/:id
// @desc    Update user
router.put('/:id', async (req, res) => {
  const { password } = req.body;
  const id = req.params.id;
  try {
    const data = {
      password
    }
    const user = await User.findOneAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );
    if(!user) {
      res.status(400).json({
        msg: "User not found",
        isSuccess: false,
      })
      return;
    }
    res.status(200).json({
      msg: "Update success",
      isSuccess: false,
    })
  } catch(err) {
    res.status(500).json({
      msg: "User not found",
      isSuccess: false,
    })
  }
});

// @route   DELETE api/users/:id
// @desc    delete users
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findOneAndRemove({ _id: id });
    if(!user) {
      res.status(400).json({
        msg: "User not found",
        isSuccess: false,
      })
      return;
    }
    res.status(200).json({
      msg: "Delete success",
      isSuccess: false,
    })
  } catch(err) {
    res.status(500).json({
      msg: "User not found",
      isSuccess: false,
    })
  }
});

// @route   POST api/users/register
// @desc    Register new user
router.post('/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  // check email exist
  const isEmailExisted = await User.findOne({ email });
  if(isEmailExisted) {
    res.status(400).json({
      msg: 'Email already existed',
      isSuccess: false,
    })
    return;
  }

  // hash password
  const salt = await bcryptjs.genSalt(10);
  const hashPassword = await bcryptjs.hash(password, salt);

  // create new user
  const user = new User({
    first_name,
    last_name,
    email,
    password: hashPassword,
  });

  try {
    await user.save();
    res.status(200).json({
      isSuccess: true,
      msg: 'Register success',
    })
  } catch(err) {
    res.status(500).json({
      msg: err,
      isSuccess: false,
    })
  }
})

// @route   POST api/users/login
// @desc    Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // check email exist
  const user = await User.findOne({ email });
  if(!user) {
    res.status(400).json({
      msg: 'Email or password is wrong',
      isSuccess: false,
    })
    return;
  }

  // check valid password
  const isValidPassword = await bcryptjs.compare(password, user.password);
  if(!isValidPassword) {
    res.status(400).json({
      msg: 'Email or password is wrong',
      isSuccess: false,
    })
    return;
  }

  // create token
  const payload = {
    user: {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    }
  }

  jwt.sign(
    payload,
    process.env.SECRET_KEY,
    { expiresIn: 3600 },
    (err, token) => {
      if(err) throw err;
      res.status(200).json({
        isSuccess: true,
        msg: 'Login success',
        token,
      })
    }
  )
})

// @route   POST api/users/verify
// @desc    Authnicate user
router.post('/verify', async (req, res) => {
  const accessToken = req.header('x-auth-token');

  if(!accessToken) {
    res.status(400).json({
      msg: 'No token, authorization denied',
      isSuccess: false,
    })
    return;
  }

  try {
    const user = jwt.verify(accessToken, process.env.SECRET_KEY);
    res.status(200).json({
      user,
      isSuccess: true,
    })
  } catch(err) {
    res.status(500).json({
      msg: 'Token is not valid',
      isSuccess: false,
    })
  }
})



module.exports = router;