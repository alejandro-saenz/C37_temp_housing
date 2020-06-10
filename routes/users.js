const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth.js');
const User = require('../models/user');
const multer = require('multer');
const {
  sendWelcomeEmail,
  sendCancellationEmail
} = require('../emails/account');

// Create a user
router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    sendWelcomeEmail(user.email, user.name);
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Get current user
router.get('/users/user', auth, async (req, res) => {
  res.send(req.user);
});

// Update a logged in user
router.patch('/users/user', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'firstName',
    'lastName',
    'birthday',
    'email',
    'phone',
    'password',
    'gender',
    'description',
    'preferencesExchange'
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: 'Update not valid.' });
  }
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Delete a user
router.delete('/users/user', auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancellationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

// Serve a user's avatar

router.get('/users/:id/avatar', auth, async (req, res) => {
  try {
    if (!req.user.avatar) {
      throw new Error();
    }
    res.set('Content-Type', 'image/png');
    res.send(req.user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

// Upload a user avatar

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image.'));
    }
    cb(undefined, true);
  }
});

router.post(
  '/users/user/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({
        width: 250,
        height: 250
      })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

// Delete a user's avatar
router.delete('/users/use/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

// Logout all devices
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// Logout a user
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

// Login a user
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;
