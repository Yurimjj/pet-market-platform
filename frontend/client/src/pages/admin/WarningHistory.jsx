import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jwtAxios from "../../util/JWTUtil";

const WarningHistory = () => {
  const { userId } = useParams();
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    jwtAxios
      .get(`/admin/warnings/${userId}`)
      .then((res) => setWarnings(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("경고 내역 로드 실패:", err);
        setWarnings([]);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">
        경고 내역 (userId: {userId})
      </h2>
      {warnings.length === 0 ? (
        <div>데이터가 없습니다.</div>
      ) : (
        <ul className="space-y-2">
          {warnings.map((w) => (
            <li key={w.logId} className="border rounded p-3">
              <div className="text-sm text-gray-500">
                {w.action} • {new Date(w.actionDate).toLocaleString()}
              </div>
              <div>{w.detail}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WarningHistory;
