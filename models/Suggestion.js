const mongoose = require('mongoose');
const SuggestionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
    },
    message: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
    },
    sorted: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });
const Suggestion = mongoose.model('Suggestion', SuggestionSchema);
module.exports = Suggestion;
// This code defines a Mongoose schema for a "Suggestion" model, which includes fields for title, message, and sorted status. The timestamps option automatically adds createdAt and updatedAt fields to the documents. The model is then exported for use in other parts of the application.