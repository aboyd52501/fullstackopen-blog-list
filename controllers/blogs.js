const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (req, res) => {
  // Blog
  //   .find({})
  //   .then((blogs) => {
  //     res.json(blogs);
  //   });
  const blogs = await Blog.find({});
  res.json(blogs);
});

blogsRouter.get('/:id', async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  try {
    if (blog) res.json(blog);
    else res.status(404).end();
  } catch (e) {
    next(e);
  }
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

blogsRouter.post('/', async (req, res, next) => {
  const blog = new Blog(req.body);

  try {
    const returnedBlog = await blog.save();
    res.status(201).json(returnedBlog);
  } catch (e) {
    next(e);
  }
  // blog
  //   .save()
  //   .then((returnedBlog) => {
  //     res.status(201).json(returnedBlog);
  //   })
  //   .catch(next);
});

blogsRouter.delete('/:id', async (req, res, next) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
  // Blog
  //   .findByIdAndRemove(req.params.id)
  //   .then(() => {
  //     res.status(204).end();
  //   })
  //   .catch(next);
});

blogsRouter.put('/:id', async (req, res, next) => {
  try {
    const newBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json(newBlog);
  } catch (e) {
    next(e);
  }
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
