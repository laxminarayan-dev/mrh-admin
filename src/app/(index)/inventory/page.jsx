"use client";

import Header from "@/components/Inventory/Header";
import Actions from "@/components/Inventory/Actions";
import { IndianRupee, Clock, Bug, Loader } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { CheckCircle2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const fetchFoodItems = async (setItems, setLoading = () => {}) => {
  try {
    setLoading(true);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/items`,
    );
    const data = await response.json();
    setItems(Array.isArray(data) ? data : data.items || []);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
const InventoryManagement = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    fetchFoodItems(setFoodItems, setLoading);
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500 min-h-screen flex justify-center items-center">
        <Loader className="mx-auto mb-4 animate-spin" size={24} />
      </div>
    );
  }

  return (
    <>
      {showSuccess && (
        <div className="fixed top-10 z-99999 right-10 bg-green-200 rounded-lg shadow-md p-1">
          <Alert variant="success">
            <CheckCircle2Icon />
            <AlertTitle>Item deleted successfully</AlertTitle>
            <AlertDescription>
              Your item has been deleted successfully.
            </AlertDescription>
          </Alert>
        </div>
      )}
      {showError && (
        <div className="fixed top-10 z-99999 right-10 bg-red-200 rounded-lg shadow-md p-1">
          <Alert variant="destructive" className="bg-transparent border-0">
            <Bug />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to delete item. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <div className="flex flex-col gap-8 p-6 bg-transparent min-h-screen">
        <Header />

        {/* Clay Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {foodItems.map((item) => (
            <div
              key={item._id || item.id}
              className="
              relative
              group
              rounded-2xl
              bg-gradient-to-br from-white to-slate-100
              border border-slate-200/90
              shadow-[8px_8px_16px_rgba(0,0,0,0.08),-8px_-8px_16px_rgba(255,255,255,0.9)]
              hover:shadow-[12px_12px_20px_rgba(0,0,0,0.12),-12px_-12px_20px_rgba(255,255,255,1)]
              transition-all duration-300
              hover:-translate-y-1
              overflow-hidden
            "
            >
              {/* Image */}
              <div className="overflow-hidden h-42  flex justify-center items-center ">
                <Image
                  src={
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}${item.images?.url}` ||
                    "https://placehold.co/400x400/png?text=No+Image"
                  }
                  alt={item.images?.alt || item.name}
                  width={160}
                  height={160}
                  loading="eager"
                  unoptimized
                />

                {/* Clay badges */}
                <div className=" absolute top-3 left-3 flex flex-col gap-2">
                  {item.isNewArrival && <ClayBadge color="blue">New</ClayBadge>}
                  {item.isBestSeller && (
                    <ClayBadge color="amber">Best Seller</ClayBadge>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <ClayBadge color={item.isAvailable ? "green" : "red"}>
                    {item.isAvailable ? "Available" : "Out of Stock"}
                  </ClayBadge>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col gap-1">
                {/* Title */}
                <div className="flex justify-between items-start">
                  <h2 className="font-semibold text-slate-800 text-lg line-clamp-1">
                    {item.name}
                  </h2>

                  <div
                    className="
                  px-2 py-1
                  text-[10px]
                  rounded-lg
                  bg-slate-100
                  shadow-inner
                  capitalize
                "
                  >
                    {item.category}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 line-clamp-2 min-h-[40px]">
                  {item.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {item.preparationTime} mins
                  </div>

                  {item.stock !== null && (
                    <div
                      className={`
                      px-2 py-0.5 rounded-md shadow-inner
                      ${
                        item.stock <= item.lowStockThreshold
                          ? "bg-red-100 text-red-500"
                          : "bg-slate-100"
                      }
                    `}
                    >
                      Stock: {item.stock}
                    </div>
                  )}
                </div>

                {/* Price + Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    {item.discountPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{item.originalPrice}
                      </span>
                    )}

                    <div
                      className="
                    flex items-center
                    font-bold
                    text-xl
                    text-slate-800
                  "
                    >
                      <IndianRupee size={18} />
                      {item.discountPrice || item.originalPrice}
                    </div>
                  </div>

                  <Actions
                    data={item}
                    setShowSuccess={setShowSuccess}
                    setShowError={setShowError}
                    setFoodItems={setFoodItems}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default InventoryManagement;

const ClayBadge = ({ children, color = "gray" }) => {
  const colors = {
    green: `
      bg-gradient-to-br from-green-200 to-green-300
      text-green-800
      shadow-[inset_2px_2px_4px_rgba(255,255,255,0.6),inset_-2px_-2px_4px_rgba(0,0,0,0.08)]
    `,
    red: `
      bg-gradient-to-br from-red-200 to-red-300
      text-red-800
      shadow-[inset_2px_2px_4px_rgba(255,255,255,0.6),inset_-2px_-2px_4px_rgba(0,0,0,0.08)]
    `,
    amber: `
      bg-gradient-to-br from-amber-200 to-amber-300
      text-amber-900
      shadow-[inset_2px_2px_4px_rgba(255,255,255,0.6),inset_-2px_-2px_4px_rgba(0,0,0,0.08)]
    `,
    blue: `
      bg-gradient-to-br from-blue-200 to-blue-300
      text-blue-800
      shadow-[inset_2px_2px_4px_rgba(255,255,255,0.6),inset_-2px_-2px_4px_rgba(0,0,0,0.08)]
    `,
    gray: `
      bg-gradient-to-br from-slate-200 to-slate-300
      text-slate-700
      shadow-[inset_2px_2px_4px_rgba(255,255,255,0.6),inset_-2px_-2px_4px_rgba(0,0,0,0.08)]
    `,
  };

  return (
    <div
      className={`
        px-3 py-1
        text-xs font-semibold
        rounded-full
        z-99
        ${colors[color]}
      `}
    >
      {children}
    </div>
  );
};
