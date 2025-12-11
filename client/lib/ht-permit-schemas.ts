import { z } from "zod";

export const phoneRegex =
  /^(?:\+\d{1,3}[- ]?)?(?:\(\d{2,4}\)|\d{2,4})[- ]?\d{3,4}[- ]?\d{3,4}$/;

export const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // yyyy-MM-dd
export const timeRegex = /^\d{2}:\d{2}$/; // HH:mm

export const dateTimeRangeSchema = z
  .object({
    fromDate: z.string().regex(dateRegex, "Invalid date"),
    fromTime: z.string().regex(timeRegex, "Invalid time"),
    toDate: z.string().regex(dateRegex, "Invalid date"),
    toTime: z.string().regex(timeRegex, "Invalid time"),
  })
  .refine((v) => {
    const start = new Date(`${v.fromDate}T${v.fromTime}:00`);
    const end = new Date(`${v.toDate}T${v.toTime}:00`);
    return end.getTime() > start.getTime();
  }, "End must be after start");

export const signatureSchema = z.object({
  name: z.string().min(2, "Name required"),
  role: z.string().min(2, "Role required"),
  contactNo: z.string().regex(phoneRegex, "Invalid phone"),
  date: z.string().regex(dateRegex, "Invalid date"),
  time: z.string().regex(timeRegex, "Invalid time"),
  signatureImage: z.string().url().optional().or(z.literal("")),
});

export const basicDetailsSchema = z.object({
  powerLine: z.string().min(2, "Required"),
  affectedPlant: z.string().min(2, "Required"),
  jobDescription: z.string().min(5, "Required"),
  crossRefPermitNo: z.string().min(1, "Required"),
  deptLocation: z.string().min(2, "Required"),
  validity: dateTimeRangeSchema,
});

export const workAuthorizationSchema = z.object({
  rows: z
    .array(
      signatureSchema.extend({
        role: z.string().min(2),
      }),
    )
    .length(2),
  confirmation: z
    .boolean()
    .refine((v) => v === true, { message: "Confirmation required" }),
});

export const checklistRowSchema = z.object({
  id: z.number(),
  activity: z.string(),
  answer: z
    .enum(["yes", "na", ""])
    .refine((v) => v !== "", "Select Yes or N/A"),
  remarks: z.string().optional().default(""),
});

export const deEnergizeSchema = z.object({
  checklist: z.array(checklistRowSchema).length(12),
  confirmation: z
    .boolean()
    .refine((v) => v === true, { message: "Confirmation required" }),
  authorization: z.array(signatureSchema).min(1),
});

export const permitToWorkSchema = z.object({
  workerName: z.string().min(2, "Required"),
  equipmentType: z.string().min(2, "Required"),
  timeRange: dateTimeRangeSchema,
  safetyConfirmed: z
    .boolean()
    .refine((v) => v === true, { message: "Safety confirmation required" }),
  authorization: z.array(signatureSchema).min(1),
});

export const preExecutionSchema = z.object({
  checklist: z.array(checklistRowSchema).length(5),
  confirmation: z
    .boolean()
    .refine((v) => v === true, { message: "Confirmation required" }),
  authorization: z.array(signatureSchema).min(2),
});

export const jobCompletionSchema = z.object({
  status: z
    .enum(["completed", "stopped", ""])
    .refine((v) => v !== "", "Select status"),
  safetyChecks: z.object({
    toolsRemoved: z
      .boolean()
      .refine((v) => v === true, { message: "Required" }),
    manpowerEvacuated: z
      .boolean()
      .refine((v) => v === true, { message: "Required" }),
    groundsRemoved: z
      .boolean()
      .refine((v) => v === true, { message: "Required" }),
    areaSafe: z.boolean().refine((v) => v === true, { message: "Required" }),
  }),
  authorization: z.array(signatureSchema).min(1),
});

export const reEnergizeInstructionSchema = z.object({
  confirmations: z.object({
    authorizationReceived: z
      .boolean()
      .refine((v) => v === true, { message: "Required" }),
    noConflicts: z.boolean().refine((v) => v === true, { message: "Required" }),
    personnelNotified: z
      .boolean()
      .refine((v) => v === true, { message: "Required" }),
    systemReady: z.boolean().refine((v) => v === true, { message: "Required" }),
  }),
  authorization: z.array(signatureSchema).min(1),
});

export const reEnergizeAuthorizationSchema = z.object({
  checklist: z.array(checklistRowSchema).length(14),
  finalConfirmation: z
    .boolean()
    .refine((v) => v === true, { message: "Final confirmation required" }),
  authorization: z.array(signatureSchema).min(1),
});

export const rootSchema = z.object({
  permitId: z.string().min(1),
  certificateNo: z.string().min(1, "Required"),
  permitNo: z.string().min(1, "Required"),
  status: z.enum(["draft", "submitted", "approved"]).default("draft"),
  createdAt: z.string(),
  updatedAt: z.string(),
  stepData: z.object({
    basic: basicDetailsSchema,
    workAuth: workAuthorizationSchema,
    deEnergize: deEnergizeSchema,
    permitToWork: permitToWorkSchema,
    preExecution: preExecutionSchema,
    jobCompletion: jobCompletionSchema,
    reEnergizeInstruction: reEnergizeInstructionSchema,
    reEnergizeAuthorization: reEnergizeAuthorizationSchema,
  }),
});

export type RootSchema = typeof rootSchema;
