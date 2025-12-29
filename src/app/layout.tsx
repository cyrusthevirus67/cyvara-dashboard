import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cyvara | Dashboard",
  description: "Cyvara client dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
        {children}
      </body>
    </html>
  );
}
