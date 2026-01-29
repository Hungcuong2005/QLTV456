import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toggleRecordBookPopup } from "./popUpSlice";
import { toast } from "react-toastify";

const borrowSlice = createSlice({
  name: "borrow",
  initialState: {
    loading: false,
    error: null,
    userBorrowedBooks: [],
    allBorrowedBooks: [],
    message: null,
  },
  reducers: {
    // ===== USER BORROWED BOOKS =====
    fetchUserBorrowedBooksRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    fetchUserBorrowedBooksSuccess(state, action) {
      state.loading = false;
      state.userBorrowedBooks = action.payload;
    },
    fetchUserBorrowedBooksFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },

    // ===== RECORD BORROW BOOK =====
    recordBookRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    recordBookSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
    },
    recordBookFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },

    // ===== ALL BORROWED BOOKS (ADMIN) =====
    fetchAllBorrowedBooksRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    fetchAllBorrowedBooksSuccess(state, action) {
      state.loading = false;
      state.allBorrowedBooks = action.payload;
    },
    fetchAllBorrowedBooksFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },

    // ===== RETURN BOOK =====
    returnBookRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    returnBookSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
    },
    returnBookFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },

    // ===== RENEW BOOK =====
    renewBookRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    renewBookSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
    },
    renewBookFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },

    // ===== RESET =====
    resetBorrowSlice(state) {
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
});

export const fetchUserBorrowedBooks = () => async (dispatch) => {
  dispatch(borrowSlice.actions.fetchUserBorrowedBooksRequest());

  await axios
    .get("http://localhost:4000/api/v1/borrow/my-borrowed-books", {
      withCredentials: true,
    })
    .then((res) => {
      dispatch(
        borrowSlice.actions.fetchUserBorrowedBooksSuccess(
          res.data.borrowedBooks
        )
      );
    })
    .catch((err) => {
      dispatch(
        borrowSlice.actions.fetchUserBorrowedBooksFailed(
          err.response.data.message
        )
      );
    });
};

export const fetchAllBorrowedBooks = () => async (dispatch) => {
  dispatch(borrowSlice.actions.fetchAllBorrowedBooksRequest());

  await axios
    .get(
      "http://localhost:4000/api/v1/borrow/borrowed-books-by-users",
      {
        withCredentials: true,
      }
    )
    .then((res) => {
      dispatch(
        borrowSlice.actions.fetchAllBorrowedBooksSuccess(
          res.data.borrowedBooks
        )
      );
    })
    .catch((err) => {
      dispatch(
        borrowSlice.actions.fetchAllBorrowedBooksFailed(
          err.response.data.message
        )
      );
    });
};

// ===== RECORD BORROW BOOK - CẬP NHẬT ĐỂ GỬI copyId =====
export const recordBorrowBook = (email, bookId, copyId) => async (dispatch) => {
  dispatch(borrowSlice.actions.recordBookRequest());

  await axios
    .post(
      `http://localhost:4000/api/v1/borrow/record-borrow-book/${bookId}`,
      { email, copyId }, // ✅ Gửi cả copyId
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => {
      dispatch(borrowSlice.actions.recordBookSuccess(res.data.message));

      // ✅ Popup thông báo thành công với mã BookCopy
      const copyCode = res.data.bookCopyCode || "N/A";
      toast.success(
        `${res.data.message || "Ghi nhận mượn sách thành công!"}\nMã cuốn: ${copyCode}`,
        { toastId: `record-borrow-${bookId}-${copyId}` }
      );

      dispatch(toggleRecordBookPopup());
    })
    .catch((err) => {
      const msg = err?.response?.data?.message || "Ghi nhận mượn sách thất bại!";
      dispatch(borrowSlice.actions.recordBookFailed(msg));

      // ✅ Popup thông báo lỗi
      toast.error(msg, { toastId: `record-borrow-error-${bookId}` });
    });
};

// ===== RETURN BOOK =====
export const returnBook = (email, id) => async (dispatch) => {
  dispatch(borrowSlice.actions.returnBookRequest());

  await axios
    .put(
      `http://localhost:4000/api/v1/borrow/return-borrowed-book/${id}`,
      { email },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => {
      dispatch(
        borrowSlice.actions.returnBookSuccess(res.data.message)
      );
    })
    .catch((err) => {
      dispatch(
        borrowSlice.actions.returnBookFailed(
          err.response.data.message
        )
      );
    });
};

// ===== RENEW BOOK =====
export const renewBorrowedBook = (borrowId) => async (dispatch) => {
  dispatch(borrowSlice.actions.renewBookRequest());

  await axios
    .post(`http://localhost:4000/api/v1/borrow/renew/${borrowId}`, {}, {
      withCredentials: true,
    })
    .then((res) => {
      dispatch(borrowSlice.actions.renewBookSuccess(res.data.message));
    })
    .catch((err) => {
      dispatch(
        borrowSlice.actions.renewBookFailed(
          err.response?.data?.message || err.message
        )
      );
    });
};

export const resetBorrowSlice = () => (dispatch) => {
  dispatch(borrowSlice.actions.resetBorrowSlice());
};

export default borrowSlice.reducer;