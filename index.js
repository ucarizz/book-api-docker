require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const Book = require('./book');
const { bookSchema } = require('./validation/book');
const helmet        = require('helmet');
const cors          = require('cors');
const rateLimit     = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// ② SECURITY MIDDLEWARES
app.use(helmet());                   // sets safe HTTP headers
app.use(cors());                     // enable CORS for all origins
app.use(express.json());             // parse JSON bodies

// ③ RATE LIMITING
const limiter = rateLimit({
  windowMs:   parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10),  // e.g. 60000
  max:        parseInt(process.env.RATE_LIMIT_MAX, 10),        // e.g. 100
  standardHeaders: true,
  legacyHeaders:    false
});
app.use(limiter);

app.use(express.json());

// --- MongoDB Connection ---
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// --- CRUD Routes using Mongoose ---
// CREATE
app.post('/books', async (req, res, next) => {

    // 1️⃣ validate
    const { error, value } = bookSchema.validate(req.body, { abortEarly: false });
    if (error) {
        // collect all messages
        const msgs = error.details.map(d => d.message);
        return res.status(400).json({ error: msgs.join(', ') });
    }

    try {
        const { title, author } = req.body;
        if (!title || !author) {
            return res.status(400).json({ error: 'Both title and author are required.' });
        }
        const newBook = await Book.create({ title, author });
        res.status(201).json(newBook);
    } catch (err) {
        next(err);
    }
});

// READ all
app.get('/books', async (req, res, next) => {
    const { error, value } = bookSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const msgs = error.details.map(d => d.message);
        return res.status(400).json({ error: msgs.join(', ') });
    }

    try {
        const books = await Book.find().sort('-createdAt');
        res.json(books);
    } catch (err) {
        next(err);
    }
});

// READ one
app.get('/books/:id', async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ error: 'Book not found.' });
        res.json(book);
    } catch (err) {
        next(err);
    }
});

// UPDATE
app.put('/books/:id', async (req, res, next) => {
    try {
        const { title, author } = req.body;
        const updated = await Book.findByIdAndUpdate(
            req.params.id,
            { title, author },
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ error: 'Book not found.' });
        res.json(updated);
    } catch (err) {
        next(err);
    }
});

// DELETE
app.delete('/books/:id', async (req, res, next) => {
    try {
        const deleted = await Book.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Book not found.' });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

app.use((err, req, res, next) => {
    console.error(err);
    // handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ error: messages.join(', ') });
    }
    // handle bad ObjectId errors from Mongoose
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    // fallback
    res.status(500).json({ error: 'Something went wrong' });
});


app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});



module.exports = app;
if (require.main === module) {
    app.listen(PORT, () => console.log('...'));
}
