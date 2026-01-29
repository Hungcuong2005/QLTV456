import axios from "axios";

/**
 * axiosClient - Cấu hình Axios gốc cho toàn bộ project Client
 * 
 * - baseURL: Lấy từ biến môi trường VITE_API_BASE_URL (ưu tiên) hoặc localhost
 * - withCredentials: true (Để gửi kèm cookie/token khi gọi API)
 * - headers: Mặc định Content-Type là JSON
 */
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosClient;
