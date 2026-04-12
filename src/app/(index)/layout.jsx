"use client";

import Navbar from "@/components/Global/Navbar";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LoaderComponent from "@/components/Global/Loader";

export default function DashboardLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const key = localStorage.getItem("admin-key");
    if (key == "undefined") {
      router.replace("/login");
    }
    console.log(key);
    const loggedIn = !!key;

    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      router.replace("/login");
    }
  }, []);

  // 🚫 Block entire layout (Navbar included)
  if (isLoggedIn === null) return <LoaderComponent />;
  if (!isLoggedIn) return null;
  return (
    <div className="bg-slate-50 text-slate-900 ">
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-hidden mt-20">
          <div className="ml-0 md:ml-64 p-4 ">{children}</div>
        </div>
      </div>
    </div>
  );
}
