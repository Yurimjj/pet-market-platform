// src/pages/admin/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import jwtAxios from "../../util/JWTUtil"; // ✅ axios → jwtAxios (baseURL=/api, JWT 자동첨부)
import { subDays } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SignUpChart from "./SignUpChart";

const DashboardPage = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [startDate, setStartDate] = useState(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState(new Date());
  const [targetUserId, setTargetUserId] = useState("");
  const [filterType, setFilterType] = useState("daily");
  const [apiError, setApiError] = useState(false);

  // 총 가입자 수 조회
  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const res = await jwtAxios.get("/admin/dashboard/total-users");

        // HTML 응답 방어
        if (
          typeof res.data === "string" &&
          res.data.includes("<!DOCTYPE html>")
        ) {
          console.warn(
            "API 응답이 HTML입니다. API 서버가 실행되지 않았을 수 있습니다."
          );
          setTotalUsers(0);
          setApiError(true);
          return;
        }

        if (typeof res.data === "number") setTotalUsers(res.data);
        else if (res.data && typeof res.data.count === "number")
          setTotalUsers(res.data.count);
        else {
          console.warn("예상하지 못한 API 응답 형태:", res.data);
          setTotalUsers(0);
        }
      } catch (err) {
        console.error("총 가입자 수 조회 실패:", err);
        setTotalUsers(0);
        setApiError(true);
      }
    };

    fetchTotalUsers();
  }, []);

  // 기간 빠른 선택
  const handleDateFilter = (days) => {
    const start = subDays(new Date(), days);
    const end = new Date();
    setStartDate(start);
    setEndDate(end);
  };

  // DatePicker 변경
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  // 사용자 정지
  const handleSuspend = async (userId, days) => {
    const id = String(userId || "").trim();
    if (!id) return alert("사용자 ID를 입력하세요.");
    try {
      await jwtAxios.post(`/admin/users/${id}/suspend`, null, {
        params: { days },
      });
      alert(`${days === 0 ? "영구 정지" : `${days}일 정지`} 완료`);
    } catch (error) {
      console.error("정지 처리 실패:", error);
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 sm:p-6 space-y-6">
      {/* 총 가입자 수 카드 */}
      <div className="card bg-base-100 shadow-sm border border-base-300/50">
        <div className="card-body p-5 sm:p-6">
          <h2 className="card-title text-xl lg:text-2xl text-secondary">
            총 가입자 수
          </h2>
          <p className="text-3xl font-extrabold text-primary mt-2">
            {typeof totalUsers === "number" ? totalUsers.toLocaleString() : "0"}{" "}
            명
          </p>
          {apiError && (
            <div className="alert alert-warning mt-3 text-sm">
              <span>
                ⚠️ API 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지
                확인해주세요.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 기간 필터 및 차트 */}
      <div className="card bg-base-100 shadow-sm border border-base-300/50">
        <div className="card-body p-5 sm:p-6">
          <h2 className="card-title text-xl lg:text-2xl text-secondary">
            가입자 현황
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              className="btn btn-success btn-sm"
              onClick={() => handleDateFilter(0)}
            >
              오늘
            </button>
            <button
              className="btn btn-success btn-sm"
              onClick={() => handleDateFilter(7)}
            >
              최근 7일
            </button>
            <button
              className="btn btn-success btn-sm"
              onClick={() => handleDateFilter(30)}
            >
              최근 30일
            </button>

            {/* 필터 기준 */}
            <select
              className="select select-bordered select-sm ml-1"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="daily">일간</option>
              <option value="weekly">주간</option>
              <option value="monthly">월간</option>
            </select>
          </div>

          {/* DatePicker (inline) */}
          <div className="mt-3 border border-base-300/50 rounded-box p-2 overflow-auto">
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
              inline
            />
          </div>

          {/* ✅ 차트 데이터는 SignUpChart 내부에서만 fetch */}
          <div className="mt-5">
            <SignUpChart
              startDate={startDate}
              endDate={endDate}
              filterType={filterType}
            />
          </div>
        </div>
      </div>

      {/* 사용자 제재 */}
      <div className="card bg-base-100 shadow-sm border border-base-300/50">
        <div className="card-body p-5 sm:p-6">
          <h2 className="card-title text-xl lg:text-2xl text-secondary">
            사용자 제재
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="사용자 ID 입력"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="input input-bordered input-sm w-full sm:w-64"
            />
            <button
              className="btn btn-warning btn-sm"
              onClick={() => handleSuspend(targetUserId, 3)}
            >
              3일 정지
            </button>
            <button
              className="btn btn-warning btn-sm"
              onClick={() => handleSuspend(targetUserId, 7)}
            >
              7일 정지
            </button>
            <button
              className="btn btn-error btn-sm"
              onClick={() => handleSuspend(targetUserId, 0)}
            >
              영구정지
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
