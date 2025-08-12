import React, { useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
// import Select from "react-select";
// import { Link } from 'react-router-dom'
import { useSelector } from "react-redux";

const AddSubcategory = ({ onSubCategoryAdded, selectedCategoryId }) => {
  const storeId = useSelector((state) => state.user.storeId);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // const storeId = "67aa7f75-0ed9-4378-9b3d-50e1e34903ce";

  const resetForm = () => {
    setCategoryCode("");
    setDescription("");
    setStatus(true);
    setImageFile(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCategoryId || !subCategoryName) {
      setError("Please fill all required fields");
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

      if (response.data) {
        onSubCategoryAdded();
        resetForm();
        // Close modal
        document.getElementById("closeAddSubCategoryModal").click();
      }
    } catch (error) {
      console.error("Error adding subcategory:", error);
      setError(error.response?.data?.message || "Failed to add subcategory");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal fade" id="add-units-subcategory">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="content">
            <div className="modal-header">
              <div className="page-title">
                <h4>Add Sub Category</h4>
              </div>
              <button
                type="button"
                id="closeAddSubCategoryModal"
                className="close bg-danger text-white"
                data-bs-dismiss="modal"
                onClick={resetForm}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger mb-3">{error}</div>
                )}
                
                {/* <div className="mb-3">
                  <label className="form-label">Upload Image</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </div> */}
                
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
                
                {/* <div className="mb-3">
                  <label className="form-label">Category Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={categoryCode}
                    onChange={(e) => setCategoryCode(e.target.value)}
                    placeholder="Enter category code"
                    required
                  />
                </div>
                 */}
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                  />
                </div>
                
                {/* <div className="mb-3">
                  <div className="status-toggle modal-status d-flex justify-content-between">
                    <span className="status-label">Status</span>
                    <input
                      type="checkbox"
                      id="subcategory-status"
                      className="check"
                      checked={status}
                      onChange={() => setStatus(!status)}
                    />
                    <label htmlFor="subcategory-status" className="checktoggle" />
                  </div>
                </div> */}
                
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3"
                    data-bs-dismiss="modal"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary fs-13 fw-medium p-2 px-3"
                    disabled={isLoading}
                  >
                    {isLoading ? "Adding..." : "Create Subcategory"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
AddSubcategory.propTypes = {
  onSubCategoryAdded: PropTypes.func.isRequired,
  selectedCategoryId: PropTypes.string
};

export default AddSubcategory
