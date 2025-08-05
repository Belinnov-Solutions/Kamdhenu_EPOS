import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, Edit } from "react-feather";
import axios from "axios";
import ReassignTicketModal from "./ReassignTicketModal";
import BrandFormTicket from "./BrandFormTicket";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import CancelTicketModal from "./CancelTicketModal";
import { clearTickets } from "../../core/redux/ticketSlice";
import { resetCart } from "../../core/redux/partSlice";
// import { repairAdded } from "../../core/redux/repairSlice";
import { addOrUpdateCartItem as addPartCart } from "../../core/redux/partSlice";
import { ticketAdded } from "../../core/redux/ticketSlice";
import "./TicketManagement.css";
const TicketManagement = ({
  onNewTicketClick,
  onViewTicket,
  showOrderList,
  activeTab,
}) => {
  const refreshCount = useSelector((state) => state.ticketRefresh.refreshCount);
  const dispatch = useDispatch();
  const { roleName, userId, storeId } = useSelector((state) => state.user);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showBrandFormTicket, setShowBrandFormTicket] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [ticketToCancel, setTicketToCancel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // API endpoint
  const BASE_URL = process.env.REACT_APP_BASEURL;
  const API_URL = `${BASE_URL}api/v1/Order/GetTickets`;
  // const CUSTOMERS_API_URL = `${BASE_URL}api/v1/User/GetCustomers`;
  const STORE_ID = storeId;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleRefresh = () => {
    fetchTickets();
  };

   // Add this useEffect to reset state when tab changes
    useEffect(() => {
      if (activeTab !== "ticketmanagement") {
        setShowBrandFormTicket(false);
        setSelectedBrand(null);
        setSelectedTicket(null);
      }
    }, [activeTab]);

  // const fetchCustomers = async () => {
  //   try {
  //     const response = await axios.get(CUSTOMERS_API_URL);
  //     if (response.data?.data) {
  //       // Create and return a map for faster lookup
  //       return response.data.data.reduce((map, customer) => {
  //         map[customer.customerId] = customer;
  //         return map;
  //       }, {});
  //     }
  //     return {};
  //   } catch (err) {
  //     console.error("Error fetching customers:", err);
  //     return {};
  //   }
  // };

  const fetchReferenceData = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}api/v1/Product/GetReferenceData?storeId=${storeId}`
      );
      if (response.data?.data?.technicians) {
        return response.data.data.technicians;
      }
      return [];
    } catch (err) {
      console.error("Error fetching reference data:", err);
      return [];
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Fetch all necessary data in parallel
      const [techniciansData] = await Promise.all([
        fetchReferenceData(),
        // fetchCustomers(),
      ]);

      // Then fetch tickets
      const ticketsResponse = await axios.get(API_URL, {
        params: { storeId: STORE_ID },
      });

      if (ticketsResponse.data?.data) {
        // REPLACE THIS EXISTING BLOCK WITH THE UPDATED VERSION:
        const transformedTickets = ticketsResponse.data.data.map((ticket) => {
          const technician = techniciansData.find(
            (t) => t.userId === ticket.technicianId
          );

          // const customer = customersMap[ticket.customerId] || null;

          return {
            id: ticket.ticketid,
            ticketNumber: ticket.ticketNo,
            deviceType: ticket.deviceType,
            brand: ticket.brand,
            assignedTo: technician ? technician.userName : "Unassigned",
            technicianId: ticket.technicianId,
            date: formatDate(ticket.createdAt),
            dueDate: formatDate(ticket.dueDate),
            status: ticket.status || "N/A", // Changed from "Unknown"
            customerName: ticket.customerName || "N/A",
            customerNumber: ticket.customerNumber || "N/A",
            originalData: {
              ...ticket, // Include all original ticket data
              ticketid: ticket.ticketid, // Ensure these fields exist
              orderId: ticket.repairOrderId || "", // Provide fallback
            },
          };
        });

        setTickets(transformedTickets);

        if (roleName?.toLowerCase() === "technician") {
          setFilteredTickets(
            transformedTickets.filter(
              (ticket) => ticket.technicianId === userId
            )
          );
        } else {
          setFilteredTickets(transformedTickets);
        }
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [refreshCount]);

  // Filter tickets based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      // For technicians, always show only their assigned tickets
      if (roleName?.toLowerCase() === "technician") {
        setFilteredTickets(
          tickets.filter((ticket) => ticket.technicianId === userId)
        );
      } else {
        setFilteredTickets(tickets);
      }
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = tickets.filter((ticket) => {
        return (
          ticket.ticketNumber.toLowerCase().includes(lowercasedSearch) ||
          (ticket.customerName &&
            ticket.customerName.toLowerCase().includes(lowercasedSearch)) ||
          (ticket.customerNumber &&
            ticket.customerNumber.toLowerCase().includes(lowercasedSearch)) ||
          ticket.assignedTo.toLowerCase().includes(lowercasedSearch) ||
          ticket.status.toLowerCase().includes(lowercasedSearch) ||
          ticket.date.includes(lowercasedSearch) ||
          ticket.dueDate.includes(lowercasedSearch)
        );
      });
      setFilteredTickets(filtered);
    }
  }, [searchTerm, tickets]);
  const getStatusBadge = (status) => {
    if (!status) return "badge bg-secondary text-white";

    switch (status.toLowerCase()) {
      case "delivered":
        return "badge bg-success text-white";
      case "completed":
        return "badge bg-warning text-dark";
    }
  };
  const handleCancelTicket = async (ticketId, reason) => {
    try {
      await axios.put(`${BASE_URL}api/v1/Order/CancelTicket`, {
        ticketId: ticketId,
        orderId: ticketToCancel?.originalData?.orderId, // Now correctly mapped
        cancelreason: reason,
      });
      fetchTickets();
      return true;
    } catch (error) {
      console.error("Error cancelling ticket:", error);
      return false;
    }
  };

  const handleCancelClick = (ticket) => {
    setTicketToCancel(ticket);
    setShowCancelModal(true);
  };

  const handleEditClick = (ticket) => {
    setSelectedTicket({
      ...ticket,
      originalData: ticket.originalData,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
  };

  const handleViewClick = (ticket) => {
    const repairData = {
      repairOrderId: ticket.originalData.repairOrderId,
      orderNumber: ticket.originalData.orderNumber || "",
      customerId: ticket.originalData.customerId || "",
      deviceType: ticket.originalData.deviceType || "",
      brand: ticket.originalData.brand || "",
      model: ticket.originalData.model || "",
      imeiNumber: ticket.originalData.imeiNumber || "",
      serialNumber: ticket.originalData.serialNumber || "",
      passcode: ticket.originalData.passcode || "",
      taskTypeId: ticket.originalData.taskTypeId || "",
      taskTypeName: ticket.originalData.taskTypeName || "",
      technicianId: ticket.originalData.technicianId || "",
      dueDate: ticket.originalData.dueDate || "",
      dateCreated: ticket.originalData.createdAt || "",
      customerNotes:
        ticket.originalData.notes?.find((n) => n.type === "Customer notes")
          ?.notes || "",
      internalNotes:
        ticket.originalData.notes?.find((n) => n.type === "Internal notes")
          ?.notes || "",
      serviceCharge: ticket.originalData.serviceCharge || 0,
      repairCost: ticket.originalData.repairCost || 0,
    };

    dispatch(ticketAdded(repairData));

    if (
      ticket.originalData.orderParts &&
      ticket.originalData.orderParts.length > 0
    ) {
      ticket.originalData.orderParts.forEach((part) => {
        const accessoryItem = {
          id: part.productId,
          product: {
            name: part.productName,
            price: part.price,
          },
          quantity: part.quantity,
        };

        dispatch(addPartCart(accessoryItem));
      });
    }

    const brandData = {
      name: ticket.brand,
      category: ticket.deviceType,
      brandId: "",
      ticketId: ticket.id,
      model: ticket.originalData.model,
      imeiNumber: ticket.originalData.imeiNumber,
      serialNumber: ticket.originalData.serialNumber,
      passcode: ticket.originalData.passcode,
    };
    setSelectedBrand(brandData);
    setSelectedTicket(ticket.originalData);
    setShowBrandFormTicket(true);
    onViewTicket();
  };
  const handleCloseBrandFormTicket = () => {
    setShowBrandFormTicket(false);
    setSelectedBrand(null);
    // Clear the ticket data from Redux when closing
    dispatch(clearTickets());
    dispatch(resetCart());
    // Hide the order list when closing the form
    onViewTicket(false); // Pass false to hide the order list
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">Error loading tickets: {error}</div>
    );
  }

  return (
    <>
      <div
        className={`modal-dialog modal-dialog-centered ${
          roleName?.toLowerCase() !== "technician"
            ? showOrderList
              ? "modal-lg"
              : "responsive-width"
            : ""
        }`}
        style={
          roleName?.toLowerCase() !== "technician" && !showOrderList
            ? {
                maxWidth: "100%",
                width: "100%",
                margin: "0 auto",
              }
            : {}
        }
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Ticket Management</h5>
          </div>
          <div className="modal-body">
            {showBrandFormTicket && selectedBrand ? (
              <BrandFormTicket
                brand={selectedBrand}
                onClose={handleCloseBrandFormTicket}
                ticketData={selectedTicket}
              />
            ) : (
              <div className="tabs-sets">
                <div className="tab-content">
                  <div
                    className="tab-pane fade show active"
                    id="purchase"
                    role="tabpanel"
                  >
                    <div className="card table-list-card mb-0">
                      <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <div className="search-set">
                          <div className="search-input">
                            <Link to="#" className="btn btn-searchset">
                              <i className="ti ti-search fs-14 feather-search" />
                            </Link>
                            <div className="dataTables_filter">
                              <label>
                                <input
                                  type="search"
                                  className="form-control form-control-sm"
                                  placeholder="Search tickets..."
                                  value={searchTerm}
                                  onChange={handleSearchChange}
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          {roleName?.toLowerCase() !== "technician" && (
                            <>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={onNewTicketClick}
                              >
                                <i className="ti ti-plus me-1"></i> New Ticket
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={handleRefresh}
                                disabled={loading}
                              >
                                {loading ? (
                                  <>
                                    <span
                                      className="spinner-border spinner-border-sm me-1"
                                      role="status"
                                      aria-hidden="true"
                                    ></span>
                                    Refreshing...
                                  </>
                                ) : (
                                  <>
                                    <i className="ti ti-refresh me-1"></i>{" "}
                                    Refresh
                                  </>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {roleName?.toLowerCase() !== "technician" && (
                        <div className="card-body">
                          <div
                            className="custom-datatable-filter table-responsive"
                            style={{ width: "100%" }}
                          >
                            <table
                              className="table datatable"
                              style={{ width: "100%" }}
                            >
                              <thead>
                                <tr>
                                  <th>Ticket</th>
                                  <th>Customer Name</th>
                                  <th>Phone</th>
                                  {roleName?.toLowerCase() !== "technician" && (
                                    <th>Assigned To</th>
                                  )}
                                  <th>Date</th>
                                  <th>Due Date</th>
                                  <th>Status</th>
                                  <th className="no-sort"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredTickets.map((ticket) => (
                                  <tr key={ticket.id}>
                                    <td>
                                      <Link
                                        to="#"
                                        onClick={() => handleViewClick(ticket)}
                                      >
                                        {ticket.ticketNumber}
                                      </Link>
                                    </td>
                                    <td>{ticket.customerName}</td>
                                    <td>{ticket.customerNumber}</td>
                                    {roleName?.toLowerCase() !==
                                      "technician" && (
                                      <td>{ticket.assignedTo}</td>
                                    )}
                                    <td>{ticket.date}</td>
                                    <td>{ticket.dueDate}</td>
                                    <td>
                                      <span
                                        className={getStatusBadge(
                                          ticket.status
                                        )}
                                        style={{ fontSize: "14px" }}
                                      >
                                        {ticket.status}
                                      </span>
                                    </td>
                                    <td className="action-table-data">
                                      <div className="edit-delete-action">
                                        <Link
                                          className="me-2 edit-icon p-2"
                                          to="#"
                                          onClick={() =>
                                            handleViewClick(ticket)
                                          }
                                        >
                                          <Eye className="feather-eye" />
                                        </Link>
                                        <Link
                                          className="me-2 p-2 btn btn-link"
                                          to="#"
                                          onClick={() =>
                                            handleEditClick(ticket)
                                          }
                                        >
                                          <Edit className="feather-edit" />
                                        </Link>
                                        {roleName?.toLowerCase() !==
                                          "technician" && (
                                          <Link
                                            className="p-2 btn btn-link text-danger text-decoration-none"
                                            to="#"
                                            onClick={() =>
                                              handleCancelClick(ticket)
                                            }
                                          >
                                            <span className="ms-1">Cancel</span>
                                          </Link>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {filteredTickets.length === 0 && (
                              <div className="text-center py-4">
                                <i className="ti ti-clipboard-list fs-24 text-muted mb-2"></i>
                                <h5>No repair tickets yet</h5>
                                <p className="text-muted">
                                  Create your first ticket to get started
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {roleName?.toLowerCase() === "technician" && (
                        <div className="card-body">
                          <div className="custom-datatable-filter table-responsive">
                            <table className="table datatable">
                              <thead>
                                <tr>
                                  <th>Ticket #</th>
                                  <th>Customer Name</th>
                                  <th>Phone</th>

                                  <th>Date</th>
                                  <th>Due Date</th>
                                  <th>Status</th>
                                  <th className="no-sort"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredTickets.map((ticket) => (
                                  <tr key={ticket.id}>
                                    <td>
                                      <Link
                                        to="#"
                                        onClick={() => handleViewClick(ticket)}
                                      >
                                        {ticket.ticketNumber}
                                      </Link>
                                    </td>
                                    <td>{ticket.customerName}</td>
                                    <td>{ticket.customerNumber}</td>

                                    <td>{ticket.date}</td>
                                    <td>{ticket.dueDate}</td>
                                    <td>
                                      <span
                                        className={getStatusBadge(
                                          ticket.status
                                        )}
                                        style={{ fontSize: "14px" }}
                                      >
                                        {ticket.status}
                                      </span>
                                    </td>
                                    <td className="action-table-data">
                                      <div className="edit-delete-action">
                                        <Link
                                          className="me-2 edit-icon p-2"
                                          to="#"
                                          onClick={() =>
                                            handleViewClick(ticket)
                                          }
                                        >
                                          <Eye className="feather-eye" />
                                        </Link>
                                        <Link
                                          className="me-2 p-2 btn btn-link"
                                          to="#"
                                          onClick={() =>
                                            handleEditClick(ticket)
                                          }
                                        >
                                          <Edit className="feather-edit" />
                                        </Link>
                                        {roleName?.toLowerCase() !==
                                          "technician" && (
                                          <Link
                                            className="p-2 btn btn-link text-danger text-decoration-none"
                                            to="#"
                                            onClick={() =>
                                              handleCancelClick(ticket)
                                            }
                                          >
                                            <span className="ms-1">Cancel</span>
                                          </Link>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {filteredTickets.length === 0 && (
                              <div className="text-center py-4">
                                <i className="ti ti-mood-smile fs-24 text-muted mb-2"></i>
                                <h5>No repair jobs assigned to you</h5>
                                <p className="text-muted">
                                  Youre all caught up!
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTicket && (
        <ReassignTicketModal
          ticket={selectedTicket}
          show={showModal}
          onClose={handleCloseModal}
        />
      )}
      <CancelTicketModal
        show={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onCancelTicket={(reason) =>
          handleCancelTicket(ticketToCancel?.id, reason)
        }
      />
    </>
  );
};

TicketManagement.propTypes = {
  onNewTicketClick: PropTypes.func.isRequired,
  onViewTicket: PropTypes.func.isRequired, // Add this line
  showOrderList: PropTypes.bool.isRequired, // Add this line
  activeTab: PropTypes.string.isRequired, 
};

export default TicketManagement;
