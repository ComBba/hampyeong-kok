'use client';

import React, { useState, useMemo } from 'react';
import { Store, UserLocation } from '@/types/store';
import { 
  Fuel, 
  ShoppingBag, 
  HeartPulse, 
  Utensils, 
  MapPin, 
  Navigation, 
  Phone, 
  ArrowLeft, 
  Search, 
  X, 
  Heart, 
  ExternalLink,
  Clock,
  Sparkles
} from 'lucide-react';

interface SeniorModeProps {
  stores: Store[];
  onExit: () => void;
  userLocation: UserLocation | null;
  onLocateMe: () => void;
  isLocating: boolean;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  towns: string[];
}

type SeniorCategory = 'all' | 'gas' | 'mart' | 'hospital' | 'food';

export default function SeniorMode({
  stores,
  onExit,
  userLocation,
  onLocateMe,
  isLocating,
  favorites,
  onToggleFavorite,
  towns,
}: SeniorModeProps) {
  const [selectedCategory, setSelectedCategory] = useState<SeniorCategory>('all');
  const [selectedTown, setSelectedTown] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Filter stores according to Senior Categories
  const seniorFilteredStores = useMemo(() => {
    let list = stores.filter(s => s.status === 'available'); // 기본: 사용가능 매장만 우선

    // 1. Category Filter
    if (selectedCategory === 'gas') {
      list = list.filter(s => s.isGasStation || s.category === '주유소·충전소');
    } else if (selectedCategory === 'mart') {
      list = list.filter(s => s.category === '농협·하나로마트' || s.category === '마트·편의점');
    } else if (selectedCategory === 'hospital') {
      list = list.filter(s => s.category === '병원·의원' || s.category === '약국');
    } else if (selectedCategory === 'food') {
      list = list.filter(s => s.category === '음식점');
    }

    // 2. Town Filter
    if (selectedTown !== 'all') {
      list = list.filter(s => s.town === selectedTown);
    }

    // 3. Favorites Only Filter
    if (showOnlyFavorites) {
      list = list.filter(s => favorites.includes(s.id));
    }

    // 4. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.town.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q)
      );
    }

    // 5. Distance Sort (if location available)
    if (userLocation) {
      list.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return 0;
      });
    }

    return list;
  }, [stores, selectedCategory, selectedTown, searchQuery, showOnlyFavorites, favorites, userLocation]);

  // Handle Naver Map Directions
  const handleNavi = (store: Store) => {
    if (store.lat && store.lng) {
      const navUrl = `https://map.naver.com/p/directions/-,/${store.lng},${store.lat},${encodeURIComponent(store.name)},,/-/car`;
      const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = `nmap://route/car?dlat=${store.lat}&dlng=${store.lng}&dname=${encodeURIComponent(store.name)}&appname=hampyeong-kok`;
        setTimeout(() => window.open(navUrl, '_blank'), 600);
        return;
      }
      window.open(navUrl, '_blank');
    } else {
      const q = encodeURIComponent(`${store.name} ${store.town || '함평'}`);
      window.open(`https://map.naver.com/p/search/${q}`, '_blank');
    }
  };

  // Handle SmartPlace / Phone
  const handlePlaceOrPhone = (store: Store) => {
    const query = encodeURIComponent(`${store.name} ${store.town || '함평'}`);
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const placeUrl = isMobile
      ? `https://m.search.naver.com/search.naver?query=${query}`
      : `https://map.naver.com/p/search/${query}`;
    window.open(placeUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-20 text-slate-900 animate-in fade-in duration-200">
      {/* 1. Top Senior Mode Header */}
      <header className="bg-emerald-700 text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👓</span>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">어르신 쉬운 모드</h1>
              <p className="text-xs text-emerald-100 font-medium">
                글씨가 크고 터치하기 편한 화면입니다
              </p>
            </div>
          </div>

          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-emerald-800 font-extrabold text-xs rounded-xl shadow-md hover:bg-emerald-50 transition-transform active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>일반 지도 보기</span>
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto w-full p-3.5 space-y-4">
        {/* 2. Search Box */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="가게 이름이나 동네를 입력하세요"
            className="w-full py-3.5 pl-11 pr-10 text-base font-semibold bg-white border-2 border-slate-300 rounded-2xl shadow-sm focus:border-emerald-600 focus:outline-none placeholder-slate-400"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-4 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 3. 4 King Buttons (가로 2열 4대 왕버튼) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">자주 찾는 매장 바로가기</span>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setShowOnlyFavorites(false);
              }}
              className={`text-xs font-bold px-2 py-1 rounded-lg ${
                selectedCategory === 'all' && !showOnlyFavorites
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 bg-white border border-slate-200'
              }`}
            >
              전체 매장 ({stores.length}곳)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. 주유소 왕버튼 */}
            <button
              onClick={() => {
                setSelectedCategory(selectedCategory === 'gas' ? 'all' : 'gas');
                setShowOnlyFavorites(false);
              }}
              className={`p-4 rounded-2xl border-2 flex flex-col items-start gap-1 transition-all active:scale-95 shadow-sm text-left ${
                selectedCategory === 'gas'
                  ? 'bg-emerald-600 border-emerald-600 text-white ring-4 ring-emerald-200'
                  : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedCategory === 'gas' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                }`}>
                  <Fuel className="w-6 h-6" />
                </div>
                <span className={`text-xs font-bold ${selectedCategory === 'gas' ? 'text-emerald-100' : 'text-slate-400'}`}>
                  면세유 가능
                </span>
              </div>
              <span className="text-lg font-extrabold mt-1">주유소</span>
              <span className={`text-xs font-medium ${selectedCategory === 'gas' ? 'text-emerald-100' : 'text-slate-500'}`}>
                기름 넣는 곳 모아보기
              </span>
            </button>

            {/* 2. 하나로마트 왕버튼 */}
            <button
              onClick={() => {
                setSelectedCategory(selectedCategory === 'mart' ? 'all' : 'mart');
                setShowOnlyFavorites(false);
              }}
              className={`p-4 rounded-2xl border-2 flex flex-col items-start gap-1 transition-all active:scale-95 shadow-sm text-left ${
                selectedCategory === 'mart'
                  ? 'bg-emerald-600 border-emerald-600 text-white ring-4 ring-emerald-200'
                  : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedCategory === 'mart' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <span className={`text-xs font-bold ${selectedCategory === 'mart' ? 'text-emerald-100' : 'text-slate-400'}`}>
                  장보는 곳
                </span>
              </div>
              <span className="text-lg font-extrabold mt-1">하나로마트·마트</span>
              <span className={`text-xs font-medium ${selectedCategory === 'mart' ? 'text-emerald-100' : 'text-slate-500'}`}>
                면 지점 가맹점 모아보기
              </span>
            </button>

            {/* 3. 병원·약국 왕버튼 */}
            <button
              onClick={() => {
                setSelectedCategory(selectedCategory === 'hospital' ? 'all' : 'hospital');
                setShowOnlyFavorites(false);
              }}
              className={`p-4 rounded-2xl border-2 flex flex-col items-start gap-1 transition-all active:scale-95 shadow-sm text-left ${
                selectedCategory === 'hospital'
                  ? 'bg-emerald-600 border-emerald-600 text-white ring-4 ring-emerald-200'
                  : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedCategory === 'hospital' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                }`}>
                  <HeartPulse className="w-6 h-6" />
                </div>
                <span className={`text-xs font-bold ${selectedCategory === 'hospital' ? 'text-emerald-100' : 'text-slate-400'}`}>
                  건강·치료
                </span>
              </div>
              <span className="text-lg font-extrabold mt-1">병원 · 약국</span>
              <span className={`text-xs font-medium ${selectedCategory === 'hospital' ? 'text-emerald-100' : 'text-slate-500'}`}>
                의원 및 동네 약국
              </span>
            </button>

            {/* 4. 전통시장·식당 왕버튼 */}
            <button
              onClick={() => {
                setSelectedCategory(selectedCategory === 'food' ? 'all' : 'food');
                setShowOnlyFavorites(false);
              }}
              className={`p-4 rounded-2xl border-2 flex flex-col items-start gap-1 transition-all active:scale-95 shadow-sm text-left ${
                selectedCategory === 'food'
                  ? 'bg-emerald-600 border-emerald-600 text-white ring-4 ring-emerald-200'
                  : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedCategory === 'food' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                }`}>
                  <Utensils className="w-6 h-6" />
                </div>
                <span className={`text-xs font-bold ${selectedCategory === 'food' ? 'text-emerald-100' : 'text-slate-400'}`}>
                  식사·장터
                </span>
              </div>
              <span className="text-lg font-extrabold mt-1">식당 · 5일장</span>
              <span className={`text-xs font-medium ${selectedCategory === 'food' ? 'text-emerald-100' : 'text-slate-500'}`}>
                음식점 및 장터 맛집
              </span>
            </button>
          </div>
        </div>

        {/* 4. Town Filter Horizontal Pills */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-0.5">
            <span>동네(읍·면) 선택</span>
            {favorites.length > 0 && (
              <button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-extrabold transition-colors ${
                  showOnlyFavorites
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-white text-rose-600 border border-rose-200'
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>내가 찜한 단골 ({favorites.length})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedTown('all')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap border-2 shadow-xs transition-colors ${
                selectedTown === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              함평 전체
            </button>
            {towns.map((town) => (
              <button
                key={town}
                onClick={() => setSelectedTown(town === selectedTown ? 'all' : town)}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap border-2 shadow-xs transition-colors ${
                  selectedTown === town
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                }`}
              >
                {town}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Store List Header */}
        <div className="flex items-center justify-between px-1 text-sm font-bold text-slate-600 pt-2 border-t border-slate-200">
          <span>
            총 <strong className="text-emerald-700 text-base">{seniorFilteredStores.length}</strong>곳의 사용 가능 매장
          </span>
          {userLocation ? (
            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
              가까운 순서로 표시 중
            </span>
          ) : (
            <button
              onClick={onLocateMe}
              disabled={isLocating}
              className="text-xs text-emerald-700 font-extrabold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>내 위치로 정렬</span>
            </button>
          )}
        </div>

        {/* 6. Big Store Cards */}
        <div className="space-y-3">
          {seniorFilteredStores.length === 0 ? (
            <div className="py-16 bg-white rounded-2xl p-6 text-center border-2 border-dashed border-slate-200 space-y-2">
              <p className="text-base font-extrabold text-slate-700">해당하는 매장이 없습니다</p>
              <p className="text-xs text-slate-400">다른 동네(읍·면)를 누르시거나 다른 업종을 선택해 보세요.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedTown('all');
                  setSearchQuery('');
                  setShowOnlyFavorites(false);
                }}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
              >
                전체 매장 다시 보기
              </button>
            </div>
          ) : (
            seniorFilteredStores.map((store) => {
              const isFav = favorites.includes(store.id);

              return (
                <div
                  key={store.id}
                  className="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-sm hover:border-emerald-500 transition-colors space-y-3"
                >
                  {/* Card Header: Town & Distance & Favorite */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-extrabold">
                        {store.town}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                        🟢 50만원 카드 가능
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleFavorite(store.id)}
                      className={`p-2 rounded-full transition-transform active:scale-90 ${
                        isFav
                          ? 'bg-rose-50 text-rose-500'
                          : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                      }`}
                      title={isFav ? '단골가게 해제' : '단골가게로 찜하기'}
                    >
                      <Heart className={`w-5 h-5 ${isFav ? 'fill-current text-rose-500' : ''}`} />
                    </button>
                  </div>

                  {/* Store Name & Distance */}
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1">
                      {store.name}
                    </h3>
                    {store.distance !== undefined && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold text-xs">
                        <span>
                          {store.distance < 1000
                            ? `🚶 걸어서 ${Math.max(1, Math.round(store.distance / 75))}분 거리`
                            : `🚗 차로 약 ${Math.max(1, Math.round((store.distance / 1000) * 1.8))}분 거리`}
                        </span>
                        <span className="text-emerald-500 font-normal">
                          ({store.distance < 1000 ? `${Math.round(store.distance)}m` : `${(store.distance / 1000).toFixed(1)}km`})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-1.5 text-sm text-slate-600 leading-snug">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{store.roadAddress || store.address}</span>
                  </div>

                  {/* Huge Action Buttons (Min Height 52px) */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleNavi(store)}
                      className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
                    >
                      <Navigation className="w-5 h-5" />
                      <span>길안내 시작</span>
                    </button>

                    <button
                      onClick={() => handlePlaceOrPhone(store)}
                      className="py-3 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
                    >
                      <Clock className="w-5 h-5 text-emerald-400" />
                      <span>영업시간·전화</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
