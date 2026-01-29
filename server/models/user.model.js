import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";

/**
 * User Schema - Mô hình Người dùng
 * Quản lý thông tin tài khoản, xác thực và lịch sử mượn sách.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true, // Đảm bảo email duy nhất
    },
    password: {
      type: String,
      required: true,
      select: false, // Không trả về password khi query mặc định
    },
    role: {
      type: String,
      enum: ["Admin", "User"],
      default: "User",
    },

    // Trạng thái xác thực email
    accountVerified: { type: Boolean, default: false },

    // ===== QUẢN TRỊ (LOCK / SOFT DELETE) =====
    isLocked: { type: Boolean, default: false }, // Khóa tài khoản tạm thời
    lockedAt: { type: Date, default: null },
    lockReason: { type: String, default: "" },

    isDeleted: { type: Boolean, default: false }, // Xóa mềm
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // Danh sách sách đang mượn (Snapshot để hiển thị nhanh bên User Dashboard)
    // Chi tiết đầy đủ xem bảng `Borrow`
    borrowedBooks: [
      {
        borrowId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Borrow",
        },
        returned: {
          type: Boolean,
          default: false,
        },
        bookTitle: String,
        borrowedDate: Date,
        dueDate: Date,
        renewCount: { type: Number, default: 0 },
        lastRenewedAt: { type: Date, default: null },
      },
    ],

    avatar: {
      public_id: String,
      url: String,
    },

    // ===== AUTHENTICATION TOKENS =====
    verificationCode: Number, // OTP xác thực email
    verficationCodeExpire: Date,
    resetPasswordToken: String, // Token reset pass
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 }, { unique: true });

// Sinh mã OTP 5 số
userSchema.methods.generateVerificationCode = function () {
  function geenerateRandomFiveDigitNumber() {
    const firstDigit = Math.floor(Math.random() * 9) + 1;
    const remainingDigits = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, 0);
    return parseInt(firstDigit + remainingDigits);
  }
  const verificationCode = geenerateRandomFiveDigitNumber();
  this.verificationCode = verificationCode;
  this.verficationCodeExpire = Date.now() + 15 * 60 * 1000; // Hết hạn sau 15p
  return verificationCode;
};

// Sinh JWT Token đăng nhập
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Sinh token reset password (crypto random)
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token để lưu vào DB
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken; // Trả về token gốc (chưa hash) để gửi mail
};

export const User = mongoose.model("User", userSchema);
