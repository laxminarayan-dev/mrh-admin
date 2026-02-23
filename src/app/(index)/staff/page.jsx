"use client";
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Users,
  ChefHat,
  Bike,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  Calendar,
  Wallet,
  KeyRound,
} from "lucide-react";
import NoEmployeesFound from "@/components/Staff/NoEmployeesFound";
import { useRouter } from "next/navigation";
import { deleteEmployee, getEmployees } from "@/store/employeeAPI";
import { capitalizeWords, formatDate, formatEMPID } from "@/lib/utils";

/* ── Role Badge ── */
const RoleBadge = ({ role }) => {
  const map = {
    cook: {
      label: "Cook",
      icon: <ChefHat size={13} />,
      cls: "bg-amber-100 text-amber-700 border border-amber-200",
    },
    worker: {
      label: "Worker",
      icon: <Users size={13} />,
      cls: "bg-blue-100 text-blue-700 border border-blue-200",
    },
    rider: {
      label: "Rider",
      icon: <Bike size={13} />,
      cls: "bg-green-100 text-green-700 border border-green-200",
    },
  };
  const { label, icon, cls } = map[role] || {
    label: role,
    icon: null,
    cls: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cls}`}
    >
      {icon}
      {label}
    </span>
  );
};

/* ── Avatar ── */
const Avatar = ({ name, role }) => {
  const colors = {
    cook: "bg-amber-100 text-amber-600",
    worker: "bg-blue-100 text-blue-600",
    rider: "bg-green-100 text-green-600",
  };
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-[15px] font-bold shrink-0 ${colors[role] || "bg-slate-100 text-slate-500"}`}
    >
      {initials}
    </div>
  );
};

/* ── Field Block ── */
const FieldBlock = ({ icon, label, value, mono = false, children }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
      <span className="text-slate-300">{icon}</span>
      {label}
    </span>
    {children ?? (
      <span
        className={`text-sm font-medium text-slate-700 ${mono ? "font-mono tracking-wide" : ""}`}
      >
        {value || "—"}
      </span>
    )}
  </div>
);

const PER_PAGE = 5;

export default function StaffManagement() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [visiblePwd, setVisiblePwd] = useState({});
  const [page, setPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    getEmployees()
      .then((res) => {
        console.log(res);
        setEmployees(res);
      })
      .catch(() => setEmployees([]));
  }, []);

  const filtered = employees.filter((e) => {
    const ms =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e._id.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    return ms && (roleFilter === "all" || e.role === roleFilter);
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const rows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const counts = {
    all: employees.length,
    cook: employees.filter((e) => e.role === "cook").length,
    worker: employees.filter((e) => e.role === "worker").length,
    rider: employees.filter((e) => e.role === "rider").length,
  };

  const handleDelete = (empId) => {
    if (window.confirm(`Delete ${empId}?`))
      setEmployees((prev) => prev.filter((e) => e.empId !== empId));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Staff Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {employees.length} employees registered
          </p>
        </div>
        <button
          onClick={() => router.push("/staff/add")}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {/* ── Filter Pills ── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { k: "all", l: "All" },
          { k: "cook", l: "Cooks", i: <ChefHat size={13} /> },
          { k: "worker", l: "Workers", i: <Users size={13} /> },
          { k: "rider", l: "Riders", i: <Bike size={13} /> },
        ].map(({ k, l, i }) => {
          const active = roleFilter === k;
          return (
            <button
              key={k}
              onClick={() => {
                setRoleFilter(k);
                setPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                active
                  ? "bg-indigo-600 text-white border-indigo-600 shadow"
                  : "bg-white text-slate-600 border-gray-200 hover:border-indigo-300"
              }`}
            >
              {i}
              {l}
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[11px] font-bold ${active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"}`}
              >
                {counts[k]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search ── */}
      <div className="relative mb-6 max-w-sm">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name, ID or email…"
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 shadow-sm"
        />
      </div>

      {/* ── Employee Cards ── */}
      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full">
            <tbody>
              <NoEmployeesFound
                colSpan={1}
                filtered={!!(search || roleFilter !== "all")}
              />
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((emp) => (
            <div
              key={emp._id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <Avatar name={emp.name} role={emp.role} />
                  <div>
                    <p className="text-[15px] font-bold text-slate-800 leading-snug">
                      {capitalizeWords(emp.name)}
                    </p>
                    <p className="text-xs font-mono font-semibold text-indigo-400 mt-0.5">
                      {formatEMPID(emp._id)}
                    </p>
                  </div>
                  <RoleBadge role={emp.role} />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all"
                    onClick={() => router.push(`/staff/edit?id=${emp._id}`)}
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => deleteEmployee(emp._id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>

              {/* Card Body — divider-separated groups */}
              <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-x-8 gap-y-5">
                <FieldBlock
                  icon={<Phone size={11} />}
                  label="Phone"
                  value={emp.phone}
                />

                <div className="sm:col-span-1">
                  <FieldBlock
                    icon={<Mail size={11} />}
                    label="Email"
                    value={emp.email}
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 lg:col-span-2 xl:col-span-2">
                  <FieldBlock
                    icon={<MapPin size={11} />}
                    label="Address"
                    value={capitalizeWords(
                      `${emp.address}, ${emp.city}, ${emp.state} - ${emp.pincode}`,
                    )}
                  />
                </div>

                <FieldBlock
                  icon={<CreditCard size={11} />}
                  label="Aadhar No"
                  value={emp.aadharNo}
                  mono
                />

                <FieldBlock
                  icon={<FileText size={11} />}
                  label="PAN No"
                  value={emp.panNo}
                  mono
                />

                <FieldBlock
                  icon={<Calendar size={11} />}
                  label="Date of Joining"
                  value={formatDate(emp.dateOfJoining)}
                />

                <FieldBlock
                  icon={<Wallet size={11} />}
                  label="Salary"
                  value={
                    emp.salary
                      ? `₹${Number(emp.salary).toLocaleString("en-IN")}/mo`
                      : "—"
                  }
                />

                {/* Password — custom */}
                <FieldBlock icon={<KeyRound size={11} />} label="Password">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium text-slate-700 tracking-wider">
                      {visiblePwd[emp.empId] ? emp.password : "••••••••"}
                    </span>
                    <button
                      onClick={() =>
                        setVisiblePwd((p) => ({
                          ...p,
                          [emp.empId]: !p[emp.empId],
                        }))
                      }
                      className="text-slate-300 hover:text-indigo-400 transition-colors"
                    >
                      {visiblePwd[emp.empId] ? (
                        <EyeOff size={13} />
                      ) : (
                        <Eye size={13} />
                      )}
                    </button>
                  </div>
                </FieldBlock>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-7">
          <p className="text-sm text-slate-400">
            Showing {(page - 1) * PER_PAGE + 1} –{" "}
            {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}{" "}
            employees
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-slate-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                  p === page
                    ? "bg-indigo-600 text-white shadow"
                    : "border border-gray-200 bg-white text-slate-500 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-slate-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
