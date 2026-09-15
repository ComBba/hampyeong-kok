'use client';

import React from 'react';
import { Search, X, MapPin } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSelectQuickTag?: (tag: string) => void;
  onLocateMe?: () => void;
  isLocating?: boolean;
}

const QUICK_TAGS = [
  { label: '하나로마트', query: '하나로마트' },
  { label: '주유소', query: '주유소' },
  { label: '약국', query: '약국' },
  { label: '카페', query: '카페' },
  { label: '식당/맛집', query: '식당' },
  { label: '편의점', query: '편의점' },
];

export default function SearchBar({
  value,
  onChange,
  onSelectQuickTag,
  onLocateMe,
  isLocating,
}: SearchBarProps) {
  return (
    <div className="space-y-2">
      {/* Search Input */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="가게 이름, 읍·면, 도로명 주소 검색 (예: 문장리 주유소)"
          className="w-full pl-10 pr-20 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-all"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <button
              onClick={() => onChange('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="검색어 지우기"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {onLocateMe && (
            <button
              onClick={onLocateMe}
              disabled={isLocating}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                isLocating
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 animate-pulse'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-emerald-700'
              }`}
              title="내 주변 찾기"
            >
              <MapPin className={`w-3 h-3 ${isLocating ? 'text-emerald-600 animate-spin' : 'text-emerald-500'}`} />
              <span className="hidden sm:inline">내 위치</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Search Tag Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-slate-400 text-[11px] font-medium flex-shrink-0 pl-0.5">추천:</span>
        {QUICK_TAGS.map((tag) => (
          <button
            key={tag.label}
            onClick={() => onSelectQuickTag && onSelectQuickTag(tag.query)}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors border ${
              value.includes(tag.query)
                ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
            }`}
          >
            #{tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}
