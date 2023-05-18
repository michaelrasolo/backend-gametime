var express = require("express");
var router = express.Router();
const User = require("../models/users");
const Session = require('../models/sessions');

// CREATE A NEW GAME
router.post("/create", (req, res) => {
  // Get the user ID from the Token
  User.findOne({ token: req.body.token }).then((data) => {
    if (data) {
      const userID = data._id;
      // Set a variable with the participant ID and number of people
      const participantData = [{ user: userID, group: req.body.group }];

      // New game creation
      const newSession = new Session({
        playground: req.body.playground, 
        sessionType: req.body.sessionType,
        date: new Date(),
        level: req.body.level,
        mood: req.body.mood,
        ball: userID,
        participants: participantData,
        frequency: req.body.frequency,
        limitDate: new Date(),
      });

      newSession.save().then((newDoc) => {
        res.json({ result: true, sessionID: newDoc._id });
      });
    }
  });
});

router.get('/', (req, res) => {
  const now = new Date();


  Session.find() // filtre now date: { $gte: now } 
   .populate('playground')
 .then(data => {
  if(!data) {
    res.json({ result: false, error: 'No session found' })
  }
// Format the date and time for each session and count the total participants
   const formattedData = data.map(session => {
     const formattedDate = session.date.toLocaleDateString();
     const formattedTime = session.date.toLocaleTimeString();
     const participantsWithGroupCount = session.participants.map(participant => {
      return {
        user: participant.user,
        group: participant.group,
        peopleInGroup: participant.group > 1 ? participant.group + 1 : 1
      };
    });
    const totalParticipants = participantsWithGroupCount.reduce((sum, participant) => sum + participant.peopleInGroup, 0);

  return {
    ...session.toObject(),
    formattedDate,
    formattedTime,
    participants: participantsWithGroupCount,
          totalParticipants
  };
});


  res.json({ result: true, data: formattedData })
 });
});



module.exports = router;


// SESSION SCHEMA

// const sessionSchema = mongoose.Schema({
//     playground: { type: mongoose.Schema.Types.ObjectId, ref: 'playgrounds' },
// 	sessionType: String,
//     date: Date,
//     level: String,
//     mood : String,
//     ball : [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
//     participants : [participantSchema],
//     frequency: Boolean,
//     limitDate: Date,
// });
