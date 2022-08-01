/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const { initialBlogs, blogsInDb } = require('./test_helper');

// We are creating a supertest instance of the backend REST API server.
const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany();
  const initialBlogDocuments = initialBlogs.map((data) => new Blog(data));
  const promiseArray = initialBlogDocuments.map((blog) => blog.save());
  await Promise.all(promiseArray);
  // await Blog.deleteMany({});
  // let blogObject = new Blog(initialBlogs[0]);
  // await blogObject.save();
  // blogObject = new Blog(initialBlogs[1]);
  // await blogObject.save();
});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
}); // If the requests take longer than 5s, add a third param to this func (milliseconds)

test('there are two blogs', async () => {
  const blogs = await blogsInDb();
  expect(blogs).toHaveLength(initialBlogs.length);
});

test('blogs use .id and not ._id', async () => {
  const blogs = await blogsInDb();
  const idCheckingPromises = blogs.map(
    (blog) => expect(blog.id).toBeDefined(),
  );
  const _idCheckingPromises = blogs.map(
    (blog) => expect(blog._id).not.toBeDefined(),
  );
  await Promise.all([...idCheckingPromises, ..._idCheckingPromises]);
});

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'New blog post!',
    author: 'Jest',
    url: '/tests/blog_api.test.js',
    likes: 0,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAfter = await blogsInDb();
  const titles = blogsAfter.map((x) => x.title);

  expect(blogsAfter).toHaveLength(initialBlogs.length + 1);
  expect(titles).toContain(
    newBlog.title,
  );
});

test('a blog without a title isn\'t added', async () => {
  const newBlog = {
    likes: 15,
    url: 'no title!',
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400);

  const res = await blogsInDb();
  expect(res).toHaveLength(initialBlogs.length);
});

test('a blog without a url isn\'t added', async () => {
  const newBlog = {
    likes: 15,
    title: 'no url!',
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400);

  const res = await blogsInDb();
  expect(res).toHaveLength(initialBlogs.length);
});

test('likes property defaults to 0', async () => {
  const newBlog = {
    title: 'default likes = 0 // test',
    author: 'jest',
    url: '1234',
  };

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201);

  expect(response.body.likes).toBe(0);
});

test('a specific blog can be viewed', async () => {
  const blogs = await blogsInDb();
  const blogToView = blogs[0];

  const resultBlog = await api
    .get(`/api/blogs/${blogToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  // This is necessary because ._id is only turned into .id on toJSON.
  const processedBlogToView = JSON.parse(JSON.stringify(blogToView));

  expect(resultBlog.body).toEqual(processedBlogToView);
});

test('a blog can be deleted', async () => {
  const blogsAtStart = await blogsInDb();

  const blogToDelete = blogsAtStart[0];

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204);

  const blogsAtEnd = await blogsInDb();
  expect(blogsAtEnd.length).toEqual(blogsAtStart.length - 1);

  const titles = blogsAtEnd.map((blog) => blog.title);
  expect(titles).not.toContain(blogToDelete.title);
});

test('a blog can be modified', async () => {
  const blogsAtStart = await blogsInDb();

  const oldFirstBlog = blogsAtStart[0];
  const newFirstBlog = JSON.parse(JSON.stringify(blogsAtStart[0]));
  newFirstBlog.author = 'MODIFIED AUTHOR VIA PUT REQUEST';
  delete newFirstBlog.id;

  const modifiedFirstBlogRes = await api
    .put(`/api/blogs/${oldFirstBlog.id}`)
    .send(newFirstBlog)
    .expect(200);

  // You must get the .body of a supertest response to get the body!
  expect(modifiedFirstBlogRes.body.author).toBe(newFirstBlog.author);
  expect(modifiedFirstBlogRes.body.author).not.toBe(oldFirstBlog.author);
});

afterAll(() => {
  mongoose.connection.close();
});
