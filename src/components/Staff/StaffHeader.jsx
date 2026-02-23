"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import RenderFields from "../Shared/RenderFields";
import { useRouter } from "next/navigation";

const StaffHeader = () => {
  const router = useRouter();

  return (
    <>
      <div className="m-4 flex items-start justify-between">
        <div><h1 className="text-3xl  text-gray-800 font-bold">
          Staff Management
        </h1>
          <p className="text-gray-600 text-sm mb-4">Manage your Staff here.</p></div>
        <button
          onClick={() => {
            router.push("/staff/add");
          }}
          className="bg-white text-sm px-3 py-2 rounded-full border border-gray-200 shadow-xs cursor-pointer flex justify-center items-center gap-1 hover:bg-gray-50"
        >
          <Plus size={16} /> Add Employee
        </button>
      </div>
    </>
  );
};

export default StaffHeader;
