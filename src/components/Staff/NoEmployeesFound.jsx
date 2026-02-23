import { useRouter } from "next/navigation";
const NoEmployeesFound = ({ colSpan = 12, filtered = false }) => {
  const router = useRouter();
  return (
    <tr>
      <td colSpan={colSpan} className="py-20 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          {/* Icon stack */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            {filtered ? (
              /* search/filter indicator */
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </div>
            ) : (
              /* plus indicator */
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
            )}
          </div>

          {/* Text */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-semibold text-slate-700">
              {filtered ? "No results found" : "No employees yet"}
            </p>
            <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">
              {filtered
                ? "Try adjusting your search or filter to find what you're looking for."
                : "Add your first employee to get started."}
            </p>
          </div>

          {/* CTA — only shown when not filtering */}
          {!filtered &&
            <button className="inline-flex items-center gap-1.5 mt-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm"
              onClick={() => router.push("/staff/add")}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Employee
            </button>
          }
        </div>
      </td>
    </tr>
  );
}

export default NoEmployeesFound;