import "./globals.css";

export const metadata = {
  title: "MrHalwai Admin Dashboard",
  description: "Admin dashboard for MrHalwai",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
