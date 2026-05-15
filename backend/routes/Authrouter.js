const express = require("express");
const bcrypt = require("bcryptjs");
const Authrouter = express.Router();
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const Affiliate = require("../models/Affiliate");
const mongoose = require("mongoose");
const axios = require("axios");
const nodemailer = require("nodemailer");

// JWT Secret Keys
const JWT_SECRET = process.env.JWT_SECRET || "fsdfsdfsd43534";
const AFFILIATE_JWT_SECRET = process.env.AFFILIATE_JWT_SECRET || "dfsdfsdf535345";

// ==================== EMAIL CONFIGURATION ====================
// Configure nodemailer transporter
const emailTransporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: 'support@bir75.com',
        pass: 'VnSnxC0+c2S'
    },
    tls: {
        rejectUnauthorized: false  // This bypasses certificate validation
    },
    // Alternative: Try different TLS settings
    // secure: false,
    // requireTLS: true,
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000
});


// Helper function to send email
async function sendEmail(to, subject, html) {
    try {
        await emailTransporter.sendMail({
            from: `Bir75 support@bir75.com`,
            to: to,
            subject: subject,
            html: html
        });
        return true;
    } catch (error) {
        console.error("Email sending error:", error);
        return false;
    }
}

// Helper function to get device info
const getDeviceInfo = (userAgent) => {
  let deviceType = 'unknown';
  let browser = 'unknown';
  let os = 'unknown';
  
  if (userAgent.includes('Mobile')) deviceType = 'mobile';
  else if (userAgent.includes('Tablet')) deviceType = 'tablet';
  else deviceType = 'desktop';
  
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';
  
  return { deviceType, browser, os };
};

// Import models
const LoginLog = require('../models/LoginLog');
const MasterAffiliate = require("../models/MasterAffiliate");

// Try to import ClickTrack, but handle if it doesn't exist
let ClickTrack;
try {
  ClickTrack = require('../models/ClickTrack');
} catch (error) {
  console.log('ClickTrack model not found, creating simplified version...');
  ClickTrack = {
    findOne: () => Promise.resolve(null),
    findOneAndUpdate: () => Promise.resolve(null),
    prototype: {
      save: () => Promise.resolve()
    }
  };
}

// Helper function to validate payment details
const validatePaymentDetails = (paymentMethod, paymentData) => {
  switch (paymentMethod) {
    case 'bkash':
    case 'nagad':
    case 'rocket':
      if (!paymentData.phoneNumber) {
        return { isValid: false, message: `${paymentMethod} phone number is required` };
      }
      const phoneRegex = /^01[3-9]\d{8}$/;
      if (!phoneRegex.test(paymentData.phoneNumber)) {
        return { isValid: false, message: `Invalid ${paymentMethod} phone number format. Use Bangladeshi format: 01XXXXXXXXX` };
      }
      break;

    case 'binance':
      if (!paymentData.email) {
        return { isValid: false, message: 'Binance email is required' };
      }
      if (!paymentData.walletAddress) {
        return { isValid: false, message: 'Binance wallet address is required' };
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(paymentData.email)) {
        return { isValid: false, message: 'Invalid Binance email format' };
      }
      break;

    default:
      return { isValid: false, message: 'Invalid payment method' };
  }
  return { isValid: true };
};

// ==================== OTP CONFIGURATION (For SMS Password Reset) ====================
const OTP_CONFIG = {
    EXPIRY_MINUTES: 5,
    CODE_LENGTH: 6,
    MAX_ATTEMPTS: 3,
    RESEND_COOLDOWN_SECONDS: 60,
    SENDER_ID: '8809617611338',
    API_BASE_URL: 'https://xend.positiveapi.com/api/v3',
    TOKEN: "419|xFSHHY3vGlHDNE3XFijfExhQBpWsC64VsL51BYPO"
};

// Helper function to generate OTP
function generateOTP(length = OTP_CONFIG.CODE_LENGTH) {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to format phone number for API (without any special characters)
function formatPhoneForAPI(phone) {
    if (!phone) return null;
    
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If empty after cleaning, return null
    if (!cleaned) return null;
    
    // If the number starts with 0, remove it (e.g., 01612258208 -> 1612258208)
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }
    
    // If the number starts with 1, it's a Bangladeshi mobile number without country code
    // Add 880 as country code (not 88)
    if (cleaned.startsWith('1')) {
        cleaned = `880${cleaned}`;
    }
    
    // If the number starts with 88, add another 8 to make it 880
    if (cleaned.startsWith('88') && !cleaned.startsWith('880')) {
        cleaned = `8${cleaned}`;
    }
    
    // Final validation: should be 12 digits (880 + 10 digits) for Bangladesh
    // or 13 digits (880 + 10 digits + extra)
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
        cleaned = `880${cleaned}`;
    }
    
    console.log(`Formatted phone for API: ${cleaned}`);
    return cleaned;
}

// Helper function to send SMS via Xend API
async function sendSMS(phoneNumber, message) {
    try {
        // Format phone number properly for API
        let apiPhone = formatPhoneForAPI(phoneNumber);
        
        if (!apiPhone) {
            console.error('Invalid phone number for SMS:', phoneNumber);
            return { success: false, error: 'Invalid phone number format' };
        }
        
        // Ensure we have a 12-digit number (880 + 10 digits)
        if (apiPhone.length !== 12 && apiPhone.length !== 13) {
            console.error(`Phone number length issue: ${apiPhone} (length: ${apiPhone.length})`);
            // Try to fix by ensuring 880 prefix
            let cleaned = phoneNumber.replace(/\D/g, '');
            if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
            if (!cleaned.startsWith('880')) {
                apiPhone = `880${cleaned}`;
            }
        }
        
        const url = `${OTP_CONFIG.API_BASE_URL}/sms/send`;
        
        const requestBody = {
            recipient: apiPhone,
            sender_id: OTP_CONFIG.SENDER_ID,
            message: message
        };

        console.log(`Sending SMS to ${apiPhone}: ${message.substring(0, 20)}...`);
        console.log('Request body:', JSON.stringify(requestBody));

        const response = await axios.post(url, requestBody, {
            headers: {
                'Authorization': `Bearer ${OTP_CONFIG.TOKEN}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
        });
        
        console.log('SMS API Response:', response.data);
        
        if (response.data && response.data.status === 'success') {
            return { success: true, data: response.data };
        } else {
            console.error('SMS sending failed:', response.data);
            return { success: false, error: response.data?.message || 'SMS sending failed' };
        }
    } catch (error) {
        console.error('Error sending SMS:', error.response?.data || error.message);
        console.error('Full error:', error);
        return { 
            success: false, 
            error: error.response?.data?.message || error.message 
        };
    }
}
// ==================== DIRECT SIGNUP ROUTE (No OTP) ====================
Authrouter.post("/signup", async (req, res) => {
  try {
    const { 
      currency, 
      phone, 
      username, 
      password, 
      confirmPassword, 
      fullName, 
      email, 
      referralCode, 
      affiliateCode 
    } = req.body;
    
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'unknown';

    // Validation checks
    if (!phone || !username || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Phone, username, password, and confirm password are required" 
      });
    }

    // Validate phone number (Bangladeshi format)
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format. Must be a valid Bangladeshi number (e.g., 01XXXXXXXXX)"
      });
    }

    // Validate username
    if (!/^[a-z0-9_]+$/.test(username)) {
      return res.status(400).json({ 
        success: false,
        message: "Username can only contain lowercase letters, numbers, and underscores." 
      });
    }

    if (username.length < 3) {
      return res.status(400).json({ 
        success: false,
        message: "Username must be at least 3 characters long." 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 6 characters long." 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Passwords do not match." 
      });
    }

    // Format phone number with country code
    const formattedPhone = `${phone}`;

    // Check if user already exists - SPECIFIC CHECKS
    const existingPhoneUser = await User.findOne({ phone: formattedPhone });
    if (existingPhoneUser) {
      return res.status(400).json({ 
        success: false,
        message: "This number is already verified in our system."
      });
    }

    const existingUsernameUser = await User.findOne({ username });
    if (existingUsernameUser) {
      return res.status(400).json({ 
        success: false,
        message: "Username already exists. Please choose a different username."
      });
    }

    if (email) {
      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser) {
        return res.status(400).json({ 
          success: false,
          message: "Email already registered. Please use a different email or login."
        });
      }
    }

    // Handle regular user referral
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (!referrer) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid referral code" 
        });
      }
      referredBy = referrer._id;
    }

    // Generate a unique player_id
    let player_id;
    let isUnique = false;
    
    while (!isUnique) {
      player_id = 'PL' + Math.random().toString(36).substr(2, 8).toUpperCase();
      const existingPlayer = await User.findOne({ player_id });
      if (!existingPlayer) {
        isUnique = true;
      }
    }

    // Create registration source tracking
    const registrationSource = {
      type: referredBy ? 'user_referral' : affiliateCode ? 'affiliate_referral' : 'direct',
      source: 'website',
      medium: 'organic',
      campaign: 'signup',
      userReferralCode: referralCode,
      affiliateCode: affiliateCode,
      landingPage: '/register',
      ipAddress,
      userAgent,
      timestamp: new Date()
    };

    // Create new user
    const newUser = new User({
      currency: currency || "BDT",
      phone: formattedPhone,
      username,
      password,
      player_id,
      referredBy,
      registrationSource,
    });

    await newUser.save();

    // Handle affiliate referral
    let affiliateId = null;
    if (affiliateCode) {
      const affiliate = await Affiliate.findOne({ 
        affiliateCode: affiliateCode.toUpperCase(),
        status: 'active' 
      });

      if (affiliate) {
        affiliateId = affiliate._id;
        const registrationBonus = Number(affiliate.cpaRate) || 0;
        
        const validEarningsHistory = (affiliate.earningsHistory || []).filter(earning => 
          earning && earning.sourceAmount !== undefined
        );
        
        const earningRecord = {
          amount: registrationBonus,
          type: 'registration_bonus',
          description: 'New user registration bonus',
          status: 'pending',
          referredUser: newUser._id,
          sourceId: newUser._id,
          sourceType: 'registration',
          commissionRate: 1,
          sourceAmount: registrationBonus,
          calculatedAmount: registrationBonus,
          earnedAt: new Date(),
          metadata: { currency: 'BDT' }
        };
        
        validEarningsHistory.push(earningRecord);
        
        await Affiliate.findByIdAndUpdate(affiliate._id, {
          $set: { earningsHistory: validEarningsHistory },
          $inc: { 
            totalEarnings: registrationBonus,
            pendingEarnings: registrationBonus,
            referralCount: 1
          },
          $push: {
            referredUsers: {
              user: newUser._id,
              joinedAt: new Date(),
              earnedAmount: registrationBonus,
              userStatus: 'active',
              lastActivity: new Date()
            }
          }
        });
      }
    }

    // Handle user referral
    if (referredBy) {
      try {
        await User.findByIdAndUpdate(referredBy, {
          $inc: { 
            referralCount: 1,
            referralEarnings: 50
          },
          $push: {
            referralUsers: {
              username: newUser.username,
              user: newUser._id,
              joinedAt: new Date(),
              earnedAmount: 50
            }
          }
        });

        await User.findByIdAndUpdate(referredBy, {
          $inc: { balance: 50 }
        });

      } catch (referralError) {
        console.error('Error recording user referral:', referralError);
      }
    }

    // Update login information
    newUser.login_count = 1;
    newUser.last_login = new Date();
    newUser.first_login = false;
    await newUser.save();

    // Create login log
    const { deviceType, browser, os } = getDeviceInfo(userAgent);
    
    const loginLog = new LoginLog({
      userId: newUser._id,
      username: newUser.username,
      ipAddress,
      userAgent,
      deviceType,
      browser,
      os,
      status: 'success'
    });
    
    await loginLog.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        player_id: newUser.player_id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        currency: newUser.currency,
        balance: newUser.balance,
        referralCode: newUser.referralCode,
        affiliateId: affiliateId,
        first_login: newUser.first_login,
        login_count: newUser.login_count,
        last_login: newUser.last_login,
        isPhoneVerified: true
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
});
// ==================== DIRECT LOGIN ROUTE (No OTP) ====================
Authrouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'unknown';

    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Username/Mobile number and password are required" 
      });
    }
 console.log("body",req.body)
    // Check if input is mobile number (starts with + or digit and contains only numbers, +, -)
    const isMobileNumber = /^[\+]?[0-9\-]+$/.test(username);
    
    let user = null;
    let loginIdentifier = username;

    if (isMobileNumber) {
      // Search by phone number
      user = await User.findOne({ phone: username }).select("+password");
      loginIdentifier = `phone: ${username}`;
     
    } else {
      // Search by username
      user = await User.findOne({ username }).select("+password");
      loginIdentifier = `username: ${username}`;
    }

    const { deviceType, browser, os } = getDeviceInfo(userAgent);

    if (!user) {
      const loginLog = new LoginLog({
        userId: null,
        username: loginIdentifier,
        ipAddress,
        userAgent,
        deviceType,
        browser,
        os,
        status: 'failed',
        failureReason: 'user_not_found'
      });
      await loginLog.save();
      
      return res.status(401).json({ 
        success: false,
        message: "Invalid username/mobile number or password" 
      });
    }

    if (user.status !== 'active') {
      const loginLog = new LoginLog({
        userId: user._id,
        username: user.username,
        ipAddress,
        userAgent,
        deviceType,
        browser,
        os,
        status: 'failed',
        failureReason: `account_${user.status}`
      });
      await loginLog.save();
      
      return res.status(403).json({ 
        success: false,
        message: `Your account is ${user.status}. Please contact support.` 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`Password validation for ${loginIdentifier}:`, isPasswordValid);
    if (!isPasswordValid) {
      const loginLog = new LoginLog({
        userId: user._id,
        username: user.username,
        ipAddress,
        userAgent,
        deviceType,
        browser,
        os,
        status: 'failed',
        failureReason: 'invalid_password'
      });
      await loginLog.save();
      
      return res.status(401).json({ 
        success: false,
        message: "Invalid username/mobile number or password" 
      });
    }

    user.login_count = (user.login_count || 0) + 1;
    user.last_login = new Date();
    user.first_login = false;
    
    if (!user.loginHistory) {
      user.loginHistory = [];
    }
    
    user.loginHistory.push({
      ipAddress,
      device: deviceType,
      userAgent,
      location: 'Unknown',
      timestamp: new Date()
    });
    
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }
    
    await user.save();

    const loginLog = new LoginLog({
      userId: user._id,
      username: user.username,
      ipAddress,
      userAgent,
      deviceType,
      browser,
      os,
      status: 'success',
      failureReason: null
    });
    
    await loginLog.save();

    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        player_id: user.player_id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        currency: user.currency,
        balance: user.balance,
        bonusBalance: user.bonusBalance,
        total_deposit: user.total_deposit,
        total_withdraw: user.total_withdraw,
        total_bet: user.total_bet,
        total_wins: user.total_wins,
        referralCode: user.referralCode,
        role: user.role,
        status: user.status,
        first_login: user.first_login,
        login_count: user.login_count,
        last_login: user.last_login,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
        kycStatus: user.kycStatus,
        language: user.language,
        themePreference: user.themePreference,
        avatar: user.avatar,
        accountAgeInDays: user.accountAgeInDays,
        isNewUser: user.isNewUser,
        availableBalance: user.availableBalance,
        withdrawableAmount: user.withdrawableAmount,
        wageringStatus: user.wageringStatus,
        isAffiliateReferred: user.isAffiliateReferred
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error during login" 
    });
  }
});

// ==================== EMAIL-BASED PASSWORD RESET ====================

// ==================== EMAIL-BASED PASSWORD RESET (Using existing otp field) ====================

// Request password reset via email (forgot password)
Authrouter.post("/forgot-password-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Don't reveal if user exists or not (security)
    if (!user) {
      return res.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link"
      });
    }

    // Check if user has email
    if (!user.email) {
      return res.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link"
      });
    }

    // Generate reset token and OTP
    const resetToken = Math.random().toString(36).substr(2, 32);
    const otp = generateOTP();

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Use the existing otp field instead of passwordResetOTP
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      purpose: 'email_password_reset',
      verified: false,
      attempts: 0,
      createdAt: new Date()
    };

    await user.save();

    // Send password reset email
    const emailSent = await sendEmail(
      user.email,
      "Password Reset Request",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.username},</p>
          <p>We received a request to reset your password. Please use the following OTP code to reset your password:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email and ensure your account is secure.</p>
          <p>You can also use this link: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email"
      });
    }

    res.json({
      success: true,
      message: "Password reset instructions sent to your email",
      data: {
        resetToken,
        expiresIn: 60
      }
    });
  } catch (error) {
    console.error("Forgot password email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process password reset request"
    });
  }
});

// Verify OTP for email password reset
Authrouter.post("/verify-reset-otp", async (req, res) => {
  try {
    const { resetToken, otp } = req.body;

    if (!resetToken || !otp) {
      return res.status(400).json({
        success: false,
        message: "Reset token and OTP are required"
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Check OTP - using otp field
    if (!user.otp || !user.otp.code || user.otp.purpose !== 'email_password_reset') {
      return res.status(400).json({
        success: false,
        message: "No OTP request found. Please request a new password reset"
      });
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new password reset"
      });
    }

    if (user.otp.code !== otp) {
      user.otp.attempts = (user.otp.attempts || 0) + 1;
      await user.save();
      
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - (user.otp.attempts || 0)} attempts remaining`
      });
    }

    // Mark OTP as verified
    user.otp.verified = true;
    await user.save();

    res.json({
      success: true,
      message: "OTP verified successfully. You can now reset your password."
    });

  } catch (error) {
    console.error("Verify reset OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Reset password after OTP verification (email-based)
Authrouter.post("/reset-password-email", async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token, new password, and confirm password are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: new Date() }
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Check if OTP was verified - using otp field
    if (!user.otp || !user.otp.verified || user.otp.purpose !== 'email_password_reset') {
      return res.status(400).json({
        success: false,
        message: "OTP not verified. Please verify OTP first."
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.otp = undefined; // Clear the OTP
    user.lastPasswordChange = new Date();

    await user.save();

    // Send confirmation email
    await sendEmail(
      user.email,
      "Password Changed Successfully",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Changed Successfully</h2>
          <p>Hello ${user.username},</p>
          <p>Your password has been successfully changed.</p>
          <p>If you did not make this change, please contact our support immediately.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `
    );

    res.json({
      success: true,
      message: "Password reset successfully. You can now login with your new password."
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password"
    });
  }
});

// Resend OTP for email password reset
Authrouter.post("/resend-reset-otp", async (req, res) => {
  try {
    const { resetToken } = req.body;

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required"
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Check cooldown
    const lastAttempt = user.otp?.createdAt;
    if (lastAttempt) {
      const timeSinceLastAttempt = Date.now() - new Date(lastAttempt);
      if (timeSinceLastAttempt < 30 * 1000) {
        const secondsLeft = Math.ceil((30 * 1000 - timeSinceLastAttempt) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${secondsLeft} seconds before requesting another code`
        });
      }
    }

    // Generate new OTP
    const otp = generateOTP();

    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      purpose: 'email_password_reset',
      verified: false,
      attempts: 0,
      createdAt: new Date()
    };

    await user.save();

    // Send new OTP email
    const emailSent = await sendEmail(
      user.email,
      "Password Reset - New OTP",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset - New OTP</h2>
          <p>Hello ${user.username},</p>
          <p>Your new password reset OTP code is:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email"
      });
    }

    res.json({
      success: true,
      message: "New OTP sent to your email",
      data: {
        expiresIn: 10
      }
    });

  } catch (error) {
    console.error("Resend reset OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
// ==================== SMS-BASED PASSWORD RESET (Fixed) ====================

// Request OTP for password reset (SMS)
Authrouter.post("/forgot-password/request-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    
    console.log("Phone received:", phone);
    
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required"
      });
    }

    // Format phone for database lookup (with 0 prefix)
    let dbPhone = phone;
    if (!dbPhone.startsWith('0')) {
      dbPhone = `0${dbPhone}`;
    }
    
    console.log("Looking for user with phone:", dbPhone);
    
    const user = await User.findOne({ phone: dbPhone });
    
    if (!user) {
      return res.json({
        success: true,
        message: "If this phone number is registered, you will receive an OTP"
      });
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);

    user.otp = {
      code: otpCode,
      expiresAt: expiresAt,
      purpose: 'password_reset',
      verified: false,
      attempts: 0,
      createdAt: new Date()
    };
    
    await user.save();

    const message = `আপনার পাসওয়ার্ড রিসেট কোড: ${otpCode}\nএই কোডটি ${OTP_CONFIG.EXPIRY_MINUTES} মিনিটের জন্য বৈধ।\n\nYour password reset code is: ${otpCode}. Valid for ${OTP_CONFIG.EXPIRY_MINUTES} minutes.`;

    // Use the original phone number (without 0 prefix) for SMS
    const smsResult = await sendSMS(phone, message);

    if (process.env.NODE_ENV === 'development') {
      return res.json({
        success: true,
        message: 'OTP sent successfully (Development Mode)',
        data: {
          otp: otpCode,
          expiresAt: expiresAt,
          phone: phone
        }
      });
    }

    if (smsResult.success) {
      res.json({
        success: true,
        message: 'OTP sent successfully. Please check your phone.',
        data: {
          expiresAt: expiresAt,
          phone: phone
        }
      });
    } else {
      console.error('SMS sending failed but OTP saved:', smsResult.error);
      res.json({
        success: true,
        message: 'OTP generated but SMS delivery failed. Please try again or contact support.',
        data: {
          expiresAt: expiresAt,
          phone: phone
        }
      });
    }

  } catch (error) {
    console.error("Request password reset OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Verify OTP for password reset (SMS)
Authrouter.post("/forgot-password/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required"
      });
    }

    // Format phone for database lookup
    let dbPhone = phone;
    if (!dbPhone.startsWith('0')) {
      dbPhone = `0${dbPhone}`;
    }

    const user = await User.findOne({ phone: dbPhone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this phone number"
      });
    }

    if (!user.otp || user.otp.purpose !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: "No password reset request found. Please request a new OTP."
      });
    }

    user.otp.attempts = (user.otp.attempts || 0) + 1;
    
    if (user.otp.attempts > OTP_CONFIG.MAX_ATTEMPTS) {
      user.otp = undefined;
      await user.save();
      
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP."
      });
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      user.otp = undefined;
      await user.save();
      
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      });
    }

    if (user.otp.code !== otp.toString()) {
      await user.save();
      
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${OTP_CONFIG.MAX_ATTEMPTS - user.otp.attempts} attempts remaining.`
      });
    }

    user.otp.verified = true;
    user.otp.verifiedAt = new Date();
    
    const resetToken = jwt.sign(
      { 
        userId: user._id, 
        purpose: 'password_reset',
        phone: user.phone 
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    await user.save();

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        resetToken,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error("Verify password reset OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Reset password after OTP verification (SMS)
Authrouter.post("/forgot-password/reset", async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token, new password, and confirm password are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
      
      if (decoded.purpose !== 'password_reset') {
        return res.status(400).json({
          success: false,
          message: "Invalid reset token purpose"
        });
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({
          success: false,
          message: "Reset token has expired. Please request a new OTP."
        });
      }
      return res.status(400).json({
        success: false,
        message: "Invalid reset token"
      });
    }

    const user = await User.findById(decoded.userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.otp || !user.otp.verified || user.otp.purpose !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: "OTP not verified. Please complete OTP verification first."
      });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.passwordChangedAt = new Date();
    
    await user.save();

    // Get phone number without 0 prefix for SMS
    let smsPhone = user.phone;
    if (smsPhone.startsWith('0')) {
      smsPhone = smsPhone.substring(1);
    }
    
    const message = `আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।\n\nYour password has been changed successfully.`;
    await sendSMS(smsPhone, message).catch(err => 
      console.error('Failed to send password change SMS:', err)
    );

    res.json({
      success: true,
      message: "Password reset successfully. You can now login with your new password."
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Resend OTP for password reset (SMS)
Authrouter.post("/forgot-password/resend-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required"
      });
    }

    // Format phone for database lookup
    let dbPhone = phone;
    if (!dbPhone.startsWith('0')) {
      dbPhone = `0${dbPhone}`;
    }

    const user = await User.findOne({ phone: dbPhone });

    if (!user) {
      return res.json({
        success: true,
        message: "If this phone number is registered, you will receive an OTP"
      });
    }

    if (user.otp && user.otp.createdAt) {
      const timeSinceLastRequest = (new Date() - new Date(user.otp.createdAt)) / 1000;
      if (timeSinceLastRequest < OTP_CONFIG.RESEND_COOLDOWN_SECONDS) {
        const waitSeconds = Math.ceil(OTP_CONFIG.RESEND_COOLDOWN_SECONDS - timeSinceLastRequest);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSeconds} seconds before requesting a new OTP`
        });
      }
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);

    user.otp = {
      code: otpCode,
      expiresAt: expiresAt,
      purpose: 'password_reset',
      verified: false,
      attempts: 0,
      createdAt: new Date()
    };
    
    await user.save();

    const message = `আপনার নতুন পাসওয়ার্ড রিসেট কোড: ${otpCode}\nএই কোডটি ${OTP_CONFIG.EXPIRY_MINUTES} মিনিটের জন্য বৈধ।\n\nYour new password reset code is: ${otpCode}. Valid for ${OTP_CONFIG.EXPIRY_MINUTES} minutes.`;
    
    const smsResult = await sendSMS(phone, message);

    if (process.env.NODE_ENV === 'development') {
      return res.json({
        success: true,
        message: 'OTP resent successfully (Development Mode)',
        data: {
          otp: otpCode,
          expiresAt: expiresAt,
          phone: phone
        }
      });
    }

    if (smsResult.success) {
      res.json({
        success: true,
        message: 'OTP resent successfully. Please check your phone.',
        data: {
          expiresAt: expiresAt,
          phone: phone
        }
      });
    } else {
      res.json({
        success: true,
        message: 'OTP regenerated but SMS delivery failed. Please try again.',
        data: {
          expiresAt: expiresAt,
          phone: phone
        }
      });
    }

  } catch (error) {
    console.error("Resend password reset OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ==================== AFFILIATE ROUTES ====================

// Affiliate Registration Route
Authrouter.post("/affiliate/register", async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      company,
      website,
      promoMethod,
      paymentMethod,
      paymentDetails
    } = req.body;

    if (!email || !password || !firstName || !lastName || !phone) {
      return res.status(400).json({
        success: false,
        message: "Email, password, first name, last name, and phone are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    if (paymentMethod) {
      switch (paymentMethod) {
        case 'bkash':
        case 'nagad':
        case 'rocket':
          if (!paymentDetails?.phoneNumber) {
            return res.status(400).json({
              success: false,
              message: `${paymentMethod} phone number is required`
            });
          }
          if (!/^01[3-9]\d{8}$/.test(paymentDetails.phoneNumber)) {
            return res.status(400).json({
              success: false,
              message: `Invalid ${paymentMethod} phone number. Use format: 01XXXXXXXXX`
            });
          }
          break;
        
        case 'binance':
          if (!paymentDetails?.email) {
            return res.status(400).json({
              success: false,
              message: "Binance email is required"
            });
          }
          if (!/\S+@\S+\.\S+/.test(paymentDetails.email)) {
            return res.status(400).json({
              success: false,
              message: "Binance email is invalid"
            });
          }
          if (!paymentDetails?.walletAddress) {
            return res.status(400).json({
              success: false,
              message: "Binance wallet address is required"
            });
          }
          break;
        
        default:
          return res.status(400).json({
            success: false,
            message: "Please select a valid payment method"
          });
      }
    }

    const existingAffiliate = await Affiliate.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { phone: phone }
      ]
    });

    if (existingAffiliate) {
      return res.status(400).json({
        success: false,
        message: "Affiliate with this email or phone already exists"
      });
    }

    const dbPaymentDetails = {};
    if (paymentMethod && paymentDetails) {
      dbPaymentDetails[paymentMethod] = paymentDetails;
      
      if (['bkash', 'nagad', 'rocket'].includes(paymentMethod)) {
        if (!dbPaymentDetails[paymentMethod].accountType) {
          dbPaymentDetails[paymentMethod].accountType = 'personal';
        }
      }
    }

    const affiliate = new Affiliate({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      phone,
      company: company || '',
      website: website || '',
      promoMethod: promoMethod || 'other',
      paymentMethod: paymentMethod || 'bkash',
      paymentDetails: dbPaymentDetails,
      status: 'pending',
      verificationStatus: 'unverified'
    });

    await affiliate.save();

    res.status(201).json({
      success: true,
      message: "Affiliate registered successfully. Please wait for admin approval.",
      affiliate: {
        id: affiliate._id,
        email: affiliate.email,
        firstName: affiliate.firstName,
        lastName: affiliate.lastName,
        affiliateCode: affiliate.affiliateCode,
        status: affiliate.status,
        verificationStatus: affiliate.verificationStatus
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Affiliate with this email or phone already exists"
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error during registration"
    });
  }
});

// Affiliate login
Authrouter.post("/affiliate/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const affiliate = await Affiliate.findOne({ email: email.toLowerCase() });
    if (!affiliate) {
      return res.json({
        success: false,
        message: "Email or password is wrong!"
      });
    }

    if (affiliate.status !== 'active') {
      return res.json({
        success: false,
        message: `Your account is ${affiliate.status}. Please wait for admin approval before logging in.`
      });
    }

    const isPasswordValid = await affiliate.comparePassword(password);
    if (!isPasswordValid) {
      return res.json({
        success: false,
        message: "Email or password is wrong!"
      });
    }

    affiliate.lastLogin = new Date();
    await affiliate.save();

    const token = jwt.sign(
      { affiliateId: affiliate._id, email: affiliate.email },
      AFFILIATE_JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      affiliate: {
        id: affiliate._id,
        email: affiliate.email,
        firstName: affiliate.firstName,
        lastName: affiliate.lastName,
        fullName: affiliate.fullName,
        affiliateCode: affiliate.affiliateCode,
        status: affiliate.status,
        verificationStatus: affiliate.verificationStatus,
        lastLogin: affiliate.lastLogin
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login"
    });
  }
});

// Master Affiliate Login Route
Authrouter.post("/master-affiliate/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const masterAffiliate = await MasterAffiliate.findOne({ 
      email: email.toLowerCase(),
      role: 'master_affiliate'
    });

    if (!masterAffiliate) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (masterAffiliate.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Your master affiliate account is ${masterAffiliate.status}. Please contact admin or your super affiliate for activation.`
      });
    }

    const isPasswordValid = await masterAffiliate.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    masterAffiliate.lastLogin = new Date();
    await masterAffiliate.save();

    const token = jwt.sign(
      { 
        masterAffiliateId: masterAffiliate._id, 
        email: masterAffiliate.email,
        role: 'master_affiliate',
        createdBy: masterAffiliate.createdBy
      },
      AFFILIATE_JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: "Master affiliate login successful",
      token,
      masterAffiliate: {
        id: masterAffiliate._id,
        email: masterAffiliate.email,
        firstName: masterAffiliate.firstName,
        lastName: masterAffiliate.lastName,
        fullName: masterAffiliate.fullName,
        affiliateCode: masterAffiliate.affiliateCode,
        role: masterAffiliate.role,
        status: masterAffiliate.status,
        verificationStatus: masterAffiliate.verificationStatus,
        commissionRate: masterAffiliate.commissionRate,
        depositRate: masterAffiliate.depositRate,
        totalEarnings: masterAffiliate.totalEarnings,
        pendingEarnings: masterAffiliate.pendingEarnings,
        paidEarnings: masterAffiliate.paidEarnings,
        referralCount: masterAffiliate.referralCount,
        lastLogin: masterAffiliate.lastLogin,
        createdBy: masterAffiliate.createdBy
      }
    });

  } catch (error) {
    console.error("Master affiliate login error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(500).json({
        success: false,
        message: "Token generation error"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error during login"
    });
  }
});

// Check if affiliate referral code exists
Authrouter.get("/affiliate/check-referral/:code", async (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Affiliate code is required"
      });
    }
    
    const affiliate = await Affiliate.findOne({ 
      affiliateCode: code.toUpperCase(),
      status: 'active'
    });
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Invalid affiliate code"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Affiliate code is valid",
      affiliate: {
        name: affiliate.fullName,
        company: affiliate.company,
        affiliateCode: affiliate.affiliateCode
      }
    });
  } catch (error) {
    console.error("Check affiliate referral error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Get affiliate profile
Authrouter.get("/affiliate/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required"
      });
    }

    const decoded = jwt.verify(token, AFFILIATE_JWT_SECRET);
    const affiliate = await Affiliate.findById(decoded.affiliateId);

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    res.json({
      success: true,
      affiliate: {
        id: affiliate._id,
        email: affiliate.email,
        firstName: affiliate.firstName,
        lastName: affiliate.lastName,
        fullName: affiliate.fullName,
        phone: affiliate.phone,
        company: affiliate.company,
        website: affiliate.website,
        affiliateCode: affiliate.affiliateCode,
        commissionRate: affiliate.commissionRate,
        totalEarnings: affiliate.totalEarnings,
        pendingEarnings: affiliate.pendingEarnings,
        paidEarnings: affiliate.paidEarnings,
        referralCount: affiliate.referralCount,
        clickCount: affiliate.clickCount,
        isActive: affiliate.isActive,
        isVerified: affiliate.isVerified,
        paymentMethod: affiliate.paymentMethod,
        minimumPayout: affiliate.minimumPayout,
        lastLogin: affiliate.lastLogin,
        createdAt: affiliate.createdAt
      }
    });
  } catch (error) {
    console.error("Get affiliate profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Check if regular user referral code exists
Authrouter.get("/check-referral/:code", async (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Referral code is required"
      });
    }
    
    const user = await User.findOne({ referralCode: code });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid referral code"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Referral code is valid",
      referrer: {
        username: user.username,
        player_id: user.player_id
      }
    });
  } catch (error) {
    console.error("Check referral error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Track affiliate click
Authrouter.post("/track-click", async (req, res) => {
  try {
    const { affiliateCode, source, campaign, medium, landingPage } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'unknown';

    if (!affiliateCode) {
      return res.status(400).json({
        success: false,
        error: "Affiliate code is required"
      });
    }

    const affiliate = await Affiliate.findOne({
      affiliateCode: affiliateCode.toUpperCase(),
      status: 'active'
    });

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        error: "Invalid affiliate code"
      });
    }

    const clickId = 'CLK' + Math.random().toString(36).substr(2, 12).toUpperCase();

    await Affiliate.findByIdAndUpdate(affiliate._id, {
      $inc: { clickCount: 1 }
    });

    const clickData = new ClickTrack({
      affiliateId: affiliate._id,
      affiliateCode: affiliateCode.toUpperCase(),
      clickId,
      source: source || 'direct',
      campaign: campaign || 'general',
      medium: medium || 'referral',
      landingPage: landingPage || '/register',
      ipAddress,
      userAgent,
      timestamp: new Date()
    });
    await clickData.save();

    res.cookie('affiliate_ref', affiliateCode.toUpperCase(), {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.cookie('click_id', clickId, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.json({
      success: true,
      message: "Click tracked successfully",
      clickId,
      affiliate: {
        name: affiliate.fullName,
        code: affiliate.affiliateCode
      }
    });

  } catch (error) {
    console.error("Track click error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// Get referral statistics
Authrouter.get("/referral-stats", async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    const stats = {
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      referralEarnings: user.referralEarnings,
      referralUsers: user.referralUsers.length,
      referralLink: `${process.env.FRONTEND_URL || 'https://your-site.com'}/register?ref=${user.referralCode}`
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Referral stats error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// Get affiliate statistics
Authrouter.get("/affiliate-stats", async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied"
      });
    }

    const decoded = jwt.verify(token, AFFILIATE_JWT_SECRET);
    const affiliate = await Affiliate.findById(decoded.affiliateId);

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        error: "Affiliate not found"
      });
    }

    const stats = {
      affiliateCode: affiliate.affiliateCode,
      customAffiliateCode: affiliate.customAffiliateCode,
      totalEarnings: affiliate.totalEarnings,
      pendingEarnings: affiliate.pendingEarnings,
      paidEarnings: affiliate.paidEarnings,
      referralCount: affiliate.referralCount,
      clickCount: affiliate.clickCount,
      conversionRate: affiliate.clickCount > 0 ? (affiliate.referralCount / affiliate.clickCount * 100).toFixed(2) : 0,
      commissionRate: (affiliate.commissionRate * 100).toFixed(1) + '%',
      referralLinks: {
        main: `${process.env.FRONTEND_URL || 'https://your-site.com'}/register?aff=${affiliate.affiliateCode}`,
        deposit: `${process.env.FRONTEND_URL || 'https://your-site.com'}/deposit?aff=${affiliate.affiliateCode}`,
        sports: `${process.env.FRONTEND_URL || 'https://your-site.com'}/sports?aff=${affiliate.affiliateCode}`
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Affiliate stats error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

module.exports = Authrouter;