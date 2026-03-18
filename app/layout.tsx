import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "LeaseSignal — Commercial Lease Expiration Intelligence",
  description: "Monthly feed of upcoming CRE lease expirations by market — tenant name, square footage, expiration date, and landlord ex",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#0A0900", color: "#E8EAF0", fontFamily: "monospace", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
