const supertest = require('supertest');

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/user');
const { usersInDb } = require('./test_helper');

const app = require('../app');

const api = supertest(app);

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany();

    const passwordHash = await bcrypt.hash('sekret', 10);
    const user = new User({ username: 'root', passwordHash });

    await user.save();
  });

  test('creation succeeds with a fresh username', async () => {
    const usersBefore = await usersInDb();

    const newUser = {
      username: 'dwaynej',
      name: 'Dwayne Johnson',
      password: 'thecrock587',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAfter = await usersInDb();
    expect(usersAfter).toHaveLength(usersBefore.length + 1);
  });

  test('creation fails with proper statuscode and message if username is taken', async () => {
    const usersBefore = await usersInDb();

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'laksdjflk',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('username must be unique');
    // const usersAfter = await usersInDb();
    expect(await usersInDb()).toEqual(usersBefore);
  });

  test('we are able to retrieve the user(s) from the handle /', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
