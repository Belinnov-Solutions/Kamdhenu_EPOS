import React, { useState, useEffect } from "react";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
// import ImageWithBasePath from "../../core/img/imagewithbasebath";
// import { ChevronUp, RotateCcw } from "feather-icons-react/build/IconComponents";
// import { setToogleHeader } from "../../core/redux/action";
// import { useDispatch, useSelector } from "react-redux";
import Table from "../../core/pagination/datatable";
import AddUsers from "../../core/modals/usermanagement/addusers";
import EditUser from "../../core/modals/usermanagement/edituser";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";

const Users = () => {

  const { roleName, userId } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);


  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}api/v1/User/GetUsers`,
        // `https://3663a08aa120.ngrok-free.app/api/v1/User/GetUsers`,
        {
          params: {
            userId: userId,
          },
        }
      );

      const formattedData = response.data.data.map((user) => ({
        // key: user.userid,        
        userId: user.userid,
        username: user.username,
        phone: user.phone || "N/A",
        email: user.email || "N/A",
        role: user.role || "N/A",
        store: user.storeName || "N/A",
        createdon: new Date(user.createdon || user.createdOn).toLocaleDateString(),
        status: user.isactive ? "Active" : "Inactive",

      }));
      setUsers(formattedData);

    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // const dispatch = useDispatch();
  // const data = useSelector((state) => state.rootReducer.toggle_header);
  // const dataSource = useSelector((state) => state.rootReducer.userlist_data);


  // const renderTooltip = (props) => (
  //   <Tooltip id="pdf-tooltip" {...props}>
  //     Pdf
  //   </Tooltip>
  // );
  // const renderExcelTooltip = (props) => (
  //   <Tooltip id="excel-tooltip" {...props}>
  //     Excel
  //   </Tooltip>
  // );
  // const renderPrinterTooltip = (props) => (
  //   <Tooltip id="printer-tooltip" {...props}>
  //     Printer
  //   </Tooltip>
  // );
  // const renderRefreshTooltip = (props) => (
  //   <Tooltip id="refresh-tooltip" {...props}>
  //     Refresh
  //   </Tooltip>
  // );
  // const renderCollapseTooltip = (props) => (
  //   <Tooltip id="refresh-tooltip" {...props}>
  //     Collapse
  //   </Tooltip>
  // );


  const columns = [
     ...(roleName === "Inventory Manager" || roleName === "Super Admin"
      ? [
        {
          title: "Store",
          dataIndex: "store",
          render: (text) => <span>{text || "N/A"}</span>,
          sorter: (a, b) => (a.store || "").localeCompare(b.store || ""),

        },
      ]
      : []),
    {
      title: "User Name",
      dataIndex: "username",
      // render: (text, record) => (
      //   <span className="userimgname">
      //     <Link to="#" className="userslist-img bg-img">
      //       <ImageWithBasePath alt="" src={record.img} />
      //     </Link>
      //     <div>
      //       <Link to="#">{text}</Link>
      //     </div>
      //   </span>
      // ),
      sorter: (a, b) => a.username.localeCompare(b.username),
    },

    {
      title: "Phone",
      dataIndex: "phone",
      sorter: (a, b) => a.phone.localeCompare(b.phone),

    },
    {
      title: "Email",
      dataIndex: "email",
       sorter: (a, b) => a.email.localeCompare(b.email),

    },
    {
      title: "Role",
      dataIndex: "role",
      sorter: (a, b) => a.role.localeCompare(b.role),
    },
    // {
    //   title: "Created On",
    //   dataIndex: "createdon",
    //   // sorter: (a, b) => a.createdon.length - b.createdon.length,
    //   sorter: (a, b) => new Date(a.createdon) - new Date(b.createdon),

    // },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => (
        <div>

          {text === "Active" && (
            <span className="d-inline-flex align-items-center p-1 pe-2 rounded-1 text-white bg-success fs-10"> <i className="ti ti-point-filled me-1 fs-11"></i>{text}</span>
          )}
          {text === "Inactive" && (
            <span className="d-inline-flex align-items-center p-1 pe-2 rounded-1 text-white bg-danger fs-10"> <i className="ti ti-point-filled me-1 fs-11"></i>{text}</span>
          )}
        </div>
      ),
      sorter: (a, b) => a.status.length - b.status.length,

    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <div className="action-table-data">
          <div className="edit-delete-action">
            {/* <Link className="me-2 p-2" to="#">
              <i
                data-feather="eye"
                className="feather feather-eye action-eye"
              ></i>
            </Link> */}
            <Link
              className="me-2 p-2"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#edit-units"
              onClick={() => setSelectedUser(record)}
            >
              <i data-feather="edit" className="feather-edit"></i>
            </Link>
            <Link className="confirm-text p-2" to="#">
              <i
                data-feather="trash-2"
                className="feather-trash-2"
                data-bs-toggle="modal"
                data-bs-target="#delete-modal"
              ></i>
            </Link>
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
                <h4>User List</h4>
                <h6>Manage Your Users</h6>
              </div>
            </div>
            {/* <ul className="table-top-head">
              <li>
                <OverlayTrigger placement="top" overlay={renderTooltip}>
                  <Link>
                    <ImageWithBasePath
                      src="assets/img/icons/pdf.svg"
                      alt="img"
                    />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                  <Link data-bs-toggle="tooltip" data-bs-placement="top">
                    <ImageWithBasePath
                      src="assets/img/icons/excel.svg"
                      alt="img"
                    />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderPrinterTooltip}>
                  <Link data-bs-toggle="tooltip" data-bs-placement="top">
                    <i data-feather="printer" className="feather-printer" />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>
                  <Link data-bs-toggle="tooltip" data-bs-placement="top">
                    <RotateCcw />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                  <Link
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    id="collapse-header"
                    className={data ? "active" : ""}
                    onClick={() => {
                      dispatch(setToogleHeader(!data));
                    }}
                  >
                    <ChevronUp />
                  </Link>
                </OverlayTrigger>
              </li>
            </ul> */}
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-added"
                data-bs-toggle="modal"
                data-bs-target="#add-units"
              >
                <i className='ti ti-circle-plus me-1'></i>
                Add New User
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
                {/*  <div className="dropdown me-2">
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
                </div>*/}

              </div>
            </div>

            <div className="card-body">

              <div className="table-responsive">
                <Table columns={columns}
                  dataSource={users}
                  loading={loading}
                />
              </div>
            </div>
            {/* </div>  */}
            {/* /product list */}
          </div>
        </div>
        <AddUsers onSuccess={fetchUsers} />
        <EditUser
          userToEdit={selectedUser}
          onSuccess={() => {
            fetchUsers();
            setSelectedUser(null);
          }}
        />
        <div className="modal fade" id="delete-modal">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="page-wrapper-new p-0">
                <div className="content p-5 px-3 text-center">
                  <span className="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2">
                    <i className="ti ti-trash fs-24 text-danger" />
                  </span>
                  <h4 className="fs-20 fw-bold mb-2 mt-1">Delete User</h4>
                  <p className="mb-0 fs-16">Are you sure you want to delete user?</p>
                  <div className="modal-footer-btn mt-3 d-flex justify-content-center">
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
                    >
                      Yes Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
