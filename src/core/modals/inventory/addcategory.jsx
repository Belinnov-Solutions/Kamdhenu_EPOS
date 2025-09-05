import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import MessageModal from "../../../feature-module/inventory/MessageModal";

const AddCategory = ({ isOpen, onClose, onCategoryAdded }) => {
  const storeId = useSelector((state) => state.user.storeId);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    storeId: storeId,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        description: "",
        storeId: storeId,
      });
    }
  }, [isOpen, storeId]);

  const handleAddCategory = async () => {
    if (!formData.name.trim()) {
      setMessageModal({
        isOpen: true,
        title: "Validation Error",
        message: "Category name is required",
        type: "error",
      });
      return;
    }

    // if (!formData.description.trim()) {
    //   setMessageModal({
    //     isOpen: true,
    //     title: "Validation Error",
    //     message: "Description is required",
    //     type: "error",
    //   });
    //   return;
    // }

    try {
      setIsSubmitting(true);

      const payload = {
        CategoryName: formData.name.trim(),
        storeId: formData.storeId,
        description: formData.description.trim(),
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BASEURL}api/v1/Product/SaveCategories`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setMessageModal({
        isOpen: true,
        title: "Success",
        message: response.data.message || "Category added successfully!",
        type: "success",
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        storeId: storeId,
      });

      // Notify parent component about the new category
      if (onCategoryAdded) {
        onCategoryAdded();
      }
    } catch (error) {
      console.error("Error adding category:", error);
      if (error.response) {
        setMessageModal({
          isOpen: true,
          title: "Error",
          message: error.response.data.message || "Failed to add category",
          type: "error",
        });
      } else {
        setMessageModal({
          isOpen: true,
          title: "Network Error",
          message: "Network error. Please try again.",
          type: "error",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeMessageModal = () => {
    setMessageModal({ ...messageModal, isOpen: false });
  };

  const handleCloseModal = () => {
    // Close the modal by calling the onClose prop
    if (onClose) {
      onClose();
    }
  };

  // Don't render anything if modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="modal fade show"
        style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header">
                  <div className="page-title">
                    <h4>Add Category</h4>
                  </div>
                  <button
                    type="button"
                    className="close bg-danger text-white fs-16"
                    onClick={handleCloseModal}
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="mb-3">
                      <label className="form-label">
                        Category<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    {/* <div className="mb-3">
                      <label className="form-label">
                        Description<span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div> */}
                  </form>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary fs-13 fw-medium p-2 px-3"
                    onClick={handleAddCategory}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Adding...
                      </>
                    ) : (
                      "Add Category"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={closeMessageModal}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
      />
    </>
  );
};

AddCategory.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCategoryAdded: PropTypes.func
};

export default AddCategory;