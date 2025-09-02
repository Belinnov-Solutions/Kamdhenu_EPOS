// CartCounter.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Tooltip } from "antd";

export const CartCounter = ({
  defaultValue,
  onQuantityChange,
  productId,
  productName, 
  cartItems,
  className,
}) => {
  const [quantity, setQuantity] = useState(Number(defaultValue) || 0);

  useEffect(() => {
    setQuantity(Number(defaultValue) || 0);
  }, [defaultValue]);

  useEffect(() => {
    if (!cartItems) return;
    const itemExists = cartItems.some((item) => item.id === productId);
    if (!itemExists) setQuantity(0);
  }, [cartItems, productId]);

  const updateQuantity = (newQty) => {
    const validQty = Math.max(0, Math.min(99, Number(newQty) || 0));
    setQuantity(validQty);
    onQuantityChange?.(productId, validQty);
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    updateQuantity(quantity + 1);
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    updateQuantity(quantity - 1);
  };

  const handleChange = (e) => {
    const input = e.target.value;
    if (input === "") {
      setQuantity("");
    } else {
      const parsed = parseInt(input, 10);
      if (!isNaN(parsed)) {
        updateQuantity(parsed);
      }
    }
  };

  const handleBlur = () => {
    if (quantity === "") updateQuantity(0);
  };

  return (
      <div className={`cart-counter-wrapper ${className || ""}`}>
      {/* Add product name display */}
      {productName && (
        <div className="product-name mb-1" style={{
          fontSize: "12px",
          fontWeight: "500",
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100px"
        }}>
          {productName}
        </div>
      )}
      <div className="d-flex align-items-center justify-content-center"></div>
    <div className={`cart-counter-wrapper ${className || ""}`}>
      <div className="d-flex align-items-center justify-content-center">
        <Tooltip title="minus">
          <Link
            to="#"
            className="dec d-flex justify-content-center align-items-center btn btn-sm btn-outline-secondary"
            onClick={handleDecrement}
            style={{
              width: "28px",
              height: "28px",
              padding: 0,
              borderRadius: "4px 0 0 4px",
            }}
          >
            <i className="ti ti-minus fs-12" />
          </Link>
        </Tooltip>
        <input
          type="text"
          className="form-control text-center mx-1"
          name="qty"
          value={quantity}
          onChange={handleChange}
          onBlur={handleBlur}
          inputMode="numeric"
          maxLength="2"
          style={{
            width: "40px",
            height: "28px",
            padding: "0 5px",
            fontSize: "12px",
          }}
        />
        <Tooltip title="plus">
          <Link
            to="#"
            className="inc d-flex justify-content-center align-items-center btn btn-sm btn-outline-secondary"
            onClick={handleIncrement}
            style={{
              width: "28px",
              height: "28px",
              padding: 0,
              borderRadius: "0 4px 4px 0",
            }}
          >
            <i className="ti ti-plus fs-12" />
          </Link>
        </Tooltip>
      </div>
    </div>
    </div>
    
  );
};

CartCounter.propTypes = {
  defaultValue: PropTypes.number,
  onQuantityChange: PropTypes.func,
  productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    productName: PropTypes.string,
  cartItems: PropTypes.array,
  className: PropTypes.string,
};

export default CartCounter;
