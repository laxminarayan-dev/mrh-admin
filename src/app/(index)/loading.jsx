import { Loader2 } from "lucide-react";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <div className="flex justify-center items-center font-xl min-h-[100dvh] w-full">
      <Loader2 className="animate-spin text-gray-500" size={38} />
    </div>
  );
}
