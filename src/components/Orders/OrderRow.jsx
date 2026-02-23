"use client";
import { Fragment, useState, useEffect } from "react";
import {
  ChevronDown,
  Check,
  X,
  ChefHat,
  Bike,
  PackageCheck,
} from "lucide-react";
import { STATUS_CONFIG } from "./OrderTable";
import { updateOrder } from "@/store/orderAPI";
import { formatEMPID } from "@/lib/utils";

// ─── Status Machine ───────────────────────────────────────────────────────────
// Defines what action buttons appear for each status, and what status they
// transition to. null nextActions means the order is in a terminal state.
const STATUS_MACHINE = {
  placed: {
    nextActions: [
      {
        label: "Accept",
        icon: Check,
        nextStatus: "accepted",
        style: "bg-emerald-500 hover:bg-emerald-600 text-white",
        iconStyle: "text-white",
      },
      {
        label: "Reject",
        icon: X,
        nextStatus: "rejected",
        style: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
        iconStyle: "text-red-500",
      },
    ],
  },
  accepted: {
    nextActions: [
      {
        label: "Mark as Ready",
        icon: ChefHat,
        nextStatus: "ready",
        style: "bg-amber-500 hover:bg-amber-600 text-white",
        iconStyle: "text-white",
      },
    ],
  },
  ready: {
    nextActions: [
      {
        label: "Out for Delivery",
        icon: Bike,
        nextStatus: "out_for_delivery",
        style: "bg-blue-500 hover:bg-blue-600 text-white",
        iconStyle: "text-white",
      },
    ],
  },
  out_for_delivery: {
    nextActions: [
      {
        label: "Mark Delivered",
        icon: PackageCheck,
        nextStatus: "delivered",
        style: "bg-indigo-500 hover:bg-indigo-600 text-white",
        iconStyle: "text-white",
      },
    ],
  },
  delivered: { nextActions: null }, // terminal
  rejected: { nextActions: null }, // terminal
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.placed;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.badge}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full animate-pulse ${config.dot}`}
      />
      {config.label}
    </span>
  );
}

const formatDate = (date) => {
  const d = new Date(date);
  return {
    date: d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
};

const chevronBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`;
const selectClass =
  "h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer appearance-none pr-7 bg-no-repeat bg-[right_8px_center]";

// ─── StatusActions ─────────────────────────────────────────────────────────────
// Renders the contextual action buttons based on current status
function StatusActions({ currentStatus, onAction, isUpdating }) {
  const machine = STATUS_MACHINE[currentStatus];

  // Terminal states — nothing to do
  if (!machine || !machine.nextActions) {
    const isDelivered = currentStatus === "delivered";
    return (
      <span
        className={`text-[12px] font-light px-2.5 py-1 rounded-full ${isDelivered ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
      >
        {isDelivered ? "✓ Completed" : "✗ Rejected"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {machine.nextActions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.nextStatus}
            type="button"
            disabled={isUpdating}
            onClick={() => onAction(action.nextStatus)}
            className={`
                            inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] font-light
                            transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
                            whitespace-nowrap shadow-sm
                            ${action.style}
                        `}
          >
            <Icon size={11} className={action.iconStyle} />
            {isUpdating ? "Saving…" : action.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── OrderRow ──────────────────────────────────────────────────────────────────
export default function OrderRow({ order, riders, isLast }) {
  const [isOpen, setIsOpen] = useState(false);
  const [orderData, setOrderData] = useState(order);
  const [selectedRider, setSelectedRider] = useState(
    orderData.riderInfo?._id || "",
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync when parent refreshes data
  useEffect(() => {
    setOrderData(order);
  }, [order]);
  useEffect(() => {
    setSelectedRider(orderData.riderInfo?._id || "");
  }, [orderData.riderInfo?._id]);

  const { date, time } = formatDate(orderData.createdAt);
  const currentStatus = orderData.status || "placed";

  // Rider assignment — only show Update btn if rider changed
  const riderDirty = selectedRider !== (orderData.riderInfo?._id || "");

  const handleRiderChange = (e) => setSelectedRider(e.target.value);

  // Called by StatusActions when an action button is clicked
  const handleStatusAction = async (nextStatus) => {
    if (nextStatus === "out_for_delivery" && !selectedRider) {
      alert("Please assign a rider before marking as Ready.");
      return;
    }
    const updated = await updateOrder(
      {
        ...orderData,
        status: nextStatus,
        riderInfo:
          riders.find((r) => r._id === selectedRider) ||
          orderData.riderInfo ||
          null,
      },
      setIsUpdating,
    );
    setOrderData(updated.order);
  };

  // Called when only rider changes (status unchanged)
  const handleRiderUpdate = async () => {
    const updated = await updateOrder(
      {
        ...orderData,
        riderInfo: riders.find((r) => r._id === selectedRider) || null,
      },
      setIsUpdating,
    );
    setOrderData(updated.order);
  };

  return (
    <Fragment>
      <tr
        className={`transition-colors duration-150 hover:bg-gray-50 ${isOpen ? "bg-gray-50" : ""} ${!isOpen && !isLast ? "border-b border-gray-50" : ""}`}
      >
        {/* Order ID */}
        <td className="px-4 py-3.5 text-center">
          <span className="font-mono text-[11px] font-medium bg-gray-100 border border-gray-200 text-gray-500 rounded-md px-2 py-1 tracking-wide">
            #{orderData._id.slice(-6).toUpperCase()}
          </span>
        </td>

        {/* Date */}
        <td className="px-4 py-3.5">
          <p className="text-xs font-medium text-gray-800">{date}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{time}</p>
        </td>

        {/* Amount */}
        <td className="px-4 py-3.5">
          <span className="text-sm font-semibold text-gray-900">
            ₹{orderData.totalAmount.toLocaleString("en-IN")}
          </span>
        </td>

        {/* Current Status Badge */}
        <td className="px-4 py-3.5">
          <StatusBadge status={currentStatus} />
        </td>

        {/* Assign Rider */}
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-2">
            <div className="relative w-36">
              <select
                value={selectedRider}
                disabled={currentStatus !== "ready"}
                onChange={handleRiderChange}
                className={`${selectClass} w-full disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400`}
                style={{ backgroundImage: chevronBg }}
              >
                <option value="" disabled>
                  Assign Rider
                </option>
                {riders.map((rider) => (
                  <option key={rider._id} value={rider._id}>
                    {formatEMPID(rider._id)}
                    {" - "}
                    {rider.name}
                  </option>
                ))}
              </select>
            </div>
            {riderDirty && (
              <button
                type="button"
                onClick={handleRiderUpdate}
                disabled={isUpdating}
                className="h-7 px-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-[11px] font-semibold transition-colors whitespace-nowrap"
              >
                {isUpdating ? "Saving…" : "Assign"}
              </button>
            )}
          </div>
        </td>

        {/* Status Actions (replaces the old status dropdown) */}
        <td className="px-4 py-3.5" colSpan={2}>
          <StatusActions
            currentStatus={currentStatus}
            onAction={handleStatusAction}
            isUpdating={isUpdating}
          />
        </td>

        {/* Expand/Collapse */}
        <td className="pr-3 py-3.5">
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            aria-expanded={isOpen}
            aria-controls={`order-details-${orderData._id}`}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600 hover:border-gray-300 transition-all duration-150"
          >
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        </td>
      </tr>

      {/* Expanded detail row */}
      <tr
        id={`order-details-${orderData._id}`}
        className={`bg-gray-50 ${!isLast ? "border-b border-gray-100" : ""}`}
      >
        <td colSpan={8} className="p-0">
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxHeight: isOpen ? "400px" : "0px" }}
          >
            <div className="px-14 py-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Order Items
              </p>
              <div className="bg-white border border-gray-100 rounded-xl px-4 py-1 max-w-md">
                {orderData.orderItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between py-2 border-b border-dashed border-gray-100 last:border-none"
                  >
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      {item.name}
                      <span className="bg-gray-100 text-gray-500 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                        ×{item.quantity}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-800">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-2.5 mt-1 border-t-2 border-gray-100 text-xs font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{orderData.totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </Fragment>
  );
}
