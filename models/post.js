const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, {timestamps: true} // second parameter of the Schema object, which will add createdAt and updatedAt in every object, refer mongoose docs
)

module.exports = mongoose.model('Post', postSchema)