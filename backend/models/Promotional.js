const mongoose = require('mongoose');

const promotionalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    // Rich text content (HTML, Markdown, or custom format)
    // You can store HTML from rich text editors like Quill, TinyMCE, TipTap, etc.
  },
  // Optional: Store the raw/plain text version separately for searching
  descriptionPlainText: {
    type: String,
    default: ''
  },
  targetUrl: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
promotionalSchema.index({ status: 1, startDate: 1, endDate: 1 });

// Optional: Text index for searching description content
promotionalSchema.index({ title: 'text', descriptionPlainText: 'text' });

// Pre-save middleware to extract plain text from rich text HTML
promotionalSchema.pre('save', function(next) {
  if (this.description && this.isModified('description')) {
    // If storing HTML, remove HTML tags for plain text version
    this.descriptionPlainText = this.description.replace(/<[^>]*>/g, '');
  }
  next();
});

module.exports = mongoose.model('Promotional', promotionalSchema);