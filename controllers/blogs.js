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
  const blog = new Blog(req.body);

  const returnedBlog = await blog.save();
  res.status(201).json(returnedBlog);

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
