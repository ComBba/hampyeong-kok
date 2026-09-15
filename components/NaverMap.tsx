'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Store, UserLocation } from '@/types/store';
import { 
  Navigation2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Car, 
  X 
} from 'lucide-react';

interface NaverMapProps {
  stores: Store[];
  selectedStore: Store | null;
  onSelectStore: (store: Store | null) => void;
  userLocation: UserLocation | null;
  onLocateMe: () => void;
  isLocating: boolean;
  radius?: number | null;
}

declare global {
  interface Window {
    naver: any;
  }
}

const DEFAULT_CENTER = { lat: 35.0655, lng: 126.5165 }; // 함평군청 중심
const DEFAULT_ZOOM = 13;

export default function NaverMap({
  stores,
  selectedStore,
  onSelectStore,
  userLocation,
  onLocateMe,
  isLocating,
  radius,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const panoRef = useRef<HTMLDivElement>(null);
  const naverMapInstance = useRef<any>(null);
  const trafficLayerRef = useRef<any>(null);
  const panoInstance = useRef<any>(null);

  const markersRef = useRef<{ [id: string]: any }>({});
  const userMarkerRef = useRef<any>(null);
  const radiusCircleRef = useRef<any>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Map Feature Toggles
  const [isSatellite, setIsSatellite] = useState(false);
  const [isTraffic, setIsTraffic] = useState(false);
  const [showPanorama, setShowPanorama] = useState(false);
  const [panoramaStore, setPanoramaStore] = useState<Store | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(DEFAULT_ZOOM);

  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || 'orbr0ka7bw';

  // 1. Script Loading
  useEffect(() => {
    if (!clientId) {
      setLoadError("NEXT_PUBLIC_NAVER_MAP_CLIENT_ID가 설정되지 않았습니다.");
      return;
    }

    if (window.naver && window.naver.maps) {
      setIsLoaded(true);
      return;
    }

    const scriptId = 'naver-map-script';
    if (document.getElementById(scriptId)) {
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'text/javascript';
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=panorama`;
    script.async = true;

    script.onload = () => {
      if (window.naver && window.naver.maps) {
        setIsLoaded(true);
      } else {
        setLoadError("네이버 지도 API를 불러오지 못했습니다.");
      }
    };

    script.onerror = () => {
      setLoadError("네이버 지도 스크립트 로드 실패. Client ID 및 웹 서비스 URL을 확인해 주세요.");
    };

    document.head.appendChild(script);
  }, [clientId]);

  // 2. Initialize Map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || naverMapInstance.current) return;

    try {
      const mapOptions = {
        center: new window.naver.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
        zoom: DEFAULT_ZOOM,
        minZoom: 10,
        maxZoom: 19,
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: true,
      };

      const map = new window.naver.maps.Map(mapRef.current, mapOptions);
      naverMapInstance.current = map;

      // Click background to deselect
      window.naver.maps.Event.addListener(map, 'click', () => {
        onSelectStore(null);
      });

      // Zoom listener for smooth clustering
      window.naver.maps.Event.addListener(map, 'zoom_changed', () => {
        setCurrentZoom(map.getZoom());
      });
    } catch (err: any) {
      console.error("Map initialization error:", err);
      setLoadError("지도 초기화 오류: " + err.message);
    }
  }, [isLoaded, onSelectStore]);

  // 3. Toggle Map Type (Satellite vs Normal)
  const toggleMapType = () => {
    if (!naverMapInstance.current) return;
    const map = naverMapInstance.current;
    if (!isSatellite) {
      map.setMapTypeId(window.naver.maps.MapTypeId.HYBRID);
      setIsSatellite(true);
    } else {
      map.setMapTypeId(window.naver.maps.MapTypeId.NORMAL);
      setIsSatellite(false);
    }
  };

  // 4. Toggle Traffic Layer
  const toggleTraffic = () => {
    if (!naverMapInstance.current) return;
    const map = naverMapInstance.current;
    if (!isTraffic) {
      if (!trafficLayerRef.current) {
        trafficLayerRef.current = new window.naver.maps.TrafficLayer();
      }
      trafficLayerRef.current.setMap(map);
      setIsTraffic(true);
    } else {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
      setIsTraffic(false);
    }
  };

  // 5. Render Markers with Clustering (currentZoom < 15) and Individual Pins (currentZoom >= 15)
  useEffect(() => {
    if (!isLoaded || !naverMapInstance.current) return;
    const map = naverMapInstance.current;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker: any) => {
      marker.setMap(null);
    });
    markersRef.current = {};

    const newMarkers: { [id: string]: any } = {};

    // Helper: create individual store pin marker
    const createStoreMarker = (store: Store, isSelected: boolean) => {
      let pinColor = '#16a34a'; // green
      if (store.status === 'unavailable') {
        pinColor = '#dc2626'; // red
      } else if (store.status === 'verify') {
        pinColor = '#d97706'; // amber
      }

      const markerContent = `
        <div class="marker-pin ${isSelected ? 'active' : ''}" style="position: relative; cursor: pointer;">
          <div style="
            width: ${isSelected ? '32px' : '24px'};
            height: ${isSelected ? '32px' : '24px'};
            background-color: ${pinColor};
            border: 2px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: ${isSelected ? '12px' : '8px'};
              height: ${isSelected ? '12px' : '8px'};
              background-color: #ffffff;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        </div>
      `;

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(store.lat, store.lng),
        map: map,
        title: store.name,
        icon: {
          content: markerContent,
          size: new window.naver.maps.Size(isSelected ? 32 : 24, isSelected ? 32 : 24),
          anchor: new window.naver.maps.Point(isSelected ? 16 : 12, isSelected ? 32 : 24),
        },
        zIndex: isSelected ? 100 : 10,
      });

      window.naver.maps.Event.addListener(marker, 'click', () => {
        onSelectStore(store);
      });

      return marker;
    };

    // Helper: create cluster badge marker
    const createClusterMarker = (
      clusterStores: Store[],
      avgLat: number,
      avgLng: number,
      minLat: number,
      maxLat: number,
      minLng: number,
      maxLng: number
    ) => {
      const count = clusterStores.length;
      let size = 38;
      let fontSize = 12;

      if (count >= 200) {
        size = 54;
        fontSize = 15;
      } else if (count >= 50) {
        size = 46;
        fontSize = 14;
      } else if (count >= 10) {
        size = 40;
        fontSize = 13;
      }

      const clusterContent = `
        <div class="hampyeong-cluster-marker" style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.45);
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
          font-size: ${fontSize}px;
          font-weight: 800;
          cursor: pointer;
          user-select: none;
          letter-spacing: -0.5px;
        ">
          <span>${count}</span>
        </div>
      `;

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(avgLat, avgLng),
        map: map,
        title: `${count}개 가맹점 밀집 구역 (클릭하여 확대)`,
        icon: {
          content: clusterContent,
          size: new window.naver.maps.Size(size, size),
          anchor: new window.naver.maps.Point(size / 2, size / 2),
        },
        zIndex: 25,
      });

      window.naver.maps.Event.addListener(marker, 'click', () => {
        if (minLat === maxLat && minLng === maxLng) {
          map.setCenter(new window.naver.maps.LatLng(avgLat, avgLng));
          map.setZoom(Math.min(18, currentZoom + 2));
        } else {
          const bounds = new window.naver.maps.LatLngBounds(
            new window.naver.maps.LatLng(minLat, minLng),
            new window.naver.maps.LatLng(maxLat, maxLng)
          );
          map.fitBounds(bounds, { margin: 60 });
        }
      });

      return marker;
    };

    if (currentZoom < 15) {
      // Dynamic grid cell size based on current zoom level
      const scale = Math.pow(2, 13 - currentZoom);
      const cellLat = 0.018 * scale;
      const cellLng = 0.024 * scale;

      const bins: {
        [key: string]: {
          stores: Store[];
          sumLat: number;
          sumLng: number;
          minLat: number;
          maxLat: number;
          minLng: number;
          maxLng: number;
        };
      } = {};

      stores.forEach((store) => {
        if (!store.lat || !store.lng) return;
        const gridY = Math.floor(store.lat / cellLat);
        const gridX = Math.floor(store.lng / cellLng);
        const key = `${gridY}_${gridX}`;

        if (!bins[key]) {
          bins[key] = {
            stores: [],
            sumLat: 0,
            sumLng: 0,
            minLat: store.lat,
            maxLat: store.lat,
            minLng: store.lng,
            maxLng: store.lng,
          };
        }

        bins[key].stores.push(store);
        bins[key].sumLat += store.lat;
        bins[key].sumLng += store.lng;
        bins[key].minLat = Math.min(bins[key].minLat, store.lat);
        bins[key].maxLat = Math.max(bins[key].maxLat, store.lat);
        bins[key].minLng = Math.min(bins[key].minLng, store.lng);
        bins[key].maxLng = Math.max(bins[key].maxLng, store.lng);
      });

      // Render clusters or single pins
      Object.entries(bins).forEach(([key, bin]) => {
        if (bin.stores.length === 1) {
          const s = bin.stores[0];
          newMarkers[s.id] = createStoreMarker(s, selectedStore?.id === s.id);
        } else {
          const avgLat = bin.sumLat / bin.stores.length;
          const avgLng = bin.sumLng / bin.stores.length;
          newMarkers[`cluster_${key}`] = createClusterMarker(
            bin.stores,
            avgLat,
            avgLng,
            bin.minLat,
            bin.maxLat,
            bin.minLng,
            bin.maxLng
          );
        }
      });

      // Ensure currently selected store is always rendered as an individual pin
      if (selectedStore && selectedStore.lat && selectedStore.lng && !newMarkers[selectedStore.id]) {
        newMarkers[selectedStore.id] = createStoreMarker(selectedStore, true);
      }
    } else {
      // Zoom >= 15: Render all individual pins
      stores.forEach((store) => {
        if (!store.lat || !store.lng) return;
        newMarkers[store.id] = createStoreMarker(store, selectedStore?.id === store.id);
      });
    }

    markersRef.current = newMarkers;
  }, [isLoaded, stores, selectedStore, onSelectStore, currentZoom]);

  // 6. Focus on selected store
  useEffect(() => {
    if (!naverMapInstance.current || !selectedStore || !selectedStore.lat || !selectedStore.lng) return;
    const map = naverMapInstance.current;
    const targetCoord = new window.naver.maps.LatLng(selectedStore.lat, selectedStore.lng);

    map.panTo(targetCoord, { duration: 300 });
    if (map.getZoom() < 16) {
      map.setZoom(16, true);
    }
  }, [selectedStore]);

  // 7. User GPS location marker
  useEffect(() => {
    if (!isLoaded || !naverMapInstance.current) return;
    const map = naverMapInstance.current;

    if (!userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      if (radiusCircleRef.current) {
        radiusCircleRef.current.setMap(null);
        radiusCircleRef.current = null;
      }
      return;
    }

    const pos = new window.naver.maps.LatLng(userLocation.lat, userLocation.lng);

    const userContent = `
      <div style="position: relative; width: 22px; height: 22px;">
        <div style="
          position: absolute;
          inset: 0;
          background: rgba(59, 130, 246, 0.4);
          border-radius: 50%;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: absolute;
          inset: 3px;
          background: #2563eb;
          border: 2.5px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>
      </div>
    `;

    if (!userMarkerRef.current) {
      userMarkerRef.current = new window.naver.maps.Marker({
        position: pos,
        map: map,
        icon: {
          content: userContent,
          anchor: new window.naver.maps.Point(11, 11),
        },
        zIndex: 999,
      });
    } else {
      userMarkerRef.current.setPosition(pos);
    }

    // Radius Circle
    if (radius && radius > 0) {
      if (!radiusCircleRef.current) {
        radiusCircleRef.current = new window.naver.maps.Circle({
          map: map,
          center: pos,
          radius: radius,
          fillColor: '#10b981',
          fillOpacity: 0.12,
          strokeColor: '#059669',
          strokeOpacity: 0.6,
          strokeWeight: 2,
        });
      } else {
        radiusCircleRef.current.setCenter(pos);
        radiusCircleRef.current.setRadius(radius);
        radiusCircleRef.current.setMap(map);
      }
      map.fitBounds(radiusCircleRef.current.getBounds(), { margin: 30 });
    } else {
      if (radiusCircleRef.current) {
        radiusCircleRef.current.setMap(null);
        radiusCircleRef.current = null;
      }
    }
  }, [isLoaded, userLocation, radius]);

  // 8. Open Panorama (Roadview)
  const openRoadviewForStore = (store: Store) => {
    if (!store.lat || !store.lng) return;
    setPanoramaStore(store);
    setShowPanorama(true);
  };

  useEffect(() => {
    if (!showPanorama || !panoramaStore || !panoRef.current || !window.naver?.maps?.Panorama) return;

    try {
      if (!panoInstance.current) {
        panoInstance.current = new window.naver.maps.Panorama(panoRef.current, {
          position: new window.naver.maps.LatLng(panoramaStore.lat, panoramaStore.lng),
          pov: { pan: -135, tilt: 29, fov: 100 },
        });
      } else {
        panoInstance.current.setPosition(new window.naver.maps.LatLng(panoramaStore.lat, panoramaStore.lng));
      }
    } catch (e) {
      console.error("Panorama error:", e);
    }
  }, [showPanorama, panoramaStore]);

  // Controls
  const handleZoomIn = () => {
    if (naverMapInstance.current) {
      naverMapInstance.current.setZoom(naverMapInstance.current.getZoom() + 1, true);
    }
  };

  const handleZoomOut = () => {
    if (naverMapInstance.current) {
      naverMapInstance.current.setZoom(naverMapInstance.current.getZoom() - 1, true);
    }
  };

  const handleResetCenter = () => {
    if (naverMapInstance.current) {
      naverMapInstance.current.panTo(
        new window.naver.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
        { duration: 300 }
      );
      naverMapInstance.current.setZoom(DEFAULT_ZOOM, true);
      onSelectStore(null);
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden">
      {/* Naver Map DOM Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Panorama / Roadview Modal Overlay */}
      {showPanorama && (
        <div className="absolute inset-0 z-50 bg-slate-900/90 flex flex-col animate-in fade-in duration-200">
          <div className="p-3 bg-slate-800 text-white flex items-center justify-between border-b border-slate-700">
            <div>
              <span className="text-xs font-bold text-emerald-400 mr-2">네이버 거리뷰</span>
              <span className="text-sm font-bold">{panoramaStore?.name}</span>
            </div>
            <button
              onClick={() => setShowPanorama(false)}
              className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div ref={panoRef} className="flex-1 w-full h-full bg-black" />
        </div>
      )}

      {/* Fallback / Loading / Error overlay */}
      {!isLoaded && !loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs font-semibold text-slate-600">네이버 지도를 불러오는 중입니다...</p>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 p-6 text-center z-10">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-3 font-bold text-xl">
            !
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">지도 로드 안내</h4>
          <p className="text-xs text-slate-600 max-w-sm mb-4 leading-relaxed">{loadError}</p>
        </div>
      )}

      {/* Floating Control Buttons */}
      <div className="absolute right-3.5 top-3.5 z-10 flex flex-col gap-1.5 shadow-md">
        {/* GPS Locate Me */}
        <button
          onClick={onLocateMe}
          disabled={isLocating}
          className={`w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm transition-colors ${
            userLocation ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
          }`}
          title="내 위치 찾기"
        >
          <Navigation2 className={`w-4 h-4 ${isLocating ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        {/* Satellite Map Toggle */}
        <button
          onClick={toggleMapType}
          className={`w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center shadow-sm transition-colors ${
            isSatellite ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 hover:text-emerald-700'
          }`}
          title={isSatellite ? "일반지도로 보기" : "위성지도로 보기"}
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Live Traffic Toggle */}
        <button
          onClick={toggleTraffic}
          className={`w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center shadow-sm transition-colors ${
            isTraffic ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 hover:text-blue-600'
          }`}
          title={isTraffic ? "교통정보 끄기" : "실시간 교통정보 보기"}
        >
          <Car className="w-4 h-4" />
        </button>

        {/* Reset Hampyeong Center */}
        <button
          onClick={handleResetCenter}
          className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-emerald-700 shadow-sm transition-colors"
          title="함평 전체 보기"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-sm transition-colors"
          title="확대"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-sm transition-colors"
          title="축소"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend Pill */}
      <div className="absolute left-3.5 bottom-5 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm hidden md:flex items-center gap-3 text-xs font-semibold text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
          <span>사용 가능</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
          <span>확인 필요</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200" />
          <span>사용 불가</span>
        </div>
      </div>
    </div>
  );
}
