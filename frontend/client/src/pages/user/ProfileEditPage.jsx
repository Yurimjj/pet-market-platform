import ProfileEditComponent from "../../components/user/ProfileEditComponent";
import BasicLayout from "../../layouts/BasicLayout";

export default function ProfileEditPage() {
  return (
    <BasicLayout>
      <div className="w-full max-w-3xl mx-auto mt-4">
        <ProfileEditComponent />
      </div>
    </BasicLayout>
  );
}
