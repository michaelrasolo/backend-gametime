const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    message: String,
    date : Date,
   });

const chatSchema = mongoose.Schema({
	session: { type: mongoose.Schema.Types.ObjectId, ref: 'sessions' },
    messages : [messageSchema],
});

const Chat = mongoose.model('chats', chatSchema);

module.exports = Chat;
