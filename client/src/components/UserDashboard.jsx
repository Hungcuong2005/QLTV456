import React, { useEffect, useState } from "react";
import logo_with_title from "../assets/logo-with-title-black.png";
import returnIcon from "../assets/redo.png";
import browseIcon from "../assets/pointing.png";
import bookIcon from "../assets/book-square.png";
import { Pie } from "react-chartjs-2";
import { useSelector } from "react-redux";
import Header from "../layout/Header";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from "chart.js";
import logo from "../assets/logo4.png";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
);

const UserDashboard = ({setSelectedComponent}) => {
  const { userBorrowedBooks } = useSelector((state) => state.borrow);

  const [totalBorrowedBooks, setTotalBorrowedBooks] = useState(0);
  const [totalReturnedBooks, setTotalReturnedBooks] = useState(0);

  useEffect(() => {
    const borrowing = userBorrowedBooks.filter((b) => b.returned === false);
    const returned = userBorrowedBooks.filter((b) => b.returned === true);

    setTotalBorrowedBooks(borrowing.length);
    setTotalReturnedBooks(returned.length);
  }, [userBorrowedBooks]);

  // ChartJS dùng màu hex trực tiếp
  const data = {
    labels: ["Sách đang mượn", "Sách đã trả"],
    datasets: [
      {
        data: [totalBorrowedBooks, totalReturnedBooks],
        backgroundColor: ["#C41526", "#7A0E18"],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <>
      <main className="relative flex-1 p-6 pt-28">
        <Header />

        <div className="flex flex-col-reverse xl:flex-row">
          {/* BÊN TRÁI */}
          <div className="flex flex-[4] flex-col gap-7 lg:gap-7 lg:py-5 justify-between xl:min-h-[85.5vh]">
            <div className="flex flex-col gap-7 flex-[4]">
              {/* 2 HÀNG CARD - GRID CĂN CHUẨN */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                {/* Sách đang mượn */}
                <button
                  type="button"
                  onClick={() => setSelectedComponent({ key: "My Borrowed Books", filter: "nonReturned" })}
                  className="h-[120px] w-full flex items-center gap-3 bg-white p-5 rounded-lg transition hover:shadow-inner duration-300 border-l-4 border-[#C41526] text-left"
                >
                  <span className="w-[2px] bg-[#C41526] h-20"></span>
                  <span className="bg-[#FDE8EA] h-20 min-w-20 flex justify-center items-center rounded-lg">
                    <img src={bookIcon} alt="book-icon" className="w-8 h-8" />
                  </span>
                  <p className="text-lg xl:text-xl font-semibold text-[#C41526]">
                    Danh sách sách đang mượn
                  </p>
                </button>

                {/* Sách đã trả */}
                <button
                  type="button"
                  onClick={() => setSelectedComponent({ key: "My Borrowed Books", filter: "returned" })}
                  className="h-[120px] w-full flex items-center gap-3 bg-white p-5 rounded-lg transition hover:shadow-inner duration-300 border-l-4 border-[#C41526] text-left"
                >
                  <span className="w-[2px] bg-[#C41526] h-20"></span>
                  <span className="bg-[#FDE8EA] h-20 min-w-20 flex justify-center items-center rounded-lg">
                    <img src={returnIcon} alt="return-icon" className="w-8 h-8" />
                  </span>
                  <p className="text-lg xl:text-xl font-semibold text-[#C41526]">
                    Danh sách sách đã trả
                  </p>
                </button>

                {/* Khám phá kho sách (chỉ chiếm 1/2) */}
                <button
                  type="button"
                  onClick={() => setSelectedComponent("Books")}
                  className="h-[120px] w-full flex items-center gap-3 bg-white p-5 rounded-lg transition hover:shadow-inner duration-300 border-l-4 border-[#C41526] text-left"
                >
                  <span className="w-[2px] bg-[#C41526] h-20"></span>
                  <span className="bg-[#FDE8EA] h-20 min-w-20 flex justify-center items-center rounded-lg">
                    <img src={browseIcon} alt="browse-icon" className="w-8 h-8" />
                  </span>
                  <p className="text-lg xl:text-xl font-semibold text-[#C41526]">
                    Khám phá kho sách thư viện
                  </p>
                </button>

                {/* Ô trống để canh đúng cột phải */}
                <div className="hidden lg:block" />
              </div>
            </div>

            {/* Quote */}
            <div className="bg-white p-7 text-lg sm:text-xl xl:text-3xl 2xl:text-4xl min-h-52 font-semibold relative flex-[3] flex justify-center items-center rounded-2xl border border-[#FDE8EA]">
              <h4 className="overflow-y-hidden text-[#C41526] text-center">
                {/* “Đọc sách mỗi ngày là cách đơn giản nhất để nuôi dưỡng tri thức
                và phát triển bản thân.” */}
              </h4>
              <p className="text-gray-700 text-sm sm:text-lg absolute right-[35px] sm:right-[78px] bottom-[10px]">
                PHC - 20235286
              </p>
            </div>
          </div>


          {/* BÊN PHẢI */}
          <div className="flex-[2] flex-col gap-7 lg:flex-row flex lg:items-center xl:flex-col justify-between xl:gap-20 py-5">
            <div className="xl:flex-[4] flex items-end w-full content-center">
              <Pie
                data={data}
                options={{ cutout: 0 }}
                className="mx-auto lg:mx-0 w-full h-auto"
              />
            </div>

            <div className="flex items-center p-8 w-full sm:w-[400px] xl:w-fit mr-5 xl:p-3 2xl:p-6 gap-5 h-fit xl:min-h-[150px] bg-white xl:flex-1 rounded-lg border-l-4 border-[#C41526]">
              <img src={logo} alt="logo" className="w-auto h-15 2xl:h-28" />
              <span className="w-[2px] bg-[#C41526] h-full"></span>
              <div className="flex flex-col gap-5">
                <p className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#C41526]"></span>
                  <span>Sách đang mượn</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#7A0E18]"></span>
                  <span>Sách đã trả</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );


};

export default UserDashboard;
