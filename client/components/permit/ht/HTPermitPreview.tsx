import React from "react";

// Mock data for demonstration
const mockData = {
  certificateNo: "CERT123",
  permitNo: "HT001",
  stepData: {
    basic: {
      powerLine: "11KV Feeder Line A",
      crossRefPermitNo: "REF456",
      affectedPlant: "Steel Plant Unit 1",
      deptLocation: "Electrical Dept, Block A",
      jobDescription:
        "Maintenance and repair work on HT line insulators and conductors",
      validity: {
        fromDate: "2025-09-23",
        fromTime: "08:00",
        toDate: "2025-09-23",
        toTime: "18:00",
      },
    },
    workAuth: {
      confirmation: true,
      rows: [
        {
          role: "Permit Requisitioner",
          name: "John Smith",
          signatureImage: "",
          contactNo: "9876543210",
          date: "2025-09-23",
          time: "07:30",
        },
        {
          role: "Permit Issuing Autho.",
          name: "Jane Doe",
          signatureImage: "",
          contactNo: "9876543299",
          date: "2025-09-23",
          time: "07:35",
        },
      ],
    },
    deEnergize: {
      checklist: [
        {
          id: 1,
          activity: "All back feeding circuits checked & isolated",
          answer: "yes",
          remarks: "OK",
        },
        {
          id: 2,
          activity: "Control supply switched off",
          answer: "yes",
          remarks: "Done",
        },
        {
          id: 3,
          activity: "Breaker/MCC switched off & front lid opened",
          answer: "yes",
          remarks: "OK",
        },
        {
          id: 4,
          activity: "Breaker racked out & control plug removed",
          answer: "yes",
          remarks: "Done",
        },
        {
          id: 5,
          activity: "All fuses pulled out and kept at proper place",
          answer: "yes",
          remarks: "OK",
        },
        {
          id: 6,
          activity: "Back cover / lid of Breaker Panel opened",
          answer: "yes",
          remarks: "OK",
        },
        {
          id: 7,
          activity: "Breaker / MCC internals visually checked",
          answer: "yes",
          remarks: "Done",
        },
        {
          id: 8,
          activity:
            "No line voltage observed on Voltage Test using Voltage detector",
          answer: "yes",
          remarks: "OK",
        },
        {
          id: 9,
          activity: "Line discharged through Earth Rod",
          answer: "yes",
          remarks: "Done",
        },
        {
          id: 10,
          activity: "Temporary earthing provided",
          answer: "yes",
          remarks: "OK",
        },
        {
          id: 11,
          activity: "Breaker / MCC back/front lids (covers) closed",
          answer: "yes",
          remarks: "Done",
        },
        {
          id: 12,
          activity: "LOTO performed on Breaker/MCC Module",
          answer: "yes",
          remarks: "OK",
        },
      ],
      confirmation: true,
      authorization: [
        {
          role: "Electrical Dept.",
          name: "Mike Johnson",
          signatureImage: "",
          contactNo: "9876543211",
          date: "2025-09-23",
          time: "08:00",
        },
      ],
    },
    permitToWork: {
      workerName: "Robert Wilson",
      equipmentType: "11KV HT Line",
      timeRange: {
        fromDate: "2025-09-23",
        fromTime: "08:30",
        toDate: "2025-09-23",
        toTime: "17:30",
      },
      safetyConfirmed: true,
      authorization: [
        {
          role: "Permit Issuing Autho.",
          name: "Sarah Davis",
          signatureImage: "",
          contactNo: "9876543212",
          date: "2025-09-23",
          time: "08:15",
        },
      ],
    },
    preExecution: {
      checklist: [
        {
          id: 1,
          activity: "Breaker is in racked out position",
          answer: "yes",
          remarks: "OK",
        },
        {
          id: 2,
          activity: "No line voltage observed on cable discharged by grounding",
          answer: "yes",
          remarks: "Done",
        },
        {
          id: 3,
          activity:
            "No line voltage observed on Voltage Test using Voltage detector",
          answer: "yes",
          remarks: "OK",
        },
        {
          id: 4,
          activity: "Local earthing provided",
          answer: "yes",
          remarks: "Done",
        },
        {
          id: 5,
          activity: "LOTO done on Breaker / MCC Module",
          answer: "yes",
          remarks: "OK",
        },
      ],
      confirmation: true,
      authorization: [
        {
          role: "Permit Requisitioner",
          name: "Tom Brown",
          signatureImage: "",
          contactNo: "9876543213",
          date: "2025-09-23",
          time: "08:45",
        },
      ],
    },
    jobCompletion: {
      safetyChecks: {
        toolsRemoved: true,
        manpowerEvacuated: true,
        groundsRemoved: true,
        areaSafe: true,
      },
      authorization: [
        {
          role: "Permit Requisitioner",
          name: "Tom Brown",
          signatureImage: "",
          contactNo: "9876543213",
          date: "2025-09-23",
          time: "17:00",
        },
      ],
    },
    reEnergizeInstruction: {
      confirmations: {
        authorizationReceived: true,
        noConflicts: true,
        personnelNotified: true,
        systemReady: true,
      },
      authorization: [
        {
          role: "Permit Issuing Autho.",
          name: "Sarah Davis",
          signatureImage: "",
          contactNo: "9876543212",
          date: "2025-09-23",
          time: "17:15",
        },
      ],
    },
    reEnergizeAuthorization: {
      checklist: [
        {
          id: 1,
          activity: "Damaged internals of Breaker/MCC rectified",
          answer: "yes",
          remarks: "OK",
        },
        {
          id: 2,
          activity: "Temporary earthing removed",
          answer: "yes",
          remarks: "Done",
        },
        {
          id: 3,
          activity: "IR Value of Cable/Equipment Checked-found O.K.",
          answer: "yes",
          remarks: "OK",
        },
        {
          id: 4,
          activity: "Back lid / cover of Breaker boxed up",
          answer: "yes",
          remarks: "Done",
        },
        {
          id: 5,
          activity: "All Locks & Tags of Breaker removed",
          answer: "yes",
          remarks: "OK",
        },
        {
          id: 6,
          activity: "All fuses put back in place",
          answer: "yes",
          remarks: "Done",
        },
        {
          id: 7,
          activity: "Breaker control plug put back in place",
          answer: "yes",
          remarks: "OK",
        },
        {
          id: 8,
          activity: "Breaker checked in test position & found O.K.",
          answer: "yes",
          remarks: "Done",
        },
      ],
      finalConfirmation: true,
      authorization: [
        {
          role: "Electrical Dept.",
          name: "Mike Johnson",
          signatureImage: "",
          contactNo: "9876543211",
          date: "2025-09-23",
          time: "17:30",
        },
      ],
    },
  },
};

function Cell({
  children,
  className = "",
  colSpan = 1,
}: React.PropsWithChildren<{ className?: string; colSpan?: number }>) {
  return (
    <td
      colSpan={colSpan}
      className={`border border-black p-1 align-top text-xs leading-tight ${className}`}
    >
      {children}
    </td>
  );
}

function YesNo({ v }: { v: "yes" | "na" | "" }) {
  return <></>;
}

function toAmPm(t?: string) {
  if (!t) return "";
  const [hh, mm] = t.split(":");
  const h = parseInt(hh, 10);
  const am = h < 12;
  const h12 = ((h + 11) % 12) + 1;
  return `${String(h12).padStart(2, "0")}:${mm} ${am ? "AM" : "PM"}`;
}

export default function HTPermitPreview({ data = mockData }: { data?: any }) {
  const basic = data.stepData.basic;
  const workAuth = data.stepData.workAuth;
  const deE = data.stepData.deEnergize;
  const ptw = data.stepData.permitToWork;
  const pre = data.stepData.preExecution;
  const job = data.stepData.jobCompletion;
  const rei = data.stepData.reEnergizeInstruction;
  const rea = data.stepData.reEnergizeAuthorization;

  const handlePrint = () => {
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
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Permit Print</title>${styles}<style>@page{size:A4;margin:8mm;} body{background:white;color:black;-webkit-print-color-adjust:exact;print-color-adjust:exact;} .permit-print-area{width:190mm;} @media print{ .permit-print-area{width:190mm !important;margin:0 auto !important;} }</style></head><body>${el.outerHTML}</body></html>`;
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
    <div
      className="mx-auto bg-white text-black permit-print-area"
      style={{ width: "190mm", minHeight: "270mm" }}
    >
      <style>{`
        .permit-print-area table { 
          border-collapse: collapse !important; 
        }
        .permit-print-area td, .permit-print-area th { 
          padding: 2px 4px !important; 
          border: 0.5px solid black !important;
          vertical-align: top !important;
        }
        .permit-print-area .header-title { 
          font-size: 14px !important; 
          font-weight: bold !important; 
        }
        .permit-print-area .section-title { 
          font-size: 11px !important; 
          font-weight: bold !important; 
        }
        .permit-print-area .checkbox { 
          width: 16px !important; 
          height: 16px !important; 
        }
        /* Ensure the AM/NS INDIA cell centers its content vertically */
        .permit-print-area .logo-cell { 
          vertical-align: middle !important; 
          padding: 0 !important;
        }
        /* Remove outer border for inner header table, keep only horizontal dividers */
        .permit-print-area .header-center td { 
          border: none !important; 
          padding: 1px 0 !important; /* even tighter vertical spacing, no horizontal padding */
          line-height: 1.1 !important;
        }
        .permit-print-area .header-center .row-divider { 
          border-bottom: 0.5px solid black !important; 
        }
        /* Force full-bleed divider that reaches outer borders */
        .permit-print-area .header-hr {
          border-top: 0.5px solid black !important;
          margin-left: -4px !important;
          margin-right: -4px !important;
          height: 0;
        }
        @media print {
          @page { 
            size: A4; 
            margin: 6mm; 
          }
          .permit-print-area { 
            width: 190mm !important; 
            margin: 0 auto !important;
          }
        }
      `}</style>

      {/* Single border container for all content */}
      <div className="border border-black">
        {/* Header - Matches provided design */}
        <table className="w-full border-b border-black">
          <tbody>
            <tr>
              <td className="border-r border-black logo-cell w-[18%] relative">
                <div className="absolute inset-0 flex items-center justify-center py-0">
                  <div className="text-gray-700 font-extrabold text-center leading-none">
                    <div className="text-lg tracking-wide leading-none">
                      AM/NS
                    </div>
                    <div className="text-lg tracking-wide leading-none">
                      INDIA
                    </div>
                  </div>
                </div>
              </td>
              <td className="align-middle p-0">
                <table className="w-full header-center">
                  <tbody>
                    <tr>
                      <td className="text-center font-bold header-title py-1">
                        ArcelorMittal Nippon Steel India Limited
                      </td>
                    </tr>
                    <tr>
                      <td className="text-center font-bold text-xs py-1">
                        HAZIRA
                        <div className="header-hr" />
                      </td>
                    </tr>
                    <tr>
                      <td className="text-center font-bold py-1">
                        <div className="text-xs leading-tight">
                          ADDITIONAL WORK PERMIT FOR HIGH TENSION
                        </div>
                        <div className="text-xs leading-tight">
                          LINE/Equipment
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td className="border-l border-black align-top w-[20%] text-xs p-1">
                <div className="font-semibold">Certificate No.:</div>
                <div className="font-semibold mt-2">Permit No.:</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Part A */}
        <div className="px-1 py-1 border-b border-black">
          <table className="w-full">
            <thead className="bg-white">
              <tr>
                <th
                  className="border border-black p-1 text-left text-xs bg-gray-400 font-semibold"
                  colSpan={4}
                >
                  Part - A: REQUEST TO WORK ON HT LINE
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Cell className="font-semibold w-[22%]">
                  Power Line to be Isolated
                </Cell>
                <Cell className="w-[32%]">{basic.powerLine}</Cell>
                <Cell className="font-semibold w-[18%]">
                  Cross Ref. Permit No
                </Cell>
                <Cell className="w-[32%]">{basic.crossRefPermitNo}</Cell>
              </tr>
              <tr>
                <Cell className="font-semibold">Plant will be affected</Cell>
                <Cell>{basic.affectedPlant}</Cell>
                <Cell className="font-semibold">Dept. & Location</Cell>
                <Cell>{basic.deptLocation}</Cell>
              </tr>
              <tr>
                <Cell className="font-semibold" colSpan={4}>
                  Description of the Job
                </Cell>
              </tr>
              <tr>
                <Cell colSpan={4}>
                  <div className="min-h-[16px] py-1">
                    {basic.jobDescription}
                  </div>
                </Cell>
              </tr>
              <tr>
                <Cell className="font-semibold">Validity</Cell>
                <Cell colSpan={3}>
                  <span className="font-semibold">From Date</span>
                  <span className="ml-2"></span>
                  <span className="font-semibold ml-6">at</span>
                  <span className="ml-2"></span>
                  <span className="ml-2"></span>
                  <span className="font-semibold ml-6">to</span>
                  <span className="font-semibold ml-6">Date</span>
                  <span className="ml-2"></span>
                  <span className="font-semibold ml-6">at</span>
                  <span className="ml-2"></span>
                  <span className="ml-2"></span>
                </Cell>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Part B */}
        <div className="px-1 py-1 border-b border-black">
          <table className="w-full">
            <thead>
              <tr>
                <th
                  className="border border-black p-1 text-left text-xs bg-gray-400 font-semibold"
                  colSpan={6}
                >
                  Part - B: WORK STARTING AUTHORISATION
                </th>
              </tr>
              <tr>
                <th
                  className="border border-black p-1 text-left text-xs font-bold"
                  colSpan={6}
                >
                  The above mentioned equipment / related power cable may be de-energized as requested.
                </th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-black p-1 text-left w-[20%] text-xs">
                  Authorized Person
                </th>
                <th className="border border-black p-1 text-left w-[20%] text-xs">
                  Name
                </th>
                <th className="border border-black p-1 text-left w-[20%] text-xs">
                  Signature
                </th>
                <th className="border border-black p-1 text-left w-[15%] text-xs">
                  Contact
                </th>
                <th className="border border-black p-1 text-left w-[12.5%] text-xs">
                  Date
                </th>
                <th className="border border-black p-1 text-left w-[12.5%] text-xs">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {workAuth.rows.map((r: any, i: number) => (
                <tr key={i}>
                  <Cell>{r.role}</Cell>
                  <Cell>{r.name}</Cell>
                  <Cell>
                    <div className="h-4 border-black" />
                  </Cell>
                  <Cell>{r.contactNo}</Cell>
                  <Cell>{r.date}</Cell>
                  <Cell>{r.time}</Cell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Part C - De-energizing */}
        <div className="px-1 py-1 border-b border-black">
          <table className="w-full">
            <thead>
              <tr>
                <th
                  className="border border-black p-1 text-left text-xs bg-gray-400 font-semibold"
                  colSpan={5}
                >
                  Part - C: DE-ENERGISING AUTHORISATION
                </th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-black p-1 w-[5%] text-center text-xs">
                  Sr.
                </th>
                <th className="border border-black p-1 text-center w-[68%] text-xs">
                  Activity
                </th>
                <th className="border border-black p-1 w-[8%] text-center text-xs">
                  Yes
                </th>
                <th className="border border-black p-1 w-[8%] text-center text-xs">
                  NA
                </th>
                <th className="border border-black p-1 w-[11%] text-center text-xs">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              {deE.checklist.map((r: any) => (
                <tr key={r.id}>
                  <Cell className="text-center">{r.id}</Cell>
                  <Cell className="px-1">{r.activity}</Cell>
                  <Cell className="text-center">
                    <YesNo v={r.answer} />
                  </Cell>
                  <Cell className="text-center">
                    <YesNo v={r.answer === "na" ? "yes" : ""} />
                  </Cell>
                  <Cell className="text-center">{r.remarks}</Cell>
                </tr>
              ))}
              {/* Informational and authorization rows (flattened into this table) */}
              <tr>
                <Cell colSpan={5} className="text-xs font-semibold">
                  The above mentioned power cable [Feeder] / equipment is de-energised after performing above Checks / Activities
                </Cell>
              </tr>
              <tr className="bg-gray-100">
                <Cell className="text-xs font-semibold">Authorised Person</Cell>
                <Cell className="text-xs font-semibold">Name</Cell>
                <Cell className="text-xs font-semibold">Signature</Cell>
                <Cell className="text-xs font-semibold">Contact No.</Cell>
                <Cell className="text-xs font-semibold">Date / Time</Cell>
              </tr>
              <tr>
                <Cell className="font-semibold">Electrical Dept.</Cell>
                <Cell>{deE.authorization?.[0]?.name || ""}</Cell>
                <Cell>
                  <div className="h-4 border-black" />
                </Cell>
                <Cell>{deE.authorization?.[0]?.contactNo || ""}</Cell>
                <Cell>
                  {deE.authorization?.[0]?.date || ""}
                  {deE.authorization?.[0]?.time ? ` ${deE.authorization?.[0]?.time}` : ""}
                </Cell>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Part D - Permit to Work */}
        <div className="px-1 py-1 border-b border-black">
          <div className="mb-1 text-sm">
            Permit issued to Mr. {ptw.workerName} for {ptw.equipmentType}
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th
                  className="border border-black p-1 text-left text-xs bg-gray-400 font-semibold"
                  colSpan={6}
                >
                  Part - D: PERMIT TO WORK AUTHORISATION
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Cell className="font-semibold w-[12%]">From</Cell>
                <Cell className="w-[23%]">
                  {ptw.timeRange.fromDate} at {ptw.timeRange.fromTime}
                </Cell>
                <Cell className="font-semibold w-[10%]">To</Cell>
                <Cell className="w-[23%]">
                  {ptw.timeRange.toDate} at {ptw.timeRange.toTime}
                </Cell>
                <Cell className="font-semibold w-[12%]">Contact</Cell>
                <Cell className="w-[20%]">9876543212</Cell>
              </tr>
              <tr>
                <Cell className="font-semibold" colSpan={2}>
                  Permit Issuing Authority: Sarah Davis
                </Cell>
                <Cell className="font-semibold">Date</Cell>
                <Cell>2025-09-23</Cell>
                <Cell className="font-semibold">Time</Cell>
                <Cell>08:15</Cell>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Part E - Pre-execution */}
        <div className="px-1 py-1 border-b border-black">
          <table className="w-full">
            <thead>
              <tr>
                <th
                  className="border border-black p-1 text-left text-xs bg-gray-400 font-semibold"
                  colSpan={5}
                >
                  Part - E: PRE-EXECUTION CHECKUP
                </th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-black p-1 w-[5%] text-center text-xs">
                  Sr.
                </th>
                <th className="border border-black p-1 text-left w-[68%] text-xs">
                  Activity
                </th>
                <th className="border border-black p-1 w-[8%] text-center text-xs">
                  Yes
                </th>
                <th className="border border-black p-1 w-[8%] text-center text-xs">
                  NA
                </th>
                <th className="border border-black p-1 w-[11%] text-center text-xs">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              {pre.checklist.map((r: any) => (
                <tr key={r.id}>
                  <Cell className="text-center">{r.id}</Cell>
                  <Cell className="px-1">{r.activity}</Cell>
                  <Cell className="text-center">
                    <YesNo v={r.answer} />
                  </Cell>
                  <Cell className="text-center">
                    <YesNo v={r.answer === "na" ? "yes" : ""} />
                  </Cell>
                  <Cell className="text-center">{r.remarks}</Cell>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="w-full mt-1">
            <tbody>
              <tr>
                <Cell className="font-semibold w-[20%]">
                  Permit Requisitioner
                </Cell>
                <Cell className="w-[15%]">Tom Brown</Cell>
                <Cell className="w-[15%]">
                  <div className="h-4" />
                </Cell>
                <Cell className="w-[15%]">9876543213</Cell>
                <Cell className="w-[15%]">2025-09-23</Cell>
                <Cell className="w-[20%]">08:45</Cell>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Part F - Job Completion */}
        <div className="px-1 py-1 border-b border-black">
          <div className="mb-1 text-sm">
            Work completed. All tools and manpower removed. Area is safe.
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th
                  className="border border-black p-1 text-left text-xs bg-gray-400 font-semibold"
                  colSpan={6}
                >
                  Part - F: JOB COMPLETION AUTHORISATION
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Cell className="font-semibold w-[20%]">
                  Permit Requisitioner
                </Cell>
                <Cell className="w-[15%]">Tom Brown</Cell>
                <Cell className="w-[15%]">
                  <div className="h-4 border-black" />
                </Cell>
                <Cell className="w-[15%]">9876543213</Cell>
                <Cell className="w-[15%]">2025-09-23</Cell>
                <Cell className="w-[20%]">17:00</Cell>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Part G - Re-energizing Instruction */}
        <div className="px-1 py-1 border-b border-black">
          <div className="mb-1 text-sm">
            Job completion received. Authorization given for re-energizing.
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th
                  className="border border-black p-1 text-left text-xs bg-gray-400 font-semibold"
                  colSpan={6}
                >
                  Part - G: RE-ENERGISING INSTRUCTION
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Cell className="font-semibold w-[20%]">
                  Permit Issuing Authority
                </Cell>
                <Cell className="w-[15%]">Sarah Davis</Cell>
                <Cell className="w-[15%]">
                  <div className="h-4 border-black" />
                </Cell>
                <Cell className="w-[15%]">9876543212</Cell>
                <Cell className="w-[15%]">2025-09-23</Cell>
                <Cell className="w-[20%]">17:15</Cell>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Part H - Re-energizing Authorization */}
        <div className="px-1 py-1">
          <table className="w-full">
            <thead>
              <tr>
                <th
                  className="border border-black p-1 text-left text-xs bg-gray-400 font-semibold"
                  colSpan={5}
                >
                  Part - H: RE-ENERGISING AUTHORISATION
                </th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-black p-1 w-[5%] text-center text-xs">
                  Sr.
                </th>
                <th className="border border-black p-1 text-left w-[68%] text-xs">
                  Activity
                </th>
                <th className="border border-black p-1 w-[8%] text-center text-xs">
                  Yes
                </th>
                <th className="border border-black p-1 w-[8%] text-center text-xs">
                  NA
                </th>
                <th className="border border-black p-1 w-[11%] text-center text-xs">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              {rea.checklist.map((r: any) => (
                <tr key={r.id}>
                  <Cell className="text-center">{r.id}</Cell>
                  <Cell className="px-1">{r.activity}</Cell>
                  <Cell className="text-center">
                    <YesNo v={r.answer} />
                  </Cell>
                  <Cell className="text-center">
                    <YesNo v={r.answer === "na" ? "yes" : ""} />
                  </Cell>
                  <Cell className="text-center">{r.remarks}</Cell>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mb-1 mt-1 text-sm">
            Power cable re-energised after performing above checks.
          </div>
          <table className="w-full">
            <tbody>
              <tr>
                <Cell className="font-semibold w-[20%]">
                  Electrical Department
                </Cell>
                <Cell className="w-[15%]">Mike Johnson</Cell>
                <Cell className="w-[15%]">
                  <div className="h-4 border-black" />
                </Cell>
                <Cell className="w-[15%]">9876543211</Cell>
                <Cell className="w-[15%]">2025-09-23</Cell>
                <Cell className="w-[20%]">17:30</Cell>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Button */}
      <div className="mt-2 flex justify-end px-4 pb-4 no-print">
        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Print Permit
        </button>
      </div>
    </div>
  );
}
