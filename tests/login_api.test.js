const supertest = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/user');
const {
  initialUsers,
} = require('./test_helper');

const api = supertest(app);

beforeAll(async () => {
  await User.deleteMany();
  await api
    .post('/api/users')
    .send(initialUsers[0])
    .expect(201)
    .expect('Content-Type', /application\/json/);
});

describe('when there is an existing user', () => {
  const { username, password } = initialUsers[0];

  test('a valid login token is received from submitting valid login data', async () => {
    const response = await api
      .post('/api/login')
      .send({ username, password })
      .expect(200)
      .expect('Content-Type', /application\/json/);
    const { token } = response.body;

    expect(jwt.verify(token, process.env.SECRET)).toBeTruthy();
    expect(response.body).toHaveProperty('name', initialUsers[0].name);
    expect(response.body).toHaveProperty('username', initialUsers[0].username);
    expect(response.body).toHaveProperty('token');
  });

  test('an error 401 is returned when invalid data is submitted', async () => {
    await api
      .post('/api/login')
      .send({
        username: '123',
        password: 'hi',
      })
      .expect(401)
      .expect('Content-Type', /application\/json/);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
