const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create a conversation schema
const conversationSchema = new Schema(
  {
    participants: [{ type: String }]},
    { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model('Conversation', conversationSchema);
