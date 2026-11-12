const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      required: true,
      default: 'New Building',
    },
    category: {
      type: String,
      default: 'NB',
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'On Hold'],
      default: 'Active',
    },
    client: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: 'Chennai, TN',
    },
    city: {
      type: String,
      default: 'Chennai',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expectedDate: {
      type: Date,
    },
    projectBudget: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    photoUrl: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Site', siteSchema);

