import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  preRepairChecklistAdded,
  preRepairInspectionAdded,
} from "../../core/redux/checklistSlice";
const PreRepairInspectionModal = ({
  show,
  onClose,
  onSave,
  deviceType,
  repairOrderId,
  ticketId,
}) => {
  const BASE_URL = process.env.REACT_APP_BASEURL;
  const dispatch = useDispatch();

  const [inspection, setInspection] = useState({
    notes: "",
  });
  const [inspectionChecklist, setInspectionChecklist] = useState([]);
  const [radioGroups, setRadioGroups] = useState({});
  const [loading, setLoading] = useState(false);

  const inputStyles = {
    checkbox: {
      border: "1px solid #808080",
      width: "18px",
      height: "18px",
      marginRight: "8px",
      cursor: "pointer", // Add pointer cursor
    },
    input: {
      border: "1px solid #808080",
      borderRadius: "4px",
      padding: "8px",
      width: "100%",
    },
    textarea: {
      border: "1px solid #808080",
      borderRadius: "4px",
      padding: "8px",
      width: "100%",
      minHeight: "100px",
    },
    text: {
      color: "#000",
    },
  };

  useEffect(() => {
    if (show) {
      fetchInspectionChecklist();
    }
  }, [show]);

  const fetchInspectionChecklist = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}api/v1/Order/GetRepairchecklist?deviceType=${deviceType}`
      );

      const inspectionCategory = response.data.find(
        (category) => category.categoryName === "Pre-Repair Inspection"
      );

      if (inspectionCategory) {
        // Group items that should be radio buttons
        const radioGroupItems = {
          liquidDamage: inspectionCategory.checklist.filter((item) =>
            item.checkText.includes("Liquid damage indicator")
          ),
          powerStatus: inspectionCategory.checklist.filter(
            (item) =>
              item.checkText === "Powers on" ||
              item.checkText === "Doesn't power on"
          ),
          dataStatus: inspectionCategory.checklist.filter(
            (item) =>
              item.checkText === "Data accessible" ||
              item.checkText === "Data not accessible"
          ),
        };

        // Get standalone items (text inputs and textareas)
        const regularChecklist = inspectionCategory.checklist.filter(
          (item) =>
            !radioGroupItems.liquidDamage.includes(item) &&
            !radioGroupItems.powerStatus.includes(item) &&
            !radioGroupItems.dataStatus.includes(item) &&
            item.checkText !== "Notes"
        );

        setRadioGroups(radioGroupItems);
        setInspectionChecklist(regularChecklist);

        // Initialize state with all options
        const initialInspectionState = {
          liquidDamage: "",
          powerStatus: "",
          dataStatus: "",
          ...regularChecklist.reduce((acc, item) => {
            acc[item.id] =
              item.checkText === "Visible damage" ||
              item.checkText === "Condition of phone"
                ? ""
                : false;
            return acc;
          }, {}),
          notes: "",
        };
        dispatch(preRepairChecklistAdded(response.data));

        setInspection(initialInspectionState);
      }
    } catch (error) {
      console.error("Error fetching inspection checklist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRadioChange = (groupName, value) => {
    setInspection((prev) => ({
      ...prev,
      [groupName]: value,
    }));
  };

  const handleTextInputChange = (e) => {
    const { name, value } = e.target;
    setInspection((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const handleNotesChange = (e) => {
  //   setInspection((prev) => ({
  //     ...prev,
  //     notes: e.target.value,
  //   }));
  // };

  const handleSubmit = () => {
    const payload = {
      repairOrderId, // Add repairOrderId from props
      ticketId,
      liquidDamage: inspection.liquidDamage,
      powerStatus: inspection.powerStatus,
      dataStatus: inspection.dataStatus,
      visibleDamage: inspection.visibleDamage || "",
      deviceCondition: inspection.deviceCondition || "",
      notes: inspection.notes,
    };

    dispatch(preRepairInspectionAdded(payload));

    // Example of what will be sent when "Doesn't power on" is selected:
    // {
    //   liquidDamage: "notTriggered",
    //   powerStatus: "Doesn't power on",
    //   dataStatus: "Data not accessible",
    //   visibleDamage: "Cracked screen",
    //   deviceCondition: "Poor condition",
    //   notes: "Device won't turn on"
    // }

    onSave(payload);
    onClose();
  };

  if (!show) return null;

  if (loading) {
    return (
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading inspection checklist...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" style={inputStyles.text}>
                🔧 Pre-Repair Inspection
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              {/* Visible Damage */}
              {inspectionChecklist.find(
                (item) => item.checkText === "Visible damage"
              ) && (
                <div className="mb-4">
                  <label
                    className="d-block mb-2 fw-bold"
                    style={inputStyles.text}
                  >
                    • Visible damage:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="visibleDamage"
                    value={inspection.visibleDamage || ""}
                    onChange={handleTextInputChange}
                    style={inputStyles.input}
                    placeholder="Describe visible damage..."
                  />
                </div>
              )}

              {/* Liquid Damage Indicators */}
              {radioGroups.liquidDamage?.length > 0 && (
                <div className="mb-4">
                  <label
                    className="d-block mb-2 fw-bold"
                    style={inputStyles.text}
                  >
                    • Liquid damage indicators:
                  </label>
                  <div className="d-flex align-items-center gap-4">
                    {radioGroups.liquidDamage.map((item) => (
                      <label
                        key={item.id}
                        className="d-flex align-items-center"
                        style={{ cursor: "pointer" }} // Add pointer cursor
                      >
                        <input
                          type="radio"
                          name="liquidDamage"
                          value={
                            item.checkText.includes("Triggered")
                              ? "triggered"
                              : "notTriggered"
                          }
                          checked={
                            inspection.liquidDamage ===
                            (item.checkText.includes("Triggered")
                              ? "triggered"
                              : "notTriggered")
                          }
                          onChange={() =>
                            handleRadioChange(
                              "liquidDamage",
                              item.checkText.includes("Triggered")
                                ? "triggered"
                                : "notTriggered"
                            )
                          }
                          style={inputStyles.checkbox}
                        />
                        <span style={inputStyles.text}>
                          {item.checkText.split("-")[1].trim()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Power Status - Now shows both options */}
              {radioGroups.powerStatus?.length > 0 && (
                <div className="mb-4">
                  <label
                    className="d-block mb-2 fw-bold"
                    style={inputStyles.text}
                  >
                    • Power Status:
                  </label>
                  <div className="ps-3">
                    {radioGroups.powerStatus.map((item) => (
                      <label
                        key={item.id}
                        className="mb-2 d-flex align-items-center"
                        style={{ cursor: "pointer" }} // Add pointer cursor
                      >
                        <input
                          type="radio"
                          name="powerStatus"
                          checked={inspection.powerStatus === item.checkText}
                          onChange={() =>
                            handleRadioChange("powerStatus", item.checkText)
                          }
                          style={inputStyles.checkbox}
                        />
                        <span style={inputStyles.text}>{item.checkText}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {radioGroups.dataStatus?.length > 0 && (
                <div className="mb-4">
                  <label
                    className="d-block mb-2 fw-bold"
                    style={inputStyles.text}
                  >
                    • Data Status:
                  </label>
                  <div className="ps-3">
                    {radioGroups.dataStatus.map((item) => (
                      <label
                        key={item.id}
                        className="mb-2 d-flex align-items-center"
                        style={{ cursor: "pointer" }} // Add pointer cursor
                      >
                        <input
                          type="radio"
                          name="dataStatus"
                          checked={inspection.dataStatus === item.checkText}
                          onChange={() =>
                            handleRadioChange("dataStatus", item.checkText)
                          }
                          style={inputStyles.checkbox}
                        />
                        <span style={inputStyles.text}>{item.checkText}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Condition of Phone */}
              {inspectionChecklist.find(
                (item) => item.checkText === "Condition of phone"
              ) && (
                <div className="mb-4">
                  <label
                    className="d-block mb-2 fw-bold"
                    style={inputStyles.text}
                  >
                    • Condition of phone:
                  </label>
                  <textarea
                    className="form-control"
                    name="deviceCondition"
                    rows="3"
                    value={inspection.deviceCondition || ""}
                    onChange={handleTextInputChange}
                    style={inputStyles.textarea}
                    placeholder="Describe overall device condition..."
                  ></textarea>
                </div>
              )}

              {/* Notes */}
              {/* <div className="mb-3">
                <label
                  className="d-block mb-2 fw-bold"
                  style={inputStyles.text}
                >
                  Additional Notes:
                </label>
                <textarea
                  className="form-control"
                  name="notes"
                  rows="3"
                  value={inspection.notes}
                  onChange={handleNotesChange}
                  style={inputStyles.textarea}
                  placeholder="Any additional observations..."
                ></textarea>
              </div> */}
            </div>
            <div className="modal-footer gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                style={{ color: "white" }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                style={{ color: "white" }}
              >
                Save Inspection
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};
PreRepairInspectionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  deviceType: PropTypes.string,
  repairOrderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  ticketId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

export default PreRepairInspectionModal;
