const express = require('express');
const path = require('path');
const route = require('./routes/route');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cookieparser = require('cookie-parser');
const dotenv = require('dotenv')
dotenv.config()
const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(morgan('tiny'));
app.use(cookieparser());
app.use(express.json());
app.use('/', route);


app.use((req, res, next)=>{
    res.render('404', { title: '404 Not Found' });
})


app.listen(3000, async () => {
  console.log('🚀 Server running on http://localhost:3000');

  try {
    await mongoose.connect(process.env.dbURL);
    console.log('✅ Connected to MongoDB');

    // 👇 Create Admin on Start
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = new User({
        name: 'Super Admin',
        email: 'admin@example.com',
        password: hashedPassword,
      });

      await adminUser.save();
      console.log('🛡️ Super Admin created: admin@example.com / admin123');
    } else {
      console.log('🛡️ Admin already exists. Skipping creation.');
    }

  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err.message);
  }
});
