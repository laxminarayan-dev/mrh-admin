import { ordersInitialData } from "@/lib/initialData";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchAllOrder = async () => {
    try {
        const res = await fetch(`${BACKEND_URL}/api/orders`, {
            cache: "no-store",
        });
        const data = await res.json();
        return data["orders"]

    } catch (err) {
        return [];
    }
};


export const fetchOneOrder = async (orderID) => {
    try {
        const res = await fetch(`${BACKEND_URL}/api/orders/${orderID}`, {
            cache: "no-store",
        });
        return await res.json();
    } catch (error) {
        return ordersInitialData;
    }
};


export const updateOrder = async (order, setIsUpdating) => {
    try {
        setIsUpdating(true);
        const res = await fetch(`${BACKEND_URL}/api/orders/update/${order._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(order),
        });
        return await res.json();
    } catch (error) {
        return null;
    } finally {
        setIsUpdating(false);
    }
};




