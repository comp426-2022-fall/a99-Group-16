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

app.post('/login', function(req, res) {

});