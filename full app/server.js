const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 7001;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
    res.render("welcome_chat");
});

app.get("/chat", (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.redirect("/");
    }
    res.render("chat", { username });
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("chat message", (data) => {
        io.emit("chat message", { user: data.user, message: data.message });
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
