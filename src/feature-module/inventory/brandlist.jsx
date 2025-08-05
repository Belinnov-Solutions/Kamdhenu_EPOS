import React, { useEffect } from "react";
import { Link } from "react-router-dom/dist";
import Table from "../../core/pagination/datatable";
// import ImageWithBasePath from "../../core/img/imagewithbasebath";
// import TooltipIcons from "../../core/common/tooltip-content/tooltipIcons";
// import RefreshIcon from "../../core/common/tooltip-content/refresh";
// import CollapesIcon from "../../core/common/tooltip-content/collapes";
import CommonFooter from "../../core/common/footer/commonFooter";
// import { PlusCircle, X } from "feather-icons-react/build/IconComponents";
import CommonDeleteModal from "../../core/common/modal/commonDeleteModal";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const BrandList = () => {
  const storeId = useSelector((state) => state.user.storeId);
  const [loading, setLoading] = React.useState(false);
  const [brands, setBrands] = React.useState([]);
  const [newBrand, setNewBrand] = React.useState({
    brandId: null,
    brandName: "",
    storeId: storeId,
    isActive: true,
    // logo: null // For image upload if needed
  });
  // const storeId = "67aa7f75-0ed9-4378-9b3d-50e1e34903ce";
  const [editingBrand, setEditingBrand] = React.useState(null);
  useEffect(() => {
    if (storeId) {
      fetchBrands();
    }
  }, [storeId]);

  const fetchBrands = async () => {
    try {
      const BASE_URL = process.env.REACT_APP_BASEURL;
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}api/v1/Product/GetReferenceData?storeId=${storeId}`
      );

      const transformedBrands = response.data.data.brands.map(brand => ({
        key: brand.brandId,
        brand: brand.brandName,
        // logo: "assets/img/brand/brand-icon-01.png",
        createdon: new Date().toLocaleDateString(),
        status: brand.isActive ? "Active" : "Inactive",
        isActive: brand.isActive,
        brandId: brand.brandId
      }));

      setBrands(transformedBrands);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching brands:", error);
      setLoading(false);
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    try {
      const BASE_URL = process.env.REACT_APP_BASEURL;

      const payload = {
        brandId: newBrand.brandId,
        brandName: newBrand.brandName,
        storeId: newBrand.storeId,
        isActive: newBrand.isActive,
      };

      const response = await axios.post(
        `${BASE_URL}api/v1/Product/SaveBrands`,
        // `${process.env.REACT_APP_BASEURL}api/v1/Product/SaveBrands`,   
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.success) {
        // Refresh the brand list
        await fetchBrands();
        // Reset form
        setNewBrand({
          brandId: "",
          storeId: storeId,

          brandName: "",
          isActive: true,
          logo: null
        });
        // Close modal
        document.getElementById('closeAddBrandModal').click();
        // Show success message
        toast.success("Brand added successfully!");
      } else {
        throw new Error("Failed to add brand");
      }
    } catch (error) {
      console.error("Error adding brand:", error);
      toast.error("Failed to add brand. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewBrand(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const columns = [
    {
      title: "Brand",
      dataIndex: "brand",
      // sorter: (a, b) => a.brand.length - b.brand.length,
    },
    // {
    //   title: "Image",
    //   dataIndex: "logo",
    //   render: (text, record) => (
    //     <span className="productimgname">
    //       <Link to="#" className="product-img stock-img">
    //         <ImageWithBasePath alt="" src={record.logo} />
    //       </Link>
    //     </span>
    //   ),
    //   sorter: (a, b) => a.logo.length - b.logo.length,
    //   width: "5%",
    // },
    // {
    //   title: "Created Date",
    //   dataIndex: "createdon",
    //   sorter: (a, b) => a.createdon.length - b.createdon.length,
    // },
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   render: (text) => (
    //     <span className={`badge table-badge ${text === "Active" ? "bg-success" : "bg-danger"} fw-medium fs-10`}>
    //       {text}
    //     </span>
    //   ),
    //   sorter: (a, b) => a.status.length - b.status.length,
    // },
    {
      title: "",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <div className="action-table-data">
          <div className="edit-delete-action">
            <Link
              className="me-2 p-2"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#edit-brand"
              onClick={() => handleEdit(record)}
            >
              <i data-feather="edit" className="feather-edit"></i>
            </Link>
            <Link
              data-bs-toggle="modal"
              data-bs-target="#delete-modal"
              className="p-2"
              to="#"
              onClick={() => handleDelete(record)}
            >
              <i data-feather="trash-2" className="feather-trash-2"></i>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  const handleEdit = (record) => {
    setEditingBrand({
      brandId: record.brandId,
      brandName: record.brand,
      storeId: storeId,
      isActive: record.isActive
    });
  };
  const handleEditBrand = async (e) => {
    e.preventDefault();
    try {
      const BASE_URL = process.env.REACT_APP_BASEURL;

      const payload = {
        brandId: editingBrand.brandId,
        brandName: editingBrand.brandName,
        storeId: editingBrand.storeId,
        isActive: editingBrand.isActive,
      };

      const response = await axios.post(
        `${BASE_URL}api/v1/Product/SaveBrands`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.success) {
        await fetchBrands();
        document.getElementById('closeEditBrandModal').click();
        toast.success("Brand updated successfully!");
      } else {
        throw new Error("Failed to update brand");
      }
    } catch (error) {
      console.error("Error updating brand:", error);
      toast.error("Failed to update brand. Please try again.");
    }
  };
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingBrand(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDelete = (record) => {
    // Handle delete logic here
    console.log("Deleting:", record);
    // You might want to set the current brand in state for the delete modal
  };

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4 className="fw-bold">Brand</h4>
                <h6>Manage your brands</h6>
              </div>
            </div>
            <ul className="table-top-head">
              {/* <TooltipIcons />
              <RefreshIcon onClick={fetchBrands} />
              <CollapesIcon /> */}
            </ul>
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#add-brand"
              >
                <i className='ti ti-circle-plus me-1'></i>
                Add Brand
              </Link>
            </div>
          </div>
          {/* /product list */}
           <div className="card table-list-card">
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
               </div>
            </div>
                {/* <div className="dropdown me-2">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Status
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
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
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Sort By : Last 7 Days
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
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
                        Desending
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
                </div>
              </div>
            </div>*/}
          <div className="card-body">
            <div className="table-responsive brand-table">
              {loading ? (
                <div className="text-center py-4">Loading brands...</div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={brands.length ? brands : []}
                  rowKey="key"
                />
              )}
            </div>
          </div>
          </div>
          {/* </div>  */}
          {/* /product list */}
        </div>
        <CommonFooter />
      </div>
      <>
        {/* Add Brand */}
        <div className="modal fade" id="add-brand">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="page-wrapper-new p-0">
                <div className="content">
                  <div className="modal-header">
                    <div className="page-title">
                      <h4>Add Brand</h4>
                    </div>
                    <button
                      type="button"
                      className="close bg-danger text-white fs-16"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                      id="closeAddBrandModal"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                  <div className="modal-body custom-modal-body new-employee-field">
                    <form onSubmit={handleAddBrand}>
                      {/* <div className="profile-pic-upload mb-3">
                      <div className="profile-pic brand-pic">
                        <span>
                          <PlusCircle className="plus-down-add" />  Add Image
                        </span>
                      </div>
                      <div>
                        <div className="image-upload mb-0">
                          <input 
                            type="file" 
                            onChange={(e) => setNewBrand({...newBrand, logo: e.target.files[0]})}
                          />
                          <div className="image-uploads">
                            <h4>Upload Image</h4>
                          </div>
                        </div>
                        <p className="mt-2">JPEG, PNG up to 2 MB</p>
                      </div>
                    </div> */}
                      <div className="mb-3">
                        <label className="form-label">
                          Brand<span className="text-danger ms-1">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="brandName"
                          value={newBrand.brandName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-0">
                        <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                          <span className="status-label">Status</span>
                          <input
                            type="checkbox"
                            id="user2"
                            className="check"
                            name="isActive"
                            checked={newBrand.isActive}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="user2" className="checktoggle" />
                        </div>
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
                          type="submit"
                          className="btn btn-primary fs-13 fw-medium p-2 px-3"
                          data-bs-dismiss="modal"
                        >
                          Add Brand
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /Add Brand */}
        {/* Edit Brand */}
        <div className="modal fade" id="edit-brand">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="page-wrapper-new p-0">
                <div className="content">
                  <div className="modal-header">
                    <div className="page-title">
                      <h4>Edit Brand</h4>
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
                  <div className="modal-body custom-modal-body new-employee-field">
                    {editingBrand && (
                      <form onSubmit={handleEditBrand}>
                        {/* <div className="profile-pic-upload mb-3">
                        <div className="profile-pic brand-pic">
                          <span>
                            <ImageWithBasePath src="assets/img/brand/brand-icon-02.png" alt="Img" />
                          </span>
                          <Link to="#" className="remove-photo">
                            <X className="x-square-add" />
                          </Link>
                        </div>
                        <div>
                          <div className="image-upload mb-0">
                            <input type="file" />
                            <div className="image-uploads">
                              <h4>Change Image</h4>
                            </div>
                          </div>
                          <p className="mt-2">JPEG, PNG up to 2 MB</p>
                        </div>
                      </div> */}
                        <div className="mb-3">
                          <label className="form-label">
                            Brand<span className="text-danger ms-1">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="brandName"
                            value={editingBrand.brandName}
                            onChange={handleEditInputChange}
                          />
                        </div>
                        <div className="mb-0">
                          <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                            <span className="status-label">Status</span>
                            <input
                              type="checkbox"
                              id="user4"
                              className="check"
                              name="isActive"
                              checked={editingBrand.isActive}
                              onChange={handleEditInputChange}
                            // defaultChecked
                            />
                            <label htmlFor="user4" className="checktoggle" />
                          </div>
                        </div>

                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                            data-bs-dismiss="modal"
                          >
                            Cancel
                          </button>
                          {/* <Link
                      to="#"
                      data-bs-dismiss="modal"
                      className="btn btn-primary fs-13 fw-medium p-2 px-3"
                    >
                      Save Changes
                    </Link> */}
                          <button
                            type="submit"
                            className="btn btn-primary fs-13 fw-medium p-2 px-3"
                            data-bs-dismiss="modal"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Edit Brand */}
        <CommonDeleteModal />
      </>

    </div>
  );
};

export default BrandList;
