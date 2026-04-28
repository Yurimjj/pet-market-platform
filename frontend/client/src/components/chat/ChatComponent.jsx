import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ChatRoom from "./ChatRoom";
import { getCookie } from "../../util/CookieUtil";
import {
  getNicknameByUserId,
  getOrCreateRoom,
  getRoomMessages,
  upsertRoomContext,
  getRoomContext,
} from "../../api/chatApi";

function parseJwt(token) {
  try {
    const base64 = token?.split(".")?.[1] || "";
    return JSON.parse(atob(base64)) || {};
  } catch {
    return {};
  }
}
function getAuthFromCookie() {
  const raw = getCookie("user");
  if (!raw) return { userId: "", nickname: "" };
  let obj = raw;
  try {
    if (typeof raw === "string") obj = JSON.parse(raw);
  } catch {}
  const payload = parseJwt(obj?.accessToken);
  const userId =
    obj?.userId ??
    obj?.id ??
    payload?.userId ??
    payload?.uid ??
    payload?.sub ??
    "";
  const nickname = obj?.nickname ?? payload?.nickname ?? "";
  return { userId: String(userId || ""), nickname: String(nickname || "") };
}

export default function ChatComponent() {
  const nav = useNavigate();
  const location = useLocation();
  const { search } = location;
  const pid = useMemo(
    () => new URLSearchParams(search).get("pid") || "",
    [search],
  ); // [ADD] pid 추출

  const peer = useMemo(
    () => new URLSearchParams(search).get("peer") || "",
    [search],
  );
  const peerNickFromQS = useMemo(
    () => new URLSearchParams(search).get("peerNick") || "",
    [search],
  );

  const reduxUserId = useSelector(
    (s) => s.login?.user?.userId ?? s.loginSlice?.user?.userId ?? null,
  );
  const reduxNickname = useSelector(
    (s) => s.login?.user?.nickname ?? s.loginSlice?.user?.nickname ?? null,
  );
  const cookieAuth = getAuthFromCookie();
  const meId = String(reduxUserId ?? cookieAuth.userId ?? "");
  const meNick = String(reduxNickname ?? cookieAuth.nickname ?? "");

  const [peerNickname, setPeerNickname] = useState(peerNickFromQS || "");
  const [roomId, setRoomId] = useState(null);
  const [initialMessages, setInitialMessages] = useState([]);
  const [ready, setReady] = useState(false);
  const [roomProductId, setRoomProductId] = useState(null); // [ADD] 서버에 저장된 방-상품 컨텍스트

  useEffect(() => {
    let alive = true;
    (async () => {
      setReady(false);
      if (!peer || !meId) return;

      if (String(meId) === String(peer)) {
        alert("본인과는 채팅할 수 없어요.");
        nav(-1);
        return;
      }

      if (!peerNickFromQS) {
        try {
          const nick = await getNicknameByUserId(peer);
          if (alive) setPeerNickname(nick || "");
        } catch {
          if (alive) setPeerNickname("");
        }
      }

      try {
        const room = await getOrCreateRoom(Number(peer));
        if (!alive) return;
        const rid = room?.roomId ?? null;
        setRoomId(rid);

        if (rid && pid) {
          try {
            await upsertRoomContext(rid, { productId: Number(pid) });
          } catch (e) {
            console.warn("[chat] upsertRoomContext 실패:", e);
          }
        }

        if (rid) {
          try {
            const ctx = await getRoomContext(rid);
            if (alive) setRoomProductId(ctx?.productId ?? null);
          } catch (e) {
            if (alive) setRoomProductId(null);
          }
        }

        let history = [];
        if (rid) {
          const list = await getRoomMessages(rid); // 서버: 최신순
          if (!alive) return;
          const asc = Array.isArray(list) ? [...list].reverse() : [];
          history = asc.map((m) => ({
            type: "CHAT",
            sender: String(m.senderId),
            receiver: String(m.roomId),
            content: m.content,
            timestamp: m.createdAt,
            senderNickname: m.senderNickname || "",
          }));
        }
        if (alive) setInitialMessages(history);
      } catch {
        alert("채팅방 생성/조회에 실패했습니다.");
        return;
      }

      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, [peer, meId, nav, peerNickFromQS, pid]);

  const handleLeave = () => {
    const from = location.state?.from;
    if (from) {
      nav(from, { replace: true });
      return;
    }
    if (window.history.length > 1) {
      nav(-1);
      return;
    }
    nav("/chat/list", { replace: true });
  };

  if (!peer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
        상대 정보가 없습니다.{" "}
        <span className="ml-2 text-gray-400">/chat?peer=상대ID</span>
      </div>
    );
  }
  if (!meId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
        로그인 후 이용해주세요.
      </div>
    );
  }
  if (!ready) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
        채팅방 준비 중…
      </div>
    );
  }

  return (
    <ChatRoom
      username={meId}
      usernameNickname={meNick}
      peer={peer}
      peerNickname={peerNickname}
      roomId={roomId}
      initialMessages={initialMessages}
      onLeave={handleLeave}
    />
  );
}
