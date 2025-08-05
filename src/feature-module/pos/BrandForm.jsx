import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { serviceTypeSelected } from "../../core/redux/serviceTypeSlice";

import { repairAdded } from "../../core/redux/repairSlice";
import { triggerRefresh } from "../../core/redux/ticketRefreshSlice";
import ExtrasModal from "./ExtrasModal";
import ReportedIssuesModal from "./ReportedIssuesModal";
const getOneWeekLaterDate = (dateString) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + 7);
  return date.toISOString().split("T")[0];
};
const BrandForm = ({ brand, onClose }) => {
  const dispatch = useDispatch();
  const { customerId } = useSelector((state) => state.customer);
  const initialDateCreated = new Date().toISOString().split("T")[0];
  const initialDueDate = getOneWeekLaterDate(initialDateCreated);
  const { storeId } = useSelector((state) => state.user);
  const [savedExtras, setSavedExtras] = useState(null);
  const [savedReportedIssues, setSavedReportedIssues] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    deviceType: brand?.deviceType || "Mobile", // Use deviceType from props or default to "Mobile"
    brandId: brand?.brandId || "",
    brandName: brand?.name || "",
    imeiNumber: "",
    serialNumber: "",
    modelId: "",
    modelName: "",
    passcode: "",
    colorName: "",
    dateCreated: initialDateCreated,
    dueDate: initialDueDate,
    serviceTypeId: "",
    technicianId: "",
    customerNotes: "",
    internalNotes: "",
    serviceCharge: 0,
    repairCost: 0,
  });

  // Add this reverse mapping function

  const [isEditMode, setIsEditMode] = useState(true);
  const [referenceData, setReferenceData] = useState({
    brands: [],
    serviceType: [],
    models: [],
    technicians: [],
    stores: [], // Added stores to referenceData
  });
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState(null);

  const [showExtrasModal, setShowExtrasModal] = useState(false);
  const [showReportedIssuesModal, setShowReportedIssuesModal] = useState(false);
  // Get unique device types from models
  // const deviceTypes = useMemo(() => {
  //   const types = new Set();
  //   (referenceData.models || []).forEach((model) => {
  //     types.add(model.deviceType);
  //   });
  //   return Array.from(types);
  // }, [referenceData.models]);

  // const technicians = useMemo(() => {
  //   return referenceData.stores
  //     .filter((store) => store.username) // Only stores with username
  //     .map((store) => ({
  //       technicianId: store.id,
  //       name: store.username, // Using username as technician name
  //       storeName: store.name,
  //     }));
  // }, [referenceData.stores]);

  const validateForm = () => {
    const errors = {};

    // Mandatory field validations
    if (!formData.brandId) errors.brandId = "Brand is required";
    if (!formData.imeiNumber) errors.imeiNumber = "IMEI number is required";
    if (!formData.modelId && !formData.modelName) {
      errors.model = "Model is required";
    }
    if (!formData.serviceTypeId)
      errors.serviceTypeId = "Service type is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASEURL}api/v1/Product/GetReferenceData`,
          {
            params: {
              storeId: storeId,
            },
          }
        );
        setReferenceData({
          ...response.data.data,
          serviceType: response.data.data.serviceType || [],
        });
      } catch (error) {
        console.error("Error fetching reference data:", error);
        setSubmitError("Failed to load reference data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReferenceData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "deviceType") {
      setFormData((prev) => ({
        ...prev,
        deviceType: value,
        modelId: "",
        modelName: "",
      }));
    } else if (name === "brandId") {
      const selectedBrand = referenceData.brands.find(
        (b) => b.brandId === value
      );
      setFormData((prev) => ({
        ...prev,
        brandId: value,
        brandName: selectedBrand?.brandName || "",
        modelId: "",
        modelName: "",
      }));
    } else if (name === "modelId") {
      const selectedModel = referenceData.models.find(
        (m) => m.modelId === value
      );
      setFormData((prev) => ({
        ...prev,
        modelId: value,
        modelName: selectedModel?.name || "",
      }));
    } else if (name === "serviceTypeId") {
      const selectedService = referenceData.serviceType.find(
        (s) => s.id === value
      );

      if (selectedService) {
        // Dispatch to Redux to store the selected service
        dispatch(
          serviceTypeSelected({
            id: selectedService.id,
            name: selectedService.name,
            price: selectedService.price,
          })
        );
      }
      setFormData((prev) => ({
        ...prev,
        serviceTypeId: value,
        serviceCharge: selectedService?.price || 0,
      }));
    } else if (name === "dateCreated") {
      // Update due date when dateCreated changes
      if (name === "dateCreated") {
        // Update due date when dateCreated changes
        const newDueDate = getOneWeekLaterDate(value);
        setFormData((prev) => ({
          ...prev,
          dateCreated: value,
          dueDate: newDueDate > prev.dueDate ? newDueDate : prev.dueDate,
        }));
      } else if (name === "dueDate") {
        // Prevent due date from being before created date
        const minDueDate = formData.dateCreated;
        const selectedDueDate = value < minDueDate ? minDueDate : value;
        setFormData((prev) => ({
          ...prev,
          dueDate: selectedDueDate,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  console.log("device type", formData.deviceType);

  const filteredModels = useMemo(() => {
    if (!formData.brandId || !referenceData.models) {
      console.log(
        "Missing required data for filtering - brandId or models not available"
      );
      return [];
    }

    const filtered = referenceData.models.filter((model) => {
      const matchesBrand = model.brandId === formData.brandId;
      const matchesDeviceType =
        model.deviceType.toLowerCase() === formData.deviceType.toLowerCase();

      return matchesBrand && matchesDeviceType;
    });

    return filtered;
  }, [formData.brandId, formData.deviceType, referenceData.models]);

  // Check if the selected brand has models
  const brandHasModels = useMemo(() => {
    return filteredModels.length > 0;
  }, [filteredModels]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      if (!customerId) {
        throw new Error(
          "Please register a customer first before creating a repair ticket"
        );
      }

      // Find the selected service type
      const selectedServiceType = referenceData.serviceType.find(
        (s) => s.id === formData.serviceTypeId
      );

      // Find the selected technician
      const selectedTechnician = referenceData.technicians?.find(
        (tech) => tech.userId === formData.technicianId
      );

      if (!selectedServiceType) {
        throw new Error("Please select a valid service type");
      }

      const repairItem = {
        repairOrderId: uuidv4(),
        orderNumber: `ORD-${Math.floor(Math.random() * 10000)}`,
        customerId,
        deviceType: formData.deviceType,
        brand: formData.brandName,
        model: formData.modelName,
        imeiNumber: formData.imeiNumber,
        serialNumber: formData.serialNumber,
        passcode: formData.passcode,
        taskTypeId: formData.serviceTypeId,
        taskTypeName: selectedServiceType.name,
        technicianId: formData.technicianId,
        technicianName: selectedTechnician?.userName || "", // Add technician name
        dueDate: formData.dueDate,
        dateCreated: formData.dateCreated,
        customerNotes: formData.customerNotes,
        internalNotes: formData.internalNotes,
        serviceCharge: selectedServiceType.price || 0,
        repairCost: selectedServiceType.price || 0,
        extras: savedExtras, // Add saved extras data
        reportedIssues: savedReportedIssues,
      };

      dispatch(repairAdded(repairItem));
      dispatch(triggerRefresh());
      setIsEditMode(false);
      setShowSuccessModal(true); // Show success modal instead of switching directly
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError(error.message);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">
            {isEditMode
              ? `Repair Form${brand?.name ? ` for ${brand.name}` : ""}`
              : "Repair Details"}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
          ></button>
        </div>

        {submitError && (
          <div className="alert alert-danger mb-3">{submitError}</div>
        )}

        {isEditMode ? (
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Device Type *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.deviceType}
                  readOnly
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Brand *</label>
                <select
                  className={`form-select ${
                    validationErrors.brandId ? "is-invalid" : ""
                  }`}
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Brand</option>
                  {referenceData.brands.map((brandItem) => (
                    <option key={brandItem.brandId} value={brandItem.brandId}>
                      {brandItem.brandName}
                    </option>
                  ))}
                </select>
                {validationErrors.brandId && (
                  <div className="invalid-feedback">
                    {validationErrors.brandId}
                  </div>
                )}
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">IMEI Number *</label>
                <input
                  type="text"
                  className={`form-control ${
                    validationErrors.imeiNumber ? "is-invalid" : ""
                  }`}
                  name="imeiNumber"
                  value={formData.imeiNumber}
                  onChange={handleChange}
                />
                {validationErrors.imeiNumber && (
                  <div className="invalid-feedback">
                    {validationErrors.imeiNumber}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label">Serial Number</label>
                <input
                  type="text"
                  className="form-control"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
            {/* Original Passcode Field (keep this) */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Model *</label>
                {brandHasModels ? (
                  <>
                    <select
                      className={`form-select ${
                        validationErrors.model ? "is-invalid" : ""
                      }`}
                      name="modelId"
                      value={formData.modelId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        {formData.brandId
                          ? "Select Model"
                          : "Select a brand first"}
                      </option>
                      {formData.brandId &&
                        filteredModels.map((model) => (
                          <option key={model.modelId} value={model.modelId}>
                            {model.name}
                          </option>
                        ))}
                    </select>
                    {validationErrors.model && (
                      <div className="invalid-feedback">
                        {validationErrors.model}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      className={`form-control ${
                        validationErrors.model ? "is-invalid" : ""
                      }`}
                      name="modelName"
                      value={formData.modelName}
                      onChange={handleChange}
                      required
                      placeholder={
                        formData.brandId
                          ? "Enter model name"
                          : "Select a brand first"
                      }
                    />
                    {validationErrors.model && (
                      <div className="invalid-feedback">
                        {validationErrors.model}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label">Device Color</label>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    name="colorName"
                    value={formData.colorName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            {/* New Color Field */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Passcode</label>
                <input
                  type="text"
                  className="form-control"
                  name="passcode"
                  value={formData.passcode}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Date Created</label>
                <input
                  type="date"
                  className="form-control"
                  name="dateCreated"
                  value={formData.dateCreated}
                  onChange={handleChange}
                />
              </div>
              {/* <div className="col-md-6">
                <label className="form-label">Password Status</label>
                <div className="d-flex flex-wrap gap-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="noPassword"
                      name="noPassword"
                      checked={formData.noPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          noPassword: e.target.checked,
                        })
                      }
                    />
                    <label
                      className="form-check-label fs-15"
                      htmlFor="noPassword"
                    >
                      No password provided
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="hasBiometric"
                      name="hasBiometric"
                      checked={formData.hasBiometric}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hasBiometric: e.target.checked,
                        })
                      }
                    />
                    <label
                      className="form-check-label fs-15"
                      htmlFor="hasBiometric"
                    >
                      Face ID / Fingerprint
                    </label>
                  </div>
                </div>
              </div> */}
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  min={formData.dateCreated}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Service Type *</label>
                <select
                  className={`form-select ${
                    validationErrors.serviceTypeId ? "is-invalid" : ""
                  }`}
                  name="serviceTypeId"
                  value={formData.serviceTypeId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Service Type</option>
                  {referenceData.serviceType.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
                {validationErrors.serviceTypeId && (
                  <div className="invalid-feedback">
                    {validationErrors.serviceTypeId}
                  </div>
                )}
              </div>
            </div>
            <div className="row mb-3">
              {/* <div className="col-md-6">
                    <label className="form-label">Repair Cost</label>
                    <input
                      type="number"
                      className="form-control"
                      name="repairCost"
                      value={formData.repairCost}
                      onChange={handleChange}
                    />
                  </div> */}
              <div className="col-6">
                <label className="form-label">Technician</label>
                <select
                  className="form-select"
                  name="technicianId"
                  value={formData.technicianId}
                  onChange={handleChange}
                >
                  <option value="">Select Technician</option>
                  {referenceData.technicians?.map((tech) => (
                    <option key={tech.userId} value={tech.userId}>
                      {tech.userName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-12">
                <label className="form-label">Customer Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  name="customerNotes"
                  value={formData.customerNotes}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-12">
                <label className="form-label">Internal Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  name="internalNotes"
                  value={formData.internalNotes}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
            <div className="d-flex gap-2 mb-3">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setShowExtrasModal(true)}
              >
                Extras
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setShowReportedIssuesModal(true)}
              >
                🔍 Reported Issues
              </button>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
              <button type="submit" className="btn btn-primary">
                Confirm
              </button>
            </div>
            <ExtrasModal
              show={showExtrasModal}
              onClose={() => setShowExtrasModal(false)}
              deviceType={formData.deviceType}
              onSave={(extrasData) => {
                setSavedExtras(extrasData);
                setShowExtrasModal(false);
              }}
            />
            <ReportedIssuesModal
              show={showReportedIssuesModal}
              onClose={() => setShowReportedIssuesModal(false)}
              deviceType={formData.deviceType}
              onSave={(issuesData) => {
                setSavedReportedIssues(issuesData);
                setShowReportedIssuesModal(false);
              }}
            />
          </form>
        ) : (
          <div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Device Type</label>
                <div className="form-control-plaintext">
                  {formData.deviceType}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Brand</label>
                <div className="form-control-plaintext">
                  {formData.brandName}
                </div>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">IMEI Number</label>
                <div className="form-control-plaintext">
                  {formData.imeiNumber}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Serial Number</label>
                <div className="form-control-plaintext">
                  {formData.serialNumber}
                </div>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Model</label>
                <div className="form-control-plaintext">
                  {formData.modelName}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Passcode</label>
                <div className="form-control-plaintext">
                  {formData.passcode}
                </div>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Date Created</label>
                <div className="form-control-plaintext">
                  {formData.dateCreated}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Due Date</label>
                <div className="form-control-plaintext">{formData.dueDate}</div>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Service Type</label>
                <div className="form-control-plaintext">
                  {
                    referenceData.serviceType.find(
                      (s) => s.id === formData.serviceTypeId
                    )?.name
                  }
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Service Charge</label>
                <div className="form-control-plaintext">
                  ${formData.serviceCharge}
                </div>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-12">
                <label className="form-label">Technician</label>
                <div className="form-control-plaintext">
                  {referenceData.technicians?.find(
                    (t) => t.userId === formData.technicianId
                  )?.userName || "Not assigned"}
                </div>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-12">
                <label className="form-label">Customer Notes</label>
                <div className="form-control-plaintext">
                  {formData.customerNotes}
                </div>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-12">
                <label className="form-label">Internal Notes</label>
                <div className="form-control-plaintext">
                  {formData.internalNotes}
                </div>
              </div>
            </div>

            {savedExtras && (
              <div className="row mb-3">
                <div className="col-12">
                  <label className="form-label">Extras</label>
                  <div className="form-control-plaintext">
                    {savedExtras.selectedExtras
                      .map((extra) => extra.checkText)
                      .join(", ")}
                    {savedExtras.notes && (
                      <div className="mt-2">
                        <strong>Notes:</strong> {savedExtras.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {savedReportedIssues && (
              <div className="row mb-3">
                <div className="col-12">
                  <label className="form-label">Reported Issues</label>
                  <div className="form-control-plaintext">
                    {savedReportedIssues.selectedIssues
                      .map((issue) => issue.checkText)
                      .join(", ")}
                    {savedReportedIssues.otherIssue?.value && (
                      <div className="mt-2">
                        <strong>Other Issue:</strong>{" "}
                        {savedReportedIssues.otherIssue.value}
                      </div>
                    )}
                    {savedReportedIssues.notes?.value && (
                      <div className="mt-2">
                        <strong>Notes:</strong>{" "}
                        {savedReportedIssues.notes.value}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleEdit}
              >
                Edit
              </button>
            </div>
            <ExtrasModal
              show={showExtrasModal}
              onClose={() => setShowExtrasModal(false)}
              onSave={() => {
                // Handle save logic here
                setShowExtrasModal(false);
              }}
            />
            <ReportedIssuesModal
              show={showReportedIssuesModal}
              onClose={() => setShowReportedIssuesModal(false)}
              onSave={() => {
                // Handle save logic here
                setShowReportedIssuesModal(false);
              }}
            />
          </div>
        )}
      </div>
      {showSuccessModal && (
        <div
          className="modal show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Success</h5>
              </div>
              <div className="modal-body">
                <p>Details saved successfully!</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setIsEditMode(false); // Switch to view mode
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

BrandForm.propTypes = {
  brand: PropTypes.shape({
    name: PropTypes.string,
    brandId: PropTypes.string,
    deviceType: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

BrandForm.defaultProps = {
  brand: {
    name: "",
    brandId: "",
  },
};

export default BrandForm;
