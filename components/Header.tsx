'use client';

import React from 'react';
import { MapPin, Map, List, Share2, Check } from 'lucide-react';

interface HeaderProps {
  viewMode: 'map' | 'list';
  onViewModeChange: (mode: 'map' | 'list') => void;
  totalCount: number;
  availableCount: number;
}

export default function Header({
  viewMode,
  onViewModeChange,
  totalCount,
  availableCount,
}: HeaderProps) {
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: '함평콕 | 함평 민생회복지원금 사용처 지도',
          text: '함평군 2026 민생지원금 50만원 사용처를 지도와 검색으로 확인해보세요!',
          url: url,
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">함평콕</h1>
              <span className="px-1.5 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                2026 민생지원금
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate hidden sm:block">
              총 {totalCount.toLocaleString()}곳 중 사용가능 {availableCount.toLocaleString()}곳
            </p>
          </div>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mobile view toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center shadow-inner">
            <button
              onClick={() => onViewModeChange('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>지도</span>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>목록</span>
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            aria-label="공유하기"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors relative"
            title="공유하기"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            {copied && (
              <span className="absolute -bottom-8 right-0 bg-slate-800 text-white text-[11px] px-2 py-0.5 rounded shadow whitespace-nowrap z-50">
                링크 복사됨!
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
