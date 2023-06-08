var express = require('express');
var router = express.Router();
const Chat = require('../models/chats');
const User = require('../models/users');

/* GET home page. */
router.post('/message', (req, res) => {
  const sessionId = req.body.sessionId;
  const messageText = req.body.message;

  User.findOne({ token: req.body.token })
    .then(userData => {
      // Find the chat based on the session ID
      Chat.findOne({ session: sessionId })
        .then((chat) => {
          if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
          }

          // Create a new message and add it to the messages array
          const newMessage = {
            user: userData._id,
            message: messageText,
            date: new Date(),
          };

          chat.messages.push(newMessage);

          // Save the updated chat
          return chat.save()
            .then(() => {
              res.status(200).json({ message: 'Message added to the conversation' });
            })
            .catch((error) => {
              console.error(error);
              res.status(500).json({ message: 'An error occurred' });
            });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({ message: 'An error occurred' });
        });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: 'An error occurred' });
    });
});


  router.put('/:sessionId', (req, res) => {
    Chat.findOne({ session: req.params.sessionId })
      .populate('messages.user', 'token nickname') // Populate the 'user' field within the 'messages' field to get the user's token and nickname
      .then((data) => {
        if (!data || !data.messages) {
          return res.status(404).json({ error: 'Chat or messages not found' });
        }
  
        const messages = data.messages.map((message) => ({
          token: message.user.token,
          nickname: message.user.nickname,
          date: message.date,
          message: message.message,
        }));
  
        res.json(messages);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      });
  });
  

module.exports = router;
