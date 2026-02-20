"use client";
import React, { useState } from "react";

const initialBranches = {
  b1: {
    id: "b1",
    name: "Central Kitchen",
    isOpen: true,
    deliveryRangeKm: 5,
    menu: [
      {
        id: "m1",
        name: "Paneer Butter Masala",
        price: 250,
        available: true,
        onSale: false,
      },
      {
        id: "m2",
        name: "Veg Biryani",
        price: 180,
        available: true,
        onSale: true,
      },
      {
        id: "m3",
        name: "Gulab Jamun",
        price: 60,
        available: true,
        onSale: false,
      },
    ],
  },
  b2: {
    id: "b2",
    name: "North Branch",
    isOpen: false,
    deliveryRangeKm: 8,
    menu: [
      {
        id: "m4",
        name: "Aloo Paratha",
        price: 80,
        available: true,
        onSale: false,
      },
      {
        id: "m5",
        name: "Masala Chai",
        price: 30,
        available: false,
        onSale: false,
      },
    ],
  },
};

const selectedBranchId = "b1";

export default function BranchManager() {
  const [branches, setBranches] = useState(initialBranches);
  const [expanded, setExpanded] = useState({});

  function toggleBranchOpen(id) {
    setBranches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isOpen: !b.isOpen } : b)),
    );
  }

  function toggleItemFlag(branchId, itemId, flag) {
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branchId
          ? {
              ...b,
              menu: b.menu.map((m) =>
                m.id === itemId ? { ...m, [flag]: !m[flag] } : m,
              ),
            }
          : b,
      ),
    );
  }

  function updateDeliveryRange(id, value) {
    const n = Number(value) || 0;
    setBranches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, deliveryRangeKm: n } : b)),
    );
  }

  function updatePrice(branchId, itemId, value) {
    const n = Number(value) || 0;
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branchId
          ? {
              ...b,
              menu: b.menu.map((m) =>
                m.id === itemId ? { ...m, price: n } : m,
              ),
            }
          : b,
      ),
    );
  }

  function saveBranch(id) {
    const branch = branches.find((b) => b.id === id);
    console.log("Saving branch", id, branch);
    // TODO: call API to persist changes
    alert(`Saved changes for ${branch.name}`);
  }

  return (
    <div className="space-y-4">
      <div
        key={branches[selectedBranchId].id}
        className="border border-gray-200 shadow-md rounded-2xl px-8 py-6 bg-gray-50"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">
              {branches[selectedBranchId].name}
            </h2>
            <div className="text-sm text-gray-600">
              Delivery range: {branches[selectedBranchId].deliveryRangeKm} km
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={branches[selectedBranchId].isOpen}
                onChange={() => toggleBranchOpen(branches[selectedBranchId].id)}
              />
              <span className="text-sm">Open</span>
            </label>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm w-40">Delivery range (km)</label>
            <input
              type="number"
              min="0"
              value={branches[selectedBranchId].deliveryRangeKm}
              onChange={(e) =>
                updateDeliveryRange(
                  branches[selectedBranchId].id,
                  e.target.value,
                )
              }
              className="border p-1 rounded w-24"
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            {branches[selectedBranchId].menu.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between bg-white p-2 rounded shadow-sm"
              >
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-sm text-gray-500">Price: ₹{m.price}</div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    className="w-20 border p-1 rounded"
                    value={m.price}
                    onChange={(e) =>
                      updatePrice(
                        branches[selectedBranchId].id,
                        m.id,
                        e.target.value,
                      )
                    }
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={m.available}
                      onChange={() =>
                        toggleItemFlag(
                          branches[selectedBranchId].id,
                          m.id,
                          "available",
                        )
                      }
                    />
                    <span className="text-sm">Available</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={m.onSale}
                      onChange={() =>
                        toggleItemFlag(
                          branches[selectedBranchId].id,
                          m.id,
                          "onSale",
                        )
                      }
                    />
                    <span className="text-sm">On Sale</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => setBranches(initialBranches)}
            >
              Reset
            </button>
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => saveBranch(b.id)}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
