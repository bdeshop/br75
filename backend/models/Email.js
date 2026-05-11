// models/Email.js
const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  size: Number,
  attachmentId: String
});

const emailSchema = new mongoose.Schema({
  // IMAP / Original email data
  uid: { type: Number, unique: true, sparse: true },
  messageId: { type: String, unique: true, sparse: true },
  subject: { type: String, default: '(No Subject)' },
  from: { type: String, default: '' },
  fromName: String,
  to: { type: String, default: '' }, // Made optional with default
  toName: String,
  cc: { type: String, default: '' },
  bcc: { type: String, default: '' },
  body: { type: String, default: '' },
  bodyText: { type: String, default: '' },
  preview: { type: String, default: '' },
  
  // Status fields
  isRead: { type: Boolean, default: false },
  isStarred: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  
  // Thread / Reply tracking
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Email' },
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Email' },
  replyToId: String,
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Email' }],
  
  // Attachments
  hasAttachments: { type: Boolean, default: false },
  attachments: [attachmentSchema],
  
  // Dates
  receivedAt: Date,
  sentAt: Date,
  
  // For draft emails
  isDraft: { type: Boolean, default: false },
  draftTo: String,
  
}, { timestamps: true });

// Indexes for faster queries
emailSchema.index({ isRead: 1 });
emailSchema.index({ isStarred: 1 });
emailSchema.index({ isArchived: 1 });
emailSchema.index({ threadId: 1 });
emailSchema.index({ parentId: 1 });
emailSchema.index({ from: 1 });
emailSchema.index({ createdAt: -1 });
emailSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Email', emailSchema);