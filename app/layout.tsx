import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "함평콕 | 2026 함평 민생회복지원금 사용처 지도·검색",
  description: "함평군 2026년 민생회복지원금 50만 원 선불카드 사용 가능 가맹점 검색, 면 지역 하나로마트 예외 안내 및 네이버 지도 위치 찾기 서비스",
  keywords: ["함평", "함평민생지원금", "함평사랑상품권", "함평콕", "함평지원금사용처", "하나로마트", "선불카드"],
  authors: [{ name: "함평콕" }],
  openGraph: {
    title: "함평콕 | 함평 민생지원금 어디서 쓸 수 있을까?",
    description: "함평군 1,025개 가맹점 전수 분석! 가능/불가/면지역 하나로마트 예외까지 지도에서 한눈에 확인하세요.",
    type: "website",
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" as="style" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
      </head>
      <body className="antialiased select-none md:select-auto bg-slate-50">
        {children}
      </body>
    </html>
  );
}
