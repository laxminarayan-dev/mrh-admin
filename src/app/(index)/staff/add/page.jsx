"use client";
import {
    ArrowLeft, User, Phone, Mail, MapPin, CreditCard,
    FileText, Calendar, Lock, CheckCircle2, ChefHat, Users, Bike, Eye, EyeOff
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const EMPTY = { empName: "", phone: "", email: "", address: "", city: "", state: "", pincode: "", aadharNo: "", panNo: "", dateOfJoining: "", salary: "", department: "", emergencyContact: "", password: "", confirmPassword: "", role: "" };
const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-800 bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-300 transition";

// ── Moved OUTSIDE the main component to prevent remounting on every keystroke ──

const Section = ({ title, children }) => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">{title}</h2>
        {children}
    </div>
);

const Field = ({ label, icon, required, error, children }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
            {icon && <span className="text-slate-400">{icon}</span>}{label}
            {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

const ROLES = [
    { value: "cook", label: "Cook", desc: "Kitchen staff", icon: <ChefHat size={20} />, border: "border-amber-400", bg: "bg-amber-50", ibg: "bg-amber-100", ic: "text-amber-600", tc: "text-amber-700" },
    { value: "worker", label: "Worker", desc: "General ops", icon: <Users size={20} />, border: "border-blue-400", bg: "bg-blue-50", ibg: "bg-blue-100", ic: "text-blue-600", tc: "text-blue-700" },
    { value: "rider", label: "Rider", desc: "Delivery staff", icon: <Bike size={20} />, border: "border-green-400", bg: "bg-green-50", ibg: "bg-green-100", ic: "text-green-600", tc: "text-green-700" },
];

// ─────────────────────────────────────────────────────────────────────────────

const AddEmployee = ({ onBack, onSuccess }) => {
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const router = useRouter();

    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: "" })); };

    const validate = () => {
        const e = {};
        if (!form.empName.trim()) e.empName = "Required.";
        if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Invalid 10-digit number.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email.";
        if (!form.address.trim()) e.address = "Required.";
        if (!/^\d{12}$/.test(form.aadharNo.replace(/\s/g, ""))) e.aadharNo = "Invalid Aadhar (12 digits).";
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.panNo.toUpperCase())) e.panNo = "Invalid PAN format.";
        if (!form.dateOfJoining) e.dateOfJoining = "Required.";
        if (!form.role) e.role = "Select a role.";
        if (form.password.length < 6) e.password = "Min. 6 characters.";
        if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match.";
        return e;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSubmitted(true);
        setTimeout(() => {
            onSuccess && onSuccess(form);
            router.push("/staff");
        }, 1400);
    };

    if (submitted) return (
        <div className="min-h-screen bg-transparent flex items-center justify-center">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 flex flex-col items-center gap-4 max-w-sm w-full mx-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
                    <CheckCircle2 size={36} className="text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Employee Added!</h2>
                <p className="text-sm text-slate-500 text-center">
                    <span className="font-semibold text-slate-700">{form.empName}</span> joined as a{" "}
                    <span className="font-semibold capitalize">{form.role}</span>.
                </p>
                <button onClick={() => router.push("/staff")} className="mt-2 bg-indigo-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
                    Back to Staff
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-7">
                    <button onClick={() => router.push("/staff")} className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-slate-500 shadow-sm transition-colors">
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Add New Employee</h1>
                        <p className="text-xs text-slate-400 mt-0.5">Fields marked <span className="text-red-400">*</span> are required</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    {/* Role */}
                    <Section title="Role">
                        <div className="grid grid-cols-3 gap-3">
                            {ROLES.map(r => {
                                const sel = form.role === r.value;
                                return (
                                    <button key={r.value} type="button" onClick={() => set("role", r.value)}
                                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${sel ? `${r.border} ${r.bg} shadow` : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                                        {sel && <CheckCircle2 size={14} className={`absolute top-2 right-2 ${r.ic}`} />}
                                        <div className={`p-2.5 rounded-xl ${sel ? r.ibg : "bg-gray-100"}`}>
                                            <span className={sel ? r.ic : "text-slate-400"}>{r.icon}</span>
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-sm font-semibold ${sel ? r.tc : "text-slate-700"}`}>{r.label}</p>
                                            <p className="text-[11px] text-slate-400">{r.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.role && <p className="text-xs text-red-500 mt-2">{errors.role}</p>}
                    </Section>

                    {/* Personal */}
                    <Section title="Personal Information">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Full Name" icon={<User size={12} />} required error={errors.empName}>
                                <input value={form.empName} onChange={e => set("empName", e.target.value)} placeholder="e.g. Ravi Kumar" className={inputCls} />
                            </Field>
                            <Field label="Phone" icon={<Phone size={12} />} required error={errors.phone}>
                                <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="10-digit number" maxLength={10} className={inputCls} />
                            </Field>
                            <Field label="Email" icon={<Mail size={12} />} required error={errors.email}>
                                <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="emp@example.com" className={inputCls} />
                            </Field>
                            <Field label="Emergency Contact" icon={<Phone size={12} />} error={errors.emergencyContact}>
                                <input value={form.emergencyContact} onChange={e => set("emergencyContact", e.target.value)} placeholder="Emergency number" maxLength={10} className={inputCls} />
                            </Field>
                        </div>
                    </Section>

                    {/* Address */}
                    <Section title="Address">
                        <div className="flex flex-col gap-4">
                            <Field label="Street Address" icon={<MapPin size={12} />} required error={errors.address}>
                                <input value={form.address} onChange={e => set("address", e.target.value)} placeholder="House No., Street, Area" className={inputCls} />
                            </Field>
                            <div className="grid grid-cols-3 gap-3">
                                <Field label="City" error={errors.city}>
                                    <input value={form.city} onChange={e => set("city", e.target.value)} placeholder="City" className={inputCls} />
                                </Field>
                                <Field label="State" error={errors.state}>
                                    <input value={form.state} onChange={e => set("state", e.target.value)} placeholder="State" className={inputCls} />
                                </Field>
                                <Field label="Pincode" error={errors.pincode}>
                                    <input value={form.pincode} onChange={e => set("pincode", e.target.value)} placeholder="6-digit" maxLength={6} className={inputCls} />
                                </Field>
                            </div>
                        </div>
                    </Section>

                    {/* Identity */}
                    <Section title="Identity & Employment">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Aadhar No." icon={<CreditCard size={12} />} required error={errors.aadharNo}>
                                <input value={form.aadharNo} onChange={e => set("aadharNo", e.target.value)} placeholder="XXXX XXXX XXXX" maxLength={14} className={`${inputCls} font-mono tracking-wider`} />
                            </Field>
                            <Field label="PAN No." icon={<FileText size={12} />} required error={errors.panNo}>
                                <input value={form.panNo} onChange={e => set("panNo", e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} className={`${inputCls} font-mono`} />
                            </Field>
                            <Field label="Date of Joining" icon={<Calendar size={12} />} required error={errors.dateOfJoining}>
                                <input type="date" value={form.dateOfJoining} onChange={e => set("dateOfJoining", e.target.value)} className={inputCls} />
                            </Field>
                            <Field label="Monthly Salary (₹)" icon={<CreditCard size={12} />} error={errors.salary}>
                                <input type="number" value={form.salary} onChange={e => set("salary", e.target.value)} placeholder="e.g. 15000" className={inputCls} />
                            </Field>
                            <Field label="Department" error={errors.department}>
                                <input value={form.department} onChange={e => set("department", e.target.value)} placeholder="e.g. Operations" className={inputCls} />
                            </Field>
                        </div>
                    </Section>

                    {/* Credentials */}
                    <Section title="Account Credentials">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Password" icon={<Lock size={12} />} required error={errors.password}>
                                <div className="relative">
                                    <input type={showPass ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min. 6 characters" className={`${inputCls} pr-10`} />
                                    <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </Field>
                            <Field label="Confirm Password" icon={<Lock size={12} />} required error={errors.confirmPassword}>
                                <div className="relative">
                                    <input type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} placeholder="Re-enter password" className={`${inputCls} pr-10`} />
                                    <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </Field>
                        </div>
                    </Section>

                    <div className="flex justify-end gap-3 pb-10">
                        <button type="button" onClick={() => router.push("/staff")} className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors">
                            Add Employee
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmployee;