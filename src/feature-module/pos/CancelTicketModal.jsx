// CancelTicketModal.js
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import PropTypes from "prop-types";

const CancelTicketModal = ({ show, onClose, onCancelTicket }) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onCancelTicket(reason);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Cancel Ticket</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Reason for cancellation</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="gap-2">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Close
        </Button>
        <Button
          variant="danger"
          onClick={handleSubmit}
          disabled={!reason || submitting}
        >
          {submitting ? "Cancelling..." : "Confirm Cancellation"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

CancelTicketModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCancelTicket: PropTypes.func.isRequired,
};

export default CancelTicketModal;
