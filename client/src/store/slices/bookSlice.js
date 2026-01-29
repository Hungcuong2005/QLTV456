import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toggleAddBookPopup } from "./popUpSlice";
import { toast } from "react-toastify";

const API_BASE = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:4000";
const BOOK_API = `${API_BASE}/api/v1/book`;

const bookSlice = createSlice({
  name: "book",
  initialState: {
    loading: false,
    error: null,
    message: null,
    books: [],
    totalBooks: 0,
    page: 1,
    limit: 0,
    totalPages: 1,
  },
  reducers: {
    fetchBooksRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    fetchBooksSuccess(state, action) {
      state.loading = false;
      state.books = action.payload.books;
      state.totalBooks = action.payload.totalBooks;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.totalPages = action.payload.totalPages;
      state.message = null;
    },
    fetchBooksFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },

    addBookRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    addBookSuccess(state, action) {
      state.loading = false;
      state.message = action.payload?.message || null;

      const newBook = action.payload?.book;
      if (!newBook) return;

      const existingIndex = state.books.findIndex((book) => book._id === newBook._id);
      if (existingIndex >= 0) {
        state.books[existingIndex] = {
          ...state.books[existingIndex],
          ...newBook,
        };
        return;
      }

      state.books = [newBook, ...state.books];
      state.totalBooks = (state.totalBooks || 0) + 1;
      if (state.limit) {
        state.totalPages = Math.max(Math.ceil(state.totalBooks / state.limit), 1);
      }
    },
    addBookFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    resetBookSlice(state) {
      state.error = null;
      state.message = null;
      state.loading = false;
    },
  },
});

export const fetchAllBooks = (params = {}) => async (dispatch) => {
  dispatch(bookSlice.actions.fetchBooksRequest());
  try {
    const res = await axios.get(`${BOOK_API}/all`, {
      withCredentials: true,
      params,
    });

    dispatch(
      bookSlice.actions.fetchBooksSuccess({
        books: res.data.books,
        totalBooks: res.data.totalBooks,
        page: res.data.page,
        limit: res.data.limit,
        totalPages: res.data.totalPages,
      })
    );
  } catch (err) {
    dispatch(
      bookSlice.actions.fetchBooksFailed(
        err?.response?.data?.message || "Lỗi tải danh sách sách."
      )
    );
  }
};

export const addBook = (data) => async (dispatch, getState) => {
  dispatch(bookSlice.actions.addBookRequest());

  try {
    const res = await axios.post(`${BOOK_API}/admin/add`, data, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });

    dispatch(
      bookSlice.actions.addBookSuccess({
        message: res.data.message,
        book: res.data.book,
      })
    );

    // ✅ PHÂN BIỆT TOAST: thêm đầu sách vs thêm bản sao
    const isAddCopiesOnly =
      data &&
      typeof data === "object" &&
      "isbn" in data &&
      "quantity" in data &&
      !("title" in data) &&
      !("author" in data) &&
      !("price" in data) &&
      !("description" in data);

    const toastMsg = isAddCopiesOnly
      ? "ISBN đã tồn tại → đã thêm bản sao (BookCopy) và cập nhật số lượng."
      : "Đã thêm đầu sách và tạo bản sao (BookCopy) thành công.";

    // ✅ CHỐNG TRÙNG TOAST
    const toastKey = isAddCopiesOnly
      ? `add-copies-${data?.isbn || "unknown"}`
      : `add-title-${data?.isbn || "unknown"}`;

    toast.success(toastMsg, { toastId: toastKey });

    const { popup } = getState();
    if (popup?.addBookPopup) {
      dispatch(toggleAddBookPopup());
    }
  } catch (err) {
    const msg = err?.response?.data?.message || "Thêm sách thất bại.";
    dispatch(bookSlice.actions.addBookFailed(msg));
    toast.error(msg, { toastId: `add-book-error-${data?.isbn || "unknown"}` });
  }
};

export const resetBookSlice = () => (dispatch) => {
  dispatch(bookSlice.actions.resetBookSlice());
};

export default bookSlice.reducer;
