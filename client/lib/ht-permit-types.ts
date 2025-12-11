export type PersonRole =
  | "Permit Requisitioner"
  | "Permit Issuing Authority"
  | "Authorised Person"
  | "Electrical Operation"
  | "Electrical Department";

export interface SignatureData {
  name: string;
  role: PersonRole | string;
  contactNo: string;
  date: string; // ISO date string
  time: string; // HH:mm
  signatureImage?: string; // data URL
}

export interface DateTimeRange {
  fromDate: string; // yyyy-MM-dd
  fromTime: string; // HH:mm
  toDate: string; // yyyy-MM-dd
  toTime: string; // HH:mm
}

export interface BasicDetailsStep {
  powerLine: string;
  affectedPlant: string;
  jobDescription: string;
  crossRefPermitNo: string;
  deptLocation: string;
  validity: DateTimeRange;
}

export interface WorkAuthorizationRow extends SignatureData {}

export interface DeEnergizeChecklistItem {
  id: number;
  activity: string;
  answer: "yes" | "na" | "";
  remarks: string;
}

export interface DeEnergizeStep {
  checklist: DeEnergizeChecklistItem[];
  confirmation: boolean;
  authorization: SignatureData[]; // electrical department
}

export interface PermitToWorkStep {
  workerName: string;
  equipmentType: string;
  timeRange: DateTimeRange;
  safetyConfirmed: boolean;
  authorization: SignatureData[];
}

export interface PreExecutionChecklistItem {
  id: number;
  activity: string;
  answer: "yes" | "na" | "";
  remarks: string;
}

export interface PreExecutionStep {
  checklist: PreExecutionChecklistItem[];
  confirmation: boolean;
  authorization: SignatureData[]; // authorised person + requisitioner
}

export interface JobCompletionStep {
  status: "completed" | "stopped" | "";
  safetyChecks: {
    toolsRemoved: boolean;
    manpowerEvacuated: boolean;
    groundsRemoved: boolean;
    areaSafe: boolean;
  };
  authorization: SignatureData[];
}

export interface ReEnergizeInstructionStep {
  confirmations: {
    authorizationReceived: boolean;
    noConflicts: boolean;
    personnelNotified: boolean;
    systemReady: boolean;
  };
  authorization: SignatureData[];
}

export interface ReEnergizeAuthorizationChecklistItem {
  id: number;
  activity: string;
  answer: "yes" | "na" | "";
  remarks: string;
}

export interface ReEnergizeAuthorizationStep {
  checklist: ReEnergizeAuthorizationChecklistItem[];
  finalConfirmation: boolean;
  authorization: SignatureData[];
}

export interface PermitFormData {
  permitId: string;
  certificateNo: string;
  permitNo: string;
  status: "draft" | "submitted" | "approved";
  createdAt: string; // ISO
  updatedAt: string; // ISO
  stepData: {
    basic: BasicDetailsStep;
    workAuth: { rows: WorkAuthorizationRow[]; confirmation: boolean };
    deEnergize: DeEnergizeStep;
    permitToWork: PermitToWorkStep;
    preExecution: PreExecutionStep;
    jobCompletion: JobCompletionStep;
    reEnergizeInstruction: ReEnergizeInstructionStep;
    reEnergizeAuthorization: ReEnergizeAuthorizationStep;
  };
}

export interface AuditEvent {
  id: string;
  ts: string; // ISO timestamp
  action: string;
  details?: Record<string, unknown>;
}

export interface PermitDraftEnvelope {
  data: PermitFormData;
  auditTrail: AuditEvent[];
}
