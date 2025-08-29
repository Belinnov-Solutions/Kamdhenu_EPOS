import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
// const STORE_ID = process.env.REACT_APP_STORE_ID;

const EditCategoryList = ({ categoryData, onRefresh, isOpen, onClose, onMessage }) => {
  const { storeId } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    categoryId: 1,
    name: "",
    // slug: "computers",
    // status: true,
    description: "",
    image: null,
   storeId: storeId || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // const handleStatusChange = (e) => {
  //   setFormData({
  //     ...formData,
  //     status: e.target.checked,
  //   });
  // };

  useEffect(() => {
    if (categoryData) {
      setFormData({
        categoryId: categoryData.categoryId,
        name: categoryData.categoryName || "",
        description: categoryData.description || "",
        image: null, // We'll handle image separately
        storeId: storeId || categoryData.storeId,
      });
    }
  }, [categoryData,storeId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleFileChange = (e) => {
  //   setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const BASE_URL = process.env.REACT_APP_BASEURL;

   if (!formData.name.trim()) {
  onMessage({
    title: "Validation Error",
    message: "Category name is required",
    type: "error",
  });
  return;
}

   try {
  setIsSubmitting(true);

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

  onMessage({
    title: "Success",
    message: response.data.message || "Category updated successfully!",
    type: "success",
  });

  if (onRefresh) await onRefresh();
  onClose(); // Close the modal
} catch (error) {
  console.error("Error updating category:", error);
  onMessage({
    title: "Error",
    message: error.response?.data?.message || "Failed to update category",
    type: "error",
  });
} finally {
  setIsSubmitting(false);
}
  };

  return (
     <>
    {isOpen && (
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
                  <h4>Edit Category</h4>
                </div>
                <button
                  type="button"
                 className="close bg-danger text-white fs-16"
                    onClick={onClose}
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
                  {/* <div className="mb-3">
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
                  </div> */}
                  {/* <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div> */}
                  {/* <div className="mb-3">
                    <label className="form-label">Upload Image</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div> */}
                  {/* <div className="mb-0">
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
                  </div> */}
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary fs-13 fw-medium p-2 px-3"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                 
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
    )}
  </>
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
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onMessage: PropTypes.func,
};

EditCategoryList.defaultProps = {
  categoryData: null,
  onRefresh: () => {},
  isOpen: false,
  onClose: () => {},
  onMessage: () => {},
};

export default EditCategoryList;
