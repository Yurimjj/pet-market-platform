// client/src/components/menus/BasicMenu.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import useCustomLogin from "../../hooks/useCustomLogin";
import useWebSocket from "../../hooks/useWebSocket";
import { getMyRooms } from "../../api/chatApi";

const BasicMenu = () => {
  const loginState = useSelector((state) => state.LoginSlice);
  const { doLogout, moveToPath } = useCustomLogin();

  // 메뉴/채팅에서 동일하게 쓸 "내 키"
  const myId = loginState.userId ?? loginState.email ?? null;

  // 실시간 새 채팅 알림
  const { hasNewChat, clearChatBadge } = useWebSocket(myId);

  // 오프라인(로그아웃 중) 미확인 배지
  const [hasOfflineUnread, setHasOfflineUnread] = useState(false);

  // 🔁 방 목록 기준으로 오프라인 미확인 재계산
  const recomputeOfflineUnread = useCallback(async () => {
    if (!myId) {
      setHasOfflineUnread(false);
      return;
    }
    try {
      const rooms = await getMyRooms(); // [{roomId, lastMessageAt, createdAt, ...}]
      let has = false;
      for (const r of rooms || []) {
        const lastAt = new Date(r.lastMessageAt || r.createdAt || 0).getTime();
        const seen = Number(
          localStorage.getItem(`chat:lastSeen:${myId}:${r.roomId}`) || 0
        );
        if (lastAt > seen) {
          has = true;
          break;
        }
      }
      setHasOfflineUnread(has);
    } catch {
      setHasOfflineUnread(false);
    }
  }, [myId]);

  // 최초/로그인 시 재계산
  useEffect(() => {
    recomputeOfflineUnread();
  }, [recomputeOfflineUnread]);

  // 👂 ChatRoom에서 발행하는 'chat:lastSeenUpdated' 이벤트 수신 → 재계산
  useEffect(() => {
    const handler = () => recomputeOfflineUnread();
    window.addEventListener("chat:lastSeenUpdated", handler);
    return () => window.removeEventListener("chat:lastSeenUpdated", handler);
  }, [recomputeOfflineUnread]);

  // 채팅 페이지로 들어가면 즉시 배지 끄기(UX용)
  const enterChatAndClear = () => {
    clearChatBadge();
    setHasOfflineUnread(false);
  };

  const showBadge = hasNewChat || hasOfflineUnread;

  const handleLogout = () => {
    doLogout();
    alert("로그아웃 되었습니다.");
    moveToPath("/");
  };

  // ====== 관리자 노출 조건 ======
  // 1) Redux에 roleNames가 있으면 우선 사용
  // 2) 없으면 JWT payload에서 roles/authorities/roleNames/scope를 파싱하여 판단
  const getRoles = () => {
    if (Array.isArray(loginState?.roleNames) && loginState.roleNames.length) {
      return loginState.roleNames;
    }
    try {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return [];
      const payload = JSON.parse(
        decodeURIComponent(
          escape(
            atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
          )
        )
      );
      const raw =
        payload.roles ||
        payload.roleNames ||
        payload.authorities ||
        payload.scope ||
        [];
      if (Array.isArray(raw)) return raw;
      if (typeof raw === "string") return raw.split(/[,\s]+/).filter(Boolean);
      return [];
    } catch {
      return [];
    }
  };

  const roles = getRoles().map(String);
  const isAdmin = roles.some((r) =>
    ["ADMIN", "ROLE_ADMIN", "MANAGER", "ROLE_MANAGER"].includes(r)
  );
  // ============================

  return (
    <nav className="navbar bg-neutral border-b border-base-300/60 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto">
        <div className="flex items-center w-full gap-2">
          {/* 모바일 햄버거 */}
          <div className="dropdown lg:hidden shrink-0 relative">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost text-xl font-bold shrink-0 hover:bg-base-200 hover:text-base-content/90 relative"
              aria-label="menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {showBadge && (
                <span className="absolute -top-0.5 -right-0.5 inline-block w-2.5 h-2.5 bg-red-500 rounded-full" />
              )}
            </div>
            <div
              tabIndex={0}
              className="dropdown-content mt-3 w-56 rounded-box bg-base-100 p-2 shadow"
            >
              <ul className="menu menu-sm menu-vertical">
                <li>
                  <Link to="/product/list">상품</Link>
                </li>
                <li>
                  <Link to="/board/list">게시판</Link>
                </li>
                <li>
                  <Link to="/notice/list">공지사항</Link>
                </li>

                {/* 📌 관리자 전용 메뉴 (모바일) */}
                {isAdmin && (
                  <li>
                    <Link to="/admin/dashboard">관리자</Link>
                  </li>
                )}

                {loginState.email && (
                  <>
                    <li>
                      <Link
                        to="/chat/list"
                        onClick={enterChatAndClear}
                        className="inline-flex items-center"
                      >
                        내 채팅
                        {showBadge && (
                          <span className="ml-1 inline-block w-2.5 h-2.5 bg-red-500 rounded-full" />
                        )}
                      </Link>
                    </li>
                    <li>
                      <Link to="/user/profile">내 정보</Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* 브랜드 */}
          <Link
            to="/"
            className="btn btn-ghost text-xl font-bold shrink-0 hover:bg-base-200 hover:text-base-content/90"
          >
            PetCycle
          </Link>

          {/* 데스크톱 메뉴 */}
          <div className="hidden lg:block flex-1 min-w-0 overflow-x-auto">
            <ul className="menu menu-horizontal px-2 gap-6 text-lg whitespace-nowrap">
              <li>
                <Link to="/product/list">상품</Link>
              </li>
              <li>
                <Link to="/board/list">게시판</Link>
              </li>
              <li>
                <Link to="/notice/list">공지사항</Link>
              </li>

              {/* 📌 관리자 전용 메뉴 (데스크톱) */}
              {isAdmin && (
                <li>
                  <Link to="/admin/dashboard">관리자</Link>
                </li>
              )}

              {loginState.email && (
                <>
                  <li className="relative">
                    <Link to="/chat/list" onClick={enterChatAndClear}>
                      내 채팅
                      {showBadge && (
                        <span className="absolute -top-1 -right-3 inline-block w-2.5 h-2.5 bg-red-500 rounded-full" />
                      )}
                    </Link>
                  </li>
                  <li>
                    <Link to="/user/profile">내 정보</Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* 로그인/로그아웃 */}
          <div className="ml-auto">
            {!loginState.email ? (
              <Link to="/user/login" className="btn btn-info">
                Login
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-info"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BasicMenu;
