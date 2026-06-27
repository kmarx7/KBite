"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { IconUpload, IconX } from "@tabler/icons-react";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_MB,
  validateFile,
} from "@/lib/validation/register";

interface UploadBoxProps {
  label: string;
  accept?: string;
  /** 허용 MIME 타입 화이트리스트 — 기본은 이미지만 */
  allowedTypes?: string[];
  value: File | null;
  onChange: (file: File | null) => void;
}

/* 선택한 파일을 미리보기로만 보관 — 실제 업로드는 Supabase Storage 연동(작업 2) 시 처리.
   크기·타입 제한은 서버 측에서도 동일하게 검증해야 한다 (클라이언트 검증은 UX용) */
export default function UploadBox({
  label,
  accept = "image/*",
  allowedTypes = ALLOWED_IMAGE_TYPES,
  value,
  onChange,
}: UploadBoxProps) {
  const t = useTranslations("common");
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const handleFile = (file: File | null) => {
    if (file) {
      const error = validateFile(file, allowedTypes);
      if (error) {
        setErrorKey(error);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
    }
    setErrorKey(null);
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
        className="sr-only"
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
      {errorKey && (
        <p className="mt-1 text-[11px] font-bold text-[#B91C1C]">
          {t(errorKey, { size: MAX_UPLOAD_MB })}
        </p>
      )}
    </div>
  );
}
