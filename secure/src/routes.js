const express=require('express');const router=express.Router();const {db}=require('./db');const {execFile}=require('child_process');const multer=require('multer');const path=require('path');const fs=require('fs');const bcrypt=require('bcrypt');const validator=require('validator');const jwt=require('jsonwebtoken');
function auth(req,res,next){ if(req.session.user) return next(); res.redirect('/login'); }
function adminOnly(req,res,next){ if(req.session.user?.role==='admin') return next(); res.status(403).send('Forbidden'); }
const uploadDir=path.join(__dirname,'..','public','uploads');
const storage=multer.diskStorage({destination:uploadDir,filename:(req,file,cb)=>cb(null,Date.now()+'-'+file.originalname.replace(/[^a-zA-Z0-9._-]/g,''))});
const upload=multer({storage,limits:{fileSize:1024*1024},fileFilter:(req,file,cb)=>{const ok=['image/png','image/jpeg','text/plain','application/pdf'].includes(file.mimetype);cb(ok?null:new Error('File type not allowed'),ok);}});
router.get('/',(req,res)=>res.render('index',{user:req.session.user,mode:'SECURE'}));
router.get('/login',(req,res)=>res.render('login',{error:null,mode:'SECURE'}));
router.post('/login',(req,res)=>{const {username,password}=req.body; db.get('SELECT * FROM users WHERE username=?',[username],async(e,user)=>{ if(user && await bcrypt.compare(password,user.password_hash)){req.session.regenerate(()=>{req.session.user={id:user.id,username:user.username,role:user.role};res.redirect('/dashboard')})} else res.render('login',{error:'Invalid credentials',mode:'SECURE'})});});
router.get('/dashboard',auth,(req,res)=>res.render('dashboard',{user:req.session.user,mode:'SECURE',token:jwt.sign({sub:req.session.user.id,role:req.session.user.role},process.env.JWT_SECRET||'dev-jwt',{expiresIn:'15m'})}));
router.get('/search',(req,res)=>{const q=(req.query.q||'').slice(0,50); db.all('SELECT id,username,email,role FROM users WHERE username LIKE ?',[`%${q}%`],(e,rows)=>res.render('search',{q,rows:rows||[],mode:'SECURE'}));});
router.get('/xss-reflected',(req,res)=>res.render('xss-reflected',{name:validator.escape(req.query.name||''),mode:'SECURE'}));
router.get('/comments',(req,res)=>{db.all('SELECT * FROM comments ORDER BY id DESC',(e,rows)=>res.render('comments',{rows:rows||[],mode:'SECURE'}));});
router.post('/comments',auth,(req,res)=>{db.run('INSERT INTO comments(author,message,created_at) VALUES(?,?,datetime(\'now\'))',[req.session.user.username,validator.escape(req.body.message||'')],()=>res.redirect('/comments'));});
router.get('/ping',auth,(req,res)=>res.render('ping',{result:null,mode:'SECURE'}));
router.post('/ping',auth,(req,res)=>{const host=req.body.host||''; if(!/^[a-zA-Z0-9.-]{1,253}$/.test(host)) return res.render('ping',{result:'Invalid host',mode:'SECURE'}); execFile('ping',['-c','2',host],{timeout:4000},(err,stdout,stderr)=>res.render('ping',{result:(stdout+stderr).slice(0,4000),mode:'SECURE'}));});
router.get('/upload',auth,(req,res)=>res.render('upload',{files:fs.readdirSync(uploadDir),mode:'SECURE'}));
router.post('/upload',auth,upload.single('file'),(req,res)=>{db.run('INSERT INTO files(filename,originalname,owner_id) VALUES(?,?,?)',[req.file.filename,req.file.originalname,req.session.user.id]);res.redirect('/upload')});
router.get('/download',auth,(req,res)=>{const requested=path.basename(req.query.file||'');const full=path.join(uploadDir,requested);if(!full.startsWith(uploadDir)||!fs.existsSync(full))return res.status(404).send('Not found');res.download(full);});
router.get('/api/users',auth,adminOnly,(req,res)=>db.all('SELECT id,username,email,role FROM users',(e,rows)=>res.json(rows)));
router.get('/admin',auth,adminOnly,(req,res)=>res.send('Admin panel: authenticated and authorized'));
router.get('/logout',(req,res)=>req.session.destroy(()=>res.redirect('/')));
module.exports=router;
