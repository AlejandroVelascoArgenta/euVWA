const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'data', 'euvwa.db');
const db = new sqlite3.Database(dbPath);
function init(){
 db.serialize(()=>{
  db.run(`CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, email TEXT, role TEXT, token TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS comments(id INTEGER PRIMARY KEY AUTOINCREMENT, author TEXT, message TEXT, created_at TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS files(id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT, originalname TEXT, owner TEXT)`);
  db.get(`SELECT COUNT(*) as n FROM users`, (e,r)=>{ if(!r || r.n===0){
   db.run(`INSERT INTO users(username,password,email,role,token) VALUES('admin','password','admin@euvwa.local','admin','admintoken123')`);
   db.run(`INSERT INTO users(username,password,email,role,token) VALUES('alice','alice123','alice@euvwa.local','user','alicetoken123')`);
   db.run(`INSERT INTO comments(author,message,created_at) VALUES('admin','Welcome to euVWA vulnerable comments',datetime('now'))`);
  }});
 });
}
module.exports={db,init};
