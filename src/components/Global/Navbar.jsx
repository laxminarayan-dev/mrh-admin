"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  X,
  ShoppingCart,
  Package,
  ChefHat,
  ChartColumnBig,
  BadgeIndianRupee,
  UserRoundCog,
  ArrowLeftRight,
  LogOut,
  Menu,
  ChevronDown,
  Store,
  Check,
  Plus,
} from "lucide-react";
import { cloneShop, fetchShops } from "@/store/shopAPI";
import {
  getActiveShopId,
  onActiveShopChange,
  setActiveShopId,
} from "@/lib/activeShop";

const getShopLabel = (shop) => {
  if (!shop) return "Select Branch";
  return shop.name || shop.code || "Branch";
};

const getShopStatus = (shop) => {
  if (!shop) return { label: "", className: "" };
  return shop.shopOpen
    ? {
      label: "Open",
      className:
        "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20",
    }
    : {
      label: "Closed",
      className: "bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20",
    };
};

const Navbar = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const [shops, setShops] = useState([]);
  const [activeShopId, setActiveShopIdState] = useState(null);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchCode, setNewBranchCode] = useState("");
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const branchMenuRef = useRef(null);

  const refreshShops = async () => {
    const list = await fetchShops();
    setShops(Array.isArray(list) ? list : []);
    return Array.isArray(list) ? list : [];
  };

  useEffect(() => {
    setActiveShopIdState(getActiveShopId());
    return onActiveShopChange((shopId) => setActiveShopIdState(shopId));
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const list = await fetchShops();
      if (!isMounted) return;

      setShops(Array.isArray(list) ? list : []);

      const stored = getActiveShopId();
      const hasStored = stored && list?.some?.((s) => s?._id === stored);
      if (!hasStored && list && list.length > 0) {
        setActiveShopId(list[0]._id);
        setActiveShopIdState(list[0]._id);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isBranchMenuOpen) return;

    setIsAddBranchOpen(false);
    setNewBranchName("");
    setNewBranchCode("");

    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsBranchMenuOpen(false);
    };

    const onPointerDown = (e) => {
      const el = branchMenuRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setIsBranchMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [isBranchMenuOpen]);

  // Prevent background scrolling when mobile sidebar is open
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalOverflow = document.body.style.overflow || "";
    const originalTouchAction = document.body.style.touchAction || "";

    if (isMobileSidebarOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isMobileSidebarOpen]);

  const handleCreateBranch = async () => {
    const name = newBranchName.trim();
    const code = newBranchCode.trim();

    if (!name) return;
    if (shops.length === 0) return;

    const sourceShopId = activeShopId || shops[0]?._id;
    if (!sourceShopId) return;

    setIsCreatingBranch(true);
    const result = await cloneShop({ sourceShopId, name, code });
    setIsCreatingBranch(false);

    if (!result.ok || !result.shop?._id) {
      // minimal, no extra UI components
      window.alert(result.message || "Failed to create branch");
      return;
    }

    await refreshShops();
    setActiveShopId(result.shop._id);
    setActiveShopIdState(result.shop._id);
    setIsAddBranchOpen(false);
    setNewBranchName("");
    setNewBranchCode("");
    setIsBranchMenuOpen(false);
    router.refresh?.();
  };

  const sidebarItems = [
    {
      title: "",
      links: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: ChartColumnBig,
          path: "/",
        },
      ],
    },
    {
      title: "Manage",
      links: [
        // {
        //   id: "financials",
        //   label: "Financials",
        //   icon: BadgeIndianRupee,
        //   path: "/financials/expenses", // This is used for router.push
        //   matchPaths: [
        //     "/financials/expenses",
        //     "/financials/salary",
        //     "/financials/income",
        //   ], // This is used for active highlighting
        // },
        {
          id: "inventory",
          label: "Inventory",
          icon: Package,
          path: "/inventory",
        },
        { id: "staff", label: "Staff", icon: UserRoundCog, path: "/staff" },
        { id: "branch", label: "Branch", icon: Store, path: "/branch" },
      ],
    },
    // {
    //   title: "Update",
    //   links: [{ id: "menu", label: "Menu", icon: ChefHat, path: "/menu" }],
    // },
    {
      title: "Track",
      links: [
        { id: "orders", label: "Orders", icon: ShoppingCart, path: "/orders" },
        // {
        //   id: "Transactions",
        //   label: "Transactions",
        //   icon: ArrowLeftRight,
        //   path: "/transactions",
        // },
      ],
    },
    {
      title: "Settings",
      links: [{ id: "logout", label: "Logout", icon: LogOut, path: "/logout" }],
    },
  ];
  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-[101] bg-white/85 backdrop-blur-md  min-h-16 max-h-16 border-b-2 border-slate-400">
        <div className="px-4 sm:px-6 py-3 mx-auto flex items-center justify-between bg-white border-b border-slate-200 shadow-sm">
          {/* Left */}
          <div className="flex items-center gap-3">
            <span
              className="font-semibold text-2xl"
              onClick={() => {
                router.push("/");
              }}
            >
              Mr Halwai
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Branch switcher */}
            <div className="relative" ref={branchMenuRef}>
              {(() => {
                const activeShop =
                  shops.find((s) => s?._id === activeShopId) || null;
                const status = getShopStatus(activeShop);

                return (
                  <button
                    type="button"
                    onClick={() => setIsBranchMenuOpen((v) => !v)}
                    className="group flex items-center gap-3 bg-white/70 hover:bg-white px-3 py-2 transition-all"
                    aria-haspopup="menu"
                    aria-expanded={isBranchMenuOpen}
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-900/5 to-slate-900/0 ring-1 ring-slate-900/10 flex items-center justify-center">
                      <Store className="w-5 h-5 text-slate-700" />
                    </div>

                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">
                        {getShopLabel(activeShop)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {status.label ? (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.className}`}
                          >
                            {status.label}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-gray-500">
                            Choose branch
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${isBranchMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                );
              })()}

              {isBranchMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-[320px] rounded-2xl border border-slate-200/70 bg-white backdrop-blur-md shadow-xl shadow-black/10 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-slate-200/60">
                    <p className="text-sm font-semibold text-gray-900">
                      Select branch
                    </p>
                    <p className="text-xs text-gray-500">
                      Switch context for dashboard & operations
                    </p>
                  </div>

                  <div className="max-h-[320px] overflow-auto">
                    {shops.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm font-medium text-gray-700">
                          No branches found
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Create shops in DB to enable switching
                        </p>
                      </div>
                    ) : (
                      shops.map((shop) => {
                        const isActive = shop?._id === activeShopId;
                        const status = getShopStatus(shop);
                        return (
                          <button
                            key={shop._id}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setActiveShopId(shop._id);
                              setIsBranchMenuOpen(false);
                            }}
                            className={`w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors ${isActive ? "bg-slate-50" : ""}`}
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {getShopLabel(shop)}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {status.label && (
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.className}`}
                                  >
                                    {status.label}
                                  </span>
                                )}
                                {shop.code && (
                                  <span className="text-[12px] font-medium text-gray-500">
                                    {shop.code}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {isActive && (
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 ring-1 ring-blue-500/20">
                                  <Check className="w-4 h-4 text-blue-700" />
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Footer actions */}
                  <div className="border-t border-slate-200/60 p-3 bg-white">
                    <button
                      type="button"
                      onClick={() => {
                        router.push("/branch/add");
                        setIsBranchMenuOpen(false);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/70 bg-white hover:bg-slate-50 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm shadow-black/5 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-blue-700" />
                      Add branch
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Saprator */}
            <div className="block md:hidden w-[2px] h-6 bg-slate-800/70 rounded-full mr-2"></div>
            {/* Menu Open/Close */}
            <div className="flex md:hidden">
              <button
                aria-label="open-navbar"
                onClick={() => setIsMobileSidebarOpen((v) => !v)}
                type="button"
                className="text-gray-600 hover:text-gray-900 focus:outline-none cursor-pointer"
              >
                {isMobileSidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Box */}
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed top-19 z-[101] h-[calc(100vh-4.5rem)] p-4 transform-gpu will-change-transform transition-transform duration-500 ease-out md:translate-x-0 md:block md:w-64 md:transition-none ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } w-64 bg-white text-slate-900 shadow-lg border-r border-slate-200/60`}
          aria-label="Main sidebar"
        >
          <div className="flex flex-col justify-between h-full">
            {/* Sidebar header */}
            <div className="mb-4">
              <div className="flex items-center gap-3 px-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-400 inline-flex items-center justify-center shadow-sm">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    Mr Halwai
                  </div>
                  <div className="text-xs text-gray-500">Admin Dashboard</div>
                </div>
              </div>

              <div className="px-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Branch:</span>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {getShopLabel(
                      shops.find((s) => s?._id === activeShopId) || null,
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="mx-1 flex-1 overflow-auto py-2 space-y-6">
              {sidebarItems.map((section, sidx) => (
                <div key={section.title + sidx} className="space-y-3">
                  {section.title && (
                    <div className="px-3 text-xs text-gray-500 uppercase tracking-wider">
                      {section.title}
                    </div>
                  )}

                  <div className="space-y-1 px-2">
                    {section.links.map((link, lidx) => {
                      const Icon = link.icon;
                      const isActive = link.matchPaths
                        ? link.matchPaths.includes(pathname)
                        : pathname === link.path;
                      return (
                        <button
                          key={link.id + lidx}
                          type="button"
                          onClick={() => {
                            router.push(link.path);
                            if (isMobileSidebarOpen)
                              setIsMobileSidebarOpen(false);
                          }}
                          className={`group flex items-center gap-3 w-full text-sm px-3 py-2 rounded-lg transition-colors duration-200 ${isActive
                            ? "bg-gradient-to-r from-indigo-500/10 to-indigo-400/5 shadow-sm text-indigo-700"
                            : "text-gray-700 hover:bg-slate-50"
                            }`}
                        >
                          <span
                            className={`inline-flex items-center justify-center w-9 h-9 rounded-md ${isActive ? "bg-indigo-500 text-white" : "bg-slate-100 text-indigo-500 group-hover:bg-indigo-50"}`}
                          >
                            <Icon className="w-4 h-4" />
                          </span>

                          <span className="flex-1 text-left font-medium truncate">
                            {link.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        <div
          className={`fixed bg-slate-900/70 z-[100] md:hidden top-0 left-0 w-full h-screen transition-opacity duration-300 ease-out ${isMobileSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
            }`}
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      </div>
    </>
  );
};

// Effects kept outside render return for clarity
// (component is memoized at export)

export default React.memo(Navbar);
