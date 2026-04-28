import WithdrawalComponent from "../../components/user/WithdrawalComponents";
import BasicLayout from "../../layouts/BasicLayout";

const WithdrawalPage = () => {
  return (
    <BasicLayout>
      <div className="w-full max-w-3xl mx-auto mt-4">
        <WithdrawalComponent />
      </div>
    </BasicLayout>
  );
};

export default WithdrawalPage;
