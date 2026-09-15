export interface MarketInfo {
  name: string;
  town: string;
  days: number[]; // single-digit day endings (e.g. 2, 7)
  cycleText: string;
  description: string;
}

export const HAMPYEONG_MARKETS: MarketInfo[] = [
  { 
    name: '함평천지전통시장', 
    town: '함평읍', 
    days: [2, 7], 
    cycleText: '매월 2, 7일 (2·7·12·17·22·27일)',
    description: '함평천지 전통시장 장날' 
  },
  { 
    name: '월야 5일시장', 
    town: '월야면', 
    days: [5, 0], 
    cycleText: '매월 5, 10일 (5·10·15·20·25·30일)',
    description: '월야면 5일장 서는 날' 
  },
  { 
    name: '나산 5일시장', 
    town: '나산면', 
    days: [4, 9], 
    cycleText: '매월 4, 9일 (4·9·14·19·24·29일)',
    description: '나산면 5일장 서는 날' 
  },
  { 
    name: '해보 5일시장', 
    town: '해보면', 
    days: [3, 8], 
    cycleText: '매월 3, 8일 (3·8·13·18·23·28일)',
    description: '해보 문장 5일장 서는 날' 
  },
];

export function getTodayMarket(date: Date = new Date()): MarketInfo | null {
  const day = date.getDate();
  const lastDigit = day % 10;

  for (const market of HAMPYEONG_MARKETS) {
    if (market.days.includes(lastDigit)) {
      return market;
    }
  }
  return null;
}

export function getNextMarket(date: Date = new Date()): { market: MarketInfo; daysLeft: number; nextDate: Date } {
  const current = new Date(date);
  for (let i = 1; i <= 10; i++) {
    const nextDate = new Date(current);
    nextDate.setDate(current.getDate() + i);
    const lastDigit = nextDate.getDate() % 10;
    for (const market of HAMPYEONG_MARKETS) {
      if (market.days.includes(lastDigit)) {
        return { market, daysLeft: i, nextDate };
      }
    }
  }
  return { market: HAMPYEONG_MARKETS[0], daysLeft: 1, nextDate: current };
}
