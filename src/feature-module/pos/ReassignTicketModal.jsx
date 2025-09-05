import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useSelector } from "react-redux";

const ReassignTicketModal = ({ ticket, show, onClose }) => {
  const { storeId } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    assignedTo: ticket?.assignedTo || "",
    technicianId: ticket?.technicianId || "",
    status: ticket?.status || "Pending",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [referenceData, setReferenceData] = useState({
    status: [],
    technicians: [],
  });
  const [loading, setLoading] = useState(true);
  //  const apiBase = getConfig().API_BASE_URL;
const apiBase = window.__APP_CONFIG__?.API_BASE_URL || "";

  useEffect(() => {
    const fetchReferenceData = async () => {
      const BASE_URL = apiBase ;

      try {
        const response = await axios.get(
          `${BASE_URL}api/v1/Product/GetReferenceData?storeId=${storeId}`
        );

        const statusOptions = response.data.data.status.map((status) => ({
          value: status.statusName,
          label: status.statusName,
        }));

        const technicianOptions = response.data.data.technicians.map(
          (tech) => ({
            id: tech.userId,
            name: tech.userName,
          })
        );

        setReferenceData({
          status: statusOptions,
          technicians: technicianOptions,
        });

        // Find the current technician in the reference data
        const currentTech = technicianOptions.find(
          (tech) => tech.id === ticket?.technicianId
        );

        setFormData({
          assignedTo: currentTech?.name || "",
          technicianId: ticket?.technicianId || "",
          status: ticket?.status || "Pending",
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching reference data:", error);
        setSubmitError("Failed to load reference data");
        setLoading(false);
      }
    };

    if (show) {
      fetchReferenceData();
    }
  }, [show, ticket]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "assignedTo") {
      const selectedTech = referenceData.technicians.find(
        (tech) => tech.name === value
      );

      setFormData((prev) => ({
        ...prev,
        assignedTo: value,
        technicianId: selectedTech?.id || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const BASE_URL = apiBase ;

      console.log("Ticket object:", ticket);
      console.log("Original data:", ticket?.originalData);

      // Validate required fields
      if (!formData.technicianId || !formData.status) {
        throw new Error("Please select both technician and status");
      }

      // Check if ticket and originalData exist
      if (!ticket || !ticket.originalData) {
        throw new Error("Ticket data is incomplete");
      }

      // Check for required fields
      if (!ticket.originalData.ticketid || !ticket.originalData.repairOrderId) {
        throw new Error("Missing required ticket information");
      }

      // Make GET API call instead of POST
      const response = await axios.get(
        `${BASE_URL}api/v1/Order/AssignTechnician`,
        {
          params: {
            ticketId: ticket.originalData.ticketid,
            orderId: ticket.originalData.repairOrderId,
            technicianId: formData.technicianId,
            status: formData.status,
          },
        }
      );

      if (response.data) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onClose();
          setSubmitSuccess(false);
        }, 1500);
      } else {
        throw new Error("Failed to update ticket");
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update ticket. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  if (loading) {
    return (
      <div
        className="modal fade show"
        style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-body text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Reassign Ticket {ticket?.ticketNumber}
            </h5>
            <button
              type="button"
              className="close"
              onClick={onClose}
              aria-label="Close"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body pb-1">
              {submitError && (
                <div className="alert alert-danger mx-3 my-2">
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="alert alert-success mx-3 my-2">
                  Ticket updated successfully!
                </div>
              )}
              <div className="row">
                <div className="col-lg-6 col-sm-12 col-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Assigned To <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-control"
                      name="assignedTo"
                      value={formData.assignedTo}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Technician</option>
                      {referenceData.technicians.map((tech) => (
                        <option key={tech.id} value={tech.name}>
                          {tech.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-lg-6 col-sm-12 col-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Status <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-control"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      {referenceData.status.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer d-flex justify-content-end gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-md btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-md btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

ReassignTicketModal.propTypes = {
  ticket: PropTypes.shape({
    ticketNumber: PropTypes.string.isRequired,
    assignedTo: PropTypes.string,
    technicianId: PropTypes.string,
    status: PropTypes.string,
    originalData: PropTypes.shape({
      ticketid: PropTypes.string.isRequired,
      repairOrderId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ReassignTicketModal;
