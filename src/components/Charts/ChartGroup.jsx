import ChartCard from "./ChartCard";

const ChartGroup = ({ chartData }) => {
  console.log("Rendering ChartGroup with data:", chartData);

  return (
    <div className="max-w-7xl mx-auto mb-12">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Analytics Overview
        </h2>
        <p className="text-gray-600 font-medium">
          Track your business performance with real-time insights
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 px-4">
        <ChartCard
          title="Weekly Cash Flow"
          subtitle="Sales performance over the last 7 days"
          type="line"
          data={chartData.salesOverLast7Days}
          dataKey={["totalSales"]}
          categoryKey="date"
          colors={["#3B82F6", "#10B981", "#F59E0B", "#EF4444"]}
        />

        <ChartCard
          title="Top Selling Items"
          subtitle="Your best performing products"
          type="bar"
          data={chartData.salesByItems}
          dataKey={["totalSales"]}
          categoryKey="name"
          colors={["#8B5CF6", "#06B6D4", "#F97316", "#EC4899"]}
        />
      </div>
    </div>
  );
};
export default ChartGroup;
