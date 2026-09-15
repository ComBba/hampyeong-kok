'use client';

import React from 'react';
import { StoreStatus, DistanceRadius, SortOption, UserLocation } from '@/types/store';
import { ArrowUpDown, Compass } from 'lucide-react';

interface FilterBarProps {
  towns: string[];
  categories: string[];
  selectedTown: string;
  onTownChange: (town: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedStatus: StoreStatus | 'all';
  onStatusChange: (status: StoreStatus | 'all') => void;
  counts: {
    all: number;
    available: number;
    unavailable: number;
    verify: number;
  };
  selectedRadius?: DistanceRadius;
  onRadiusChange?: (radius: DistanceRadius) => void;
  sortOption?: SortOption;
  onSortOptionChange?: (sort: SortOption) => void;
  userLocation?: UserLocation | null;
  onLocateMe?: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  '음식점': '🍽️',
  '카페·디저트': '☕',
  '마트·편의점': '🛒',
  '농협·하나로마트': '🌾',
  '주유소·충전소': '⛽',
  '약국': '💊',
  '병원·의원': '🏥',
  '미용·뷰티': '✂️',
  '생활·서비스': '🧺',
  '숙박': '🏨',
  '자동차·정비': '🚗',
  '농자재·철물': '🔧',
  '정육·수산·식품': '🥩',
  '학원·교육': '📚',
  '기타': '🏪',
};

const RADIUS_OPTIONS: { label: string; value: DistanceRadius; sub: string }[] = [
  { label: '거리 전체', value: 'all', sub: '무제한' },
  { label: '500m', value: 500, sub: '도보 7분' },
  { label: '1km', value: 1000, sub: '도보 15분' },
  { label: '3km', value: 3000, sub: '차량 5분' },
  { label: '5km', value: 5000, sub: '차량 10분' },
];

export default function FilterBar({
  towns,
  categories,
  selectedTown,
  onTownChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  counts,
  selectedRadius = 'all',
  onRadiusChange,
  sortOption = 'distance',
  onSortOptionChange,
  userLocation,
  onLocateMe,
}: FilterBarProps) {
  return (
    <div className="space-y-2.5">
      {/* 1. Status Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
        <button
          onClick={() => onStatusChange('available')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all border whitespace-nowrap flex-shrink-0 ${
            selectedStatus === 'available'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>사용 가능만</span>
          <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
            selectedStatus === 'available' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {counts.available}
          </span>
        </button>

        <button
          onClick={() => onStatusChange('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all border whitespace-nowrap flex-shrink-0 ${
            selectedStatus === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>전체보기</span>
          <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
            selectedStatus === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {counts.all}
          </span>
        </button>

        {counts.verify > 0 && (
          <button
            onClick={() => onStatusChange('verify')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all border whitespace-nowrap flex-shrink-0 ${
              selectedStatus === 'verify'
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>확인필요</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
              selectedStatus === 'verify' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {counts.verify}
            </span>
          </button>
        )}

        {counts.unavailable > 0 && (
          <button
            onClick={() => onStatusChange('unavailable')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all border whitespace-nowrap flex-shrink-0 ${
              selectedStatus === 'unavailable'
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>사용불가</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
              selectedStatus === 'unavailable' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'
            }`}>
              {counts.unavailable}
            </span>
          </button>
        )}
      </div>

      {/* 2. Radius (Distance) Filter Chips */}
      {onRadiusChange && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
          <span className="text-slate-400 text-[11px] font-medium flex-shrink-0 pl-0.5 flex items-center gap-0.5">
            <Compass className="w-3 h-3 text-emerald-600" />
            <span>반경:</span>
          </span>
          {RADIUS_OPTIONS.map((opt) => {
            const isSelected = selectedRadius === opt.value;
            return (
              <button
                key={String(opt.value)}
                onClick={() => {
                  if (opt.value !== 'all' && !userLocation && onLocateMe) {
                    onLocateMe();
                  }
                  onRadiusChange(opt.value);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border whitespace-nowrap flex-shrink-0 transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <span>{opt.label}</span>
                <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {opt.sub}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Town / Region Selector Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-xs">
        <button
          onClick={() => onTownChange('all')}
          className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
            selectedTown === 'all'
              ? 'bg-slate-800 text-white font-bold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          전체 읍·면
        </button>
        {towns.map((town) => (
          <button
            key={town}
            onClick={() => onTownChange(town)}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
              selectedTown === town
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {town}
          </button>
        ))}
      </div>

      {/* 4. Category Horizontal Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => onCategoryChange('all')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full border whitespace-nowrap flex-shrink-0 transition-colors ${
            selectedCategory === 'all'
              ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <span>🏷️</span>
          <span>전체 업종</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border whitespace-nowrap flex-shrink-0 transition-colors ${
              selectedCategory === cat
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <span>{CATEGORY_ICONS[cat] || '🏪'}</span>
            <span>{cat}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
