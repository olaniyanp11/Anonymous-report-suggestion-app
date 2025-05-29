const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const Report = require('../models/Report');
const Suggestion = require('../models/Suggestion');
const authenticateToken = require('../middlewares/checkLog');

router.get('/', (req,res)=>{
    res.render('index', { title: 'Home' });
})
router.get('/register', (req, res) => {
    res.render('register', { title: 'Register', error:null });
})
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login', error:null });
})
router.get('/thank-you', (req, res) => {
    res.render('thank', { title: 'thank-you', error:null });
})
router.get('/report', (req, res) => {
    res.render('report', { title: 'Report', error:null });
})


// post routes 
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.render('register', { title: 'Register', error: 'Email already exists.' });
        }
        if (password.length < 6) {
            return res.render('register', { title: 'Register', error: 'Password must be at least 6 characters long.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword
        });
        await newUser.save();
        res.render('login', { title: 'Login', error: null });
    }
    catch(error){
        console.error(error);
        res.render('register', { title: 'Register', error: 'An error occurred while registering.' });
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email:email});
        if (!user) {
            return res.render('login', { title: 'Login', error: 'Invalid email or password.' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.render('login', { title: 'Login', error: 'Invalid email or password.' });
        }
        const token = jsonwebtoken.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');
    }catch(error){
        res.render('login', { title: 'Login', error: 'An error occurred while logging in.' });
    }
})

router.get('/dashboard', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) return res.redirect('/login');

  const totalReports = await Report.countDocuments();
  const totalSuggestions = await Suggestion.countDocuments();
  const pendingReports = await Report.countDocuments({ sorted: false });
  const respondedReports = await Report.countDocuments({ sorted: true });
    const pendingSuggestions = await Suggestion.countDocuments({ sorted: false });
    const respondedSuggestions = await Suggestion.countDocuments({ sorted: true });
  const recentReports = await Report.find()
    .sort({ createdAt: -1 })
    .limit(5);
    const recentSuggestions = await Suggestion.find()
    .sort({ createdAt: -1 }).limit(5);

  res.render('protected/dashboard', {
    title: 'Dashboard',
    user,
    totalReports,
    totalSuggestions,
    pendingReports,
    pendingSuggestions,
    respondedSuggestions,
    respondedReports,
    recentReports,
    recentSuggestions
  });
});
router.post('/report', async (req,res)=>{
    let { title, message, category } = req.body;
    if (!title || !message || !category) {
        return res.render('report', { title: 'Report', error: 'Title, message and category are required.' });
    }
    console.log(title, message, category);
    category = category.toLowerCase();
    category = category.trim();
    try {
        if (category !== "suggestion" && category !== "complaint" ){
            return res.render('report', { title: 'Report', error: 'Invalid category. Choose either "suggestion" or "complaint".' });
        }
        if (category === 'suggestion') {
            const newSuggestion = new Suggestion({
                title: title,
                message: message,
                sorted: false
            });
            await newSuggestion.save();
        }
        if (category === 'complaint') {
            const newReport = new Report({
                title: title,
                message: message,
                sorted: false
            });
            await newReport.save();
        }
           res.render('thank', { title: 'Thank You', error: null });
    } catch (error) {
        console.error(error);
        res.render('report', { title: 'Report', error: 'An error occurred while submitting the report.' });
    }
})
router.patch('/admin/reports/:id/respond', async (req, res) => {
  const { responded } = req.body;
  console.log('Responded:', responded);
  try {
    await Report.findByIdAndUpdate(req.params.id, { sorted: true ? responded : false });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});
router.get('/admin/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.render('protected/reports', { title: 'Reports', reports });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching reports');
  }
});
router.get('/admin/suggestions', async (req, res) => {
  try {
    const suggestions = await Suggestion.find().sort({ createdAt: -1 });
    res.render('protected/suggestions', { title: 'Suggestions', suggestions });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching suggestions');
  }
});
router.patch('/admin/suggestions/:id/respond', async (req, res) => {
  try {
    // Update the suggestion status to 'responded'

    await Suggestion.findByIdAndUpdate(req.params.id, { status: 'responded' });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating suggestion');
  }
});
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
})
module.exports = router;