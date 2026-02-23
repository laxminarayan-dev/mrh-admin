import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export function capitalizeWords(text) {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatEMPID(id) {
  return "EMP" + id.slice(-5).toUpperCase();
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};