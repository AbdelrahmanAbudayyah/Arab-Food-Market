const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Conversation = require('./conversation');


// Create a message schema
const messageSchema = new Schema(
  {
    senderId: { type: String },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation', // Reference to the Conversation model
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model('Message', messageSchema);
