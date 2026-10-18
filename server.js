require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const validator = require('validator');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({ origin: '*', methods: ['POST', 'GET'], allowedHeaders: ['Content-Type'] }));

const leadSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    preferredTime: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
});

const Lead = mongoose.model('Lead', leadSchema);

// Hardcoded MongoDB Atlas URI to bypass .env lookup issues
const MONGODB_URI = 'mongodb+srv://aryanpratyush07_db_user:xHuQt9inN533Q5cE@cluster0.ziewgbt.mongodb.net/jagannath_db?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

app.post('/api/leads', async (req, res) => {
    try {
        const { name, phone, email, preferredTime } = req.body;
        if (!name || !phone) {
            return res.status(400).json({ success: false, message: 'Name and Phone number are required.' });
        }
        if (!validator.isMobilePhone(phone, 'en-IN')) {
            return res.status(400).json({ success: false, message: 'Please provide a valid Indian mobile number.' });
        }
        const newLead = new Lead({
            name: validator.escape(name),
            phone: validator.escape(phone),
            email: email ? validator.escape(email) : '',
            preferredTime: preferredTime ? validator.escape(preferredTime) : 'Not specified'
        });
        await newLead.save();
        return res.status(201).json({
            success: true,
            message: 'Thank you! Your enquiry has been submitted successfully. Our team will contact you shortly.'
        });
    } catch (error) {
        console.error('Error saving lead:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
});

app.get('/', (req, res) => {
    res.send('Jagannath Sai Prateek Backend is running.');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});