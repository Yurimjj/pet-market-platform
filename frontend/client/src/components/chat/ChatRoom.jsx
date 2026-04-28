import React, { useEffect, useMemo, useRef, useState } from "react";
import useWebSocket from "../../hooks/useWebSocket";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { getRoomContext } from "../../api/chatApi"; // [ADD]
import { getProduct } from "../../api/productApi"; // [ADD]
import { registerTransaction } from "../../api/orderApi"; // [ADD]

export default function ChatRoom({
  username,
  usernameNickname,
  peer,
  peerNickname,
  roomId,
  initialMessages = [],
  onLeave,
  roomProductId,
}) {
  const {
    connected,
    onlineUsers,
    dmThreads,
    sendDirectMessage,
    disconnect,
    seedThread,
  } = useWebSocket(username, {
    myNickname: usernameNickname,
    peerNickname,
    activePeer: peer,
  });

  const [messages, setMessages] = useState(initialMessages);
  const [ctxPid, setCtxPid] = useState(null);
  const [product, setProduct] = useState(null);

  const liveLenRef = useRef(0);

  useEffect(() => {
    setMessages(initialMessages || []);

    liveLenRef.current = 0;
  }, [initialMessages, peer]);

  const stampSeen = () => {
    if (!username || !roomId) return;
    localStorage.setItem(
      `chat:lastSeen:${username}:${roomId}`,
      String(Date.now()),
    );
    window.dispatchEvent(new Event("chat:lastSeenUpdated"));
  };

  useEffect(() => {
    setMessages(initialMessages || []);

    liveLenRef.current = 0;
  }, [initialMessages, peer]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!roomId) return;
      try {
        if (roomProductId) {
          if (alive) setCtxPid(Number(roomProductId));
        } else {
          const ctx = await getRoomContext(roomId);
          if (alive) setCtxPid(ctx?.productId ? Number(ctx.productId) : null);
        }
      } catch {
        if (alive) setCtxPid(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [roomId, roomProductId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!ctxPid) {
        if (alive) setProduct(null);
        return;
      }
      try {
        const p = await getProduct(ctxPid);
        if (alive) setProduct(p);
      } catch {
        if (alive) setProduct(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [ctxPid]);

  const liveThread = useMemo(
    () => (peer ? dmThreads[peer] || [] : []),
    [dmThreads, peer],
  );

  useEffect(() => {
    if (!peer) return;
    const prevLen = liveLenRef.current;
    const curLen = Array.isArray(liveThread) ? liveThread.length : 0;
    if (curLen > prevLen) {
      const added = liveThread.slice(prevLen);
      setMessages((prev) => [...prev, ...added]);
      liveLenRef.current = curLen;
    }
  }, [liveThread, peer]);

  useEffect(() => {
    stampSeen();

    return () => stampSeen();
  }, [username, roomId]);

  useEffect(() => {
    if (messages.length) stampSeen();
  }, [messages.length]);

  const isPeerOnline = peer && onlineUsers.includes(peer);

  const resolveName = (userId) => {
    if (String(userId) === String(username)) return usernameNickname || userId;
    if (String(userId) === String(peer)) return peerNickname || userId;
    return userId;
  };

  // [ADD] 현재 로그인 사용자가 이 상품의 판매자인가?
  const isSeller = useMemo(() => {
    const sellerId = Number(product?.seller?.userId ?? product?.sellerId);
    return !!sellerId && Number(username) === sellerId;
  }, [username, product]);

  // [ADD] 예약 가능 상태인지(컨텍스트가 있고, 상품이 SELLING일 때만)
  const canReserve = useMemo(() => {
    const st = (product?.status || "").toUpperCase();
    return !!ctxPid && st === "SELLING";
  }, [ctxPid, product]);

  // [ADD] 예약자로 지정 핸들러(= 거래 생성 + 상품 상태 RESERVED)
  const handleReserveBuyer = async () => {
    if (!ctxPid) return;
    if (!confirm("이 채팅 상대를 예약자로 지정하고 거래를 생성할까요?")) return;
    try {
      await registerTransaction({
        productId: Number(ctxPid),
        finalPrice: product?.price, // 협의가 없으면 현 가격 사용
        buyerId: Number(peer), // 이 방의 상대를 구매자로 지정
      });
      alert(
        "예약이 완료되었습니다. (거래가 생성되고 상품 상태가 '예약'으로 변경)",
      );
      // 제품 상태 갱신
      const fresh = await getProduct(Number(ctxPid));
      setProduct(fresh);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "예약 처리 실패";
      alert(msg);
    }
  };

  const handleLeave = () => {
    stampSeen();
    disconnect();
    onLeave && onLeave();
  };

  return (
    <div className="flex h-[100dvh] bg-base-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더(고정) */}
        <div className="p-4 bg-base-300 border-b border-base-300/60 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-secondary">1:1 채팅</h1>
            <p className="text-sm text-base-content/70">
              상대:{" "}
              <span className="font-medium text-base-content">
                {peerNickname || `사용자 ${peer}`}
              </span>
              <span className="ml-2 align-middle">
                <span
                  className={`badge badge-sm ${
                    isPeerOnline ? "badge-secondary" : "badge-accent"
                  }`}
                >
                  {isPeerOnline ? "온라인" : "오프라인"}
                </span>
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* [ADD] 예약자로 지정 (판매자이고, 컨텍스트+상태 요건 충족 시에만 노출) */}
            {isSeller && canReserve && (
              <button
                onClick={handleReserveBuyer}
                className={`btn btn-xs rounded-full normal-case ${
                  ctxPid ? "btn-neutral" : "btn-disabled"
                } transition-all`}
              >
                예약자로 지정
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-secondary text-secondary-content flex items-center justify-center font-bold">
              {(usernameNickname || username)?.charAt(0)?.toUpperCase?.()}
            </div>
            <div className="text-sm text-base-content">
              {usernameNickname || username}
            </div>

            <button
              onClick={handleLeave}
              className="btn btn-error btn-sm"
              title="채팅방 나가기"
              type="button"
            >
              나가기
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <MessageList
            messages={messages}
            currentUser={username}
            nameResolver={resolveName}
          />
        </div>

        {/* 입력(하단 고정) */}
        <MessageInput
          onSendMessage={(text) => sendDirectMessage(peer, text)}
          disabled={!connected || !peer}
        />
      </div>
    </div>
  );
}
