const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: String,
  url: String,
  likes: Number,
});

blogSchema.set('toJSON', {
  transform: (document, returned) => {
    // We have to use eslint-disable-line on these lines because of the way mongoose works.
    returned.id = returned._id.toString(); // eslint-disable-line 
    delete returned.__v; // eslint-disable-line
    delete returned._id; // eslint-disable-line

    // console.log('Transformed:', document, 'into:', returned);
  },
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
