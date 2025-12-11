import React from "react";

type ChecklistRow = {
  id: number;
  activity: string;
  answer: "yes" | "na" | "";
  remarks?: string;
};

type PersonRow = {
  authority?: string;
  name?: string;
  signature?: string; // data URL
  contact?: string;
  date?: string;
  time?: string;
};

export type GasPermitData = {
  header: { certificateNo: string; permitNo: string };
  partA: {
    issuerName: string;
    crossRef: string;
    department: string;
    location: string;
    description: string;
    fromDate: string;
    fromTime: string;
    toDate: string;
    toTime: string;
  };
  partB: ChecklistRow[];
  partD: {
    confirmation: boolean;
    issuerName?: string;
    issuerSignature?: string;
    issuerContact?: string;
    issuerDate?: string;
    issuerTime?: string;
  };
  partE: {
    acceptor: PersonRow;
    issuer: PersonRow;
    acceptorConfirmed: boolean;
    closed: boolean;
  };
};

function Cell({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <td className={`border border-black p-[3px] align-top ${className}`}>
      {children}
    </td>
  );
}

function Box({ checked, label }: { checked?: boolean; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-block w-3 h-3 border border-black text-[9px] leading-3 text-center">
        {checked ? "✓" : ""}
      </span>
      {label ? <span className="text-[9px]">{label}</span> : null}
    </span>
  );
}

const gasTable: [string, string, string, string][] = [
  ["Ammonia", "25 ppm", "16.0%", "25.0%"],
  ["BF Gas", "50 PPM", "45%", "70%"],
  ["Carbon Monoxide (CO)", "50 PPM", "12.50%", "74%"],
  ["Corex Gas", "50 PPM", "10%", "72%"],
  ["Coke Oven Gas", "50 PPM", "6.00%", "30%"],
  ["Chlorine (Cl)", "0.5 ppm", "—", "—"],
  ["DRI Tail Gas", "50 PPM", "27%", "87%"],
  ["Hydrogen (H)", "—", "4.0%", "74.0%"],
  ["Hydrogen Sulphide (H s)", "10 ppm", "4%", "46%"],
  ["LPG", "1000 ppm", "2.2%", "9.9%"],
  ["Methane / Natural Gas", "1000 ppm", "5.9%", "14.0%"],
];

function ImgOrBox({ src }: { src?: string }) {
  if (src)
    return <img src={src} alt="signature" className="h-10 object-contain" />;
  return <div className="h-10 border border-dashed border-black" />;
}

export default function GasPermitPreview({ data }: { data: GasPermitData }) {
  const a = data.partA;
  const d = data.partD;
  const e = data.partE;

  const handlePrint = () => {
    try {
      const el = document.querySelector(
        ".gas-permit-print-area"
      ) as HTMLElement | null;
      const styles = Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style')
      )
        .map((s) => s.outerHTML)
        .join("");
      const html = `<!doctype html><html><head><meta charset=\"utf-8\"><title>Gas Permit</title>${styles}<style>@page{size:A4;margin:10px;}body{background:#fff;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact;} .gas-permit-print-area{width:210mm;margin:0 auto;} .no-print{display:none !important;} </style></head><body>${
        el?.outerHTML || ""
      }</body></html>`;
      const w = window.open("", "_blank");
      if (!w) return window.print();
      w.document.open();
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 300);
    } catch {
      try {
        window.print();
      } catch {}
    }
  };

  return (
    <div className="gas-permit-print-area mx-auto" style={{ width: "210mm" }}>
      <style>{`
      .gas-permit-print-area * { font-family: Arial, Helvetica, sans-serif; line-height: 1.2; }
      .gas-permit { border: 2px solid #000; background: #fff; }
      .header-cell { font-weight: 700; }
      .section-title { background: #E8E8E8; font-weight: 700; border: 1px solid #000; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #000; padding: 3px; font-size: 8px; }
      th { font-weight: 700; }
      .h-title-16 { font-size: 16px; font-weight: 700; }
      .h-title-12 { font-size: 12px; font-weight: 700; }
      .h-title-10 { font-size: 10px; font-weight: 700; }
      .text-9 { font-size: 9px; }
      .page-wrap { padding: 10px; }
      .title-row { border-bottom: 2px solid #000; }
      `}</style>

      <div className="gas-permit">
        {/* Header Section */}
        <div
          className="title-row grid"
          style={{ gridTemplateColumns: "20% 60% 20%" }}
        >
          <div className="flex items-center justify-center border-r-2 border-black p-2">
            <div className="font-bold text-center text-[14px]">AM/NS INDIA</div>
          </div>
          <div className="text-center p-2 border-r-2 border-black">
            <div className="h-title-16">
              ArcelorMittal Nippon Steel India Limited
            </div>
            <div className="h-title-12">HAZIRA</div>
            <div className="h-title-10">
              ADDITIONAL WORK PERMIT FOR GAS LINE / EQUIPMENT
            </div>
          </div>
          <div className="p-2 text-[10px]">
            <div>
              Certificate No.:{" "}
              <span className="font-normal">{data.header.certificateNo}</span>
            </div>
            <div className="mt-2">
              Permit No.:{" "}
              <span className="font-normal">{data.header.permitNo}</span>
            </div>
          </div>
        </div>

        <div className="page-wrap">
          {/* Part A */}
          <div className="section-title text-[11px] px-2 py-1">
            Part - A : AUTHORISATION TO WORK (To be filled-up by Permit Issuer)
          </div>
          <table className="mt-1">
            <tbody>
              <tr>
                <Cell className="w-[25%] text-[8px] font-bold">
                  Issuer Name
                </Cell>
                <Cell className="w-[50%] text-[8px]">{a.issuerName}</Cell>
                <Cell className="w-[25%] text-[8px] font-bold">
                  Cross Ref. Permit No.
                </Cell>
              </tr>
              <tr>
                <Cell className="w-[25%] text-[8px] font-bold">Department</Cell>
                <Cell className="w-[50%] text-[8px]">{a.department}</Cell>
                <Cell className="w-[25%] text-[8px] font-bold">Location</Cell>
              </tr>
              <tr>
                <Cell className="w-[25%] text-[8px] font-bold">
                  Description of the Job
                </Cell>
                <td
                  className="border border-black p-[3px] align-top text-[8px]"
                  colSpan={2}
                >
                  {a.description}
                </td>
              </tr>
              <tr>
                <Cell className="w-[25%] text-[8px] font-bold">Validity</Cell>
                <td
                  className="border border-black p-[3px] align-top text-[8px]"
                  colSpan={2}
                >
                  <span>From Date</span>{" "}
                  <span className="inline-block min-w-[80px] border-b border-black">
                    {" "}
                    {a.fromDate}{" "}
                  </span>
                  <span className="mx-2">at</span>
                  <span className="inline-block min-w-[60px] border-b border-black">
                    {" "}
                    {a.fromTime}{" "}
                  </span>
                  <span className="mx-2">AM / PM</span>
                  <span className="mx-2">to</span>
                  <span className="mx-2">Date</span>{" "}
                  <span className="inline-block min-w-[80px] border-b border-black">
                    {" "}
                    {a.toDate}{" "}
                  </span>
                  <span className="mx-2">at</span>
                  <span className="inline-block min-w-[60px] border-b border-black">
                    {" "}
                    {a.toTime}{" "}
                  </span>
                  <span className="mx-2">AM / PM</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Part B */}
          <div className="section-title text-[11px] px-2 py-1 mt-2">
            Part - B : MANDATORY CONDITIONS (To be filled-up Jointly by Permit
            Issuer & Acceptor)
          </div>
          <table className="mt-1">
            <thead>
              <tr>
                <th className="w-[5%] text-left">Sr.</th>
                <th className="w-[75%] text-left">Activity</th>
                <th className="w-[10%] text-center">Yes</th>
                <th className="w-[10%] text-center">NA</th>
              </tr>
            </thead>
            <tbody>
              {(data.partB || []).map((r) => (
                <tr key={r.id}>
                  <Cell className="text-left">{r.id}</Cell>
                  <Cell className="text-left">{r.activity}</Cell>
                  <Cell className="text-center">
                    <Box checked={r.answer === "yes"} />
                  </Cell>
                  <Cell className="text-center">
                    <Box checked={r.answer === "na"} />
                  </Cell>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Part C */}
          <div className="section-title text-[11px] px-2 py-1 mt-2">
            Part - C : SAFE LIMITS OF GASES / VAPOURS (To be checked By Permit
            Issuer & Permit Acceptor)
          </div>
          <table className="mt-1">
            <thead>
              <tr>
                <th className="text-left w-[25%]">Gas</th>
                <th className="text-left w-[25%]">
                  Safe Conc. For 8 Hrs. duration
                </th>
                <th className="text-left w-[25%]">Lower-Flammable Limit</th>
                <th className="text-left w-[25%]">Upper-Flammable Limit</th>
              </tr>
            </thead>
            <tbody>
              {gasTable.map((row, i) => (
                <tr key={i}>
                  <Cell>{row[0]}</Cell>
                  <Cell>{row[1]}</Cell>
                  <Cell>{row[2]}</Cell>
                  <Cell>{row[3]}</Cell>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Part D */}
          <div className="section-title text-[11px] px-2 py-1 mt-2">
            Part - D : PERMIT AUTHORISATION (To be filled-up by Permit Issuer)
          </div>
          <div className="text-9 mt-1 flex items-start gap-2">
            <Box checked={!!d.confirmation} />
            <span>
              I confirm that the above location have been examined, the safety
              precautions taken as per the check list. The permission is
              authorized for this work. I also accept responsibility for the
              work to be carried out safely.
            </span>
          </div>
          <table className="mt-1">
            <thead>
              <tr>
                <th className="text-left">Authority</th>
                <th className="text-left">Name</th>
                <th className="text-left">Signature</th>
                <th className="text-left">Contact No.</th>
                <th className="text-left">Date</th>
                <th className="text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Cell>Permit Issuer</Cell>
                <Cell>{d.issuerName || ""}</Cell>
                <Cell>
                  <ImgOrBox src={d.issuerSignature} />
                </Cell>
                <Cell>{d.issuerContact || ""}</Cell>
                <Cell>{d.issuerDate || ""}</Cell>
                <Cell>{d.issuerTime || ""}</Cell>
              </tr>
            </tbody>
          </table>

          {/* Part E */}
          <div className="section-title text-[11px] px-2 py-1 mt-2">
            Part – E: Work Permit Closure (To be signed by Permit Issuer &
            Permit Acceptor)
          </div>
          <div className="text-9 mt-1 flex items-start gap-2">
            <Box checked={!!e.acceptorConfirmed} />
            <span>
              {" "}
              I confirm that the work has been completed / partially completed,
              checked by myself and the area is left in a safe condition.
            </span>
          </div>
          {/* Table 1 - Acceptor */}
          <table className="mt-1">
            <thead>
              <tr>
                <th className="w-[15%]"></th>
                <th className="text-left">Authority</th>
                <th className="text-left">Name</th>
                <th className="text-left">Signature</th>
                <th className="text-left">Contact No.</th>
                <th className="text-left">Date</th>
                <th className="text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Cell className="font-bold">Permit Acceptor</Cell>
                <Cell>{e.acceptor.authority || ""}</Cell>
                <Cell>{e.acceptor.name || ""}</Cell>
                <Cell>
                  <ImgOrBox src={e.acceptor.signature} />
                </Cell>
                <Cell>{e.acceptor.contact || ""}</Cell>
                <Cell>{e.acceptor.date || ""}</Cell>
                <Cell>{e.acceptor.time || ""}</Cell>
              </tr>
            </tbody>
          </table>
          <div className="text-9 mt-1 flex items-start gap-2">
            <Box checked={!!e.closed} />
            <span>
              I have inspected the finished work and hereby cancel / Close this
              permit.
            </span>
          </div>
          {/* Table 3 - Final Issuer */}
          <table className="mt-1">
            <thead>
              <tr>
                <th className="w-[15%]"></th>
                <th className="text-left">Authority</th>
                <th className="text-left">Name</th>
                <th className="text-left">Signature</th>
                <th className="text-left">Contact No.</th>
                <th className="text-left">Date</th>
                <th className="text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Cell className="font-bold">Permit Issuer</Cell>
                <Cell>{e.issuer.authority || ""}</Cell>
                <Cell>{e.issuer.name || ""}</Cell>
                <Cell>
                  <ImgOrBox src={e.issuer.signature} />
                </Cell>
                <Cell>{e.issuer.contact || ""}</Cell>
                <Cell>{e.issuer.date || ""}</Cell>
                <Cell>{e.issuer.time || ""}</Cell>
              </tr>
            </tbody>
          </table>

          {/* Legend */}
          <div className="grid grid-cols-12 items-stretch mt-2">
            <div className="col-span-2 section-title text-[10px] px-2 py-1 flex items-center justify-center">
              LEGEND
            </div>
            <div className="col-span-10 border border-black p-2 text-[9px] flex items-center gap-6">
              <span className="inline-flex items-center gap-1">
                <span className="font-bold">✓</span> Measures Taken
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="font-bold">✗</span> Measures Not Required
              </span>
              <span className="inline-flex items-center gap-1">
                NA Not applicable
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Print button */}
      <div className="mt-3 flex justify-end no-print">
        <button
          type="button"
          onClick={handlePrint}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Print
        </button>
      </div>
    </div>
  );
}
