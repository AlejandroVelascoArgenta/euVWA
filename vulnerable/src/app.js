const express=require('express');const path=require('path');const bodyParser=require('body-parser');const cookieParser=require('cookie-parser');const session=require('express-session');const {init}=require('./db');
const app=express();init();
app.set('view engine','ejs');app.set('views',path.join(__dirname,'..','views'));
app.use(bodyParser.urlencoded({extended:true}));app.use(bodyParser.json());app.use(cookieParser());
app.use(session({secret:'dev-secret',resave:false,saveUninitialized:true,cookie:{httpOnly:false,secure:false}}));
app.use('/uploads',express.static(path.join(__dirname,'..','public','uploads')));
app.use('/',require('./routes'));
app.use((err,req,res,next)=>{res.status(500).send(`<h1>Error</h1><pre>${err.stack}</pre>`)});
if(require.main===module){app.listen(3000,()=>console.log('euVWA vulnerable on http://localhost:3000'))}module.exports=app;
