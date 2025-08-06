const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  link: { type: String, unique: true },
  scrapedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
