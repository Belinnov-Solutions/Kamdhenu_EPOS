import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { reportedIssuesAdded } from "../../core/redux/checklistSlice";
import { useDispatch } from "react-redux";

const ReportedIssuesModal = ({
  show,
  onClose,
  onSave,
  deviceType = "Mobile",
}) => {
  const BASE_URL = process.env.REACT_APP_BASEURL;
  const dispatch = useDispatch();

  const [issues, setIssues] = useState({});
  const [issuesChecklist, setIssuesChecklist] = useState([]);
  const [otherIssueItem, setOtherIssueItem] = useState(null);
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
      fetchIssuesChecklist();
    }
  }, [show]);

  const fetchIssuesChecklist = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}api/v1/Order/GetRepairchecklist?deviceType=${deviceType}`
      );

      const issuesCategory = response.data.find(
        (category) => category.categoryName === "Reported issues"
      );

      if (issuesCategory) {
        const notes = issuesCategory.checklist.find(
          (item) => item.checkText === "Notes"
        );
        setNotesItem(notes);

        const otherIssue = issuesCategory.checklist.find(
          (item) => item.checkText === "Other issue"
        );
        setOtherIssueItem(otherIssue);

        const checklistWithoutSpecialItems = issuesCategory.checklist.filter(
          (item) =>
            item.checkText !== "Notes" && item.checkText !== "Other issue"
        );
        setIssuesChecklist(checklistWithoutSpecialItems);

        const initialIssuesState = checklistWithoutSpecialItems.reduce(
          (acc, item) => {
            acc[item.id] = false;
            return acc;
          },
          {
            [otherIssue?.id || "otherIssue"]: "",
            [notes?.id || "notes"]: "",
          }
        );

        setIssues(initialIssuesState);
      }
    } catch (error) {
      console.error("Error fetching issues checklist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setIssues((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleOtherIssueChange = (e) => {
    setIssues((prev) => ({
      ...prev,
      [otherIssueItem?.id || "otherIssue"]: e.target.value,
    }));
  };

  const handleNotesChange = (e) => {
    setIssues((prev) => ({
      ...prev,
      [notesItem?.id || "notes"]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    try {
      const selectedIssues = issuesChecklist
        .filter((item) => issues[item.id])
        .map((item) => ({
          id: item.id,
          checkText: item.checkText,
          isChecked: issues[item.id],
        }));

      // const reduxPayload = {
      //   deviceType,
      //   selectedIssues,
      //   otherIssue: issues[otherIssueItem?.id] || "",
      //   notes: issues[notesItem?.id] || "",
      //   timestamp: new Date().toISOString(),
      // };

      dispatch(
        reportedIssuesAdded({
          deviceType,
          selectedIssues,
          otherIssue: issues[otherIssueItem?.id] || "",
          otherIssueItemId: otherIssueItem?.id, // This stores the correct ID
          notes: issues[notesItem?.id] || "",
          notesItemId: notesItem?.id, // This stores the correct ID
          timestamp: new Date().toISOString(),
        })
      );
      const parentPayload = {
        selectedIssues,
        otherIssue: {
          id: otherIssueItem?.id,
          checkText: otherIssueItem?.checkText,
          value: issues[otherIssueItem?.id] || "",
        },
        notes: {
          id: notesItem?.id,
          checkText: notesItem?.checkText,
          value: issues[notesItem?.id] || "",
        },
      };

      onSave(parentPayload);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const resetForm = () => {
    const initialIssuesState = issuesChecklist.reduce(
      (acc, item) => {
        acc[item.id] = false;
        return acc;
      },
      {
        [otherIssueItem?.id || "otherIssue"]: "",
        [notesItem?.id || "notes"]: "",
      }
    );
    setIssues(initialIssuesState);
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
              <p className="mt-2">Loading reported issues checklist...</p>
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
              <h5 className="modal-title">🔍 Reported Issues</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
              ></button>
            </div>
            <div className="modal-body">
              <p className="mb-3">Check all that apply:</p>

              <div className="row">
                <div className="col-md-6">
                  {issuesChecklist
                    .slice(0, Math.ceil(issuesChecklist.length / 2))
                    .map((item) => (
                      <div className="form-check mb-3" key={item.id}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={item.id}
                          name={item.id}
                          checked={issues[item.id] || false}
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
                  {issuesChecklist
                    .slice(Math.ceil(issuesChecklist.length / 2))
                    .map((item) => (
                      <div className="form-check mb-3" key={item.id}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={item.id}
                          name={item.id}
                          checked={issues[item.id] || false}
                          onChange={handleCheckboxChange}
                          style={inputStyles.checkbox}
                        />
                        <label className="form-check-label" htmlFor={item.id}>
                          {item.checkText}
                        </label>
                      </div>
                    ))}
                </div>

                {otherIssueItem && (
                  <div className="form-group mb-3">
                    <div className="input-group" style={inputStyles.input}>
                      <div className="input-group-text">
                        <input
                          type="checkbox"
                          className="form-check-input mt-0"
                          style={inputStyles.input}
                          id={`${otherIssueItem.id}-check`}
                          checked={!!issues[otherIssueItem.id]}
                          onChange={(e) =>
                            setIssues((prev) => ({
                              ...prev,
                              [otherIssueItem.id]: e.target.checked ? "" : " ",
                            }))
                          }
                        />
                      </div>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id={otherIssueItem.id}
                        name={otherIssueItem.id}
                        placeholder={otherIssueItem.checkText}
                        value={issues[otherIssueItem.id] || ""}
                        onChange={handleOtherIssueChange}
                        style={{ borderLeft: "1px solid grey" }}
                      />
                    </div>
                  </div>
                )}
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
                    value={issues[notesItem.id] || ""}
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

ReportedIssuesModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  deviceType: PropTypes.string,
};

export default ReportedIssuesModal;
