const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchShops = async () => {
    try {
        const res = await fetch(`${BACKEND_URL}/api/shop/list`, {
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
        return json?.shops ?? [];
    } catch {
        return [];
    }
};

export const cloneShop = async ({ sourceShopId, name, code }) => {
    try {
        const res = await fetch(`${BACKEND_URL}/api/shop/clone`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ sourceShopId, name, code }),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
            return { ok: false, message: json?.message || "Failed to create branch" };
        }

        return { ok: true, shop: json?.shop };
    } catch {
        return { ok: false, message: "Failed to create branch" };
    }
};
