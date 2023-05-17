const mongoose = require('mongoose');

const participantSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    group: Number,
   });
   
const sessionSchema = mongoose.Schema({
    playground: { type: mongoose.Schema.Types.ObjectId, ref: 'playgrounds' },
	sessionType: String,
    date: Date,
    level: String,
    mood : String,
    ball : [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    participants : [participantSchema],
    frequency: Boolean,
    limitDate: Date,
});


const Session = mongoose.model('sessions', sessionSchema);
const Participant = mongoose.model('participants', participantSchema);

module.exports = Session;
module.exports = Participant;
