import minimist from 'minimist';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import Database from 'better-sqlite3';
import {fileURLToPath} from 'url';
import { url } from 'inspector';
import nodemailer from 'nodemailer';

// this function sends an email to the designated email address
function sendEmail(items, to_email) {
    return new Promise((resolve, reject) => {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'santagiftsender426@gmail.com',
                // pleae do not copy this password and use it anywhere else. This project is mainly just to make a santa wishlist
                pass: 'lfbzoxpkkagzrzjy'
                // more passwords can be used but this one is used for now. for better security we need
                // a new file
            }
        });

        const mail_configs = {
            from: 'santagiftsender426@gmail.com',
            to: to_email,
            subject: 'Your child wants a gift from Santa!!',
            text: "Hello! Your child wants a bunch of gifts, and they think we're sending the wish list to Santa.\nIf your kid didn't make the naughty list, get him these gifts:\n\n"+items+"\n\nThank you!\nBest,\nCOMP 426 Group 16"
        }
        transporter.sendMail(mail_configs, function(error, info) {
            if(error) {
                console.log(error);
                return reject({message: "error"});
            }
            return resolve({message: "Email sent"});
        });
    })
}

//do we neeed to change the db name too?
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

const sqlWishListTable = `CREATE TABLE wishlist (username, items)`;
try {
    db.exec(sqlWishListTable);
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
    res.redirect('/app');
});

app.get('/app', function(req, res) {
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

    const sqlLoginLog = `INSERT INTO logs (username, time, message) VALUES ('${username}', '${rn.toUTCString()}', 'attempted to login');`;
    db.exec(sqlLoginLog);

    const sqlUserCheck = db.prepare(`SELECT * FROM users where username='${username}' and password='${password}' and email='${email}';`);
    let row = sqlUserCheck.get();
    if(row === undefined) {
        const sqlLogStalelogin = `INSERT INTO logs (username, time, message) VALUES ('${username}', '${rn.toUTCString()}', 'stale login');`;
        db.exec(sqlLogStalelogin)
        res.redirect('/stalelogin');
    } else {
        req.app.set('user', username);
        req.app.set('password', password);
        req.app.set('email', email);
        const sqlLogGoodLogin = `INSERT INTO logs (username, time, message) VALUES ('${username}', '${rn.toUTCString()}', 'successful login');`;
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

    const sqlRegisterAttemptLog = `INSERT INTO logs (username, time, message) VALUES ('${username}', '${rn.toUTCString()}', 'tried to create new user');`;
    db.exec(sqlRegisterAttemptLog)

    const sqlGetUsers = db.prepare(`SELECT * FROM users WHERE username='${username}'`);
    let row = sqlGetUsers.get();

    if (row === undefined && username.length >= 4) {
        const sqlInsertUser = `INSERT INTO users (username, password, email) VALUES ('${username}', '${password}', '${email}');`;
        db.exec(sqlInsertUser)

        const sqlGoodRegister = `INSERT INTO logs (username, time, message) VALUES ('${username}', '${rn.toUTCString()}', 'registration successful');`;
        db.exec(sqlGoodRegister)
        req.app.set('user', username);
        req.app.set('pass', password);
        req.app.set('email', email);
        res.redirect('/settings');
    } else {
        const sqlBadRegister = `INSERT INTO logs (username, time, message) VALUES ('${username}', '${rn.toUTCString()}', 'registration unsuccessful');`;
        db.exec(sqlBadRegister)
        res.render('unsuccessfulregister');
    }
});

app.get('/settings', function(req, res){
    if(req.app.get("user")) {
        const rn = new Date(Date.now());
        let user = req.app.get('user');
        const sqlWentToSettings = `INSERT INTO logs (username, message, time) VALUES ('${user}', '${rn.toUTCString()}', 'went to settings');`;
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
        const sqlLoggedOut = `INSERT INTO logs (username, message, time) VALUES ('${user}', '${rn.toUTCString()}', 'successfully logged out');`;
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
        const sqlDeletedMessage = `INSERT INTO logs (username, time, message) VALUES ('${user}', '${rn.toUTCString()}', 'successfully deleted account');`;
        db.exec(sqlDeletedMessage);

        const sqlDelete = `DELETE FROM users WHERE username='${user}';`
        db.exec(sqlDelete);

        const a = `DELETE FROM wishlist WHERE username='${user}';`
        db.exec(a);

        req.app.set('user', null);
        req.app.set('pass', null);
        req.app.set('email', null);
        res.redirect('/login');
    } else {
        res.redirect('/login');
    }
});

//do we need to do this?
app.get('/deletelogs', function(req, res) {
    const sqlDeleteLogs = `DELETE FROM logs;`;
    db.exec(sqlDeleteLogs);
    res.redirect('/view_all_logs');
});

app.get('/view_all_logs', function(req, res) {
    const sqlGetLogs = db.prepare(`SELECT * FROM logs;`);
    let data = sqlGetLogs.all();
    res.render('viewlogs', {data: data});
});

app.get('/wishlist', function(req, res) {
    let user = req.app.get('user');
    
    if(user) {
        const sqlGetItemsRow1 = db.prepare(`SELECT * FROM wishlist WHERE username='${user}'`);
        let row = sqlGetItemsRow1.get();
        let items = [];
        if(row === undefined) {
        } else {
            items = row.items.split(",");
        }

        res.render('wishlist', {data: items});
    } else {
        res.redirect('/app');
    }
});

app.post('/additem', function(req, res) {
    let user = req.app.get('user');

    if(user) {
        const sqlGetItemsRow1 = db.prepare(`SELECT * FROM wishlist WHERE username='${user}'`);
        let row = sqlGetItemsRow1.get();

        if(row === undefined || row.items === undefined) {
            const b = `INSERT INTO wishlist (username, items) VALUES ('${user}', '${req.body.itemname}');`;
            db.exec(b);
        } else {
            let items = row.items + "," + req.body.itemname;

            const a = `DELETE FROM wishlist WHERE username='${user}';`
            db.exec(a);

            const b = `INSERT INTO wishlist (username, items) VALUES ('${user}', '${items}');`;
            db.exec(b);
        }

        res.redirect('/wishlist');
    } else {
        res.redirect('/app');
    }
});


app.get('/clearwishlist', function(req, res) {
    let user = req.app.get('user');

    if(user) {
        const a = `DELETE FROM wishlist WHERE username='${user}';`
        db.exec(a);

        res.redirect('/wishlist');
    } else {
        res.redirect('/app');
    }
});

app.get('/sendwishlistform', function(req, res) {
    let user = req.app.get('user');

    if(user) {
        res.render('sendwishlistform');
    } else {
        res.redirect('/app');
    }
});

app.post('/sendwishlist', function(req, res) {
    let user = req.app.get('user');

    if(user) {
        const sqlGetItemsRow1 = db.prepare(`SELECT * FROM wishlist WHERE username='${user}'`);
        let row = sqlGetItemsRow1.get();
        const items = row.items.split(",");

        let itemString = items.join(", ");
        
        sendEmail(itemString, req.body.parentemail);

        res.redirect('/app');
    } else {
        res.redirect('/app');
    }
});

app.listen(port);