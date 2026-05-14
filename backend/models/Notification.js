const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error', 'promotional', 'system'],
    default: 'info'
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  targetType: {
    type: String,
    enum: ['all', 'specific', 'role_based'],
    default: 'all'
  },
  userRoles: [{
    type: String,
    enum: ['user', 'agent', 'admin', 'super_admin']
  }],
  isRead: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'cancelled'],
    default: 'sent'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  actionUrl: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Tracking fields
  totalTargetCount: {
    type: Number,
    default: 0
  },
  readCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
notificationSchema.index({ targetType: 1, status: 1, scheduledFor: 1 });
notificationSchema.index({ 'isRead.userId': 1 });
notificationSchema.index({ status: 1, scheduledFor: 1 });
notificationSchema.index({ priority: -1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }); // For cleanup

// Static method to get notifications for a user
notificationSchema.statics.getUserNotifications = async function(userId, role, options = {}) {
  const { limit = 20, page = 1, unreadOnly = false, includeExpired = false } = options;
  const skip = (page - 1) * limit;

  const query = {
    $or: [
      { targetType: 'all' },
      { targetType: 'specific', targetUsers: userId },
      { targetType: 'role_based', userRoles: role }
    ],
    status: 'sent',
    scheduledFor: { $lte: new Date() }
  };

  // Handle expiration
  if (!includeExpired) {
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ];
  }

  if (unreadOnly) {
    query['isRead.userId'] = { $ne: userId };
  }

  const notifications = await this.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-targetUsers -userRoles')
    .populate('createdBy', 'username');

  const total = await this.countDocuments(query);

  return {
    notifications,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page
  };
};

// Method to mark notification as read
notificationSchema.methods.markAsRead = async function(userId) {
  const alreadyRead = this.isRead.some(read => read.userId.toString() === userId.toString());
  
  if (!alreadyRead) {
    this.isRead.push({
      userId: userId,
      readAt: new Date()
    });
    this.readCount = (this.readCount || 0) + 1;
  }
  
  return this.save();
};

// Method to mark notification as unread
notificationSchema.methods.markAsUnread = async function(userId) {
  const readIndex = this.isRead.findIndex(read => read.userId.toString() === userId.toString());
  
  if (readIndex !== -1) {
    this.isRead.splice(readIndex, 1);
    this.readCount = Math.max(0, (this.readCount || 0) - 1);
  }
  
  return this.save();
};

// Method to check if user has read the notification
notificationSchema.methods.isReadByUser = function(userId) {
  return this.isRead.some(read => read.userId.toString() === userId.toString());
};

// Method to get read status for a user
notificationSchema.methods.getReadStatus = function(userId) {
  const readEntry = this.isRead.find(read => read.userId.toString() === userId.toString());
  return {
    isRead: !!readEntry,
    readAt: readEntry ? readEntry.readAt : null
  };
};

// Static method to get unread count for a user (optimized)
notificationSchema.statics.getUnreadCount = async function(userId, role) {
  const query = {
    $or: [
      { targetType: 'all' },
      { targetType: 'specific', targetUsers: userId },
      { targetType: 'role_based', userRoles: role }
    ],
    status: 'sent',
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ],
    scheduledFor: { $lte: new Date() },
    'isRead.userId': { $ne: userId }
  };

  return await this.countDocuments(query);
};

// Static method to mark all notifications as read for a user
notificationSchema.statics.markAllAsRead = async function(userId, role) {
  const query = {
    $or: [
      { targetType: 'all' },
      { targetType: 'specific', targetUsers: userId },
      { targetType: 'role_based', userRoles: role }
    ],
    status: 'sent',
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ],
    scheduledFor: { $lte: new Date() },
    'isRead.userId': { $ne: userId }
  };

  const notifications = await this.find(query);
  
  for (const notification of notifications) {
    await notification.markAsRead(userId);
  }
  
  return notifications.length;
};

// Static method to delete old notifications (cleanup)
notificationSchema.statics.cleanupExpired = async function(daysToKeep = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const result = await this.deleteMany({
    expiresAt: { $lt: cutoffDate },
    status: 'sent'
  });
  
  return result.deletedCount;
};

module.exports = mongoose.model('Notification', notificationSchema);