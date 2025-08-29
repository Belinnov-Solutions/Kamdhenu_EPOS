import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
// import "bootstrap/dist/js/bootstrap.bundle.min";
import EditCategoryList from "../../core/modals/inventory/editcategorylist";
import Table from "../../core/pagination/datatable";
import CommonFooter from "../../core/common/footer/commonFooter";
// import CommonDeleteModal from "../../core/common/modal/commonDeleteModal";
import { useSelector } from "react-redux";
import MessageModal from "./MessageModal";
const CategoryList = () => {
  const storeId = useSelector((state) => state.user.storeId);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [dataSource, setDataSource] = useState([]);
  const [formData, setFormData] = useState({
    categoryId: 0,
    name: "",
    storeId: storeId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fetchCategories = async () => {
    const BASE_URL = process.env.REACT_APP_BASEURL;
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${BASE_URL}api/v1/Product/GetCategories?storeId=${storeId}`
      );

      const transformedData = response.data.data.map((item) => ({
        id: item.categoryId,
        category: item.categoryName,
        categoryslug: "default-slug",
        createdon: new Date().toLocaleDateString(),
        status: "Active",
        originalData: item,
      }));

      setDataSource(transformedData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    const BASE_URL = process.env.REACT_APP_BASEURL;

    if (!formData.name.trim()) {
      setMessageModal({
        isOpen: true,
        title: "Validation Error",
        message: "Category name is required",
        type: "error",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        CategoryName: formData.name.trim(),
        storeId: formData.storeId,
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

      setMessageModal({
        isOpen: true,
        title: "Success",
        message: response.data.message || "Category added successfully!",
        type: "success",
      });

      await fetchCategories();

      // Reset form
      setFormData({
        name: "",
        storeId: storeId,
      });

      // Close modal
      setShowAddModal(false);
    } catch (error) {
      console.error("Full error:", error);
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
  // helper functions for message modal
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

  const handleCloseAddModal = () => {
    setFormData({
      name: "",
      storeId: storeId,
    });
    setShowAddModal(false);
  };

  // Delete category function
  const deleteCategory = async () => {
  if (!categoryToDelete) return;

  const BASE_URL = process.env.REACT_APP_BASEURL;

try {
  await axios.post(`${BASE_URL}api/v1/Product/DeleteCategory`, null, {
    params: {
      categoryId: categoryToDelete,
      storeId: storeId,
    },
  });

    fetchCategories();

    setMessageModal({
      isOpen: true,
      title: "Success",
      message: "Category deleted successfully!",
      type: "success",
    });
  } catch (error) {
    console.error("Failed to delete category:", error);
    setMessageModal({
      isOpen: true,
      title: "Error",
      message: "Failed to delete category. Please try again.",
      type: "error",
    });
  }
};

  // Handle delete click - set the category to delete and show modal
  const handleDeleteClick = (categoryId) => {
    setCategoryToDelete(categoryId);
    setShowDeleteModal(true);
  };
  // Handle confirm delete - called when user confirms deletion
  const handleConfirmDelete = () => {
    deleteCategory();
    setShowDeleteModal(false);
  };
  const handleCloseDeleteModal = () => {
    setCategoryToDelete(null);
    setShowDeleteModal(false);
  };
  // reset form data when opening add modal
  useEffect(() => {
    if (showAddModal) {
      setFormData({
        name: "",
        storeId: storeId,
      });
    }
  }, [showAddModal, storeId]);

  const columns = [
    {
      title: "Category",
      dataIndex: "category",
      sorter: (a, b) => a.category.localeCompare(b.category),
      width: "40%",
    },
    {
      title: "",
      dataIndex: "actions",
      key: "actions",
      width: "100px",
      render: (text, record) => (
        <div className="action-table-data">
          <div className="edit-delete-action">
            <Link
              className="me-2 p-2"
              to="#"
              onClick={() => {
                setSelectedCategory({
                  ...record.originalData,
                  imageUrl: record.imageUrl,
                });
                setShowEditModal(true);
              }}
            >
              <i data-feather="edit" className="feather-edit"></i>
            </Link>
            <Link
              className="p-2"
              to="#"
              onClick={() => handleDeleteClick(record.id)}
            >
              <i data-feather="trash-2" className="feather-trash-2"></i>
            </Link>
          </div>
        </div>
      ),
    }
  ];

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4 className="fw-bold">Category</h4>
                <h6>Manage your categories</h6>
              </div>
            </div>
            <ul className="table-top-head">
              {/* TooltipIcons and RefreshIcon can be added here if needed */}
            </ul>
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                <i className="ti ti-circle-plus me-1"></i>
                Add Category
              </Link>
            </div>
          </div>

          <div className="card table-list-card " style={{ border: "none" }}>
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <div className="search-set">
                <div className="search-input">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search..."
                  />
                  <button className="btn btn-searchset">
                    <i className="ti ti-search"></i>
                  </button>
                </div>
              </div>
              <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                {/* Dropdown menus can be added here if needed */}
              </div>
            </div>
            <div className="card-body mt-2">
              <div className="table-responsive category-table">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading categories...</p>
                  </div>
                ) : dataSource.length === 0 ? (
                  <div className="text-center py-4">
                    <p>No categories found</p>
                    <button
                      className="btn btn-primary mt-2"
                      onClick={fetchCategories}
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <Table
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="id"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <CommonFooter />
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
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
                      // data-bs-dismiss="modal"
                      onClick={handleCloseAddModal}
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
                    </form>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3"
                      // data-bs-dismiss="modal"
                      onClick={handleCloseAddModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary fs-13 fw-medium p-2 px-3"
                      onClick={handleAddCategory}
                      // data-bs-dismiss="modal"
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

      )}
      <EditCategoryList
        categoryData={selectedCategory}
        onRefresh={fetchCategories}
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
                    Delete Category
                  </h4>
                  <p className="text-gray-6 mb-0 fs-16">
                    Are you sure you want to delete this category?
                  </p>
                  <div className="modal-footer-btn mt-3 d-flex justify-content-center">
                    <button
                      type="button"
                      className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                      onClick={handleCloseDeleteModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary fs-13 fw-medium p-2 px-3"
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
    </div>
  );
};

export default CategoryList;
