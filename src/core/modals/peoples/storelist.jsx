import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import { Edit, Eye } from "react-feather";
import { Edit } from "react-feather";
// import { useSelector } from "react-redux";
import Table from "../../../core/pagination/datatable";
// import TooltipIcons from "../../common/tooltip-content/tooltipIcons";
// import RefreshIcon from "../../common/tooltip-content/refresh";
// import CollapesIcon from "../../common/tooltip-content/collapes";
import { PlusCircle } from "feather-icons-react/build/IconComponents";
import axios from "axios";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
const StoreList = () => {
  // const data = useSelector((state) => state.rootReducer.customerdata);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // fetxh stores from API

  const fetchStores = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASEURL}api/v1/Admin/GetStore`);
      // Map the API data to match our table structure
      const mappedData = response.data.map(store => ({
        ...store,
        CustomerName: store.name,
        Customer: store.username,
        Email: store.email,
        Phone: store.phone,
        Country: store.address,
        id: store.id
      }));
      setStores(mappedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStores();
  }, []);
  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    username: '',
    phone: '',
    email: '',
    isActive: true,
    password: '',
    tagline: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  // hadle form submission for adding a store
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        id: null,
        tenantId: "fdf273ba-8057-4f6c-99fb-678d25a2c996"
      };

      await axios.post(`${process.env.REACT_APP_BASEURL}api/v1/Admin/SaveStore`, payload);

      // Close modal
      // document.getElementById('add-store').classList.remove('show');
      // document.querySelector('.modal-backdrop').remove();

      // Refresh store list
      fetchStores();

      // Reset form
      setFormData({
        name: '',
        address: '',
        username: '',
        phone: '',
        email: '',
        isActive: true,
        password: ''
      });

    } catch (error) {
      console.error('Error adding store:', error);
      // You might want to add error handling here
    } finally {
      setIsSubmitting(false);
    }
  };
  // State for editing store
  const [editingStore, setEditingStore] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    address: '',
    username: '',
    phone: '',
    email: '',
    isActive: true,
    password: ''
  });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  // Handle input changes for edit form
  const handleEditClick = (store) => {
    setEditingStore(store);
    setEditFormData({
      name: store.name,
      address: store.address,
      username: store.username,
      phone: store.phone,
      email: store.email,
      isActive: store.isActive,
      password: '' // Password is typically not retrieved for security reasons
    });
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const payload = {
        ...editFormData,
        id: editingStore.id, // Use the existing ID for update
        tenantId: "fdf273ba-8057-4f6c-99fb-678d25a2c996"
      };

      await axios.post(`${process.env.REACT_APP_BASEURL}api/v1/Admin/SaveStore`, payload);

      // Refresh store list
      await fetchStores();

      // Close modal
      const modal = document.getElementById('edit-store');
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();

    } catch (error) {
      console.error('Error updating store:', error);
      // Add error handling here (e.g., show toast notification)
    } finally {
      setIsUpdating(false);
    }
  };

  const columns = [
    {
      title: "Store Name",
      dataIndex: "CustomerName",
      sorter: (a, b) => a.CustomerName.localeCompare(b.CustomerName),
    },

    {
      title: "Contact Person",
      dataIndex: "Customer",
      sorter: (a, b) => a.Customer.localeCompare(b.Customer),

    },

    {
      title: "Email",
      dataIndex: "Email",
     sorter: (a, b) => a.Email.localeCompare(b.Email),
    },

    {
      title: "Phone",
      dataIndex: "Phone",
      // sorter: (a, b) => a.Phone.length - b.Phone.length,
    },
    {
      title: "City",
      dataIndex: "City",
      sorter: (a, b) => a.City.localeCompare(b.City),

    },
    {
      title: "State",
      dataIndex: "State",
       sorter: (a, b) => a.State.localeCompare(b.State),
    },

    {
      title: "Country",
      dataIndex: "Country",
       sorter: (a, b) => a.Country.localeCompare(b.Country),
    },
    // {
    //   title: "Status",
    //   dataIndex: "Code",
    //   render: () => (
    //     <span className={`badge  badge-success d-inline-flex align-items-center badge-xs`}>
    //       <i className="ti ti-point-filled me-1" />
    //       Active
    //     </span>

    //   ),
    //   // sorter: (a, b) => a.Code.length - b.Code.length,
    // },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <div className="action-table-data">
          <div className="edit-delete-action">
            <div className="input-block add-lists"></div>

            {/* <Link className="me-2 p-2" to="#">
              <Eye className="feather-view" />
            </Link> */}

            <Link
              className="me-2 p-2"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#edit-store"
              onClick={() => handleEditClick(record)}
            >
              <Edit className="feather-edit" />
            </Link>

            <Link
              data-bs-toggle="modal"
              data-bs-target="#delete-modal"
              className="p-2 d-flex align-items-center border rounded"
              to="#"
            >
              <i data-feather="trash-2" className="feather-trash-2" />
            </Link>
          </div>
        </div>
      ),
      // sorter: (a, b) => a.createdby.length - b.createdby.length,
    },
  ];
  if (loading) {
    return <div className="text-center py-4">Loading stores...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-danger">Error: {error}</div>;
  }

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Stores</h4>
                <h6>Manage your Store</h6>
              </div>
            </div>
            {/* <ul className="table-top-head">

              <TooltipIcons />
              <RefreshIcon />
              <CollapesIcon />
            </ul> */}
            <div className="page-btn">
              <Link to="#" data-bs-toggle="modal" data-bs-target="#add-store" className="btn btn-primary">
                <PlusCircle data-feather="plus-circle" className=" me-2" />
                Add Store
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

                {/* <div className="dropdown me-2">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Select Status
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
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        New Joiners
                      </Link>
                    </li>
                  </ul>
                </div> */}

              </div>
            </div>
            <div className="card-body pb-0">
              <div className=" table-responsive">
                <Table
                  columns={columns}
                  dataSource={stores}
                  rowKey="id" />
              </div>
            </div>
          </div>

          {/* /product list */}

        </div>
        <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
          <p className="mb-0">2025 © Belinnov Solutions. All Right Reserved</p>
          {/*<p>
            Designed &amp; Developed By{" "}
            <Link to="#" className="text-primary">
              Dreams
            </Link>
          </p>*/}
        </div>

      </div>
      <>
        {/* Add Store */}
        <div className="modal fade" id="add-store" style={{ display: 'none' }} aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '800px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <div className="page-title">
                  <h4>Add Store</h4>
                </div>
                <button
                  type="button"
                  className="close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                  {/* Row 1 */}
                  <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '300px' }}>
                  <div className="mb-3" >
                    <label className="form-label">
                      Store Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  </div>
                    <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '300px' }}>
                  <div className="mb-3">
                    <label className="form-label">
                      Tagline <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="tagline"
                      value={formData.tagline}
                    onChange={handleInputChange}
                    // required
                    />
                  </div>
                  </div>
                    <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '300px' }}>
                  <div className="mb-3">
                    <label className="form-label">
                      Address Line 1 <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="addressLine1"
                      value={formData.addressLine1}
                    onChange={handleInputChange}
                    // required
                    />
                  </div>
</div>
                  <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '300px' }}>
                  <div className="mb-3">
                    <label className="form-label">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="addressLine2"
                      value={formData.addressLine2}
                    onChange={handleInputChange}
                    />
                  </div>
                  </div>
                  <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '300px' }}>
                  <div className="mb-3">
                    <label className="form-label">
                      City <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      value={formData.city}
                    onChange={handleInputChange}
                    // required
                    />
                  </div>
                  </div>
                  <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '300px' }}>
                  <div className="mb-3">
                    <label className="form-label">
                      State <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="state"
                      value={formData.state}
                    onChange={handleInputChange}
                    // required
                    />
                  </div>
                  </div>
                  <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '300px' }}>
                  <div className="mb-3">
                    <label className="form-label">
                      Postal Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="postalCode"
                      value={formData.postalCode}
                    onChange={handleInputChange}
                    // required
                    />
                  </div>
                  </div>
                  <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '300px' }}>
                  <div className="mb-3">
                    <label className="form-label">
                      User Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      autoComplete="new-username"
                      required
                    />
                  </div>
                  </div>
                  <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '300px' }}>
                  <div className="input-blocks mb-3">
                    <label className="form-label">
                      Password <span className="text-danger">*</span>
                    </label>
                    <div className="pass-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control pass-input"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        autoComplete="new-password"
                        required
                      />
                      <span
                        className={`fas toggle-password ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}
                        onClick={togglePasswordVisibility}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                  </div>
                  <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '300px' }}>
                  <div className="mb-3">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  </div>
                  <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '300px' }}>
                  <div className="mb-3">
                    <label className="form-label">
                      Phone <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  </div>
                  <div style={{ flex: '1 1 calc(50% - 15px)', minWidth: '300px' }}>
                  <div className="mb-3">
                    <label className="form-label">
                      Country <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  </div>
                  <div style={{ flex: '1 1 100%', minWidth: '300px' }}>
                  <div className="mb-0">
                    <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                      <span className="status-label ">Status</span>
                      <input
                        type="checkbox"
                        id="user2"
                        className="check"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="user2" className="checktoggle" />
                    </div>
                  </div>
                 </div>
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
                    data-bs-dismiss="modal"
                    className="btn btn-primary fs-13 fw-medium p-2 px-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      'Add Store'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Add Store */}
        {/* Edit Store */}
        <div className="modal fade" id="edit-store">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div className="page-title">
                  <h4>Edit Store</h4>
                </div>
                <button
                  type="button"
                  className="close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      Store Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      User Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={editFormData.username}
                      onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                    />
                  </div>
                  <div className="input-blocks mb-3">
                    <label className="form-label">
                      Password <span className="text-danger">*</span>
                    </label>
                    <div className="pass-group">
                      <input
                        type={showEditPassword ? "text" : "password"}
                        className="form-control pass-input"
                        name="password"
                        value={editFormData.password}
                        onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                        required
                      />
                      <span
                        className={`fas toggle-password ${showEditPassword ? 'fa-eye' : 'fa-eye-slash'}`}
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Phone <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Country <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    // required
                    />
                  </div>
                  <div className="mb-0">
                    <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                      <span className="status-label ">Status</span>
                      <input
                        type="checkbox"
                        id="user1"
                        className="check"
                        name="isActive"
                        checked={editFormData.isActive}
                        onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                      />
                      <label htmlFor="user1" className="checktoggle" />
                    </div>
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
                    data-bs-dismiss="modal"
                    className="btn btn-primary fs-13 fw-medium p-2 px-3"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Edit Store */}
      </>

      <div className="modal fade" id="delete-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content p-5 px-3 text-center">
                <span className="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2">
                  <i className="ti ti-trash fs-24 text-danger" />
                </span>
                <h4 className="fs-20 text-gray-9 fw-bold mb-2 mt-1">
                  Delete Store
                </h4>
                <p className="text-gray-6 mb-0 fs-16">
                  Are you sure you want to delete employee?
                </p>
                <div className="modal-footer-btn mt-3 d-flex justify-content-center">
                  <button
                    type="button"
                    className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    data-bs-dismiss="modal"
                    className="btn btn-submit fs-13 fw-medium p-2 px-3"
                  >
                    Yes Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>

  );
};

export default StoreList;
