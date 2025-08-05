import React, { useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  setAccessoryProducts,
  setRepairCategories,
  setSubCategories,
  setLoading,
  selectAccessoryProducts,
  selectRepairCategories,
  selectSubCategories,
  selectIsLoading,
  addOrUpdateCartItem,
  selectCartItems,
} from "../../core/redux/accessoriesSlice";
import CartCounter from "../../core/common/counter/counter";
import "./Accessories.css";

const Accessories = ({
  // setShowAlert1,
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  currentView,
  setCurrentView,
  // showOrderList,
}) => {
  const dispatch = useDispatch();
  const accessoryProducts = useSelector(selectAccessoryProducts);
  const repairCategories = useSelector(selectRepairCategories);
  const subCategories = useSelector(selectSubCategories);
  const isLoading = useSelector(selectIsLoading);
  const orderItems = useSelector(selectCartItems);
  // const [selectedProduct, setSelectedProduct] = useState(null);
  const { storeId } = useSelector((state) => state.user);
  // const [currentView, setCurrentView] = useState('categories');

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setLoading(true));
        const BASE_URL = process.env.REACT_APP_BASEURL;

        // Fetch categories
        const categoriesResponse = await axios.get(
          `${BASE_URL}api/v1/Product/GetCategories?storeId=${storeId}`
          // `https://412ee0ba6528.ngrok-free.app/api/v1/Product/GetCategories?storeId=${storeId}`

        );

        // Transform categories data
        const transformedCategories = categoriesResponse.data.data.map(
          (item) => ({
            id: item.categoryId,
            name: item.categoryName,
            image: item.image
              ? `${BASE_URL}images/categories/${item.image}`
              : "assets/img/products/pos-product-10.svg",
          })
        );

        dispatch(setRepairCategories(transformedCategories));
        // Fetch subcategories
        const subCategoriesResponse = await axios.get(
          `${BASE_URL}api/v1/Product/GetSubcategories?storeId=${storeId}`
        );

        // Transform subcategories data
        const transformedSubCategories = subCategoriesResponse.data.data.map((item) => ({
          id: item.subCategoryId,
          name: item.subCategoryName,
          categoryId: item.categoryId,
          image: item.image
            ? `${BASE_URL}images/subcategories/${item.image}`
            : "assets/img/products/pos-product-10.svg",
        }));

        dispatch(setSubCategories(transformedSubCategories));

        // Fetch products
        const productsResponse = await axios.get(
          `${BASE_URL}api/v1/Product/GetProducts?storeId=${storeId}`
        );

        // Transform products data with all API fields
        const transformedProducts = productsResponse.data.data.map((item) => ({
          id: item.id,
          name: item.productName,
          sku: item.sku,
          category:
            transformedCategories.find((cat) => cat.id === item.categoryId)
              ?.name || "Uncategorized",
          categoryId: item.categoryId,
          subcategoryId: item.subcategoryId,
          price: item.price,
          image:
            item.imageList && item.imageList.length > 0
              ? `${BASE_URL}${item.imageList[0]}`
              : "assets/img/products/pos-product-02.svg",
          description: item.description,
          manufacturer: item.manufacturer,
          brandName: item.brandName,
          warrantyType: item.warrantyType,
          discountValue: item.discountValue,
          status: true,
        }));

        dispatch(setAccessoryProducts(transformedProducts));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchData();
  }, [dispatch, storeId]);
  // Handle category and subcategory clicks
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentView('subcategories');
  };

  const handleSubCategoryClick = (subCategoryId) => {
    setSelectedSubCategory(subCategoryId);
    setCurrentView('products');
  };

  // const handleBackToSubCategories = () => {
  //   setSelectedSubCategory(null);
  //   setCurrentView('subcategories');
  // }; 
  // Filter products based on selected category and subcategory
  const getFilteredProducts = () => {
    let filtered = accessoryProducts;

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.categoryId === selectedCategory
      );
    }

    if (selectedSubCategory) {
      filtered = filtered.filter(
        (product) => product.subcategoryId === selectedSubCategory
      );
    }

    return filtered;
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading data...</p>
      </div>
    );
  }

  // Show products view
  if (currentView === 'products') {
    const filteredProducts = getFilteredProducts();

    if (filteredProducts.length === 0) {
      return (
        <div className="text-center py-4">
          {/* <button 
            className="btn btn-link mb-3" 
            onClick={handleBackToSubCategories}
          >
            ← Back to Subcategories
          </button> */}
          <p>No products found for this selection</p>
        </div>
      );
    }

    // const handleProductClick = (product) => {
    //   // setSelectedProduct(product);
    //   setShowAlert1((prev) => !prev);
    // };

    // const closeModal = () => {
    //   setSelectedProduct(null);
    // };

    // Show products if a category is selected
    // if (selectedCategory) {
    //   const filteredProducts = accessoryProducts.filter(
    //     (product) => product.categoryId === selectedCategory
    //   );

    //   if (filteredProducts.length === 0) {
    //     return (
    //       <div className="text-center py-4">
    //         <p>No products found for this category</p>
    //       </div>
    //     );
    //   }

    return (
      <>
        {/* <button 
          className="btn btn-link mb-3" 
          onClick={handleBackToSubCategories}
        >
          ← Back to Subcategories
        </button> */}
        <div className="row g-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="col-sm-6 col-md-6 col-lg-6 col-xl-4 col-xxl-3"
            >
              <div
                className="card shadow border-0 rounded-4 p-3 d-flex flex-column justify-content-between h-100"
                style={{
                  backgroundColor: "#fff",
                  borderLeft: "5px solid #0d6efd",
                }}
                // onClick={() => handleProductClick(product)}
                tabIndex="0"
              // onMouseEnter={(e) =>
              //   (e.currentTarget.style.transform = "scale(1.015)")
              // }
              // onMouseLeave={(e) =>
              //   (e.currentTarget.style.transform = "scale(1)")
              // }
              >
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-success px-3 py-2 fs-12">
                      &#x20B9;{product.price ? product.price.toFixed(2) : "0.00"}
                      {product.discountValue > 0 && (
                        <span className="text-light ms-2">
                          ({product.discountValue}% off)
                        </span>
                      )}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-1">{product.name}</h5>
                  <span className="badge bg-light text-dark border px-2 py-1 text-uppercase mb-2">
                    {product.brandName}
                  </span>
                  {/* <small className="text-muted d-block mb-2">
                    SKU: {product.sku}
                  </small> */}

                  {/* <p
                    className="text-muted small mb-3"
                    style={{ minHeight: "40px" }}
                  >
                    {product.description?.slice(0, 60) ||
                      "No description provided."}
                  </p> */}
                  <small className="text-secondary">
                    {product.manufacturer}
                    {product.warrantyType && ` • ${product.warrantyType}`}
                  </small>
                </div>

                <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                  {/* <small className="text-secondary">
                    Cat ID: {product.categoryId.slice(0, 6)}...
                  </small> */}
                  <CartCounter
                    className="compact-counter"
                    defaultValue={0}
                    productId={product.id}
                    cartItems={orderItems}
                    onQuantityChange={(id, quantity) => {
                      dispatch(
                        addOrUpdateCartItem({
                          id: product.id,
                          product: {
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            category: product.category,
                            categoryId: product.categoryId,
                            subcategoryId: product.subcategoryId,
                            description: product.description,
                          },
                          quantity,
                        })
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Product Details Modal */}
        {/* {selectedProduct && (
          <div
            className="modal show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{selectedProduct.name}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="img-fluid rounded"
                      />
                    </div>
                    <div className="col-md-6">
                      <ul className="list-group list-group-flush">
                        <li className="list-group-item">
                          <strong>Brand:</strong> {selectedProduct.brandName}
                        </li>
                        <li className="list-group-item">
                          <strong>SKU:</strong> {selectedProduct.sku}
                        </li>
                        <li className="list-group-item">
                          <strong>Price:</strong> $
                          {selectedProduct.price.toFixed(2)}
                        </li>

                        <li className="list-group-item">
                          <strong>Manufacturer:</strong>{" "}
                          {selectedProduct.manufacturer}
                        </li>
                        <li className="list-group-item">
                          <strong>Warranty:</strong>{" "}
                          {selectedProduct.warrantyType}
                        </li>
                        {selectedProduct.discountValue > 0 && (
                          <li className="list-group-item text-success">
                            <strong>Discount:</strong>{" "}
                            {selectedProduct.discountValue}%
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h6>Description</h6>
                    <p>
                      {selectedProduct.description ||
                        "No description available"}
                    </p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )} */}
      </>
    );
  }
  // Show subcategories view
  if (currentView === 'subcategories' && selectedCategory) {
    const filteredSubCategories = subCategories.filter(
      (subCat) => subCat.categoryId === selectedCategory
    );

    if (filteredSubCategories.length === 0) {
      return (
        <div className="text-center py-4">
          <p>No subcategories found for this category</p>
        </div>
      );
    }

    return (
      <>
        <div className="row g-3">
          {filteredSubCategories.map((subCategory) => (
            <div
              key={subCategory.id}
              className="col-sm-6 col-md-6 col-lg-6 col-xl-4 col-xxl-3"
            >
              <div
                className="card border-0 shadow-sm h-100 text-center category-card"
                onClick={() => handleSubCategoryClick(subCategory.id)}
                style={{
                  cursor: "pointer",
                  borderRadius: "12px",
                  minHeight: "120px",
                }}
              >
                <div className="card-body d-flex align-items-center justify-content-center">
                  <h5 className="fw-bold mb-0 text-capitalize">{subCategory.name}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading categories...</p>
      </div>
    );
  }

  // Show categories by default
  return (
    <div className="row g-3">
      {repairCategories.map((category) => (
        <div
          key={category.id}
          className="col-sm-6 col-md-6 col-lg-6 col-xl-4 col-xxl-3"
        >
          <div
            className="card border-0 shadow-sm h-100 text-center category-card"
            onClick={() => handleCategoryClick(category.id)}  // ← CHANGED TO USE handleCategoryClick
            style={{
              cursor: "pointer",
              borderRadius: "12px",
              minHeight: "120px",
            }}
          >
            <div className="card-body d-flex align-items-center justify-content-center">
              <h5 className="fw-bold mb-0 text-capitalize">{category.name}</h5>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

Accessories.propTypes = {
  setShowAlert1: PropTypes.func.isRequired,
  selectedCategory: PropTypes.string,
  setSelectedCategory: PropTypes.func.isRequired,
  selectedSubCategory: PropTypes.string,
  setSelectedSubCategory: PropTypes.func.isRequired,
   currentView: PropTypes.string.isRequired,
  setCurrentView: PropTypes.func.isRequired,
  showOrderList: PropTypes.bool,
};

export default Accessories;
