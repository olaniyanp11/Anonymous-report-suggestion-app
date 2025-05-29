const mongoose = require("mongoose");

const Schema = mongoose.Schema({
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
}, {timestamps: true});
const Report = mongoose.model("Report", Schema);
module.exports = Report;