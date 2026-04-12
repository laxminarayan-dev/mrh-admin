"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Mail,
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle2,
  Archive,
  Trash2,
  Reply,
  X,
  Loader,
  Edit,
  ChevronDown,
  Download,
} from "lucide-react";

// ─── Status Config ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-blue-100 text-blue-700",
    icon: AlertCircle,
  },
  read: {
    label: "Responded",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  responded: {
    label: "Responded",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  resolved: {
    label: "Resolved",
    color: "bg-slate-100 text-slate-700",
    icon: Archive,
  },
};

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "text-green-600 bg-green-50" },
  medium: { label: "Medium", color: "text-yellow-600 bg-yellow-50" },
  high: { label: "High", color: "text-orange-600 bg-orange-50" },
};

const CATEGORY_OPTIONS = [
  { value: "menu", label: "Menu Inquiry" },
  { value: "catering", label: "Catering" },
  { value: "bulk_order", label: "Bulk Order" },
  { value: "feedback", label: "Feedback" },
  { value: "complaint", label: "Complaint" },
  { value: "other", label: "Other" },
];

// ─── Skeleton Loader ────────────────────────────────────────────────────────
function InquiryRowSkeleton() {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="flex-1">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-3 w-16 bg-gray-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded" />
          <div className="h-8 w-8 bg-gray-200 rounded" />
        </div>
      </td>
    </tr>
  );
}

// ─── Main Admin Page ────────────────────────────────────────────────────────
export default function InquiryManagement() {
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal states
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [responseLoading, setResponseLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    responded: 0,
    resolved: 0,
  });

  // Fetch all inquiries
  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("admin-key") || localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inquiry`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setInquiries(data.inquiries || []);
        calculateStats(data.inquiries || []);
      } else {
        console.error("Failed to fetch inquiries");
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate statistics
  const calculateStats = (inquiries) => {
    const stats = {
      total: inquiries.length,
      pending: inquiries.filter((i) => i.status?.toLowerCase() === "pending")
        .length,
      responded: inquiries.filter(
        (i) =>
          i.status?.toLowerCase() === "read" ||
          i.status?.toLowerCase() === "responded",
      ).length,
      resolved: inquiries.filter((i) => i.status?.toLowerCase() === "resolved")
        .length,
    };
    setStats(stats);
  };

  // Filter and search inquiries
  useEffect(() => {
    let result = [...inquiries];

    // Search
    if (searchTerm) {
      result = result.filter(
        (i) =>
          i.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.inquiry?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (i) => i.status?.toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    // Priority filter
    if (priorityFilter !== "all") {
      result = result.filter(
        (i) => i.priority?.toLowerCase() === priorityFilter.toLowerCase(),
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter(
        (i) => i.category?.toLowerCase() === categoryFilter.toLowerCase(),
      );
    }

    setFilteredInquiries(result);
  }, [inquiries, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  // Fetch inquiries on mount
  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Handle respond to inquiry
  const handleRespond = async () => {
    if (!responseText.trim() || !selectedInquiry) return;

    try {
      setResponseLoading(true);
      const token =
        localStorage.getItem("admin-key") || localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inquiry/${selectedInquiry._id}/respond`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            adminResponse: responseText.trim(),
            status: "read",
          }),
        },
      );

      if (response.ok) {
        fetchInquiries();
        setShowResponseModal(false);
        setResponseText("");
        setSelectedInquiry(null);
      } else {
        console.error("Failed to respond");
      }
    } catch (error) {
      console.error("Error responding:", error);
    } finally {
      setResponseLoading(false);
    }
  };

  // Handle delete inquiry
  const handleDelete = async (inquiryId) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?"))
      return;

    try {
      const token =
        localStorage.getItem("admin-key") || localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inquiry/${inquiryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        fetchInquiries();
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  // Handle status change
  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      const token =
        localStorage.getItem("admin-key") || localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inquiry/${inquiryId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response.ok) {
        fetchInquiries();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Handle priority change
  const handlePriorityChange = async (inquiryId, newPriority) => {
    try {
      const token =
        localStorage.getItem("admin-key") || localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inquiry/${inquiryId}/priority`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ priority: newPriority }),
        },
      );

      if (response.ok) {
        fetchInquiries();
      }
    } catch (error) {
      console.error("Error updating priority:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inquiry Management</h1>
        <p className="text-gray-600">
          Monitor and respond to customer inquiries
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Mail size={32} className="text-blue-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.pending}
              </p>
            </div>
            <AlertCircle size={32} className="text-blue-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Responded</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.responded}
              </p>
            </div>
            <CheckCircle2 size={32} className="text-green-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-slate-600">
                {stats.resolved}
              </p>
            </div>
            <Archive size={32} className="text-slate-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Filters & Search
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Name, email, message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 px-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="read">Responded</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Categories</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setPriorityFilter("all");
              setCategoryFilter("all");
            }}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Reset
          </button>
          <button
            onClick={fetchInquiries}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Loader size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <InquiryRowSkeleton />
                  <InquiryRowSkeleton />
                  <InquiryRowSkeleton />
                </>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Mail size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">No inquiries found</p>
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <tr
                    key={inquiry._id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {inquiry.fullName}
                        </p>
                        <p className="text-sm text-gray-600">{inquiry.email}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                          {inquiry.inquiry}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={inquiry.status?.toLowerCase() || "pending"}
                        onChange={(e) =>
                          handleStatusChange(inquiry._id, e.target.value)
                        }
                        className={`px-3 py-1 rounded-full text-sm font-semibold cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          STATUS_CONFIG[
                            inquiry.status?.toLowerCase() || "pending"
                          ]?.color
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="read">Responded</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={inquiry.priority?.toLowerCase() || "medium"}
                        onChange={(e) =>
                          handlePriorityChange(inquiry._id, e.target.value)
                        }
                        className={`px-3 py-1 rounded-full text-sm font-semibold cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          PRIORITY_CONFIG[
                            inquiry.priority?.toLowerCase() || "medium"
                          ]?.color
                        }`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-900">
                        {inquiry.category?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {new Date(inquiry.createdAt).toLocaleDateString(
                          "en-IN",
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(inquiry.createdAt).toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedInquiry(inquiry);
                            setResponseText(inquiry.adminResponse || "");
                            setShowResponseModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Respond"
                        >
                          <Reply size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(inquiry._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Respond to Inquiry
              </h2>
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedInquiry(null);
                  setResponseText("");
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">From</p>
                <p className="font-semibold text-gray-900">
                  {selectedInquiry.fullName}
                </p>
                <p className="text-sm text-gray-600">{selectedInquiry.email}</p>
              </div>

              {/* Original Inquiry */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Original Inquiry
                </label>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-gray-700 whitespace-pre-wrap break-words">
                  {selectedInquiry.inquiry}
                </div>
              </div>

              {/* Response Text */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Response
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write your response here..."
                  rows={6}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {responseText.length} characters
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setSelectedInquiry(null);
                    setResponseText("");
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRespond}
                  disabled={responseLoading || !responseText.trim()}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {responseLoading ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Reply size={16} />
                      Send Response
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
