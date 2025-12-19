import React from 'react';
import './ConflictModal.css';

function ConflictModal({ isOpen, onClose, onConfirm, violations }) {
  if (!isOpen) return null;

  return (
    <div className="conflict-modal-overlay" onClick={onClose}>
      <div className="conflict-modal-container" onClick={(e) => e.stopPropagation()}>
        
        <div className="conflict-icon-wrapper">
          <span className="warning-icon">⚠️</span>
        </div>

        <h2 className="conflict-title">
          Essas alterações ferem restrições.
        </h2>

        <p className="conflict-subtitle">
          Você deseja mesmo alterar?
        </p>

        {violations && violations.length > 0 && (
          <div className="conflict-list-container">
             <ul>
               {violations.map((v, i) => (
                 <li key={i}>{v}</li>
               ))}
             </ul>
          </div>
        )}

        <div className="conflict-modal-footer">
          <button 
            className="btn-conflict-cancel" 
            onClick={onClose}
          >
            CANCELAR
          </button>
          <button 
            className="btn-conflict-confirm" 
            onClick={onConfirm}
          >
            ALTERAR
          </button>
        </div>

      </div>
    </div>
  );
}

export default ConflictModal;