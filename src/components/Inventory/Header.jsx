"use client";
import InventoryAddModel from "./AddModel";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="">
        <h1 className="text-3xl my-2 text-gray-800 font-bold">
          Inventory Management
        </h1>
        <p className="text-gray-600 text-sm mb-4">
          Manage your Inventory data here.
        </p>
      </div>

      {/* Header */}
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => {
            router.push("/inventory/add");
          }}
          className="border border-gray-100 bg-white shadow-sm py-2 px-4 rounded-full cursor-pointer flex justify-center items-center gap-1"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <InventoryAddModel
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </>
  );
};
export default Header;
