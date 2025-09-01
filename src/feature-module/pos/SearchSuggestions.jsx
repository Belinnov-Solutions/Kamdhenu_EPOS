// SearchSuggestions.js
import React from "react";
import PropTypes from "prop-types";

const SearchSuggestions = ({ products, onSelect, searchText }) => {
  const highlightMatch = (text) => {
    if (!searchText) return text;
    
    const regex = new RegExp(`(${searchText})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <span key={index} className="text-primary fw-bold">{part}</span> : 
        part
    );
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
                <div className="fw-medium">{highlightMatch(product.productName)}</div>
                {product.barcode && (
                  <small className="text-muted">Barcode: {product.barcode}</small>
                )}
              </div>
              <div className="text-end">
                <div className="fw-semibold">₹{product.price}</div>
                {product.stockQuantity !== undefined && (
                  <small className={product.stockQuantity > 0 ? "text-success" : "text-danger"}>
                    {product.stockQuantity > 0 ? `In stock (${product.stockQuantity})` : "Out of stock"}
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
     productName: PropTypes.string.isRequired,
     barcode: PropTypes.string,
     price: PropTypes.number.isRequired,
     stockQuantity: PropTypes.number,
   })
 ).isRequired,
 onSelect: PropTypes.func.isRequired,
 searchText: PropTypes.string.isRequired,
};

export default SearchSuggestions;