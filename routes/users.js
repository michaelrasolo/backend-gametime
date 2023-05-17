var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

// Route to Signup
router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Check if the user has not already been registered
  User.findOne({ email: req.body.email }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        nickname: req.body.nickname,
        email: req.body.email,
        password: hash,
        token: uid2(32),
      });

      newUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
});

// Route to signin
router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ email: req.body.email }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});

//Route to update user profil
router.put('/update', (req, res) => {
  User.findOne({ token: req.body.token }).then(data => {
    if (!data) {
      res.json({ result: false, error: 'No user found' })
      return;
    }

    User.updateOne({ token: req.body.token }, 
      {
      nickname: req.body.nickname,
      gender: req.body.gender,
      level: req.body.level,
      description: req.body.description,
      favoriteTeam: req.body.favoriteTeam,
      favoritePlayer: req.body.favoritePlayer,
      favoriteShoes: req.body.favoriteShoes,
    })
    .then(data => {
      res.json({ result: true, data })
    });
  })
});

//Route to get user profil infos
router.get('/:token', (req, res) => {
  User.findOne({ token: req.params.token }).then(data => {
    if (!data) {
      res.json({ result: false, error: 'No user found' })
} else {
  res.json({ result: true, data })
}
})
})

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;

