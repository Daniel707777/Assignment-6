const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const db = new sqlite3.Database(path.join(__dirname, 'database', 'university.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

const FIELDS = ['courseCode', 'title', 'credits', 'description', 'semester'];
const REQUIRED = ['courseCode', 'title', 'credits'];

function validate(body, requireAll) {
  if (requireAll) {
    const missing = REQUIRED.filter((f) => body[f] === undefined || body[f] === '');
    if (missing.length) return `Missing required field(s): ${missing.join(', ')}`;
  }
  if (body.credits !== undefined && (!Number.isInteger(body.credits) || body.credits <= 0)) {
    return 'credits must be a positive integer';
  }
  return null;
}

function dbError(res, err) {
  console.error(err);
  return res.status(500).json({ error: 'Database error' });
}

// GET all courses
app.get('/api/courses', (req, res) => {
  db.all('SELECT * FROM courses', [], (err, rows) => {
    if (err) return dbError(res, err);
    res.json(rows);
  });
});

// GET course by ID
app.get('/api/courses/:id', (req, res) => {
  db.get('SELECT * FROM courses WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return dbError(res, err);
    if (!row) return res.status(404).json({ error: 'Course not found' });
    res.json(row);
  });
});

// POST new course
app.post('/api/courses', (req, res) => {
  const body = req.body || {};
  const problem = validate(body, true);
  if (problem) return res.status(400).json({ error: problem });

  db.run(
    'INSERT INTO courses (courseCode, title, credits, description, semester) VALUES (?, ?, ?, ?, ?)',
    FIELDS.map((f) => body[f] ?? null),
    function (err) {
      if (err) return dbError(res, err);
      db.get('SELECT * FROM courses WHERE id = ?', [this.lastID], (e, row) => {
        if (e) return dbError(res, e);
        res.status(201).json(row);
      });
    }
  );
});

// PUT update course
app.put('/api/courses/:id', (req, res) => {
  const body = req.body || {};
  const problem = validate(body, false);
  if (problem) return res.status(400).json({ error: problem });

  const updates = FIELDS.filter((f) => body[f] !== undefined);
  if (!updates.length) return res.status(400).json({ error: 'No valid fields to update' });

  const sql = `UPDATE courses SET ${updates.map((f) => `${f} = ?`).join(', ')} WHERE id = ?`;
  db.run(sql, [...updates.map((f) => body[f]), req.params.id], function (err) {
    if (err) return dbError(res, err);
    if (this.changes === 0) return res.status(404).json({ error: 'Course not found' });
    db.get('SELECT * FROM courses WHERE id = ?', [req.params.id], (e, row) => {
      if (e) return dbError(res, e);
      res.json(row);
    });
  });
});

// DELETE course
app.delete('/api/courses/:id', (req, res) => {
  db.run('DELETE FROM courses WHERE id = ?', [req.params.id], function (err) {
    if (err) return dbError(res, err);
    if (this.changes === 0) return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course deleted', id: Number(req.params.id) });
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
