import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  Clock,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModernPagination } from "@/components/ui/modern-pagination";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import type {
  PermitFormData,
  DeEnergizeChecklistItem,
  PreExecutionChecklistItem,
  ReEnergizeAuthorizationChecklistItem,
  SignatureData,
} from "@/lib/ht-permit-types";
import {
  rootSchema,
  basicDetailsSchema,
  workAuthorizationSchema,
  deEnergizeSchema,
  permitToWorkSchema,
  preExecutionSchema,
  jobCompletionSchema,
  reEnergizeInstructionSchema,
  reEnergizeAuthorizationSchema,
} from "@/lib/ht-permit-schemas";
import HTPermitPreview from "@/components/permit/ht/HTPermitPreview";
import { ApproverHTPermitDetailsSection } from "@/pages/ApproverPermitDetails";
import { SafetyHTPermitDetailsSection } from "@/pages/SafetyPermitDetails";

// Input components
export function InputField({
  name,
  label,
  type = "text",
  placeholder,
  required,
  className,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const err = errors as any;
  const fieldErr = name
    .split(".")
    .reduce((acc: any, key: string) => (acc ? acc[key] : undefined), err);

  return (
    <div className={cn("w-full", className)}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        type={type}
        aria-label={label}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-2 focus:border-blue-600 focus:outline-none focus:ring-0 shadow-sm",
          fieldErr && "border-red-500 focus:border-red-600",
        )}
        {...register(name)}
      />
      {fieldErr && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {fieldErr.message as string}
        </p>
      )}
    </div>
  );
}

export function TextArea({
  name,
  label,
  rows = 4,
  required,
  placeholder,
}: {
  name: string;
  label: string;
  rows?: number;
  required?: boolean;
  placeholder?: string;
}) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const value = watch(name) || "";
  const err = errors as any;
  const fieldErr = name
    .split(".")
    .reduce((acc: any, key: string) => (acc ? acc[key] : undefined), err);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <textarea
        aria-label={label}
        className={cn(
          "w-full resize-y rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-2 focus:border-blue-600 focus:outline-none focus:ring-0 shadow-sm",
          fieldErr && "border-red-500 focus:border-red-600",
        )}
        rows={rows}
        placeholder={placeholder}
        {...register(name)}
      />
      <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
        <span>Characters: {value.length}</span>
      </div>
      {fieldErr && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {fieldErr.message as string}
        </p>
      )}
    </div>
  );
}

export function DateTimePicker({
  nameDate,
  nameTime,
  label,
  required,
  className,
  hideLabel,
}: {
  nameDate: string;
  nameTime: string;
  label?: string;
  required?: boolean;
  className?: string;
  hideLabel?: boolean;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const err = errors as any;
  const dateErr = nameDate
    .split(".")
    .reduce((acc: any, key: string) => (acc ? acc[key] : undefined), err);
  const timeErr = nameTime
    .split(".")
    .reduce((acc: any, key: string) => (acc ? acc[key] : undefined), err);

  return (
    <div className={cn("flex flex-col", className)}>
      {label && !hideLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <div className="flex items-center gap-2">
        <div className="relative w-40">
          <Calendar
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="date"
            aria-label={`${label || ""} date`}
            className={cn(
              "w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 py-3 text-sm text-gray-900 focus:border-2 focus:border-blue-600 focus:outline-none",
              dateErr && "border-red-500 focus:border-red-600",
            )}
            {...register(nameDate)}
          />
        </div>
        <span className="text-sm text-gray-500">at</span>
        <div className="relative w-32">
          <Clock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="time"
            aria-label={`${label || ""} time`}
            className={cn(
              "w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 py-3 text-sm text-gray-900 focus:border-2 focus:border-blue-600 focus:outline-none",
              timeErr && "border-red-500 focus:border-red-600",
            )}
            {...register(nameTime)}
          />
        </div>
      </div>
      {(dateErr || timeErr) && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {(dateErr?.message || timeErr?.message) as string}
        </p>
      )}
    </div>
  );
}

// Signature Pad
export function SignaturePad({
  value,
  onChange,
}: {
  value?: string;
  onChange: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  const draw = (e: PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !drawing.current) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const justDrawnRef = useRef(false);

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    ctx?.beginPath();
  };
  const end = () => {
    // mark that a drawing just happened so we can prevent click -> upload
    justDrawnRef.current = true;
    setTimeout(() => {
      justDrawnRef.current = false;
    }, 300);

    drawing.current = false;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    ctx?.beginPath();
    if (canvas) onChange(canvas.toDataURL("image/png"));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const handler = (e: PointerEvent) => draw(e);
    if (canvas) canvas.addEventListener("pointermove", handler);
    return () => canvas && canvas.removeEventListener("pointermove", handler);
  }, []);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        // clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // fit image into canvas preserving aspect ratio
        const ratio = Math.min(
          canvas.width / img.width,
          canvas.height / img.height,
        );
        const w = img.width * ratio;
        const h = img.height * ratio;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;
        ctx.drawImage(img, x, y, w, h);
        onChange(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const f = files[0];
        if (f.type.startsWith("image/")) handleFile(f);
      }
    };
    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(true);
    };
    const onDragLeave = () => setDragOver(false);

    const el = canvasRef.current?.parentElement;
    if (el) {
      el.addEventListener("drop", onDrop);
      el.addEventListener("dragover", onDragOver);
      el.addEventListener("dragleave", onDragLeave);
    }
    return () => {
      if (el) {
        el.removeEventListener("drop", onDrop);
        el.removeEventListener("dragover", onDragOver);
        el.removeEventListener("dragleave", onDragLeave);
      }
    };
  }, [canvasRef.current]);

  return (
    <div>
      <div
        className={cn(
          "border rounded-md w-[200px] h-[100px] bg-white relative overflow-hidden",
          dragOver ? "ring-2 ring-dashed ring-blue-400" : "",
        )}
        onClick={(e) => {
          // if user just finished drawing, prevent the click from opening upload
          if (justDrawnRef.current) {
            // consume the click
            e.stopPropagation();
            return;
          }
          fileInputRef.current?.click();
        }}
      >
        <canvas
          ref={canvasRef}
          width={200}
          height={100}
          className="w-[200px] h-[100px] touch-none"
          onPointerDown={start}
          onPointerUp={end}
          onPointerLeave={end}
          aria-label="Signature pad"
        />
        {(!value || value === "") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-gray-400 pointer-events-none">
            <div>Draw or upload signature</div>
            <div className="mt-1 text-[11px]">Click or drag an image here</div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files && e.target.files[0];
          if (f && f.type.startsWith("image/")) handleFile(f);
          e.currentTarget.value = "";
        }}
      />

      <div className="mt-2 flex gap-2 items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={clear}>
          Clear
        </Button>
        {value && (
          <a
            href={value}
            download="signature.png"
            className="text-sm text-blue-600 underline"
          >
            Download
          </a>
        )}
      </div>
    </div>
  );
}

// Checklist table
export function ChecklistTable<
  TRow extends {
    id: number;
    activity: string;
    answer: "yes" | "na" | "";
    remarks: string;
  },
>({
  name,
  items,
  headerBg = "#f0f9ff",
}: {
  name: string;
  items: TRow[];
  headerBg?: string;
}) {
  const { control, setValue, watch } = useFormContext();
  const rows: TRow[] = watch(name) || items;

  const completed = rows.filter((r) => r.answer !== "").length;
  const pct = Math.round((completed / rows.length) * 100);

  const toggle = (idx: number, val: "yes" | "na") => {
    const current = rows[idx];
    const next = {
      ...current,
      answer: current.answer === val ? "" : val,
    } as TRow;
    setValue(`${name}.${idx}` as any, next, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Checklist completion: {completed}/{rows.length}
        </p>
        <div
          className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden"
          aria-label="Checklist progress"
        >
          <div className="h-2 bg-blue-600" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-md">
          <thead style={{ background: headerBg }}>
            <tr className="text-left">
              <th className="p-2 border w-12">S/N</th>
              <th className="p-2 border">Activity</th>
              <th className="p-2 border w-24 text-center">Yes</th>
              <th className="p-2 border w-24 text-center">N/A</th>
              <th className="p-2 border w-64">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.id}
                className={cn(idx % 2 ? "bg-gray-50" : "bg-white")}
              >
                <td className="p-2 border align-top">{row.id}</td>
                <td className="p-2 border align-top text-sm text-gray-800">
                  {row.activity}
                </td>
                <td className="p-2 border align-top text-center">
                  <button
                    type="button"
                    aria-pressed={row.answer === "yes"}
                    onClick={() => toggle(idx, "yes")}
                    className={cn(
                      "mx-auto h-6 w-6 rounded-md border flex items-center justify-center",
                      row.answer === "yes"
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white",
                    )}
                  >
                    {row.answer === "yes" && <Check size={16} />}
                  </button>
                </td>
                <td className="p-2 border align-top text-center">
                  <button
                    type="button"
                    aria-pressed={row.answer === "na"}
                    onClick={() => toggle(idx, "na")}
                    className={cn(
                      "mx-auto h-6 w-6 rounded-md border flex items-center justify-center",
                      row.answer === "na"
                        ? "bg-gray-600 text-white border-gray-600"
                        : "bg-white",
                    )}
                  >
                    {row.answer === "na" && <Check size={16} />}
                  </button>
                </td>
                <td className="p-2 border align-top">
                  <Controller
                    control={control}
                    name={`${name}.${idx}.remarks` as any}
                    render={({ field }) => (
                      <input
                        aria-label={`Remarks for ${row.activity}`}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-2 focus:border-blue-600 focus:outline-none"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Stepper
export interface StepDef {
  id: string;
  name: string;
  desc: string;
}

export function ProgressStepper({
  steps,
  current,
  completedCount,
}: {
  steps: StepDef[];
  current: number;
  completedCount: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        {steps.map((s, i) => {
          const isActive = i === current;
          const isDone = i < completedCount;
          return (
            <div key={s.id} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                <div
                  className="flex-1 h-[2px]"
                  style={{
                    backgroundColor:
                      i === 0
                        ? "transparent"
                        : i <= completedCount
                          ? "#2563eb"
                          : "#d1d5db",
                  }}
                />
                <div
                  className={cn(
                    "mx-2 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
                    isActive
                      ? "bg-[#2563eb] text-white"
                      : isDone
                        ? "bg-[#059669] text-white"
                        : "bg-gray-300 text-gray-700",
                  )}
                  aria-current={isActive}
                >
                  {isDone ? <Check /> : i + 1}
                </div>
                <div
                  className="flex-1 h-[2px]"
                  style={{
                    backgroundColor: i < completedCount ? "#2563eb" : "#d1d5db",
                  }}
                />
              </div>
              <div className="mt-2 text-center">
                <div
                  className={cn(
                    "text-sm font-semibold",
                    isActive ? "text-[#2563eb]" : "text-gray-800",
                  )}
                >
                  {s.name}
                </div>
                <div className="text-xs text-gray-500 max-w-[140px]">
                  {s.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"
            style={{
              width: `${Math.round((completedCount / steps.length) * 100)}%`,
            }}
          />
        </div>
        <div className="text-right mt-1 text-sm font-semibold text-gray-700">
          {Math.round((completedCount / steps.length) * 100)}%
        </div>
      </div>
    </div>
  );
}

// Step container and actions
export function StepSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function StepActions({
  onBack,
  onSave,
  onNext,
  nextLabel = "Next Step",
  disableNext,
  isFirst,
  isLast,
  onPreview,
  previewLabel = "Preview",
}: {
  onBack: () => void;
  onSave: () => void;
  onNext: () => void;
  nextLabel?: string;
  disableNext?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onPreview?: () => void;
  previewLabel?: string;
}) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={!!isFirst}
      >
        <ChevronLeft className="mr-1" /> Back
      </Button>
      <div className="flex items-center gap-2">
        <Button type="button" variant="secondary" onClick={onSave}>
          <Save className="mr-1" /> Save Draft
        </Button>
        {onPreview && (
          <Button type="button" variant="outline" onClick={onPreview}>
            {previewLabel}
          </Button>
        )}
        <Button type="button" onClick={onNext} disabled={disableNext}>
          {nextLabel} <ChevronRight className="ml-1" />
        </Button>
      </div>
    </div>
  );
}

export function HTPermitHeader() {
  const { register } = useFormContext<PermitFormData>();
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/placeholder.svg"
            alt="AM/NS INDIA logo"
            className="h-[60px] w-auto"
          />
        </div>
        <div className="text-center">
          <div className="font-bold text-gray-900">
            ArcelorMittal Nippon Steel India Limited
          </div>
          <div className="text-gray-600">HAZIRA</div>
          <div className="mt-1 text-[20px] font-bold text-gray-900">
            ADDITIONAL WORK PERMIT FOR HIGH TENSION LINE/Equipment
          </div>
        </div>
        <div className="flex flex-col gap-2 w-[240px]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate No.
            </label>
            <input
              {...register("certificateNo")}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-2 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permit No.
            </label>
            <input
              {...register("permitNo")}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-2 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Wizard
// 1. Fix StepPermitDetailsHT function - add missing variables and state management
function StepPermitDetailsHT() {
  const { getValues } = useFormContext<PermitFormData>();
  const permitId = getValues().permitId;

  const storageKey = `ht-permit-details-${permitId}`;
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw
        ? JSON.parse(raw)
        : {
            permitRequester: "",
            permitApprover1: "",
            permitApprover2: "",
            safetyManager: "",
            permitIssueDate: "",
            expectedReturnDate: "",
            requesterRequireUrgent: false,
            requesterSafetyManagerApproval: false,
            requesterPlannedShutdown: false,
            requesterPlannedShutdownDate: "",
            requesterCustomComments: [] as Array<
              string | { text: string; checked?: boolean }
            >,
            requesterSafetyRequireUrgent: false,
            requesterSafetySafetyManagerApproval: false,
            requesterSafetyPlannedShutdown: false,
            requesterSafetyPlannedShutdownDate: "",
            requesterSafetyCustomComments: [] as Array<
              string | { text: string; checked?: boolean }
            >,
          };
    } catch {
      return {
        permitRequester: "",
        permitApprover1: "",
        permitApprover2: "",
        safetyManager: "",
        permitIssueDate: "",
        expectedReturnDate: "",
        requesterRequireUrgent: false,
        requesterSafetyManagerApproval: false,
        requesterPlannedShutdown: false,
        requesterPlannedShutdownDate: "",
        requesterCustomComments: [] as Array<
          string | { text: string; checked?: boolean }
        >,
        requesterSafetyRequireUrgent: false,
        requesterSafetySafetyManagerApproval: false,
        requesterSafetyPlannedShutdown: false,
        requesterSafetyPlannedShutdownDate: "",
        requesterSafetyCustomComments: [] as Array<
          string | { text: string; checked?: boolean }
        >,
      };
    }
  });

  // Add missing state variables
  const [newRequesterComment, setNewRequesterComment] = useState("");
  const [newRequesterSafetyComment, setNewRequesterSafetyComment] =
    useState("");

  // Fix the form reference - should use state instead of undefined form
  const form = state;

  const update = (patch: any) => setState((s: any) => ({ ...s, ...patch }));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}
  }, [state, storageKey]);

  // Persist requester comments (for Approver view across forms)
  useEffect(() => {
    try {
      const payload = {
        requesterRequireUrgent: !!form.requesterRequireUrgent,
        requesterSafetyManagerApproval: !!form.requesterSafetyManagerApproval,
        requesterPlannedShutdown: !!form.requesterPlannedShutdown,
        requesterPlannedShutdownDate: form.requesterPlannedShutdownDate || "",
        requesterCustomComments: form.requesterCustomComments || [],
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "dps_requester_comments_ht",
          JSON.stringify(payload),
        );
      }
    } catch {}
  }, [
    form.requesterRequireUrgent,
    form.requesterSafetyManagerApproval,
    form.requesterPlannedShutdown,
    form.requesterPlannedShutdownDate,
    form.requesterCustomComments,
  ]);

  // Persist requester Safety Officer comments — HT Permit only
  useEffect(() => {
    try {
      const payload = {
        requesterSafetyRequireUrgent: !!form.requesterSafetyRequireUrgent,
        requesterSafetySafetyManagerApproval:
          !!form.requesterSafetySafetyManagerApproval,
        requesterSafetyPlannedShutdown: !!form.requesterSafetyPlannedShutdown,
        requesterSafetyPlannedShutdownDate:
          form.requesterSafetyPlannedShutdownDate || "",
        requesterSafetyCustomComments: form.requesterSafetyCustomComments || [],
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "dps_requester_safety_comments_ht",
          JSON.stringify(payload),
        );
      }
    } catch {}
  }, [
    form.requesterSafetyRequireUrgent,
    form.requesterSafetySafetyManagerApproval,
    form.requesterSafetyPlannedShutdown,
    form.requesterSafetyPlannedShutdownDate,
    form.requesterSafetyCustomComments,
  ]);

  return (
    <StepSection title="Details of such permit">
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-md">
            Details of such permit
          </div>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Permit Requester</div>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    placeholder="Search user..."
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Permit Approver 1</div>
                <input
                  aria-label="Permit Approver 1"
                  value={form.permitApprover1 || ""}
                  onChange={(e) => update({ permitApprover1: e.target.value })}
                  className="w-full mt-1 rounded border px-3 py-2 text-sm"
                  placeholder="Approver name or role"
                />
              </div>

              <div>
                <div className="text-xs text-gray-500">Permit Approver 2</div>
                <input
                  aria-label="Permit Approver 2"
                  value={form.permitApprover2 || ""}
                  onChange={(e) => update({ permitApprover2: e.target.value })}
                  className="w-full mt-1 rounded border px-3 py-2 text-sm"
                  placeholder="Approver name or role"
                />
              </div>

              <div>
                <div className="text-xs text-gray-500">Safety Manager</div>
                <input
                  aria-label="Safety Manager"
                  value={form.safetyManager || ""}
                  onChange={(e) => update({ safetyManager: e.target.value })}
                  className="w-full mt-1 rounded border px-3 py-2 text-sm"
                  placeholder="Safety Manager name/department"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">
                  Permit Issue Date
                </label>
                <input
                  type="date"
                  value={form.permitIssueDate || ""}
                  onChange={(e) => update({ permitIssueDate: e.target.value })}
                  className="w-full mt-1 rounded border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">
                  Expected Return Date
                </label>
                <input
                  type="date"
                  value={form.expectedReturnDate || ""}
                  onChange={(e) =>
                    update({ expectedReturnDate: e.target.value })
                  }
                  className="w-full mt-1 rounded border px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Read-only comments sections - MOVED TO TOP */}
            {/* Approver read-only comments (shown for requester) */}
            {(() => {
              try {
                const raw =
                  typeof window !== "undefined"
                    ? localStorage.getItem("dps_approver_comments_ht")
                    : null;
                const aData = raw ? JSON.parse(raw) : null;
                const hasAny = !!(
                  aData &&
                  (aData.approverRequireUrgent ||
                    aData.approverSafetyManagerApproval ||
                    aData.approverPlannedShutdown ||
                    (aData.approverCustomComments || []).length > 0)
                );
                return (
                  <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                    <div className="text-md font-medium">
                      Comments from Approver:
                    </div>
                    <div className="mt-2 space-y-1 text-sm">
                      {hasAny ? (
                        <>
                          {aData?.approverRequireUrgent && (
                            <div>Require on urgent basis</div>
                          )}
                          {aData?.approverSafetyManagerApproval && (
                            <div>Safety Manager approval required</div>
                          )}
                          {(aData?.approverPlannedShutdown ||
                            aData?.approverPlannedShutdownDate) && (
                            <div>
                              Planned shutdown on:{" "}
                              {aData?.approverPlannedShutdownDate || ""}
                            </div>
                          )}
                          {(aData?.approverCustomComments || []).map(
                            (it: any, i: number) => (
                              <div key={i}>
                                - {typeof it === "string" ? it : it.text}
                              </div>
                            ),
                          )}
                        </>
                      ) : (
                        <div className="text-gray-500">
                          No comments from approver yet
                        </div>
                      )}
                    </div>
                  </div>
                );
              } catch (e) {
                return (
                  <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                    <div className="text-md font-medium">
                      Comments from Approver:
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      No comments from approver yet
                    </div>
                  </div>
                );
              }
            })()}

            {/* Safety Officer comments (read-only) - for requester view */}
            {(() => {
              try {
                const raw =
                  typeof window !== "undefined"
                    ? localStorage.getItem(
                        "dps_safety_to_requester_comments_ht",
                      )
                    : null;
                const sData = raw ? JSON.parse(raw) : null;
                const sHasAny = !!(
                  sData &&
                  (sData.safetyToRequesterRequireUrgent ||
                    sData.safetyToRequesterSafetyManagerApproval ||
                    sData.safetyToRequesterPlannedShutdown ||
                    (sData.safetyToRequesterCustomComments || []).length > 0)
                );
                return (
                  <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                    <div className="text-md font-medium">
                      Comments from Safety Officer:
                    </div>
                    <div className="mt-2 space-y-1 text-sm">
                      {sHasAny ? (
                        <>
                          {sData?.safetyToRequesterRequireUrgent && (
                            <div>Require on urgent basis</div>
                          )}
                          {sData?.safetyToRequesterSafetyManagerApproval && (
                            <div>Safety Manager approval required</div>
                          )}
                          {(sData?.safetyToRequesterPlannedShutdown ||
                            sData?.safetyToRequesterPlannedShutdownDate) && (
                            <div>
                              Planned shutdown on:{" "}
                              {sData?.safetyToRequesterPlannedShutdownDate ||
                                ""}
                            </div>
                          )}
                          {(sData?.safetyToRequesterCustomComments || []).map(
                            (it: any, i: number) => (
                              <div key={i}>
                                - {typeof it === "string" ? it : it.text}
                              </div>
                            ),
                          )}
                        </>
                      ) : (
                        <div className="text-gray-500">
                          No comments from safety officer yet
                        </div>
                      )}
                    </div>
                  </div>
                );
              } catch (e) {
                return (
                  <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                    <div className="text-md font-medium">
                      Comments from Safety Officer:
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      No comments from safety officer yet
                    </div>
                  </div>
                );
              }
            })()}

            {/* Editable comments sections - MOVED TO BOTTOM */}
            <div className="mt-4 bg-yellow-50 p-3 rounded-md">
              <div className="text-md font-medium">Comments for Approver:</div>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={!!form.requesterRequireUrgent}
                  onChange={(e) =>
                    update({ requesterRequireUrgent: e.target.checked })
                  }
                />
                Require on urgent basis
              </label>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={!!form.requesterSafetyManagerApproval}
                  onChange={(e) =>
                    update({
                      requesterSafetyManagerApproval: e.target.checked,
                    })
                  }
                />
                Safety Manager approval required
              </label>
              <div className="mt-2 text-md flex items-center gap-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!form.requesterPlannedShutdown}
                    onChange={(e) =>
                      update({
                        requesterPlannedShutdown: e.target.checked,
                      })
                    }
                  />
                  <span>Planned shutdown on:</span>
                </label>
                <input
                  type="date"
                  className="rounded border px-2 py-1 text-sm"
                  value={form.requesterPlannedShutdownDate || ""}
                  onChange={(e) =>
                    update({
                      requesterPlannedShutdownDate: e.target.value,
                    })
                  }
                />
              </div>

              {/* Custom comments section */}
              <div className="mt-3">
                <div className="mt-2 space-y-1">
                  {(form.requesterCustomComments || []).map(
                    (item: any, idx: number) => {
                      const text = typeof item === "string" ? item : item.text;
                      const checked =
                        typeof item === "string" ? false : !!item.checked;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 w-full"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const prev = form.requesterCustomComments || [];
                                const next = prev.map((it: any, i: number) => {
                                  if (i !== idx) return it;
                                  if (typeof it === "string")
                                    return {
                                      text: it,
                                      checked: e.target.checked,
                                    };
                                  return {
                                    ...it,
                                    checked: e.target.checked,
                                  };
                                });
                                update({ requesterCustomComments: next });
                              }}
                            />
                            <span className="text-sm">{text}</span>
                          </div>
                          <div>
                            <button
                              type="button"
                              aria-label={`Delete comment ${idx + 1}`}
                              onClick={() => {
                                const prev = form.requesterCustomComments || [];
                                const next = prev.filter(
                                  (_: any, i: number) => i !== idx,
                                );
                                update({ requesterCustomComments: next });
                              }}
                              className="text-xs text-red-600 hover:underline px-2 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>

                <p className="text-xs font-medium mt-2">Add comment</p>
                <div className="flex gap-2 mt-2">
                  <input
                    placeholder="Add comment"
                    className="flex-1 rounded border px-3 py-2 text-sm"
                    value={newRequesterComment}
                    onChange={(e) => setNewRequesterComment(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const v = newRequesterComment.trim();
                      if (!v) return;
                      const prev = form.requesterCustomComments || [];
                      update({
                        requesterCustomComments: [
                          ...prev,
                          { text: v, checked: false },
                        ],
                      });
                      setNewRequesterComment("");
                    }}
                    className="px-3 py-1 rounded bg-white border text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Comments for Safety Officer */}
            <div className="mt-4 bg-yellow-50 p-3 rounded-md">
              <div className="text-md font-medium">
                Comments for Safety Officer:
              </div>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={!!form.requesterSafetyRequireUrgent}
                  onChange={(e) =>
                    update({
                      requesterSafetyRequireUrgent: e.target.checked,
                    })
                  }
                />
                Require on urgent basis
              </label>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={!!form.requesterSafetySafetyManagerApproval}
                  onChange={(e) =>
                    update({
                      requesterSafetySafetyManagerApproval: e.target.checked,
                    })
                  }
                />
                Approver approval required
              </label>
              <div className="mt-2 text-md flex items-center gap-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!form.requesterSafetyPlannedShutdown}
                    onChange={(e) =>
                      update({
                        requesterSafetyPlannedShutdown: e.target.checked,
                      })
                    }
                  />
                  <span>Planned shutdown on:</span>
                </label>
                <input
                  type="date"
                  className="rounded border px-2 py-1 text-sm"
                  value={form.requesterSafetyPlannedShutdownDate || ""}
                  onChange={(e) =>
                    update({
                      requesterSafetyPlannedShutdownDate: e.target.value,
                    })
                  }
                />
              </div>

              {/* Safety custom comments */}
              <div className="mt-3">
                <div className="mt-2 space-y-1">
                  {(form.requesterSafetyCustomComments || []).map(
                    (item: any, idx: number) => {
                      const text = typeof item === "string" ? item : item.text;
                      const checked =
                        typeof item === "string" ? false : !!item.checked;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 w-full"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const prev =
                                  form.requesterSafetyCustomComments || [];
                                const next = prev.map((it: any, i: number) => {
                                  if (i !== idx) return it;
                                  if (typeof it === "string")
                                    return {
                                      text: it,
                                      checked: e.target.checked,
                                    };
                                  return {
                                    ...it,
                                    checked: e.target.checked,
                                  };
                                });
                                update({
                                  requesterSafetyCustomComments: next,
                                });
                              }}
                            />
                            <span className="text-sm">{text}</span>
                          </div>
                          <div>
                            <button
                              type="button"
                              aria-label={`Delete comment ${idx + 1}`}
                              onClick={() => {
                                const prev =
                                  form.requesterSafetyCustomComments || [];
                                const next = prev.filter(
                                  (_: any, i: number) => i !== idx,
                                );
                                update({
                                  requesterSafetyCustomComments: next,
                                });
                              }}
                              className="text-xs text-red-600 hover:underline px-2 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>

                <p className="text-xs font-medium mt-2">Add comment</p>
                <div className="flex gap-2 mt-2">
                  <input
                    placeholder="Add comment"
                    className="flex-1 rounded border px-3 py-2 text-sm"
                    value={newRequesterSafetyComment}
                    onChange={(e) =>
                      setNewRequesterSafetyComment(e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const v = newRequesterSafetyComment.trim();
                      if (!v) return;
                      const prev = form.requesterSafetyCustomComments || [];
                      update({
                        requesterSafetyCustomComments: [
                          ...prev,
                          { text: v, checked: false },
                        ],
                      });
                      setNewRequesterSafetyComment("");
                    }}
                    className="px-3 py-1 rounded bg-white border text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StepSection>
  );
}

export function FormWizard({
  initial,
  onSaveDraft,
  onSubmit,
  renderHeader,
  onPreviewRequest, // Add this line
}: {
  initial: PermitFormData;
  onSaveDraft: (data: PermitFormData) => void;
  onSubmit: (data: PermitFormData) => void;
  renderHeader?: () => React.ReactNode;
  onPreviewRequest?: () => void; // Add this line
}) {
  const methods = useForm<PermitFormData>({
    resolver: zodResolver(rootSchema) as any,
    defaultValues: initial,
    mode: "onBlur",
  });
  const [current, setCurrent] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const steps: StepDef[] = [
    {
      id: "basic",
      name: "Basic Details",
      desc: "Permit information and work description",
    },
    {
      id: "workAuth",
      name: "Work Authorization",
      desc: "Operation-in-charge authorization",
    },
    {
      id: "deEnergize",
      name: "De-energizing Authorization",
      desc: "Electrical safety checklist",
    },
    {
      id: "permitToWork",
      name: "Permit to Work",
      desc: "Final work authorization",
    },
    {
      id: "preExecution",
      name: "Pre-execution Checkup",
      desc: "Safety verification before work",
    },
    {
      id: "jobCompletion",
      name: "Job Completion",
      desc: "Work completion certification",
    },
    {
      id: "reEnergizeInstruction",
      name: "Re-energizing Instruction",
      desc: "Power restoration instructions",
    },
    {
      id: "reEnergizeAuthorization",
      name: "Re-energizing Authorization",
      desc: "Final system restoration",
    },
    {
      id: "permitDetails",
      name: "Permit Details",
      desc: "Final review and submission",
    },
  ];

  const key = `ht-permit-${initial.permitId}`;

  // Role-based restriction: approver and safety officers should only see Permit Details
  const isRestricted = useMemo(() => {
    try {
      const role =
        typeof window !== "undefined" ? localStorage.getItem("dps_role") : null;
      return role === "approver" || role === "safety";
    } catch {
      return false;
    }
  }, []);

  const permitDetailsIndex = useMemo(
    () => steps.findIndex((s) => s.id === "permitDetails"),
    [],
  );

  // When restricted, force the current step to Permit Details
  useEffect(() => {
    if (
      isRestricted &&
      current !== permitDetailsIndex &&
      permitDetailsIndex >= 0
    ) {
      setCurrent(permitDetailsIndex);
    }
  }, [isRestricted, permitDetailsIndex, current]);

  // Steps to render in the UI
  const uiSteps =
    isRestricted && permitDetailsIndex >= 0
      ? [steps[permitDetailsIndex]]
      : steps;
  const uiCurrent = isRestricted ? 0 : current;

  // Explicit role for conditional UI (e.g., hide progress for approver)
  const role = useMemo(() => {
    try {
      return typeof window !== "undefined"
        ? localStorage.getItem("dps_role")
        : null;
    } catch {
      return null;
    }
  }, []);

  // Auto-save every 30s
  useEffect(() => {
    const id = setInterval(() => {
      const data = methods.getValues();
      onSaveDraft({
        ...data,
        updatedAt: new Date().toISOString(),
        status: "draft",
      });
    }, 30000);
    return () => clearInterval(id);
  }, [methods, onSaveDraft]);

  // Persist to localStorage on change
  useEffect(() => {
    const sub = methods.watch((val) => {
      localStorage.setItem(key, JSON.stringify({ data: val }));
    });
    return () => sub.unsubscribe();
  }, [methods, key]);

  // watch all form values so progress updates reactively as fields change
  const formValues = methods.watch();

  const completedCount = useMemo(() => {
    // simple heuristic: steps with required minimal fields valid
    let count = 0;
    const data = formValues as PermitFormData;
    try {
      basicDetailsSchema.parse(data.stepData.basic);
      count++;
    } catch {}
    try {
      workAuthorizationSchema.parse(data.stepData.workAuth);
      count++;
    } catch {}
    try {
      deEnergizeSchema.parse(data.stepData.deEnergize);
      count++;
    } catch {}
    try {
      permitToWorkSchema.parse(data.stepData.permitToWork);
      count++;
    } catch {}
    try {
      preExecutionSchema.parse(data.stepData.preExecution);
      count++;
    } catch {}
    try {
      jobCompletionSchema.parse(data.stepData.jobCompletion);
      count++;
    } catch {}
    try {
      reEnergizeInstructionSchema.parse(data.stepData.reEnergizeInstruction);
      count++;
    } catch {}
    try {
      reEnergizeAuthorizationSchema.parse(
        data.stepData.reEnergizeAuthorization,
      );
      count++;
    } catch {}
    return count;
  }, [formValues]);

  const validateCurrent = async () => {
    const id = steps[current].id as keyof PermitFormData["stepData"];
    const path = `stepData.${id}` as const;
    return methods.trigger(path as any);
  };

  const next = async () => {
    if (current < steps.length - 1) setCurrent((c) => c + 1);
  };
  const back = () => setCurrent((c) => Math.max(0, c - 1));

  const save = () =>
    onSaveDraft({
      ...methods.getValues(),
      updatedAt: new Date().toISOString(),
      status: "draft",
    });

  const submit = methods.handleSubmit((data: PermitFormData) =>
    onSubmit({
      ...data,
      status: "submitted",
      updatedAt: new Date().toISOString(),
    }),
  );

  // close preview on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowPreview(false);
    };
    if (showPreview) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPreview]);

  // Print the preview in a new window that contains the full permit with page-breaks
  const handleModalPrint = () => {
    try {
      const el = document.querySelector(
        ".permit-print-area",
      ) as HTMLElement | null;
      if (!el) {
        window.print();
        return;
      }
      const w = window.open("", "_blank");
      if (!w) {
        window.print();
        return;
      }
      const styles = Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style'),
      )
        .map((s) => s.outerHTML)
        .join("");
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Permit Print</title>${styles}<style>@page{size:A4;margin:10mm;} body{background:white;color:black;-webkit-print-color-adjust:exact;print-color-adjust:exact;} .permit-print-area{width:210mm;transform:none;transform-origin:top left;} @media print{ .permit-print-area{width:210mm;transform:none;transform-origin:top left;} }</style></head><body>${el.outerHTML}</body></html>`;
      w.document.open();
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => {
        try {
          w.print();
        } catch (e) {
          /* ignore */
        }
      }, 500);
    } catch (e) {
      try {
        window.print();
      } catch {}
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        {!isRestricted && (
          <ModernPagination
            steps={uiSteps.map((s, i) => ({
              title: s.name,
              description: s.desc,
              // Match GasPermit behavior: all steps before the current are marked completed (green)
              completed: i < uiCurrent,
            }))}
            currentStep={uiCurrent}
            onStepChange={isRestricted ? () => {} : setCurrent}
            showProgress={true}
            allowClickNavigation={true}
            variant="numbered"
          />
        )}
        {renderHeader && (
          <div className="border-b bg-white -mx-4 sm:mx-0 sm:rounded-none">
            {renderHeader()}
          </div>
        )}
        {!isRestricted && steps[current].id === "basic" && <StepBasic />}
        {!isRestricted && steps[current].id === "workAuth" && <StepWorkAuth />}
        {!isRestricted && steps[current].id === "deEnergize" && (
          <StepDeEnergize />
        )}
        {!isRestricted && steps[current].id === "permitToWork" && (
          <StepPermitToWork />
        )}
        {!isRestricted && steps[current].id === "preExecution" && (
          <StepPreExecution />
        )}
        {!isRestricted && steps[current].id === "jobCompletion" && (
          <StepJobCompletion />
        )}
        {!isRestricted && steps[current].id === "reEnergizeInstruction" && (
          <StepReEnergizeInstruction />
        )}
        {!isRestricted && steps[current].id === "reEnergizeAuthorization" && (
          <StepReEnergizeAuthorization />
        )}
        {(isRestricted || steps[current].id === "permitDetails") &&
          (() => {
            // For restricted roles (approver/safety), direct users to their dedicated pages
            try {
              const role =
                typeof window !== "undefined"
                  ? localStorage.getItem("dps_role")
                  : null;
              if (role === "approver") {
                // Render the approver permit details section inline
                return <ApproverHTPermitDetailsSection />;
              }
              if (role === "safety") {
                // Render the permit details inline for Safety Officer as requested
                return <SafetyHTPermitDetailsSection />;
              }
            } catch {}
            // Default (requester) shows the embedded section
            return <StepPermitDetailsHT />;
          })()}

        <StepActions
          onBack={isRestricted ? () => {} : back}
          onSave={save}
          onNext={isRestricted || current === steps.length - 1 ? submit : next}
          nextLabel={
            isRestricted || current === steps.length - 1
              ? "Submit Permit"
              : "Next Step"
          }
          disableNext={false}
          isFirst={isRestricted ? true : current === 0}
          isLast={isRestricted ? true : current === steps.length - 1}
          onPreview={onPreviewRequest || (() => setShowPreview(true))}
          previewLabel="Preview"
        />

        {showPreview && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowPreview(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
            <div
              className="relative z-10 bg-white rounded-md shadow-xl w-[95vw] max-w-[1100px] max-h-[90vh] overflow-hidden"
              style={{ padding: 16 }}
            >
              <div
                className="overflow-auto bg-white"
                style={{ maxHeight: "calc(90vh - 32px)", padding: 12 }}
              >
                <div
                  style={{
                    transform: "scale(0.92)",
                    transformOrigin: "top center",
                  }}
                >
                  <HTPermitPreview data={methods.getValues()} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </FormProvider>
  );
}

// Step implementations
function StepBasic() {
  return (
    <StepSection
      title="Part - A: REQUEST TO WORK ON HT LINE"
      subtitle="(To be filled-up by Requisitioner / Executor) For 1000 V and above"
    >
      <InputField
        name="stepData.basic.powerLine"
        label="Power Line to be Isolated"
        required
      />
      <InputField
        name="stepData.basic.affectedPlant"
        label="Plant will be affected"
        required
      />
      <TextArea
        name="stepData.basic.jobDescription"
        label="Description of the Job"
        required
        rows={4}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          name="stepData.basic.crossRefPermitNo"
          label="Cross Ref. Permit No."
          required
        />
        <InputField
          name="stepData.basic.deptLocation"
          label="Dept. & Location"
          required
        />
      </div>
      <div>
        <h3 className="text-md font-semibold text-gray-900 mb-2">Validity</h3>
        <div className="flex flex-wrap items-end gap-3">
          <DateTimePicker
            nameDate="stepData.basic.validity.fromDate"
            nameTime="stepData.basic.validity.fromTime"
            label="From"
            required
          />
          <span className="text-sm text-gray-500">to</span>
          <DateTimePicker
            nameDate="stepData.basic.validity.toDate"
            nameTime="stepData.basic.validity.toTime"
            label="To"
            required
          />
        </div>
      </div>
    </StepSection>
  );
}

function SignatureRow({
  baseName,
  rolePreset,
}: {
  baseName: string;
  rolePreset: string;
}) {
  const { control } = useFormContext();
  return (
    <tr>
      <td className="p-2 border">
        <Controller
          name={`${baseName}.role` as any}
          control={control}
          render={({ field }) => (
            <div className="text-sm text-gray-800">
              <p>{field.value || rolePreset}</p>
            </div>
          )}
        />
      </td>
      <td className="p-2 border">
        <Controller
          name={`${baseName}.name` as any}
          control={control}
          render={({ field }) => (
            <input
              className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
              value={field.value || ""}
              onChange={field.onChange}
            />
          )}
        />
      </td>
      <td className="p-2 border">
        <Controller
          name={`${baseName}.signatureImage` as any}
          control={control}
          render={({ field }) => (
            <SignaturePad value={field.value} onChange={field.onChange} />
          )}
        />
      </td>
      <td className="p-2 border">
        <Controller
          name={`${baseName}.contactNo` as any}
          control={control}
          render={({ field }) => (
            <input
              className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
              value={field.value || ""}
              onChange={field.onChange}
            />
          )}
        />
      </td>
      <td className="p-2 border">
        <Controller
          name={`${baseName}.date` as any}
          control={control}
          render={({ field }) => (
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
              value={field.value || ""}
              onChange={field.onChange}
            />
          )}
        />
      </td>
      <td className="p-2 border">
        <Controller
          name={`${baseName}.time` as any}
          control={control}
          render={({ field }) => (
            <input
              type="time"
              className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
              value={field.value || ""}
              onChange={field.onChange}
            />
          )}
        />
      </td>
    </tr>
  );
}

function StepWorkAuth() {
  const { control } = useFormContext();
  return (
    <StepSection
      title="Part - B: WORK STARTING AUTHORISATION FOR HT LINE"
      subtitle="(To be filled-up by Operation-In-Charge of working area)"
    >
      <label className="inline-flex items-center gap-2">
        <Controller
          name="stepData.workAuth.confirmation"
          control={control}
          render={({ field }) => (
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />
        <span className="text-sm text-gray-800">
          The above mentioned equipment / related power cable may be
          de-energized as requested.
        </span>
      </label>
      <div className="overflow-x-auto mt-2">
        <table className="min-w-full border rounded-md">
          <thead className="bg-[#f0f9ff]">
            <tr className="text-left">
              <th className="p-2 border">Authorised Person</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Signature</th>
              <th className="p-2 border">Contact No.</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Time</th>
            </tr>
          </thead>
          <tbody>
            <SignatureRow
              baseName="stepData.workAuth.rows.0"
              rolePreset="Permit Requisitioner"
            />
            <SignatureRow
              baseName="stepData.workAuth.rows.1"
              rolePreset="Permit Issuing Authority"
            />
          </tbody>
        </table>
      </div>
    </StepSection>
  );
}

function StepDeEnergize() {
  const items: DeEnergizeChecklistItem[] = [
    {
      id: 1,
      activity: "All back feeding circuits checked & isolated",
      answer: "",
      remarks: "",
    },
    { id: 2, activity: "Control supply switched off", answer: "", remarks: "" },
    {
      id: 3,
      activity: "Breaker/MCC switched off & front lid opened",
      answer: "",
      remarks: "",
    },
    {
      id: 4,
      activity: "Breaker racked out & control plug removed",
      answer: "",
      remarks: "",
    },
    {
      id: 5,
      activity: "All fuses pulled out and kept at proper place",
      answer: "",
      remarks: "",
    },
    {
      id: 6,
      activity: "Back cover / lid of Breaker Panel opened",
      answer: "",
      remarks: "",
    },
    {
      id: 7,
      activity: "Breaker / MCC internals visually checked",
      answer: "",
      remarks: "",
    },
    {
      id: 8,
      activity:
        "No live voltage observed on Voltage Test using Voltage detector",
      answer: "",
      remarks: "",
    },
    {
      id: 9,
      activity: "Line discharged through Earth Rod",
      answer: "",
      remarks: "",
    },
    {
      id: 10,
      activity: "Temporary earthing provided",
      answer: "",
      remarks: "",
    },
    {
      id: 11,
      activity: "Breaker/ MCC backfront lids [covers] closed",
      answer: "",
      remarks: "",
    },
    {
      id: 12,
      activity: "LOTO performed on Breaker/MCC Module",
      answer: "",
      remarks: "",
    },
  ];
  const { control } = useFormContext();
  return (
    <StepSection
      title="Part - C: DE-ENERGISING AUTHORISATION FOR HT LINE"
      subtitle="(To be filled by Authorised Person of Electrical Department)"
    >
      <ChecklistTable name="stepData.deEnergize.checklist" items={items} />
      <div className="mt-4">
        <label className="inline-flex items-center gap-2">
          <Controller
            name="stepData.deEnergize.confirmation"
            control={control}
            render={({ field }) => (
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />
          <span className="text-sm text-gray-800">
            The above mentioned power cable [Feeder] / equipment is de-energised
            after performing above Checks / Activities
          </span>
        </label>
      </div>
      <div className="mt-4">
        <h3 className="text-md font-semibold text-gray-900 mb-2">
          Electrical Department Authorization
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-md">
            <thead className="bg-[#f0f9ff]">
              <tr className="text-left">
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Signature</th>
                <th className="p-2 border">Contact No.</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Time</th>
              </tr>
            </thead>
            <tbody>
              <SignatureRow
                baseName="stepData.deEnergize.authorization.0"
                rolePreset="Electrical Department"
              />
            </tbody>
          </table>
        </div>
      </div>
    </StepSection>
  );
}

function StepPermitToWork() {
  const { control } = useFormContext();
  return (
    <StepSection
      title="Part - D: PERMIT TO WORK AUTHORISATION"
      subtitle="(To be filled by Permit Issuing Authorities)"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-800">
          <span>Permit is hereby issued to Mr.</span>
          <InputField
            name="stepData.permitToWork.workerName"
            label="Worker Name"
          />
          <span>for working on</span>
          <Controller
            name="stepData.permitToWork.equipmentType"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || ""}
                onValueChange={(v) => field.onChange(v)}
              >
                <SelectTrigger className="h-10 w-56 text-sm">
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Breaker">Breaker</SelectItem>
                  <SelectItem value="MCC Module">MCC Module</SelectItem>
                  <SelectItem value="Power Cable">Power Cable</SelectItem>
                  <SelectItem value="Feeder">Feeder</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium">From</span>
          <DateTimePicker
            hideLabel
            className="flex-row items-center"
            nameDate="stepData.permitToWork.timeRange.fromDate"
            nameTime="stepData.permitToWork.timeRange.fromTime"
          />
          <span className="mx-2 font-medium">To</span>
          <DateTimePicker
            hideLabel
            className="flex-row items-center"
            nameDate="stepData.permitToWork.timeRange.toDate"
            nameTime="stepData.permitToWork.timeRange.toTime"
          />
        </div>
        <p className="text-sm text-gray-700">
          Cable feeder / system and ensuring safe working condition after
          performing Lock out and under LOTO operation on Breaker / Switch. This
          permit is valid till the return of job completion AUTHORISATION.
        </p>
        <label className="inline-flex items-center gap-2">
          <Controller
            name="stepData.permitToWork.safetyConfirmed"
            control={control}
            render={({ field }) => (
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />
          <span className="text-sm">
            I confirm that safety procedures have been followed.
          </span>
        </label>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full border rounded-md">
            <thead className="bg-[#f0f9ff]">
              <tr className="text-left">
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Signature</th>
                <th className="p-2 border">Contact No.</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Time</th>
              </tr>
            </thead>
            <tbody>
              <SignatureRow
                baseName="stepData.permitToWork.authorization.0"
                rolePreset="Permit Issuing Authority"
              />
            </tbody>
          </table>
        </div>
      </div>
    </StepSection>
  );
}

function StepPreExecution() {
  const items: PreExecutionChecklistItem[] = [
    {
      id: 1,
      activity: "Breaker is in racked out position",
      answer: "",
      remarks: "",
    },
    {
      id: 2,
      activity: "No live voltage observed on cable discharged by grounding",
      answer: "",
      remarks: "",
    },
    {
      id: 3,
      activity:
        "No line voltage observed on Voltage Test using Voltage detector",
      answer: "",
      remarks: "",
    },
    { id: 4, activity: "Local earthing provided", answer: "", remarks: "" },
    {
      id: 5,
      activity: "LOTO done on Breaker/ MCC Module",
      answer: "",
      remarks: "",
    },
  ];
  const { control } = useFormContext();
  return (
    <StepSection
      title="Part - E: PRE-EXECUTION CHECKUP OF ISOLATED SYSTEM"
      subtitle="(To be filled-up by Requisitioner / Executor)"
    >
      <ChecklistTable name="stepData.preExecution.checklist" items={items} />
      <label className="mt-3 inline-flex items-center gap-2">
        <Controller
          name="stepData.preExecution.confirmation"
          control={control}
          render={({ field }) => (
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />
        <span className="text-sm text-gray-800">
          Above checkup of the Isolated cable / equipment has been done before
          starting the work to ensure safe working condition.
        </span>
      </label>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full border rounded-md">
          <thead className="bg-[#f0f9ff]">
            <tr className="text-left">
              <th className="p-2 border">Authorised Person</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Signature</th>
              <th className="p-2 border">Contact No.</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Time</th>
            </tr>
          </thead>
          <tbody>
            <SignatureRow
              baseName="stepData.preExecution.authorization.1"
              rolePreset="Permit Requisitioner"
            />
          </tbody>
        </table>
      </div>
    </StepSection>
  );
}

function StepJobCompletion() {
  const { control } = useFormContext();
  return (
    <StepSection
      title="Part - F: JOB COMPLETION AUTHORISATION"
      subtitle="(To be filled-up by Requisitioner / Executor)"
    >
      <p className="text-sm text-gray-700">
        This is certify that the work detailed in Part-A has been completed /
        stopped due to urgent requirement. All tools unused material & manpower
        have been removed. Locally provided temporary safety ground has been
        removed. Locks & Tags is safe for charging.
      </p>
      <div className="mt-3 space-y-3">
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <Controller
              name="stepData.jobCompletion.status"
              control={control}
              render={({ field }) => (
                <input
                  type="radio"
                  name="jobStatus"
                  value="completed"
                  checked={field.value === "completed"}
                  onChange={() => field.onChange("completed")}
                />
              )}
            />
            Work Completed Successfully
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <Controller
              name="stepData.jobCompletion.status"
              control={control}
              render={({ field }) => (
                <input
                  type="radio"
                  name="jobStatus"
                  value="stopped"
                  checked={field.value === "stopped"}
                  onChange={() => field.onChange("stopped")}
                />
              )}
            />
            Work Stopped Due to Urgent Requirement
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              key: "toolsRemoved",
              label: "All tools and unused materials removed",
            },
            {
              key: "manpowerEvacuated",
              label: "All manpower evacuated from work area",
            },
            {
              key: "groundsRemoved",
              label: "Temporary safety grounds removed",
            },
            { key: "areaSafe", label: "Area confirmed safe for re-energizing" },
          ].map(({ key, label }) => (
            <label key={key} className="inline-flex items-center gap-2 text-sm">
              <Controller
                name={`stepData.jobCompletion.safetyChecks.${key}` as any}
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
              {label}
            </label>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-md">
            <thead className="bg-[#f0f9ff]">
              <tr className="text-left">
                <th className="p-2 border">
                  <p>Authorized Person</p>
                </th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Signature</th>
                <th className="p-2 border">Contact No.</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Time</th>
              </tr>
            </thead>
            <tbody>
              <SignatureRow
                baseName="stepData.jobCompletion.authorization.0"
                rolePreset="Requisitioner / Executor"
              />
            </tbody>
          </table>
        </div>
      </div>
    </StepSection>
  );
}

function StepReEnergizeInstruction() {
  const { control } = useFormContext();
  return (
    <StepSection
      title="Part - G: RE-ENERGISING INSTRUCTION FOR ISOLATED POWER LINE"
      subtitle="(To be filled by Permit Issuing Authorities)"
    >
      <p className="text-sm text-gray-700">
        Job completion authorisation has been received from the Requisitioner /
        Executor. No other job clearance has been issued on this power line.
        Affected plant is in agreement with the proposal.
      </p>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          {
            key: "authorizationReceived",
            label: "Job completion authorization received and verified",
          },
          {
            key: "noConflicts",
            label: "No conflicting permits or clearances exist",
          },
          {
            key: "personnelNotified",
            label: "All affected plant personnel notified and in agreement",
          },
          {
            key: "systemReady",
            label: "System ready for safe re-energization",
          },
        ].map(({ key, label }) => (
          <label key={key} className="inline-flex items-center gap-2 text-sm">
            <Controller
              name={
                `stepData.reEnergizeInstruction.confirmations.${key}` as any
              }
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            {label}
          </label>
        ))}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full border rounded-md">
          <thead className="bg-[#f0f9ff]">
            <tr className="text-left">
              <th className="p-2 border">
                <p>Authorized Person</p>
              </th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Signature</th>
              <th className="p-2 border">Contact No.</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Time</th>
            </tr>
          </thead>
          <tbody>
            <SignatureRow
              baseName="stepData.reEnergizeInstruction.authorization.0"
              rolePreset="Permit Issuing Authority"
            />
          </tbody>
        </table>
      </div>
    </StepSection>
  );
}

function StepReEnergizeAuthorization() {
  const items: ReEnergizeAuthorizationChecklistItem[] = [
    {
      id: 1,
      activity: "Damaged internals of Breaker/ MCC rectified",
      answer: "",
      remarks: "",
    },
    { id: 2, activity: "Temporary earthing removed", answer: "", remarks: "" },
    {
      id: 3,
      activity: "IR Value of Cable/Equipment Checked-found O.K.",
      answer: "",
      remarks: "",
    },
    {
      id: 4,
      activity: "Back lid / cover of Breaker boxed up",
      answer: "",
      remarks: "",
    },
    {
      id: 5,
      activity: "All Locks & Tags of Breaker removed",
      answer: "",
      remarks: "",
    },
    { id: 6, activity: "All fuses put back in place", answer: "", remarks: "" },
    {
      id: 7,
      activity: "Breaker control plug put back in place",
      answer: "",
      remarks: "",
    },
    {
      id: 8,
      activity: "Breaker checked in test position & found O.K.",
      answer: "",
      remarks: "",
    },
    { id: 9, activity: "Trip circuit found healthy", answer: "", remarks: "" },
    {
      id: 10,
      activity: "Breaker racked in to service position",
      answer: "",
      remarks: "",
    },
    { id: 11, activity: "Control supply switched on", answer: "", remarks: "" },
    {
      id: 12,
      activity: "Breaker / MCC Module front door closed",
      answer: "",
      remarks: "",
    },
    {
      id: 13,
      activity: "MCC [MCU Module] switched on",
      answer: "",
      remarks: "",
    },
    {
      id: 14,
      activity: "All cables are dressed properly",
      answer: "",
      remarks: "",
    },
  ];
  const { control } = useFormContext();
  return (
    <StepSection
      title="Part - H: RE-ENERGISING AUTHORISATION"
      subtitle="(To be filled by Authorised Person of Electrical Department)"
    >
      <ChecklistTable
        name="stepData.reEnergizeAuthorization.checklist"
        items={items}
      />
      <label className="mt-3 inline-flex items-center gap-2">
        <Controller
          name="stepData.reEnergizeAuthorization.finalConfirmation"
          control={control}
          render={({ field }) => (
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />
        <span className="text-sm text-gray-800">
          The work detailed in Part-A power cable [Feeder] is re-energised after
          performing above Checks / Activities
        </span>
      </label>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full border rounded-md">
          <thead className="bg-[#f0f9ff]">
            <tr className="text-left">
              <th className="p-2 border">
                <p>Authorized Person</p>
              </th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Signature</th>
              <th className="p-2 border">Contact No.</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Time</th>
            </tr>
          </thead>
          <tbody>
            <SignatureRow
              baseName="stepData.reEnergizeAuthorization.authorization.0"
              rolePreset="Electrical Department"
            />
          </tbody>
        </table>
      </div>
    </StepSection>
  );
}
