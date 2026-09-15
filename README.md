# 함평콕 (hampyeong-kok) 🌿

> **"2026년 함평 민생회복지원금, 어디서 쓸 수 있을까?"**  
> 함평군 1,025개 가맹점 전수 데이터 분석 및 위치 기반 네이버 지도·실시간 검색 웹 서비스

---

## 🌟 주요 기능

1. **초고속 통합 검색 & 추천 태그**
   - 상호명, 읍·면, 도로명 주소, 업종 실시간 검색
   - 추천 검색어 태그 (`#하나로마트`, `#주유소`, `#약국`, `#식당`, `#카페` 등)
2. **지원금 사용 가능 여부 판정 (3단계)**
   - 🟢 **사용 가능**: 관내 일반음식점, 카페, 동네마트, 전통시장, 정육점, 병원/약국, 주유소 등
   - 🟢 **예외 허용**: **면 지역 하나로마트** (손불, 신광, 학교, 엄다, 대동, 나산, 해보, 월야 등)
   - 🔴 **사용 불가**: 연매출 30억 원 초과 대형마트(함평읍 본점 등), 유흥/사행성 업종
   - 🟡 **확인 필요**: 대형 식자재마트 및 직영점 여부 확인 대상
3. **네이버 지도 (NAVER Maps v3) 연동**
   - 상태별 마커 (🟢 사용가능 / 🟡 확인필요 / 🔴 사용불가)
   - 마커 클릭 시 매장 상세정보 및 판정 근거 표시
   - 원클릭 네이버 지도 길찾기 연동
4. **모바일 최적화 (Mobile-First UX)**
   - 하단 바텀시트(Bottom Sheet) 인터랙션
   - [ 🗺 지도 ↔ ☰ 목록 ] 원클릭 뷰 모드 전환
   - 내 위치(GPS) 기반 가까운 매장 정렬 기능
5. **0원 서버 운영 & 정적 JSON 아키텍처**
   - 함평군 1,025곳 마스터 데이터를 경량 정적 JSON(`stores.json`, 압축 시 ~40KB)으로 빌드
   - 별도 DB 서버 비용 없이 Vercel Edge CDN에서 즉각 응답 (검색 반응속도 0.01초)

---

## 🛠 기술 스택

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Map & Geocoding**: NAVER Maps JavaScript API v3, NAVER Geocoding API (`maps.apigw.ntruss.com`)
- **Data Pipeline**: Python 3, openpyxl, urllib
- **Deploy**: Vercel + GitHub

---

## 📂 프로젝트 구조

```text
hampyeong-kok/
├── app/
│   ├── layout.tsx         # 전역 레이아웃 및 메타태그
│   ├── page.tsx           # 메인 반응형 화면 (상태 머신)
│   └── globals.css        # Tailwind 전역 스타일
├── components/
│   ├── Header.tsx         # 상단 헤더, 카운터, 뷰 전환, 공유
│   ├── SearchBar.tsx      # 실시간 검색바, 추천 태그, GPS 버튼
│   ├── FilterBar.tsx      # 읍·면, 업종, 지원금 상태 필터 칩
│   ├── StoreCard.tsx      # 매장 카드, 판정 사유, 길찾기/복사
│   ├── NaverMap.tsx       # 네이버 지도 v3 컴포넌트 & 마커
│   └── BottomSheet.tsx    # 모바일 전용 바텀시트
├── public/
│   └── data/
│       └── stores.json    # 1,025개 가맹점 좌표 마스터 데이터
├── raw_data/
│   ├── hplovegiftcard_2026.xlsx  # 함평군청 공식 원본 파일
│   └── geocode_cache.json        # 주소 좌표 캐시
├── scripts/
│   └── process_stores.py  # 엑셀 정제, 규칙 판정 및 Geocoding 스크립트
├── .env.example           # 환경변수 템플릿
└── package.json
```

---

## 🚀 로컬 실행 방법

1. 의존성 설치:
   ```bash
   npm install
   ```

2. 환경변수 설정:
   `.env.example`을 참고하여 `.env` 파일에 네이버 클라우드 Maps Client ID를 입력합니다:
   ```env
   NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_client_id_here
   NAVER_MAP_CLIENT_SECRET=your_client_secret_here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. 가맹점 데이터 갱신 (선택 사항):
   ```bash
   npm run process-data
   ```

4. 로컬 개발 서버 실행:
   ```bash
   npm run dev
   ```
   브라우저에서 `http://localhost:3000` 접속

---

## 📜 데이터 출처
- 함평군청 공식 함평사랑상품권 가맹점 현황 (2026년 최신 자료)
- 2026년 함평군 민생회복지원금 지급 및 사용 제한 지침
