import { useParams } from "react-router-dom";
import NoticeModifyComponent from "../../components/notice/NoticeModifyComponent";
import BasicLayout from "../../layouts/BasicLayout";

const NoticeModifyPage = () => {
  const { noticeId } = useParams();
  const parsedNno = parseInt(noticeId, 10);

  return (
    <BasicLayout>
      <div className="w-full max-w-3xl mx-auto mt-4">
        <NoticeModifyComponent nno={parsedNno} />
      </div>
    </BasicLayout>
  );
};

export default NoticeModifyPage;
