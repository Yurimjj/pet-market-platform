import axios from "axios";
import React from "react";
import jwtAxios from "../util/JWTUtil";

export const API_SERVER_HOST = "http://localhost:8080";

const host = `${API_SERVER_HOST}/api/auth`;

export const LoginPost = async (loginParam) => {
  console.log("로그인 요청 시작");
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const form = new FormData();
  form.append("email", loginParam.email);
  form.append("password", loginParam.password);

  const res = await axios.post(`${host}/login`, form, headers);

  return res.data;
};

// ✅ 프로필 수정: JSON 바디로 PUT /api/auth/modify
export const modifyMember = async (member) => {
  // member = { userId, email, phoneNumber, password, nickname, region }
  const res = await jwtAxios.put(`${host}/modify`, member);
  return res.data;
};

export const withdrawalMember = async (member) => {
  const res = await jwtAxios.delete(`${host}/withdrawal`, { data: member });
  return res.data;
};