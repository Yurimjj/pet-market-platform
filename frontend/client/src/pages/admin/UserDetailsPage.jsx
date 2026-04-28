import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import jwtAxios from "../../util/JWTUtil";

const UserDetailsPage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const res = await jwtAxios.get(`/admin/users/${userId}`);
      setUser(res.data);
    } catch (err) {
      console.error("사용자 정보 조회 실패:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (days) => {
    if (!window.confirm(`${days}일 정지하시겠습니까?`)) return;
    try {
      await jwtAxios.post(`/admin/users/${userId}/suspend`, null, {
        params: { days },
      });
      alert(`${days}일 정지 처리되었습니다.`);
      fetchUserDetails();
    } catch (err) {
      console.error("정지 처리 실패:", err);
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (userId) fetchUserDetails();
  }, [userId]);

  if (loading) return <div>로딩 중...</div>;
  if (!user) return <div>사용자 정보를 불러올 수 없습니다.</div>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-3">사용자 상세</h1>
      <div className="border rounded p-4 mb-4">
        <p>
          <b>ID</b> : {user.userId ?? user.id}
        </p>
        <p>
          <b>이메일</b> : {user.email}
        </p>
        <p>
          <b>닉네임</b> : {user.nickname ?? user.username}
        </p>
        <p>
          <b>활성</b> : {String(user.isActive ?? user.active ?? true)}
        </p>
      </div>

      <h2 className="text-lg font-semibold mb-2">제재</h2>
      <div className="flex gap-2">
        <button className="btn btn-warning" onClick={() => handleSuspend(3)}>
          3일 정지
        </button>
        <button className="btn btn-warning" onClick={() => handleSuspend(7)}>
          7일 정지
        </button>
        <button className="btn btn-error" onClick={() => handleSuspend(0)}>
          영구 정지
        </button>
      </div>
    </div>
  );
};

export default UserDetailsPage;
