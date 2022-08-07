const jwt = require('jsonwebtoken');
const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (req, res) => {
  // Blog
  //   .find({})
  //   .then((blogs) => {
  //     res.json(blogs);
  //   });
  const blogs = await Blog
    .find()
    .populate('user', {
      username: 1,
      name: 1,
    });

  res.json(blogs);
});

blogsRouter.get('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (blog) res.json(blog);
  else res.status(404).end();
  // Blog
  //   .findById(req.params.id)
  //   .then((blog) => {
  //     if (blog) {
  //       res.json(blog);
  //     } else {
  //       res.status(404).end();
  //     }
  //   })
  //   .catch(next);
});

blogsRouter.post('/', async (req, res) => {
  const {
    title,
    author,
    url,
    likes,
  } = req.body;

  const decodedToken = jwt.verify(req.token, process.env.SECRET);
  if (!decodedToken.id) {
    return res.status(401).json({
      error: 'token missing or invalid',
    });
  }
  const user = await User.findById(decodedToken.id);

  if (!user) return res.status(400).json({ error: 'user not found' });

  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: user._id,
  });

  const returnedBlog = await blog.save();

  user.blogs = user.blogs.concat(returnedBlog._id);
  await user.save();

  return res.status(201).json(returnedBlog);

  // blog
  //   .save()
  //   .then((returnedBlog) => {
  //     res.status(201).json(returnedBlog);
  //   })
  //   .catch(next);
});

blogsRouter.delete('/:id', async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.status(204).end();
  // Blog
  //   .findByIdAndRemove(req.params.id)
  //   .then(() => {
  //     res.status(204).end();
  //   })
  //   .catch(next);
});

blogsRouter.put('/:id', async (req, res) => {
  const newBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );
  res.json(newBlog);
  // Blog
  //   .findByIdAndUpdate(
  //     req.params.id,
  //     req.body,
  //     { new: true },
  //   )
  //   .then((updatedBlog) => {
  //     res.json(updatedBlog);
  //   })
  //   .catch(next);
});

module.exports = blogsRouter;
