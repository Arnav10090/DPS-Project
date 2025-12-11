import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const PermitsClosed = () => {
  // Mock data for closed permits
  const navigate = useNavigate();

  // Redirect requesters away from this page
  useEffect(() => {
    const role =
      typeof window !== "undefined" ? localStorage.getItem("dps_role") : null;
    if (role === "requester") {
      navigate("/overall-status", { replace: true });
    }
  }, [navigate]);
  const [permitDocType, setPermitDocType] = useState<
    "work" | "highTension" | "gasLine"
  >("work");
  const [permits] = useState([
    {
      id: "PTW-2024-1001",
      title: "Pump Maintenance - HSM-1",
      description:
        "Routine maintenance of centrifugal pump P-101 including bearing replacement and alignment",
      requestDate: "2024-09-10",
      workStartDate: "2024-09-12",
      workCompletionDate: "2024-09-15",
      closureRequestDate: "2024-09-15",
      closureApprovalDate: "2024-09-16",
      status: "closed",
      plant: "HSM-1",
      department: "Maintenance",
      approver: "V. Rao",
      workDuration: "3 days",
      closureReason: "Work completed successfully. All safety checks passed.",
      documentsSubmitted: [
        "Work Completion Report",
        "Safety Checklist",
        "Photos",
      ],
      approverComments:
        "Work completed as per specifications. Area restored to original condition.",
      priority: "medium",
    },
    {
      id: "PTW-2024-1005",
      title: "Electrical Panel Upgrade - BOF",
      description: "Upgrade control panel wiring and install new safety relays",
      requestDate: "2024-09-08",
      workStartDate: "2024-09-09",
      workCompletionDate: "2024-09-14",
      closureRequestDate: "2024-09-14",
      closureApprovalDate: "2024-09-14",
      status: "closed",
      plant: "BOF",
      department: "Electrical",
      approver: "D. Mehta",
      workDuration: "5 days",
      closureReason: "Electrical work completed with all testing passed",
      documentsSubmitted: [
        "Test Certificates",
        "Installation Report",
        "Compliance Check",
      ],
      approverComments: "All electrical tests passed. System operational.",
      priority: "high",
    },
    {
      id: "PTW-2024-1012",
      title: "Valve Replacement - CRM Unit",
      description: "Replace faulty control valve V-205 in cooling water line",
      requestDate: "2024-09-05",
      workStartDate: "2024-09-07",
      workCompletionDate: "2024-09-11",
      closureRequestDate: "2024-09-11",
      closureApprovalDate: "2024-09-12",
      status: "closed",
      plant: "CRM",
      department: "Operations",
      approver: "K. Iyer",
      workDuration: "4 days",
      closureReason: "Valve replaced and system tested successfully",
      documentsSubmitted: ["Valve Test Report", "Pressure Test", "Leak Check"],
      approverComments: "New valve installed correctly. No leaks detected.",
      priority: "medium",
    },
    {
      id: "PTW-2024-1018",
      title: "Safety Equipment Installation",
      description:
        "Install emergency shower and eyewash station in chemical storage area",
      requestDate: "2024-09-03",
      workStartDate: "2024-09-04",
      workCompletionDate: "2024-09-06",
      closureRequestDate: "2024-09-06",
      closureApprovalDate: "2024-09-07",
      status: "closed",
      plant: "Utilities",
      department: "Safety",
      approver: "S. Officer",
      workDuration: "2 days",
      closureReason: "Safety equipment installed and tested",
      documentsSubmitted: [
        "Installation Certificate",
        "Flow Test Report",
        "Safety Audit",
      ],
      approverComments: "Safety equipment meets all regulatory requirements.",
      priority: "high",
    },
    {
      id: "PTW-2024-1025",
      title: "Conveyor Belt Replacement",
      description:
        "Replace worn conveyor belt section in material handling area",
      requestDate: "2024-08-28",
      workStartDate: "2024-08-30",
      workCompletionDate: "2024-09-03",
      closureRequestDate: "2024-09-03",
      closureApprovalDate: "2024-09-04",
      status: "closed",
      plant: "Sinter",
      department: "Maintenance",
      approver: "V. Rao",
      workDuration: "4 days",
      closureReason: "Belt replacement completed, system running smoothly",
      documentsSubmitted: [
        "Belt Specification",
        "Installation Photos",
        "Performance Test",
      ],
      approverComments: "Belt properly tensioned and aligned. Good work.",
      priority: "medium",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlant, setSelectedPlant] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [sortBy, setSortBy] = useState("closureDate");
  const [selectedPermit, setSelectedPermit] = useState(null);

  const plants = ["HSM-1", "HSM-2", "BOF", "CRM", "Sinter", "Utilities"];
  const priorities = ["high", "medium", "low"];

  const filteredPermits = useMemo(() => {
    return permits
      .filter((permit) => {
        const matchesSearch =
          permit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          permit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          permit.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlant =
          selectedPlant === "all" || permit.plant === selectedPlant;
        const matchesPriority =
          selectedPriority === "all" || permit.priority === selectedPriority;

        return matchesSearch && matchesPlant && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === "closureDate") {
          return (
            new Date(b.closureApprovalDate).getTime() -
            new Date(a.closureApprovalDate).getTime()
          );
        } else if (sortBy === "workDuration") {
          return parseInt(b.workDuration) - parseInt(a.workDuration);
        }
        return 0;
      });
  }, [permits, searchTerm, selectedPlant, selectedPriority, sortBy]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Closed Permits
              </h1>
              <p className="text-slate-600 mt-2">
                View and track your completed work permits and their closure
                status
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium">Total Closed</div>
                    <div className="text-2xl font-bold">{permits.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
              <input
                type="text"
                placeholder="Search permits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-slate-700"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-[220px]">
                <Select
                  value={selectedPlant}
                  onValueChange={(v) => setSelectedPlant(v)}
                >
                  <div className="text-md text-gray-700">
                    <p>
                      <strong>Plants:</strong>
                    </p>
                  </div>
                  <SelectTrigger aria-label="Select plant">
                    <SelectValue placeholder="All Plants" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plants</SelectItem>
                    {plants.map((plant) => (
                      <SelectItem key={plant} value={plant}>
                        {plant}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-[220px]">
                <Select
                  value={selectedPriority}
                  onValueChange={(v) => setSelectedPriority(v)}
                >
                  <div className="text-md text-gray-700">
                    <p>
                      <strong>Priority:</strong>
                    </p>
                  </div>
                  <SelectTrigger aria-label="Select priority">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-[220px]">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v)}>
                  <div className="text-md text-gray-700">
                    <p>
                      <strong>Sort By:</strong>
                    </p>
                  </div>
                  <SelectTrigger aria-label="Select sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="closureDate">Closure Date</SelectItem>
                    <SelectItem value="workDuration">Duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Permits Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPermits.map((permit) => (
            <div
              key={permit.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden group cursor-pointer"
              onClick={() => setSelectedPermit(permit)}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {permit.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(permit.priority)}`}
                      >
                        {permit.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {permit.description}
                    </p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 ml-4" />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-slate-500 mb-1">
                      PERMIT ID
                    </div>
                    <div className="font-semibold text-slate-800">
                      {permit.id}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-slate-500 mb-1">
                      PLANT
                    </div>
                    <div className="font-semibold text-slate-800">
                      {permit.plant}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-slate-500 mb-1">
                      WORK DURATION
                    </div>
                    <div className="font-semibold text-slate-800">
                      {permit.workDuration}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-slate-500 mb-1">
                      APPROVER
                    </div>
                    <div className="font-semibold text-slate-800">
                      {permit.approver}
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-center">
                      <div className="text-xs font-medium text-slate-500 mb-1">
                        WORK COMPLETED
                      </div>
                      <div className="font-semibold text-slate-800">
                        {formatDate(permit.workCompletionDate)}
                      </div>
                    </div>
                    <div className="flex-1 mx-4 relative">
                      <div className="h-0.5 bg-green-300 relative">
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-slate-500 mb-1">
                        CLOSURE APPROVED
                      </div>
                      <div className="font-semibold text-slate-800">
                        {formatDate(permit.closureApprovalDate)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="mb-4">
                  <div className="text-xs font-medium text-slate-500 mb-2">
                    SUBMITTED DOCUMENTS
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {permit.documentsSubmitted.map((doc, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200"
                      >
                        <FileText className="w-3 h-3 inline mr-1" />
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="text-sm text-slate-500">
                    Closed on {formatDate(permit.closureApprovalDate)}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPermits.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
            <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No closed permits found
            </h3>
            <p className="text-slate-600">
              Try adjusting your search criteria or filters to find the permits
              you're looking for.
            </p>
          </div>
        )}

        {/* Permit Details Modal */}
        {selectedPermit && (
          <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      {selectedPermit.title}
                    </h2>
                    <p className="text-slate-600 mt-1">{selectedPermit.id}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPermit(null)}
                    className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Status and Timeline */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-800">
                      Work Completed & Closed
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-green-600 font-medium mb-1">
                        Work Started
                      </div>
                      <div className="text-slate-800 font-semibold">
                        {formatDate(selectedPermit.workStartDate)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-green-600 font-medium mb-1">
                        Work Completed
                      </div>
                      <div className="text-slate-800 font-semibold">
                        {formatDate(selectedPermit.workCompletionDate)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-green-600 font-medium mb-1">
                        Closure Requested
                      </div>
                      <div className="text-slate-800 font-semibold">
                        {formatDate(selectedPermit.closureRequestDate)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-green-600 font-medium mb-1">
                        Closure Approved
                      </div>
                      <div className="text-slate-800 font-semibold">
                        {formatDate(selectedPermit.closureApprovalDate)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Work Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">
                      Work Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-slate-500">
                          Description
                        </label>
                        <p className="text-slate-800">
                          {selectedPermit.description}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-500">
                          Duration
                        </label>
                        <p className="text-slate-800">
                          {selectedPermit.workDuration}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-500">
                          Department
                        </label>
                        <p className="text-slate-800">
                          {selectedPermit.department}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">
                      Closure Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-slate-500">
                          Approved By
                        </label>
                        <p className="text-slate-800">
                          {selectedPermit.approver}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-500">
                          Closure Reason
                        </label>
                        <p className="text-slate-800">
                          {selectedPermit.closureReason}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-500">
                          Approver Comments
                        </label>
                        <p className="text-slate-800">
                          {selectedPermit.approverComments}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">
                    Submitted Documents
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {selectedPermit.documentsSubmitted.map((doc, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="text-slate-800 font-medium">
                            {doc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermitsClosed;
