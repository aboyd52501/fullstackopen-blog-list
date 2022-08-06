const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: String,
  url: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

/* eslint-disable no-param-reassign, no-underscore-dangle */
blogSchema.set('toJSON', {
  transform: (document, returned) => {
    returned.id = returned._id.toString();
    delete returned.__v;
    delete returned._id;
    // console.log('Transformed:', document, 'into:', returned);
  },
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
