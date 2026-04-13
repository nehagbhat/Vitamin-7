// LIBRARIES
const express = require('express');
const app = express();
const mysql = require('mysql2');
const mongoose = require('mongoose');

// ============ SQL CONNECTION ============
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'SageCanyon1947!', // set this to your MySQL password
    database: 'company_db', // use the database where your employees table lives
});

// MySQL Connection Verification
function verifyMySQLConnection() {
    connection.connect(function (err) {
        if (err) {
            console.error('Error connecting to MySQL: ' + err.stack);
            return;
        }
        console.log('MySQL connected as id ' + connection.threadId);
    });
}

// ============ MONGODB CONNECTION ============
mongoose.connect('mongodb://127.0.0.1:27017/companyDB');

const ProjectSchema = new mongoose.Schema({
    name: String,
    budget: Number,
});

const ProjectModel = mongoose.model('Project', ProjectSchema);

// MongoDB Connection Verification
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// ============ ENDPOINTS ============
app.use(express.json());

// ------ MONGODB ENDPOINTS ------

app.get('/projects', async (req, res) => {
    try {
        const projects = await ProjectModel.find({});
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/projects', async (req, res) => {
    try {
        const project = new ProjectModel(req.body);
        const saved = await project.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/projects/:id', async (req, res) => {
    try {
        await ProjectModel.findByIdAndDelete(req.params.id);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------ MYSQL ENDPOINTS ------

app.get('/employees', function (req, res) {
    connection.query('SELECT * FROM employees', function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.post('/employees', function (req, res) {
    const { name, position, salary } = req.body;
    connection.query(
        'INSERT INTO employees (name, position, salary) VALUES (?, ?, ?)',
        [name, position, salary],
        function (err, results) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: results.insertId });
        }
    );
});

app.delete('/employees/:id', function (req, res) {
    connection.query(
        'DELETE FROM employees WHERE id = ?',
        [req.params.id],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            res.sendStatus(200);
        }
    );
});

// ============ START SERVER ============
app.listen(3000, function () {
    console.log('Server is running on http://localhost:3000');
    verifyMySQLConnection();
});
