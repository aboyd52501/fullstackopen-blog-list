/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const {
  initialBlogs,
  initialUsers,
  blogsInDb,
  nonExistingId,
} = require('./test_helper');

// We are creating a supertest instance of the backend REST API server.
const api = supertest(app);

// for convenience
const BASE_URL = '/api/blogs';
const idUrl = (id) => `${BASE_URL}/${id}`;
const getAllBlogs = () => api.get(BASE_URL);

let sessionJWT = null;
let authString = null;
let authorId = null;
beforeAll(async () => {
  await User.deleteMany();
  const userRes = await api
    .post('/api/users')
    .send(initialUsers[0])
    .expect(201)
    .expect('Content-Type', /application\/json/);

  authorId = userRes.body.id;

  const { username, password } = initialUsers[0];
  const loginRes = await api
    .post('/api/login')
    .send({ username, password })
    .expect(200)
    .expect('Content-Type', /application\/json/);
  const { token } = loginRes.body;

  sessionJWT = token;
  authString = `bearer ${token}`;
});

beforeEach(async () => {
  await Blog.deleteMany();
  const initialBlogDocuments = initialBlogs.map((data) => (
    new Blog({
      user: authorId,
      ...data,
    })
  ));
  const promiseArray = initialBlogDocuments.map((blog) => blog.save());
  await Promise.all(promiseArray);
  // await Blog.deleteMany({});
  // let blogObject = new Blog(initialBlogs[0]);
  // await blogObject.save();
  // blogObject = new Blog(initialBlogs[1]);
  // await blogObject.save();
});

describe('when some blogs are initially saved', () => {
  test('blogs are returned as json', async () => {
    await getAllBlogs()
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all blogs are returned', async () => {
    const response = await getAllBlogs();
    expect(response.body.length).toBe(initialBlogs.length);
  });

  test('exactly what is saved is returned', async () => {
    const blogsAtStart = await blogsInDb();
    const responseBlogs = (await getAllBlogs()).body;
    responseBlogs.forEach((x, i, arr) => {
      arr[i].user = x.user.id; // eslint-disable-line no-param-reassign
    });
    expect(responseBlogs).toEqual(blogsAtStart);
  });

  describe('viewing a specific blog', () => {
    test('succeeds with a valid id', async () => {
      const blogsAtStart = await blogsInDb();
      const targetBlog = blogsAtStart[0];
      const response = await api
        .get(idUrl(targetBlog.id))
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body).toEqual(targetBlog);
    });

    test('fails with code 404 with a valid but unused id', async () => {
      const id = await nonExistingId();
      await api
        .get(idUrl(id))
        .expect(404);
    });

    test('fails with status code 400 with an invalid id', async () => {
      const id = ')@(*@#@!#';
      await api
        .get(idUrl(id))
        .expect(400);
    });
  });

  describe('addition of a new blog', () => {
    test('succceeds with status code 201 with valid data', async () => {
      const newBlog = {
        url: 'hello',
        author: 'hi',
        title: 'hello world',
        likes: 1233214,
      };

      const response = await api
        .post('/api/blogs')
        .set('Authorization', `bearer ${sessionJWT}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const blogsAfter = await blogsInDb();
      expect(blogsAfter).toContainEqual(response.body);
    });

    test('fails with status code 400 if data is invalid but token is valid', async () => {
      const newBlog = {
        author: 'jeff',
      };

      await api
        .post('/api/blogs')
        .set('Authorization', `bearer ${sessionJWT}`)
        .send(newBlog)
        .expect(400)
        .expect('Content-Type', /application\/json/);
    });

    test('fails with status code 401 if data is valid but token is invalid', async () => {
      const newBlog = {
        url: 'hello',
        author: 'hi',
        title: 'hello world',
        likes: 1233214,
      };

      await api
        .post('/api/blogs')
        .set('Authorization', 'bearer badtokenUhOhStinky')
        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/);
    });

    test('fails with status code 401 if data is valid but no token supplied', async () => {
      const newBlog = {
        url: 'hello',
        author: 'hi',
        title: 'hello world',
        likes: 1233214,
      };

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/);
    });
  });

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid and token is valid', async () => {
      const blogsBefore = await blogsInDb();
      const blogToDelete = blogsBefore[0];

      await api
        .delete(idUrl(blogToDelete.id))
        .set('Authorization', authString)
        .expect(204);

      const blogsAfter = await blogsInDb();
      expect(blogsAfter).toHaveLength(blogsBefore.length - 1);
      const ids = blogsAfter.map((blog) => blog.id);
      expect(ids).not.toContain(blogToDelete.id);
    });

    test('fails with status code 400 if id is invalid and token is valid', async () => {
      const badId = '(A*S)(&';
      await api
        .delete(idUrl(badId))
        .set('Authorization', authString)
        .expect(400);
    });

    test('fails with status code 400 if token is invalid', async () => {
      const blogsBefore = await blogsInDb();
      const blogToDelete = blogsBefore[0];

      await api
        .delete(idUrl(blogToDelete.id))
        .expect(400);
    });

    test('fails with status code 401 if token is for another user', async () => {
      const wrongUser = {
        username: 'hellokitty',
        password: '1234abcd',
      };

      await api
        .post('/api/users')
        .send(wrongUser)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const { token } = (await api.post('/api/login').send(wrongUser)).body;

      const blogsBefore = await blogsInDb();
      const blogToDelete = blogsBefore[0];

      await api
        .delete(idUrl(blogToDelete.id))
        .set('Authorization', `bearer ${token}`)
        .expect(401)
        .expect('Content-Type', /application\/json/);

      expect(await blogsInDb()).toEqual(blogsBefore);
    });
  });

  describe('modification of a blog', () => {
    test('succeeds with valid data', async () => {
      const blogsBefore = await blogsInDb();
      const blogToUpdate = { ...blogsBefore[0] };
      blogToUpdate.author = 'markiplier';
      blogToUpdate.likes = -1;

      const response = await api
        .put(idUrl(blogToUpdate.id))
        .send(blogToUpdate)
        .expect(200);

      const updatedBlog = response.body;
      expect(updatedBlog).toEqual(blogToUpdate);
      const blogsAfter = await blogsInDb();
      expect(blogsAfter).toHaveLength(blogsBefore.length);
      const found = blogsAfter.find((blog) => blog.id === blogToUpdate.id);
      expect(found).toBeTruthy();
    });

    test('fails with status code 400 with invalid data', async () => {
      const blogsBefore = await blogsInDb();
      const blogToUpdate = { ...blogsBefore[0] };
      blogToUpdate.author = true;
      blogToUpdate.url = 27840;
      blogToUpdate.likes = 'Hello world';

      await api
        .put(idUrl(blogToUpdate.id))
        .send(blogToUpdate)
        .expect(400);

      const blogsAfter = await blogsInDb();
      expect(blogsAfter).toEqual(blogsBefore);
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
