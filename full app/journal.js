const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4000;

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage for journal entries
const journalEntries = [];

// Routes
app.get('/', (req, res) => {
    res.render('journal', { entries: journalEntries });
});

app.post('/add-entry', (req, res) => {
    const { title, content } = req.body;

    if (title && content) {
        journalEntries.push({ title, content, date: new Date() });
    }

    res.redirect('/');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
