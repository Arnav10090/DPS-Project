import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { CheckCircle, UploadCloud } from "lucide-react";

type UploadedFile = {
  id: string;
  file: File;
  preview?: string;
  progress?: number;
  error?: string | null;
};

export default function WorkClosureRequest() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [completionDate, setCompletionDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 16),
  ); // datetime-local format
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => ({
    c1: false,
    c2: false,
    c3: false,
    c4: false,
    c5: false,
    c6: false,
  }));
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // sample work summary data (would come from API)
  const workSummary = useMemo(
    () => ({
      permitId: "WCS-2024-001",
      descriptionSummary: "Electrical maintenance in Building A, Floor 2",
      requestedBy: "John Doe",
      department: "Maintenance Team",
      startedAt: "15 Jan 2024, 09:00 AM",
      approver: "Sarah Wilson",
      safetyOfficer: "Mike Chen",
      deadline: "16 Jan 2024, 05:00 PM",
      location: "Building A, Electrical Room 2A",
      priority: "Medium",
      status: "IN PROGRESS",
    }),
    [],
  );

  useEffect(() => {
    return () => {
      // revoke previews
      files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
    };
  }, [files]);

  function validate() {
    const descOk =
      description.trim().length > 0 && description.trim().length <= 1000;
    const dateOk = Boolean(completionDate);
    const checklistOk = Object.values(checklist).every(Boolean);
    return descOk && dateOk && checklistOk;
  }

  function onFilesSelected(list: FileList | null) {
    setFileError(null);
    if (!list) return;
    const arr = Array.from(list);

    // Count existing photos and documents
    const existingPhotos = files.filter((f) =>
      f.file.type.startsWith("image/"),
    ).length;
    const existingDocs = files.filter(
      (f) => !f.file.type.startsWith("image/"),
    ).length;

    let photosToAdd = 0;
    let docsToAdd = 0;

    // Count how many new photos and documents are being added
    for (const f of arr) {
      if (f.type.startsWith("image/")) {
        photosToAdd++;
      } else {
        docsToAdd++;
      }
    }

    // Validate limits
    if (existingPhotos + photosToAdd > 2) {
      setFileError("Maximum 2 photos allowed");
      return;
    }
    if (existingDocs + docsToAdd > 1) {
      setFileError("Maximum 1 document allowed");
      return;
    }

    const next: UploadedFile[] = [];
    for (const f of arr) {
      if (f.size > 5 * 1024 * 1024) {
        setFileError(`File ${f.name} exceeds 5MB`);
        continue;
      }
      const allowed = [
        "image/png",
        "image/jpeg",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowed.includes(f.type)) {
        setFileError(`File ${f.name} type not supported`);
        continue;
      }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const preview = f.type.startsWith("image/")
        ? URL.createObjectURL(f)
        : undefined;
      next.push({ id, file: f, preview, progress: 100, error: null });
    }
    setFiles((s) => [...s, ...next]);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    onFilesSelected(e.dataTransfer.files);
    if (dropRef.current)
      dropRef.current.classList.remove("ring-2", "ring-blue-400");
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (dropRef.current)
      dropRef.current.classList.add("ring-2", "ring-blue-400");
  }
  function onDragLeave() {
    if (dropRef.current)
      dropRef.current.classList.remove("ring-2", "ring-blue-400");
  }

  function removeFile(id: string) {
    setFiles((s) => {
      const found = s.find((x) => x.id === id);
      if (found && found.preview) URL.revokeObjectURL(found.preview);
      return s.filter((x) => x.id !== id);
    });
  }

  function saveDraft() {
    const payload = {
      description,
      completionDate,
      checklist,
      files: files.map((f) => ({ name: f.file.name, size: f.file.size })),
    };
    try {
      localStorage.setItem("wcs_closure_draft", JSON.stringify(payload));
      alert("Draft saved");
    } catch {
      alert("Unable to save draft");
    }
  }

  function submitRequest() {
    if (!validate()) return;
    setShowConfirm(false);
    setSubmitting(true);
    // simulate upload
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  }

  if (submitted) {
    return (
      <div className="pb-8">
        <div className="bg-background p-6 rounded-md w-full">
          <div className="bg-white rounded-md p-8 text-center shadow">
            <CheckCircle size={48} className="mx-auto text-emerald-500" />
            <h2 className="text-2xl font-semibold mt-4">
              Work closure request submitted successfully
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Your request has been sent to {workSummary.approver} for approval.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => navigate("/requester/dashboard")}>
                Back to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                }}
              >
                Make another
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Page banner (in addition to global header) */}
      <div className="w-full bg-gradient-to-r from-slate-800 to-blue-800 text-white shadow-md mb-6" />

      <div className="w-full px-6">
        {/* Work Summary Card */}
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 h-[219px] flex items-start">
            <div className="flex-1 grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-700">Permit Number</div>
                <div className="font-semibold text-gray-900">
                  {workSummary.permitId}
                </div>

                <div className="mt-3 text-sm text-gray-700">
                  Work Description
                </div>
                <div className="font-semibold text-lg text-gray-900">
                  {workSummary.descriptionSummary}
                </div>

                <div
                  className="grid grid-cols-2 gap-2 text-sm text-gray-700"
                  style={{ margin: "12px -1px 0 0" }}
                >
                  <div>
                    Requested By:{" "}
                    <span className="font-medium text-gray-800">
                      {workSummary.requestedBy}
                    </span>
                  </div>
                  <div>
                    Department:{" "}
                    <span className="font-medium text-gray-800">
                      {workSummary.department}
                    </span>
                  </div>
                  <div>
                    Work Started:{" "}
                    <span className="font-medium text-gray-800">
                      {workSummary.startedAt}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-700">Approver</div>
                    <div className="font-medium text-gray-800">
                      {workSummary.approver}
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      Safety Officer
                    </div>
                    <div className="font-medium text-gray-800">
                      {workSummary.safetyOfficer}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-block rounded-full bg-emerald-500 text-white px-3 py-1 text-xs font-bold">
                      {workSummary.status}
                    </div>
                    <div className="mt-4 text-sm text-gray-700">
                      Original Deadline
                    </div>
                    <div className="font-medium text-gray-800">
                      {workSummary.deadline}
                    </div>
                    <div className="mt-2 text-sm text-gray-700">Location</div>
                    <div className="font-medium text-gray-800">
                      {workSummary.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Work Completion Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Work Completion Details</CardTitle>
            <CardDescription>
              Please provide complete details of work performed
            </CardDescription>
            <div className="text-sm text-red-600">* Required fields</div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Work Completion Description *
                </label>
                <div className="text-xs text-muted-foreground">
                  Describe all work performed, methods used, and any issues
                  encountered
                </div>
                <textarea
                  rows={6}
                  value={description}
                  onBlur={() => setDescriptionTouched(true)}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  placeholder="Describe the completed work in detail..."
                  className={`mt-2 w-full rounded-md border p-3 ${descriptionTouched && description.trim().length === 0 ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-300`}
                />
                <div className="text-right text-xs text-muted-foreground">
                  {description.length}/1000 characters
                </div>
                {descriptionTouched && description.trim().length === 0 && (
                  <div className="text-red-600 text-xs mt-1">
                    Description is required
                  </div>
                )}
              </div>

              {/* Date/time */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Work Completion Date & Time *
                </label>
                <div className="mt-2 flex gap-2 items-center">
                  <input
                    type="datetime-local"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="rounded-md border px-3 py-2 bg-white"
                  />
                </div>
                {!completionDate && (
                  <div className="text-red-600 text-xs mt-1">
                    Completion date/time is required
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Completion Checklist *
                </label>
                <div className="text-xs text-muted-foreground">
                  Check all applicable items
                </div>
                <div className="mt-3 grid gap-2">
                  {[
                    {
                      key: "c1",
                      label: "All work completed as per permit requirements",
                    },
                    { key: "c2", label: "Work area cleaned and restored" },
                    { key: "c3", label: "Tools and equipment returned" },
                    {
                      key: "c4",
                      label: "Safety protocols followed throughout",
                    },
                    { key: "c5", label: "No damage to surrounding areas" },
                    { key: "c6", label: "All personnel accounted for" },
                  ].map((it) => (
                    <label
                      key={it.key}
                      className="inline-flex items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={!!checklist[it.key]}
                        onChange={(e) =>
                          setChecklist((s) => ({
                            ...s,
                            [it.key]: e.target.checked,
                          }))
                        }
                        className="h-5 w-5 rounded border"
                      />
                      <span className="text-sm text-gray-800">{it.label}</span>
                    </label>
                  ))}
                </div>
                {!Object.values(checklist).every(Boolean) && (
                  <div className="text-red-600 text-xs mt-1">
                    All checklist items must be confirmed
                  </div>
                )}
              </div>

              {/* File upload */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Completion Photos & Documents
                </label>
                <div className="text-xs text-muted-foreground">
                  Upload photos of completed work, before/after images,
                  certificates, etc. (Max 2 photos, 1 document, 5MB each)
                </div>
                <div
                  ref={dropRef}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 h-[120px] rounded-md border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer"
                >
                  <div className="text-center text-gray-600">
                    <UploadCloud className="mx-auto" />
                    <div>Drag files here or click to browse</div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => onFilesSelected(e.target.files)}
                  />
                </div>
                {fileError && (
                  <div className="text-red-600 text-xs mt-1">{fileError}</div>
                )}
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {files.map((f) => (
                    <div key={f.id} className="border rounded p-2 bg-white">
                      {f.preview ? (
                        <img
                          src={f.preview}
                          alt={f.file.name}
                          className="h-24 w-full object-cover rounded"
                        />
                      ) : (
                        <div className="h-24 w-full bg-gray-100 rounded flex items-center justify-center">
                          {f.file.name}
                        </div>
                      )}
                      <div className="mt-2 text-xs truncate">
                        {f.file.name} • {(f.file.size / 1024 / 1024).toFixed(2)}{" "}
                        MB
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="w-2/3 bg-gray-200 h-1 rounded overflow-hidden">
                          <div
                            style={{ width: `${f.progress || 100}%` }}
                            className="h-full bg-blue-500"
                          />
                        </div>
                        <button
                          className="text-red-600 text-xs"
                          onClick={() => removeFile(f.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional comments */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Additional Comments
                </label>
                <div className="text-xs text-muted-foreground">
                  Any additional information or special notes
                </div>
                <textarea
                  rows={4}
                  placeholder="Add any additional comments..."
                  className="mt-2 w-full rounded-md border p-3 border-gray-300"
                />
              </div>
            </div>
          </CardContent>

          {/* Action Buttons */}
          <div className="bg-white border-t border-gray-200 p-6 flex justify-end gap-4">
            <a
              className="text-blue-500 hover:underline mr-4 self-center cursor-pointer"
              onClick={() => navigate(-1)}
            >
              Cancel
            </a>
            <Button variant="outline" onClick={saveDraft} className="w-[140px]">
              Save as Draft
            </Button>
            <Button
              className="w-[180px] bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
              onClick={() => setShowConfirm(true)}
              disabled={!validate() || submitting}
            >
              {submitting ? "Submitting..." : "Submit Closure Request"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowConfirm(false)}
          />
          <div className="bg-white rounded-md p-6 z-10 w-[400px]">
            <h3 className="text-lg font-semibold">
              Submit Work Closure Request?
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              You are about to submit the work closure request. This will notify
              the approver ({workSummary.approver}).
            </p>
            <div className="mt-4">
              <div className="text-sm font-semibold">Summary</div>
              <div className="text-xs text-muted-foreground mt-1">
                Permit: {workSummary.permitId}
              </div>
              <div className="text-xs text-muted-foreground">
                Completion Date:{" "}
                {completionDate
                  ? format(new Date(completionDate), "dd/MM/yyyy, hh:mm a")
                  : "-"}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button
                onClick={submitRequest}
                className="bg-emerald-500 text-white"
              >
                Confirm Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
