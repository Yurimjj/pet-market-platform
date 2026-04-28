import { Outlet, useNavigate } from "react-router-dom";
import BasicLayout from "../../layouts/BasicLayout";
import { useCallback } from "react";

const IndexPage = () => {

    //useNavigate() : 상황에 따라 동적으로 데이터를 처리해서 이동하는 경우에 사용 (<Native>나 <Link> 대신에 사용하자)
    const navigate = useNavigate()  

    //자바 스크립트 콜백 함수(callback function) : 다른 함수에 인자로 전달되어 나중에 실행되는 함수
    /*
    function greeting(name) {
        onsole.log(`안녕하세요, ${name}님!`);
    }
    function processUserInput(callback) {
        const name = "홍길동";
        callback(name); // 여기서 callback 함수가 실행됨
    } 
    processUserInput(greeting);     <== 결과 : 안녕하세요, 홍길동님!
    콜백 함수는 왜 쓰는가?
    자세한 내용은 챗Gpt로 확인 해보자
    여기서는 이벤트 핸들링(예: 클릭 이벤트) 할때 사용 되고 있다.
    */


    //useCallback : 컴포넌트가 리랜더링 될때마다 같은 함수를 새로 만들지 않고 재사용 
    //useCallback(a, b) : a는 실제로 실행될 함수, b는 배열안의 값이 바뀔때 마다 함수를 새로생성
    /*const test = useCallback (() => {
            //실행할 코드
        },[a, b, c]);
    */    
    const handleClickList = useCallback(() => {
        navigate({ pathname : 'list'})
    })

    const handleClickAdd = useCallback(() => {
        navigate({ pathname : 'add'})
    })


    return (
        /* IndexPage 안에 ListPage (ListPage는 IndexPage의 중첩 자식 라우트로 설정되어 있어서 
           IndexPage 의 <Outlet /> 자리에 ListPage가 자동으로 들어간다.) 
        */
        <BasicLayout>   
            <div className="w-full flex m-2 p-2">
                <div className="text-x1 m-1 p-2 w-20 font-extrabold text-center underline" onClick={handleClickList}>LIST</div>
                <div className="text-x1 m-1 p-2 w-20 font-extrabold text-center underline" onClick={handleClickAdd}>ADD</div>            
            </div>
            <div className="flex flex-wrap w-full">
                {/* Outlet : 부모 라우트(root.jsx 에서 createBrowserRouter 로 만든 라우터)가 자식라우트의 컴포넌트를 랜더링할 위치를 정의할 때 사용 
                    어디에 쓰나? 부모 컴포넌트(레이아웃, 공통 UI등)에서 사용
                    언제 쓰나? 중첩된 라우팅 구조가 있을때
                    장점 : 중첩 라우팅 설정(root에서 createBrowserRouter로 만든 라우트 안에 todoRouter)시 레이아웃을 유지할 수 있다.
                    결론 : 여기서는 부모 라우트에서 Todo 메뉴를 클릭 했을때 <Outlet/> 부분이 ListPage컴포넌트로 처리되었다. 레이아웃도 유지 되었다.
                */}
                <Outlet/>  {/* <Outlet/> 자리에 랜더링됨 , 여기서는 <Outlet/> 부분이 ListPage컴포넌트로 처리됨 
                                자식 라우터(todoRouter()에 있는 모든 페이지가 라우팅을 통해서 <Outlet/> 위치에 들어간다.
                                ex : List 버튼 클릭하면 <Outlet/> 위치에 ListPage가 들어가고,
                                     Add 버튼을 클릭하면 <Outlet/> 위치에 AddPage가 들어가고,
                                     todoRouter 의 "read/:nno" 경로가 호출되면 ReadPage가 들어가고,
                                     todoRouter 의 "modify/:nno" 경로가 호출되면 ModifyPage가 들어간다.      
                            */}     
            </div>
        </BasicLayout>
    );
}

export default IndexPage;