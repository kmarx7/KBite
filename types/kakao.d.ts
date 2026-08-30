/* 카카오맵 JavaScript SDK — 사용하는 부분만 최소 선언 */
declare namespace kakao.maps {
  function load(callback: () => void): void;

  class LatLng {
    constructor(lat: number, lng: number);
  }

  interface MapOptions {
    center: LatLng;
    level: number;
    /* 아래는 상세 페이지 미니맵처럼 조작을 잠글 때만 지정한다 */
    draggable?: boolean;
    scrollwheel?: boolean;
    disableDoubleClick?: boolean;
    disableDoubleClickZoom?: boolean;
  }

  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    getCenter(): LatLng;
    panTo(latlng: LatLng): void;
    setLevel(level: number, options?: { animate?: boolean | { duration: number } }): void;
    relayout(): void;
    /* zoomable은 생성자 옵션에 없고 이 메서드로만 끈다 */
    setDraggable(draggable: boolean): void;
    setZoomable(zoomable: boolean): void;
  }

  class CustomOverlay {
    constructor(options: {
      position: LatLng;
      content: HTMLElement;
      yAnchor?: number;
      zIndex?: number;
      clickable?: boolean;
    });
    setMap(map: Map | null): void;
    setPosition(latlng: LatLng): void;
  }
}

declare namespace kakao.maps.services {
  /** 주소 → 좌표 변환 결과 (x=경도, y=위도 — 문자열로 반환됨) */
  interface AddressSearchResult {
    x: string;
    y: string;
  }
  type AddressSearchStatus = "OK" | "ZERO_RESULT" | "ERROR";
  const Status: {
    OK: "OK";
    ZERO_RESULT: "ZERO_RESULT";
    ERROR: "ERROR";
  };
  class Geocoder {
    addressSearch(
      address: string,
      callback: (
        result: AddressSearchResult[],
        status: AddressSearchStatus,
      ) => void,
    ): void;
  }
}

/* Daum 우편번호 서비스 — 사용하는 부분만 최소 선언 */
declare namespace daum {
  interface PostcodeData {
    roadAddress: string;
    jibunAddress: string;
    roadAddressEnglish: string;
    zonecode: string;
  }
  class Postcode {
    constructor(options: {
      oncomplete: (data: PostcodeData) => void;
      width?: string | number;
      height?: string | number;
    });
    embed(element: HTMLElement): void;
  }
}

interface Window {
  kakao: { maps: typeof kakao.maps };
  daum: { Postcode: typeof daum.Postcode };
}
