import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "./TicketManagement.css";

const TicketManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { storeId } = useSelector((state) => state.user);
  const [orderedProducts, setOrderedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASEURL;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const fetchOrderedProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}api/v1/Order/GetOrderedProduct`,
        { params: { storeId } }
      );

      if (response.data?.data) {
        const transformedData = response.data.data.map((order) => ({
          ...order,
          createdAt: formatDate(order.createdAt),
          totalAmount: `$${order.totalAmount.toFixed(2)}`,
          // Get the first product name or use a default
          productName:
            order.products && order.products.length > 0
              ? order.products[0].productName
              : "Unknown Product",
          // Calculate total quantity
          totalQuantity: order.products
            ? order.products.reduce(
                (sum, product) => sum + (product.quantity || 0),
                0
              )
            : 0,
        }));
        setOrderedProducts(transformedData);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching ordered products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderedProducts();
  }, [storeId]);

  const handleViewDetails = (order) => {
    console.log("View details for order:", order);
    // Implement view details functionality here
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
      <div className="alert alert-danger">Error loading orders: {error}</div>
    );
  }

  return (
    <div
      className="modal-dialog modal-dialog-centered modal-lg"
      style={{ maxWidth: "95%" }}
    >
      <div className="modal-content" style={{ width: "100%" }}>
        <div className="modal-header">
          <h5 className="modal-title">Order List</h5>
        </div>
        <div className="modal-body">
          <div className="card table-list-card mb-0">
            <div className="card-header d-flex align-items-center justify-content-between">
              <div className="search-set">
                <div className="search-input">
                  <input
                    type="search"
                    className="form-control form-control-sm"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
              <div
                className="table-responsive"
                style={{ width: "100%", overflowX: "auto" }}
              >
                <table
                  className="table"
                  style={{ width: "100%", tableLayout: "fixed" }}
                >
                  <thead>
                    <tr>
                      <th style={{ width: "15%" }}>Order</th>
                      <th style={{ width: "25%" }}>Product Name</th>
                      <th style={{ width: "10%" }}>Quantity</th>
                      <th style={{ width: "15%" }}>Date</th>
                      <th style={{ width: "15%" }}>Total</th>
                      <th style={{ width: "10%" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderedProducts
                      .filter(
                        (order) =>
                          searchTerm === "" ||
                          order.orderNumber
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          order.productName
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase())
                      )
                      .map((order) => (
                        <tr key={order.repairOrderId}>
                          <td>
                            <strong>{order.orderNumber}</strong>
                          </td>
                          <td>{order.productName}</td>
                          <td>{order.totalQuantity}</td>
                          <td>{order.createdAt}</td>
                          <td>{order.totalAmount}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleViewDetails(order)}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {orderedProducts.length === 0 && (
                  <div className="text-center py-4">
                    <i className="ti ti-package fs-24 text-muted mb-2"></i>
                    <h5>No orders found</h5>
                    <p className="text-muted">
                      No product orders have been placed yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketManagement;
