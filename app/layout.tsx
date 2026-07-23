import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "명운서재 | 내 운명을 읽고, 다음 선택을 설계하다",
  description:
    "전통 명리 해석과 AI 기술로 지금 필요한 선택을 안내하는 개인화 사주 상담",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#173b36",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
