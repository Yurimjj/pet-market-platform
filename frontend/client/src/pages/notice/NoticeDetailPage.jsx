import React from "react";
import { useParams } from "react-router-dom";
import NoticeDetailComponent from "../../components/notice/NoticeDetailComponent";
import BasicLayout from "../../layouts/BasicLayout";

const NoticeDetailPage = () => {
  const { noticeId } = useParams();

  return (
    <BasicLayout>
      <section>
        <div>
          <div className="card-body p-4">

            <div className="mt-2">
              <NoticeDetailComponent noticeId={noticeId} />
            </div>
          </div>
        </div>
      </section>
    </BasicLayout>
  );
};

export default NoticeDetailPage;
