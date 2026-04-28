import BasicMenu from "../../components/menus/BasicMenu";
import ProductListComponent from "../../components/product/ProductListComponent";

export default function ListPage() {
  return (
    <div className="fixed inset-0 flex flex-col">
      <BasicMenu />
      <div className="flex-grow overflow-auto bg-base-200">
        <div className="mx-auto w-full max-w-[1000px] p-4">
          <ProductListComponent />
        </div>
      </div>
    </div>
  );
}
