import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginPostAsync } from "../../slices/LoginSlice";
import { useNavigate } from "react-router-dom";
import useCustomLogin from "../../hooks/useCustomLogin";
import { setCookie } from "../../util/CookieUtil";
import KakaoLoginComponent from "./KakaoLoginComponent.jsx";

const initState = {
  email: "",
  password: "",
};

const LoginComponent = () => {
  const [loginParam, setLoginParam] = useState({ ...initState });
  const { moveToPath } = useCustomLogin();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setLoginParam({
      ...loginParam,
      [e.target.name]: e.target.value,
    });
  };

  const handleClickLogin = async () => {
    setMessage("");
    setIsLoading(true);

    try {
      const result = await dispatch(loginPostAsync(loginParam)).unwrap();

      if (result.error) {
        setMessage("로그인 실패: " + result.error);
      } else {
        setMessage("로그인 성공!");
        setCookie("user", JSON.stringify(result), 1);
        moveToPath("/");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "로그인 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickRegister = () => {
    navigate("/user/signup");
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-300/50 w-full max-w-md mx-auto p-4">
      <h3 className="card-title w-full justify-center text-xl lg:text-2xl text-secondary mb-4">
        로그인
      </h3>

      <div className="mb-4">
        <label htmlFor="email" className="block mb-1 font-medium">
          이메일
        </label>
        <input
          type="text"
          id="email"
          name="email"
          value={loginParam.email}
          onChange={handleChange}
          className="input input-bordered w-full
                     focus:outline-none focus:ring-2 focus:ring-secondary/40
                     focus:ring-offset-2 focus:ring-offset-base-100
                     focus:border-secondary
                     transition-[box-shadow,border-color] duration-150"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block mb-1 font-medium">
          비밀번호
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={loginParam.password}
          onChange={handleChange}
          className="input input-bordered w-full
                     focus:outline-none focus:ring-2 focus:ring-secondary/40
                     focus:ring-offset-2 focus:ring-offset-base-100
                     focus:border-secondary
                     transition-[box-shadow,border-color] duration-150"
        />
      </div>

      {message && (
        <div
          className={`mb-4 text-center font-medium ${
            message.startsWith("로그인 성공") ? "text-success" : "text-error"
          }`}
        >
          {message}
        </div>
      )}

      <button
        className={`btn w-full ${isLoading ? "btn-disabled" : "btn-secondary"}`}
        onClick={handleClickLogin}
        disabled={isLoading}
      >
        {isLoading ? "로그인 중..." : "로그인"}
      </button>

      <div className="mt-2">
        <KakaoLoginComponent />
      </div>

      <button
        className="btn btn-info w-full mt-2"
        onClick={handleClickRegister}
      >
        회원가입
      </button>
    </div>
  );
};

export default LoginComponent;
