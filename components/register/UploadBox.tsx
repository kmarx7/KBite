"use client";

import { useRef, useState } from "react";
import { IconUpload, IconX } from "@tabler/icons-react";

interface UploadBoxProps {
  label: string;
  accept?: string;
  value: File | null;
  onChange: (file: File | null) => void;
}

/* 선택한 파일을 미리보기로만 보관 — 실제 업로드는 Supabase Storage 연동(작업 2) 시 처리 */
export default function UploadBox({
  label,
  accept = "image/*",
  value,
  onChange,
}: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = (file: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(
      file && file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    );
    onChange(file);
  };

  return (
    <div className="min-w-0">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      {value ? (
        <div className="relative overflow-hidden rounded-2xl border border-[#FFD4B8] bg-white">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt=""
              className="h-32 w-full object-cover"
            />
          ) : (
            <p className="truncate p-3 text-[12px] font-semibold text-[#1A0800]">
              {value.name}
            </p>
          )}
          <button
            type="button"
            onClick={() => handleFile(null)}
            aria-label="Remove file"
            className="absolute end-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50"
          >
            <IconX size={13} color="#FFFFFF" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#FFD4B8] bg-white text-[#B07040]"
        >
          <IconUpload size={18} color="#FF6B35" />
          <span className="text-[11px] font-bold">{label}</span>
        </button>
      )}
    </div>
  );
}
