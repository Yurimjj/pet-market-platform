import LogoutComponent from "../../components/user/LogoutComponent";
import BasicMenu from "../../components/menus/BasicMenu";

const LogoutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <BasicMenu />

      <main className="flex-1 flex items-center justify-center">
        <LogoutComponent />
      </main>
    </div>
  );
};

export default LogoutPage;
