// SearchSuggestions.js
import React from "react";
import PropTypes from "prop-types";

const SearchSuggestions = ({
  products,
  onSelect,
  searchText,
  displayProperty = "productName", // Add this prop with default value
}) => {
  const highlightMatch = (text) => {
    if (!searchText) return text;

    const regex = new RegExp(`(${searchText})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="text-primary fw-bold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Function to get the display name based on displayProperty
  const getDisplayName = (product) => {
    return product[displayProperty] || product.productName || "Unnamed Product";
  };

  return (
    <div className="search-suggestions position-absolute top-100 start-0 end-0 bg-white border mt-1 rounded shadow-sm z-3">
      <ul className="list-group list-group-flush">
        {products.slice(0, 5).map((product) => (
          <li
            key={product.id}
            className="list-group-item list-group-item-action cursor-pointer"
            onClick={() => onSelect(product)}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-medium">
                  {highlightMatch(getDisplayName(product))}
                </div>
                {product.barcode && (
                  <small className="text-muted">
                    Barcode: {product.barcode}
                  </small>
                )}
              </div>
              <div className="text-end">
                <div className="fw-semibold">₹{product.price || 0}</div>
                {product.stockQuantity !== undefined && (
                  <small
                    className={
                      product.stockQuantity > 0 ? "text-success" : "text-danger"
                    }
                  >
                    {product.stockQuantity > 0
                      ? `In stock (${product.stockQuantity})`
                      : "Out of stock"}
                  </small>
                )}
              </div>
            </div>
          </li>
        ))}
        {products.length === 0 && (
          <li className="list-group-item text-muted">No products found</li>
        )}
      </ul>
    </div>
  );
};
SearchSuggestions.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      productName: PropTypes.string, // Make sure this is included
      price: PropTypes.number.isRequired,
      stockQuantity: PropTypes.number,
      barcode: PropTypes.string,
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
  searchText: PropTypes.string.isRequired,
  displayProperty: PropTypes.string,
};

export default SearchSuggestions;
