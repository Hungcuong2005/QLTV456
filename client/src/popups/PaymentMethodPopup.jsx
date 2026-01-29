import React, { useMemo, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { fetchAllBorrowedBooks } from "../store/slices/borrowSlice"; // giữ nguyên theo project bạn

const PaymentMethodPopup = ({
  amount = 0,
  defaultMethod = "cash",
  onClose,
  borrowId,
  email,
  apiBaseUrl = "",
}) => {
  const dispatch = useDispatch();

  const [method, setMethod] = useState(defaultMethod);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const moneyVND = useMemo(() => {
    if (typeof amount === "number") return `${amount.toLocaleString("vi-VN")}₫`;
    if (amount === null || amount === undefined) return "—";
    return `${amount}₫`;
  }, [amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!borrowId) return setError("Thiếu borrowId (ID lượt mượn).");
    if (!email) return setError("Thiếu email người dùng.");

    if (method === "zalopay") {
      setError("ZaloPay chưa tích hợp. Hãy chọn VNPAY hoặc Tiền mặt.");
      return;
    }

    try {
      setLoading(true);

      // ✅ PREPARE theo borrowId
      const prepareUrl = `${apiBaseUrl}/api/v1/borrow/return/prepare/${borrowId}`;
      const { data } = await axios.post(
        prepareUrl,
        { email, method },
        { withCredentials: true }
      );

      if (method === "vnpay") {
        if (!data?.paymentUrl) {
          setError("Không nhận được paymentUrl từ server.");
          return;
        }
        window.location.href = data.paymentUrl;
        return;
      }

      if (method === "cash") {
        const realAmount = data?.amount ?? amount;

        // ✅ CONFIRM CASH theo borrowId
        const confirmUrl = `${apiBaseUrl}/api/v1/borrow/return/cash/confirm/${borrowId}`;
        await axios.post(confirmUrl, { email }, { withCredentials: true });

        onClose?.();
        await dispatch(fetchAllBorrowedBooks());

        alert(
          `Thanh toán tiền mặt thành công.\nSố tiền đã thu: ${Number(
            realAmount
          ).toLocaleString("vi-VN")}₫`
        );
      }
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Có lỗi khi tạo thanh toán. Vui lòng thử lại.";
      setError(status ? `${msg} (HTTP ${status})` : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 p-5 flex items-center justify-center z-50">
      <div className="w-full bg-white rounded-xl shadow-xl md:w-1/3 overflow-hidden border-t-4 border-[#C41526]">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 text-[#C41526]">
            Chọn phương thức thanh toán
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Số tiền cần thanh toán:{" "}
            <span className="font-semibold text-gray-900">{moneyVND}</span>
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-[#C41526] hover:bg-[#FDE8EA] transition cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={method === "cash"}
                  onChange={() => setMethod("cash")}
                  className="accent-[#C41526]"
                  disabled={loading}
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Tiền mặt</p>
                  <p className="text-sm text-gray-600">
                    Thanh toán trực tiếp tại quầy.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-[#C41526] hover:bg-[#FDE8EA] transition cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="zalopay"
                  checked={method === "zalopay"}
                  onChange={() => setMethod("zalopay")}
                  className="accent-[#C41526]"
                  disabled={loading}
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">ZaloPay</p>
                  <p className="text-sm text-gray-600">
                    Quét QR hoặc chuyển khoản qua ZaloPay.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-[#C41526] hover:bg-[#FDE8EA] transition cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="vnpay"
                  checked={method === "vnpay"}
                  onChange={() => setMethod("vnpay")}
                  className="accent-[#C41526]"
                  disabled={loading}
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">VNPAY</p>
                  <p className="text-sm text-gray-600">
                    Thanh toán qua cổng VNPAY.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition disabled:opacity-60"
                onClick={onClose}
                disabled={loading}
              >
                Đóng
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-[#C41526] text-white rounded-md hover:bg-[#A81220] transition disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Xác nhận thanh toán"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodPopup;
