const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "You must have a name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  role: {
    type: String,
    enum: ["USER", "MODERATOR", "ADMIN"],
    default: "USER",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordChangedAt: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  connectedAccounts: [
    {
      accountType: {
        type: String,
        enum: [
          "FACEBOOK",
          "GOOGLE",
          "TWITTER",
          "INSTAGRAM",
          "IMAGES"
        ]
      },
      accountLogin: {
        type: String,
        required: [true, "Please provide a valid login."]
      },
      accountPassword: {
        type: String,
        required: [true, "Please provide a valid password."]
      },
      allowedPersonName: {
        type: String,
        required: [true, "Please provide a valid name"],
      },
      allowedPersonPhoneNumber: {
        type: String,
        required: [true, "Please provide a valid phone number"],
        validate: [validator.isMobilePhone, "Please provide a valid phone number"]
      },      
      addedAt: Date
    },
  ],
  subscription: {
    type: String,
    required: true,
    enum: ["NONE", "BASIC", "PREMIUM", "PRO"],
    default: "NONE"
  }
});

userSchema.pre("save", async function (next) {
  // Only run if password was modified
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Get only active users list
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Check if incomingPassword is correct
userSchema.methods.correctPassword = async function (
  incomingPassword,
  userPassword
) {
  return await bcrypt.compare(incomingPassword, userPassword);
};

userSchema.methods.hashAccountCredentials = async function(accountLogin, accountPassword) {
  const accountHashedLogin = await bcrypt.hash(accountLogin, 12);
  const accountHashedPassword = await bcrypt.hash(accountPassword, 12)

  return { accountHashedLogin, accountHashedPassword }
}

// Check when password was changed and compare to data incoming from JWT object - false means NOT changed
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

// for forgot-password ---> will be send by email, NOT IMPLEMENTED YET BUT WORKS - saves new password to DB
userSchema.methods.createRandomPassword = function () {
  const randomPassword = crypto.randomBytes(16).toString("hex");
  return randomPassword;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
