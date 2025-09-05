import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Table from "../../core/pagination/datatable";
import CommonFooter from "../../core/common/footer/commonFooter";
import Select from "react-select";
import EditSubcategories from "./editsubcategories";
import axios from "axios";
import { useSelector } from "react-redux";
import MessageModal from "./MessageModal";

const SubCategories = () => {
  const storeId = useSelector((state) => state.user.storeId);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // For Add
  const [values, setValue] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For edit
  const [editId, setEditId] = useState(null);

  // For delete
  const [subCategoryToDelete, setSubCategoryToDelete] = useState(null);
const [showDeleteModal, setShowDeleteModal] = useState(false);
  // State For storing the values
  const [dataSource, setDataSource] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleMessage = (messageData) => {
    setMessageModal({
      isOpen: true,
      title: messageData.title,
      message: messageData.message,
      type: messageData.type,
    });
  };

  const closeMessageModal = () => {
    setMessageModal({ ...messageModal, isOpen: false });
  };
  //  const apiBase = getConfig().API_BASE_URL;
const apiBase = window.__APP_CONFIG__?.API_BASE_URL || "";
  // Fetch categories for dropdown
   const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${apiBase}api/v1/Product/GetReferenceData?storeId=${storeId}`
      );
      if (
        response.data &&
        response.data.data &&
        response.data.data.categories
      ) {
        const categoryOptions = response.data.data.categories.map(
          (category) => ({
            value: category.categoryId,
            label: category.categoryName,
          })
        );
        setCategories(categoryOptions);
      }
    } catch (error) {
      console.error("Error fetching categories", error);
      handleMessage({
        title: "Error",
        message: "Failed to fetch categories. Please try again.",
        type: "error",
      });
    }
  };

  const fetchSubCategories = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${apiBase}api/v1/Product/GetSubcategories?storeId=${storeId}`
      );
      if (response.data && response.data.data) {
        const subcategories = response.data.data.map((item) => ({
          subCategoryId: item.subCategoryId,
          subCategoryName: item.subCategoryName,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          image: item.image,
          code: item.code || item.Code,
          description: item.description,
          status: item.status || item.Status,
        }));
        setDataSource(subcategories);
      } else {
        console.log("No data found in response.");
      }
    } catch (error) {
      console.error("Error fetching subcategories", error);
      handleMessage({
        title: "Error",
        message: "Failed to fetch subcategories. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // calling api on full page refresh
  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

 const handleSubmit = async () => {
    if (!selectedCategory || !subCategoryName || !values) {
      handleMessage({
        title: "Validation Error",
        message: "Please fill all required fields",
        type: "error",
      });
      return;
    }

    const payload = {
      categoryId: selectedCategory.value,
      SubCategoryName: subCategoryName,
      image: imageFile?.name || "",
      code: categoryCode,
      storeid: storeId,
      description: values,
      status: status ? "Active" : "Inactive",
    };

    try {
      setIsSubmitting(true);
       await axios.post(
        `${apiBase}api/v1/Product/savesubcategories`,
        payload
      );
      
      handleMessage({
        title: "Success",
        message: "Subcategory added successfully",
        type: "success",
      });
      
      await fetchSubCategories();
      resetForm();
      setShowAddModal(false);
    } catch (error) {
      console.error("Error:", error);
      handleMessage({
        title: "Error",
        message: "Error adding subcategory",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleEditClick = (record) => {
    setEditId(record.subCategoryId);
    setShowEditModal(true);
  };
  // Delete subcategory function
  const deleteSubCategory = async () => {
    if (!subCategoryToDelete) return;

   try {
  await axios.post(
    `${apiBase}api/v1/Product/DeleteSubCategory`,
    null, // no body, since we're passing params
    {
      params: {
        subCategoryId: subCategoryToDelete,
        storeId: storeId,
      },
    }
  );
      // Refresh the subcategory list after successful deletion
      fetchSubCategories();

      // Show success message
     handleMessage({
        title: "Success",
        message: "Subcategory deleted successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to delete subcategory:", error);

      // Show error message
       handleMessage({
        title: "Error",
        message: "Failed to delete subcategory. Please try again.",
        type: "error",
      });
    }
  };

  // Handle delete click - set the subcategory to delete and show modal
  const handleDeleteClick = (subCategoryId) => {
    setSubCategoryToDelete(subCategoryId);
     setShowDeleteModal(true);
  };

  // Handle confirm delete - called when user confirms deletion
  const handleConfirmDelete = () => {
    deleteSubCategory();
    setShowDeleteModal(false);
    setSubCategoryToDelete(null);
  };

  // Filter data based on search text
  const filteredData = dataSource.filter((item) => {
    return (
      item.subCategoryName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchText.toLowerCase()))
    );
  });

  const columns = [
    {
      title: "Sub Category",
      dataIndex: "subCategoryName",
      key: "subCategoryName",
      sorter: (a, b) => a.subCategoryName.localeCompare(b.subCategoryName),
    },
    {
      title: "Category",
      dataIndex: "categoryName",
      key: "categoryName",
      sorter: (a, b) => a.categoryName.localeCompare(b.categoryName),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
  title: "Actions",
  dataIndex: "actions",
  key: "actions",
  render: (_, record) => (
    <div className="action-table-data">
      <div className="edit-delete-action">
        <Link
          className="me-2 p-2"
          to="#"
          onClick={() => handleEditClick(record)}
        >
          <i data-feather="edit" className="feather-edit"></i>
        </Link>
        <Link
          className="p-2"
          to="#"
          onClick={() => handleDeleteClick(record.subCategoryId)}
        >
          <i data-feather="trash-2" className="feather-trash-2"></i>
        </Link>
      </div>
    </div>
  ),
},
  ];

  // reset form values after add subcategory
  const resetForm = () => {
    setSubCategoryName("");
    setCategoryCode("");
    setSelectedCategory(null);
    setValue("");
    setImageFile(null);
    setStatus(true);
  };
   const handleCloseAddModal = () => {
    resetForm();
    setShowAddModal(false);
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4 className="fw-bold">Sub Category</h4>
                <h6>Manage your sub categories</h6>
              </div>
            </div>
            <ul className="table-top-head">
              {/* TooltipIcons, RefreshIcon, CollapesIcon can be added here if needed */}
            </ul>
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-primary"
                // data-bs-toggle="modal"
                // data-bs-target="#add-category"
                 onClick={() => setShowAddModal(true)}
              >
                <i className="ti ti-circle-plus me-1"></i> Add Sub Category
              </Link>
            </div>
          </div>

          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <div className="search-set">
                <div className="search-input">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  <button className="btn btn-searchset">
                    <i className="ti ti-search"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive sub-category-table">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading subcategories...</p>
                  </div>
                ) : dataSource.length === 0 ? (
                  <div className="text-center py-4">
                    <p>No subcategories found</p>
                    <button
                      className="btn btn-primary mt-2"
                      onClick={fetchSubCategories}
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <Table
                    columns={columns}
                    dataSource={searchText ? filteredData : dataSource}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <CommonFooter />
      </div>

      {/* Add Modal */}
      {showAddModal && (
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
                  id="closeAddModal"
                  className="close bg-danger text-white"
                  onClick={handleCloseAddModal}
                  // data-bs-dismiss="modal"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Category *</label>
                    <Select
                      classNamePrefix="react-select"
                      options={categories}
                      placeholder="select category"
                      value={selectedCategory}
                      onChange={(selected) => setSelectedCategory(selected)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Sub Category *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={subCategoryName}
                      onChange={(e) => setSubCategoryName(e.target.value)}
                      placeholder="Enter subcategory name"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={values}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Enter description"
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3"
                  onClick={handleCloseAddModal}
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
                        Creating...
                      </>
                    ) : (
                      "Create Subcategory"
                    )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
      {/* Edit Modal */}
      <EditSubcategories
        id={editId}
        onUpdate={fetchSubCategories}
        categories={categories}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onMessage={handleMessage}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
  <div
    className="modal fade show"
    style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
  >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content p-5 px-3 text-center">
                <span className="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2">
                  <i className="ti ti-trash fs-24 text-danger" />
                </span>
                <h4 className="fs-20 text-gray-9 fw-bold mb-2 mt-1">
                  Delete Subcategory
                </h4>
                <p className="text-gray-6 mb-0 fs-16">
                  Are you sure you want to delete this subcategory?
                </p>
                <div className="modal-footer-btn mt-3 d-flex justify-content-center">
                  <button
                    type="button"
                    className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                    // data-bs-dismiss="modal"
                    onClick={() => {
                      setSubCategoryToDelete(null)
                      setShowDeleteModal(false)}}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary fs-13 fw-medium p-2 px-3"
                    // data-bs-dismiss="modal"
                    onClick={handleConfirmDelete}
                  >
                    Yes Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
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

export default SubCategories;
