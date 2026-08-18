"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Upload, X, Check, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label = "Photo du produit",
  accept = "image/*,.ico,image/x-icon,image/vnd.microsoft.icon",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = async (file: File) => {
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        onChange(data.url);
      } else {
        alert(data.error || "Erreur de téléversement");
      }
    } catch {
      alert("Erreur de connexion lors du téléversement");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-800">{label}</label>

      {value ? (
        <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-primary-500 bg-slate-100 group shadow-sm flex items-center justify-center p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="max-w-full max-h-full object-contain" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors shadow-md"
            title="Supprimer la photo"
          >
            <X size={16} />
          </button>
          <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 text-primary-400 text-[10px] font-bold py-1 text-center rounded-lg backdrop-blur-xs">
            Icône téléversée ✓
          </div>
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files?.[0]) {
              handleFileChange(e.dataTransfer.files[0]);
            }
          }}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            dragActive
              ? "border-primary-600 bg-primary-50"
              : "border-slate-300 hover:border-primary-500 bg-slate-50 hover:bg-white"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-primary-600">
              <Loader2 size={28} className="animate-spin" />
              <span className="text-xs font-bold">Téléversement en cours…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-500 text-center">
              <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 border border-primary-200 flex items-center justify-center">
                <Upload size={20} />
              </div>
              <span className="text-xs font-bold text-slate-800">
                Cliquez pour téléverser une icône / image
              </span>
              <span className="text-[10px] text-slate-400">
                Format ICO, PNG, JPG, WEBP, SVG jusqu&apos;à 10 Mo
              </span>
            </div>
          )}

          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
            }}
          />
        </label>
      )}
    </div>
  );
}
