const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'sessions' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  comment: String,
});

const voteSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  grade: Number,
});

const playgroundSchema = mongoose.Schema({
  name: String,
  photo: String,
  comments: [commentSchema],
  votes: [voteSchema],
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
  },
  country: String,
  postCode: String,
  city: String,
  address: String,
});

playgroundSchema.index({ location: '2dsphere' }); // Add 2dsphere index for geospatial queries

const Playground = mongoose.model('playgrounds', playgroundSchema);

module.exports = Playground;
