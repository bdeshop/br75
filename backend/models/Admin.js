const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin'
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminRole'
  },
  roleName: {
    type: String
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});


// Method to get all permissions
adminSchema.methods.getAllPermissions = async function() {
  if (this.role === 'super_admin') {
    return { isSuperAdmin: true, allPermissions: true };
  }
  
  if (this.roleId) {
    const AdminRole = mongoose.model('AdminRole');
    const role = await AdminRole.findById(this.roleId);
    if (role && role.permissions) {
      const permissions = {};
      role.permissions.forEach(perm => {
        permissions[perm] = { view: true, create: true, edit: true, delete: true };
      });
      return permissions;
    }
  }
  
  return {};
};

module.exports = mongoose.model('Admin', adminSchema);