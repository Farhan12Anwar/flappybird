const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

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

const ScoreSchema = new mongoose.Schema({
  username: String,
  score: Number,
});
const Score = mongoose.model("Score", ScoreSchema);

// Save score
app.post("/save-score", async (req, res) => {
  const { username, score } = req.body;
  const newScore = new Score({ username, score });
  await newScore.save();
  res.json({ message: "Score saved!" });
});

// Get top scores
app.get("/leaderboard", async (req, res) => {
  const scores = await Score.find().sort({ score: -1 }).limit(5);
  res.json(scores);
});

app.listen(5000, () => console.log("Server running on port 5000"));
