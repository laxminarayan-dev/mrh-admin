"use client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
const Actions = ({ data }) => {
  const router = useRouter();
  return (
    <>
      <div className="flex flex-row justify-between items-center mt-2 gap-2">
        <Button
          aria-label="updateEntry"
          className="font-semibold font-mono bg-amber-400 text-gray-900 cursor-pointer hover:bg-amber-500 transition-colors"
          onClick={() => {
            router.push(`/inventory/edit?editId=${data._id || data.id}`);
          }}
        >
          Edit
        </Button>
        <Button
          className="font-semibold font-mono bg-red-400 text-gray-900  cursor-pointer hover:bg-red-500 transition-colors"
          aria-label="deleteEntry"
        >
          Remove
        </Button>
      </div>
    </>
  );
};

export default Actions;
