const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    empId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
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
    designation: {
      type: String,
      required: true,
      default: 'Site Engineer',
    },
    department: {
      type: String,
      default: 'Civil',
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      default: 0,
    },
    assignedSite: {
      type: String,
      default: 'All Sites',
    },
    employmentType: {
      type: String,
      enum: ['Permanent', 'Contract'],
      default: 'Permanent',
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Resigned', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for initials
employeeSchema.virtual('initials').get(function () {
  if (!this.name) return 'EM';
  return this.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
});

employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Employee', employeeSchema);

