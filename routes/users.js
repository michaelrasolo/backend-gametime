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
  if (!checkBody(req.body, ['email', 'password', 'city', 'nickname'])) {
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
        city: req.body.city,
        token: uid2(32),
        picture: ''
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
      res.json({ result: true, token: data.token, nickname: data.nickname, city:data.city, message: `Welcome to GameTime ${data.nickname}` });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});


router.put('/update', async (req,res) => {
  try {
    const user = await User.findOne({ token: req.body.token })
    if (!user) return res.json({ result: false, error: 'No user found' });

    user.birthdate = req.body.birthdate;
    user.city = req.body.city
    user.gender = req.body.gender
    user.level = req.body.level
    user.description = req.body.description
    user.favoriteTeam = req.body.favoriteTeam
    user.favoritePlayer = req.body.favoritePlayer
    user.favoriteShoes = req.body.favoriteShoes

    await user.save()

  res.json({ result: true })
} catch (err) {
  console.log(err)
  res.json({error: err})
}

});

// Route to get picture profile 
const upload = multer({ dest: 'tmp/' });

router.put('/upload', upload.single('photoFromFront'), async (req,res) => {
  try {
    const user = await User.findOne({ token: req.body.token })
    if (!user) return res.json({ result: false, error: 'No user found' });

    const resultCloudinary = await cloudinary.uploader.upload(req.file.path)
    fs.unlinkSync(req.file.path)
    const url = resultCloudinary.secure_url;

    user.picture = url;

    await user.save()

  res.json({ result: true, url: url })
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

// Route to delete picture

router.delete('/deletePicture', async (req, res) => {
  console.log(req.body);
  try {
    const user = await User.findOne({ token: req.body.token })

    if (!user) return res.json({ result: false, error: 'No user found' });
console.log("user",user);
    user.picture = "";

   const userSaved =  await user.save()
    console.log("coucou",userSaved);
  res.json({ result: true, url: '' })
} catch (err) {
  console.log(err)
  res.json({error: err})
}

});

module.exports = router;

