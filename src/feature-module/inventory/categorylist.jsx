import React, { useState, useEffect } from "react"; // Added useEffect import
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/js/bootstrap.bundle.min";
import EditCategoryList from "../../core/modals/inventory/editcategorylist";
import Table from "../../core/pagination/datatable";
// import TooltipIcons from "../../core/common/tooltip-content/tooltipIcons";
// import RefreshIcon from "../../core/common/tooltip-content/refresh";
// import CollapesIcon from "../../core/common/tooltip-content/collapes";
import CommonFooter from "../../core/common/footer/commonFooter";
import CommonDeleteModal from "../../core/common/modal/commonDeleteModal";
import { useSelector } from "react-redux";

// Access environment variables

// const STORE_ID = process.env.REACT_APP_STORE_ID;

const CategoryList = () => {
  const storeId = useSelector((state) => state.user.storeId);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // const dataSource = useSelector(
  //   (state) => state.rootReducer.categotylist_data
  // );

  const [dataSource, setDataSource] = useState([]);

  const [formData, setFormData] = useState({
    categoryId: 0,
    name: "",
    image: null,
    description: "",
    storeId: storeId,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = async () => {
    const BASE_URL = process.env.REACT_APP_BASEURL;
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${BASE_URL}api/v1/Product/GetCategories?storeId=${storeId}`,
      );

      const transformedData = response.data.data.map((item) => ({
        id: item.categoryId,
        category: item.categoryName,
        description: item.description,
        categoryslug: "default-slug",
        createdon: new Date().toLocaleDateString(),
        status: "Active",
        imageUrl: item.image
          ? `${BASE_URL}images/categories/${item.image}`
          : null,
        originalData: item,
      }));

      setDataSource(transformedData); // Update local state with API data
    } catch (error) {
      console.error("Error fetching categories:", error);
      // You might want to set some error state here for UI feedback
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
        CategoryName: formData.name.trim(),
        image: formData.image.name,
        storeId: formData.storeId,
        description: formData.description.trim(),
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

      alert("Category added successfully!");
      console.log("API Response:", response.data);
      await fetchCategories();

      // Reset form
      setFormData({
        name: "",
        image: null,
        description: "",
        storeId: storeId,
      });

      // Close modal - more reliable method
      document.getElementById("add-category")?.classList.remove("show");
      document.querySelector(".modal-backdrop")?.remove();
      document.body.classList.remove("modal-open");
      document.body.style.paddingRight = "";
    } catch (error) {
      console.error("Full error:", error);
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

  const columns = [
    // {
    //   title: "Image",
    //   dataIndex: "imageUrl",
    //   render: (imageUrl) =>
    //     imageUrl ? (
    //       <img
    //         src={imageUrl}
    //         alt="Category"
    //         style={{
    //           width: "50px",
    //           height: "50px",
    //           objectFit: "cover",
    //           borderRadius: "4px",
    //         }}
    //       />
    //     ) : (
    //       <span className="text-muted">No image</span>
    //     ),
    // },
    {
      title: "Category",
      dataIndex: "category",
      sorter: (a, b) => a.category.localeCompare(b.category),
    },
    // {
    //   title: "Category Slug",
    //   dataIndex: "categoryslug",
    //   sorter: (a, b) => a.categoryslug.localeCompare(b.categoryslug),
    // },
    // {
    //   title: "Description",
    //   dataIndex: "description",
    //   sorter: (a, b) => a.categoryslug.localeCompare(b.description),
    // },
    {
      title: "Created On",
      dataIndex: "createdon",
      sorter: (a, b) => new Date(a.createdon) - new Date(b.createdon),
    },
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   render: (text) => (
    //     <span className="badge bg-success fw-medium fs-10">{text}</span>
    //   ),
    //   sorter: (a, b) => a.status.localeCompare(b.status),
    // },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (text, record) => (
        <div className="action-table-data">
          <div className="edit-delete-action">
            <Link
              className="me-2 p-2"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#edit-category"
              onClick={() =>
                setSelectedCategory({
                  ...record.originalData,
                  imageUrl: record.imageUrl,
                })
              }
            >
              <i data-feather="edit" className="feather-edit"></i>
            </Link>
            {/* <Link
              data-bs-toggle="modal"
              data-bs-target="#delete-modal"
              className="p-2"
              to="#"
            >
              <i data-feather="trash-2" className="feather-trash-2"></i>
            </Link> */}
          </div>
        </div>
      ),
    },
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
              {/* <TooltipIcons />
              <RefreshIcon onClick={fetchCategories} /> */}
              {/* <CollapesIcon /> */}
            </ul>
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#add-category"
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
                {/* <div className="dropdown me-2">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown" 
                  >
                    Status
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Active
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Inactive
                      </Link>
                    </li>
                  </ul>
                </div>  
                <div className="dropdown">
                  <Link
                    to="#"
                    className="dropdown-t  btn-md d-inline-flex align-items-center"
                   
                  >
                  </Link>
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Sort By : Last 7 Days
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Recently Added
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Ascending
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Descending
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Last Month
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Last 7 Days
                      </Link>
                    </li>
                  </ul>
                </div> */}
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
      <div className="modal fade" id="add-category">
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

      <EditCategoryList
        categoryData={selectedCategory}
        onRefresh={fetchCategories}
      />
      <CommonDeleteModal />
    </div>
  );
};

export default CategoryList;
