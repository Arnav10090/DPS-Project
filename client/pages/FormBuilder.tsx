import React, { useMemo, useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  Copy,
  Settings,
  Grid,
  Eye,
  Plus,
  X,
  Upload,
  Pen,
} from "lucide-react";

// ADD THIS BLOCK HERE - after the imports, before the type definitions
const PropertySection: React.FC<{
  title: string;
  children?: React.ReactNode;
  collapsible?: boolean;
}> = ({ title, children, collapsible = false }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="border rounded p-3 mb-4">
      <div
        className={`flex items-center justify-between mb-2 ${collapsible ? "cursor-pointer" : ""}`}
        onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
      >
        <h4 className="font-semibold text-sm text-gray-700">{title}</h4>
        {collapsible && (
          <span className="text-xs text-gray-500">
            {collapsed ? "▶" : "▼"}
          </span>
        )}
      </div>
      {!collapsed && <div className="space-y-3">{children}</div>}
    </div>
  );
};

const PropertyField: React.FC<{
  label: string;
  children?: React.ReactNode;
  description?: string;
}> = ({ label, children, description }) => (
  <div>
    <label className="text-sm font-medium text-gray-600 block mb-1">{label}</label>
    {children}
    {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
  </div>
);

const ColorPicker: React.FC<{
  value: string;
  onChange: (val: string) => void;
  label?: string;
}> = ({ value, onChange }) => (
  <div className="flex gap-2">
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-8 h-8 rounded border cursor-pointer"
    />
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="#000000"
      className="flex-1"
    />
  </div>
);

const OptionsManager: React.FC<{
  options?: string[];
  onUpdate: (opts: string[]) => void;
  addText?: string;
}> = ({ options = [], onUpdate, addText = "Add Option" }) => (
  <div className="space-y-2">
    {options.map((option, idx) => (
      <div key={idx} className="flex gap-2">
        <Input
          value={option}
          onChange={(e) => {
            const newOptions = [...options];
            newOptions[idx] = e.target.value;
            onUpdate(newOptions);
          }}
          className="flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newOptions = options.filter((_, i) => i !== idx);
            onUpdate(newOptions);
          }}
          className="px-2"
        >
          <X size={14} />
        </Button>
      </div>
    ))}
    <Button
      variant="outline"
      size="sm"
      onClick={() => onUpdate([...options, `Option ${options.length + 1}`])}
      className="w-full"
    >
      <Plus size={14} className="mr-1" />
      {addText}
    </Button>
  </div>
);

type ElementType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "time"
  | "select"
  | "checkbox"
  | "radio"
  | "file"
  | "image"
  | "signature"
  | "button"
  | "section"
  | "divider"
  | "table";

type FormElement = {
  id: string;
  type: ElementType;
  label: string;
  props: Record<string, any>;
};

const ELEMENTS = [
  {
    category: "Basic Inputs",
    items: [
      { type: "text", label: "Text Input", tooltip: "Single line text input" },
      { type: "textarea", label: "Multi-line Text" },
      { type: "number", label: "Number Input" },
    ],
  },
  {
    category: "Date & Time",
    items: [
      { type: "date", label: "Date Picker" },
      { type: "time", label: "Time Picker" },
    ],
  },
  {
    category: "Selection",
    items: [
      { type: "select", label: "Dropdown/Select" },
      { type: "checkbox", label: "Checkboxes" },
      { type: "radio", label: "Radio Buttons" },
    ],
  },
  {
    category: "File & Media",
    items: [
      { type: "file", label: "File Upload" },
      { type: "image", label: "Image Upload" },
      { type: "signature", label: "Digital Signature" },
    ],
  },
  {
    category: "Layout & Actions",
    items: [
      { type: "button", label: "Button" },
      { type: "section", label: "Section" },
      { type: "table", label: "Data Table" },
    ],
  },
];

const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

function defaultPropsFor(type: ElementType) {
  // Base properties that all elements have
  const baseProps = {
    width: "100%",
    helperText: "",
    required: false,
    disabled: false,
    readonly: false,
    validation: {
      required: false,
      customMessage: "",
    },
    styling: {
      borderColor: "#d1d5db",
      backgroundColor: "#ffffff",
      textColor: "#374151",
      fontSize: "14px",
      borderRadius: "6px",
      padding: "8px 12px",
    },
    conditionalLogic: {
      showWhen: null,
      hideWhen: null,
      requiredWhen: null,
    },
    accessibility: {
      ariaLabel: "",
      ariaDescription: "",
      tabIndex: 0,
    },
    customClasses: "",
    customCSS: "",
    fieldName: "",
    apiEndpoint: "",
    dbField: "",
    encrypted: false,
    auditLog: false,
  };

  switch (type) {
    case "text":
      return {
        ...baseProps,
        placeholder: "",
        minLength: "",
        maxLength: "",
        pattern: "",
        defaultValue: "",
        autoComplete: "off",
        spellCheck: true,
        inputMode: "text",
        validation: {
          ...baseProps.validation,
          minLength: "",
          maxLength: "",
          pattern: "",
        },
        formatting: {
          textTransform: "none",
          letterSpacing: "normal",
        },
      };

    case "textarea":
      return {
        ...baseProps,
        rows: 4,
        cols: "",
        placeholder: "",
        minLength: "",
        maxLength: "",
        defaultValue: "",
        resize: "vertical",
        validation: {
          ...baseProps.validation,
          minLength: "",
          maxLength: "",
        },
      };

    case "number":
      return {
        ...baseProps,
        placeholder: "",
        min: "",
        max: "",
        step: "1",
        defaultValue: "",
        validation: {
          ...baseProps.validation,
          min: "",
          max: "",
        },
      };

    case "date":
      return {
        ...baseProps,
        min: "",
        max: "",
        defaultValue: "",
        format: "yyyy-mm-dd",
        validation: {
          ...baseProps.validation,
          min: "",
          max: "",
        },
      };

    case "time":
      return {
        ...baseProps,
        min: "",
        max: "",
        step: "1",
        defaultValue: "",
        format: "24h",
      };

    case "select":
      return {
        ...baseProps,
        options: ["Option 1", "Option 2"],
        multiple: false,
        defaultValue: "",
        placeholder: "Select an option...",
        searchable: false,
        clearable: false,
        optionStyling: {
          optionPadding: "8px 12px",
          optionHover: "#f3f4f6",
        },
      };

    case "checkbox":
      return {
        ...baseProps,
        options: ["Option 1", "Option 2"],
        defaultValues: [],
        layout: "vertical",
        validation: {
          ...baseProps.validation,
          minSelected: "",
          maxSelected: "",
        },
        styling: {
          ...baseProps.styling,
          spacing: "8px",
        },
      };

    case "radio":
      return {
        ...baseProps,
        options: ["Option 1", "Option 2"],
        defaultValue: "",
        layout: "vertical",
        styling: {
          ...baseProps.styling,
          spacing: "8px",
        },
      };

    case "file":
      return {
        ...baseProps,
        accept: "*",
        multiple: false,
        maxSize: "10MB",
        dragDrop: true,
        validation: {
          ...baseProps.validation,
          maxFiles: "",
          allowedTypes: "",
        },
        styling: {
          ...baseProps.styling,
          backgroundColor: "#f9fafb",
          borderStyle: "dashed",
          padding: "24px",
        },
      };

    case "image":
      return {
        ...baseProps,
        accept: "image/*",
        multiple: false,
        maxSize: "5MB",
        dragDrop: true,
        preview: true,
        maxWidth: "",
        maxHeight: "",
        validation: {
          ...baseProps.validation,
          maxFiles: "",
          dimensions: "",
        },
        styling: {
          ...baseProps.styling,
          backgroundColor: "#f9fafb",
          borderStyle: "dashed",
          padding: "24px",
        },
      };

    case "signature":
      return {
        ...baseProps,
        width: 400,
        height: 200,
        penColor: "#000000",
        penWidth: 2,
        backgroundColor: "#ffffff",
        styling: {
          borderColor: "#d1d5db",
          borderRadius: "6px",
        },
      };

    case "button":
      return {
        ...baseProps,
        text: "Click Me",
        style: "primary",
        size: "md",
        action: "submit",
        url: "",
        openInNewTab: false,
        hoverEffect: "scale",
        styling: {
          ...baseProps.styling,
          fontWeight: "500",
          shadow: "none",
        },
      };

    case "section":
      return {
        ...baseProps,
        title: "Section Title",
        description: "",
        collapsible: false,
        collapsed: false,
        styling: {
          titleColor: "#1f2937",
          titleSize: "18px",
          titleWeight: "600",
          descriptionColor: "#6b7280",
          descriptionSize: "14px",
          backgroundColor: "#f8fafc",
          borderColor: "#3b82f6",
          borderWidth: "4px",
          padding: "16px",
          borderRadius: "6px",
        },
      };

    case "table":
      return {
        ...baseProps,
        columns: ["Column 1", "Column 2"],
        rows: [
          ["Row 1 Col 1", "Row 1 Col 2"],
          ["Row 2 Col 1", "Row 2 Col 2"],
        ],
        headerStyle: "default",
        striped: true,
        bordered: true,
        hoverable: false,
        editable: false,
        sortable: false,
        styling: {
          headerBackgroundColor: "#f9fafb",
          headerTextColor: "#374151",
          bodyBackgroundColor: "#ffffff",
          bodyTextColor: "#374151",
          borderColor: "#d1d5db",
          fontSize: "14px",
          padding: "8px 12px",
        },
      };

    default:
      return baseProps;
  }
}

// Signature Canvas Component
function SignatureCanvas({
  width = 400,
  height = 200,
  penColor = "#000000",
  onSignatureChange,
  onSave,
}: {
  width?: number;
  height?: number;
  penColor?: string;
  onSignatureChange?: (dataUrl: string | null) => void;
  onSave?: (dataUrl: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [hasDrawn, setHasDrawn] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const currentDataRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    // Make the canvas use full width of its container (responsive)
    canvas.style.width = `100%`;
    canvas.style.height = `${height}px`;

    // Use the actual rendered CSS width to set the backing buffer size
    const cssWidth = canvas.clientWidth || width;
    const cssHeight = height;

    canvas.width = Math.max(1, Math.floor(cssWidth * ratio));
    canvas.height = Math.max(1, Math.floor(cssHeight * ratio));

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Reset any existing transform and apply DPR scaling
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [width, height]);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lastPosRef.current = { x, y };
    isDrawingRef.current = true;
    setIsDrawing(true);
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawingRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = penColor || "#000";
    ctx.lineWidth = 2; // CSS pixels (canvas is already scaled)
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPosRef.current = { x, y };
    // mark that user has drawn something
    if (!hasDrawn) setHasDrawn(true);
    currentDataRef.current = canvas.toDataURL();
    if (onSignatureChange) {
      try {
        onSignatureChange(canvas.toDataURL());
      } catch (err) {
        // ignore
      }
    }
  };

  const stopDrawing = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = false;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas || !e) return;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentDataRef.current = null;
    setHasDrawn(false);
    setHasSaved(false);
    if (onSignatureChange) {
      onSignatureChange(null);
    }
    if (onSave) {
      onSave(null);
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = currentDataRef.current || canvas.toDataURL();
    if (onSave) onSave(dataUrl);
    setHasSaved(true);
  };

  return (
    <div className="border rounded p-2 bg-gray-50">
      <canvas
        ref={canvasRef}
        className="border bg-white cursor-crosshair block w-full"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={(e) => stopDrawing(e)}
        onPointerCancel={(e) => stopDrawing(e)}
        onPointerLeave={(e) => stopDrawing(e)}
      />
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-gray-500">Sign above</span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={saveSignature} disabled={!hasDrawn || hasSaved}>
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={clearSignature}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}

// Add these new components after the SignatureCanvas component and before the EnhancedPropertiesPanel

// File Upload Component
function FileUpload({
  accept = "*",
  multiple = false,
  maxSize = "10MB",
  dragDrop = true,
  uploadText,
  onFilesChange,
  disabled = false,
}: {
  accept?: string;
  multiple?: boolean;
  maxSize?: string;
  dragDrop?: boolean;
  uploadText?: string;
  onFilesChange?: (files: FileList | null) => void;
  disabled?: boolean;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const fileArray = Array.from(selectedFiles);
    setFiles(multiple ? [...files, ...fileArray] : [fileArray[0]]);
    onFilesChange?.(selectedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!dragDrop || disabled) return;
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!dragDrop || disabled) return;
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!dragDrop || disabled) return;
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : disabled 
            ? 'border-gray-200 bg-gray-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload className={`mx-auto mb-3 ${disabled ? 'text-gray-400' : 'text-gray-500'}`} size={32} />
        
        <div className={`text-sm font-medium mb-1 ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
          {uploadText || 'Click to upload or drag files here'}
        </div>
        
        <div className={`text-xs ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
          Max size: {maxSize} • Types: {accept === '*' ? 'All files' : accept}
          {multiple && ' • Multiple files allowed'}
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Selected Files ({files.length})
          </div>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
              <div className="flex items-center gap-2 flex-1">
                <div className="text-sm font-medium text-gray-700 truncate">
                  {file.name}
                </div>
                <div className="text-xs text-gray-500">
                  ({formatFileSize(file.size)})
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-gray-200 rounded text-red-600"
                title="Remove file"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Image Upload Component  
function ImageUpload({
  accept = "image/*",
  multiple = false,
  maxSize = "5MB",
  dragDrop = true,
  preview = true,
  uploadText,
  onImagesChange,
  disabled = false,
}: {
  accept?: string;
  multiple?: boolean;
  maxSize?: string;
  dragDrop?: boolean;
  preview?: boolean;
  uploadText?: string;
  onImagesChange?: (files: FileList | null) => void;
  disabled?: boolean;
}) {
  const [images, setImages] = useState<{file: File, url: string}[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const fileArray = Array.from(selectedFiles);
    const imagePromises = fileArray.map(file => {
      return new Promise<{file: File, url: string}>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({ file, url: reader.result as string });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(newImages => {
      setImages(multiple ? [...images, ...newImages] : [newImages[0]]);
    });

    onImagesChange?.(selectedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!dragDrop || disabled) return;
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!dragDrop || disabled) return;
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!dragDrop || disabled) return;
    e.preventDefault();
    setDragOver(false);
    handleImageSelect(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : disabled 
            ? 'border-gray-200 bg-gray-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleImageSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        <div className={`w-16 h-16 mx-auto mb-3 ${disabled ? 'bg-gray-200' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
          <Upload className={`${disabled ? 'text-gray-400' : 'text-gray-500'}`} size={24} />
        </div>
        
        <div className={`text-sm font-medium mb-1 ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
          {uploadText || 'Click to upload or drag images here'}
        </div>
        
        <div className={`text-xs ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
          Max size: {maxSize}
          {multiple && ' • Multiple images allowed'}
        </div>
      </div>

      {preview && images.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="text-sm font-medium text-gray-700">
            Selected Images ({images.length})
          </div>
          <div className={`grid gap-3 ${multiple ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={image.file.name}
                  className="w-full h-32 object-cover rounded border"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <X size={12} />
                </button>
                <div className="mt-1 text-xs text-gray-600 truncate">
                  {image.file.name} ({formatFileSize(image.file.size)})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const EnhancedPropertiesPanel = ({
  selected,
  updateElementProp,
  updateElementLabel,
  addOption,
  removeOption,
  updateOption,
  addTableColumn,
  addTableRow,
  removeTableColumn,
  removeTableRow,
}) => {
  const updateProp = (path, value) => {
    if (path === "label") {
      updateElementLabel(selected.id, value);
      return;
    }

    // Handle nested property updates
    const keys = path.split(".");
    if (keys.length === 1) {
      updateElementProp(selected.id, path, value);
    } else if (keys.length === 2) {
      const newObj = { ...selected.props[keys[0]], [keys[1]]: value };
      updateElementProp(selected.id, keys[0], newObj);
    } else if (keys.length === 3) {
      const newObj = {
        ...selected.props[keys[0]],
        [keys[1]]: { ...selected.props[keys[0]]?.[keys[1]], [keys[2]]: value },
      };
      updateElementProp(selected.id, keys[0], newObj);
    }
  };

  const renderBasicProperties = () => (
    <PropertySection title="Basic Properties">
      <PropertyField label="Field Label">
        <Input
          value={selected.label}
          onChange={(e) => updateProp("label", e.target.value)}
        />
      </PropertyField>

      <PropertyField label="Width">
        <select
          value={selected.props.width || "100%"}
          onChange={(e) => updateProp("width", e.target.value)}
          className="w-full rounded border px-2 py-1"
        >
          <option value="25%">25%</option>
          <option value="33%">33%</option>
          <option value="50%">50%</option>
          <option value="75%">75%</option>
          <option value="100%">100%</option>
          <option value="auto">Auto</option>
        </select>
      </PropertyField>

      <PropertyField
        label="Helper Text"
        description="Additional text shown below the field"
      >
        <Input
          value={selected.props.helperText || ""}
          onChange={(e) => updateProp("helperText", e.target.value)}
          placeholder="Optional helper text"
        />
      </PropertyField>

      <div className="space-y-2">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selected.props.required || false}
            onChange={(e) => updateProp("required", e.target.checked)}
          />
          Required Field
        </label>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selected.props.disabled || false}
            onChange={(e) => updateProp("disabled", e.target.checked)}
          />
          Disabled
        </label>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selected.props.readonly || false}
            onChange={(e) => updateProp("readonly", e.target.checked)}
          />
          Read Only
        </label>
      </div>
    </PropertySection>
  );

  const renderValidationProperties = () => (
    <PropertySection title="Validation Rules" collapsible>
      <PropertyField label="Custom Error Message">
        <Input
          value={selected.props.validation?.customMessage || ""}
          onChange={(e) =>
            updateProp("validation.customMessage", e.target.value)
          }
          placeholder="Custom validation message"
        />
      </PropertyField>

      {/* Text validation */}
      {(selected.type === "text" || selected.type === "textarea") && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <PropertyField label="Min Length">
              <Input
                type="number"
                value={selected.props.validation?.minLength || ""}
                onChange={(e) =>
                  updateProp("validation.minLength", e.target.value)
                }
              />
            </PropertyField>
            <PropertyField label="Max Length">
              <Input
                type="number"
                value={selected.props.validation?.maxLength || ""}
                onChange={(e) =>
                  updateProp("validation.maxLength", e.target.value)
                }
              />
            </PropertyField>
          </div>

          <PropertyField
            label="Pattern (Regex)"
            description="Regular expression for validation"
          >
            <Input
              value={selected.props.validation?.pattern || ""}
              onChange={(e) => updateProp("validation.pattern", e.target.value)}
              placeholder="^[A-Za-z]+$"
            />
          </PropertyField>
        </>
      )}

      {/* Number validation */}
      {selected.type === "number" && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <PropertyField label="Min Value">
              <Input
                type="number"
                value={selected.props.validation?.min || ""}
                onChange={(e) => updateProp("validation.min", e.target.value)}
              />
            </PropertyField>
            <PropertyField label="Max Value">
              <Input
                type="number"
                value={selected.props.validation?.max || ""}
                onChange={(e) => updateProp("validation.max", e.target.value)}
              />
            </PropertyField>
          </div>

          <PropertyField label="Step">
            <Input
              type="number"
              value={selected.props.step || "1"}
              onChange={(e) => updateProp("step", e.target.value)}
            />
          </PropertyField>
        </>
      )}

      {/* Date validation */}
      {(selected.type === "date" || selected.type === "time") && (
        <div className="grid grid-cols-2 gap-2">
          <PropertyField label="Min Date/Time">
            <Input
              type={selected.type}
              value={selected.props.validation?.min || ""}
              onChange={(e) => updateProp("validation.min", e.target.value)}
            />
          </PropertyField>
          <PropertyField label="Max Date/Time">
            <Input
              type={selected.type}
              value={selected.props.validation?.max || ""}
              onChange={(e) => updateProp("validation.max", e.target.value)}
            />
          </PropertyField>
        </div>
      )}

      {/* Checkbox validation */}
      {selected.type === "checkbox" && (
        <div className="grid grid-cols-2 gap-2">
          <PropertyField label="Min Selected">
            <Input
              type="number"
              value={selected.props.validation?.minSelected || ""}
              onChange={(e) =>
                updateProp("validation.minSelected", e.target.value)
              }
            />
          </PropertyField>
          <PropertyField label="Max Selected">
            <Input
              type="number"
              value={selected.props.validation?.maxSelected || ""}
              onChange={(e) =>
                updateProp("validation.maxSelected", e.target.value)
              }
            />
          </PropertyField>
        </div>
      )}

      {/* File validation */}
      {(selected.type === "file" || selected.type === "image") && (
        <>
          <PropertyField label="Max Files">
            <Input
              type="number"
              value={selected.props.validation?.maxFiles || ""}
              onChange={(e) =>
                updateProp("validation.maxFiles", e.target.value)
              }
            />
          </PropertyField>

          <PropertyField
            label="Allowed File Types"
            description="Comma-separated list"
          >
            <Input
              value={selected.props.validation?.allowedTypes || ""}
              onChange={(e) =>
                updateProp("validation.allowedTypes", e.target.value)
              }
              placeholder=".pdf,.doc,.docx"
            />
          </PropertyField>
        </>
      )}
    </PropertySection>
  );

  const renderStylingProperties = () => (
    <PropertySection title="Styling & Appearance" collapsible>
      <PropertyField label="Background Color">
        <ColorPicker
          value={selected.props.styling?.backgroundColor || "#ffffff"}
          onChange={(value) => updateProp("styling.backgroundColor", value)}
        />
      </PropertyField>

      <PropertyField label="Text Color">
        <ColorPicker
          value={selected.props.styling?.textColor || "#374151"}
          onChange={(value) => updateProp("styling.textColor", value)}
        />
      </PropertyField>

      <PropertyField label="Border Color">
        <ColorPicker
          value={selected.props.styling?.borderColor || "#d1d5db"}
          onChange={(value) => updateProp("styling.borderColor", value)}
        />
      </PropertyField>

      <div className="grid grid-cols-2 gap-2">
        <PropertyField label="Font Size">
          <Input
            value={selected.props.styling?.fontSize || "14px"}
            onChange={(e) => updateProp("styling.fontSize", e.target.value)}
            placeholder="14px"
          />
        </PropertyField>

        <PropertyField label="Border Radius">
          <Input
            value={selected.props.styling?.borderRadius || "6px"}
            onChange={(e) => updateProp("styling.borderRadius", e.target.value)}
            placeholder="6px"
          />
        </PropertyField>
      </div>

      <PropertyField label="Padding">
        <Input
          value={selected.props.styling?.padding || "8px 12px"}
          onChange={(e) => updateProp("styling.padding", e.target.value)}
          placeholder="8px 12px"
        />
      </PropertyField>

      <PropertyField label="Margin">
        <Input
          value={selected.props.styling?.margin || "0"}
          onChange={(e) => updateProp("styling.margin", e.target.value)}
          placeholder="8px 0"
        />
      </PropertyField>

      {selected.type === "button" && (
        <>
          <PropertyField label="Font Weight">
            <select
              value={selected.props.styling?.fontWeight || "500"}
              onChange={(e) => updateProp("styling.fontWeight", e.target.value)}
              className="w-full rounded border px-2 py-1"
            >
              <option value="300">Light</option>
              <option value="400">Normal</option>
              <option value="500">Medium</option>
              <option value="600">Semi Bold</option>
              <option value="700">Bold</option>
            </select>
          </PropertyField>

          <PropertyField label="Shadow">
            <select
              value={selected.props.styling?.shadow || "none"}
              onChange={(e) => updateProp("styling.shadow", e.target.value)}
              className="w-full rounded border px-2 py-1"
            >
              <option value="none">None</option>
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
            </select>
          </PropertyField>
        </>
      )}

      <PropertyField label="Custom CSS Classes">
        <Input
          value={selected.props.customClasses || ""}
          onChange={(e) => updateProp("customClasses", e.target.value)}
          placeholder="custom-class another-class"
        />
      </PropertyField>
    </PropertySection>
  );

  const renderAdvancedProperties = () => (
    <PropertySection title="Advanced Settings" collapsible>
      <PropertyField label="Field Name" description="Name used in form data">
        <Input
          value={selected.props.fieldName || ""}
          onChange={(e) => updateProp("fieldName", e.target.value)}
          placeholder="Auto-generated from label"
        />
      </PropertyField>

      <PropertyField
        label="API Endpoint"
        description="For dynamic options/validation"
      >
        <Input
          value={selected.props.apiEndpoint || ""}
          onChange={(e) => updateProp("apiEndpoint", e.target.value)}
          placeholder="https://api.example.com/data"
        />
      </PropertyField>

      <PropertyField
        label="Database Field"
        description="Map to database column"
      >
        <Input
          value={selected.props.dbField || ""}
          onChange={(e) => updateProp("dbField", e.target.value)}
          placeholder="user_email, customer_name, etc."
        />
      </PropertyField>

      <div className="space-y-2">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selected.props.encrypted || false}
            onChange={(e) => updateProp("encrypted", e.target.checked)}
          />
          Encrypt Data
        </label>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selected.props.auditLog || false}
            onChange={(e) => updateProp("auditLog", e.target.checked)}
          />
          Audit Changes
        </label>
      </div>

      <PropertyField label="Custom CSS" description="Custom CSS styles">
        <textarea
          className="w-full rounded border px-2 py-1 font-mono text-xs"
          rows={4}
          value={selected.props.customCSS || ""}
          onChange={(e) => updateProp("customCSS", e.target.value)}
          placeholder="border: 2px solid red;&#10;margin: 10px;"
        />
      </PropertyField>
    </PropertySection>
  );

  const renderAccessibilityProperties = () => (
    <PropertySection title="Accessibility" collapsible>
      <PropertyField label="ARIA Label" description="Screen reader label">
        <Input
          value={selected.props.accessibility?.ariaLabel || ""}
          onChange={(e) =>
            updateProp("accessibility.ariaLabel", e.target.value)
          }
          placeholder="Descriptive label for screen readers"
        />
      </PropertyField>

      <PropertyField
        label="ARIA Description"
        description="Additional description"
      >
        <Input
          value={selected.props.accessibility?.ariaDescription || ""}
          onChange={(e) =>
            updateProp("accessibility.ariaDescription", e.target.value)
          }
          placeholder="Additional context for screen readers"
        />
      </PropertyField>

      <PropertyField label="Tab Index" description="Tab order (-1 to skip)">
        <Input
          type="number"
          value={selected.props.accessibility?.tabIndex || 0}
          onChange={(e) =>
            updateProp("accessibility.tabIndex", parseInt(e.target.value))
          }
        />
      </PropertyField>

      <PropertyField label="Keyboard Shortcut" description="Access key">
        <Input
          value={selected.props.accessibility?.accessKey || ""}
          onChange={(e) =>
            updateProp("accessibility.accessKey", e.target.value)
          }
          placeholder="Single character"
          maxLength={1}
        />
      </PropertyField>
    </PropertySection>
  );

  const renderConditionalLogic = () => (
    <PropertySection title="Conditional Logic" collapsible>
      <PropertyField
        label="Show When"
        description="Show this field based on other field values"
      >
        <select
          className="w-full rounded border px-2 py-1 mb-2"
          value={selected.props.conditionalLogic?.showWhen?.type || ""}
          onChange={(e) =>
            updateProp("conditionalLogic.showWhen.type", e.target.value)
          }
        >
          <option value="">Always Show</option>
          <option value="field_equals">When field equals value</option>
          <option value="field_not_equals">
            When field does not equal value
          </option>
          <option value="field_contains">When field contains value</option>
          <option value="field_empty">When field is empty</option>
          <option value="field_not_empty">When field is not empty</option>
          <option value="custom">Custom JavaScript condition</option>
        </select>
      </PropertyField>

      <PropertyField
        label="Hide When"
        description="Hide this field based on conditions"
      >
        <select
          className="w-full rounded border px-2 py-1"
          value={selected.props.conditionalLogic?.hideWhen?.type || ""}
          onChange={(e) =>
            updateProp("conditionalLogic.hideWhen.type", e.target.value)
          }
        >
          <option value="">Never Hide</option>
          <option value="field_equals">When field equals value</option>
          <option value="field_not_equals">
            When field does not equal value
          </option>
          <option value="field_contains">When field contains value</option>
          <option value="field_empty">When field is empty</option>
          <option value="field_not_empty">When field is not empty</option>
          <option value="custom">Custom JavaScript condition</option>
        </select>
      </PropertyField>

      <PropertyField
        label="Required When"
        description="Make field required based on conditions"
      >
        <select
          className="w-full rounded border px-2 py-1"
          value={selected.props.conditionalLogic?.requiredWhen?.type || ""}
          onChange={(e) =>
            updateProp("conditionalLogic.requiredWhen.type", e.target.value)
          }
        >
          <option value="">Use basic required setting</option>
          <option value="field_equals">When field equals value</option>
          <option value="field_not_equals">
            When field does not equal value
          </option>
          <option value="field_contains">When field contains value</option>
          <option value="field_empty">When field is empty</option>
          <option value="field_not_empty">When field is not empty</option>
          <option value="custom">Custom JavaScript condition</option>
        </select>
      </PropertyField>
    </PropertySection>
  );

  // Type-specific properties
  const renderTypeSpecificProperties = () => {
    switch (selected.type) {
      case "text":
      case "textarea":
        return (
          <PropertySection title="Text Properties">
            <PropertyField label="Placeholder Text">
              <Input
                value={selected.props.placeholder || ""}
                onChange={(e) => updateProp("placeholder", e.target.value)}
              />
            </PropertyField>

            <PropertyField label="Default Value">
              <Input
                value={selected.props.defaultValue || ""}
                onChange={(e) => updateProp("defaultValue", e.target.value)}
              />
            </PropertyField>

            {selected.type === "text" && (
              <>
                <PropertyField label="Input Mode">
                  <select
                    value={selected.props.inputMode || "text"}
                    onChange={(e) => updateProp("inputMode", e.target.value)}
                    className="w-full rounded border px-2 py-1"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="tel">Telephone</option>
                    <option value="url">URL</option>
                    <option value="numeric">Numeric</option>
                    <option value="decimal">Decimal</option>
                    <option value="search">Search</option>
                  </select>
                </PropertyField>

                <PropertyField label="Auto Complete">
                  <select
                    value={selected.props.autoComplete || "off"}
                    onChange={(e) => updateProp("autoComplete", e.target.value)}
                    className="w-full rounded border px-2 py-1"
                  >
                    <option value="off">Off</option>
                    <option value="on">On</option>
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="username">Username</option>
                    <option value="current-password">Current Password</option>
                    <option value="new-password">New Password</option>
                    <option value="organization">Organization</option>
                    <option value="street-address">Street Address</option>
                    <option value="postal-code">Postal Code</option>
                    <option value="country">Country</option>
                    <option value="tel">Telephone</option>
                  </select>
                </PropertyField>

                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.props.spellCheck !== false}
                    onChange={(e) => updateProp("spellCheck", e.target.checked)}
                  />
                  Enable Spell Check
                </label>
              </>
            )}

            {selected.type === "textarea" && (
              <>
                <PropertyField label="Rows">
                  <Input
                    type="number"
                    value={selected.props.rows || 4}
                    onChange={(e) =>
                      updateProp("rows", parseInt(e.target.value))
                    }
                    min="1"
                    max="20"
                  />
                </PropertyField>

                <PropertyField label="Resize">
                  <select
                    value={selected.props.resize || "vertical"}
                    onChange={(e) => updateProp("resize", e.target.value)}
                    className="w-full rounded border px-2 py-1"
                  >
                    <option value="none">None</option>
                    <option value="vertical">Vertical</option>
                    <option value="horizontal">Horizontal</option>
                    <option value="both">Both</option>
                  </select>
                </PropertyField>
              </>
            )}

            <PropertyField label="Text Transform">
              <select
                value={selected.props.formatting?.textTransform || "none"}
                onChange={(e) =>
                  updateProp("formatting.textTransform", e.target.value)
                }
                className="w-full rounded border px-2 py-1"
              >
                <option value="none">None</option>
                <option value="uppercase">UPPERCASE</option>
                <option value="lowercase">lowercase</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </PropertyField>
          </PropertySection>
        );

      case "select":
      case "checkbox":
      case "radio":
        return (
          <PropertySection title="Options Management">
            <OptionsManager
              options={selected.props.options || []}
              onUpdate={(newOptions) => updateProp("options", newOptions)}
              addText="Add Option"
            />

            {selected.type === "select" && (
              <>
                <PropertyField label="Placeholder">
                  <Input
                    value={selected.props.placeholder || ""}
                    onChange={(e) => updateProp("placeholder", e.target.value)}
                    placeholder="Select an option..."
                  />
                </PropertyField>

                <div className="space-y-2">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.props.multiple || false}
                      onChange={(e) => updateProp("multiple", e.target.checked)}
                    />
                    Multiple Selection
                  </label>

                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.props.searchable || false}
                      onChange={(e) =>
                        updateProp("searchable", e.target.checked)
                      }
                    />
                    Searchable Dropdown
                  </label>

                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.props.clearable || false}
                      onChange={(e) =>
                        updateProp("clearable", e.target.checked)
                      }
                    />
                    Allow Clear Selection
                  </label>
                </div>
              </>
            )}

            {(selected.type === "checkbox" || selected.type === "radio") && (
              <PropertyField label="Layout">
                <select
                  value={selected.props.layout || "vertical"}
                  onChange={(e) => updateProp("layout", e.target.value)}
                  className="w-full rounded border px-2 py-1"
                >
                  <option value="vertical">Vertical</option>
                  <option value="horizontal">Horizontal</option>
                  <option value="grid">Grid (2 columns)</option>
                  <option value="inline">Inline</option>
                </select>
              </PropertyField>
            )}

            <PropertyField label="Default Selection">
              {selected.type === "radio" ? (
                <select
                  value={selected.props.defaultValue || ""}
                  onChange={(e) => updateProp("defaultValue", e.target.value)}
                  className="w-full rounded border px-2 py-1"
                >
                  <option value="">None selected</option>
                  {(selected.props.options || []).map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-gray-500">
                  Configure default selections in the options above
                </div>
              )}
            </PropertyField>
          </PropertySection>
        );

      case "file":
      case "image":
        return (
          <PropertySection title="File Upload Properties">
            <PropertyField label="Accepted File Types">
              <Input
                value={selected.props.accept || "*"}
                onChange={(e) => updateProp("accept", e.target.value)}
                placeholder={
                  selected.type === "image" ? "image/*" : ".pdf,.doc,.docx"
                }
              />
            </PropertyField>

            <PropertyField label="Maximum File Size">
              <Input
                value={selected.props.maxSize || "10MB"}
                onChange={(e) => updateProp("maxSize", e.target.value)}
                placeholder="10MB"
              />
            </PropertyField>

            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.props.multiple || false}
                  onChange={(e) => updateProp("multiple", e.target.checked)}
                />
                Multiple Files
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.props.dragDrop !== false}
                  onChange={(e) => updateProp("dragDrop", e.target.checked)}
                />
                Drag & Drop
              </label>

              {selected.type === "image" && (
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.props.preview !== false}
                    onChange={(e) => updateProp("preview", e.target.checked)}
                  />
                  Show Image Preview
                </label>
              )}
            </div>

            {selected.type === "image" && (
              <div className="grid grid-cols-2 gap-2">
                <PropertyField label="Max Width (px)">
                  <Input
                    type="number"
                    value={selected.props.maxWidth || ""}
                    onChange={(e) => updateProp("maxWidth", e.target.value)}
                  />
                </PropertyField>
                <PropertyField label="Max Height (px)">
                  <Input
                    type="number"
                    value={selected.props.maxHeight || ""}
                    onChange={(e) => updateProp("maxHeight", e.target.value)}
                  />
                </PropertyField>
              </div>
            )}

            <PropertyField label="Upload Button Text">
              <Input
                value={selected.props.uploadText || ""}
                onChange={(e) => updateProp("uploadText", e.target.value)}
                placeholder="Click to upload or drag files here"
              />
            </PropertyField>
          </PropertySection>
        );

      case "signature":
        return (
          <PropertySection title="Signature Properties">
            <div className="grid grid-cols-2 gap-2">
              <PropertyField label="Canvas Width">
                <Input
                  type="number"
                  value={selected.props.width || 400}
                  onChange={(e) =>
                    updateProp("width", parseInt(e.target.value))
                  }
                  min="200"
                  max="800"
                />
              </PropertyField>
              <PropertyField label="Canvas Height">
                <Input
                  type="number"
                  value={selected.props.height || 200}
                  onChange={(e) =>
                    updateProp("height", parseInt(e.target.value))
                  }
                  min="100"
                  max="400"
                />
              </PropertyField>
            </div>

            <PropertyField label="Pen Color">
              <ColorPicker
                value={selected.props.penColor || "#000000"}
                onChange={(value) => updateProp("penColor", value)}
              />
            </PropertyField>

            <PropertyField label="Pen Width">
              <Input
                type="number"
                value={selected.props.penWidth || 2}
                onChange={(e) =>
                  updateProp("penWidth", parseInt(e.target.value))
                }
                min="1"
                max="10"
              />
            </PropertyField>

            <PropertyField label="Background Color">
              <ColorPicker
                value={selected.props.backgroundColor || "#ffffff"}
                onChange={(value) => updateProp("backgroundColor", value)}
              />
            </PropertyField>
          </PropertySection>
        );

      case "button":
        return (
          <PropertySection title="Button Properties">
            <PropertyField label="Button Text">
              <Input
                value={selected.props.text || "Click Me"}
                onChange={(e) => updateProp("text", e.target.value)}
              />
            </PropertyField>

            <PropertyField label="Button Action">
              <select
                value={selected.props.action || "submit"}
                onChange={(e) => updateProp("action", e.target.value)}
                className="w-full rounded border px-2 py-1"
              >
                <option value="submit">Submit Form</option>
                <option value="reset">Reset Form</option>
                <option value="button">Custom Button</option>
                <option value="link">Navigate to URL</option>
                <option value="download">Download File</option>
                <option value="print">Print Form</option>
                <option value="save_draft">Save as Draft</option>
                <option value="custom">Custom JavaScript</option>
              </select>
            </PropertyField>

            {selected.props.action === "link" && (
              <>
                <PropertyField label="URL">
                  <Input
                    value={selected.props.url || ""}
                    onChange={(e) => updateProp("url", e.target.value)}
                    placeholder="https://example.com"
                  />
                </PropertyField>

                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.props.openInNewTab || false}
                    onChange={(e) =>
                      updateProp("openInNewTab", e.target.checked)
                    }
                  />
                  Open in New Tab
                </label>
              </>
            )}

            <div className="grid grid-cols-2 gap-2">
              <PropertyField label="Button Style">
                <select
                  value={selected.props.style || "primary"}
                  onChange={(e) => updateProp("style", e.target.value)}
                  className="w-full rounded border px-2 py-1"
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="outline">Outline</option>
                  <option value="ghost">Ghost</option>
                  <option value="link">Link Style</option>
                  <option value="destructive">Destructive</option>
                </select>
              </PropertyField>

              <PropertyField label="Size">
                <select
                  value={selected.props.size || "md"}
                  onChange={(e) => updateProp("size", e.target.value)}
                  className="w-full rounded border px-2 py-1"
                >
                  <option value="xs">Extra Small</option>
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                  <option value="xl">Extra Large</option>
                </select>
              </PropertyField>
            </div>

            <PropertyField label="Hover Effect">
              <select
                value={selected.props.hoverEffect || "none"}
                onChange={(e) => updateProp("hoverEffect", e.target.value)}
                className="w-full rounded border px-2 py-1"
              >
                <option value="none">None</option>
                <option value="scale">Scale</option>
                <option value="bounce">Bounce</option>
                <option value="pulse">Pulse</option>
                <option value="glow">Glow</option>
                <option value="lift">Lift (Shadow)</option>
                <option value="rotate">Rotate</option>
              </select>
            </PropertyField>

            <PropertyField label="Icon" description="Optional icon before text">
              <Input
                value={selected.props.icon || ""}
                onChange={(e) => updateProp("icon", e.target.value)}
                placeholder="e.g., download, save, send"
              />
            </PropertyField>

            <PropertyField
              label="Loading Text"
              description="Text shown while processing"
            >
              <Input
                value={selected.props.loadingText || ""}
                onChange={(e) => updateProp("loadingText", e.target.value)}
                placeholder="Processing..."
              />
            </PropertyField>

            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.props.fullWidth || false}
                  onChange={(e) => updateProp("fullWidth", e.target.checked)}
                />
                Full Width
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.props.showLoader || false}
                  onChange={(e) => updateProp("showLoader", e.target.checked)}
                />
                Show Loading Spinner
              </label>
            </div>
          </PropertySection>
        );

      case "section":
        return (
          <PropertySection title="Section Properties">
            <PropertyField label="Section Title">
              <Input
                value={selected.props.title || "Section Title"}
                onChange={(e) => updateProp("title", e.target.value)}
              />
            </PropertyField>

            <PropertyField label="Description">
              <textarea
                value={selected.props.description || ""}
                onChange={(e) => updateProp("description", e.target.value)}
                className="w-full rounded border px-2 py-1"
                rows={3}
                placeholder="Optional section description"
              />
            </PropertyField>

            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.props.collapsible || false}
                  onChange={(e) => updateProp("collapsible", e.target.checked)}
                />
                Collapsible Section
              </label>

              {selected.props.collapsible && (
                <label className="inline-flex items-center gap-2 text-sm ml-6">
                  <input
                    type="checkbox"
                    checked={selected.props.collapsed || false}
                    onChange={(e) => updateProp("collapsed", e.target.checked)}
                  />
                  Start Collapsed
                </label>
              )}

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.props.showBorder || true}
                  onChange={(e) => updateProp("showBorder", e.target.checked)}
                />
                Show Border
              </label>
            </div>

            <PropertyField
              label="Section Icon"
              description="Icon shown next to title"
            >
              <Input
                value={selected.props.icon || ""}
                onChange={(e) => updateProp("icon", e.target.value)}
                placeholder="e.g., info, user, settings"
              />
            </PropertyField>
          </PropertySection>
        );

      case "table":
        return (
          <PropertySection title="Table Properties">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Columns</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addTableColumn(selected.id)}
                >
                  <Plus size={14} />
                </Button>
              </div>
              <div className="space-y-1">
                {(selected.props.columns || []).map((col, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={col}
                      onChange={(e) => {
                        const newColumns = [...selected.props.columns];
                        newColumns[idx] = e.target.value;
                        updateProp("columns", newColumns);
                      }}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTableColumn(selected.id, idx)}
                      className="px-2"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  Rows ({(selected.props.rows || []).length})
                </label>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTableRow(selected.id)}
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                Click "Add Row" to add more rows to the table
              </div>
            </div>

            <PropertyField label="Header Style">
              <select
                value={selected.props.headerStyle || "default"}
                onChange={(e) => updateProp("headerStyle", e.target.value)}
                className="w-full rounded border px-2 py-1"
              >
                <option value="default">Default</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="primary">Primary Color</option>
                <option value="none">No Header</option>
              </select>
            </PropertyField>

            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.props.striped !== false}
                  onChange={(e) => updateProp("striped", e.target.checked)}
                />
                Striped Rows
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.props.bordered !== false}
                  onChange={(e) => updateProp("bordered", e.target.checked)}
                />
                Show Borders
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.props.hoverable || false}
                  onChange={(e) => updateProp("hoverable", e.target.checked)}
                />
                Hover Effects
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.props.sortable || false}
                  onChange={(e) => updateProp("sortable", e.target.checked)}
                />
                Sortable Columns
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.props.editable || false}
                  onChange={(e) => updateProp("editable", e.target.checked)}
                />
                Editable Cells
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.props.responsive || true}
                  onChange={(e) => updateProp("responsive", e.target.checked)}
                />
                Responsive Design
              </label>
            </div>

            <PropertyField label="Table Size">
              <select
                value={selected.props.size || "md"}
                onChange={(e) => updateProp("size", e.target.value)}
                className="w-full rounded border px-2 py-1"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </PropertyField>
          </PropertySection>
        );

      case "number":
        return (
          <PropertySection title="Number Properties">
            <PropertyField label="Placeholder Text">
              <Input
                value={selected.props.placeholder || ""}
                onChange={(e) => updateProp("placeholder", e.target.value)}
                placeholder="Enter a number..."
              />
            </PropertyField>

            <PropertyField label="Default Value">
              <Input
                type="number"
                value={selected.props.defaultValue || ""}
                onChange={(e) => updateProp("defaultValue", e.target.value)}
              />
            </PropertyField>

            <div className="grid grid-cols-3 gap-2">
              <PropertyField label="Min Value">
                <Input
                  type="number"
                  value={selected.props.min || ""}
                  onChange={(e) => updateProp("min", e.target.value)}
                />
              </PropertyField>
              <PropertyField label="Max Value">
                <Input
                  type="number"
                  value={selected.props.max || ""}
                  onChange={(e) => updateProp("max", e.target.value)}
                />
              </PropertyField>
              <PropertyField label="Step">
                <Input
                  type="number"
                  value={selected.props.step || "1"}
                  onChange={(e) => updateProp("step", e.target.value)}
                  step="0.01"
                />
              </PropertyField>
            </div>

            <PropertyField label="Number Format">
              <select
                value={selected.props.format || "decimal"}
                onChange={(e) => updateProp("format", e.target.value)}
                className="w-full rounded border px-2 py-1"
              >
                <option value="decimal">Decimal</option>
                <option value="integer">Integer Only</option>
                <option value="currency">Currency</option>
                <option value="percentage">Percentage</option>
                <option value="scientific">Scientific</option>
              </select>
            </PropertyField>

            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.props.showSpinners !== false}
                  onChange={(e) => updateProp("showSpinners", e.target.checked)}
                />
                Show Spinner Controls
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.props.allowNegative !== false}
                  onChange={(e) =>
                    updateProp("allowNegative", e.target.checked)
                  }
                />
                Allow Negative Numbers
              </label>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.props.thousandSeparator || false}
                  onChange={(e) =>
                    updateProp("thousandSeparator", e.target.checked)
                  }
                />
                Show Thousand Separators
              </label>
            </div>
          </PropertySection>
        );

      case "date":
      case "time":
        return (
          <PropertySection
            title={`${selected.type === "date" ? "Date" : "Time"} Properties`}
          >
            <PropertyField label="Default Value">
              <Input
                type={selected.type}
                value={selected.props.defaultValue || ""}
                onChange={(e) => updateProp("defaultValue", e.target.value)}
              />
            </PropertyField>

            <div className="grid grid-cols-2 gap-2">
              <PropertyField
                label={`Min ${selected.type === "date" ? "Date" : "Time"}`}
              >
                <Input
                  type={selected.type}
                  value={selected.props.min || ""}
                  onChange={(e) => updateProp("min", e.target.value)}
                />
              </PropertyField>
              <PropertyField
                label={`Max ${selected.type === "date" ? "Date" : "Time"}`}
              >
                <Input
                  type={selected.type}
                  value={selected.props.max || ""}
                  onChange={(e) => updateProp("max", e.target.value)}
                />
              </PropertyField>
            </div>

            {selected.type === "date" && (
              <>
                <PropertyField label="Date Format">
                  <select
                    value={selected.props.format || "yyyy-mm-dd"}
                    onChange={(e) => updateProp("format", e.target.value)}
                    className="w-full rounded border px-2 py-1"
                  >
                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                    <option value="dd-mm-yyyy">DD-MM-YYYY</option>
                    <option value="custom">Custom Format</option>
                  </select>
                </PropertyField>

                <div className="space-y-2">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.props.showCalendar !== false}
                      onChange={(e) =>
                        updateProp("showCalendar", e.target.checked)
                      }
                    />
                    Show Calendar Popup
                  </label>

                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.props.highlightWeekends || false}
                      onChange={(e) =>
                        updateProp("highlightWeekends", e.target.checked)
                      }
                    />
                    Highlight Weekends
                  </label>

                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.props.disableWeekends || false}
                      onChange={(e) =>
                        updateProp("disableWeekends", e.target.checked)
                      }
                    />
                    Disable Weekends
                  </label>
                </div>
              </>
            )}

            {selected.type === "time" && (
              <>
                <PropertyField label="Time Format">
                  <select
                    value={selected.props.format || "24h"}
                    onChange={(e) => updateProp("format", e.target.value)}
                    className="w-full rounded border px-2 py-1"
                  >
                    <option value="24h">24 Hour (HH:MM)</option>
                    <option value="12h">12 Hour (HH:MM AM/PM)</option>
                  </select>
                </PropertyField>

                <PropertyField label="Time Step (minutes)">
                  <select
                    value={selected.props.step || "1"}
                    onChange={(e) => updateProp("step", e.target.value)}
                    className="w-full rounded border px-2 py-1"
                  >
                    <option value="1">1 minute</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </PropertyField>
              </>
            )}
          </PropertySection>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {renderBasicProperties()}
      {renderTypeSpecificProperties()}
      {renderValidationProperties()}
      {renderStylingProperties()}
      {renderAccessibilityProperties()}
      {renderAdvancedProperties()}
      {renderConditionalLogic()}
    </div>
  );
};

export default function PermitFormBuilder() {
  const [formName, setFormName] = useState("Permit Application Form");
  const [elements, setElements] = useState<FormElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState<number>(1);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const dragOverIndex = useRef<number | null>(null);
  const [dragMode, setDragMode] = useState<boolean>(false);
  const dragSourceIndex = useRef<number | null>(null);
  const dragOverPosition = useRef<'before' | 'after' | null>(null);

  const filteredElements = useMemo(() => {
    if (!search) return ELEMENTS;
    const q = search.toLowerCase();
    return ELEMENTS.map((c) => ({
      ...c,
      items: c.items.filter((it: any) => it.label.toLowerCase().includes(q)),
    })).filter((c) => c.items.length > 0);
  }, [search]);

  function onDragStartLibrary(e: React.DragEvent, type: ElementType) {
    e.dataTransfer.setData("application/x-wcs-element", type);
    e.dataTransfer.effectAllowed = "copy";
  }

  function onDropAtIndex(e: React.DragEvent, index: number | null) {
    e.preventDefault();
    const type = e.dataTransfer.getData(
      "application/x-wcs-element",
    ) as ElementType;
    if (!type) return;
    const el: FormElement = {
      id: uid(),
      type,
      label: defaultLabelFor(type),
      props: defaultPropsFor(type),
    };
    setElements((prev) => {
      const next = [...prev];
      if (index == null) next.push(el);
      else next.splice(index, 0, el);
      return next;
    });
    setSelectedId(el.id);
  }

  function defaultLabelFor(type: ElementType) {
    switch (type) {
      case "text":
        return "Text Input";
      case "textarea":
        return "Multi-line Text";
      case "select":
        return "Dropdown";
      case "checkbox":
        return "Checkboxes";
      case "radio":
        return "Radio Buttons";
      case "file":
        return "File Upload";
      case "image":
        return "Image Upload";
      case "signature":
        return "Digital Signature";
      case "button":
        return "Button";
      case "section":
        return "Section";
      case "table":
        return "Data Table";
      default:
        return "Field";
    }
  }

  function onDragOver(e: React.DragEvent, index: number | null) {
    e.preventDefault();
    dragOverIndex.current = index;
    try {
      const target = e.currentTarget as HTMLElement | null;
      if (target && index !== null) {
        const rect = target.getBoundingClientRect();
        const halfway = rect.top + rect.height / 2;
        dragOverPosition.current = e.clientY > halfway ? 'after' : 'before';
      } else {
        dragOverPosition.current = null;
      }
    } catch (err) {
      dragOverPosition.current = null;
    }
  }

  function onDropCanvas(e: React.DragEvent) {
    e.preventDefault();
    // If a library element is dropped, handle by onDropAtIndex
    const type = e.dataTransfer.getData("application/x-wcs-element") as ElementType;
    if (type) {
      onDropAtIndex(e, dragOverIndex.current ?? elements.length);
      dragOverIndex.current = null;
      dragOverPosition.current = null;
      return;
    }

    const from = dragSourceIndex.current ?? Number(e.dataTransfer.getData("application/x-wcs-canvas"));
    if (isNaN(from)) return;
    const idx = dragOverIndex.current ?? elements.length;
    // Default to inserting at idx (canvas end) when position unknown
    const insertAfter = dragOverPosition.current === 'after';
    const to = insertAfter ? idx + 1 : idx;
    moveElement(from, to);
    dragSourceIndex.current = null;
    dragOverIndex.current = null;
    dragOverPosition.current = null;
  }

  function moveElement(from: number, to: number) {
    if (from === to) return;
    setElements((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function duplicateElement(id: string) {
    setElements((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const copy = { ...prev[idx], id: uid() };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }

  function removeElement(id: string) {
    setElements((prev) => prev.filter((p) => p.id !== id));
    setSelectedId((s) => (s === id ? null : s));
  }

  function updateElementProp(id: string, propPath: string, value: any) {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id
          ? { ...el, props: { ...el.props, [propPath]: value } }
          : el,
      ),
    );
  }

  function updateElementLabel(id: string, label: string) {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, label } : el)),
    );
  }

  const selected = elements.find((e) => e.id === selectedId) || null;

  // Options management functions
  const addOption = (id: string, propName: string) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id
          ? {
              ...el,
              props: {
                ...el.props,
                [propName]: [
                  ...(el.props[propName] || []),
                  `Option ${(el.props[propName] || []).length + 1}`,
                ],
              },
            }
          : el,
      ),
    );
  };

  const removeOption = (id: string, propName: string, index: number) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id
          ? {
              ...el,
              props: {
                ...el.props,
                [propName]: (el.props[propName] || []).filter(
                  (_, i) => i !== index,
                ),
              },
            }
          : el,
      ),
    );
  };

  const updateOption = (
    id: string,
    propName: string,
    index: number,
    value: string,
  ) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id
          ? {
              ...el,
              props: {
                ...el.props,
                [propName]: (el.props[propName] || []).map((opt, i) =>
                  i === index ? value : opt,
                ),
              },
            }
          : el,
      ),
    );
  };

  // Table management functions
  const addTableColumn = (id: string) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id
          ? {
              ...el,
              props: {
                ...el.props,
                columns: [
                  ...el.props.columns,
                  `Column ${el.props.columns.length + 1}`,
                ],
                rows: el.props.rows.map((row) => [...row, `New Cell`]),
              },
            }
          : el,
      ),
    );
  };

  const addTableRow = (id: string) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id
          ? {
              ...el,
              props: {
                ...el.props,
                rows: [
                  ...el.props.rows,
                  new Array(el.props.columns.length).fill(`New Cell`),
                ],
              },
            }
          : el,
      ),
    );
  };

  const removeTableColumn = (id: string, colIndex: number) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id
          ? {
              ...el,
              props: {
                ...el.props,
                columns: el.props.columns.filter((_, i) => i !== colIndex),
                rows: el.props.rows.map((row) =>
                  row.filter((_, i) => i !== colIndex),
                ),
              },
            }
          : el,
      ),
    );
  };

  const removeTableRow = (id: string, rowIndex: number) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id
          ? {
              ...el,
              props: {
                ...el.props,
                rows: el.props.rows.filter((_, i) => i !== rowIndex),
              },
            }
          : el,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      {/* header removed per request */}

  <div className="mx-auto max-w-[1800px] grid grid-cols-1 lg:grid-cols-12 gap-y-4 gap-x-8">
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative z-10 w-[90%] max-w-4xl bg-white rounded shadow-lg p-6 overflow-auto" style={{ maxHeight: '90vh' }}>
              <div className="flex items-center justify-end mb-4">
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>Close</Button>
              </div>
              <div className="mt-4 space-y-4">
                {elements.map((el) => (
                  <div key={el.id} className="py-2">
                    <div>{renderModalPreview(el)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
  {/* Left */}
  <aside className="col-span-12 lg:col-span-3 px-2">
    <Card className="h-auto lg:h-[calc(100vh-220px)] overflow-auto">
            <CardHeader>
              <CardTitle className="text-base">Form Elements</CardTitle>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  placeholder="Search elements..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredElements.map((cat: any) => (
                <div key={cat.category} className="mb-4">
                  <div className="text-sm font-semibold text-slate-700 mb-2">
                    {cat.category}
                  </div>
                  <div className="space-y-2">
                    {cat.items.map((it: any) => (
                      <div
                        key={it.label}
                        draggable
                        onDragStart={(e) => onDragStartLibrary(e, it.type)}
                        className="flex items-center justify-between rounded border border-dashed p-2 hover:border-blue-300 hover:bg-white cursor-grab"
                      >
                        <div>
                          <div className="text-sm font-medium">{it.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {it.tooltip}
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">⋮⋮</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

  {/* Canvas */}
  <section className="col-span-12 lg:col-span-6 px-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" />{" "}
                <span className="text-sm">Form Preview</span>
              </label>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                  Zoom: {" "}
                  <select
                    className="rounded border px-2 py-1 text-sm"
                    value={String(zoom)}
                    onChange={(e) => setZoom(Number(e.target.value))}
                  >
                    <option value="1">100%</option>
                    <option value="0.75">75%</option>
                    <option value="0.5">50%</option>
                    <option value="0.25">25%</option>
                  </select>
                  <Button variant={dragMode ? "default" : "ghost"} size="sm" onClick={() => setDragMode(d => !d)}>
                    Drag
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                    Preview Form
                  </Button>
                  <Button variant="default" size="sm">
                    Save Template
                  </Button>
                </div>
            </div>
            {/* Removed Show Grid checkbox and Eye button as requested */}
          </div>

          <div className="overflow-hidden">
            <div className="w-full">
              <div className="max-w-[900px] w-full mxF-auto">
                <div
                  onDragOver={(e) => onDragOver(e, elements.length)}
                  onDrop={onDropCanvas}
                  className="min-h-[600px] rounded border bg-white p-6 shadow-sm relative"
                  style={{ transformOrigin: '0 0', transform: `scale(${zoom})` }}
                >
            {elements.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
                <div className="text-2xl font-semibold mb-2">
                  Drag elements from the left panel to start building your form
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    Use Template
                  </Button>
                  <Button variant="outline" size="sm">
                    Import Existing Form
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 border rounded bg-slate-50">
                  <div className="text-2xl font-bold">{formName}</div>
                </div>

                {elements.map((el, idx) => {
                  const styleObj = {
                    wrapper: { width: el.props.width || "100%" },
                    element: {},
                  } as any;
                  return (
                    <div
                      key={el.id}
                      draggable={dragMode}
                      onDragStart={(e) => {
                        if (!dragMode) return;
                        dragSourceIndex.current = idx;
                        try {
                          e.dataTransfer.setData("application/x-wcs-canvas", String(idx));
                        } catch (err) {
                          // ignore
                        }
                        e.dataTransfer.effectAllowed = "move";
                        try { document.body.style.cursor = 'grabbing'; } catch (err) {}
                      }}
                      onDragEnd={() => {
                        dragSourceIndex.current = null;
                        dragOverIndex.current = null;
                        dragOverPosition.current = null;
                        try { document.body.style.cursor = ''; } catch (err) {}
                      }}
                      onDragOver={(e) => onDragOver(e, idx)}
                      onDragLeave={() => {
                        dragOverIndex.current = null;
                        dragOverPosition.current = null;
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const from = dragSourceIndex.current ?? Number(e.dataTransfer.getData("application/x-wcs-canvas"));
                        if (isNaN(from)) return;
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        const insertAfter = e.clientY > rect.top + rect.height / 2;
                        const to = insertAfter ? idx + 1 : idx;
                        moveElement(from, to);
                        dragSourceIndex.current = null;
                        dragOverIndex.current = null;
                        dragOverPosition.current = null;
                      }}
                      className={`relative rounded border p-4 bg-white ${selectedId === el.id ? "ring-2 ring-blue-500" : ""} ${dragMode ? 'cursor-grab' : ''}`}
                      style={styleObj.wrapper}
                      onClick={() => setSelectedId(el.id)}
                    >
                      {dragOverIndex.current === idx && dragOverPosition.current === 'before' && (
                        <div className="absolute left-0 right-0 top-0 h-0.5 bg-blue-400" />
                      )}
                      <div className="absolute left-3 top-3 text-slate-400">
                        ⋮⋮
                      </div>
                      {dragOverIndex.current === idx && dragOverPosition.current === 'after' && (
                        <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-400" />
                      )}
                      <div className="absolute right-3 top-3 flex gap-2">
                        <button
                          title="Duplicate"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateElement(el.id);
                          }}
                          className="p-1 rounded hover:bg-slate-100"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeElement(el.id);
                          }}
                          className="p-1 rounded hover:bg-slate-100"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          title="Settings"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(el.id);
                          }}
                          className="p-1 rounded hover:bg-slate-100"
                        >
                          <Settings size={14} />
                        </button>
                      </div>
                      <div className="font-medium">{prettyLabelForType(el)}</div>
                        <div className="text-sm text-slate-500 mt-2">
                        {renderPreview(el, { updateElementProp })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
                </div>
              </div>
            </div>
          </div>
        </section>

  {/* Right Properties Panel */}
  <aside className="col-span-12 lg:col-span-3 px-0">
    <Card className="h-auto lg:h-[calc(100vh-220px)] overflow-auto">
            <CardHeader>
              <CardTitle className="text-base">
                {selected ? `${selected.label} Properties` : "Form Properties"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selected ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Form Name</label>
                    <Input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>
                  <PropertySection title="Form Settings">
                    <PropertyField label="Form Description">
                      <textarea
                        className="w-full rounded border px-2 py-1"
                        rows={3}
                        placeholder="Describe the purpose of this form..."
                      />
                    </PropertyField>
                    <div className="flex gap-4">
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input type="checkbox" />
                        Enable Auto-save
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input type="checkbox" />
                        Show Progress Bar
                      </label>
                    </div>
                  </PropertySection>
                </div>
              ) : (
                <EnhancedPropertiesPanel
                  selected={selected}
                  updateElementProp={updateElementProp}
                  updateElementLabel={updateElementLabel}
                  addOption={addOption}
                  removeOption={removeOption}
                  updateOption={updateOption}
                  addTableColumn={addTableColumn}
                  addTableRow={addTableRow}
                  removeTableColumn={removeTableColumn}
                  removeTableRow={removeTableRow}
                />
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function renderPreview(el: FormElement, handlers?: { updateElementProp?: (id: string, propPath: string, value: any) => void }) {
  const getHoverEffectClass = (effect) => {
    switch (effect) {
      case "scale":
        return "hover:scale-105 transition-transform";
      case "bounce":
        return "hover:animate-bounce";
      case "pulse":
        return "hover:animate-pulse";
      case "glow":
        return "hover:shadow-lg hover:shadow-blue-300/50 transition-shadow";
      default:
        return "";
    }
  };

  const wrapperClass = `${getHoverEffectClass(el.props.hoverEffect)} ${el.props.disabled ? 'opacity-50 pointer-events-none' : ''}`;
  const isDisabled = !!el.props.disabled;
  const isReadOnly = !!el.props.readonly;
  const isRequired = !!el.props.required;

  const value = el.props._value ?? el.props.defaultValue ?? "";

  const getValidationMessages = (): string[] => {
    const msgs: string[] = [];
    const v = el.props.validation || {};
    if (typeof value === 'string') {
      if (v.minLength && value.length < Number(v.minLength)) msgs.push(`Minimum length ${v.minLength}`);
      if (v.maxLength && value.length > Number(v.maxLength)) msgs.push(`Maximum length ${v.maxLength}`);
      if (v.pattern) {
        try {
          const re = new RegExp(v.pattern);
          if (value && !re.test(value)) msgs.push(v.customMessage || `Value does not match pattern`);
        } catch (err) {
          // invalid regex - ignore
        }
      }
    }
    if ((el.type === 'select' || el.type === 'checkbox') && Array.isArray(value)) {
      const count = value.length;
      if (v.minSelected && count < Number(v.minSelected)) msgs.push(`Select at least ${v.minSelected} options`);
      if (v.maxSelected && count > Number(v.maxSelected)) msgs.push(`Select at most ${v.maxSelected} options`);
    }
    return msgs;
  };

  const renderHelper = () => (
    <>
      {el.props.helperText && <div className="text-xs text-gray-500 mt-1">{el.props.helperText}</div>}
      {getValidationMessages().length > 0 && (
        <div className="mt-1 text-xs text-red-600">{getValidationMessages().join('; ')}</div>
      )}
    </>
  );

  switch (el.type) {
    case "text":
      return (
        <div className={wrapperClass}>
          <div className="flex items-center gap-2">
            <input
              className="w-full rounded border px-2 py-1"
              placeholder={el.props.placeholder || ""}
              value={value}
              minLength={el.props.validation?.minLength || undefined}
              maxLength={el.props.validation?.maxLength || undefined}
              pattern={el.props.validation?.pattern || undefined}
              inputMode={el.props.inputMode || undefined}
              autoComplete={el.props.autoComplete || undefined}
              spellCheck={el.props.spellCheck !== false}
              disabled={isDisabled}
              readOnly={isReadOnly}
              required={isRequired}
              onChange={(e) => handlers?.updateElementProp?.(el.id, "_value", e.target.value)}
              style={{
                textTransform: el.props.formatting?.textTransform || undefined,
                backgroundColor: el.props.styling?.backgroundColor || undefined,
                color: el.props.styling?.textColor || undefined,
              }}
            />
            <button
              className="text-sm text-red-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlers?.updateElementProp?.(el.id, "_value", null);
              }}
              disabled={isDisabled}
            >
              Clear
            </button>
          </div>
          {renderHelper()}
        </div>
      );

    case "textarea":
      return (
        <div className={wrapperClass}>
          <div className="flex items-start gap-2">
            <textarea
              className="w-full rounded border px-2 py-1"
              rows={el.props.rows || 4}
              value={value}
              minLength={el.props.validation?.minLength || undefined}
              maxLength={el.props.validation?.maxLength || undefined}
              onChange={(e) => handlers?.updateElementProp?.(el.id, "_value", e.target.value)}
              spellCheck={el.props.spellCheck !== false}
              disabled={isDisabled}
              readOnly={isReadOnly}
              required={isRequired}
              style={{
                resize: el.props.resize || undefined,
                textTransform: el.props.formatting?.textTransform || undefined,
                backgroundColor: el.props.styling?.backgroundColor || undefined,
                color: el.props.styling?.textColor || undefined,
              }}
            />
            <button
              className="text-sm text-red-600 hover:underline self-start"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlers?.updateElementProp?.(el.id, "_value", null);
              }}
              disabled={isDisabled}
            >
              Clear
            </button>
          </div>
          {renderHelper()}
        </div>
      );

    case "number":
      return (
        <div className={wrapperClass}>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="w-full rounded border px-2 py-1"
              placeholder={el.props.placeholder || ""}
              value={value}
              onChange={(e) => handlers?.updateElementProp?.(el.id, "_value", e.target.value)}
              inputMode={el.props.inputMode || undefined}
              autoComplete={el.props.autoComplete || undefined}
              disabled={isDisabled}
              readOnly={isReadOnly}
              required={isRequired}
              style={{
                textTransform: el.props.formatting?.textTransform || undefined,
                backgroundColor: el.props.styling?.backgroundColor || undefined,
                color: el.props.styling?.textColor || undefined,
              }}
              min={el.props.min !== undefined && el.props.min !== null && el.props.min !== "" ? Number(el.props.min) : undefined}
              max={el.props.max !== undefined && el.props.max !== null && el.props.max !== "" ? Number(el.props.max) : undefined}
              step={el.props.step ? Number(el.props.step) : undefined}
            />
            <button
              className="text-sm text-red-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlers?.updateElementProp?.(el.id, "_value", null);
              }}
              disabled={isDisabled}
            >
              Clear
            </button>
          </div>
          {renderHelper()}
        </div>
      );

    case "date":
      return (
        <div className={wrapperClass}>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="w-full rounded border px-2 py-1"
              value={value}
              onChange={(e) => {
                handlers?.updateElementProp?.(el.id, "_value", e.target.value);
              }}
              min={el.props.min || undefined}
              max={el.props.max || undefined}
              disabled={isDisabled}
              readOnly={isReadOnly}
              required={isRequired}
            />
            <button
              className="text-sm text-red-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlers?.updateElementProp?.(el.id, "_value", null);
              }}
              disabled={isDisabled}
            >
              Clear
            </button>
          </div>
          {renderHelper()}
        </div>
      );

    case "time":
      return (
        <div className={wrapperClass}>
          <div className="flex items-center gap-2">
            <input
              type="time"
              className="w-full rounded border px-2 py-1"
              value={value}
              onChange={(e) => {
                handlers?.updateElementProp?.(el.id, "_value", e.target.value);
              }}
              min={el.props.min || undefined}
              max={el.props.max || undefined}
              step={60}
              disabled={isDisabled}
              readOnly={isReadOnly}
              required={isRequired}
            />
            <button
              className="text-sm text-red-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlers?.updateElementProp?.(el.id, "_value", null);
              }}
              disabled={isDisabled}
            >
              Clear
            </button>
          </div>
          {renderHelper()}
        </div>
      );

    case "select":
      return (
        <div className={wrapperClass}>
          <div className="flex items-center gap-2">
            <select
              className="w-full rounded border px-2 py-1"
              value={el.props._value ?? el.props.defaultValue ?? (el.props.multiple ? [] : "")}
              multiple={!!el.props.multiple}
              disabled={isDisabled}
              required={isRequired}
              onChange={(e) => {
                if (el.props.multiple) {
                  const vals = Array.from((e.target as HTMLSelectElement).selectedOptions).map((o) => o.value);
                  handlers?.updateElementProp?.(el.id, "_value", vals);
                } else {
                  handlers?.updateElementProp?.(el.id, "_value", (e.target as HTMLSelectElement).value);
                }
              }}
            >
              {(el.props.options || []).map((o: string, i: number) => (
                <option key={i} value={o}>{o}</option>
              ))}
            </select>
            <button
              className="text-sm text-red-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlers?.updateElementProp?.(el.id, "_value", el.props.multiple ? [] : null);
              }}
              disabled={isDisabled}
            >
              Clear
            </button>
          </div>
          {renderHelper()}
        </div>
      );

    case "checkbox":
      return (
        <div>
          <div className="space-y-2">
            {(el.props.options || []).map((option: string, i: number) => {
              const selected: string[] = el.props._value || [];
              const checked = selected.includes(option);
              return (
                <label key={i} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={isDisabled}
                    onChange={(e) => {
                      const next = new Set(selected);
                      if ((e.target as HTMLInputElement).checked) next.add(option); else next.delete(option);
                      handlers?.updateElementProp?.(el.id, "_value", Array.from(next));
                    }}
                  />
                  {option}
                </label>
              );
            })}
          </div>
          <div className="mt-1">
            <button
              className="text-sm text-red-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlers?.updateElementProp?.(el.id, "_value", []);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      );

    case "radio":
      return (
        <div>
          <div className="space-y-2">
            {(el.props.options || []).map((option: string, i: number) => (
              <label key={i} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`radio-${el.id}`}
                  checked={el.props._value === option}
                  disabled={isDisabled}
                  onChange={() => handlers?.updateElementProp?.(el.id, "_value", option)}
                />
                {option}
              </label>
            ))}
          </div>
          <div className="mt-1">
            <button
              className="text-sm text-red-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlers?.updateElementProp?.(el.id, "_value", null);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      );

    case "file":
      // Add a hidden file input and wrap the UI in a label so clicking opens the file picker
  const fileInputId = `file-input-${el.id}`;
  const fileUploaded: File[] = el.props._uploadedFiles || [];

      return (
        <>
          <input
            id={fileInputId}
            type="file"
            accept={el.props.accept || undefined}
            multiple={!!el.props.multiple}
            className="hidden"
            disabled={isDisabled}
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              const isImage = (f: File) => f.type?.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(f.name);
              // For 'file' elements, reject images
              const valid = files.filter((f) => !isImage(f));
              const maxFiles = el.props.validation?.maxFiles ? Number(el.props.validation.maxFiles) : undefined;
              const allowed = el.props.validation?.allowedTypes ? String(el.props.validation.allowedTypes).split(',').map(s => s.trim()) : null;
              let filtered = valid;
              if (allowed) {
                filtered = filtered.filter(f => allowed.some(a => f.type.includes(a) || f.name.endsWith(a)));
              }
              if (maxFiles !== undefined && (fileUploaded.length + filtered.length) > maxFiles) {
                // limit to remaining
                const remainingSlots = Math.max(0, maxFiles - fileUploaded.length);
                filtered = filtered.slice(0, remainingSlots);
              }
              if (filtered.length === 0) {
                // eslint-disable-next-line no-console
                console.warn("No valid non-image files selected for file element", el.id);
                return;
              }
              const updated = [...fileUploaded, ...filtered];
              handlers?.updateElementProp?.(el.id, "_uploadedFiles", updated);
            }}
          />

          <label htmlFor={fileInputId} className={`block cursor-pointer ${isDisabled ? 'pointer-events-none' : ''}`}>
            <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
              <Upload className="mx-auto mb-2 text-gray-400" size={24} />
              <div className="text-sm text-gray-600">Click to upload or drag files here</div>
              <div className="text-xs text-gray-500 mt-1">
                Max size: {el.props.maxSize || "10MB"} • Types: {el.props.accept || "*"}
                {el.props.multiple && " • Multiple files allowed"}
              </div>
            </div>
          </label>

          <div className="mt-2">
            <button
              className="text-sm text-red-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlers?.updateElementProp?.(el.id, "_uploadedFiles", []);
              }}
              disabled={isDisabled}
            >
              Clear
            </button>
          </div>

          {fileUploaded.length > 0 && (
            <div className="mt-2 space-y-2 text-left">
              {fileUploaded.map((f, i) => (
                <div key={i} className="flex items-center justify-between gap-2 border rounded px-2 py-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">{f.name}</div>
                    <div className="text-xs text-gray-500">{Math.round(f.size / 1024)} KB</div>
                  </div>
                  <div>
                    <button
                      className="text-xs text-red-600 hover:underline"
                      onClick={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        const remaining = fileUploaded.filter((_, idx) => idx !== i);
                        handlers?.updateElementProp?.(el.id, "_uploadedFiles", remaining);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      );

    case "image": {
      const imageInputId = `image-input-${el.id}`;
      const imageUploaded: File[] = el.props._uploadedFiles || [];

        return (
          <div className={wrapperClass}>
            <input
            id={imageInputId}
            type="file"
            accept={el.props.accept || "image/*"}
            multiple={!!el.props.multiple}
            className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                const isImage = (f: File) => f.type?.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(f.name);
                let valid = files.filter((f) => isImage(f));
                const maxFiles = el.props.validation?.maxFiles ? Number(el.props.validation.maxFiles) : undefined;
                const allowed = el.props.validation?.allowedTypes ? String(el.props.validation.allowedTypes).split(',').map(s => s.trim()) : null;
                if (allowed) valid = valid.filter(f => allowed.some(a => f.type.includes(a) || f.name.endsWith(a)));
                if (maxFiles !== undefined && (imageUploaded.length + valid.length) > maxFiles) {
                  const remaining = Math.max(0, maxFiles - imageUploaded.length);
                  valid = valid.slice(0, remaining);
                }
                if (valid.length === 0) {
                  // eslint-disable-next-line no-console
                  console.warn("No valid image files selected for image element", el.id);
                  return;
                }
                const updated = [...imageUploaded, ...valid];
                handlers?.updateElementProp?.(el.id, "_uploadedFiles", updated);
              }}
          />

            <label htmlFor={imageInputId} className={`block cursor-pointer ${isDisabled ? 'pointer-events-none' : ''}`}>
              <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded flex items-center justify-center">
                <Upload className="text-gray-400" size={20} />
              </div>
              <div className="text-sm text-gray-600">Click to upload or drag images here</div>
              <div className="text-xs text-gray-500 mt-1">
                Max size: {el.props.maxSize || "5MB"}
                {el.props.multiple && " • Multiple images allowed"}
              </div>
            </div>
          </label>

            <div className="mt-2">
              <button
                className="text-sm text-red-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlers?.updateElementProp?.(el.id, "_uploadedFiles", []);
              }}
            >
              Clear
            </button>
          </div>

              {imageUploaded.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {imageUploaded.map((f, i) => {
                    const url = URL.createObjectURL(f);
                    return (
                      <div key={i} className="border rounded overflow-hidden">
                    <img src={url} alt={f.name} className="w-full h-24 object-cover" />
                    <div className="flex items-center justify-between p-2">
                      <div className="text-xs truncate">{f.name}</div>
                      <button
                        className="text-xs text-red-600"
                        onClick={(ev) => {
                          ev.preventDefault();
                          ev.stopPropagation();
                          const remaining = imageUploaded.filter((_, idx) => idx !== i);
                          handlers?.updateElementProp?.(el.id, "_uploadedFiles", remaining);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
                  })}
                </div>
              )}
            {renderHelper()}
          </div>
        );
      }

    case "signature":
      return (
        <div className={wrapperClass}>
          <SignatureCanvas
            width={el.props.width || 400}
            height={el.props.height || 200}
            penColor={el.props.penColor || "#000000"}
            onSave={(dataUrl) => {
              handlers?.updateElementProp?.(el.id, "_signature", dataUrl);
            }}
            onSignatureChange={(dataUrl) => {
              // optional: live preview while drawing
              handlers?.updateElementProp?.(el.id, "_currentSignaturePreview", dataUrl);
            }}
          />

          <div className="mt-2 flex items-center gap-2">
            <input
              id={`signature-upload-${el.id}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const isImage = file.type?.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name);
                if (!isImage) {
                  // eslint-disable-next-line no-console
                  console.warn('Selected file is not an image for signature upload', file.name);
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  const result = reader.result as string | null;
                  handlers?.updateElementProp?.(el.id, "_signature", result);
                  handlers?.updateElementProp?.(el.id, "_currentSignaturePreview", result);
                };
                reader.readAsDataURL(file);
              }}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const elInput = document.getElementById(`signature-upload-${el.id}`) as HTMLInputElement | null;
                elInput?.click();
              }}
            >
              Upload Signature
            </Button>
          </div>

          {el.props._signature && (
            <div className="mt-3">
              <div className="text-xs text-gray-600 mb-2">Saved signature</div>
              <div className="flex items-center gap-2">
                <img src={el.props._signature} alt="signature" className="h-24 border rounded" />
                <div>
                  <button
                    className="text-xs text-red-600 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlers?.updateElementProp?.(el.id, "_signature", null);
                      handlers?.updateElementProp?.(el.id, "_currentSignaturePreview", null);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );

    case "button":
      const buttonVariantClass =
        {
          primary: "bg-blue-600 text-white hover:bg-blue-700",
          secondary: "bg-gray-600 text-white hover:bg-gray-700",
          outline:
            "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
          ghost: "text-gray-700 hover:bg-gray-100",
        }[el.props.style || "primary"] ||
        "bg-blue-600 text-white hover:bg-blue-700";

      return (
        <div className={wrapperClass}>
          <button
            className={`px-4 py-2 rounded font-medium transition-all ${buttonVariantClass}`}
            disabled={isDisabled}
          >
            {el.props.text || "Click Me"}
          </button>
          {renderHelper()}
        </div>
      );
      

    case "section":
      return (
        <div className={`${wrapperClass} border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r`}>
          <h3 className="text-lg font-semibold text-blue-900">
            {el.props.title || "Section Title"}
          </h3>
          {el.props.description && (
            <p className="text-sm text-blue-700 mt-1">{el.props.description}</p>
          )}
        </div>
      );

    case "table":
      return (
        <div className={wrapperClass + ' overflow-x-auto'}>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                {(el.props.columns || []).map((col: string, i: number) => (
                  <th
                    key={i}
                    className="border border-gray-300 px-2 py-1 text-left text-sm font-medium"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(el.props.rows || []).map((row: string[], i: number) => (
                <tr key={i}>
                  {row.map((cell: string, j: number) => (
                    <td
                      key={j}
                      className="border border-gray-300 px-2 py-1 text-sm"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

function prettyLabelForType(el: FormElement) {
  if (el.label && el.label.trim() && el.label.trim().toLowerCase() !== 'field') return el.label;
  switch (el.type) {
    case 'date':
      return 'Date';
    case 'time':
      return 'Time';
    case 'text':
      return 'Text';
    case 'number':
      return 'Number';
    case 'textarea':
      return 'Textarea';
    case 'select':
      return 'Select';
    case 'checkbox':
      return 'Checkboxes';
    case 'radio':
      return 'Radio';
    case 'image':
      return 'Image';
    case 'file':
      return 'File';
    case 'signature':
      return 'Signature';
    default:
      return el.label || 'Field';
  }
}

function renderModalPreview(el: FormElement) {
  // Render only the stored value for each element type (plain display)
  const val = el.props._value ?? el.props.defaultValue ?? null;
  switch (el.type) {
    case 'text':
    case 'textarea':
    case 'number':
    case 'select':
    case 'date':
    case 'time':
      return <div className="text-sm text-slate-800">{val ?? ''}</div>;
    case 'checkbox':
      return <div className="text-sm text-slate-800">{(val || []).join(', ')}</div>;
    case 'radio':
      return <div className="text-sm text-slate-800">{val ?? ''}</div>;
    case 'image':
      {
        const uploaded: any[] = el.props._uploadedFiles || [];
        if (uploaded.length === 0) return null;
        return (
          <div className="grid grid-cols-3 gap-2">
            {uploaded.map((f: any, i: number) => (
              <img key={i} src={typeof f === 'string' ? f : URL.createObjectURL(f)} alt={f.name || f} className="w-full h-24 object-cover" />
            ))}
          </div>
        );
      }
    case 'file':
      {
        const files: any[] = el.props._uploadedFiles || [];
        return <div className="text-sm text-slate-800">{files.map((f) => f.name || f).join(', ')}</div>;
      }
    case 'signature':
      return el.props._signature ? <img src={el.props._signature} alt="signature" className="h-24" /> : null;
    default:
      return null;
  }
}
