import jwtAxios from "../util/JWTUtil";

export async function getOrCreateRoom(peerId) {
  const { data } = await jwtAxios.post("/chat/rooms", { peerId });
  return data;
}

// 내가 참여한 방 목록
export async function getMyRooms() {
  const { data } = await jwtAxios.get("/chat/rooms");
  return data;
}

// 특정 방의 과거 메시지
export async function getRoomMessages(roomId) {
  const { data } = await jwtAxios.get(`/chat/rooms/${roomId}/messages`);
  return data;
}

//내 화면에서만 방 삭제(숨기기)
export async function deleteRoomForMe(roomId) {
  await jwtAxios.delete(`/chat/rooms/${roomId}`);
  return true;
}

// 단건 닉네임 조회 (목록/헤더 표시용)
export async function getNicknameByUserId(userId) {
  const { data } = await jwtAxios.get(`/chat/users/${userId}/nickname`);
  return data?.nickname || "";
}

export async function upsertRoomContext(roomId, { productId }) {
  const { data } = await jwtAxios.post(`/chat/rooms/${roomId}/context`, {
    productId,
  });
  return data; // { roomId, productId }
}

export async function getRoomContext(roomId) {
  const { data } = await jwtAxios.get(`/chat/rooms/${roomId}/context`);
  return data; // { roomId, productId }
}
