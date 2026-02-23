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
import { Button } from "@/components/ui/button";
import { fetchShops, updateShop } from "@/store/shopAPI";
import { fetchFoodItems } from "../inventory/page";
import Socket from "@/components/Socket/socket";

const getChanges = (original, updated) => {
  const changes = {};
  const allKeys = new Set([...Object.keys(original), ...Object.keys(updated)]);
  for (const key of allKeys) {
    if (key !== "shopOpen" && key !== "menuItems") continue;
    if (key === "menuItems") {
      if (original[key]?.length !== updated[key]?.length || !original[key]?.every(item => updated[key]?.includes(item))) {
        changes[key] = { from: original[key], to: updated[key] };
      }
    }
    if (key == "shopOpen" && original[key] !== updated[key]) {
      changes[key] = { from: original[key], to: updated[key] };
    }
  }
  if (Object.keys(changes).length > 0) {
    return true
  }
  else {
    return false
  }
};

const CreateNewBranchPage = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedBranchCopy, setSelectedBranchCopy] = useState(null);
  const [items, setItems] = useState([]);
  // const [isDirty,] = selectedBranch && selectedBranchCopy && getChanges(selectedBranchCopy, selectedBranch);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);



  // socket connection status logging
  useEffect(() => {
    if (!Socket.connected) {
      Socket.connect();
    }
    Socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    Socket.on("shop-updated", () => {
      fetchShops().then((data) => {
        setSelectedBranchCopy(null);
        setBranches(data);
        const active = data.find((b) => b._id === selectedBranchId);
        if (active) setSelectedBranch(active);
      }).catch((err) => {
        console.error("Error fetching shops after update:", err);
        setBranches([]);
      });
    })

    Socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });
    return () => {
      Socket.off("connect");
      Socket.off("disconnect");
    }
  }, []);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (selectedBranch && selectedBranchCopy == null) {
      setSelectedBranchCopy({ ...selectedBranch });
    }
  }, [selectedBranch]);

  useEffect(() => {
    const isDirty = selectedBranch && selectedBranchCopy && getChanges(selectedBranchCopy, selectedBranch);
    setIsDirty(isDirty);
  }, [selectedBranch, selectedBranchCopy]);


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
    console.log("Items loaded:", items.forEach((i) => console.log(i._id)));
  }, [items]);

  useEffect(() => {
    if (Array.isArray(branches) && branches.length > 0) {
      if (!selectedBranchId) {
        setSelectedBranchId(branches[0]._id);
      }
      const active = branches.find((b) => b._id === selectedBranchId);
      if (active) setSelectedBranch(active);
    }
  }, [branches, selectedBranchId]);

  useEffect(() => {
    const handleChange = (event) => setSelectedBranchId(event.detail);
    window.addEventListener("activeShopChanged", handleChange);
    return () => window.removeEventListener("activeShopChanged", handleChange);
  }, []);

  /* ---------------- HANDLERS ---------------- */

  const handleToggleShop = (checked) => {
    setSelectedBranch((prev) => ({ ...prev, shopOpen: checked }));
  };

  const handleToggleItem = (itemId, checked) => {
    setSelectedBranch((prev) => {
      const menuItems = prev.menuItems || [];
      return {
        ...prev,
        menuItems: checked
          ? [...menuItems, itemId]
          : menuItems.filter((id) => id !== itemId),
      };
    });
  };

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader className="animate-spin text-slate-400" size={32} />
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
      <div className="flex flex-col md:flex-row justify-center md:justify-between items-start md:items-end gap-4 md:gap-0">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Branch Control
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage availability and configure your outlet menu.
          </p>
        </div>
        {isDirty && (<div className="flex gap-4 justify-center items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RotateCcw size={16} className="mr-2" />
            Reset
          </Button>

          <Button
            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
            onClick={() => {
              updateShop(selectedBranch._id, { ...selectedBranch });
            }}
          >
            <Save size={16} className="mr-2" />
            Save Changes
          </Button>
        </div>)}
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
                className={`h-2.5 w-2.5 rounded-full ${selectedBranch?.shopOpen
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-slate-400"
                  }`}
              />

              <span
                className={`text-xs font-semibold ${selectedBranch?.shopOpen
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

      </Card>
    </div>
  );
};

export default CreateNewBranchPage;
