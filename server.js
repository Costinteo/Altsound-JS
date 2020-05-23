let trupe = [
    "Korn",
    "Slipknot",
    "Linkin Park",
    "Papa Roach",
    "Limp Bizkit",
    "System of a Down",
    "Deftones",
    "Static X",
    "P.O.D.",
    "Mudvayne",
    "Disturbed",
    "Coal Chamber",
    "Sevendust",
    "Ill Nino",
    "Godsmack",
    "Stained",
    "Adema",
    "Mushroomhead",
    "Drowning Pool",
    "Soulfly",
    "Rage Against the Machine",
    "Issues",
    "Fear Factory",
    "Saliva",
    "From Ashes to New",
    "Incubus",
    "Taproot",
    "Evanescence",
    "Dope",
    "Alien Ant Farm",
    "Motograter",
    "Machine Head",
    "Trapt",
    "Otep",
    "Spineshank",
    "Cold",
    "Seether",
    "Three Days Grace",
    "Of Men & Mice",
    "Hollywood Undead",
]


let commlist = []

function generateCaptcha(length) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const mysql      = require('mysql');
const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'dbsite'
});
const express = require('express')
const session = require('express-session')
const app = express()
const bodyparser = require('body-parser')
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }));
app.set("view engine", "ejs")
app.use(express.static("files"))
app.use(session({
    secret: 'whisper',
    resave: false,
    saveUninitialized: true
}))

connection.connect();

app.use(function (req, res, next) {
    if (req.session.user){
        console.log("Logged in")
    }
    else console.log("Not logged in")
    res.locals = {
        user : req.session.user
    };
    next();
});

app.get('/', function (req, res) {
    res.render("index")
})

app.get('/about', function (req, res) {
    res.render("about")
})

app.get('/contact', function (req, res) {
    res.render("contact")
})

app.get('/dgd', function (req, res) {
    res.render("band")
})

app.get('/register', function (req, res) {
    res.render("register")
})

app.post('/register', function (req, res) {
    if (req.session.captcha !== req.body.captcha) {
        return res.render("register", {
            message : "Incorrect Captcha"
        })
    }
    let re = new RegExp('^[a-zA-Z0-9_]+$');
    if (!re.test(req.body.username)) {
        return res.render("register", {
            message : "Username forbidden"
        })
    }
    res.render("index")
    connection.query('INSERT INTO users SET ?', {
        email : req.body.email,
        username : req.body.username,
        password : req.body.password,
        gender : req.body.gender,
        newsletter : req.body.newsletter,
        fav_genre : req.body.fav_genre
    }, function(error, res){
        if (error) throw error;
        console.log("am bagat in baza");
    })

})

app.get('/login', function (req, res) {
    res.render("login")
})

app.post('/login', function (req, res) {
    connection.query('SELECT * FROM users WHERE email = ?', [req.body.email], function(error, result){
        if (error) throw error;
        if (result.length === 0) {
            res.render("login", {
                message : "User not found"
            })
        }
        else if (result[0].password === req.body.password) {
            req.session.user = result[0];
            res.redirect("/");
        }
        else {
            res.render("login", {
                message : "Wrong password!"
            })

        }
    });
})

app.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect("/");

})

app.get('/api/bandget', function(req, res) {
    let trupa = trupe[Math.floor(Math.random() * trupe.length)];
    res.json({
        trupa : trupa
    })
})

app.post('/api/createComment', function(req, res) {
    const data = req.body
    commlist.push({
        user : req.session.user.username,
        text : data.comment
    })
    res.send(commlist)
})

app.get('/api/getComments', function(req, res) {
    res.send(commlist)
})

app.get('/api/captcha/generate', function(req, res) {
    let captcha = generateCaptcha(5);
    req.session.captcha = captcha;
    res.json({
        captcha : captcha.split('')
    });
})

app.post('/api/captcha', function(req, res) {
    if (req.body.captcha === req.session.captcha) {
        req.session.captcha = null;
        res.status(200).end();
    }
    else res.status(400).end();
})

app.get('*', function(req, res) {
    res.status(404).render('404')

})

app.listen(3000)