import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { toggleAddNewAdminPopup } from "./popUpSlice";

const API_BASE =
  import.meta?.env?.VITE_API_BASE_URL || "http://localhost:4000";

const USER_API = `${API_BASE}/api/v1/user`;

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    loading: false,
  },
  reducers: {
    fetchAllUsersRequest(state) {
      state.loading = true;
    },
    fetchAllUsersSuccess(state, action) {
      state.loading = false;
      state.users = action.payload;
    },
    fetchAllUsersFailed(state) {
      state.loading = false;
    },

    addNewAdminRequest(state) {
      state.loading = true;
    },
    addNewAdminSuccess(state) {
      state.loading = false;
    },
    addNewAdminFailed(state) {
      state.loading = false;
    },
  },
});

/**
 * ✅ Fetch users (CHỈ user đã verify)
 * @param {"active"|"deleted"} status
 *  - "active": Chưa xóa
 *  - "deleted": Đã xóa
 */
export const fetchAllUsers = (status = "active") => async (dispatch) => {
  dispatch(userSlice.actions.fetchAllUsersRequest());

  try {
    const safeStatus = encodeURIComponent(status);

    const { data } = await axios.get(`${USER_API}/all?status=${safeStatus}`, {
      withCredentials: true,
    });

    dispatch(userSlice.actions.fetchAllUsersSuccess(data.users));
  } catch (err) {
    dispatch(userSlice.actions.fetchAllUsersFailed());
    toast.error(
      err?.response?.data?.message || "Không thể tải danh sách người dùng."
    );
  }
};

/**
 * ✅ Add new admin
 * @param {FormData} data
 * @param {"active"|"deleted"} refreshStatus - tab cần refresh sau khi thêm (mặc định "active")
 */
export const addNewAdmin =
  (data, refreshStatus = "active") =>
  async (dispatch) => {
    dispatch(userSlice.actions.addNewAdminRequest());

    try {
      const res = await axios.post(`${USER_API}/add/new-admin`, data, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(userSlice.actions.addNewAdminSuccess());
      toast.success(res.data.message);
      dispatch(toggleAddNewAdminPopup());

      // 👉 refresh lại danh sách user theo tab hiện tại
      dispatch(fetchAllUsers(refreshStatus));
    } catch (err) {
      dispatch(userSlice.actions.addNewAdminFailed());
      toast.error(err?.response?.data?.message || "Thêm admin thất bại.");
    }
  };

export default userSlice.reducer;
