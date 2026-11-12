const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Individual', 'Company'],
      default: 'Individual',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    address1: {
      type: String,
      default: '',
    },
    address2: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    state: {
      type: String,
      default: 'Tamil Nadu',
    },
    pincode: {
      type: String,
      default: '',
    },
    gst: {
      type: String,
      default: '',
      trim: true,
    },
    remarks: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'On Hold', 'Inactive'],
      default: 'Active',
    },
    projectsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for initials
clientSchema.virtual('initials').get(function () {
  if (!this.name) return 'CL';
  return this.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
});

clientSchema.set('toJSON', { virtuals: true });
clientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Client', clientSchema);

