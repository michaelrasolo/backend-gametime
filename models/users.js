const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	nickname: String,
    email: String,
    password: String,
    token: String,
    birthdate: Date,
    gender: String,
    level: String,
    picture: String,
    description: String,
    favoriteTeam: String,
    favoritePlayer: String,
    favoriteShoes: String,
    favoritePlaygrounds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'playgrounds' }],
});


const User = mongoose.model('users', userSchema);

module.exports = User;
