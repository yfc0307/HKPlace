const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('.'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'hkplace-secret',
    resave: false,
    saveUninitialized: false
}));

// MongoDB Atlas connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hkplace')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Location schema
const location1Schema = new mongoose.Schema({
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    description: { type: String, required: true }
});

const location2Schema = new mongoose.Schema({
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    district_lat: { type: Number, required: true },
    district_lng: { type: Number, required: true },
    description: { type: String, required: true }
});

const Location1 = mongoose.model('Location_1', location1Schema);
const Location2 = mongoose.model('Location_2', location2Schema);

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/home.html');
});

// API endpoint for locations
app.get('/api/locations', async (req, res) => {
    try {
        const locations_1 = await Location1.find({});
        res.json(locations_1);
        console.log('Retrieved locations:', locations_1);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch locations' });
        console.log('Error fetching locations:', error);
    }
});

app.post('/authenticate', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            res.redirect('/home.html?login=success');
        } else {
            res.redirect('/login.html?error=invalid');
        }
    } catch (error) {
        res.redirect('/login.html?error=server');
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.redirect('/login.html?registered=true');
    } catch (error) {
        res.redirect('/register.html?error=exists');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});