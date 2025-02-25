const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

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
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", UserSchema);

const ScoreSchema = new mongoose.Schema({
  username: { type: String, required: true },
  score: { type: Number, required: true },
});
const Score = mongoose.model("Score", ScoreSchema);

// Register User
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login User
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    res.json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Save or Update High Score
app.post("/save-score", async (req, res) => {
  try {
    const { username, score } = req.body;
    if (!username || score == null) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const existingScore = await Score.findOne({ username });

    if (!existingScore) {
      await Score.create({ username, score });
    } else if (score > existingScore.score) {
      await Score.updateOne({ username }, { $set: { score } });
    }

    res.json({ message: "Score saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

// Get Leaderboard (Top 5 Scores)
app.get("/leaderboard", async (req, res) => {
  try {
    const scores = await Score.find().sort({ score: -1 }).limit(5);
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
