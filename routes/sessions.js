var express = require("express");
var router = express.Router();
const User = require("../models/users");
const Session = require("../models/sessions");

// CREATE A NEW GAME
router.post("/create", (req, res) => {
  // Get the user ID from the Token
  console.log('hello')
  User.findOne({ token: req.body.token }).then((data) => {
    if (data) { console.log(data)
      const userID = data._id;
      // Set a variable with the participant ID and number of people
      const participantData = [{ user: userID, admin: req.body.admin, group: req.body.group }];

      // New game creation
      const newSession = new Session({
        playground: req.body.playground,
        sessionType: req.body.sessionType,
        date: req.body.date,
        time: req.body.time,
        level: req.body.level,
        mood: req.body.mood,
        ball: req.body.ball ? [userID] : [],
        participants: participantData,
        maxParticipants: req.body.maxParticipants,
        frequency: req.body.frequency,
        maxParticipants: req.body.maxParticipants,
        limitDate: req.body.limitDate,
      });

      newSession.save().then((newDoc) => {
        res.json({ result: true, sessionID: newDoc._id });
      });
    }
  });
});
// ===== END OF ROUTE GAME CREATION ===== //

router.get("/", (req, res) => {
  const now = new Date();

  Session.find() // filtre now date: { $gte: now }
    .populate("playground")
    .then((data) => {
      if (!data) {
        res.json({ result: false, error: "No session found" });
      }
      // Format the date and time for each session and count the total participants
      const formattedData = data.map((session) => {
        const formattedDate = session.date.toLocaleDateString();
        const formattedTime = session.date.toLocaleTimeString();
        const participantsWithGroupCount = session.participants.map(
          (participant) => {
            return {
              user: participant.user,
              group: participant.group,
              peopleInGroup: participant.group > 1 ? participant.group + 1 : 1,
            };
          }
        );
        const totalParticipants = participantsWithGroupCount.reduce(
          (sum, participant) => sum + participant.peopleInGroup,
          0
        );

        return {
          ...session.toObject(),
          formattedDate,
          formattedTime,
          participants: participantsWithGroupCount,
          totalParticipants,
        };
      });

      res.json({ result: true, data: formattedData });
    });
});

// ======== ROUTE GET SPECIFIC GAME ======== //

router.get("/game/:gameid", (req, res) => {
  const now = new Date();

  Session.findById(req.params.gameid) // filtre now date: { $gte: now }
    .populate("playground")
    .then((sessionData) => {
      // Error if no session found
      if (!sessionData) {
        res.json({ result: false, error: "No session found" });
      }
      // count the total participants
      const sum = sessionData.participants.reduce((total, participant) => {
        if (participant.group) {
          return total + participant.group;
        }
        return total;
      }, 0);
      res.json({ result: true, totalParticipants: sum, sessionData });
    });
});

// ======== END OF ROUTE GET SPECIFIC GAME ======== //

// ======== ROUTE JOIN A GAME ======== //
router.put("/join/:gameid/:token", (req, res) => {
  User.findOne({ token: req.params.token })
    .then((user) => {
      // Check for the user based on the token
      if (!user) {
        res.json({ result: false, error: "User not found" });
      } else {
        // Declare the object to push in the session data
        const pushObj = {
          participants: { user: user._id, group: req.body.group },
        };

        // Check if user brings the ball =====> CONDITIONNAL DOESN'T WORK
        console.log(req.body.ball)
        if (req.body.ball) {
          pushObj.ball = user._id;
        }
        console.log(pushObj)
        // Find the session and update participants and ball
        Session.findOneAndUpdate(
          { _id: req.params.gameid },
          {
            $push: pushObj
          }
        )
          .then((updatedSession) => {
            return res.json({
              result: true,
              message: `Session ${req.params.gameid} joined by the user token ${req.params.token}`,
            });
          })
          .catch((error) => {
            return res.json({ result: false, error: "Session not found" });
          });
      }
    })
    .catch((error) => {
      return res.json({ result: false, error: "Error on the route request" });
    });
});

// ======== END OF ROUTE JOIN GAME ======== //

// ======  ROUTE TO CHECK IF THE USER IS IN THE SESSION ALREADY ====== //
router.get("/check/:gameId/:token", (req, res) => {
  User.findOne({ token: req.params.token })
    .then((user) => {
      // Check for the user based on the token
      if (!user) {
        res.json({ result: false, error: "User not found" });
      } else {
        // Find the session by ID and check if the user is a participant
        Session.findOne({ _id: req.params.gameId, "participants.user": user._id })
          .then((session) => {
            if (session) {
              res.json({ result: true, message: "User is already in the session" });
            } else {
              res.json({ result: false, message: "User is not in the session" });
            }
          })
          .catch((error) => {
            res.json({ result: false, error: "Error finding session" });
          });
      }
    })
    .catch((error) => {
      res.json({ result: false, error: "Error on the route request" });
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
      return res.json({ result: false, error: 'No user found' })
    } else {
      const currentDate = new Date();
      Session.find({ 'participants.user': userData._id, date: { $gte: currentDate } })
        .populate('playground')
        .then(sessionData => {
          if (!sessionData || sessionData.length === 0) {
            return res.json({ result: false, error: 'No session found for this user' })
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


// ====== END OF ROUTE TO CHECK USER IN THE SESSION ======//


module.exports = router;

// SESSION SCHEMA

// const sessionSchema = mongoose.Schema({
//   playground: { type: mongoose.Schema.Types.ObjectId, ref: 'playgrounds' },
// sessionType: String,
//   date: Date,
//   level: String,
//   mood : String,
//   ball : [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
//   participants : [participantSchema],
//   maxParticipants : Number,
//   frequency: Boolean,
//   limitDate: Date,
// });
