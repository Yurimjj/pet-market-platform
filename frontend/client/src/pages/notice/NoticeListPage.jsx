// import { useSearchParams } from "react-router-dom";
import NoticeListComponent from "../../components/notice/NoticeListComponent";
import BasicLayout from "../../layouts/BasicLayout";

const NoticeListPage = () => {
  //useSearchParams() : localhost:8080/list?page=1&size=10  처럼 ? 뒤에 나오는 쿼리스트링을 이용할수 있다.
  // const [queryParams] = useSearchParams()

  // const page = queryParams.get("page") ? parseInt(queryParams.get("page")) : 1
  // const size = queryParams.get("size") ? parseInt(queryParams.get("size")) : 10

  return (
    <BasicLayout>
      {/* 상단 타이틀 - 다른 페이지와 동일 톤 */}
      <div className="text-2xl lg:text-3xl text-secondary font-bold text-center px-4">
        {/* {page } --- {size} */}
      </div>

      {/* 컨텐츠 영역 - 중앙 고정 폭 컨테이너 */}
      <div className="w-full max-w-3xl mx-auto mt-4">
        <NoticeListComponent />
      </div>
    </BasicLayout>
  );
};

export default NoticeListPage;
