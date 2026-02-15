import {
  IndianRupee,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const KPIBoxGroup = ({ kpiData }) => {
  const getIconComponent = (iconName) => {
    const iconProps = "h-6 w-6";
    switch (iconName) {
      case "IndianRupee":
        return <IndianRupee className={iconProps} />;
      case "ShoppingCart":
        return <ShoppingCart className={iconProps} />;
      case "Users":
        return <Users className={iconProps} />;
      default:
        return <Users className={iconProps} />;
    }
  };

  const getGradientColors = (iconName) => {
    switch (iconName) {
      case "IndianRupee":
        return {
          bg: "from-emerald-500/10 to-green-500/5",
          icon: "from-emerald-500 to-green-600",
          ring: "ring-emerald-500/20",
        };
      case "ShoppingCart":
        return {
          bg: "from-blue-500/10 to-indigo-500/5",
          icon: "from-blue-500 to-indigo-600",
          ring: "ring-blue-500/20",
        };
      case "Users":
        return {
          bg: "from-orange-500/10 to-amber-500/5",
          icon: "from-orange-500 to-amber-600",
          ring: "ring-orange-500/20",
        };
      default:
        return {
          bg: "from-gray-500/10 to-slate-500/5",
          icon: "from-gray-500 to-slate-600",
          ring: "ring-gray-500/20",
        };
    }
  };

  return (
    <div className="mb-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {kpiData.map((box, index) => {
          const colors = getGradientColors(box.icon);
          const isPositiveChange =
            box.subTitle && !box.subTitle.toString().includes("-");

          return (
            <div
              key={index + box.title}
              className={`group relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 
                         shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 
                         transition-all duration-500 ease-out
                         ring-1 ${colors.ring} hover:ring-2 hover:ring-opacity-40`}
            >
              {/* Background gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${colors.bg} rounded-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none`}
                aria-hidden="true"
              ></div>

              <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    {box.title}
                  </p>

                  <p className="text-3xl font-bold text-gray-900 mb-3 transition-transform duration-200">
                    {box.counts}
                  </p>

                  <div className="flex items-center space-x-2">
                    {isPositiveChange ? (
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        isPositiveChange ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {box.subTitle}
                    </span>
                  </div>
                </div>

                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${colors.icon} 
                                 flex items-center justify-center shadow-lg shadow-black/20 
                                 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                >
                  <div className="text-white">{getIconComponent(box.icon)}</div>
                </div>
              </div>

              {/* Subtle shimmer effect on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                aria-hidden="true"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KPIBoxGroup;
