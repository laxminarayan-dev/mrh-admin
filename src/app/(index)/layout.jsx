import "../globals.css";
import Navbar from "@/components/Global/Navbar";

export const metadata = {
  title: "MrHalwai Admin Dashboard",
  description: "Admin dashboard for MrHalwai",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-slate-50 text-slate-900 ">
          <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
            <Navbar />
            <div className="flex-1 overflow-hidden mt-20">
              <div className="ml-0 md:ml-64 p-4 ">{children}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
