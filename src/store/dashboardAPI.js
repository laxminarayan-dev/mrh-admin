const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export const initialData = {
    kpiData: [],
    chartData: {
        cashFlow: [],
        topSelling: []
    },
    tablesData: {
        recentOrdersData: [],
        recentTransactionsData: []
    }
}
const fetchDashboardData = async (setLoadingFun) => {
    try {
        setLoadingFun(true);
        const res = await fetch(`${BACKEND_URL}/api/shop/dashboard-data`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        const data = await res.json();
        setLoadingFun(false);
        return data;
    } catch (error) {
        setLoadingFun(false);
        console.log("Dashboard fetch error:", error);
        return initialData;
    }
};

export default fetchDashboardData