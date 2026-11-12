const mongoose = require('mongoose');

const dailyUpdateSchema = new mongoose.Schema(
  {
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
      required: true,
    },
    siteName: {
      type: String,
      default: '',
    },
    siteCode: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    workPhase: {
      type: String, // Foundation, Brickwork, Shuttering, Plastering, Electrical, Plumbing, Painting
      default: 'General Work',
    },
    workersCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    weather: {
      type: String, // Sunny, Cloudy, Rainy
      default: 'Sunny',
    },
    photos: [
      {
        type: String,
      },
    ],
    supervisorName: {
      type: String,
      default: 'Site Incharge',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DailyUpdate', dailyUpdateSchema);

