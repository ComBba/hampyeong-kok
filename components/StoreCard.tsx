'use client';

import React from 'react';
import { Store } from '@/types/store';
import { 
  MapPin, 
  Navigation, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Copy, 
  Check, 
  ExternalLink,
  Fuel,
  Clock,
  Eye
} from 'lucide-react';

interface StoreCardProps {
  store: Store;
  isSelected?: boolean;
  onSelect?: () => void;
  showDetails?: boolean;
  onViewRoadView?: (store: Store) => void;
}

export default function StoreCard({
  store,
  isSelected,
  onSelect,
  showDetails = false,
  onViewRoadView,
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

  // 1. 네이버 지도 실시간 길찾기 (좌표 직접 전달)
  const openNaverMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (store.lat && store.lng) {
      const navUrl = `https://map.naver.com/p/directions/-,/${store.lng},${store.lat},${encodeURIComponent(store.name)},,/-/car`;
      const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = `nmap://route/car?dlat=${store.lat}&dlng=${store.lng}&dname=${encodeURIComponent(store.name)}&appname=hampyeong-kok`;
        setTimeout(() => {
          window.open(navUrl, '_blank');
        }, 600);
        return;
      }
      window.open(navUrl, '_blank');
    } else {
      const q = encodeURIComponent(`${store.name} ${store.town || '함평'}`);
      window.open(`https://map.naver.com/p/search/${q}`, '_blank');
    }
  };

  // 2. 네이버 스마트플레이스 실시간 영업시간·휴무일·리뷰 확인
  const openNaverPlace = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${store.name} ${store.town || '함평'}`);
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const placeUrl = isMobile
      ? `https://m.search.naver.com/search.naver?query=${query}`
      : `https://map.naver.com/p/search/${query}`;
    window.open(placeUrl, '_blank');
  };

  // 3. 주유소 실시간 유가 확인 (오피넷/네이버)
  const openGasPrice = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${store.name} 주유소`);
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const gasUrl = isMobile
      ? `https://m.search.naver.com/search.naver?query=${query}`
      : `https://map.naver.com/p/search/${query}`;
    window.open(gasUrl, '_blank');
  };

  // 4. 거리뷰
  const handleRoadView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewRoadView) {
      onViewRoadView(store);
    } else {
      const query = encodeURIComponent(`${store.name} ${store.town || '함평'}`);
      window.open(`https://map.naver.com/p/search/${query}`, '_blank');
    }
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
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/15'
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
          <span className="text-[11px] text-slate-500 font-medium">
            {store.category}
          </span>
        </div>

        {store.distance !== undefined && (
          <span className="text-[11px] font-bold text-emerald-700 flex-shrink-0 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs whitespace-nowrap">
            {store.distance < 1000
              ? `🚶 도보 ${Math.max(1, Math.round(store.distance / 75))}분 (${Math.round(store.distance)}m)`
              : `🚗 차 ${Math.max(1, Math.round((store.distance / 1000) * 1.8))}분 (${(store.distance / 1000).toFixed(1)}km)`}
          </span>
        )}
      </div>

      {/* Store Name */}
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          {store.name}
        </h3>
        {store.regDate && (
          <span className="text-[10px] text-slate-400 flex-shrink-0">
            {store.regDate}
          </span>
        )}
      </div>

      {/* Address */}
      <div className="flex items-center gap-1 text-xs text-slate-600 mb-2">
        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span className="truncate">{store.roadAddress || store.address}</span>
      </div>

      {/* Reason Box */}
      <div className={`p-2.5 rounded-xl border flex items-start gap-1.5 text-xs mb-2.5 ${
        store.status === 'unavailable' 
          ? 'bg-rose-50 border-rose-100 text-rose-800 font-medium'
          : store.status === 'verify'
          ? 'bg-amber-50 border-amber-100 text-amber-800'
          : 'bg-slate-50 border-slate-100 text-slate-700'
      }`}>
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
        <span className="leading-snug">{store.reason}</span>
      </div>

      {/* Special Feature 1: Gas Station Live Price Banner */}
      {store.isGasStation && (
        <div className="mb-2.5 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-blue-900 font-semibold">
            <Fuel className="w-4 h-4 text-blue-600" />
            <span>실시간 기름값 (휘발유/경유)</span>
          </div>
          <button
            onClick={openGasPrice}
            className="text-[11px] font-bold text-blue-700 bg-white px-2 py-1 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors flex items-center gap-0.5 shadow-2xs"
          >
            <span>유가 조회</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      )}

      {/* Special Feature 2: Prominent Naver SmartPlace Business Hours & Info Callout */}
      <div className="mb-3 p-2 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/70 hover:border-emerald-200 transition-colors flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <Clock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">영업시간 · 휴무일 · 리뷰</span>
        </div>
        <button
          onClick={openNaverPlace}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white px-2 py-1 rounded-lg border border-emerald-200 shadow-2xs"
        >
          <span>스마트플레이스 확인</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Bottom Action Buttons Row */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
        {/* Naver Navigation */}
        <button
          onClick={openNaverMap}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
          title="네이버 지도로 바로 길안내 시작"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>길찾기</span>
        </button>

        {/* Road View */}
        <button
          onClick={handleRoadView}
          className="flex items-center gap-1 py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          title="가게 전경 및 거리뷰 확인"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>거리뷰</span>
        </button>

        {/* Copy Address */}
        <button
          onClick={copyAddress}
          className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
          title="주소 복사"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
