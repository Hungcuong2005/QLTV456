import mongoose from "mongoose";

/**
 * Book Schema - Mô hình đầu sách
 * Đại diện cho thông tin chung của một tác phẩm (Tựa, Tác giả, ISBN...).
 * Các cuốn sách vật lý cụ thể được quản lý bởi `BookCopy`.
 */
const bookSchema = new mongoose.Schema(
  {
    // ===== Thông tin cơ bản =====
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },

    // ISBN: Mã số sách quốc tế (Unique)
    isbn: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Cho phép null/undefined mà không lỗi unique
      index: true,
    },

    publisher: { type: String, default: "", trim: true },
    publishYear: { type: Number, min: 0, default: null },

    // Thể loại chính (Legacy support)
    category: { type: String, default: "", trim: true, index: true },

    // Danh sách thể loại (New support - Many-to-Many)
    categories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true },
    ],

    coverImage: { type: String, default: "" }, // URL ảnh bìa (Cloudinary)

    // Phí mượn sách / Giá trị sách
    price: { type: Number, default: 0, min: 0 },

    // ===== QUẢN LÝ KHO (Inventory) =====
    // Số bản sao đang có sẵn (Status = Available)
    quantity: { type: Number, default: 0, min: 0, index: true },

    // Tổng số bản sao trong hệ thống (bao gồm cả đang mượn, hỏng...)
    totalCopies: { type: Number, default: 0, min: 0 },

    // Cờ báo nhanh trạng thái còn sách (quantity > 0)
    availability: { type: Boolean, default: false, index: true },

    // Số lượt giữ sách (Logic giữ chỗ - nếu có feature này)
    holdCount: { type: Number, default: 0, min: 0 },

    // ===== SOFT DELETE =====
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Index composite để tìm nhanh theo Tên + Tác giả
bookSchema.index({ title: 1, author: 1 });
// Index tìm theo danh mục
bookSchema.index({ categories: 1 });

export const Book = mongoose.model("Book", bookSchema);
