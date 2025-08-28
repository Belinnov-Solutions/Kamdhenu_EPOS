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
import "./Accessories.css";

const Accessories = ({
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  currentView,
  setCurrentView,
}) => {
  const dispatch = useDispatch();
  const accessoryProducts = useSelector(selectAccessoryProducts);
  const repairCategories = useSelector(selectRepairCategories);
  const subCategories = useSelector(selectSubCategories);
  const isLoading = useSelector(selectIsLoading);
  const orderItems = useSelector(selectCartItems);
  const { storeId } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setLoading(true));
        const BASE_URL = process.env.REACT_APP_BASEURL;

        // Fetch categories
        const categoriesResponse = await axios.get(
          `${BASE_URL}api/v1/Product/GetCategories?storeId=${storeId}`
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
        const transformedSubCategories = subCategoriesResponse.data.data.map(
          (item) => ({
            id: item.subCategoryId,
            name: item.subCategoryName,
            categoryId: item.categoryId,
            image: item.image
              ? `${BASE_URL}images/subcategories/${item.image}`
              : "assets/img/products/pos-product-10.svg",
          })
        );

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
    setCurrentView("subcategories");
  };

  const handleSubCategoryClick = (subCategoryId) => {
    setSelectedSubCategory(subCategoryId);
    setCurrentView("products");
  };

  // Handle product click to add to cart
  const handleProductClick = (product) => {
    const existingItem = orderItems.find((item) => item.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;

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
        quantity: currentQuantity + 1,
      })
    );
  };

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
  if (currentView === "products") {
    const filteredProducts = getFilteredProducts();

    if (filteredProducts.length === 0) {
      return (
        <div className="text-center py-4">
          <p>No products found for this selection</p>
        </div>
      );
    }

    return (
      <div className="row g-3">
        {filteredProducts.map((product) => {
          const existingItem = orderItems.find(
            (item) => item.id === product.id
          );
          const quantity = existingItem ? existingItem.quantity : 0;

          return (
            <div
              key={product.id}
              className="col-sm-6 col-md-6 col-lg-6 col-xl-4 col-xxl-3"
            >
              <div
                className="card  border-1 rounded-4 p-3 d-flex flex-column justify-content-between h-100 product-card mb-1"
                style={{
                  backgroundColor: "#fff",
                  borderLeft: "5px solid yellow",
                  cursor: "pointer",
                }}
                onClick={() => handleProductClick(product)}
                tabIndex="0"
              >
                <div className="text-center">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    {quantity > 0 && (
                      <span className="badge bg-primary px-2 py-1 position-absolute top-0 end-0 m-2">
                        {quantity}
                      </span>
                    )}
                  </div>

                  <h6 className="fw-bold text-dark mb-1">{product.name}</h6>
                  <span className="badge bg-light text-dark border px-2 py-1 text-uppercase mb-2 fs-12">
                    {product.brandName}
                  </span>
                  <span className="badge bg-success px-2 py-1 fs-12 mx-auto">
                    &#x20B9;
                    {product.price ? product.price.toFixed(2) : "0.00"}
                    {/* {product.discountValue > 0 && (
                      <span className="text-light ms-1">
                        ({product.discountValue}% off)
                      </span>
                    )} */}
                  </span>
                  <small className="text-secondary d-block">
                    {product.manufacturer}
                    {product.warrantyType && ` • ${product.warrantyType}`}
                  </small>
                </div>

                {/* <div className="pt-2 border-top text-center">
                  <small className="text-primary">Click to add to cart</small>
                </div> */}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Show subcategories view
  if (currentView === "subcategories" && selectedCategory) {
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
                <h5 className="fw-bold mb-0 text-capitalize">
                  {subCategory.name}
                </h5>
              </div>
            </div>
          </div>
        ))}
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
            onClick={() => handleCategoryClick(category.id)}
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
  selectedCategory: PropTypes.string,
  setSelectedCategory: PropTypes.func.isRequired,
  selectedSubCategory: PropTypes.string,
  setSelectedSubCategory: PropTypes.func.isRequired,
  currentView: PropTypes.string.isRequired,
  setCurrentView: PropTypes.func.isRequired,
};

export default Accessories;
