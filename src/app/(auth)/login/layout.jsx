"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LoaderComponent from "@/components/Global/Loader";
export default function LoginLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const key = localStorage.getItem("admin-key");
    if (key != "undefined") {
      const loggedIn = !!key;

      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        router.replace("/");
      }
    }
  }, []);

  // 🚫 Block entire layout (Navbar included)
  if (!isLoggedIn === null) return <LoaderComponent />;
  if (isLoggedIn) return null;
  return (
    <div className="bg-slate-50 text-slate-900 ">
      <div className="">{children}</div>
    </div>
  );
}
