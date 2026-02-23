const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchShops = async () => {
    try {
        const res = await fetch(`${BACKEND_URL}/api/shop`, {
            cache: "no-store",
        });
        if (!res.ok) {
            // fallback: some deployments may not have /list yet
            const singleRes = await fetch(`${BACKEND_URL}/api/shop`, {
                cache: "no-store",
            });
            const singleJson = await singleRes.json();
            return singleJson?.shop ? [singleJson.shop] : [];
        }

        const json = await res.json();
        return json?.shop ?? [];
    } catch (error) {
        console.error("Error fetching shops:", error);
        return [];
    }
};

export const updateShop = async (id, data) => {
    try {
        const res = await fetch(`${BACKEND_URL}/api/shop/update/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        const json = await res.json()
        if (!res.ok) {
            return { ok: false, message: json?.message || "Failed to update shop" };
        }
        return { ok: true, shop: json?.shop };
    } catch (error) {
        console.error("Error updating shop:", error);
        return { ok: false, message: "Failed to update shop" };
    }
};
