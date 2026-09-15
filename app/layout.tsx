import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
      ? process.env.NEXT_PUBLIC_SITE_URL
      : 'https://hampyeong-kok.vercel.app'
  ),
  title: "함평콕 | 2026 함평 민생회복지원금 50만원 가맹점 스마트 지도",
  description: "2026년 함평군 민생회복지원금 50만 원 선불카드 가맹점 1,028곳 완벽 정리! 4대 5일장, 면 지역 하나로마트 예외 안내 및 내 위치 기준 반경·거리순 길안내.",
  keywords: [
    "함평콕",
    "함평",
    "함평민생지원금",
    "함평사랑상품권",
    "함평지원금사용처",
    "함평하나로마트",
    "함평5일장",
    "함평선불카드",
    "함평가맹점"
  ],
  authors: [{ name: "함평콕" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/logo-symbol.png", type: "image/png", sizes: "512x512" }
    ],
    shortcut: "/favicon.ico",
    apple: "/images/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "함평콕 | 2026 함평 민생회복지원금(50만 원) 가맹점 스마트 지도",
    description: "함평군 1,028개 가맹점 전수 분석! 4대 5일장, 면지역 하나로마트, 주유소 등 내 주변 사용처를 지도에서 콕!",
    url: "https://hampyeong-kok.vercel.app",
    siteName: "함평콕",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "함평콕 - 함평군 민생지원금 가맹점 스마트 지도",
      },
    ],
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "함평콕 | 2026 함평 민생회복지원금(50만 원) 가맹점 스마트 지도",
    description: "함평군 1,028개 가맹점 전수 분석! 4대 5일장, 면지역 하나로마트, 주유소 등 내 주변 사용처를 지도에서 콕!",
    images: ["/images/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#10b981",
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
