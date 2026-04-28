import React from "react";
import { getKakaoLoginLink } from "../../api/kakaoApi";

export default function KakaoLoginComponent() {
  const link = getKakaoLoginLink();

  const handleClick = () => {
    window.location.href = link;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="btn btn-warning btn-block"
    >
      카카오로 로그인
    </button>
  );
}
