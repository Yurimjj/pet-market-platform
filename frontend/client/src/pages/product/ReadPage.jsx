import BasicMenu from "../../components/menus/BasicMenu";
import ProductReadComponent from "../../components/product/ProductReadComponent";
import { useParams } from "react-router-dom";

export default function ReadPage() {
  const { productId } = useParams(); // ✅ 페이지에서만 params 사용
  return (
    <div className="fixed inset-0 flex flex-col">
      <BasicMenu />
      <div className="flex-grow overflow-auto bg-base-200">
        <div className="mx-auto w-full p-3 md:p-4 max-w-xl md:max-w-2xl lg:max-w-3xl">
          {/* ✅ 자식엔 props로 전달 */}
          <ProductReadComponent productId={Number(productId)} />
        </div>
      </div>
    </div>
  );
}
