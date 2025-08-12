import React, { useState } from "react";
import axios from "axios";
import PropTypes from 'prop-types';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min';
import { useSelector } from "react-redux";

const AddCategory = ({ onCategoryAdded }) => {
  const storeId = useSelector((state) => state.user.storeId);
  const [formData, setFormData] = useState({
    // categoryId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    name: "",
    image: null,
    description: "",
    storeId:storeId ,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCategory = async () => {
    if (!formData.name.trim()) {
      alert("Category name is required");
      return;
    }

    if (!formData.description.trim()) {
      alert("Description is required");
      return;
    }

    if (!formData.image) {
      alert("Image is required");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        categoryName: formData.name.trim(),
        image: formData.image.name,
        storeId: formData.storeId,
        description: formData.description.trim(),
      };

      await axios.post(
        `${process.env.REACT_APP_BASEURL}api/v1/Product/SaveCategories`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert("Category added successfully!");

      // Reset form
      setFormData({
        name: "",
        image: null,
        description: "",
        storeId: storeId,
      });

      // Close modal
      const modal = document.getElementById("add-units-category");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();

      // Notify parent component about the new category
      if (onCategoryAdded) {
        onCategoryAdded();
      }
    } catch (error) {
      console.error("Error adding category:", error);
      if (error.response) {
        alert(
          `Error: ${error.response.data.message || "Failed to add category"}`
        );
      } else {
        alert("Network error. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal fade" id="add-units-category">
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
                  data-bs-dismiss="modal"
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
                  <div className="mb-3">
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
                  </div>
                  {/* <div className="mb-3">
                    <label className="form-label">
                      Upload Image<span className="text-danger">*</span>
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          image: e.target.files[0],
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
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary fs-13 fw-medium p-2 px-3"
                  onClick={handleAddCategory}
                  data-bs-dismiss="modal"
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
  );
};
AddCategory.propTypes = {
  onCategoryAdded: PropTypes.func
};

export default AddCategory;