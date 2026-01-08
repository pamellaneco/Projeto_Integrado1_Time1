import './ConfirmationModal.css';

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = "CONFIRMAR", cancelText = "CANCELAR", disableClose = false }) {
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  const handleConfirm = () => {
    onConfirm();
    if (!disableClose) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!disableClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-overlay" onClick={handleClose}>
      <div className="confirmation-modal-container" onClick={handleModalContentClick}>

        <div className="confirmation-modal-header">
          <h2>{title}</h2>
          {!disableClose && (
            <button className="confirmation-modal-close-btn" onClick={handleClose}>
              &times;
            </button>
          )}
        </div>

        <div className="confirmation-modal-content">
          <p style={{ whiteSpace: 'pre-line' }}>{message}</p>
        </div>

        <div className="confirmation-modal-footer">
          {!disableClose && (
            <button
              type="button"
              className="confirmation-modal-cancel-btn"
              onClick={handleClose}
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            className="confirmation-modal-confirm-btn"
            onClick={handleConfirm}
            disabled={disableClose}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;