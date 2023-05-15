const mongoose = require('mongoose');

const playgroundSchema = mongoose.Schema({
	name: String,
    photo: String,
    comments : [commentSchema],
    votes: [voteSchema],
    country:String,
    postCode:String,
    address: String,
    latitude: Number,
    longitude: Number,
});

const commentSchema = mongoose.Schema({
    session : { type: mongoose.Schema.Types.ObjectId, ref: 'sessions' },,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    comment: String,
   });

const voteSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    grade: Number,
   });


const Playground = mongoose.model('playgrounds', playgroundSchema);

module.exports = Playground;
