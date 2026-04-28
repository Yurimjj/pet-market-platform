// src/api/board/CommentApi.js
import axios from "axios";
import jwtAxios from "../../util/JWTUtil";
import { API_SERVER_HOST } from "../UserApi";

const host = `${API_SERVER_HOST}/api/comment`;

export const getCommentsPage = async (postId, page = 0, size = 10) => {
  const res = await axios.get(`${host}/board/${postId}`, {
    params: { page, size },
  });
  return res.data; // res.data.parentComments 로 리스트 접근
};

export const getCommentsCount = async (postId) => {
  const res = await axios.get(`${host}/board/${postId}/count`);
  return res.data?.totalComments ?? 0;
};

export const addComment = async ({ postId, content, parentId = null }) => {
  const payload = { postId, content, parentId };
  const res = await jwtAxios.post(`${host}/`, payload);
  return res.data;
};

export const modifyComment = async (commentId, content) => {
  const res = await jwtAxios.put(`${host}/${commentId}`, { content });
  return res.data;
};

export const removeComment = async (commentId) => {
  const res = await jwtAxios.delete(`${host}/${commentId}`);
  return res.data;
};
