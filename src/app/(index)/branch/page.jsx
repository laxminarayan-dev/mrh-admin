"use client";

import React, { useEffect, useState } from "react";
import {
  Loader,
  Store,
  Utensils,
  Save,
  RotateCcw,
  CircleCheck,
  CircleOff,
} from "lucide-react";

import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchShops } from "@/store/shopAPI";
import { fetchFoodItems } from "../inventory/page";

const CreateNewBranchPage = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    const id = localStorage.getItem("mrh_active_shop_id");
    setSelectedBranchId(id);

    async function loadData() {
      setLoading(true);
      const branchData = await fetchShops();
      setBranches(branchData);
      await fetchFoodItems(setItems);
      setLoading(false);
    }

    loadData();
  }, []);

  useEffect(() => {
    const active = branches.find((b) => b._id === selectedBranchId);
    if (active) setSelectedBranch(active);
  }, [branches, selectedBranchId]);

  useEffect(() => {
    const handleChange = (event) => setSelectedBranchId(event.detail);
    window.addEventListener("activeShopChanged", handleChange);
    return () => window.removeEventListener("activeShopChanged", handleChange);
  }, []);

  /* ---------------- HANDLERS ---------------- */

  const handleToggleShop = (checked) => {
    setBranches((prev) =>
      prev.map((b) =>
        b._id === selectedBranch._id ? { ...b, shopOpen: checked } : b,
      ),
    );
  };

  const handleToggleItem = (itemId, checked) => {
    setBranches((prev) =>
      prev.map((b) => {
        if (b._id === selectedBranch._id) {
          const menuItems = b.menuItems || [];
          return {
            ...b,
            menuItems: checked
              ? [...menuItems, itemId]
              : menuItems.filter((id) => id !== itemId),
          };
        }
        return b;
      }),
    );
  };

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader className="animate-spin text-slate-400" size={42} />
        <p className="text-sm text-slate-500 font-medium">
          Loading branch configuration...
        </p>
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Branch Control
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage availability and configure your outlet menu.
        </p>
      </div>

      {/* Main Card */}
      <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/70 backdrop-blur-xl">
        {/* Branch Header */}
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <Store size={20} />
            </div>

            <div>
              <CardTitle className="text-lg font-semibold">
                {selectedBranch?.name}
              </CardTitle>

              <p className="text-xs text-slate-500 mt-0.5">
                Delivery radius:{" "}
                <span className="font-medium text-slate-700">
                  {selectedBranch?.shopDeliveryRange} km
                </span>
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  selectedBranch?.shopOpen
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-slate-400"
                }`}
              />

              <span
                className={`text-xs font-semibold ${
                  selectedBranch?.shopOpen
                    ? "text-emerald-600"
                    : "text-slate-400"
                }`}
              >
                {selectedBranch?.shopOpen ? "LIVE" : "OFFLINE"}
              </span>
            </div>

            <Switch
              checked={selectedBranch?.shopOpen}
              onCheckedChange={handleToggleShop}
            />
          </div>
        </CardHeader>

        {/* Menu Items */}
        <CardContent className="p-0">
          <div className="px-6 pt-5 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Utensils size={14} />
            Menu Items
          </div>

          <div className="divide-y">
            {items.map((item) => {
              const enabled = selectedBranch?.menuItems?.includes(item.id);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/70 transition"
                >
                  <div>
                    <p className="font-medium text-slate-800">{item.name}</p>

                    <p className="text-sm text-slate-500">
                      ₹{item.isSale ? item.discountPrice : item.originalPrice}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {enabled ? (
                      <CircleCheck size={18} className="text-emerald-500" />
                    ) : (
                      <CircleOff size={18} className="text-red-300" />
                    )}

                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) =>
                        handleToggleItem(item.id, checked)
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex justify-between border-t p-4 bg-white/60 backdrop-blur sticky bottom-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RotateCcw size={16} className="mr-2" />
            Reset
          </Button>

          <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
            <Save size={16} className="mr-2" />
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateNewBranchPage;
