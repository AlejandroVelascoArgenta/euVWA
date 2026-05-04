const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'data', 'euvwa.db');
const db = new sqlite3.Database(dbPath);
async function init(){
 db.serialize(()=>{
  db.run(`CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password_hash TEXT, email TEXT, role TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS comments(id INTEGER PRIMARY KEY AUTOINCREMENT, author TEXT, message TEXT, created_at TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS files(id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT, originalname TEXT, owner_id INTEGER)`);
  db.get(`SELECT COUNT(*) as n FROM users`, async (e,r)=>{ if(!r || r.n===0){
   const adminHash = await bcrypt.hash('ChangeMe_Admin_123!', 12);
   const aliceHash = await bcrypt.hash('ChangeMe_Alice_123!', 12);
   db.run(`INSERT INTO users(username,password_hash,email,role) VALUES(?,?,?,?)`, ['admin', adminHash, 'admin@euvwa.local', 'admin']);
   db.run(`INSERT INTO users(username,password_hash,email,role) VALUES(?,?,?,?)`, ['alice', aliceHash, 'alice@euvwa.local', 'user']);
   db.run(`INSERT INTO comments(author,message,created_at) VALUES(?,?,datetime('now'))`, ['admin','Welcome to euVWA secure comments']);
  }});
 });
}
module.exports={db,init};
