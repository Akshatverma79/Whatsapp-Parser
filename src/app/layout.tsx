import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhatsApp Chat Viewer — Parse & Visualize Your Chats",
  description:
    "Upload your WhatsApp exported chat ZIP or TXT file and view it in a beautiful, faithful WhatsApp-style interface. 100% private — all processing happens in your browser.",
  keywords: ["whatsapp", "chat parser", "chat viewer", "whatsapp export", "chat analyzer"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
