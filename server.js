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
const WebSocket = require('ws');
const FileStore = require('session-file-store')(session);
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }));
app.set("view engine", "ejs")
app.use(express.static("files"))

let sessionParser = session({
    secret: 'whisper',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
})

app.use(sessionParser)

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

app.get('/chat', function (req, res) {
    res.render("chat");
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

app.get('/api/getuser', function(req, res) {
    res.json({
        username : req.session.user.username
    })
})


app.get('*', function(req, res) {
    res.status(404).render('404')

})

const http = require('http');
const server = http.createServer(app);
const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

server.on('upgrade', function (request, socket, head) {
    console.log('Parsing session from request...');

    sessionParser(request, {}, () => {
        if (!request.session.user) {
            console.log("nu suntem logati");
            socket.destroy();
            return;
        }

        console.log('Session is parsed!');

        wss.handleUpgrade(request, socket, head, function (ws) {
            wss.emit('connection', ws, request);
        });
    });
});

let users = [];

function sendusers() {
    for (let u of users) {
        u.socket.send(JSON.stringify({
                action: 'getusers',
                users: users.map(user => user.username)
            }
        ))
    }
}

wss.on('connection', function(client, req) {

    users.push({
        socket: client,
        username: req.session.user.username,
        color: '#000000'
    });

    sendusers();

    for (let u of users) {
        u.socket.send(JSON.stringify({
            action: 'send',
            username: "ALTSOUND",
            text: "Bun venit, " + req.session.user.username
        }))
    }

    client.on('message', function(message) {
        message = JSON.parse(message);
        console.log('received: %s', message);
        let user = users.find(user => user.socket === client);
        if (message.action === "changecolor") {
            user.color = message.color;
            for (let u of users) {
                u.socket.send(JSON.stringify({
                    action : "changecolor",
                    username : req.session.user.username,
                    color : user.color
                }))
            }
            console.log('utilizator vrea s aschimbe culaorea la ' + message.color);
        } else if (message.action === 'send') {
            for (let u of users) {
                u.socket.send(JSON.stringify({
                    action : 'send',
                    username : req.session.user.username,
                    text : message.text,
                    color : user.color
                }))
            }
        } else {
            console.error("nu e bn");
            console.log("ce e asta???A?DFASfASf " + message.action);
        }
    });



    client.on('close', function(code, reason) {
        console.log(`connection closed code: ${code} reason ${reason}`);
        users = users.filter(user => user.socket !== client);
        for (let u of users) {
            u.socket.send(JSON.stringify({
                action: 'send',
                username: "ALTSOUND",
                text: "La revedere, " + req.session.user.username
            }))
        }
        sendusers();
    });


});

wss.on('error', function(err) {
    console.log(err);
})

server.listen(3000, function () {
    console.log('Listening on http://localhost:8080/)');
});

// nodemon server.js --ignore sessions/