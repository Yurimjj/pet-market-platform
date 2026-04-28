import React, { useEffect, useRef } from "react";

const ReadMapComponent = ({addr}) => {
  
  const mapContainerRef = useRef(null);

  useEffect(() => {

    console.log("ReadMapComponent addr:", addr);

      


    if (!addr){
      console.log("주소가 없어~!")
      return; // 주소가 없으면 실행 안함
    } 

    // 카카오맵 스크립트 동적 로드
    const script = document.createElement("script");
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=b2c7e914cbe3db4c67aa1fb145269baa&autoload=false&libraries=services";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {

        const { kakao } = window;
      
        const map = new kakao.maps.Map(mapContainerRef.current, {
          center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울시청 기본 좌표
          level: 3,
        });

        map.relayout();


        //console.log("map 만들어 졌나?", map)

        // 주소-좌표 변환 객체 생성
        const geocoder = new kakao.maps.services.Geocoder();


        //addr = addr.replace(/^지번주소:\s*/, "").trim();
        // 주소로 좌표 검색
        //console.log(typeof addr, addr);
        //const cleanAddr = addr.trim();

        geocoder.addressSearch(addr, (result, status) => {

            //console.log(result, status); // 추가
            //console.log("좌표:", result[0].x, result[0].y);
            console.log("좌표:", result)


            if (status === kakao.maps.services.Status.OK) {
             
              const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

              // 마커 표시
              const marker = new kakao.maps.Marker({
                map: map,
                position: coords,
              });

              // 인포윈도우 표시
              const infowindow = new kakao.maps.InfoWindow({
                content:
                  `<div style="width:150px;text-align:center;padding:6px 0;">${addr}</div>`,
              });
              infowindow.open(map, marker);

              // 지도 중심 이동
              map.setCenter(coords);
              map.relayout();
            }else{
              console.error("주소 검색 실패:", status);
            }
          }
        );
      });
    };

    // cleanup
    return () => {
      document.head.removeChild(script);
    };

    
  }, [addr]);   //addr 바뀔 때마다 실행

  return (
    <div>
      <div
        ref={mapContainerRef}
         style={{ width: "100%", height: "350px", border: "1px solid #ddd" }}
      ></div>
    </div>
  );
};

export default ReadMapComponent;
