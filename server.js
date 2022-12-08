import minimist from 'minimist';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import Database from 'better-sqlite3';
import {fileURLToPath} from 'url';
import { url } from 'inspector';

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

const args = minimist(process.argv.slice(2));
const port = args.port || 2000;

const thisFile = fileURLToPath(import.meta.url);
const thisDirectory = path.dirname(thisFile);
// gets the directory .../a99-Group-16

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// sets the view engine. This is the most popular of the 3 most commonly used ones
app.set('view engine', 'ejs');
app.set('views', path.join(thisDirectory, 'views'));

app.get('/', function(req, res) {
    if(req.app.get("user")) {
        res.redirect('/settings');
    } else {
        res.redirect('/login');
    }
});

app.get('/login', function(req, res) {
    if(req.app.get("user")) {
        res.redirect('/settings');
    } else {
        res.render('login');
    }
});

app.get('/register', function(req, res) {
    if(req.app.get("user")) {
        res.redirect('/settings');
    } else {
        res.render('register');
    }
});

app.post('/login', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    const rn = new Date(Date.now());

    const sqlLoginLog = `INSERT INTO logs (username, time, message) VALUES ('${username}', '${rn.toISOString()}', 'attempted to login');`;
    db.exec(sqlLoginLog);

    const sqlUserCheck = db.prepare(`SELECT * FROM users where username='${username}' and password='${password}' and email='${email}';`);
    let row = sqlUserCheck.get();
    if(row === undefined) {
        const sqlLogStalelogin = `INSERT INTO logs (username, time, message) VALUES ('${username}', '${rn.toISOString()}', 'stale login');`;
        db.exec(sqlLogStalelogin)
        res.redirect('/stalelogin');
    } else {
        req.app.set('user', username);
        req.app.set('password', password);
        req.app.set('email', email);
        const sqlLogGoodLogin = `INSERT INTO logs (username, time, message) VALUES ('${username}', '${rn.toISOString()}', 'successful login');`;
        db.exec(sqlLogGoodLogin);
        res.redirect('/settings');
    }
});

app.get('/stalelogin', function(req, res){
    res.render('stalelogin');
});

app.post('/register', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    const rn = new Date(Date.now());
    const sqlRegisterAttemptLog = `INSERT INTO logs (username, time, message) VALUES ('${username}', '${rn.toISOString()}', 'tried to create new user');`;
    db.exec(sqlRegisterAttemptLog)

    const sqlGetUsers = db.prepare(`SELECT * FROM users WHERE username='${username}'`);
    let row = sqlGetUsers.get();

    if (row === undefined && username.length >= 4) {
        const sqlInsertUser = `INSERT INTO users (username, password, email) VALUES ('${username}', '${password}', '${email}');`;
        db.exec(sqlInsertUser)

        const sqlGoodRegister = `INSERT INTO logs (username, time, message) VALUES ('${username}', '${rn.toISOString()}', 'registration successful');`;
        db.exec(sqlGoodRegister)
        req.app.set('user', username);
        req.app.set('pass', password);
        req.app.set('email', email);
        res.redirect('/settings');
    } else {
        const sqlBadRegister = `INSERT INTO logs (username, time, message) VALUES ('${username}', '${rn.toISOString()}', 'registration unsuccessful');`;
        db.exec(sqlBadRegister)
        res.render('unsuccessfulregister');
    }
});

app.get('/settings', function(req, res){
    if(req.app.get("user")) {
        const rn = new Date(Date.now());
        let user = req.app.get('user');
        const sqlWentToSettings = `INSERT INTO logs (username, message, time) VALUES ('${user}', '${rn.toISOString()}', 'went to settings');`;
        db.exec(sqlWentToSettings);
        res.render('settings', {user: req.app.get('user'), email: req.app.get('email')});
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', function(req, res) {
    let user = req.app.get('user');
    const rn = new Date(Date.now());
    if(user) {
        const sqlLoggedOut = `INSERT INTO logs (username, message, time) VALUES ('${user}', '${rn.toISOString()}', 'successfully logged out');`;
        db.exec(sqlLoggedOut);
        req.app.set('user', null);
        req.app.set('pass', null);
        req.app.set('email', null);
        res.redirect('/login');
    } else {
        res.redirect('/login');
    }
});

app.get('/delete', function(req, res) {
    let user = req.app.get('user');
    let password = req.app.get('pass');
    const rn = new Date(Date.now());
    if(user) {
        const sqlDeletedMessage = `INSERT INTO logs (username, time, message) VALUES ('${user}', '${rn.toISOString()}', 'successfully deleted account');`;
        db.exec(sqlDeletedMessage);

        const sqlDelete = `DELETE FROM users WHERE username='${user}';`
        db.exec(sqlDelete);

        req.app.set('user', null);
        req.app.set('pass', null);
        req.app.set('email', null);
        res.redirect('/login');
    } else {
        res.redirect('/login');
    }
});

app.listen(port);