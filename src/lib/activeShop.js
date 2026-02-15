const STORAGE_KEY = "mrh_active_shop_id";

export const getActiveShopId = () => {
    if (typeof window === "undefined") return null;
    try {
        return window.localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
};

export const setActiveShopId = (shopId) => {
    if (typeof window === "undefined") return;
    try {
        if (!shopId) {
            window.localStorage.removeItem(STORAGE_KEY);
        } else {
            window.localStorage.setItem(STORAGE_KEY, shopId);
        }
        window.dispatchEvent(
            new CustomEvent("mrh:activeShopChanged", { detail: { shopId } })
        );
    } catch {
        // ignore
    }
};

export const onActiveShopChange = (handler) => {
    if (typeof window === "undefined") return () => { };

    const listener = (event) => {
        handler?.(event?.detail?.shopId ?? null);
    };

    window.addEventListener("mrh:activeShopChanged", listener);
    return () => window.removeEventListener("mrh:activeShopChanged", listener);
};
