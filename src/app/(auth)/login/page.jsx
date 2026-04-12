"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Loader, TriangleAlert } from "lucide-react";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { handleAdminLogin } from "@/store/employeeAPI";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    if (email.trim() == "" || password.trim() == "") {
      setLoading(false);
      setError({
        title: "Email & Password Required",
        description: "Email and Password can not be empty!",
      });
    } else {
      const response = await handleAdminLogin({ email, password });
      if (response.status == 401) {
        setError({
          title: response.message,
          description: "Given credentials are invalid!",
        });
      } else if (response.status == 404) {
        setError({
          title: response.message,
          description: "No Admin account is regeistered with given Email!",
        });
      } else if (response.status == 500) {
        setError({
          title: response.message,
          description:
            "There is an Internal Server Error, Please try after some time or contact the support team!",
        });
      } else {
        localStorage.setItem("admin-key", response?.token);
        router.replace("/");
      }
    }
    setTimeout(() => {
      setLoading(false);
      setError(null);
    }, 2000);
  };
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100">
      <div className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-emerald-300/45 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-amber-300/55 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-6 px-4 py-6 lg:grid-cols-[1.05fr_1fr] lg:px-8">
        <section className="hidden rounded-3xl border border-white/70 bg-gradient-to-br from-gray-700 via-emerald-600 to-amber-500 p-8 text-white shadow-2xl lg:flex lg:min-h-[560px] lg:flex-col lg:justify-between">
          <div>
            <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/15 px-2 py-2 backdrop-blur-sm">
              <Image
                src="/logo.png"
                alt="MrHalwai"
                width={34}
                height={34}
                className="rounded-full bg-white p-1"
              />
              <span className="text-sm tracking-wide pr-2">
                MrHalwai Admin Panel
              </span>
            </div>

            <h1 className="max-w-md text-4xl leading-tight font-semibold">
              Manage branches, orders, and staff from one kitchen dashboard.
            </h1>
            <p className="mt-4 max-w-md text-sm text-emerald-50/95">
              Welcome back. Sign in to continue operations for inventory,
              transactions, and live order flow.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-white/30 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-3xl font-semibold">24/7</p>
              <p className="mt-1 text-emerald-50">Order monitoring</p>
            </div>
            <div className="rounded-2xl border border-white/30 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-3xl font-semibold">Live</p>
              <p className="mt-1 text-emerald-50">Branch updates</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-sm sm:p-8 w-xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="MrHalwai"
                width={46}
                height={46}
                className="rounded-full border border-emerald-200 bg-white p-1"
              />
              <div>
                <p className="text-xs tracking-[0.14em] text-slate-500 uppercase">
                  MrHalwai
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  Admin Login
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
              Secure Access
            </span>
          </div>

          <form className="flex flex-col gap-4" action="">
            {error && (
              <Alert variant="destructive" className="border-red-300 bg-red-50">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>{error.title}</AlertTitle>
                <AlertDescription>{error.description}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@mrhalwai.com"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <button
              type="button"
              onClick={handleAuth}
              disabled={loading}
              className="flex justify-center items-center mt-2 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
            >
              {loading ? (
                <Loader className="animate-spin" />
              ) : (
                "Log in to Dashboard"
              )}
            </button>

            <p className="pt-1 text-center text-sm text-slate-600">
              Need an admin account?{" "}
              <Link
                href="#"
                className="font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Contact super admin
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Login;
