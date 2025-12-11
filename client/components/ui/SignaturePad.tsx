import React, { useRef, useState, useEffect } from "react";

interface Props {
  value?: string; // dataURL
  onChange?: (dataUrl: string | null) => void;
  ariaLabel?: string;
}

export default function SignaturePad({ value, onChange, ariaLabel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setFilePreview(res);
    };
    reader.readAsDataURL(f);
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#111827";
    ctxRef.current = ctx;

    // load initial value
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setIsEmpty(false);
      };
      img.src = value;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getPointer = (ev: PointerEvent | TouchEvent | MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    if ((ev as PointerEvent).clientX !== undefined) {
      const e = ev as PointerEvent;
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (
      (ev as TouchEvent).touches &&
      (ev as TouchEvent).touches.length
    ) {
      const t = (ev as TouchEvent).touches[0];
      clientX = t.clientX;
      clientY = t.clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const start = (e: any) => {
    e.preventDefault();
    drawing.current = true;
    const p = getPointer(e);
    const ctx = ctxRef.current!;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e: any) => {
    if (!drawing.current) return;
    e.preventDefault();
    const p = getPointer(e);
    const ctx = ctxRef.current!;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setIsEmpty(false);
  };
  const end = (e: any) => {
    if (!drawing.current) return;
    e.preventDefault();
    drawing.current = false;
    emit();
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const ctx = ctxRef.current!;
    ctx.clearRect(0, 0, rect.width, rect.height);
    setIsEmpty(true);
    if (onChange) onChange(null);
  };

  const emit = () => {
    const canvas = canvasRef.current!;
    const data = canvas.toDataURL("image/png");
    if (onChange) onChange(data);
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const handlePointerDown = (e: PointerEvent) => start(e);
    const handlePointerMove = (e: PointerEvent) => move(e);
    const handlePointerUp = (e: PointerEvent) => end(e);
    canvas.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    // touch fallback
    canvas.addEventListener("touchstart", start as any);
    window.addEventListener("touchmove", move as any);
    window.addEventListener("touchend", end as any);
    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("touchstart", start as any);
      window.removeEventListener("touchmove", move as any);
      window.removeEventListener("touchend", end as any);
    };
  }, []);

  return (
    <div>
      <div className="border rounded bg-white" style={{ minHeight: 80 }}>
        <canvas
          ref={canvasRef}
          aria-label={ariaLabel || "Signature pad"}
          style={{ width: "100%", height: 80 }}
        />
      </div>
      <div className="mt-2 flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={clear}
            className="px-2 py-1 rounded border text-sm bg-white"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => emit()}
            className="px-2 py-1 rounded bg-blue-600 text-white text-sm"
          >
            Save
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="px-2 py-1 rounded bg-blue-600 text-white text-sm"
          >
            Upload
          </button>
        </div>
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setShowUpload(false)}
          />
          <div className="relative bg-white rounded-lg shadow-lg p-4 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">Upload Signature</div>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-500"
              >
                ×
              </button>
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e)}
              />
            </div>
            {filePreview && (
              <div className="mt-3">
                <div className="border rounded p-2">
                  <img
                    src={filePreview}
                    alt="preview"
                    className="w-full object-contain"
                  />
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setFilePreview(null);
                      setShowUpload(false);
                    }}
                    className="px-3 py-1 rounded border text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (onChange) onChange(filePreview);
                      setShowUpload(false);
                    }}
                    className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
                  >
                    Use Image
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
