const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'university.db'), (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
});

const courses = [
  ['CS101', 'Intro Programming', 3, 'Learn Python basics', 'Fall 2024'],
  ['BIO120', 'General Biology', 3, 'Introduction to biological principles', 'Fall 2024'],
  ['MATH150', 'Calculus I', 4, 'Basic calculus', 'Fall 2024'],
  ['ENG101', 'Composition I', 3, 'Academic writing and critical thinking', 'Spring 2025'],
  ['ME210', 'Thermodynamics', 3, 'Principles of thermodynamics and heat transfer', 'Spring 2025'],
  ['CS301', 'Database Systems', 3, 'Design and implementation of database systems', 'Fall 2024'],
  ['PHYS201', 'Physics II', 4, 'Electricity, magnetism, and modern physics', 'Spring 2025'],
  ['CS201', 'Data Structures', 4, 'Study of fundamental data structures and algorithms', 'Spring 2025']
];

db.serialize(() => {
  const stmt = db.prepare(
    'INSERT INTO courses (courseCode, title, credits, description, semester) VALUES (?, ?, ?, ?, ?)'
  );
  courses.forEach((c) =>
    stmt.run(c, (err) => {
      if (err) console.error('Error inserting course:', err.message);
    })
  );
  stmt.finalize(() => console.log('Values successfully added to the courses table.'));
});

db.close((err) => {
  if (err) console.error('Error closing database:', err.message);
});
