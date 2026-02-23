"use client";
import OrderRow from "./OrderRow";
import { useState, useEffect } from "react";
import { Clock, ShoppingBag } from "lucide-react";

export const STATUS_CONFIG = {
  placed: {
    label: "Placed",
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    dot: "bg-blue-500",
  },
  accepted: {
    label: "Accepted",
    badge: "bg-green-50 text-green-700 border border-green-200",
    dot: "bg-green-500",
  },
  ready: {
    label: "Ready",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
  },
  "out-for-delivery": {
    label: "Out for Delivery",
    badge: "bg-purple-50 text-purple-700 border border-purple-200",
    dot: "bg-purple-500",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    badge: "bg-purple-50 text-purple-700 border border-purple-200",
    dot: "bg-purple-500",
  },
  delivered: {
    label: "Delivered",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-red-50 text-red-600 border border-red-200",
    dot: "bg-red-500",
  },
  rejected: {
    label: "Rejected",
    badge: "bg-red-50 text-red-600 border border-red-200",
    dot: "bg-red-500",
  },
};

// ─── Main Table ──────────────────────────────────────────────────────────────
export default function OrdersTable({
  orders = [],
  riders = [],
  onStatusChange = () => {},
  onAssignRider = () => {},
}) {
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const filterOrders = () => {
      setSelectedOrders(
        orders.filter(
          (o) => o.shopId === localStorage.getItem("mrh_active_shop_id"),
        ),
      );
    };

    filterOrders();
    window.addEventListener("activeShopChanged", filterOrders);
    return () => window.removeEventListener("activeShopChanged", filterOrders);
  }, [orders]);

  const filteredOrders =
    statusFilter === "all"
      ? selectedOrders
      : selectedOrders.filter((o) => o.status === statusFilter);

  const chevronBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Orders</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {selectedOrders.length} total orders
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Native status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 w-40 rounded-lg border border-gray-200 bg-white px-2 pr-7 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer appearance-none bg-no-repeat bg-[right_8px_center]"
            style={{ backgroundImage: chevronBg }}
          >
            <option value="all">All Orders</option>
            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
              <option key={val} value={val}>
                {cfg.label}
              </option>
            ))}
          </select>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock size={12} />
            Live
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {[
              "Order ID",
              "Date & Time",
              "Amount",
              "Status",
              "Assign Rider",
              "Change Status",
              "",
            ].map((h, i) => (
              <th
                key={i}
                className={`px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap ${i === 0 ? "text-center" : "text-left"}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-dashed border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100" />
                    <div className="absolute inset-4 rounded-full bg-gray-100 border border-gray-200" />
                    <ShoppingBag
                      size={26}
                      className="relative z-10 text-gray-300 animate-bounce"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      {statusFilter === "all"
                        ? "No orders yet"
                        : `No ${STATUS_CONFIG[statusFilter]?.label ?? statusFilter} orders`}
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {statusFilter === "all" ? (
                        <>
                          Orders for this outlet will appear here
                          <br />
                          once customers start placing them.
                        </>
                      ) : (
                        <>
                          No orders match this status right now.
                          <br />
                          Try a different filter.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            filteredOrders.map((order, idx) => (
              <OrderRow
                key={order._id}
                order={order}
                riders={riders}
                onStatusChange={onStatusChange}
                onAssignRider={onAssignRider}
                isLast={idx === filteredOrders.length - 1}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
