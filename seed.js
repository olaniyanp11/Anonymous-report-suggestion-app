// seed.js
const mongoose = require("mongoose");
require("dotenv").config(); // Optional if using .env file
const Report = require("./models/Report"); // Adjust the path as necessary
const Suggestion = require("./models/Suggestion"); // Adjust the path as necessary

// Connect to MongoDB
const MONGO_URI = process.env.dbURL || "mongodb://127.0.0.1:27017/anonymous_reporting";
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));


// Dummy data
const reports = [
    { title: "Network Issue", message: "Cannot connect to the intranet." },
    { title: "Login Bug", message: "Login form crashes on empty input." },
    { title: "Printer Malfunction", message: "Printer in office B is not working." },
];

const suggestions = [
    { title: "Add Dark Mode", message: "It would be great to have a dark mode option." },
    { title: "Mobile App", message: "Develop a mobile version for easier access." },
    { title: "More Categories", message: "Include more categories for reports." },
];

// Seed function
const seedDB = async () => {
    try {
        await Report.deleteMany({});
        await Suggestion.deleteMany({});
        console.log("Existing reports and suggestions cleared");

        await Report.insertMany(reports);
        await Suggestion.insertMany(suggestions);
        console.log("Dummy reports and suggestions added successfully");
    } catch (err) {
        console.error("Error seeding DB:", err);
    } finally {
        mongoose.connection.close();
        console.log("MongoDB connection closed");
    }
};

// Run seed
seedDB();
