import React from "react";
import { useState } from "react";
import {
  createSearchParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

const getNum = (param, defaultValue) => {
  if (!param) {
    return defaultValue;
  }
  return parseInt(param);
};

/**
 * 페이지 이동 및 URL 쿼리 파라미터 관리를 위한 커스텀 훅
 */
const useCustomMove = () => {
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState();

  const [queryParams] = useSearchParams();

  const page = getNum(queryParams.get("page"), 1);
  const size = getNum(queryParams.get("size"), 10);

  const type = queryParams.get("type") || "";
  const keyword = queryParams.get("keyword") || "";

  const queryDefault = createSearchParams({
    page,
    size,
    type,
    keyword,
  }).toString();

  const moveToList = (pageParam) => {
    let queryStr = "";

    if (pageParam) {
      const pageNum = getNum(pageParam.page, 1);
      const sizeNum = getNum(pageParam.size, 10);
      // ✨ pageParam에서 type과 keyword도 가져와서 사용 ✨
      const typeParam = pageParam.type || "";
      const keywordParam = pageParam.keyword || "";

      queryStr = createSearchParams({
        page: pageNum,
        size: sizeNum,
        type: typeParam, // ✨ type 파라미터 추가 ✨
        keyword: keywordParam, // ✨ keyword 파라미터 추가 ✨
      }).toString();
    } else {
      queryStr = queryDefault;
    }

    setRefresh(!refresh);

    navigate({ pathname: `../list`, search: queryStr });
  };

  const moveToModify = (num) => {
    console.log(queryDefault);
    navigate({
      pathname: `../modify/${num}`,
      search: queryDefault,
    });
  };

  const moveToRead = (num) => {
    console.log(queryDefault);
    navigate({
      pathname: `../read/${num}`,
      search: queryDefault,
    });
  };

  return {
    moveToList,
    moveToModify,
    moveToRead,
    page,
    size,
    refresh,
    type,
    keyword,
  };
};

export default useCustomMove;
