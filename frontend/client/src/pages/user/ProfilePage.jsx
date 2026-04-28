import React from "react";
import BasicMenu from "../../components/menus/BasicMenu";
import ProfileComponent from "../../components/user/ProfileComponent";

const ProfilePage = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex flex-col">
      <BasicMenu />
      <div className="flex flex-grow justify-center items-start p-6 overflow-auto">
        <ProfileComponent />
      </div>
    </div>
  );
};
export default ProfilePage;
