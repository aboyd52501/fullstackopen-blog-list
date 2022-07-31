const Blog = require('../models/blog');

const initialBlogs = [
  {
    title: 'HTML is easy',
    author: 'The coder',
    url: 'hello.world',
    likes: 1000,
  },
  {
    title: 'Javascript',
    author: 'Mozilla Chrome',
    url: 'https://www.opera.com/',
    likes: 1000000000,
  },
];

const nonExistingId = async () => {
  const blog = new Blog({ title: 'i am leaving soon' });
  await blog.save();
  await blog.delete();

  // eslint-disable-next-line no-underscore-dangle
  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs;
};

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
};
