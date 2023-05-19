var express = require("express");
var router = express.Router();
const User = require("../models/users");
const Session = require('../models/sessions');

// CREATE A NEW GAME
router.post("/create", (req, res) => {
  // Get the user ID from the Token
  console.log('hello')
  User.findOne({ token: req.body.token }).then((data) => {
    if (data) { console.log(data)
      const userID = data._id;
      // Set a variable with the participant ID and number of people
      const participantData = [{ user: userID, group: req.body.group }];

      // New game creation
      const newSession = new Session({
        playground: req.body.playground, 
        sessionType: req.body.sessionType,
        date: req.body.date,
        date: req.body.time,
        level: req.body.level,
        mood: req.body.mood,
        ball: [req.body.ball && userID],
        participants: participantData,
        frequency: req.body.frequency,
        limitDate: req.body.limitDate,
      });

      newSession.save().then((newDoc) => {
        res.json({ result: true, sessionID: newDoc._id });
      });
    }
  });
});

// GET ALL SESSIONS
router.get('/all', (req, res) => {
  const now = new Date();
  Session.find() // filtre now date: { $gte: now } 
    .populate('playground')
    .then(data => {
      if (!data) {
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
      res.json({ result: true, formattedData })
    });
});

// GET FUTUR USER SESSIONS
router.get('/futur/:token', (req, res) => {
  User.findOne({ token: req.params.token }).then(userData => {
    if (!userData) {
      res.json({ result: false, error: 'No user found' })
    } else {
      const currentDate = new Date();
      Session.find({ 'participants.user': userData._id, date: { $gte: currentDate } })
        .populate('playground')
        .then(sessionData => {
          if (!sessionData || sessionData.length === 0) {
            res.json({ result: false, error: 'No session found for this user' })
          } else {
            const formattedData = sessionData.map(session => {
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
            res.json({ result: true, formattedData })
          }
        })
    }
  })
})
  
// GET PAST USER SESSIONS
router.get('/past/:token', (req, res) => {
  User.findOne({ token: req.params.token }).then(userData => {
    if (!userData) {
      res.json({ result: false, error: 'No user found' })
    } else {
      const currentDate = new Date();
      Session.find({ 'participants.user': userData._id, date: { $lt: currentDate } })
        .populate('playground')
        .then(sessionData => {
          if (!sessionData || sessionData.length === 0) {
            res.json({ result: false, error: 'No session found for this user' })
          } else {
            const formattedData = sessionData.map(session => {
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
            res.json({ result: true, formattedData })
          }
        })
    }
  })
})



// date: { $lt: currentDate }

module.exports = router;


