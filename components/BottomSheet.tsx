'use client';

import React, { useState } from 'react';
import { Store } from '@/types/store';
import StoreCard from './StoreCard';
import { ChevronUp, ChevronDown, X } from 'lucide-react';

interface BottomSheetProps {
  stores: Store[];
  selectedStore: Store | null;
  onSelectStore: (store: Store | null) => void;
  totalFiltered: number;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
}

export default function BottomSheet({
  stores,
  selectedStore,
  onSelectStore,
  totalFiltered,
  favorites = [],
  onToggleFavorite,
}: BottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-20 md:hidden bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 transition-all duration-300 ease-in-out flex flex-col ${
        selectedStore
          ? 'max-h-[75vh]'
          : isExpanded
          ? 'h-[75vh]'
          : 'h-[110px]'
      }`}
    >
      {/* Handle / Header bar */}
      <div
        onClick={() => {
          if (!selectedStore) {
            setIsExpanded(!isExpanded);
          }
        }}
        className="w-full py-2.5 px-4 flex flex-col items-center justify-center cursor-pointer select-none border-b border-slate-100 flex-shrink-0"
      >
        <div className="w-10 h-1 rounded-full bg-slate-300 mb-1.5" />
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800">
              {selectedStore ? '선택한 가맹점' : '현재 검색 결과'}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {totalFiltered.toLocaleString()}곳
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            {selectedStore ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStore(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button className="p-1">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {selectedStore ? (
          <div className="pb-4">
            <StoreCard
              store={selectedStore}
              isSelected={true}
              showDetails={true}
              isFavorite={favorites.includes(selectedStore.id)}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        ) : stores.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            조건에 일치하는 가맹점이 없습니다.
          </div>
        ) : (
          stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              isSelected={false}
              onSelect={() => onSelectStore(store)}
              isFavorite={favorites.includes(store.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))
        )}
      </div>
    </div>
  );
}
