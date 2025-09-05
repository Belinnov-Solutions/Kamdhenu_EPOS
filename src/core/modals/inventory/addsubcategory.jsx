import React, { useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import MessageModal from "../../../feature-module/inventory/MessageModal";

const AddSubcategory = ({ onSubCategoryAdded, selectedCategoryId, isOpen, onClose }) => {
  const storeId = useSelector((state) => state.user.storeId);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const resetForm = () => {
    setSubCategoryName("");
    setCategoryCode("");
    setDescription("");
    setStatus(true);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCategoryId || !subCategoryName) {
      setMessageModal({
        isOpen: true,
        title: "Validation Error",
        message: "Please fill all required fields",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        categoryId: selectedCategoryId,
        SubCategoryName: subCategoryName,
        image: imageFile?.name || "",
        code: categoryCode,
        storeid: storeId,
        description: description,
        status: status ? "Active" : "Inactive",
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BASEURL}api/v1/Product/savesubcategories`,
        payload
      );

      // Show success message
      setMessageModal({
        isOpen: true,
        title: "Success",
        message: response.data.message || "Subcategory added successfully!",
        type: "success",
      });

      // Reset form and close modal
      resetForm();
      
      // Notify parent about the new subcategory
      if (onSubCategoryAdded) {
        onSubCategoryAdded();
      }

      // Close the modal after success
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error adding subcategory:", error);
      setMessageModal({
        isOpen: true,
        title: "Error",
        message: error.response?.data?.message || "Failed to add subcategory",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeMessageModal = () => {
    setMessageModal({ ...messageModal, isOpen: false });
  };

  const handleCloseModal = () => {
    resetForm();
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
            <div className="content">
              <div className="modal-header">
                <div className="page-title">
                  <h4>Add Sub Category</h4>
                </div>
                <button
                  type="button"
                  className="close bg-danger text-white"
                  onClick={handleCloseModal}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Sub Category Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={subCategoryName}
                      onChange={(e) => setSubCategoryName(e.target.value)}
                      placeholder="Enter subcategory name"
                      required
                    />
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
                      type="submit"
                      className="btn btn-primary fs-13 fw-medium p-2 px-3"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-1"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Adding...
                        </>
                      ) : (
                        "Create Subcategory"
                      )}
                    </button>
                  </div>
                </form>
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

AddSubcategory.propTypes = {
  onSubCategoryAdded: PropTypes.func.isRequired,
  selectedCategoryId: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AddSubcategory;