'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import storesDataRaw from '@/public/data/stores.json';
import { Store, StoreStatus, UserLocation } from '@/types/store';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import StoreCard from '@/components/StoreCard';
import NaverMap from '@/components/NaverMap';
import BottomSheet from '@/components/BottomSheet';
import { Sparkles, MapPin, Store as StoreIcon } from 'lucide-react';

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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTown, setSelectedTown] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<StoreStatus | 'all'>('available'); // 기본: 사용가능만 보기
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);

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
        alert('위치 권한을 허용해 주셔야 내 주변 매장을 찾을 수 있습니다.');
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

    // 4. Search Query Filter
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

    // 5. Distance Sorting (if user location available)
    if (userLocation) {
      result.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return 0;
      });
    }

    return result;
  }, [searchQuery, selectedTown, selectedCategory, selectedStatus, userLocation]);

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
      {/* 1. Header */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={counts.all}
        availableCount={counts.available}
      />

      {/* 2. Main Body Area */}
      <main className="flex-1 relative flex flex-col md:flex-row overflow-hidden">
        {/* Left Side Panel on Desktop / List view container on Mobile */}
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
            />
          </div>

          {/* Store List Header */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium flex-shrink-0">
            <span>
              검색 결과 <strong className="text-slate-900 font-bold">{filteredStores.length}</strong>곳
            </span>
            {userLocation && (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3" /> 내 위치 가까운 순
              </span>
            )}
          </div>

          {/* Store Cards Scroll List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredStores.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <StoreIcon className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                <p className="text-sm font-semibold text-slate-600">일치하는 가맹점이 없습니다</p>
                <p className="text-xs text-slate-400">검색어 철자를 확인하시거나 필터를 변경해 보세요.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTown('all');
                    setSelectedCategory('all');
                    setSelectedStatus('available');
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
          {/* Mobile Top Floating Search & Filter Bar */}
          <div className="absolute top-2.5 left-2.5 right-2.5 z-20 md:hidden flex flex-col gap-2">
            <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-lg border border-slate-200/80 space-y-2">
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
              />
            </div>
          </div>

          {/* Interactive Naver Map */}
          <NaverMap
            stores={filteredStores}
            selectedStore={selectedStore}
            onSelectStore={setSelectedStore}
            userLocation={userLocation}
            onLocateMe={handleLocateMe}
            isLocating={isLocating}
          />

          {/* Mobile Bottom Sheet */}
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
