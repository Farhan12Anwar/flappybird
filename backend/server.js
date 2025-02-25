const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(
  "mongodb+srv://anwarfarhan339:cannonx100@cluster0.ucx0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", UserSchema);

const ScoreSchema = new mongoose.Schema({
  username: String,
  score: Number,
});
const Score = mongoose.model("Score", ScoreSchema);

// Register User
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Received registration request:", username, password);

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });

    await newUser.save();
    console.log("User registered successfully:", username);

    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login User
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt:", username);

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    console.log("User logged in successfully:", username);
    res.json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Save Score
// Save or Update High Score
app.post("/save-score", async (req, res) => {
  const { username, score } = req.body;

  try {
    let userScore = await Score.findOne({ username });

    if (userScore) {
      if (score > userScore.score) {
        userScore.score = score; // Update only if new score is higher
        await userScore.save();
        return res.json({ message: "High score updated!" });
      } else {
        return res.json({
          message: "Score not higher than existing high score.",
        });
      }
    } else {
      const newScore = new Score({ username, score });
      await newScore.save();
      return res.json({ message: "New high score saved!" });
    }
  } catch (error) {
    console.error("Error saving score:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Leaderboard
app.get("/leaderboard", async (req, res) => {
  const scores = await Score.find().sort({ score: -1 }).limit(5);
  res.json(scores);
});

app.listen(5000, () => console.log("Server running on port 5000"));
