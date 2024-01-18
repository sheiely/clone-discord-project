//Loading modules
const express = require('express');
const handlebars = require('express-handlebars');
const bodypParser = require('body-parser');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 80;

//Configs
    //Bodyparser
        app.use(bodypParser.urlencoded({extended:true}));
        app.use(bodypParser.json());
    //Handlebars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main',}));
        app.set('view engine', 'handlebars');
    //Path
        app.use(express.static(path.join(__dirname, 'public')));

//Routes
    app.get('/', (req, res)=>{
        res.send("nice");
    });
    app.get('/register', (req, res)=>{
        res.render("user/register", {layout: 'mainweb'});
    });
    app.get('/login', (req, res)=>{
        res.render("user/login", {layout: 'mainweb'});
    });
    app.get('/app', (req, res)=>{
        res.render("app/app");
    });
    app.get('/channels/:idFriend', (req, res)=>{
        res.render("app/chat", {idFriend: req.params.idFriend});
    });

// app.get('/post/:slug', (req, res)=>{
//     Post.findOne({slug: req.params.slug}).lean().populate('category').then((post)=>{
//         if(post){
//             res.render("post/index", {post: post});
//         }else{
//             req.flash("error_msg", "This post doesn't exist");
//             res.redirect("/")
//         }
        
//     }).catch((err)=>{
//         req.flash("error_msg", "An internal error occurred");
//         res.redirect("/404");
//     });
// });


app.listen(PORT,()=>{
    console.log('Server running in port '+ PORT);
});


