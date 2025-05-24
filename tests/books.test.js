const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // your Express app export
const Book = require('../book');

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/myLibrary', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {

  await mongoose.disconnect();
});

describe('POST /books', () => {
 

  it('creates a new book when payload is valid', async () => {
    const payload = { title: '1984', author: 'Orwell' };
    const res = await request(app)
      .post('/books')
      .send(payload)
      .set('Accept', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(payload);
    expect(res.body).toHaveProperty('_id');
  });

  it('returns 400 if title is missing', async () => {
    const res = await request(app)
      .post('/books')
      .send({ author: 'Unknown' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
