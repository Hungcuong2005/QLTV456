import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

/**
 * Popup upload/cập nhật ảnh bìa sách
 * - Style đồng bộ với RecordBookPopup
 * - API: PUT /api/v1/book/admin/:id/cover
 * - FormData field: coverImage
 */
const UploadBookCoverPopup = ({ open, onClose, book, onUpdated }) => {
  const apiBaseUrl =
    import.meta?.env?.VITE_API_BASE_URL || "http://localhost:4000";

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const currentUrl = useMemo(() => book?.coverImage || "", [book]);

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setPreview("");
  }, [open, book?._id]);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!book?._id) {
      toast.error("Không tìm thấy sách để cập nhật ảnh.");
      return;
    }
    if (!file) {
      toast.error("Vui lòng chọn ảnh.");
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Chỉ chấp nhận ảnh JPG/PNG/WEBP.");
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("coverImage", file);

      // ⚠️ KHÔNG set Content-Type thủ công, browser sẽ tự set boundary
      const res = await fetch(
        `${apiBaseUrl}/api/v1/book/admin/${book._id}/cover`,
        {
          method: "PUT",
          credentials: "include",
          body: fd,
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Cập nhật ảnh thất bại.");
      }

      toast.success(data?.message || "Cập nhật ảnh bìa thành công!");
      onUpdated?.(data.book);
      onClose?.();
    } catch (err) {
      toast.error(err?.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 p-5 flex items-center justify-center z-50">
      <div className="w-full bg-white rounded-xl shadow-xl md:w-1/3 overflow-hidden border-t-4 border-[#C41526]">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 text-[#C41526]">
            Cập nhật ảnh bìa
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C41526]"></div>
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col items-center">
                  <p className="block text-gray-900 font-medium mb-2">Ảnh hiện tại</p>
                  <div className="mx-auto w-28 sm:w-32 md:w-36 h-44 sm:h-52 md:h-56 bg-gray-100 rounded-md overflow-hidden border-2 border-gray-200 flex items-center justify-center">
                    {currentUrl ? (
                      <img src={currentUrl} alt="Ảnh hiện tại" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm text-gray-500">Chưa có ảnh</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <p className="block text-gray-900 font-medium mb-2">Ảnh mới</p>
                  <div className="mx-auto w-28 sm:w-32 md:w-36 h-44 sm:h-52 md:h-56 bg-gray-100 rounded-md overflow-hidden border-2 border-gray-200 flex items-center justify-center">
                    {preview ? (
                      <img src={preview} alt="Ảnh mới" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm text-gray-500">Chưa chọn ảnh</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-900 font-medium mb-2">Chọn ảnh bìa</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Hỗ trợ: JPG/PNG/WEBP (tối đa 5MB).</p>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                  onClick={onClose}
                >
                  Đóng
                </button>

                <button
                  type="submit"
                  disabled={!file}
                  className="px-4 py-2 bg-[#C41526] text-white rounded-md hover:bg-[#A81220] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Lưu
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadBookCoverPopup;
