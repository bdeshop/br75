const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    default: 'Banner'
  },
  image: {
    type: String,
    required: true
  },
  deviceCategory: {
    type: String,
    enum: ['mobile', 'computer', 'both'], // Added enum for validation
    default: 'both',
    required: true
  },
  richText: {
    type: String,
    required: false,
    default: null,
    description: 'HTML or rich text content for the banner'
  },
  richTextPosition: {
    type: String,
    enum: ['overlay', 'below', 'above', 'left', 'right'],
    default: 'overlay',
    description: 'Position of rich text relative to banner image'
  },
  richTextAlignment: {
    type: String,
    enum: ['left', 'center', 'right', 'top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'],
    default: 'center',
    description: 'Alignment of rich text within the banner'
  },
  link: {
    type: String,
    required: false,
    description: 'URL to navigate when banner is clicked'
  },
  linkTarget: {
    type: String,
    enum: ['_self', '_blank', '_parent', '_top'],
    default: '_self',
    description: 'Where to open the link'
  },
  order: {
    type: Number,
    default: 0,
    description: 'Display order for multiple banners'
  },
  status: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better query performance
bannerSchema.index({ deviceCategory: 1, status: 1, order: 1 });
bannerSchema.index({ status: 1, order: 1 });

// Update the updatedAt field before saving
bannerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for formatted rich text (you can add sanitization here if needed)
bannerSchema.virtual('formattedRichText').get(function() {
  if (!this.richText) return null;
  // You can add HTML sanitization or processing here
  return this.richText;
});

// Method to get banner data with rich text
bannerSchema.methods.getBannerData = function() {
  return {
    id: this._id,
    name: this.name,
    image: this.image,
    deviceCategory: this.deviceCategory,
    richText: this.richText,
    richTextPosition: this.richTextPosition,
    richTextAlignment: this.richTextAlignment,
    link: this.link,
    linkTarget: this.linkTarget,
    order: this.order,
    status: this.status
  };
};

module.exports = mongoose.model('Banner', bannerSchema);