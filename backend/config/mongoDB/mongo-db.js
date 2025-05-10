const mongoose = require('mongoose');


// Connect to MongoDB



  const connectDBMongoose = async () => {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
        .catch((err) => console.error('❌ Mongo error:', err));
  };

  module.exports = {connectDBMongoose};
