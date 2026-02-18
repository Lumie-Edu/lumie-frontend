import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/src/shared/providers/QueryProvider";
import { AuthModalProvider } from "@/src/shared/providers/AuthModalProvider";
import { AuthModal } from "@/src/widgets/auth-modal";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "Lumie - 혁신과 우아함이 만나는 곳",
  description: "완벽함을 추구하는 분들을 위해 설계된 AI 기반 업무 플랫폼. 천만 사용자의 선택.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} ${notoSansKR.variable} font-sans antialiased min-h-screen`}>
        <QueryProvider>
          <AuthModalProvider>
            {children}
            <AuthModal />
            <Toaster richColors position="bottom-right" />
          </AuthModalProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
