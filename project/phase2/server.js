const express = require('express');
const cookieParser = require("cookie-parser");
const session = require('express-session');

const USER_ARRAY = require('./mock-db/users.json');
const PRODUCT_ARRAY = require('./mock-db/balloonatic-products.json');
const QOUTES_ARRAY = require('./mock-db/balloonatic-qoutes.json');
const app = express();
const port = 9090;

const fs = require('fs');
const fileName = './mock-db/users.json';
const userdb = require(fileName);


const {body, validationResult } = require('express-validator')

body('fname', 'Empty firstname').trim().isLength({ min: 1 }).escape()
body('username', 'Empty username').trim().isLength({ min: 1 }).escape()
body('email', 'Empty email').trim().isLength({ min: 1 }).escape()
body('password', 'Empty password').trim().isLength({ min: 1 }).escape()
body('cpass', 'Empty Confirm password').trim().isLength({ min: 1 }).escape()

const Users = USER_ARRAY.users

const oneDay = 1000 * 60 * 60 * 24;

app.use(session({
    secret: "thisismysecretkeydklgjasdflgfgikflfhdisghisdfsghldf",
    saveUninitialized: true,
    cookie: {maxAge: oneDay},
    resave: false
}));

// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//serving public file
app.use(express.static(__dirname));

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
var productlist = PRODUCT_ARRAY.products;


function AddNewUser(addtodb, fileName){
    try{
        fs.writeFile(fileName, JSON.stringify(addtodb), function writeJSON(err) {
        if (err) return console.log(err);
        console.log(JSON.stringify(addtodb));
        console.log('writing to ' + fileName);
        });
        return true;
    } catch(e) {
        return false;
    }
}


app.get('/login', (req, res) => {
    res.render('pages/usermodal', {
        action: "login"
    });
})
app.post('/loginfunction', (req, res, next) => {
    const errors = validationResult(req);
    usernames = req.body.username;
    passwords = req.body.password;
    if(!errors.isEmpty()){
        res.render('pages/usermodal', {
            action: "login",
            response: "fix errors"
        });
    } else {
        const result = Users.find(({ username, password }) => username == usernames &&  password == passwords)

        if (result) {
            req.session.user = usernames;
            res.redirect('/');
        }
    }
})

app.get('/register', (req, res) => {
    res.render('pages/usermodal', {
        action: "register"
    });
})
app.post('/registration', (req, res, next) => {
    try{
        const errors = validationResult(req);
        usernames = req.body.username;
        passwords = req.body.password1;
        cpasswords = req.body.password1;
        emails = req.body.email;
        fname = req.body.fname;
        lname = req.body.lname;
        address = req.body.address;
        city = req.body.city;
        state = req.body.state;
        code = req.body.code;
        phone = req.body.phone;
        if(!errors.isEmpty()){
            res.render('pages/usermodal', {
                action: "register",
                response: "fix errors"
            });
        } else {
            // file.key = "new value";
            if( passwords == cpasswords) {
                if (Users) {
                    Users.push({
                        username: req.body.username,
                        email: req.body.email,
                        password: req.body.password,
                        cpasswords : req.body.password1,
                        emails : req.body.email,
                        fname : req.body.fname,
                        lname : req.body.lname,
                        address : req.body.address,
                        city : req.body.city,
                        state : req.body.state,
                        code : req.body.code,
                        phone : req.body.phone
                    })
                } else {
                    Users = [
                        {
                            username: req.body.username,
                            email: req.body.email,
                            password: req.body.password,
                            cpasswords : req.body.password1,
                            emails : req.body.email,
                            fname : req.body.fname,
                            lname : req.body.lname,
                            address : req.body.address,
                            city : req.body.city,
                            state : req.body.state,
                            code : req.body.code,
                            phone : req.body.phone
                        }
                    ]
                }
                            
            addtodb = {
                users: Users
            }

            AddNewUser(addtodb)
            const result = Users.find(({ username, password }) => username == usernames &&  password == passwords)

            if (result) {
                req.session.user = usernames;
                res.redirect('/');
            }
            }else {
                res.render('pages/usermodal', {
                    action: "register",
                    response: "fix errors"
                });
            }

        }
    } catch(e) {
        res.render('pages/general_error');
    }
})


function requireLogin(req, res, next) {
    if (!req.session && !req.session.user) {
        res.redirect('/login');
      } else {
        next();
      }
}


app.get('/', requireLogin, (req, res) => {
    let randomproducts = []
    randomproducts.push(productlist[Math.floor(Math.random()*randomproducts.length)])
    randomproducts.push(productlist[Math.floor(Math.random()*randomproducts.length)])
    randomproducts.push(productlist[Math.floor(Math.random()*randomproducts.length)])
    let qoutes = QOUTES_ARRAY.quotes;
    console.log(qoutes)
    res.render('pages/home', {
        products: randomproducts,
        session: req.session,
        qoutes: qoutes[0]
    });
})

app.get('/products', requireLogin, (req, res) => {
    res.render('pages/products', {
        products: productlist,
        session: req.session
    });
})

app.get('/about', requireLogin, (req, res) => {
    res.render('pages/about', {
        session: req.session
    });
})

app.get('/contacts', requireLogin, (req, res) => {
    res.render('pages/contacts', {
        session: req.session
    });
})

app.get('/getquotes', requireLogin, (req, res) => {
    res.send({"qoute":"Hello"})
})

app.get('/logout', requireLogin, (req, res) => {
    req.session = null;
    res.render('pages/logout', {
        session: req.session,
    });
})

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
    res.render('pages/page_not_found',{
        session: req.session,
    });
  });

app.listen(port, () => {
    console.log(`Phase 2 app is running on http://localhost:${port}`);
})