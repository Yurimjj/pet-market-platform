import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import jwtAxios from "../../util/JWTUtil";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: { position: "top" },
    title: { display: true, text: "가입자 수 추이" },
  },
};

const SignUpChart = ({ startDate, endDate, filterType = "daily" }) => {
  const [data, setData] = useState({
    labels: [],
    datasets: [{ label: "가입자 수", data: [] }],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChart = async () => {
      try {
        setLoading(true);
        const params = {
          startDate: (startDate ?? new Date(Date.now() - 7 * 864e5))
            .toISOString()
            .split("T")[0],
          endDate: (endDate ?? new Date()).toISOString().split("T")[0],
          filterType,
        };
        const res = await jwtAxios.get("/admin/dashboard/daily-signups", {
          params,
        });
        const rows = Array.isArray(res.data) ? res.data : [];
        setData({
          labels: rows.map((r) => r.date ?? r[0]),
          datasets: [
            { label: "일별 가입자 수", data: rows.map((r) => r.count ?? r[1]) },
          ],
        });
      } catch (err) {
        console.error("차트 데이터 실패:", err);
        setData({
          labels: [],
          datasets: [{ label: "일별 가입자 수", data: [] }],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchChart();
  }, [startDate, endDate, filterType]);

  if (loading) return <div>로딩 중...</div>;
  return <Line options={options} data={data} />;
};

export default SignUpChart;
