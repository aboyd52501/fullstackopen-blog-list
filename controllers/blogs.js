const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', (req, res) => {
  Blog
    .find({})
    .then((blogs) => {
      res.json(blogs);
    });
});

blogsRouter.get('/:id', (req, res, next) => {
  Blog
    .findById(req.params.id)
    .then((blog) => {
      if (blog) {
        res.json(blog);
      } else {
        res.status(404).end();
      }
    })
    .catch(next);
});

blogsRouter.post('/', (req, res, next) => {
  const blog = new Blog(req.body);

  blog
    .save()
    .then((returnedBlog) => {
      res.json(returnedBlog);
    })
    .catch(next);
});

blogsRouter.delete('/:id', (req, res, next) => {
  Blog
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch(next);
});

blogsRouter.put('/:id', (req, res, next) => {
  console.log(req.body);

  Blog
    .findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    )
    .then((updatedBlog) => {
      res.json(updatedBlog);
    })
    .catch(next);
});

module.exports = blogsRouter;
