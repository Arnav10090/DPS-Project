import React from "react";

export type PermitType = "hot" | "cold" | "other";

export type PermitForm = {
  permitNumber: string;
  certificateNumber?: string;
  permitType: PermitType;
  title: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  plant?: string;
  section?: string;
  location?: string;
  equipment?: string;
  equipmentName?: string;
  equipmentId?: string;
  description?: string;
  descriptionHtml?: string;
  applicantName?: string;
  authorizerName?: string;
  applicantSignature?: string | null;
  authorizerSignature?: string | null;
  attachments: { name: string; url: string }[];
  safetyTable?: { left?: string; remark?: string; right?: string }[];
  hiracNo?: string;
  sopNo?: string;
  tbtConducted?: string;
  ppeItems?: Record<string, { checked: boolean; remarks: string }>;
  firePrecautions?: Record<string, { checked: boolean; remarks: string }>;
  certificates?: Record<string, { checked: boolean; number: string }>;
  permitData?: any;
  permitStatus?: any;
};

function CheckBox({ checked }: { checked?: boolean }) {
  return (
    <div className="inline-flex items-center justify-center w-4 h-4 border border-black mr-1 align-middle">
      {checked ? <span className="text-xs leading-none">✓</span> : null}
    </div>
  );
}

function Cell({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <td className={`border border-black p-2 align-top ${className}`}>
      {children}
    </td>
  );
}

export default function PermitPreview({ form }: { form: PermitForm }) {
  const isHot = form.permitType === "hot";
  const isCold = form.permitType === "cold";

  const ppe = form.ppeItems || {};
  const fire = form.firePrecautions || {};
  const certs = form.certificates || {};
  const safety = form.safetyTable || [];

  const threeATitle = <div className="font-semibold">3A- PPE & OTHERS</div>;
  const threeBTitle = (
    <div className="font-semibold">3B-FIRE PRECAUTIONS & GAS TESTS</div>
  );
  const threeCTitle = <div className="font-semibold">3C - CERTIFICATES</div>;

  const handlePrint = () => {
    try {
      if (typeof window === "undefined") return;
      const el = document.querySelector(
        ".permit-print-area"
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
      // clone styles
      const styles = Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style')
      )
        .map((s) => s.outerHTML)
        .join("");
      const html = `<!doctype html><html><head><meta charset=\"utf-8\"><title>Permit Print</title>${styles}<style>@page{size:A4;margin:10mm;} body{background:white;color:black;-webkit-print-color-adjust:exact;print-color-adjust:exact;} .permit-print-area{width:210mm;transform:none;transform-origin:top left;} .no-print{display:none !important;} .permit-print-area table, .permit-print-area thead, .permit-print-area tbody, .permit-print-area tr, .permit-print-area td, .permit-print-area th, .permit-print-keep-together, .permit-print-area .grid, .permit-print-area .border{break-inside:avoid !important;page-break-inside:avoid !important;} @media print{ .permit-print-area{width:210mm;transform:none;transform-origin:top left;} .permit-intro{font-size:10px;line-height:1.15} .permit-intro .p-2{padding:4px !important} .permit-intro .p-3{padding:6px !important} .permit-intro .mt-3{margin-top:6px !important} .permit-intro .desc-box{min-height:28px !important} .permit-intro .signature-box img{height:24px !important} .permit-intro .signature-box .h-10{height:24px !important} .permit-safety{font-size:10px;line-height:1.15} .permit-safety .p-2{padding:4px !important} .permit-print-area table, .permit-print-area thead, .permit-print-area tbody, .permit-print-area tr, .permit-print-area td, .permit-print-area th, .permit-print-keep-together, .permit-print-area .grid, .permit-print-area .border{break-inside:avoid !important;page-break-inside:avoid !important;} } </style></head><body>${el.outerHTML}</body></html>`;
      w.document.open();
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => {
        try {
          w.print();
        } catch (e) {
          // fallback
        }
        // do not close immediately to let user interact
      }, 500);
    } catch (e) {
      try {
        if (typeof window !== "undefined") window.print();
      } catch {}
    }
  };

  return (
    <div
      className="mx-auto bg-white text-black permit-print-area"
      style={{ width: "210mm" }}
    >
      {/* Single outer border container for all content */}
      <div className="border border-black">
        <div className="print-page-1 print-group">
          {/* Header */}
          <div className="p-3">
            <div className="grid grid-cols-12 items-center">
              <div className="col-span-3 flex items-center">
                <div className="border border-black px-2 py-1 text-xs font-bold inline-block">
                  AM/NS INDIA
                </div>
              </div>
              <div className="col-span-6 flex flex-col items-center justify-center text-center">
                <div className="font-bold text-sm">
                  ArcelorMittal Nippon Steel India Limited
                </div>
                <div className="text-xs">
                  (Formerly Essar Steel India Limited)
                </div>
                <div className="text-xs">Hazira</div>
              </div>
              <div className="col-span-3 flex items-start justify-end text-right text-xs">
                <div>AMNSIL/SAFE/F/01</div>
                <div>Rev. No. 13</div>
              </div>
            </div>
            <div className="mt-2 text-center text-lg font-extrabold">
              PERMIT TO WORK
            </div>

            {/* Work Type Selection Bar */}
            <div className="mt-3 border border-black">
              <div className="grid grid-cols-12 text-xs">
                <div className="col-span-3 flex items-center p-2 border-r border-black">
                  <CheckBox checked={isHot} />{" "}
                  <p>
                    <strong>Hot Work</strong>
                  </p>
                </div>
                <div className="col-span-3 flex items-center p-2 border-r border-black">
                  <CheckBox checked={isCold} />{" "}
                  <p>
                    <strong>Cold Work</strong>
                  </p>
                </div>
                <div className="col-span-3 p-2 border-r border-black">
                  <p>
                    <strong>Permit No.:</strong>
                  </p>
                  <div className="min-h-[20px]">{form.permitNumber}</div>
                </div>
                <div className="col-span-3 p-2">
                  <p>
                    <strong>Certificate No.:</strong>
                  </p>
                  <div className="min-h-[20px]">
                    {form.certificateNumber || ""}
                  </div>
                </div>
              </div>
              <div className="p-2 text-[11px] border-t border-black">
                Copies: Pink - Permit Applicant / Holder, Green - Work Site, White
                - Authoriser
              </div>
            </div>

            {/* Section 1: Application and Work Description */}
            <div className="mt-3 permit-intro">
              <div className="text-sm font-bold mb-1">
                APPLICATION AND WORK DESCRIPTION (Filled by Applicant):
              </div>
              <div className="grid grid-cols-12 text-xs border border-black">
                <div className="col-span-6 border-r border-black p-2">
                  <div className="flex items-center gap-2">
                    <p>
                      <strong>Planned Work Schedule:</strong>
                    </p>
                    <span
                      className="inline-block border-b border-black w-20 ml-2"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-1">
                    <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-2 items-center text-xs">
                      <div className="whitespace-nowrap">
                        <div className="inline font-semibold">Date:</div>
                        <p className="m-0 inline ml-1">From:</p>
                      </div>
                      <div className="border-b border-black block w-full max-w-full overflow-hidden py-1">
                        {form.startDate || "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}
                      </div>
                      <div className="text-center whitespace-nowrap">
                        <p className="m-0">To:</p>
                      </div>
                      <div className="border-b border-black block w-full max-w-full overflow-hidden py-1">
                        {form.endDate || "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}
                      </div>

                      <div className="mt-1 whitespace-nowrap">
                        <div className="inline font-semibold">Time:</div>
                        <p className="m-0 inline ml-1">From:</p>
                      </div>
                      <div className="mt-1 border-b border-black block w-full max-w-full overflow-hidden py-1">
                        {form.startTime || "\u00A0\u00A0\u00A0\u00A0"}
                      </div>
                      <div className="mt-1 text-center whitespace-nowrap">
                        <p className="m-0">To:</p>
                      </div>
                      <div className="mt-1 border-b border-black block w-full max-w-full overflow-hidden py-1">
                        {form.endTime || "\u00A0\u00A0\u00A0\u00A0"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-6 p-2">
                  <div className="grid grid-cols-12 gap-0">
                    <div className="col-span-6 pr-2">
                      <div className="flex items-center gap-2">
                        <p className="m-0">
                          <strong>Plant:</strong>
                        </p>
                        <span
                          className="inline-block border-b border-black w-20 ml-2"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-h-[16px]">{form.plant || ""}</div>
                    </div>
                    <div className="col-span-12 mt-1">
                      <div className="flex items-center gap-2">
                        <p className="m-0">
                          <strong>Location:</strong>
                        </p>
                        <span
                          className="inline-block border-b border-black w-20 ml-2"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-h-[16px]">{form.location || ""}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-t-0 border-black p-2 text-xs">
                <p>
                  <strong>Work Description:</strong>
                </p>
                <div
                  className="min-h-[60px] mt-1 desc-box"
                  dangerouslySetInnerHTML={{
                    __html: form.descriptionHtml || form.description || "",
                  }}
                />
              </div>

              <div className="grid grid-cols-12 text-xs border border-t-0 border-black">
                <div className="col-span-4 p-2 border-r border-black">
                  <p>
                    <strong>Equipment Name:</strong>
                  </p>
                  <div className="min-h-[16px]">
                    {form.equipmentName || form.equipment || ""}
                  </div>
                </div>
                <div className="col-span-4 p-2 border-r border-black">
                  <p>
                    <strong>Equipment ID No.:</strong>
                  </p>
                  <div className="min-h-[16px]">{form.equipmentId || ""}</div>
                </div>
                <div className="col-span-4 p-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="m-0 font-semibold">Applicant Sign:</div>
                      <div className="mt-2 signature-box">
                        {form.applicantSignature ? (
                          <img
                            src={form.applicantSignature}
                            alt="Applicant Sign"
                            className="h-10 object-contain border border-black"
                          />
                        ) : (
                          <div className="h-10 border border-dashed border-black w-28" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs m-0">
                        <strong>Name:</strong>
                      </p>
                      <div className="mt-2 block border-b border-black w-full max-w-full overflow-hidden whitespace-nowrap">
                        {form.applicantName || "\u00A0\u00A0\u00A0\u00A0"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 text-xs border border-t-0 border-black">
                <div className="col-span-6 p-2 border-r border-black">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="m-0 font-semibold">
                        Authorisation for shut down Sign:
                      </div>
                      <div className="mt-2 signature-box">
                        {form.authorizerSignature ? (
                          <img
                            src={form.authorizerSignature}
                            alt="Authorizer Sign"
                            className="h-10 object-contain border border-black"
                          />
                        ) : (
                          <div className="h-10 border border-dashed border-black w-28" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs m-0">
                        <strong>Name:</strong>
                      </p>
                      <div className="mt-2 block border-b border-black w-full max-w-full overflow-hidden whitespace-nowrap">
                        {form.authorizerName || "\u00A0\u00A0\u00A0\u00A0"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-6 p-2" />
              </div>
            </div>

            {/* Section 2: Safety Table */}
            <div className="mt-3 permit-print-keep-together permit-safety">
              <div className="grid grid-cols-12 border border-black text-xs font-semibold">
                <div className="col-span-1 p-2 border-r border-black text-center">
                  1
                </div>
                <div className="col-span-4 p-2 border-r border-black">
                  SAFETY MEASURES TAKEN BY OPERATIONS
                </div>
                <div className="col-span-2 p-2 border-r border-black text-center">
                  REMARKS
                </div>
                <div className="col-span-1 p-2 border-r border-black text-center">
                  2
                </div>
                <div className="col-span-4 p-2">
                  SPECIAL PRECAUTIONS &amp; POTENTIAL HAZARDS FILLED BY APPLICANT
                  / AUTHORISER
                </div>
              </div>
              {/* Left numbered 1.1 to 2.0 */}
              {Array.from({ length: 10 }).map((_, idx) => {
                const leftIdx = idx; // 0..9 => 1.1 .. 2.0
                const leftNum = leftIdx < 9 ? `1.${leftIdx + 1}` : "2.0";
                const row = safety[leftIdx] || { left: "", remark: "" };
                return (
                  <div
                    className="grid grid-cols-12 border-l border-r border-b border-black text-xs"
                    key={idx}
                  >
                    <div className="col-span-1 p-2 border-r border-black text-center">
                      <span>{leftNum}</span>
                    </div>
                    <div className="col-span-4 p-2 border-r border-black">
                      <span>{row.left || ""}</span>
                    </div>
                    <div className="col-span-2 p-2 border-r border-black">
                      {row.remark || ""}
                    </div>
                    <div className="col-span-1 p-2 border-r border-black text-center">
                      <span>{`2.${idx + 1}`}</span>
                    </div>
                    <div className="col-span-4 p-2">
                      {idx === 0 && <p>HIRAC No.:</p>}
                      {idx === 1 && <p>SOP No.:</p>}
                      {idx === 2 && <p>TBT Conducted:</p>}
                      {idx > 2 && ((safety[idx] && safety[idx].right) || "")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: PPE and Safety Requirements */}
          <div className="print-page-2 print-group px-3">
            <div className="mt-3 permit-print-keep-together">
              <div className="border border-black text-center text-xs font-semibold p-2">
                PPE, FIRE PRECAUTIONS, GAS TEST & ASSOCIATED CERTIFICATES TO BE
                FILLED BY PERMIT APPLICANT
              </div>

              <div className="grid grid-cols-12 border border-t-0 border-black text-xs">
                <div className="col-span-1 p-2 border-r border-black flex items-center justify-center text-center font-semibold">
                  3
                </div>
                <div className="col-span-3 p-2 border-r border-black flex items-center justify-center text-center">
                  {threeATitle}
                </div>
                <div className="col-span-1 p-2 border-r border-black font-semibold flex items-center justify-center text-center">
                  REMARKS
                </div>
                <div className="col-span-3 p-2 border-r border-black flex items-center justify-center text-center">
                  {threeBTitle}
                </div>
                <div className="col-span-1 p-2 border-r border-black font-semibold flex items-center justify-center text-center">
                  REMARKS
                </div>
                <div className="col-span-2 p-2 border-r border-black font-semibold flex items-center justify-center text-center">
                  3C - CERTIFICATES
                </div>
                <div className="col-span-1 p-2 font-semibold flex items-center justify-center text-center text-[10px] break-words">
                  CERTIFICATE NOS.
                </div>
              </div>

              {[
                {
                  no: "3.1",
                  leftKey: "eyeProtection",
                  left: "Eye, Face & Ear Protection",
                  rightKey: "fireWatcher",
                  right: "Competent Fire Watcher",
                  cert: "confinedSpace",
                },
                {
                  no: "3.2",
                  leftKey: "headProtection",
                  left: "Head Protection",
                  rightKey: "fireExtinguishers",
                  right: "Fire Extinguishers",
                  cert: "loto",
                },
                {
                  no: "3.3",
                  leftKey: "bodyProtection",
                  left: "Body Protection, Full Body Safety Harness",
                  rightKey: "pressureFireHose",
                  right: "Pressure Fire Hose",
                  cert: "electrical",
                },
                {
                  no: "3.4",
                  leftKey: "respiratoryProtection",
                  left: "Respiratory Protection (BA Set)",
                  rightKey: "fireTender",
                  right: "Fire Tender",
                  cert: "workingAtHeight",
                },
                {
                  no: "3.5",
                  leftKey: "legProtection",
                  left: "Leg Protection",
                  rightKey: "screenOffArea",
                  right: "Screen off Area",
                  cert: "excavation",
                },
                {
                  no: "3.6",
                  leftKey: "portableCOMeter",
                  left: "Portable CO Meter",
                  rightKey: "explosiveTest",
                  right: "Explosive Test",
                  cert: "heavyLift",
                },
                {
                  no: "3.7",
                  leftKey: "roofLadder",
                  left: "Roof Ladder/Gas Cutting Sets",
                  rightKey: "carbonMonoxideTest",
                  right: "Carbon Monoxide Test",
                  cert: "roadClosure",
                },
                {
                  no: "3.8",
                  leftKey: "safeAccess",
                  left: "Safe means of access/Scaffolding/Enclosures",
                  rightKey: "oxygenTest",
                  right: "Oxygen test",
                  cert: "radiography",
                },
                {
                  no: "3.9",
                  leftKey: "",
                  left: "",
                  rightKey: "",
                  right: "",
                  cert: "gasLine",
                },
                {
                  no: "3.10",
                  leftKey: "",
                  left: "",
                  rightKey: "",
                  right: "",
                  cert: "highTension",
                },
              ].map((r, idx) => (
                <div
                  className="grid grid-cols-12 border-l border-r border-b border-black text-xs"
                  key={idx}
                >
                  <div className="col-span-1 p-2 border-r border-black text-center">
                    <span className="font-semibold">{r.no}</span>
                  </div>

                  <div className="col-span-3 p-2 border-r border-black">
                    {r.left}
                  </div>

                  <div className="col-span-1 p-2 border-r border-black">
                    {r.leftKey ? ppe[r.leftKey]?.remarks || "" : ""}
                  </div>

                  <div className="col-span-3 p-2 border-r border-black">
                    {r.right}
                  </div>

                  <div className="col-span-1 p-2 border-r border-black">
                    {r.rightKey ? fire[r.rightKey]?.remarks || "" : ""}
                  </div>

                  <div className="col-span-2 p-2 border-r border-black break-words">
                    {(() => {
                      const map: Record<string, string> = {
                        confinedSpace: "Confined Space Entry",
                        loto: "LOTO",
                        electrical: "Electrical",
                        workingAtHeight: "Working at Height",
                        excavation: "Excavation",
                        heavyLift: "Heavy Lift",
                        roadClosure: "Road Closure",
                        radiography: "Radiography",
                        gasLine: "Gas Line",
                        highTension: "High Tension",
                      };
                      return map[r.cert] || "";
                    })()}
                  </div>

                  <div className="col-span-1 p-2">
                    {r.cert ? certs[r.cert]?.number || "" : ""}
                  </div>
                </div>
              ))}
            </div>

            {/* Section 4: Authorization */}
            <div className="mt-3 permit-print-keep-together">
              <div className="grid grid-cols-12 border border-black text-xs">
                <div className="col-span-6 border-r border-black p-2">
                  <div className="font-bold">PERMIT APPLICANT</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="font-semibold">SIGN:</div>
                    {form.permitData?.applicant?.signature ? (
                      <img
                        src={form.permitData.applicant.signature}
                        alt="Applicant Sign"
                        className="h-10 object-contain border border-black"
                      />
                    ) : (
                      <div className="h-10 border border-dashed border-black w-28" />
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">NAME:</div>
                      <div className="inline-block border-b border-black w-40 ml-2">
                        {form.permitData?.applicant?.name || "\u00A0"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">
                        <p>Contact No.:</p>
                      </div>
                      <div className="inline-block border-b border-black w-36 ml-2">
                        {form.permitData?.applicant?.contactNo || "\u00A0"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-6 p-2">
                  <div className="font-bold">PERMIT HOLDER</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="font-semibold">SIGN:</div>
                    {form.permitData?.holder?.signature ? (
                      <img
                        src={form.permitData.holder.signature}
                        alt="Holder Sign"
                        className="h-10 object-contain border border-black"
                      />
                    ) : (
                      <div className="h-10 border border-dashed border-black w-28" />
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">NAME:</div>
                      <div className="inline-block border-b border-black w-40 ml-2">
                        {form.permitData?.holder?.name || "\u00A0"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">
                        <p>Contact No.:</p>
                      </div>
                      <div className="inline-block border-b border-black w-36 ml-2">
                        {form.permitData?.holder?.contactNo || "\u00A0"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 border border-t-0 border-black text-xs">
                <div className="col-span-12 p-2 font-bold">PERMIT AUTHORISER</div>
                <div className="col-span-12 grid grid-cols-12">
                  <div className="col-span-6 p-2">
                    <div className="font-semibold">PERMIT VALIDITY</div>
                    <div className="mt-1">
                      <div className="inline-block mr-2">
                        <p>
                          <strong>Date: </strong>From:
                        </p>
                      </div>
                      <span className="inline-block border-b border-black w-28 mr-2">
                        {form.permitData?.authoriser?.validity?.dateFrom ||
                          "\u00A0"}
                      </span>
                      <div className="inline-block mr-2">
                        <p>To:</p>
                      </div>
                      <span className="inline-block border-b border-black w-28">
                        {form.permitData?.authoriser?.validity?.dateTo ||
                          "\u00A0"}
                      </span>
                    </div>
                    <div className="mt-1">
                      <div className="inline-block mr-2">
                        <p>
                          <strong>Time:</strong> From:
                        </p>
                      </div>
                      <span className="inline-block border-b border-black w-20 mr-2">
                        {form.permitData?.authoriser?.validity?.timeFrom ||
                          "\u00A0"}
                      </span>
                      <div className="inline-block mr-2">
                        <p>To:</p>
                      </div>
                      <span className="inline-block border-b border-black w-20">
                        {form.permitData?.authoriser?.validity?.timeTo ||
                          "\u00A0"}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-6 p-2">
                    <div className="mt-1 flex items-center gap-2">
                      <div className="font-semibold">SIGN:</div>
                      {form.permitData?.authoriser?.contact?.sign ? (
                        <img
                          src={form.permitData.authoriser.contact.sign}
                          alt="Authoriser Sign"
                          className="h-10 object-contain border border-black"
                        />
                      ) : (
                        <div className="h-10 border border-dashed border-black w-28" />
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">NAME:</div>
                        <div className="inline-block border-b border-black w-40 ml-2">
                          {form.permitData?.authoriser?.contact?.name || "\u00A0"}
                        </div>
                      </div>
                    </div>
                    <div className="mt-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">
                          <p>CONTACT NO.:</p>
                        </div>
                        <div className="inline-block border-b border-black w-36 ml-2">
                          {form.permitData?.authoriser?.contact?.contactNo ||
                            "\u00A0"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-12 grid grid-cols-12 border-t border-black">
                  <div className="col-span-12 p-2 font-bold">
                    AUTHORISER NOMINEE
                  </div>
                  <div className="col-span-12 grid grid-cols-12">
                    <div className="col-span-6 p-2">
                      <div className="font-semibold">SIGN:</div>
                      {form.permitData?.authoriser?.nominee?.sign ? (
                        <img
                          src={form.permitData.authoriser.nominee.sign}
                          alt="Nominee Sign"
                          className="h-10 object-contain border border-black"
                        />
                      ) : (
                        <div className="h-10 border border-dashed border-black w-28" />
                      )}
                    </div>
                    <div className="col-span-6 p-2">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">NAME:</div>
                        <div className="inline-block border-b border-black w-40 ml-2">
                          {form.permitData?.authoriser?.nominee?.name || "\u00A0"}
                        </div>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="font-semibold">SAP ID:</div>
                        <div className="inline-block border-b border-black w-36 ml-2">
                          {form.permitData?.authoriser?.nominee?.sapId ||
                            "\u00A0"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Permit Status */}
            <div className="mt-3 permit-status-compact permit-print-keep-together">
              <style>{`.permit-status-compact .font-semibold{font-weight:400}
  @media print{
    .permit-status-compact{font-size:10px; line-height:1.2}
    .permit-status-compact .p-2{padding:4px !important}
    .permit-status-compact .p-3{padding:6px !important}
    .permit-status-compact .mt-1{margin-top:2px !important}
    .permit-status-compact .gap-2{gap:4px !important}
  }`}</style>
              <div className="grid grid-cols-12 text-xs border border-black font-bold">
                <div className="col-span-1 p-2 border-r border-black text-center">
                  4A
                </div>
                <div className="col-span-3 p-2 border-r border-black">
                  PERMIT RETURN - WORK COMPLETE
                </div>
                <div className="col-span-1 p-2 border-r border-black text-center">
                  4B
                </div>
                <div className="col-span-3 p-2 border-r border-black">
                  PERMIT RETURN - WNC
                </div>
                <div className="col-span-4 p-2">PERMIT CANCELLATION</div>
              </div>
              {[
                { a: "4.1", b: "5.1", c: "" },
                { a: "4.2", b: "5.2", c: "" },
                { a: "4.3", b: "5.3", c: "" },
              ].map((row, i) => (
                <div
                  className="grid grid-cols-12 border-l border-r border-b border-black text-xs"
                  key={i}
                >
                  {/* 4.x Work Complete */}
                  <div className="col-span-1 p-2 border-r border-black text-center">
                    {row.a}
                  </div>
                  <div className="col-span-3 p-2 border-r border-black">
                    {i === 0 && (
                      <div>
                        <div className="font-semibold">
                          Permit Return by Permit Holder: Work Complete, Work Site
                          &amp; Equipment affected Left in Safe Condition
                        </div>
                        <div className="mt-1 grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">SIGN:</div>
                            <div className="inline-block border-b border-black w-28">
                              {(form.permitStatus?.workComplete?.holder?.sign &&
                                "[Attached]") ||
                                "\u00A0"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">NAME:</div>
                            <div className="inline-block border-b border-black w-36">
                              {form.permitStatus?.workComplete?.holder?.name ||
                                "\u00A0"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">DATE:</div>
                            <div className="inline-block border-b border-black w-28">
                              {form.permitStatus?.workComplete?.holder?.date ||
                                "\u00A0"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">TIME:</div>
                            <div className="inline-block border-b border-black w-28">
                              {form.permitStatus?.workComplete?.holder?.time ||
                                "\u00A0"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {i === 1 && (
                      <div>
                        <div className="font-semibold">
                          Permit Return by Applicant
                        </div>
                        <div className="mt-1 grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">SIGN:</div>
                            <div className="inline-block border-b border-black w-28">
                              {(form.permitStatus?.workComplete?.applicant
                                ?.sign &&
                                "[Attached]") ||
                                "\u00A0"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">NAME:</div>
                            <div className="inline-block border-b border-black w-36">
                              {form.permitStatus?.workComplete?.applicant?.name ||
                                "\u00A0"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">DATE:</div>
                            <div className="inline-block border-b border-black w-28">
                              {form.permitStatus?.workComplete?.applicant?.date ||
                                "\u00A0"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">TIME:</div>
                            <div className="inline-block border-b border-black w-28">
                              {form.permitStatus?.workComplete?.applicant?.time ||
                                "\u00A0"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {i === 2 && (
                      <div>
                        <div className="font-semibold">
                          Permit Accepted by Authoriser
                        </div>
                        <div className="mt-1 grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">SIGN:</div>
                            <div className="inline-block border-b border-black w-28">
                              {(form.permitStatus?.workComplete?.authoriser
                                ?.sign &&
                                "[Attached]") ||
                                "\u00A0"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">NAME:</div>
                            <div className="inline-block border-b border-black w-36">
                              {form.permitStatus?.workComplete?.authoriser
                                ?.name || "\u00A0"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">DATE:</div>
                            <div className="inline-block border-b border-black w-28">
                              {form.permitStatus?.workComplete?.authoriser
                                ?.date || "\u00A0"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">TIME:</div>
                            <div className="inline-block border-b border-black w-28">
                              {form.permitStatus?.workComplete?.authoriser
                                ?.time || "\u00A0"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5.x Work Not Complete */}
                  <div className="col-span-1 p-2 border-r border-black text-center">
                    {row.b}
                  </div>
                  <div className="col-span-3 p-2 border-r border-black">
                    {i === 0 && (
                      <div>
                        <div className="font-semibold">
                          Permit Return by Permit Holder: Work Not Complete (WNC),
                          Work Site &amp; Equipment affected Left in Safe
                          Condition
                        </div>
                        <div className="mt-1 grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">SIGN:</div>
                            <div className="inline-block border-b border-black w-28">
                              {(form.permitStatus?.workNotComplete?.holder
                                ?.sign &&
                                "[Attached]") ||
                                "\u00A0"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">NAME:</div>
                            <div className="inline-block border-b border-black w-36">
                              {form.permitStatus?.workNotComplete?.holder?.name ||
                                "\u00A0"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">DATE:</div>
                            <div className="inline-block border-b border-black w-28">
                              {form.permitStatus?.workNotComplete?.holder?.date ||
                                "\u00A0"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">TIME:</div>
                            <div className="inline-block border-b border-black w-28">
                              {form.permitStatus?.workNotComplete?.holder?.time ||
                                "\u00A0"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {i === 1 && (
                      <div>
                        <div className="font-semibold">
                          Permit Return by Applicant
                        </div>
                        <div className="mt-1 grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">SIGN:</div>
                            <div className="inline-block border-b border-black w-28">
                              {(form.permitStatus?.workNotComplete?.applicant
                                ?.sign &&
                                "[Attached]") ||
                                "\u00A0"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">NAME:</div>
                            <div className="inline-block border-b border-black w-36">
                              {form.permitStatus?.workNotComplete?.applicant
                                ?.name || "\u00A0"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">DATE:</div>
                            <div className="inline-block border-b border-black w-28">
                              {form.permitStatus?.workNotComplete?.applicant
                                ?.date || "\u00A0"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">TIME:</div>
                            <div className="inline-block border-b border-black w-28">
                              {form.permitStatus?.workNotComplete?.applicant
                                ?.time || "\u00A0"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {i === 2 && (
                      <div>
                        <div className="font-semibold">
                          Permit Accepted by Authoriser
                        </div>
                        <div className="mt-1 grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">SIGN:</div>
                            <div className="inline-block border-b border-black w-28">
                              {(form.permitStatus?.workNotComplete?.authoriser
                                ?.sign &&
                                "[Attached]") ||
                                "\u00A0"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">NAME:</div>
                            <div className="inline-block border-b border-black w-36">
                              {form.permitStatus?.workNotComplete?.authoriser
                                ?.name || "\u00A0"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">DATE:</div>
                            <div className="inline-block border-b border-black w-28">
                              {form.permitStatus?.workNotComplete?.authoriser
                                ?.date || "\u00A0"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">TIME:</div>
                            <div className="inline-block border-b border-black w-28">
                              {form.permitStatus?.workNotComplete?.authoriser
                                ?.time || "\u00A0"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cancellation */}
                  <div className="col-span-4 p-2">
                    {i === 0 && (
                      <div>
                        <p>Reason:</p>
                        <div className="min-h-[20px]">
                          {form.permitStatus?.cancellation?.reason || ""}
                        </div>
                      </div>
                    )}
                    {i === 1 && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold">SIGN:</div>
                          <div className="inline-block border-b border-black w-28">
                            {(form.permitStatus?.cancellation?.sign &&
                              "[Attached]") ||
                              "\u00A0"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-semibold">NAME:</div>
                          <div className="inline-block border-b border-black w-36">
                            {form.permitStatus?.cancellation?.name || "\u00A0"}
                          </div>
                        </div>
                      </div>
                    )}
                    {i === 2 && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold">DATE:</div>
                          <div className="inline-block border-b border-black w-28">
                            {form.permitStatus?.cancellation?.date || "\u00A0"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-semibold">TIME:</div>
                          <div className="inline-block border-b border-black w-28">
                            {form.permitStatus?.cancellation?.time || "\u00A0"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Re-validation */}
          <div className="print-page-3 print-group px-3">
            <div className="mt-3 permit-print-keep-together">
              <div className="text-xs font-bold mb-1">PERMIT RE-VALIDATION</div>
              <table className="w-full border border-black border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th rowSpan={2} className="border border-black p-2">
                      DATE
                    </th>
                    <th rowSpan={2} className="border border-black p-2">
                      Time From
                    </th>
                    <th rowSpan={2} className="border border-black p-2">
                      Time To
                    </th>
                    <th
                      colSpan={2}
                      className="border border-black p-2 text-center"
                    >
                      APPLICANT
                    </th>
                    <th
                      colSpan={2}
                      className="border border-black p-2 text-center"
                    >
                      HOLDER
                    </th>
                    <th
                      colSpan={2}
                      className="border border-black p-2 text-center"
                    >
                      AUTHORISER
                    </th>
                  </tr>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-2">SIGN</th>
                    <th className="border border-black p-2">NAME</th>
                    <th className="border border-black p-2">SIGN</th>
                    <th className="border border-black p-2">NAME</th>
                    <th className="border border-black p-2">SIGN</th>
                    <th className="border border-black p-2">NAME</th>
                  </tr>
                </thead>
                <tbody>
                  {(form.permitStatus?.revalidations || []).map((r: any) => (
                    <tr key={r.id}>
                      <Cell>{r.date || ""}</Cell>
                      <Cell>{r.timeFrom || ""}</Cell>
                      <Cell>{r.timeTo || ""}</Cell>
                      <Cell>{r.applicant?.sign ? "[Attached]" : ""}</Cell>
                      <Cell>{r.applicant?.name || ""}</Cell>
                      <Cell>{r.holder?.sign ? "[Attached]" : ""}</Cell>
                      <Cell>{r.holder?.name || ""}</Cell>
                      <Cell>{r.authoriser?.sign ? "[Attached]" : ""}</Cell>
                      <Cell>{r.authoriser?.name || ""}</Cell>
                    </tr>
                  ))}
                  {/* render a few blank rows for printing */}
                  {Array.from({ length: 3 }).map((_, i) => (
                    <tr key={`blank-${i}`}>
                      <Cell>&nbsp;</Cell>
                      <Cell>&nbsp;</Cell>
                      <Cell>&nbsp;</Cell>
                      <Cell>&nbsp;</Cell>
                      <Cell>&nbsp;</Cell>
                      <Cell>&nbsp;</Cell>
                      <Cell>&nbsp;</Cell>
                      <Cell>&nbsp;</Cell>
                      <Cell>&nbsp;</Cell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Section 7: Gas Safety Limits */}
            <div className="mt-3 permit-print-keep-together">
              <div className="text-xs font-bold mb-1">
                SAFE LIMIT OF GASES / VAPOURS
              </div>
              <table className="w-full border border-black border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-200 text-black">
                    <th rowSpan={2} className="border border-black p-2 text-left">
                      GAS
                    </th>
                    <th
                      rowSpan={2}
                      className="border border-black p-2 text-center"
                    >
                      SAFE CONCENTRATION FOR 8 HRS DURATION
                    </th>
                    <th
                      colSpan={2}
                      className="border border-black p-2 text-center"
                    >
                      FLAMMABLE LIMITS
                    </th>
                  </tr>
                  <tr className="bg-gray-200 text-black">
                    <th className="border border-black p-2 text-center">LOWER</th>
                    <th className="border border-black p-2 text-center">UPPER</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-2">CARBON MONOXIDE</td>
                    <td className="border border-black p-2 text-center">
                      50 PPM
                    </td>
                    <td className="border border-black p-2 text-center">12.5%</td>
                    <td className="border border-black p-2 text-center">74.2%</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2">HYDROGEN</td>
                    <td className="border border-black p-2 text-center">-</td>
                    <td className="border border-black p-2 text-center">4.0%</td>
                    <td className="border border-black p-2 text-center">75%</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2">
                      METHANE / NATURAL GAS
                    </td>
                    <td className="border border-black p-2 text-center">
                      1000 PPM
                    </td>
                    <td className="border border-black p-2 text-center">5.9%</td>
                    <td className="border border-black p-2 text-center">14%</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2">AMMONIA</td>
                    <td className="border border-black p-2 text-center">
                      25 PPM
                    </td>
                    <td className="border border-black p-2 text-center">16%</td>
                    <td className="border border-black p-2 text-center">23%</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2">CHLORINE</td>
                    <td className="border border-black p-2 text-center">1 PPM</td>
                    <td className="border border-black p-2 text-center">-</td>
                    <td className="border border-black p-2 text-center">-</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 8: Important Instructions */}
            <div className="mt-3 text-xs">
              <div className="font-bold">IMPORTANT INSTRUCTIONS:</div>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>
                  A Permit-to-Work or Certificate is normally valid for one shift
                  only. However, it can be extended for a maximum of seven days
                  more with appropriate renewals.
                </li>
                <li>
                  Permit is not valid in the event, if conditions in the incident
                  area become Hazardous from conditions not existing when this
                  permit was issued or in the event of any Emergency / Fire.
                </li>
                <li>The authorized person should issue permit only.</li>
                <li>
                  Work Instructions & Protocol procedures are to be strictly
                  followed.
                </li>
                <li>
                  If job is not completed within the validity time period, the
                  authorized person incorporating necessary changes must extend
                  the permit.
                </li>
                <li>
                  Permit must be returned by the applicant to the issuing
                  authority after completion of the job.
                </li>
                <li>
                  When more than one agency is working at a place the concerned
                  agencies must co-ordinate among themselves for safety of the
                  persons working there.
                </li>
                <li>
                  No job should be attempted / to be done for which permit is not
                  issued.
                </li>
                <li>
                  Workers must be informed about imminent dangers involved in the
                  job.
                </li>
                <li>
                  Persons working at height and Confined Space should be medically
                  checked for acrophobia and claustrophobia respectively.
                </li>
                <li>
                  Separate Certificates are to be taken for the jobs involving
                  Excavation, Confined Space Entry, Working at Height,
                  Radiography, Electrical, LOTO, Road Closure & Heavy Lift jobs.
                </li>
                <li>
                  Results for the Confined Space Entry to be periodically recorded
                  on the Certificate.
                </li>
              </ol>
              <div className="mt-2 italic">
                NOTE: If the Applicant does not fill it, Authoriser can fill it up
                if necessary or write "NIL"
              </div>
              <div className="mt-2 text-center font-semibold border border-black py-2">
                BEFORE AUTHORISING THE PERMIT
                <div className="mt-1">
                  ENSURE THAT SITE IS SAFE TO WORK & SAFE WORKING CONDITIONS ARE
                  MAINTAINED
                </div>
              </div>
            </div>
          </div>

          {/* Section 9: Legend */}
          <div className="mt-3 text-xs px-3">
            <div className="font-bold">LEGEND</div>
            <div className="grid grid-cols-3 gap-4 mt-1">
              <div className="flex items-center gap-2">
                <span>✓</span> <span>Measures Taken</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⊗</span> <span>Measures Not Required</span>
              </div>
              <div className="flex items-center gap-2">
                <span>NA</span> <span>Not Applicable</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print button - outside the border */}
      <div className="mt-4 flex justify-end px-3 pb-6 no-print">
        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
        >
          Print
        </button>
      </div>
    </div>
  );
}