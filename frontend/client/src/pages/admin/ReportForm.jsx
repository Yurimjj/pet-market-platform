import React, { useState } from "react";

const ReportForm = () => {
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");

  const handleReport = () => {
    fetch(
      `/api/reports?userId=${userId}&reason=${encodeURIComponent(reason)}`,
      {
        method: "POST",
      }
    ).then(() => alert("신고가 접수되었습니다."));
  };

  return (
    <div>
      <h3>사용자 신고하기</h3>
      <input
        type="text"
        placeholder="사용자 ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />

      <input
        type="text"
        placeholder="신고 사유"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button onClick={handleReport}>신고하기</button>
    </div>
  );
};

export default ReportForm;
