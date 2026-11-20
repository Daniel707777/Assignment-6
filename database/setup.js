const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'university.db'), (err) => {
  if (err) {
    console.error('Error creating database:', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS courses');

  db.run(
    `CREATE TABLE courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseCode TEXT NOT NULL,
      title TEXT NOT NULL,
      credits INTEGER NOT NULL,
      description TEXT,
      semester TEXT
    )`,
    (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Database university.db and courses table created successfully.');
      }
    }
  );
});

db.close((err) => {
  if (err) console.error('Error closing database:', err.message);
});
