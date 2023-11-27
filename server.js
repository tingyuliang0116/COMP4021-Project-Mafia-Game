const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {maxAge: 300000}
});
app.use(chatSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const {username, avatar, name, password} = req.body;

    //
    // D. Reading the users.json file
    //
    const user = JSON.parse(fs.readFileSync("data/users.json"));
    //
    // E. Checking for the user data correctness
    //
    if (!username || !avatar || !name || !password) {
        res.json({status: "error", error: "Username/avatar/name/password cannot be empty"});
        return;
    }
    if (!containWordCharsOnly(username)) {
        res.json({status: "error", error: "Username can contains only underscores, letters or numbers"});
        return;
    }
    if (username in user) {
        res.json({status: "error", error: "Username has already been used."});
        return;
    }
    //
    // G. Adding the new user account
    const hash = bcrypt.hashSync(password, 10);
    user[username] = {avatar, name, password: hash}
    //

    //
    // H. Saving the users.json file
    //
    fs.writeFileSync("data/users.json", JSON.stringify(user, null, " "));
    //
    // I. Sending a success response to the browser
    //
    res.json({status: "success"});
    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const {username, password} = req.body;

    //
    // D. Reading the users.json file
    //
    const user = JSON.parse(fs.readFileSync("data/users.json"));
    //
    // E. Checking for username/password
    //
    if (!(username in user)) {
        res.json({status: "error", error: "Username does not exist"});
        return;
    }
    const userdata = user[username];
    if (!bcrypt.compareSync(password, userdata.password)) {
        res.json({status: "error", error: "Incorrect password"});
        return;
    }
    //
    // G. Sending a success response with the user account
    //
    req.session.user = {username, avatar: userdata.avatar, name: userdata.name};
    res.json({status: "success", user: req.session.user});
    // Delete when appropriate
    // res.json({status: "error", error: "This endpoint is not yet implemented."});
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {

    //
    // B. Getting req.session.user
    //
    if (!req.session.user) {
        res.json({status: "error", error: "You have not signed in."});
        return;
    }
    //
    // D. Sending a success response with the user account
    //
    res.json({status: "success", user: req.session.user});
    // Delete when appropriate
    // res.json({status: "error", error: "This endpoint is not yet implemented."});
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    //
    // Deleting req.session.user
    //
    if (req.session.user) {
        delete req.session.user;
    }

    //
    // Sending a success response
    //
    res.json({status: "success"});

    // Delete when appropriate
    //res.json({status: "error", error: "This endpoint is not yet implemented."});
});

//
// ***** Please insert your Lab 6 code here *****
//
const {createServer} = require("http");
const {Server} = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer);
const onlineUsers = {};

const totalItems = 5; //set this when create items

let totalScore = 0;
let totalTownPeople = 0;
const yourJson = require('./data/users.json'); // length of the users json for this server
const length = Object.keys(yourJson).length; // so u can keep track of the users signed in 
io.use((socket, next) => {
    chatSession(socket.request, {}, next);
});
io.on("connection", (socket) => {
    if (socket.request.session.user) {
        const {username, name} = socket.request.session.user;
        onlineUsers[username] = {name, team: null, ready: false, playerId: socket.id, statistic: 0};
    }

    socket.on('move', ({x, y, playerId}) => {
        socket.broadcast.emit('move', {x, y, playerId});
    });

    socket.on('moveEnd', (playerId) => {
        socket.broadcast.emit('moveEnd', playerId);
    });
    //call this when player collect item
    socket.on('collect item', (item) => {
        const {username, name} = socket.request.session.user;
        onlineUsers[username].statistic += 1;
        totalScore += 1
        socket.broadcast.emit('collect item', item);
        if (totalScore === totalItems) {
            io.emit('game end', 'Townpeople');
        }
    })
    //call this when kill player
    socket.on('kill player', () => {
        const {username, name} = socket.request.session.user;
        onlineUsers[username].statistic += 1;
        totalTownPeople -= 1
        if (totalTownPeople === 0) {
            socket.broadcast.emit('game end', 'Mafia');
        }
    })

    socket.on("disconnect", () => {
        if (socket.request.session.user) {
            const {username} = socket.request.session.user;
            delete onlineUsers[username];
            checkstatus();
        }
    })
    socket.on("ready", () => {
        const {username} = socket.request.session.user;
        onlineUsers[username].ready = true;
        checkstatus();
    })
    socket.on("restart", () => {
        const {username} = socket.request.session.user;
        onlineUsers[username].ready = false;
        onlineUsers[username].team = null;
        onlineUsers[username].statistic = 0;
    })
})

// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The chat server has started...");
});

// Helper function to shuffle an array
function shuffle(array) {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}

function checkstatus() {
    const allPlayersReady = Object.values(onlineUsers).every(
        (user) => user.ready
    );
    if (allPlayersReady) {
        // Shuffle players' usernames
        const usernames = Object.keys(onlineUsers);
        totalTownPeople = usernames.length - 1
        const shuffledUsernames = shuffle(usernames);

        // Assign teams
        const mafiaIndex = Math.floor(Math.random() * usernames.length);
        shuffledUsernames.forEach((username, index) => {
            const team = index === mafiaIndex ? "Mafia" : "Townpeople";
            onlineUsers[username].team = team;
        });
        io.emit("game start", JSON.stringify(onlineUsers));
    }
}
