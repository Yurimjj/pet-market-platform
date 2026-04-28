import AddNoticeComponent from "../../components/notice/NoticeRegisterComponent";
import BasicLayout from "../../layouts/BasicLayout";

const NoticeRegister = () => {
  return (
    <BasicLayout>
      <section>
        <div>
          <div className="card-body p-4">

            <AddNoticeComponent />
          </div>
        </div>
      </section>
    </BasicLayout>
  );
};

export default NoticeRegister;
