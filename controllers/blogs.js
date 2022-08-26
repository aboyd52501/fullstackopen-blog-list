const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

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
});

blogsRouter.post('/', async (req, res) => {
  const {
    title,
    author,
    url,
    likes,
  } = req.body;
  const { user } = req;

  if (!user) {
    return res.status(401).json({
      error: 'no authentication supplied',
    });
  }

  const blog = new Blog({
    title,
    author: author || 'Anonymous',
    url,
    likes,
    user: user._id,
  });

  const returnedBlog = await blog.save();

  user.blogs = user.blogs.concat(returnedBlog._id);
  await user.save();

  return res.status(201).json(returnedBlog);
});

blogsRouter.delete('/:id', async (req, res) => {
  const { user } = req;

  if (!user) {
    return res.status(400).json({
      error: 'no authentication supplied',
    });
  }

  const thisBlog = await Blog.findById(req.params.id);
  if (user._id.toString() !== thisBlog.user.toString()) {
    return res.status(401).json({
      error: 'insufficient permissions',
    });
  }

  await thisBlog.remove();
  return res.status(204).end();
});

blogsRouter.put('/:id', async (req, res) => {
  const newBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );
  res.json(newBlog);
});

module.exports = blogsRouter;
