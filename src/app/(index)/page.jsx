"use client";
import KPIBoxGroup from "@/components/Dashboard/KpiBox";
import ChartGroup from "@/components/Charts/ChartGroup";
import fetchDashboardData, { initialData } from "@/store/dashboardAPI";
import { useEffect, useState } from "react";
import Loader from "@/components/Global/Loader";
import Socket from "@/components/Socket/socket";

const Home = () => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const setLoadingFun = (data) => {
    setLoading(data);
  };

  const loadData = async (setLoadingFun) => {
    const dashboardData = await fetchDashboardData(setLoadingFun);
    setData(dashboardData);
  };

  useEffect(() => {
    if (Socket.connected) {
      return;
    } else {
      Socket.on("connect", () => {
        console.log("Connected to Socket.IO server");
      });
    }

    Socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });
  }, []);

  useEffect(() => {
    loadData(setLoadingFun);
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="min-h-screen w-full relative overflow-hidden">
          {/* Modern gradient background */}
          <div className="absolute inset-0 bg-white"></div>
          {/* <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-purple-100/20"></div> */}

          <div
            className={`relative z-10 w-full flex-col scroll-smooth justify-center items-center flex-1 px-4 sm:px-6 lg:px-8 py-8 transition-all duration-1000 ease-out ${isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
              }`}
          >
            {/* Modern header section */}
            <div className="text-center mb-12 max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/25">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>

              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-4 tracking-tight">
                Dashboard
              </h1>

              <p className="text-xl text-gray-600 font-medium leading-relaxed">
                Welcome back! Here's what's happening with your business today.
              </p>

              <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mt-6"></div>
            </div>

            {/* Content sections with staggered animations */}
            <div
              className={`transition-all duration-700 delay-200 ease-out ${isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
                }`}
            >
              <KPIBoxGroup kpiData={data.kpiData} />
            </div>

            <div
              className={`transition-all duration-700 delay-400 ease-out ${isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
                }`}
            >
              <ChartGroup chartData={data.chartData} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Home;
