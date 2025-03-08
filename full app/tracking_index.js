require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const session = require('express-session');
const passport = require('./passport');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 5001;

// Gemini AI Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash" // Changed to supported model
});

// Middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// In-memory storage for demo
const moodData = [];

// Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => res.redirect('/')
);

app.get("/", (req, res) => {
  res.render("tracking_index", {
    currentSuggestion: "Start tracking your mood to receive helpful suggestions!",
    weeklySuggestion: "",
    data: JSON.stringify([]),
    mood_data: JSON.stringify(moodData),
  });
});

// Enhanced POST Route
app.post("/", async (req, res) => {
  const { happy, calm, sad, angry, stressed } = req.body;
  let currentSuggestion = "Start tracking your mood to receive helpful suggestions!";
  let weeklySuggestion = "";
  let scores = {
    happy: 3, calm: 3, sad: 3, angry: 3, stressed: 3
  }; // Default values

  try {
    // Input validation
    scores = {
      happy: Math.min(5, Math.max(1, parseInt(happy))),
      calm: Math.min(6, Math.max(1, parseInt(calm))),
      sad: Math.min(5, Math.max(1, parseInt(sad))),
      angry: Math.min(5, Math.max(1, parseInt(angry))),
      stressed: Math.min(5, Math.max(1, parseInt(stressed)))
    };

    // Current mood analysis
    const currentPrompt = `Generate mental health suggestions based on:
    Happy: ${scores.happy}/5, Calm: ${scores.calm}/6, 
    Sad: ${scores.sad}/5, Angry: ${scores.angry}/5, 
    Stressed: ${scores.stressed}/5. Provide 2-3 actionable tips.`;
    
    const currentResult = await model.generateContent(currentPrompt);
    currentSuggestion = currentResult.response.text();

    // Weekly trend analysis
    const moodHistory = moodData.map(entry => entry.mood);
    if (moodHistory.length > 1) {
      const weeklyPrompt = `Analyze this 7-day mood trend (higher=better): ${moodHistory.join(', ')}.
      Consider these app features: 
      - Fun games
      - Breathing exercises 
      - Music player
      - Grief group
      - Anonymous chat
      - Journaling
      
      Suggest: 
      1. For declining trends: Recommend therapist search
      2. For low moods: Journaling prompt
      3. Appropriate feature based on pattern
      Format as bullet points.`;

      const weeklyResult = await model.generateContent(weeklyPrompt);
      weeklySuggestion = "Weekly Trend Analysis:\n" + weeklyResult.response.text();
    }

  } catch (error) {
    console.error('API Error:', error);
    currentSuggestion = "Quick tip: Try our breathing exercise feature!";
    weeklySuggestion = "";
  }

  // Mood calculations (now safe)
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const data = [
    { label: "Happy", value: (scores.happy / total) * 100 },
    { label: "Calm", value: (scores.calm / total) * 100 },
    { label: "Sad", value: (scores.sad / total) * 100 },
    { label: "Angry", value: (scores.angry / total) * 100 },
    { label: "Stressed", value: (scores.stressed / total) * 100 },
  ];

  // Update mood history
  const moodScore = scores.happy + scores.calm;
  moodData.push({ mood: moodScore });
  if(moodData.length > 7) moodData.shift();

  res.render("tracking_index", {
    currentSuggestion: currentSuggestion,
    weeklySuggestion: weeklySuggestion,
    data: JSON.stringify(data),
    mood_data: JSON.stringify(moodData)
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));