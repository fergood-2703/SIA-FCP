// src/components/modals/BaseModal.jsx
import React from "react";
import "./Modal.css";

function BaseModal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <header className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
            >
              ×
            </button>
          </header>
        )}

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default BaseModal;
