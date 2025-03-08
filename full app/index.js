const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log(err));

  const userSchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    age: { type: Number, required: true }, 
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});


const User = mongoose.model("User", userSchema);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
    res.render("index", { message: "" });
});

app.post("/signup", async (req, res) => {
    const { name, age, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("index", { message: "User already exists. Please log in." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, age, email, password: hashedPassword });
        await newUser.save();

        res.render("index", { message: "Sign-up successful! Please log in." });
    } catch (err) {
        res.render("index", { message: "Error occurred during sign-up. Please try again." });
    }
});


const moodData = [];
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("index", { message: "User not found. Please sign up." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.render("index", { message: "Invalid credentials. Please try again." });
        }

        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

        res.redirect("http://localhost:5001");

    } catch (err) {
        res.render("index", { message: "Error occurred during login. Please try again." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});