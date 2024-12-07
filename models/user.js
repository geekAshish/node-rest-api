const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "I'm new",
  },
  posts: [{
    type: Schema.Types.ObjectId, // it'll store the objectId of the post
    ref: 'Post' // it'll be reference of the Post
  }]
})

module.exports = model('User', userSchema);