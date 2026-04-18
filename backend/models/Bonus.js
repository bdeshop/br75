const mongoose = require('mongoose');

const bonusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  bonusCode: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true
  },
  bonusType: {
    type: String,
    enum: ['welcome', 'deposit', 'reload', 'cashback', 'free_spin', 'special', 'manual'],
    default: 'deposit'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  minDeposit: {
    type: Number,
    default: 0
  },
  maxBonus: {
    type: Number,
    default: null
  },
  wageringRequirement: {
    type: Number,
    default: 0
  },
  validityDays: {
    type: Number,
    default: 30
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  applicableTo: {
    type: String,
    enum: ['all', 'new', 'existing', 'specific'],
    default: 'all'
  },
  assignedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null,
    validate: {
      validator: function(value) {
        if (value && this.startDate) {
          return value > this.startDate;
        }
        return true;
      },
      message: 'End date must be after start date'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Generate bonus code if not provided
bonusSchema.pre('save', function(next) {
  if (!this.bonusCode) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.bonusCode = code;
  }
  next();
});

// Auto-update status based on dates
bonusSchema.pre('save', function(next) {
  const now = new Date();
  
  // Auto-expire if endDate is passed
  if (this.endDate && this.endDate < now && this.status === 'active') {
    this.status = 'expired';
  }
  
  next();
});

const Bonus = mongoose.model('Bonus', bonusSchema);

module.exports = Bonus;