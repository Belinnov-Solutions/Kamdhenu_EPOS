// MessageModal.js
import React from "react";
import PropTypes from "prop-types";

const MessageModal = ({ isOpen, onClose, title, message, type = "info" }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return "ti ti-circle-check fs-24 text-success";
      case "error":
        return "ti ti-alert-circle fs-24 text-danger";
      case "warning":
        return "ti ti-alert-triangle fs-24 text-warning";
      default:
        return "ti ti-info-circle fs-24 text-info";
    }
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body p-4 text-center">
            <span
              className={`rounded-circle d-inline-flex p-2 bg-${type}-transparent mb-3`}
            >
              <i className={getIcon()} />
            </span>
            <h5 className="fw-bold mb-2">{title}</h5>
            <p className="mb-4">{message}</p>
            <div className="d-flex justify-content-center">
              <button
                type="button"
                className="btn btn-primary fs-13 fw-medium px-4 py-2"
                onClick={onClose}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

MessageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["info", "success", "error", "warning"]),
};

MessageModal.defaultProps = {
  type: "info",
};

export default MessageModal;
