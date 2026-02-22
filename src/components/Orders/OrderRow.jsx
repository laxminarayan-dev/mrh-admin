"use client";
import { Fragment, useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { STATUS_CONFIG } from "./OrderTable";
import { updateOrder } from "@/store/orderAPI";

function StatusBadge({ status }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.placed;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${config.dot}`} />
            {config.label}
        </span>
    );
}

const formatDate = (date) => {
    const d = new Date(date);
    return {
        date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
};

function OrderRow({ order, riders, isLast }) {
    const [isOpen, setIsOpen] = useState(false);
    const [orderData, setOrderData] = useState(order);
    const [selectedRider, setSelectedRider] = useState(orderData.riderInfo?._id || "");
    const [selectedStatus, setSelectedStatus] = useState(orderData.status || "placed");
    const isDirty =
        selectedStatus !== (orderData.status || "placed") ||
        selectedRider !== (orderData.riderInfo?._id || "");
    const [isUpdating, setIsUpdating] = useState(false);


    useEffect(() => {
        setSelectedRider(orderData.riderInfo?._id || "");
    }, [orderData.riderInfo?._id]);

    useEffect(() => {
        setSelectedStatus(orderData.status || "placed");
    }, [orderData.status]);

    const { date, time } = formatDate(orderData.createdAt);

    const handleRiderChange = (e) => {
        setSelectedRider(e.target.value);
    };

    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
    };

    const handleUpdate = async () => {
        let res = await updateOrder({ ...orderData, status: selectedStatus, riderInfo: riders.find(r => r._id === selectedRider) || null }, setIsUpdating)
        setOrderData(res.order);
    };

    const selectClass =
        "h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer appearance-none pr-7 bg-no-repeat bg-[right_8px_center]";

    const chevronBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`;

    return (
        <Fragment>
            <tr
                className={`transition-colors duration-150 hover:bg-gray-50 ${isOpen ? "bg-gray-50" : ""} ${!isOpen && !isLast ? "border-b border-gray-50" : ""}`}
            >
                {/* OrderData ID */}
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

                {/* Status Badge */}
                <td className="px-4 py-3.5">
                    <StatusBadge status={selectedStatus} />
                </td>

                {/* Assign Rider */}
                <td className="px-4 py-3.5">
                    <div className="relative w-36">
                        <select
                            value={selectedRider}
                            onChange={handleRiderChange}
                            className={`${selectClass} w-full`}
                            style={{ backgroundImage: chevronBg }}
                        >
                            <option value="" disabled>Assign Rider</option>
                            {riders.map((rider) => (
                                <option key={rider._id} value={rider._id}>
                                    {rider.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </td>

                {/* Change Status */}
                <td className="px-4 py-3.5">
                    <div className="relative w-44">
                        <select
                            value={selectedStatus}
                            onChange={handleStatusChange}
                            className={`${selectClass} w-full`}
                            style={{ backgroundImage: chevronBg }}
                        >
                            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                                <option key={val} value={val}>
                                    {cfg.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </td>

                {/* Actions */}
                <td className="pr-3 py-3.5">
                    <div className="flex items-center gap-2">
                        {isDirty && (
                            <button
                                type="button"
                                onClick={handleUpdate}
                                disabled={isUpdating}
                                className="h-7 px-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-[11px] font-semibold transition-colors duration-150 whitespace-nowrap"
                            >
                                {isUpdating ? "Saving…" : "Update"}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setIsOpen((v) => !v)}
                            aria-expanded={isOpen}
                            aria-controls={`orderData-details-${orderData._id}`}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600 hover:border-gray-300 transition-all duration-150"
                        >
                            <ChevronDown
                                size={13}
                                className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                            />
                        </button>
                    </div>
                </td>
            </tr>

            {/* Expanded detail row */}
            <tr
                id={`orderData-details-${orderData._id}`}
                className={`bg-gray-50 ${!isLast ? "border-b border-gray-100" : ""}`}
            >
                <td colSpan={7} className="p-0">
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

export default OrderRow;