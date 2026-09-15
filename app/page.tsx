'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import storesDataRaw from '@/public/data/stores.json';
import { Store, StoreStatus, UserLocation, DistanceRadius, SortOption } from '@/types/store';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import StoreCard from '@/components/StoreCard';
import NaverMap from '@/components/NaverMap';
import BottomSheet from '@/components/BottomSheet';
import MarketBanner from '@/components/MarketBanner';
import HanaroMartAlert from '@/components/HanaroMartAlert';
import { 
  Sparkles, 
  MapPin, 
  Store as StoreIcon, 
  Search, 
  X, 
  Navigation2, 
  List, 
  Map, 
  ArrowUpDown,
  Compass
} from 'lucide-react';

const storesData = storesDataRaw as {
  metadata: any;
  categories: string[];
  towns: string[];
  stores: Store[];
};

// Haversine distance in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const RADIUS_CHIPS = [
  { label: '500m', value: 500, type: 'walk' },
  { label: '1km', value: 1000, type: 'walk' },
  { label: '3km', value: 3000, type: 'car' },
  { label: '5km', value: 5000, type: 'car' },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTown, setSelectedTown] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<StoreStatus | 'all'>('available'); // 기본: 사용가능만 보기
  const [selectedRadius, setSelectedRadius] = useState<DistanceRadius>('all');
  const [sortOption, setSortOption] = useState<SortOption>('distance');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const isHanaroRelated = searchQuery.includes('하나로') || selectedCategory === '농협·하나로마트';

  // GPS Location handler
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      alert('현재 브라우저에서는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        setIsLocating(false);
        alert('위치 권한을 허용해 주셔야 내 주변 반경 및 거리 순 매장을 찾을 수 있습니다.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Filtered Stores Calculation
  const filteredStores = useMemo(() => {
    let result = storesData.stores.map((s) => {
      let dist: number | undefined = undefined;
      if (userLocation && s.lat && s.lng) {
        dist = calculateDistance(userLocation.lat, userLocation.lng, s.lat, s.lng);
      }
      return { ...s, distance: dist };
    });

    // 1. Status Filter
    if (selectedStatus !== 'all') {
      result = result.filter((s) => s.status === selectedStatus);
    }

    // 2. Town Filter
    if (selectedTown !== 'all') {
      result = result.filter((s) => s.town === selectedTown);
    }

    // 3. Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter((s) => s.category === selectedCategory);
    }

    // 4. Radius Filter (if radius selected and userLocation exists)
    if (selectedRadius !== 'all' && userLocation) {
      result = result.filter((s) => s.distance !== undefined && s.distance <= selectedRadius);
    }

    // 5. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.roadAddress.toLowerCase().includes(q) ||
          s.town.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }

    // 6. Sorting
    if (sortOption === 'distance' && userLocation) {
      result.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return 0;
      });
    } else if (sortOption === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    } else if (sortOption === 'recent') {
      result.sort((a, b) => (b.regDate || '').localeCompare(a.regDate || ''));
    }

    return result;
  }, [searchQuery, selectedTown, selectedCategory, selectedStatus, selectedRadius, sortOption, userLocation]);

  // Overall counts for filter badges
  const counts = useMemo(() => {
    let all = storesData.stores.length;
    let available = 0;
    let unavailable = 0;
    let verify = 0;

    storesData.stores.forEach((s) => {
      if (s.status === 'available') available++;
      else if (s.status === 'unavailable') unavailable++;
      else if (s.status === 'verify') verify++;
    });

    return { all, available, unavailable, verify };
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50">
      {/* 1. Header (Desktop: Always / Mobile: List View Only) */}
      <div className={viewMode === 'map' ? 'hidden md:block' : 'block'}>
        <Header
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalCount={counts.all}
          availableCount={counts.available}
        />
      </div>

      {/* 2. Main Body Area */}
      <main className="flex-1 relative flex flex-col md:flex-row overflow-hidden">
        {/* Left Side Panel on Desktop / Full List view on Mobile */}
        <div
          className={`w-full md:w-[420px] lg:w-[460px] md:border-r border-slate-200 bg-white z-10 flex flex-col h-full shadow-sm ${
            viewMode === 'map' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search & Filter Section */}
          <div className="p-3.5 border-b border-slate-100 bg-white space-y-3 flex-shrink-0">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSelectQuickTag={(tag) => setSearchQuery(tag)}
              onLocateMe={handleLocateMe}
              isLocating={isLocating}
            />
            <FilterBar
              towns={storesData.towns}
              categories={storesData.categories}
              selectedTown={selectedTown}
              onTownChange={setSelectedTown}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              counts={counts}
              selectedRadius={selectedRadius}
              onRadiusChange={setSelectedRadius}
              sortOption={sortOption}
              onSortOptionChange={setSortOption}
              userLocation={userLocation}
              onLocateMe={handleLocateMe}
            />
          </div>

          {/* Market & Hanaro Alert Banners (Desktop Sidebar) */}
          <div className="px-3.5 py-2.5 space-y-2 flex-shrink-0 bg-slate-50/50 border-b border-slate-100">
            {isHanaroRelated && (
              <HanaroMartAlert
                onFilterAvailableOnly={() => {
                  setSelectedStatus('available');
                  setSearchQuery('하나로마트');
                }}
                isFilteredToAvailable={selectedStatus === 'available'}
              />
            )}
            <MarketBanner
              selectedTown={selectedTown}
              onSelectTown={(town) => setSelectedTown(town)}
            />
          </div>

          {/* Store List Header with Count & Sort Selector */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium flex-shrink-0">
            <span>
              검색 결과 <strong className="text-slate-900 font-bold">{filteredStores.length}</strong>곳
              {selectedRadius !== 'all' && (
                <span className="ml-1.5 text-emerald-700 font-semibold bg-emerald-100/70 px-1.5 py-0.5 rounded">
                  {selectedRadius >= 1000 ? `${selectedRadius / 1000}km` : `${selectedRadius}m`} 반경 내
                </span>
              )}
            </span>

            {/* Sort Selector */}
            <div className="flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="distance" disabled={!userLocation}>
                  {userLocation ? '거리 가까운 순' : '거리순 (내위치 필요)'}
                </option>
                <option value="name">가나다 이름순</option>
                <option value="recent">최신 가맹순</option>
              </select>
            </div>
          </div>

          {/* Store Cards Scroll List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredStores.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <StoreIcon className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                <p className="text-sm font-semibold text-slate-600">일치하는 가맹점이 없습니다</p>
                <p className="text-xs text-slate-400">검색어 철자를 확인하시거나 필터 반경을 넓혀보세요.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTown('all');
                    setSelectedCategory('all');
                    setSelectedStatus('available');
                    setSelectedRadius('all');
                  }}
                  className="mt-2 text-xs font-semibold text-emerald-600 hover:underline"
                >
                  필터 초기화
                </button>
              </div>
            ) : (
              filteredStores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  isSelected={selectedStore?.id === store.id}
                  onSelect={() => {
                    setSelectedStore(store);
                    if (viewMode === 'list' && window.innerWidth < 768) {
                      setViewMode('map');
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Area: Map View Container */}
        <div
          className={`flex-1 relative h-full w-full ${
            viewMode === 'list' ? 'hidden md:block' : 'block'
          }`}
        >
          {/* Mobile Top Floating Integrated Header Bar (Ultra-compact ~80px) */}
          <div className="absolute top-2.5 left-2.5 right-2.5 z-20 md:hidden flex flex-col gap-1.5 pointer-events-none">
            {/* 1. Integrated Search & Action Row */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 px-3 py-2 flex items-center gap-2 pointer-events-auto">
              <div className="flex items-center gap-1 flex-shrink-0 text-emerald-700 font-extrabold text-sm tracking-tight">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-2xs">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span>함평콕</span>
              </div>

              <div className="flex-1 min-w-0 relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="가게명, 읍·면 검색 (예: 문장리)"
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2 p-0.5 text-slate-400">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* GPS Locate Button */}
              <button
                onClick={handleLocateMe}
                disabled={isLocating}
                className={`p-1.5 rounded-xl border flex-shrink-0 transition-all ${
                  isLocating
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-300 animate-spin'
                    : userLocation
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="내 위치 찾기"
              >
                <Navigation2 className="w-4 h-4" />
              </button>

              {/* List View Toggle Button */}
              <button
                onClick={() => setViewMode('list')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 flex-shrink-0 shadow-sm transition-all"
                title="목록으로 전체보기"
              >
                <List className="w-3.5 h-3.5" />
                <span>목록</span>
              </button>
            </div>

            {/* 2. Horizontal 1-Line Quick Scrollable Chips (Zero text-wrapping) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs pointer-events-auto">
              {/* Status Toggle Pill */}
              <button
                onClick={() => setSelectedStatus(selectedStatus === 'available' ? 'all' : 'available')}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap flex-shrink-0 border shadow-xs transition-all flex items-center gap-1 ${
                  selectedStatus === 'available'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white/95 text-slate-700 border-slate-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${selectedStatus === 'available' ? 'bg-emerald-300' : 'bg-slate-400'}`} />
                <span>{selectedStatus === 'available' ? `사용 가능만 ${counts.available}` : `전체보기 ${counts.all}`}</span>
              </button>

              {/* Radius Chips */}
              {RADIUS_CHIPS.map((r) => {
                const isActive = selectedRadius === r.value;
                return (
                  <button
                    key={r.value}
                    onClick={() => {
                      if (!userLocation) handleLocateMe();
                      setSelectedRadius(isActive ? 'all' : (r.value as DistanceRadius));
                    }}
                    className={`px-2.5 py-1.5 rounded-full font-bold whitespace-nowrap flex-shrink-0 border shadow-xs transition-all flex items-center gap-1 ${
                      isActive
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white/95 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{r.type === 'walk' ? '🚶' : '🚗'}</span>
                    <span>{r.label}</span>
                  </button>
                );
              })}

              {/* Popular Quick Search Tags */}
              {['하나로마트', '농자재', '주유소', '약국', '식당'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(searchQuery === tag ? '' : tag)}
                  className={`px-2.5 py-1.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 border shadow-xs transition-all ${
                    searchQuery.includes(tag)
                      ? 'bg-slate-900 text-white border-slate-900 font-bold'
                      : 'bg-white/95 text-slate-600 border-slate-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>

            {/* Mobile Local Context Banners (Dismissible) */}
            <div className="pointer-events-auto">
              {isHanaroRelated ? (
                <HanaroMartAlert
                  onFilterAvailableOnly={() => {
                    setSelectedStatus('available');
                    setSearchQuery('하나로마트');
                  }}
                  isFilteredToAvailable={selectedStatus === 'available'}
                />
              ) : (
                <MarketBanner
                  selectedTown={selectedTown}
                  onSelectTown={(town) => setSelectedTown(town)}
                />
              )}
            </div>
          </div>

          {/* Interactive Naver Map with Radius Circle */}
          <NaverMap
            stores={filteredStores}
            selectedStore={selectedStore}
            onSelectStore={setSelectedStore}
            userLocation={userLocation}
            onLocateMe={handleLocateMe}
            isLocating={isLocating}
            radius={selectedRadius === 'all' ? null : selectedRadius}
          />

          {/* Mobile Slim Bottom Sheet */}
          <BottomSheet
            stores={filteredStores}
            selectedStore={selectedStore}
            onSelectStore={setSelectedStore}
            totalFiltered={filteredStores.length}
          />
        </div>
      </main>
    </div>
  );
}
