const express = require('express');
const router = express.Router();
const User = require('../models/subscriber');


router.post('/subscribe', async (req, res) => {
    try {
        const { email, time } = req.body;
        
        if (!email || !time) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and time are required' 
            });
        }


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid email format' 
            });
        }


        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(time)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid time format. Please use HH:MM format' 
            });
        }
        

        let user = await User.findOne({ email });
        
        if (user) {
            user.time = time;
            user.updatedAt = new Date();
            await user.save();
            
            return res.json({ 
                success: true,
                message: 'Subscription updated successfully!',
                user: {
                    email: user.email,
                    time: user.time
                }
            });
        } else {
            const newUser = new User({ 
                email, 
                time,
                createdAt: new Date()
            });
            await newUser.save();
            
            return res.status(201).json({ 
                success: true,
                message: 'Subscribed successfully! You will receive daily job alerts.',
                user: {
                    email: newUser.email,
                    time: newUser.time
                }
            });
        }
        
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Subscription failed',
            message: error.message
        });
    }
});

// Get user info (optional - for debugging)
router.get('/info/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                email: user.email,
                time: user.time,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});


router.delete('/unsubscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        const deletedUser = await User.findOneAndDelete({ email });
        
        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                error: 'Subscription not found'
            });
        }

        res.json({
            success: true,
            message: 'Unsubscribed successfully'
        });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to unsubscribe'
        });
    }
});

router.get('/all', async (req, res) => {
    try {
        const users = await User.find({}).select('email time createdAt');
        res.json({
            success: true,
            count: users.length,
            users: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
});

router.post('/info', async (req, res) => {
    try {
        const { email, time } = req.body;
        
        if (!email || !time) {
            return res.status(400).json({ 
                success: false,
                error: 'Email and time are required' 
            });
        }

        const newUser = new User({ email, time });
        await newUser.save();
        
        res.status(201).json({
            success: true,
            message: 'User data saved successfully',
            user: {
                email: newUser.email,
                time: newUser.time
            }
        });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal Server Error' 
        });
    }
});

module.exports = router;