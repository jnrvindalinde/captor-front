"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  name: string;
  /** MIME types or extensions, e.g. "image/*", "application/pdf,.pdf", "video/*" */
  accept: string;
  /** Button text — e.g. "Choose image", "Choose document". Defaults to "Choose file". */
  buttonLabel?: string;
  /** Current filename to display (e.g. an existing uploaded asset). */
  currentName?: string | null;
  /** Optional size in bytes of the existing/current file. */
  currentSize?: number | null;
  onSelect?: (file: File) => void;
  onClear?: () => void;
  disabled?: boolean;
  required?: boolean;
};

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n >= 10 || i === 0 ? n.toFixed(0) : n.toFixed(1)} ${units[i]}`;
}

function basename(p: string): string {
  return p.split("?")[0].split("#")[0].split("/").pop() ?? p;
}

export function FilePicker({
  name,
  accept,
  buttonLabel = "Choose file",
  currentName,
  currentSize,
  onSelect,
  onClear,
  disabled,
  required,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selected, setSelected] = useState<{ name: string; size: number } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset transient selection when current source changes externally
    setSelected(null);
  }, [currentName]);

  const display = selected
    ? { name: selected.name, size: selected.size }
    : currentName
      ? { name: basename(currentName), size: currentSize ?? 0 }
      : null;

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setSelected({ name: f.name, size: f.size });
    onSelect?.(f);
  }

  function clear() {
    setSelected(null);
    if (inputRef.current) inputRef.current.value = "";
    onClear?.();
  }

  return (
    <div className="file-picker" data-has-file={display ? "true" : "false"}>
      <div className="file-picker__row">
        <label className={`file-picker__btn${disabled ? " is-disabled" : ""}`}>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              fill="currentColor"
              d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"
            />
          </svg>
          <span>{selected || currentName ? "Replace file" : buttonLabel}</span>
          <input
            ref={inputRef}
            type="file"
            name={name}
            accept={accept}
            onChange={onChange}
            disabled={disabled}
            required={required && !currentName}
          />
        </label>

        {display && (
          <button
            type="button"
            className="file-picker__clear"
            onClick={clear}
            disabled={disabled}
            aria-label="Remove selected file"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path fill="currentColor" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        )}
      </div>

      {display && (
        <div className="file-picker__meta">
          <span className="file-picker__name" title={display.name}>{display.name}</span>
          {display.size > 0 && (
            <span className="file-picker__size">{formatBytes(display.size)}</span>
          )}
        </div>
      )}
    </div>
  );
}
