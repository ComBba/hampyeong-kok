export interface DDayInfo {
  daysLeft: number;
  targetDateStr: string;
  formattedText: string;
  isExpired: boolean;
}

export function getDDayInfo(targetDateStr = '2026-12-31'): DDayInfo {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const [y, m, d] = targetDateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);

  const diffMs = target.getTime() - startOfToday.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return {
    daysLeft,
    targetDateStr: `${y}년 ${m}월 ${d}일`,
    formattedText: daysLeft > 0 ? `D-${daysLeft}` : daysLeft === 0 ? 'D-Day' : '종료',
    isExpired: daysLeft < 0,
  };
}
