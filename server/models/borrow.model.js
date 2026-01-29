import mongoose from "mongoose";

/**
 * Borrow Schema - Phiếu mượn sách
 * Lưu lịch sử mỗi lần mượn sách của User.
 * Liên kết giữa User và BookCopy.
 */
const borrowSchema = new mongoose.Schema(
  {
    // Thông tin người mượn (Snapshot để tránh query nhiều)
    user: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },

    // Giá mượn tại thời điểm tạo phiếu
    price: { type: Number, required: true },

    // ✅ CUỐN SÁCH CỤ THỂ (Physical Copy)
    bookCopy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookCopy",
      required: true,
      index: true,
    },

    // ✅ ĐẦU SÁCH (Dùng để thống kê)
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },

    // Ngày mượn
    borrowDate: { type: Date, default: Date.now },

    // Hạn trả
    dueDate: { type: Date, required: true },

    // Ngày trả thực tế (null nếu chưa trả)
    returnDate: { type: Date, default: null },

    // Gia hạn
    renewCount: { type: Number, default: 0 },
    lastRenewedAt: { type: Date, default: null },

    // Tiền phạt phát sinh (tính khi trả quá hạn)
    fine: { type: Number, default: 0 },

    // Đã thông báo sắp hết hạn chưa
    notified: { type: Boolean, default: false },

    // ✅ THÔNG TIN THANH TOÁN (Khi trả sách)
    payment: {
      method: {
        type: String,
        enum: ["cash", "vnpay", "zalopay"],
        default: "cash",
      },
      status: {
        type: String,
        enum: ["unpaid", "pending", "paid", "failed"],
        default: "unpaid",
      },
      amount: { type: Number, default: 0 }, // Tổng tiền = price + fine
      transactionId: { type: String, default: null },
      paidAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

// Indexes tối ưu truy vấn
borrowSchema.index({ "user.id": 1, returnDate: 1, createdAt: -1 }); // Lấy lịch sử mượn của 1 user
borrowSchema.index({ book: 1, createdAt: -1 }); // Lịch sử mượn theo đầu sách
borrowSchema.index({ bookCopy: 1, createdAt: -1 }); // Lịch sử của 1 cuốn cụ thể

export const Borrow = mongoose.model("Borrow", borrowSchema);
