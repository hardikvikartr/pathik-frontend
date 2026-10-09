import React, { useState } from "react";
import Modal from "@/app/components/Modal";

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: "foreigner" | "no_aadhaar" | "no_app") => void;
}

const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState<
    "foreigner" | "no_aadhaar" | "no_app" | ""
  >("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason) {
      onSubmit(reason);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manual Entry Reason">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Why are you entering details manually?
          </label>
          <select
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pathik-primary outline-none bg-white"
            value={reason}
            onChange={(e) => setReason(e.target.value as any)}
            required
          >
            <option value="">-- Select Reason --</option>
            <option value="foreigner">Foreigner / International Guest</option>
            <option value="no_aadhaar">Does not have Aadhaar ID</option>
            <option value="no_app">Does not have Aadhaar App</option>
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-600 font-semibold hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!reason}
            className={`px-6 py-2 rounded-lg text-white font-bold transition-all ${
              reason
                ? "bg-pathik-primary hover:bg-pathik-secondary"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Proceed to Form
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ManualEntryModal;
