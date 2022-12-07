import minimist from 'minimist';
import express from 'express';
import path from 'path';
import Database from 'better-sqlite3';
import {fileURLToPath} from 'url';

const db = new Database('main.db');

const sqlUserTable = `CREATE TABLE users ( id INTEGER PRIMARY KEY AUTOINCREMENT, username, password, email)`;
try {
    db.exec(sqlUserTable);
} catch (e) {
}

const sqlLogTable = `CREATE TABLE logs ( id INTEGER PRIMARY KEY AUTOINCREMENT, username, time, message)`;
try {
    db.exec(sqlLogTable);
} catch(e) {
}

const sqlFoodTable = `CREATE TABLE foodlogs ( id INTEGER PRIMARY KEY AUTOINCREMENT, username, food, ingredients, note)`;
try {
    db.exec(sqlFoodTable);
} catch(e) {
}

const args = minimist(process.argv.slice(2));
const port = args.port || 2000;

const thisFile = fileURLToPath(import.meta.url);
const thisDirectory = path.dirname(thisFile);
// gets the directory .../a99-Group-16

const app = express();

// sets the view engine. This is the most popular of the 3 most commonly used ones
app.set('view engine', 'ejs');
app.set('views', path.join(thisDirectory, 'views'));

app.get('/login', function(req, res) {
    res.render('login');
});

app.get('/register', function(req, res) {
    res.render('register');
});

app.post('/login', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    const rn = new Date(Date.now());

    const sqlAddUserLog = `INSERT INTO logs (username, time, message) VALUES ('${username}', 'attempted to login', '${rn.toISOString()}');`;
    try {
        db.exec(sqlAddUserLog);
    } catch(e) {
        console.log(e);
    }

    const sqlUserCheck = db.prepare(`SELECT * FROM users where username='${username}' and password='${password}';`);
    let row = sqlUserCheck.get();
    if(row === undefined) {
        req.app.set('user', username);
        req.app.set('password', password);
        const sqlLogStalelogin = `INSERT INTO logs (username, time, message) VALUES ('${username}', 'stale login', '${rn.toISOString()}');`;
        db.exec(sqlLogStalelogin)
        res.redirect('/stalelogin');
    } else {
        req.app.set('user', username);
        req.app.set('password', password);
        const sqlLogGoodLogin = `INSERT INTO logs (username, time, message) VALUES ('${username}', 'stale login', '${rn.toISOString()}');`;
        db.exec(sqlLogGoodLogin);
        res.redirect('/settings');
    }
});

app.get('/stalelogin', function(req, res){
    let user = req.app.get('user')
    res.render('stalelogin');
});

app.post('/register', function(req, res) {
    console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    console.log(username);

    const rn = new Date(Date.now());
    const sqlRegisterAttemptLog = `INSERT INTO logs (user, time, message) VALUES ('${username}', 'tried to create new user', '${rn.toISOString()}');`;
    db.exec(sqlRegisterAttemptLog)

    const sqlGetUsers = db.prepare(`SELECT * FROM users WHERE user='${username}'`);
    let row = sqlGetUsers.get();

    if (row === undefined) {
        const sqlInsertUser = `INSERT INTO users (username, password, email) VALUES ('${username}', '${password}', '${email}');`;
        db.exec(sqlInsertUser)

        const sqlGoodRegister = `INSERT INTO logs (user, time, message) VALUES ('${username}', 'register successful', '${rn.toISOString()}');`;
        db.exec(sqlGoodRegister)
        res.render('settings');
    } else {
        const sqlBadRegister = `INSERT INTO logs (user, time, message) VALUES ('${username}', 'username taken', '${rn.toISOString()}');`;
        db.exec(sqlBadRegister)
        res.render('usernametaken');
    }
});

app.listen(port);