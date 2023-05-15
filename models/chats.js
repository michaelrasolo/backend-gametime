const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
	session: { type: mongoose.Schema.Types.ObjectId, ref: 'sessions' },
    messages : [messageSchema],
});

const messageSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    message: String,
    timeStamp : Date,
   });



const Chat = mongoose.model('chats', chatSchema);

module.exports = Chat;
