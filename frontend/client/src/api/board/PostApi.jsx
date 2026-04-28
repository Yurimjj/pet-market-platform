import { API_SERVER_HOST } from "../UserApi";
import jwtAxios from "../../util/JWTUtil";
import axios from "axios";

const host = `${API_SERVER_HOST}/api/board`;

// 특정 파일 조회(jwt 필요x)
export const getFile = (fileName) => {
  const safe = encodeURIComponent(fileName);
  return `${host}/files/view/${safe}`;
};

// 게시글 목록 조회(jwt 필요x)
export const getPostList = async (pageParam) => {
  const { page, size, type, keyword } = pageParam;

  const res = await axios.get(`${host}/list`, {
    params: { page, size, type, keyword },
  });
  return res.data;
};

// 특정 게시글 조회(jwt 필요x)
export const getPostOne = async (postId) => {
  const res = await axios.get(`${host}/${postId}`);
  return res.data;
};

// 게시글 등록(jwt 필요)
export const registerPost = async (postData) => {
  const formData = new FormData();
  formData.append(
    `boardPostDTO`,
    new Blob([JSON.stringify(postData.boardPostDTO)], {
      type: "application/json",
    }),
  );

  if (postData.files && postData.files.length > 0) {
    postData.files.forEach((file) => {
      formData.append("files", file);
    });
  }
  const res = await jwtAxios.post(`${host}/`, formData);
  return res.data;
};

// 게시글 수정(jwt 필요)
export const modifyPost = async (postId, postData) => {
  const formData = new FormData();
  formData.append(
    "boardPostDTO",
    new Blob([JSON.stringify(postData.boardPostDTO)], {
      type: "application/json",
    }),
  );
  if (postData.files && postData.files.length > 0) {
    postData.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  const res = await jwtAxios.put(`${host}/${postId}`, formData);
  return res.data;
};

// 게시글 삭제(jwt 필요)
export const removePost = async (postId) => {
  const res = await jwtAxios.delete(`${host}/${postId}`);
  return res.data;
};

// 첨부파일 개별 삭제(jwt 필요)
export const removeAttachment = async (postId, attachmentId) => {
  const res = await jwtAxios.delete(`${host}/files/${postId}/${attachmentId}`);
  return res.data;
};
