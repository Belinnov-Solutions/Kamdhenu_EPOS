import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./OrderDetails.css";

const OrderDetails = ({ order, onBack }) => {
  const topRef = useRef(null);

  // Scroll to top when component mounts
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
  }, [order]);

  if (!order) {
    return <div className="alert alert-info">No order selected</div>;
  }

  // Calculate row totals for each product and the overall total
  const productsWithTotals = order.products
    ? order.products.map((product) => ({
        ...product,
        rowTotal: (product.price * product.quantity)?.toFixed(2) || "0.00",
      }))
    : [];

  // Calculate the total of all row totals
  //   const calculatedTotal = productsWithTotals
  //     .reduce((sum, product) => {
  //       return sum + parseFloat(product.rowTotal);
  //     }, 0)
  //     .toFixed(2);

  return (
    <div className="order-details-container">
      <div ref={topRef}></div>{" "}
      {/* Invisible element at the top for scrolling */}
      {/* Back Button */}
      <div className="d-flex align-items-center mb-3">
        <button
          onClick={onBack}
          className="btn btn-outline-secondary btn-sm me-2"
        >
          <i className="ti ti-arrow-left me-1"></i> Back to Order List
        </button>
      </div>
      {/* Order Header */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6 className="section-title" style={{ background: "orange" }}>
                Order No
              </h6>
              <p className="order-number">{order.orderNumber}</p>
              <p className="order-date">Order Date: {order.createdAt}</p>
            </div>
            <div className="col-md-6 text-end">
              <h6 className="section-title " style={{ background: "orange" }}>
                Total Amount
              </h6>
              <p className="total-amount">{order.totalAmount}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Order Items */}
      <div className="card mb-4">
        <div className="card-body">
          <h6 className="section-title" style={{ background: "orange" }}>
            Order Items
          </h6>
          <div className="table-responsive">
            <table className="table order-items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {productsWithTotals.map((product, index) => (
                  <tr key={index}>
                    <td>{product.productName}</td>
                    <td>₹{product.price?.toFixed(2) || "0.00"}</td>
                    <td>{product.quantity}</td>
                    <td>₹{product.rowTotal}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="table-total-row">
                  <td colSpan="3" className="text-end fw-bold">
                    Total:
                  </td>
                  <td className="fw-bold">{order.totalAmount}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      {/* Summary Table */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-end">
            <div className="summary-table-container">
              <table className="table summary-table">
                <tbody>
                  <tr>
                    <td className="summary-label">Total Price</td>
                    <td className="summary-value">{order.totalAmount}</td>
                  </tr>
                  {/* <tr>
                    <td className="summary-label">Tax (3%)</td>
                    <td className="summary-value">
                      ₹{(calculatedTotal * 0.03).toFixed(2)}
                    </td>
                  </tr> */}
                  <tr className="grand-total-row">
                    <td className="summary-label">Grand Total</td>
                    <td className="summary-value">{order.totalAmount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="text-center mt-4">
        <p className="powered-by">© 2025 - Powered by Belinnov Solutions</p>
      </div>
    </div>
  );
};

// Add PropTypes validation
OrderDetails.propTypes = {
  order: PropTypes.shape({
    orderNumber: PropTypes.string,
    createdAt: PropTypes.string,
    totalAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    customerName: PropTypes.string,
    customerPhone: PropTypes.string,
    customerEmail: PropTypes.string,
    customerAddress: PropTypes.string,
    products: PropTypes.arrayOf(
      PropTypes.shape({
        productName: PropTypes.string,
        quantity: PropTypes.number,
        price: PropTypes.number,
        size: PropTypes.string,
        color: PropTypes.string,
      })
    ),
    discount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    deliveryCharge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    grandTotal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  onBack: PropTypes.func.isRequired,
};

// Add default props
OrderDetails.defaultProps = {
  order: null,
};

export default OrderDetails;
