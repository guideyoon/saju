import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://myeongun-seojae-mvp.guideyoon.chatgpt.site"),
  title: {
    default: "명운서재 | 근거를 보여주는 사주 해석",
    template: "%s | 명운서재",
  },
  description:
    "생년월일시의 사주 원국과 오행·십성·대운을 계산하고, 해석의 근거와 한계를 함께 안내합니다.",
  applicationName: "명운서재",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "명운서재",
    description: "근거와 한계를 함께 보여주는 개인 사주 해석",
    type: "website",
    locale: "ko_KR",
  },
  robots: {
    index: false,
    follow: false,
  },
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
