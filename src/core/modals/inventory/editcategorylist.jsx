import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";

// const STORE_ID = process.env.REACT_APP_STORE_ID;

const EditCategoryList = ({ categoryData, onRefresh }) => {
  const [formData, setFormData] = useState({
    categoryId: 1,
    name: "",
    // slug: "computers",
    // status: true,
    description: "",
    image: null,
    storeId: "67aa7f75-0ed9-4378-9b3d-50e1e34903ce",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusChange = (e) => {
    setFormData({
      ...formData,
      status: e.target.checked,
    });
  };

  useEffect(() => {
    if (categoryData) {
      setFormData({
        categoryId: categoryData.categoryId,
        name: categoryData.categoryName || "",
        description: categoryData.description || "",
        image: null, // We'll handle image separately
        storeId: categoryData.storeId,
      });
    }
  }, [categoryData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const BASE_URL = process.env.REACT_APP_BASEURL;

    if (!formData.name.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      setIsSubmitting(true);

      // Use the same payload structure as your add functionality
      const payload = {
        categoryId: formData.categoryId,
        CategoryName: formData.name.trim(),
        description: formData.description.trim(),
        storeId: formData.storeId,
        image: formData.image ? formData.image.name : categoryData?.image,
      };

      const response = await axios.post(
        `${BASE_URL}api/v1/Product/SaveCategories`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);
      alert("Category updated successfully!");
      if (onRefresh) await onRefresh();
      document.getElementById("add-category")?.classList.remove("show");
      document.querySelector(".modal-backdrop")?.remove();
      document.body.classList.remove("modal-open");
      document.body.style.paddingRight = "";
    } catch (error) {
      console.error("Error updating category:", error);
      alert(error.response?.data?.message || "Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal fade" id="edit-category">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="page-wrapper-new p-0">
            <div className="content">
              <div className="modal-header">
                <div className="page-title">
                  <h4>Edit Category</h4>
                </div>
                <button
                  type="button"
                  className="close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">×</span>
                </button>{" "}
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">
                      Category<span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Category Slug<span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Upload Image</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="mb-0">
                    <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                      <span className="status-label">
                        Active<span className="text-danger ms-1">*</span>
                      </span>
                      <input
                        type="checkbox"
                        id="edit-category-status"
                        className="check"
                        checked={formData.status}
                        onChange={handleStatusChange}
                      />
                      <label
                        htmlFor="edit-category-status"
                        className="checktoggle"
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary fs-13 fw-medium p-2 px-3"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  data-bs-dismiss="modal"
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
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

EditCategoryList.propTypes = {
  categoryData: PropTypes.shape({
    categoryId: PropTypes.number,
    categoryName: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    imageUrl: PropTypes.string,
    storeId: PropTypes.string,
  }),
  onRefresh: PropTypes.func,
};

EditCategoryList.defaultProps = {
  categoryData: null,
  onRefresh: () => {},
};

export default EditCategoryList;
