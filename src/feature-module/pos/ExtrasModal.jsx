import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { extrasAdded } from "../../core/redux/checklistSlice";
import { useDispatch } from "react-redux";

const ExtrasModal = ({ show, onClose, onSave, deviceType }) => {
  const BASE_URL = process.env.REACT_APP_BASEURL;
  const dispatch = useDispatch();

  const [extras, setExtras] = useState({});
  const [extrasChecklist, setExtrasChecklist] = useState([]);
  const [notesItem, setNotesItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const inputStyles = {
    checkbox: {
      border: "1px solid grey",
    },
    input: {
      border: "1px solid grey",
    },
  };

  useEffect(() => {
    if (show) {
      fetchExtrasChecklist();
    }
  }, [show]);

  const fetchExtrasChecklist = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}api/v1/Order/GetRepairchecklist?deviceType=${deviceType}`
      );

      const extrasCategory = response.data.find(
        (category) => category.categoryName === "Extras"
      );

      if (extrasCategory) {
        const notes = extrasCategory.checklist.find(
          (item) => item.checkText === "Notes"
        );
        setNotesItem(notes);

        const checklistWithoutNotes = extrasCategory.checklist.filter(
          (item) => item.checkText !== "Notes"
        );
        setExtrasChecklist(checklistWithoutNotes);

        const initialExtrasState = checklistWithoutNotes.reduce(
          (acc, item) => {
            acc[item.id] = false;
            return acc;
          },
          { [notes?.id || "notes"]: "" }
        );

        setExtras(initialExtrasState);
      }
    } catch (error) {
      console.error("Error fetching extras checklist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setExtras((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleNotesChange = (e) => {
    setExtras((prev) => ({
      ...prev,
      [notesItem?.id || "notes"]: e.target.value,
    }));
  };

  const resetForm = () => {
    const initialExtrasState = extrasChecklist.reduce(
      (acc, item) => {
        acc[item.id] = false;
        return acc;
      },
      { [notesItem?.id || "notes"]: "" }
    );
    setExtras(initialExtrasState);
  };

  const handleSubmit = () => {
    try {
      // Prepare data for Redux
      const selectedExtras = extrasChecklist
        .filter((item) => extras[item.id])
        .map((item) => ({
          id: item.id,
          checkText: item.checkText,
          isChecked: extras[item.id],
        }));

      const reduxPayload = {
        deviceType,
        selectedExtras,
        notes: extras[notesItem?.id] || "",
        timestamp: new Date().toISOString(),
      };

      dispatch(
        extrasAdded({
          deviceType,
          selectedExtras,
          notes: extras[notesItem?.id] || "",
          notesItemId: notesItem?.id, // This stores the correct ID
          timestamp: new Date().toISOString(),
        })
      );

      // Call the onSave callback with the payload
      onSave(reduxPayload);
      // resetForm();
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleClose = () => {
    resetForm();
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
              <p className="mt-2">Loading extras checklist...</p>
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
              <h5 className="modal-title">Extras</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  {extrasChecklist
                    .slice(0, Math.ceil(extrasChecklist.length / 2))
                    .map((item) => (
                      <div className="form-check mb-3" key={item.id}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={item.id}
                          name={item.id}
                          checked={extras[item.id] || false}
                          onChange={handleCheckboxChange}
                          style={inputStyles.checkbox}
                        />
                        <label className="form-check-label" htmlFor={item.id}>
                          {item.checkText}
                        </label>
                      </div>
                    ))}
                </div>

                <div className="col-md-6">
                  {extrasChecklist
                    .slice(Math.ceil(extrasChecklist.length / 2))
                    .map((item) => (
                      <div className="form-check mb-3" key={item.id}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={item.id}
                          name={item.id}
                          checked={extras[item.id] || false}
                          onChange={handleCheckboxChange}
                          style={inputStyles.checkbox}
                        />
                        <label className="form-check-label" htmlFor={item.id}>
                          {item.checkText}
                        </label>
                      </div>
                    ))}
                </div>
              </div>

              {notesItem && (
                <div className="mt-3">
                  <label htmlFor={notesItem.id} className="form-label">
                    {notesItem.checkText}:
                  </label>
                  <textarea
                    className="form-control"
                    id={notesItem.id}
                    name={notesItem.id}
                    rows="3"
                    value={extras[notesItem.id] || ""}
                    onChange={handleNotesChange}
                    style={inputStyles.input}
                    placeholder={`Additional ${notesItem.checkText.toLowerCase()}...`}
                  ></textarea>
                </div>
              )}
            </div>
            <div className="modal-footer gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

ExtrasModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  deviceType: PropTypes.string.isRequired,
};

export default ExtrasModal;
