var express = require('express');
var router = express.Router();
const uniqid = require('uniqid');
const multer = require('multer')

const cloudinary = require('cloudinary').v2;
const fs = require('fs');

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

router.put('/update', (req, res) => {
  console.log(req.body);
  User.findOne({ token: req.body.token })
    .then(userData => {
      console.log("Data of the found user", userData);
      if (!userData) {
        res.json({ result: false, error: 'No user found' });
        return;
      }

    User.updateOne({ token: req.body.token }, 
      {
      birthdate: req.body.birthdate,
      city: req.body.city,
      gender: req.body.gender,
      level: req.body.level,
      description: req.body.description,
      favoriteTeam: req.body.favoriteTeam,
      favoritePlayer: req.body.favoritePlayer,
      favoriteShoes: req.body.favoriteShoes,
    })
    .catch(err => {
      console.log(err);
      res.json({ result: false, error: 'An error occurred' });
    });
  })
});

// Route to get picture profile 
const upload = multer({ dest: 'tmp/' });
router.post('/upload', upload.single('photoFromFront'), async (req,res) => {
  try {
      console.log(req.file);
  // Photo path est le nom généré
  // const photoPath = `./tmp/${uniqid()}.jpg`;

  // resultMove = dossier temporaire
  // const resultMove = await req.file.photoFromFront.mv(photoPath)

  const resultCloudinary = await cloudinary.uploader.upload(req.file.path)
  fs.unlinkSync(req.file.path)

  // if(!resultMove){
      res.json({ result: true, url: resultCloudinary.secure_url })
  // } else {
  //     res.json({ result: false, error: resultMove });
  // }
  } catch (err) {
      console.log(err)
      res.json({error: err})
  }

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
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

module.exports = router;

