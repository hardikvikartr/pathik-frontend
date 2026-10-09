"use client";

import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1001 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out]">
        <div className="p-6 border-b border-pathik-border flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-pathik-text-dark">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-200 transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
