'use client';

import React from 'react';
import { Store } from '@/types/store';
import { MapPin, Navigation, ExternalLink, Info, CheckCircle2, AlertTriangle, XCircle, Copy, Check } from 'lucide-react';

interface StoreCardProps {
  store: Store;
  isSelected?: boolean;
  onSelect?: () => void;
  showDetails?: boolean;
}

export default function StoreCard({
  store,
  isSelected,
  onSelect,
  showDetails = false,
}: StoreCardProps) {
  const [copied, setCopied] = React.useState(false);

  const getStatusBadge = () => {
    switch (store.status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {store.badge}
          </span>
        );
      case 'unavailable':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            {store.badge}
          </span>
        );
      case 'verify':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            {store.badge}
          </span>
        );
    }
  };

  const openNaverMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${store.name} ${store.address}`);
    window.open(`https://map.naver.com/v5/search/${query}`, '_blank');
  };

  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(store.roadAddress || store.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-2xl border transition-all cursor-pointer bg-white ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/20'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Header: Badge & Category */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {getStatusBadge()}
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            {store.town}
          </span>
          <span className="text-[11px] text-slate-500">
            {store.category}
          </span>
        </div>

        {store.distance !== undefined && (
          <span className="text-xs font-bold text-emerald-600 flex-shrink-0">
            {store.distance < 1000
              ? `${Math.round(store.distance)}m`
              : `${(store.distance / 1000).toFixed(1)}km`}
          </span>
        )}
      </div>

      {/* Store Name */}
      <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
        {store.name}
      </h3>

      {/* Address */}
      <div className="flex items-center gap-1 text-xs text-slate-600 mb-2">
        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span className="truncate">{store.roadAddress || store.address}</span>
      </div>

      {/* Reason Box */}
      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-1.5 text-xs text-slate-700 mb-3">
        <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
        <span className="leading-snug">{store.reason}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <button
          onClick={openNaverMap}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg transition-colors"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
          <span>네이버 지도 길찾기</span>
        </button>

        <button
          onClick={copyAddress}
          className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
          title="주소 복사"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? '복사됨' : '주소복사'}</span>
        </button>
      </div>
    </div>
  );
}
