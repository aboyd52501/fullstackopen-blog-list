const Blog = require('../models/blog');
const User = require('../models/user');

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

const initialUsers = [
  {
    username: 'testAuthor',
    name: 'Testing Author',
    password: 'hello world',
  },
];

const nonExistingId = async () => {
  const blog = new Blog({ title: 'i am leaving soon', url: 'ephemeral.io' });
  await blog.save();
  await blog.delete();

  // eslint-disable-next-line no-underscore-dangle
  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return JSON.parse(JSON.stringify(blogs));
};

const usersInDb = async () => {
  const users = await User.find({});
  return JSON.parse(JSON.stringify(users));
};

module.exports = {
  initialBlogs,
  initialUsers,
  nonExistingId,
  blogsInDb,
  usersInDb,
};
