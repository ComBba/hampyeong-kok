'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, X } from 'lucide-react';

interface HanaroMartAlertProps {
  onFilterAvailableOnly: () => void;
  isFilteredToAvailable: boolean;
}

export default function HanaroMartAlert({
  onFilterAvailableOnly,
  isFilteredToAvailable,
}: HanaroMartAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 text-xs text-amber-950 shadow-xs relative transition-all">
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-2.5 right-2.5 text-amber-500 hover:text-amber-800 p-0.5 rounded-lg"
        title="닫기"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start gap-2 pr-6">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1.5 flex-1">
          <div className="font-bold text-amber-900 flex items-center gap-1.5 flex-wrap">
            <span>하나로마트 이용 전 꼭 확인하세요!</span>
            <span className="text-[10px] font-semibold bg-amber-200/70 text-amber-800 px-1.5 py-0.2 rounded">
              매출 30억 기준
            </span>
          </div>

          <div className="space-y-1 text-[11px] leading-relaxed text-amber-900/90">
            <div className="flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <span>
                <strong>함평읍 본점 2곳 불가:</strong> 함평농협 본점, 함평축협 본점 (연매출 30억 초과)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>면 단위 지점 8곳 가능:</strong> 손불·신광·학교·엄다·대동·나산·해보·월야점
              </span>
            </div>
          </div>

          {!isFilteredToAvailable && (
            <button
              onClick={onFilterAvailableOnly}
              className="mt-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
            >
              <span>사용 가능한 하나로마트만 모아보기 (8곳)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
