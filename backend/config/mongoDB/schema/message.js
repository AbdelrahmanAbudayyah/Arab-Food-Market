const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Conversation = require('./conversation');


// Create a message schema
const messageSchema = new Schema(
  {
    senderId: { type: String },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
