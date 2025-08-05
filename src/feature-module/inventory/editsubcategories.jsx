import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
// import Select from "react-select";
import axios from "axios";
// import { Category } from "../../core/common/selectOption/selectOption";
import { useSelector } from "react-redux";

const EditSubcategories = ({ id, onUpdate }) => {
  const storeId = useSelector((state) => state.user.storeId);
  // const [selectedCategory, setSelectedCategory] = useState(null);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [values, setValue] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState(true);
   const [originalData, setOriginalData] = useState(null);

  // const storeId = "67aa7f75-0ed9-4378-9b3d-50e1e34903ce";

   const resetForm = () => {
    setCategoryCode("");
    setValue("");
    setImageFile(null);
    setStatus(true);
  };

  const fetchSubcategoryDetails = useCallback(async () => {
    if (!id) return;
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}api/v1/Product/GetSubcategories?storeId=${storeId}`
      );

      const item = response.data.data.find(
        (sub) => sub.subCategoryId === id
      );

      if (item) {
        // setSelectedCategory(
        //   Category.find((cat) => cat.value === item.categoryId)
        // );
        setSubCategoryName(item.subCategoryName);
        setCategoryCode(item.code);
        setValue(item.description);
        setImageFile({ name: item.image });
        setStatus(item.status === "Active");
        setOriginalData(item);
      }
    } catch (error) {
      console.error("Error fetching subcategory details:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchSubcategoryDetails();
  }, [fetchSubcategoryDetails]);

  const handleEditSubmit = async () => {
    const payload = {
      SubCategoryId: id,
      categoryId: originalData?.categoryId || "",
      SubCategoryName: subCategoryName || originalData?.subCategoryName || "",
      image: imageFile?.name || originalData?.image || "",
      code: categoryCode || originalData?.code || "",
      storeid: storeId,
      description: values || originalData?.description || "",
      status: status ? "Active" : "Inactive",
    };

    try {
      await axios.post(
        `${process.env.REACT_APP_BASEURL}api/v1/Product/savesubcategories`,
        payload
      );
      alert("Subcategory updated successfully");
      await fetchSubcategoryDetails();
      onUpdate();
      resetForm();

    } catch (error) {
      console.error("Error updating subcategory:", error);
      alert("Error updating subcategory");
    }
  };

  return (
    <div className="modal fade" id="edit-category">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="content">
            <div className="modal-header">
              <div className="page-title">
                <h4>Edit Sub Category</h4>
              </div>
              <button
                type="button"
                className="close bg-danger text-white"
                data-bs-dismiss="modal"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Upload Image</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Sub Category</label>
                  <input
                    type="text"
                    className="form-control"
                    value={subCategoryName}
                    onChange={(e) => setSubCategoryName(e.target.value)}
                    placeholder={originalData?.subCategoryName || ""}
                  />
                </div>
               <div className="mb-3">
                  <label className="form-label">Category Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={categoryCode}
                    onChange={(e) => setCategoryCode(e.target.value)}
                    placeholder={originalData?.code || ""}
                  />
                </div>
                 <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={values}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={originalData?.description || ""}
                  />
                </div>
                <div className="mb-3">
                  <div className="status-toggle modal-status d-flex justify-content-between">
                    <span className="status-label">Active</span>
                    <input
                      type="checkbox"
                      id="edit-status"
                      className="check"
                      checked={status}
                      onChange={() => setStatus(!status)}
                    />
                    <label htmlFor="edit-status" className="checktoggle" />
                  </div>
                </div>
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
                onClick={handleEditSubmit}
                data-bs-dismiss="modal"
              >
                Update Subcategory
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

EditSubcategories.propTypes = {
  id: PropTypes.number,
  fetchSubCategories: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default EditSubcategories;
