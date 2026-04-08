import "../../globals.css";

export const metadata = {
  title: "MrHalwai Admin Dashboard",
  description: "Admin dashboard for MrHalwai",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-slate-50 text-slate-900 ">
          <div className="">{children}</div>
        </div>
      </body>
    </html>
  );
}
