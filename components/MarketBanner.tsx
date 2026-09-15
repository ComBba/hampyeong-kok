'use client';

import React, { useState, useEffect } from 'react';
import { getTodayMarket, getNextMarket, MarketInfo } from '@/lib/market-days';
import { ShoppingBag, Calendar, ArrowRight, X } from 'lucide-react';

interface MarketBannerProps {
  onSelectTown: (town: string) => void;
  selectedTown: string;
}

export default function MarketBanner({ onSelectTown, selectedTown }: MarketBannerProps) {
  const [todayMarket, setTodayMarket] = useState<MarketInfo | null>(null);
  const [nextMarketInfo, setNextMarketInfo] = useState<{ market: MarketInfo; daysLeft: number; nextDate: Date } | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const today = getTodayMarket();
    setTodayMarket(today);
    if (!today) {
      setNextMarketInfo(getNextMarket());
    }
  }, []);

  if (isDismissed) return null;

  if (todayMarket) {
    const isFilteredToTown = selectedTown === todayMarket.town;

    return (
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-3.5 py-2 rounded-2xl shadow-sm flex items-center justify-between gap-2 text-xs transition-all">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold tracking-tight">오늘 장날!</span>
              <span className="font-semibold bg-white/20 px-1.5 py-0.2 rounded text-[11px]">
                {todayMarket.name}
              </span>
            </div>
            <p className="text-[11px] text-amber-100 truncate">
              {todayMarket.town} 5일장에서 지원금 선불카드를 사용하세요
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onSelectTown(isFilteredToTown ? 'all' : todayMarket.town)}
            className={`px-2.5 py-1 rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center gap-1 whitespace-nowrap ${
              isFilteredToTown
                ? 'bg-white text-orange-700'
                : 'bg-white/90 hover:bg-white text-orange-800'
            }`}
          >
            <span>{isFilteredToTown ? '전체보기' : `${todayMarket.town} 장터 모아보기`}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-white/70 hover:text-white rounded-lg"
            title="닫기"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (nextMarketInfo) {
    return (
      <div className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>
            다음 장날: <strong>{nextMarketInfo.market.name}</strong> ({nextMarketInfo.daysLeft}일 후)
          </span>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-slate-600 p-0.5"
          title="닫기"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return null;
}
