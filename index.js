const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
require('dotenv').config();
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json({ limit: '30mb' })); // Increase limit as needed
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(express.static('public')); // To serve static files like HTML, CSS, JS
app.use(session({
  secret: 'mySecretKey',
  resave: false,
  saveUninitialized: true
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Login&Register', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});

// Define schema and model for registration
const registerSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  secret_password: String,
});
const Register = mongoose.model('Register', registerSchema, 'registers'); // Specify the collection name 'registers'

// Register route
app.post('/api/register', async (req, res) => {
  try {
    // Check if the username already exists
    const existingUser = await Register.findOne({ username: req.body.username });
    const existingUserEmail = await Register.findOne({ email: req.body.email });
    const secret_password = req.body.secret_password;
    if (secret_password !== process.env.SECRET_PASSWORD) {
      return res.status(400).json({ message: "Invalid secret password" });
    }
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    if (existingUserEmail) {
      return res.status(400).
json({message:"Email already exists"});
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new Register({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const user = await Register.findOne({ username: req.body.username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    req.session.authenticated = true; // Mark the session as authenticated
    req.session.username = user.username; // Save the username in the session
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Success route
app.get('/success', (req, res) => {
  if (req.session.authenticated) { // Check if the session is authenticated
    res.status(200).sendFile(__dirname + '/public/success.html'); // Only serve the success page if authenticated
  } else {
    res.status(401).json({ message: "Unauthorized" }); // Unauthorized access
  }
});

// API route to fetch the username
app.get('/api/user', (req, res) => {
  if (req.session.authenticated && req.session.username) {
    res.status(200).json({ username: req.session.username });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Define schema and model for posts
const postSchema = new mongoose.Schema({
  owner: String,
  title: String,
  category: { type: String, enum: ['toys', 'books', 'equipment', 'other'] },
  price: String, // Changed the type to String to allow any format
  contact: String,
  images: [String], // Change type to an array of strings
});

const Post = mongoose.model('Post', postSchema, 'posts');

// Route for adding a new post
app.post('/api/posts', async (req, res) => {
  try {
    const { owner, title, category, price, contact, images } = req.body;
    const newPost = new Post({owner, title, category, price, contact, images });
    await newPost.save();
    res.status(201).json({ message: "Post added successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
app.get('/api/posts/all', async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})

// Route for fetching posts by owner
app.get('/api/posts', async (req, res) => {
  if (req.session.authenticated && req.session.username) {
    try {
      const posts = await Post.find({ owner: req.session.username });
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Route for deleting a post
app.delete('/api/posts/:id', async (req, res) => { // Corrected the route definition
  if (req.session.authenticated && req.session.username) {
    try {
      const deletedPost = await Post.findOneAndDelete({ _id: req.params.id, owner: req.session.username });
      if (deletedPost) {
        res.status(200).json({ message: "Post deleted successfully" });
      } else {
        res.status(404).json({ message: "Post not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
