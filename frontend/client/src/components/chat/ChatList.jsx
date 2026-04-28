import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyRooms,
  getNicknameByUserId,
  deleteRoomForMe,
} from "../../api/chatApi";
import { useSelector } from "react-redux";

function formatKDatetime(isoLike) {
  if (!isoLike) return "";
  try {
    return new Date(isoLike).toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(isoLike);
  }
}

const toMs = (v) => {
  if (!v) return 0;
  if (typeof v === "number") return v;
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? Number(v) || 0 : t;
};

export default function ChatList() {
  const nav = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [nickMap, setNickMap] = useState({});
  const [loading, setLoading] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const loginState = useSelector((s) => s.LoginSlice);
  const myId = loginState?.userId ?? loginState?.email ?? null;

  const [version, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const list = await getMyRooms();
        if (!alive) return;
        setRooms(Array.isArray(list) ? list : []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const peerIds = Array.from(
        new Set(rooms.map((r) => r.peerId).filter(Boolean)),
      );
      const toFetch = peerIds.filter((id) => !nickMap[id]);
      if (toFetch.length === 0) return;

      const entries = await Promise.all(
        toFetch.map(async (id) => [id, await getNicknameByUserId(id)]),
      );
      if (!alive) return;
      setNickMap((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    })();
    return () => {
      alive = false;
    };
  }, [rooms, nickMap]);

  useEffect(() => {
    const onAny = () => bump();
    window.addEventListener("chat:lastSeenUpdated", onAny);
    window.addEventListener("chat:lastMsgUpdated", onAny);
    window.addEventListener("storage", onAny);
    return () => {
      window.removeEventListener("chat:lastSeenUpdated", onAny);
      window.removeEventListener("chat:lastMsgUpdated", onAny);
      window.removeEventListener("storage", onAny);
    };
  }, []);

  const isUnread = (room) => {
    if (!myId) return false;
    const last = toMs(room.lastMessageAt || room.createdAt);
    const seen = Number(
      localStorage.getItem(`chat:lastSeen:${myId}:${room.roomId}`) || 0,
    );
    return last > seen;
  };

  const sorted = useMemo(() => rooms, [rooms, version]);

  const onHide = async (e, roomId) => {
    e.stopPropagation(); // 부모 클릭(입장) 막기 ★중요
    if (!roomId) return;
    if (
      !confirm("이 대화방을 내 목록에서 숨길까요? (상대방에겐 그대로 보입니다)")
    )
      return;

    try {
      setDeletingId(roomId);
      await deleteRoomForMe(roomId);
      setRooms((prev) => prev.filter((r) => r.roomId !== roomId));
    } catch (err) {
      alert("숨기기에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <section>
        <div className="card bg-base-100 shadow-sm border border-base-300/50">
          <div className="card-body p-4">
            <div className="text-xl lg:text-2xl font-bold text-secondary mb-4">
              내 채팅
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-box" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!sorted.length) {
    return (
      <section>
        <div className="card bg-base-100 shadow-sm border border-base-300/50">
          <div className="card-body p-10 text-center">
            <div className="text-4xl mb-3">💬</div>
            <div className="text-base-content/70">아직 채팅방이 없습니다.</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="card bg-base-100 shadow-sm border border-base-300/50">
        <div className="card-body p-4">
          {/* 상단: 제목 (BoardListComponent 톤 유지) */}
          <div className="flex items-center gap-2 mb-4">
            <h2 className="card-title text-xl lg:text-2xl text-secondary">
              내 채팅
            </h2>
          </div>

          {/* 목록 컨테이너: BoardListComponent와 동일 톤 유지 */}
          <div className="card bg-base-100 border border-base-300/50 shadow-sm">
            <ul className="divide-y divide-base-300/50">
              {sorted.map((r) => {
                const {
                  roomId,
                  peerId,
                  lastMessage,
                  lastMessageAt,
                  createdAt,
                } = r;
                const displayName =
                  r.peerNickname || nickMap[peerId] || `사용자 ${peerId}`;
                const time = formatKDatetime(lastMessageAt || createdAt);
                const unread = isUnread(r);

                const qs =
                  `/chat?peer=${encodeURIComponent(String(peerId))}` +
                  (displayName
                    ? `&peerNick=${encodeURIComponent(displayName)}`
                    : "");

                return (
                  <li key={roomId} className="p-0">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => nav(qs)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") nav(qs);
                      }}
                      className="w-full text-left p-3 transition-colors duration-150 cursor-pointer
                                 hover:bg-base-content/5 focus-visible:bg-base-content/10"
                      title="대화방 입장"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary text-secondary-content flex items-center justify-center font-bold">
                          {(displayName || "").charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            {/* 제목 줄: 기존 톤 유지 + 안읽음이면 볼드 & 빨간 점만 추가 */}
                            <div
                              className={`truncate ${
                                unread
                                  ? "font-semibold text-base-content"
                                  : "font-semibold text-base-content"
                              }`}
                            >
                              {displayName}
                              {unread && (
                                <span
                                  className="ml-2 inline-block w-2.5 h-2.5 rounded-full bg-red-500 align-middle"
                                  aria-label="읽지 않은 새 메시지"
                                  title="읽지 않은 새 메시지"
                                />
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="text-xs text-base-content/60 flex-shrink-0">
                                {time}
                              </div>

                              <button
                                type="button"
                                onClick={(e) => onHide(e, roomId)}
                                disabled={deletingId === roomId}
                                className={`btn btn-outline btn-error btn-xs ${
                                  deletingId === roomId ? "btn-disabled" : ""
                                }`}
                                title="내 목록에서 숨기기"
                              >
                                {deletingId === roomId ? "처리 중…" : "삭제"}
                              </button>
                            </div>
                          </div>

                          <div className="text-sm text-base-content/70 truncate mt-0.5">
                            {lastMessage || "대화를 시작해 보세요!"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
