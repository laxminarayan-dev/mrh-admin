"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TriangleAlert, ChartColumnBig } from "lucide-react";
// --- Reusable Components for States (No changes needed here) ---

const EmptyState = React.memo(({ message, icon }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gradient-to-br from-gray-50/50 to-gray-100/30 rounded-xl">
    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4 shadow-sm">
      {icon}
    </div>
    <p className="text-lg font-semibold text-gray-600 text-center px-4">
      {message}
    </p>
    <p className="text-sm text-gray-500 mt-2 text-center px-4">
      Data will appear here once available
    </p>
  </div>
));

const LoadingSkeleton = React.memo(() => (
  <div
    className="w-full h-full animate-pulse bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl"
    role="status"
    aria-label="Loading chart"
  >
    <div className="relative w-full h-full p-4">
      {/* Y-axis */}
      <div className="absolute top-4 bottom-12 left-4 w-px bg-gradient-to-b from-gray-300 to-gray-200"></div>
      {/* X-axis */}
      <div className="absolute bottom-12 left-4 right-4 h-px bg-gradient-to-r from-gray-300 to-gray-200"></div>

      {/* Chart bars/data */}
      <div className="absolute bottom-12 left-10 right-8 h-[calc(100%-60px)] flex items-end justify-around gap-2">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className={`w-full bg-gradient-to-t from-blue-200 to-blue-100 rounded-t-lg`}
            style={{
              height: `${Math.random() * 60 + 20}%`,
              animationDelay: `${i * 0.1}s`,
            }}
          ></div>
        ))}
      </div>

      {/* X-axis labels */}
      <div className="absolute bottom-2 left-10 right-8 h-6 flex justify-around items-center">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="w-8 h-3 rounded bg-gray-300"></div>
        ))}
      </div>

      {/* Y-axis labels */}
      <div className="absolute top-4 bottom-16 left-0 w-8 flex flex-col justify-between items-end">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="w-6 h-2 rounded bg-gray-300"></div>
        ))}
      </div>
    </div>
  </div>
));

const useIntersectionObserver = (options) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, options);
    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [options]);

  return [ref, isVisible];
};

const sampleData = (data, maxPoints) => {
  if (!data || data.length <= maxPoints) return data;
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0);
};

const ChartCard = ({
  title,
  subtitle,
  type,
  data,
  dataKey,
  categoryKey,
  isLoading = false,
  error = null,
  colors = ["#6366f1", "#16a34a", "#ef4444", "#c7d2fe"],
  maxDataPoints = 100,
}) => {
  const observerOptions = useMemo(
    () => ({ threshold: 0.1, rootMargin: "50px" }),
    [],
  );
  const [containerRef, isVisible] = useIntersectionObserver(observerOptions);

  // **PERFORMANCE FIX 1: New state to control the final, expensive render.**
  // This state will be true only AFTER the component is visible AND the browser has had a moment to breathe.
  const [isReadyToRender, setIsReadyToRender] = useState(false);

  const processedData = useMemo(() => {
    return sampleData(data, maxDataPoints);
  }, [data, maxDataPoints]);

  // **PERFORMANCE FIX 2: The Deferral Effect**
  // This effect waits for the component to be visible and not in a loading state.
  // Then, it uses a setTimeout(0) to push the expensive state update (and subsequent render)
  // to the next event loop cycle. This unblocks the main thread, allowing LCP to paint quickly.
  useEffect(() => {
    if (isVisible && !isLoading) {
      const timerId = setTimeout(() => {
        setIsReadyToRender(true);
      }, 0); // Defer to the next browser task queue
      return () => clearTimeout(timerId);
    }
  }, [isVisible, isLoading]);

  const renderChart = useCallback(() => {
    if (!Array.isArray(dataKey) || dataKey.length === 0) {
      return (
        <EmptyState
          message="Chart configuration error."
          icon={<TriangleAlert size={40} />}
        />
      );
    }

    // **PERFORMANCE FIX 3: Optimize X-Axis interval.**
    // `interval={0}` is a performance killer as it tries to render every label.
    // 'auto' or a calculated value is much better. Let's calculate a sensible default.
    const tickInterval =
      processedData && processedData.length > 10
        ? Math.floor(processedData.length / 7) // Show ~7 ticks for larger datasets
        : 0; // Show all for small datasets

    const commonXAxisProps = {
      dataKey: categoryKey,
      stroke: "#6B7280",
      tick: { fontSize: 12, fill: "#6B7280", fontWeight: 500 },
      tickLine: { stroke: "#E5E7EB" },
      axisLine: { stroke: "#E5E7EB" },
      angle: -30,
      textAnchor: "end",
      interval: tickInterval,
    };

    const commonYAxisProps = {
      stroke: "#6B7280",
      tick: { fontSize: 12, fill: "#6B7280", fontWeight: 500 },
      tickLine: { stroke: "#E5E7EB" },
      axisLine: { stroke: "#E5E7EB" },
    };

    const CustomBar = (props) => {
      const { x, y, width, height, fill } = props;

      return (
        <g>
          {/* Gradient definition */}
          <defs>
            <linearGradient
              id={`gradient-${fill.replace("#", "")}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={fill} stopOpacity={0.8} />
              <stop offset="100%" stopColor={fill} stopOpacity={0.4} />
            </linearGradient>
          </defs>
          {/* Main bar with gradient */}
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={`url(#gradient-${fill.replace("#", "")})`}
            stroke={fill}
            strokeWidth={1.5}
            rx={6}
            ry={6}
          />
          {/* Highlight on top */}
          <rect
            x={x}
            y={y}
            width={width}
            height={Math.min(4, height)}
            fill={fill}
            rx={6}
            ry={6}
          />
        </g>
      );
    };

    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-transparent backdrop-blur-sm border border-white/10 rounded-xl p-3 shadow-sm">
            <p className="font-semibold text-gray-900 mb-1">{label}</p>
            {payload.map((entry, index) => (
              <p
                key={index}
                className="text-sm font-medium"
                style={{ color: entry.color }}
              >
                {entry.name}: {entry.value}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };

    switch (type) {
      case "line":
        return (
          <LineChart
            data={processedData}
            margin={{ top: 20, right: 30, left: 0, bottom: 50 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              strokeOpacity={0.6}
              vertical={false}
            />
            <XAxis {...commonXAxisProps} />
            <YAxis {...commonYAxisProps} />
            <Tooltip content={CustomTooltip} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ paddingBottom: "20px" }}
            />
            {dataKey.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={3}
                dot={{
                  fill: colors[index % colors.length],
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  stroke: colors[index % colors.length],
                  strokeWidth: 2,
                }}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
              />
            ))}
          </LineChart>
        );

      case "bar":
        return (
          <BarChart
            data={processedData}
            margin={{ top: 20, right: 30, left: 0, bottom: 50 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              strokeOpacity={0.6}
              vertical={false}
            />
            <XAxis {...commonXAxisProps} />
            <YAxis {...commonYAxisProps} />
            <Tooltip content={CustomTooltip} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="rect"
              wrapperStyle={{ paddingBottom: "20px" }}
            />
            {dataKey.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                shape={<CustomBar />}
                radius={[6, 6, 0, 0]}
              />
            ))}
          </BarChart>
        );
      default:
        return (
          <EmptyState
            message="Invalid chart type."
            icon={<TriangleAlert size={40} />}
          />
        );
    }
  }, [processedData, type, dataKey, categoryKey, colors]);

  const renderContent = () => {
    if (isLoading) return <LoadingSkeleton />;
    if (error)
      return <EmptyState message={error} icon={<TriangleAlert size={40} />} />;
    if (!processedData || processedData.length === 0)
      return (
        <EmptyState
          message="No data to display."
          icon={<ChartColumnBig size={40} />}
        />
      );

    // **PERFORMANCE FIX 4: The final gate.**
    // The chart will NOT render until it's both visible AND "ready".
    // Until then, we show the lightweight skeleton, which does not block the main thread.
    if (!isReadyToRender) {
      return <LoadingSkeleton />;
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    );
  };

  return (
    <div ref={containerRef} className="w-full group">
      <div
        className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 
                      border border-white/20 ring-1 ring-gray-200/50 
                      hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 
                      transition-all duration-500 ease-out overflow-hidden"
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 opacity-50"></div>

        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-900 transition-colors duration-200">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-600 font-medium">{subtitle}</p>
            )}
          </div>

          {/* Chart Container */}
          <div className="relative">
            <div className="h-[320px] md:h-[380px] rounded-xl overflow-hidden">
              {renderContent()}
            </div>

            {/* Subtle border glow on hover */}
            <div
              className="absolute inset-0 rounded-xl ring-1 ring-inset ring-blue-500/10 
                            group-hover:ring-blue-500/20 transition-all duration-300"
            ></div>
          </div>
        </div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent 
                         transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                         transition-transform duration-1000 ease-out"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChartCard);
