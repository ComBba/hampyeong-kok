'use client';

import React, { useState, useEffect } from 'react';
import { getDDayInfo, DDayInfo } from '@/lib/d-day';
import { Clock, Info, X, AlertCircle } from 'lucide-react';

export default function DDayBadge() {
  const [dDay, setDDay] = useState<DDayInfo | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setDDay(getDDayInfo('2026-12-31'));
  }, []);

  if (!dDay) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-300 text-xs font-bold whitespace-nowrap flex-shrink-0 transition-colors cursor-pointer shadow-2xs"
        title="2026 지원금 사용 유효기간 확인"
      >
        <Clock className="w-3 h-3 text-amber-600 flex-shrink-0 animate-pulse" />
        <span>마감 {dDay.formattedText}</span>
        <span className="text-[10px] text-amber-700 hidden sm:inline font-semibold">
          (12.31까지)
        </span>
      </button>

      {showModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-xl border border-slate-100 space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-bold">
                  유효기간 {dDay.formattedText}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {dDay.targetDateStr} 자정까지
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                함평군 2026 민생지원금 50만 원<br />
                사용 기한 안내
              </h3>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-2 leading-relaxed">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>미사용 잔액 자동 소멸:</strong> 2026년 12월 31일 24:00 이후 남은 선불카드 잔액은 전액 국고로 환수되어 사용할 수 없습니다.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>선불카드 보관:</strong> 분실 시 재발급 절차가 번거로우므로, 장날 및 장보실 때 잊지 마시고 기한 내 알뜰하게 사용하시길 권장합니다.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm"
            >
              확인했습니다
            </button>
          </div>
        </div>
      )}
    </>
  );
}
