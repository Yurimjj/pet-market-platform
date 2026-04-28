import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { LoginPost } from "../api/UserApi";
import { getCookie, removeCookie, setCookie } from "../util/CookieUtil";
import React from "react";

const initState = {
  email: "",
};

// 쿠키에서 로그인 정보 로딩
const loadUserCookie = () => {
  const userInfo = getCookie("user");

  // 닉네임 처리
  if (userInfo && userInfo.nickname) {
    userInfo.nickname = decodeURIComponent(userInfo.nickname);
  }

  return userInfo;
};

export const loginPostAsync = createAsyncThunk("loginPostAsync", (param) => {
  return LoginPost(param);
});

const LoginSlice = createSlice({
  name: "LoginSlice",
  initialState: loadUserCookie() || initState,
  reducers: {
    login: (state, action) => {
      console.log("login...");

      const data = action.payload;

      return { email: data.email };
    },
    logout: (state, action) => {
      console.log("logout...");
      removeCookie("user");
      return { ...initState };
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginPostAsync.fulfilled, (state, action) => {
        console.log("fullfilled");

        const payload = action.payload;

        if (!payload.error) {
          setCookie("user", JSON.stringify(payload), 1); // 1일
        }

        return payload;
      })
      .addCase(loginPostAsync.pending, (state, action) => {
        console.log("pending");
      })
      .addCase(loginPostAsync.rejected, (state, action) => {
        console.log("rejected");
      });
  },
});

export const { login, logout } = LoginSlice.actions;
export default LoginSlice.reducer;
