import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import PosModals from "../../core/modals/pos-modal/posModals";
import BrandForm from "./BrandForm";
import TicketManagement from "./TicketManagement";
import Accessories from "./accessories";
import { useSelector } from "react-redux";
import axios from "axios";
import { useDispatch } from "react-redux";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { selectCartItems } from "../../core/redux/accessoriesSlice";
import { selectCartItems as selectPartItems } from "../../core/redux/partSlice";
import { removeSelectedService } from "../../core/redux/serviceTypeSlice";
import "./pos.css";
import { clearTickets } from "../../core/redux/ticketSlice";
import { resetCart } from "../../core/redux/partSlice";
 import { updateAccessoryQuantity, addOrUpdateCartItem as addAccessoryToCart } from "../../core/redux/accessoriesSlice";
 import { updatePartQuantity, addOrUpdateCartItem as addPartToCart } from "../../core/redux/partSlice";
import CartCounter from "../../core/common/counter/counter";
import SearchSuggestions from "./SearchSuggestions";

const Pos = () => {
  const BASE_URL = process.env.REACT_APP_BASEURL;
  const [hasItems, setHasItems] = useState(false);
  const [accessoriesNav, setAccessoriesNav] = useState({
    currentView: "categories",
    currentCategory: null,
  });
  const [showOrderList, setShowOrderList] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const dispatch = useDispatch();
  const repairData = useSelector((state) => state.repair);
  const ticketData = useSelector((state) => state.ticket);
  const { customerName } = useSelector((state) => state.customer);
  const { roleName, storeId } = useSelector((state) => state.user);
  const { selectedServices = [] } = useSelector((state) => state.serviceType);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [activeTab, setActiveTab] = useState("accessories");
  const [showAlert, setShowAlert] = useState(true);
  const [showAlert1, setShowAlert1] = useState(true);
  const [apiCustomers, setApiCustomers] = useState([]);
  const [orderData, setOrderData] = useState({
    orderNumber: "",
    items: [],
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const orderItems = useSelector(selectCartItems);
  const partItems = useSelector(selectPartItems);
  const Location = useLocation();
  const [customers, setCustomers] = useState([
    { value: "1", label: "Walk in Customer" },
    ...(customerName ? [{ value: "current", label: customerName }] : []),
  ]);
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Memoized filtered products based on search text
  const filteredProducts = useMemo(() => {
    if (!searchText.trim()) return [];
    
    const query = searchText.trim().toLowerCase();
    return products.filter(
      (product) =>
        product.barcode?.toLowerCase().includes(query) ||
        product.productName?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query)
    );
  }, [products, searchText]);

  // Check if cart has items
  useEffect(() => {
    setHasItems(
      ticketData.ticketItems?.length > 0 ||
        selectedServices.length > 0 ||
        orderItems.length > 0 ||
        partItems.length > 0
    );
  }, [ticketData.ticketItems, selectedServices, orderItems, partItems]);

  // Event listeners for POS page
  useEffect(() => {
    const handleClick = (event) => {
      if (!event.target.closest(".product-info")) return;

      const productInfo = event.target.closest(".product-info");
      productInfo.classList.toggle("active");

      const emptyCart = document.querySelector(".product-wrap .empty-cart");
      const productList = document.querySelector(".product-wrap .product-list");

      if (!emptyCart || !productList) {
        console.warn("Could not find required DOM elements");
        return;
      }

      const hasActiveProducts =
        document.querySelectorAll(".product-info.active").length > 0;

      emptyCart.style.display = hasActiveProducts ? "none" : "flex";
      productList.style.display = hasActiveProducts ? "block" : "none";
    };

    document.addEventListener("click", handleClick);
    document.body.classList.add("pos-page");

    return () => {
      document.removeEventListener("click", handleClick);
      document.body.classList.remove("pos-page");
    };
  }, [Location.pathname, showAlert1]);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/v1/User/GetCustomers`);
        if (response.data && response.data.data) {
          const formattedCustomers = response.data.data.map((customer) => ({
            value: customer.customerId,
            label: customer.customerName,
            ...customer,
          }));
          setApiCustomers(formattedCustomers);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Update customers list
  useEffect(() => {
    setCustomers([
      { value: "1", label: "Walk in Customer" },
      ...(customerName ? [{ value: "current", label: customerName }] : []),
      ...apiCustomers,
    ]);
  }, [apiCustomers, customerName]);

  const [setSelectedCustomer] = useState(
    customerName
      ? { value: "current", label: customerName }
      : { value: "1", label: "Walk in Customer" }
  );

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}api/v1/Product/GetProducts`, {
          params: { storeId },
        });
        if (res.data && res.data.data) {
          setProducts(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    
    fetchProducts();
  }, [storeId]);

  // Handle quantity change
  const handleQuantityChange = useCallback((productId, newQuantity) => {
    const accessoryItem = orderItems.find((item) => item.id === productId);
    const partItem = partItems.find((item) => item.id === productId);

    if (accessoryItem) {
      dispatch(
        updateAccessoryQuantity({ id: productId, quantity: newQuantity })
      );
    } else if (partItem) {
      dispatch(updatePartQuantity({ id: productId, quantity: newQuantity }));
    }
  }, [dispatch, orderItems, partItems]);

  // Handle customer creation
  const handleCustomerCreated = useCallback((newCustomer) => {
    const newCustomerOption = {
      value: Date.now().toString(),
      label: newCustomer.fullName || newCustomer.customerName,
    };
    setCustomers([...customers, newCustomerOption]);
    setSelectedCustomer(newCustomerOption);
  }, [customers]);

  // Handle tab change
  const handleTabChange = useCallback((tab) => {
    if (tab === "accessories") {
      setAccessoriesNav({
        currentView: "categories",
        currentCategory: null,
      });
      setSelectedSubCategory(null);
      setShowOrderList(false);
    } else {
      setShowOrderList(false);
    }
    if (tab !== "Mobiles" && tab !== "Tablet") {
      setShowBrandForm(false);
      setSelectedBrand(null);
      dispatch(removeSelectedService());
    }

    setActiveTab(tab);
    setShowBrandForm(false);
    if (tab !== "ticketmanagement") {
      dispatch(clearTickets());
      dispatch(resetCart());
    }
  }, [dispatch]);

  // Handle back click
  const handleBackClick = useCallback(() => {
    if (activeTab === "accessories") {
      if (accessoriesNav.currentView === "products") {
        setAccessoriesNav({
          currentView: "subcategories",
          currentCategory: accessoriesNav.currentCategory,
        });
        setSelectedSubCategory(null);
      } else if (accessoriesNav.currentView === "subcategories") {
        setAccessoriesNav({
          currentView: "categories",
          currentCategory: null,
        });
        setSelectedCategory(null);
      } else {
        setActiveTab("repairs");
      }
    } else if (activeTab === "Mobiles" || activeTab === "Tablet") {
      setActiveTab("repairs");
      setShowBrandForm(false);
      setShowOrderList(false);
    }
  }, [activeTab, accessoriesNav]);

  // Add product to cart
  const addProductToCart = useCallback((product) => {
    const productData = {
      id: product.id,
      name: product.productName,
      price: product.price,
      quantity: 1,
      product
    };
    
    // Determine if it's an accessory or part based on some logic
    // This might need adjustment based on your actual data structure
    const isAccessory = product.categoryType === 'accessory'; // Adjust this condition
    
    if (isAccessory) {
      dispatch(addAccessoryToCart(productData));
    } else {
      dispatch(addPartToCart(productData));
    }
    
    setSearchText("");
    setShowSuggestions(false);
  }, [dispatch]);

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchText(value);
    setShowSuggestions(value.length > 0);
    setIsScanning(value.length > 0 && /^\d+$/.test(value)); // Assume scanning if only digits
  }, []);

  // Handle search with Enter key or barcode scan
  const handleSearchEnter = useCallback((e) => {
    if (e.key === "Enter" && searchText.trim()) {
      const query = searchText.trim().toLowerCase();
      
      // First try exact barcode match
      let foundProduct = products.find(
        (p) => p.barcode?.toLowerCase() === query
      );
      
      // If no barcode match, try product name
      if (!foundProduct) {
        foundProduct = products.find(
          (p) => p.productName?.toLowerCase() === query
        );
      }
      
      // If still not found, try partial match
      if (!foundProduct) {
        foundProduct = products.find(
          (p) => p.productName?.toLowerCase().includes(query)
        );
      }

      if (foundProduct) {
        addProductToCart(foundProduct);
      } else {
        alert("No product found!");
      }
    }
  }, [searchText, products, addProductToCart]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((product) => {
    addProductToCart(product);
  }, [addProductToCart]);

  // Handle input blur (hide suggestions after a short delay)
  const handleInputBlur = useCallback(() => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  }, []);

  // Fetch order details
  useEffect(() => {
    const { repairOrderId, ticketId } = repairData;

    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}api/v1/Order/GetRepairOrderSummary`,
          {
            params: {
              orderId: repairOrderId,
              ticketId: ticketId,
              storeId: storeId,
            },
          }
        );

        const data = response.data;
        const transformedData = {
          orderNumber: data.orderNumber || "",
          items: data.taskName
            ? [
                {
                  name: data.taskName || "Unknown item",
                  price: data.servicePrice || 0,
                },
              ]
            : [],
          totalAmount: data.totalAmount || 0,
          customerName: data.customerName || "",
        };

        setOrderData(transformedData);
        if (data.customerName) {
          setSelectedCustomer({
            value: data.repairOrderId,
            label: data.customerName,
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setLoading(false);
      }
    };

    if (repairOrderId && ticketId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [repairData, storeId]);

  return (
    <div className="main-wrapper pos-five">
      <div className="page-wrapper pos-pg-wrapper ms-0">
        <div className="content pos-design p-0">
          <div className="row pos-wrapper">
            <div
              className={`col-md-12 ${
                (roleName === "Admin" ||
                  roleName === "Super Admin" ||
                  roleName === "Franchise Admin" ||
                  roleName === "Store Manager") &&
                (showOrderList ||
                  (activeTab === "accessories" &&
                    accessoriesNav.currentView === "products"))
                  ? ""
                  : ""
              } d-flex`}
            >
              <div className="pos-categories tabs_wrapper p-0 flex-fill">
                <div className="content-wrap">
                  <div className="tab-wrap">
                    <ul className="tabs owl-carousel pos-category5">
                      {(roleName === "Admin" ||
                        roleName === "Super Admin" ||
                        roleName === "Store Manager" ||
                        roleName === "Franchise Admin") && (
                        <li
                          id="accessories"
                          onClick={(e) => {
                            e.preventDefault();
                            handleTabChange("accessories");
                          }}
                          className={
                            activeTab === "accessories" ? "active" : ""
                          }
                        >
                          <h6>
                            <Link to="#" onClick={(e) => e.preventDefault()}>
                              <b>Products</b>
                            </Link>
                          </h6>
                        </li>
                      )}

                      {(roleName === "Admin" ||
                        roleName === "Super Admin" ||
                        roleName === "Store Manager" ||
                        roleName === "Franchise Admin" ||
                        roleName === "Technician") && (
                        <li
                          id="ticketmanagement"
                          onClick={() => {
                            setActiveTab("ticketmanagement");
                            setShowOrderList(false);
                          }}
                          className={
                            activeTab === "ticketmanagement" ? "active" : ""
                          }
                        >
                          <h6>
                            <Link to="#">
                              <b>
                                Order <br />
                                List
                              </b>
                            </Link>
                          </h6>
                        </li>
                      )}
                    </ul>
                  </div>
                  {(roleName === "Admin" ||
                    roleName === "Super Admin" ||
                    roleName === "Franchise Admin" ||
                    roleName === "Store Manager") &&
                    (showOrderList ||
                      (activeTab === "accessories" &&
                        accessoriesNav.currentView === "products")) && (
                      <div className="col-md-12 col-lg-4 col-xl-3 ps-0 theiaStickySidebar d-lg-flex">
                        <aside className="product-order-list bg-secondary-transparent flex-fill">
                          <div className="card">
                            <div className="card-body">
                              <div className="order-head d-flex align-items-center justify-content-between w-120">
                                <div>
                                  <h3>Order</h3>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  <span className="badge badge-dark fs-10 fw-medium badge-xs">
                                    {orderData?.orderNumber}
                                  </span>
                                </div>
                              </div>
                              <div className="customer-info block-section">
                                <h5 className="mb-2">Search</h5>
                                <div className="d-flex align-items-center gap-2">
                                  <div className="flex-grow-1 position-relative">
                                    {loading ? (
                                      <div>Loading product...</div>
                                    ) : (
                                      <>
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Scan barcode or type product name"
                                          value={searchText}
                                          onChange={handleSearchChange}
                                          onKeyDown={handleSearchEnter}
                                          onBlur={handleInputBlur}
                                          onFocus={() => setShowSuggestions(searchText.length > 0)}
                                        />
                                        {showSuggestions && filteredProducts.length > 0 && (
                                          <SearchSuggestions
                                            products={filteredProducts}
                                            onSelect={handleSuggestionSelect}
                                            searchText={searchText}
                                          />
                                        )}
                                        {isScanning && (
                                          <div className="position-absolute top-100 start-0 mt-1">
                                            <small className="text-muted">
                                              Scanning... Press Enter to confirm
                                            </small>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>

                                {showAlert && (
                                  <div className="customer-item  d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3">
                                    <Link
                                      to="#"
                                      onClick={() => setShowAlert(false)}
                                    ></Link>
                                  </div>
                                )}
                              </div>
                              <div className="product-added block-section">
                                <div className="head-text d-flex align-items-center justify-content-between mb-3">
                                  <div className="d-flex align-items-center">
                                    <h5 className="me-2">Order Details</h5>
                                  </div>
                                </div>
                                <div className="product-list border-0 p-0">
                                  <div
                                    className="table-responsive"
                                    style={{ overflowX: "hidden" }}
                                  >
                                    <table
                                      className="table table-borderless"
                                      style={{
                                        tableLayout: "fixed",
                                        width: "100%",
                                      }}
                                    >
                                      <thead>
                                        <tr>
                                          <th
                                            className="fw-bold bg-light"
                                            style={{ width: "50%" }}
                                          >
                                            Item
                                          </th>
                                          <th
                                            className="fw-bold bg-light text-center"
                                            style={{ width: "20%" }}
                                          >
                                            Qty
                                          </th>
                                          <th
                                            className="fw-bold bg-light text-end"
                                            style={{ width: "30%" }}
                                          >
                                            Cost
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {ticketData.ticketItems?.length > 0 &&
                                          ticketData.ticketItems.map((item) => (
                                            <tr
                                              key={`repair-${item.repairOrderId}`}
                                            >
                                              <td
                                                style={{
                                                  overflow: "hidden",
                                                  textOverflow: "ellipsis",
                                                  whiteSpace: "nowrap",
                                                }}
                                              >
                                                <div className="d-flex align-items-center">
                                                  <h6
                                                    className="fs-13 fw-normal"
                                                    style={{
                                                      overflow: "hidden",
                                                      textOverflow: "ellipsis",
                                                    }}
                                                  >
                                                    {item.taskTypeName}
                                                  </h6>
                                                </div>
                                              </td>
                                              <td className="text-center">
                                                <span className="badge bg-secondary">
                                                  1
                                                </span>
                                              </td>
                                              <td className="fs-13 fw-semibold text-gray-9 text-end">
                                                ₹{item.serviceCharge}
                                              </td>
                                            </tr>
                                          ))}

                                        {(selectedServices.length > 0 ||
                                          orderItems.length > 0 ||
                                          partItems.length > 0) && (
                                          <>
                                            {selectedServices.map((item) => (
                                              <tr key={`service-${item.id}`}>
                                                <td
                                                  style={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                  }}
                                                >
                                                  <div className="d-flex align-items-center">
                                                    <h6
                                                      className="fs-13 fw-normal m-0"
                                                      style={{
                                                        overflow: "hidden",
                                                        textOverflow:
                                                          "ellipsis",
                                                      }}
                                                    >
                                                      {item.name}
                                                    </h6>
                                                  </div>
                                                </td>
                                                <td className="text-center">
                                                  <span className="badge bg-secondary">
                                                    1
                                                  </span>
                                                </td>
                                                <td className="fs-13 fw-semibold text-gray-9 text-end">
                                                  ₹{item.price}
                                                </td>
                                              </tr>
                                            ))}

                                            {orderItems.map((item) => (
                                              <tr key={`order-item-${item.id}`}>
                                                <td
                                                  style={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                  }}
                                                >
                                                  <div className="d-flex align-items-center">
                                                    <h6
                                                      className="fs-13 fw-normal m-0"
                                                      style={{
                                                        overflow: "hidden",
                                                        textOverflow:
                                                          "ellipsis",
                                                      }}
                                                    >
                                                      {item.name}
                                                    </h6>
                                                  </div>
                                                </td>
                                                <td className="text-center">
                                                  <CartCounter
                                                    defaultValue={item.quantity}
                                                    onQuantityChange={
                                                      handleQuantityChange
                                                    }
                                                    productId={item.id}
                                                    cartItems={orderItems}
                                                    className="mx-auto"
                                                  />
                                                </td>
                                                <td className="fs-13 fw-semibold text-gray-9 text-end">
                                                  ₹{item.price * item.quantity}
                                                </td>
                                              </tr>
                                            ))}

                                            {partItems.map((item) => (
                                              <tr key={`part-item-${item.id}`}>
                                                <td
                                                  style={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                  }}
                                                >
                                                  <div className="d-flex align-items-center">
                                                    <h6
                                                      className="fs-13 fw-normal m-0"
                                                      style={{
                                                        overflow: "hidden",
                                                        textOverflow:
                                                          "ellipsis",
                                                      }}
                                                    >
                                                      {item.name}
                                                    </h6>
                                                  </div>
                                                </td>
                                                <td className="text-center">
                                                  <CartCounter
                                                    defaultValue={item.quantity}
                                                    onQuantityChange={
                                                      handleQuantityChange
                                                    }
                                                    productId={item.id}
                                                    cartItems={partItems}
                                                    className="mx-auto"
                                                  />
                                                </td>
                                                <td
                                                  className="fs-13 fw-semibold text-gray-9 text-end"
                                                  style={{ fontSize: "12px" }}
                                                >
                                                  ₹{item.price * item.quantity}
                                                </td>
                                              </tr>
                                            ))}
                                          </>
                                        )}

                                        {!ticketData.ticketItems?.length &&
                                          selectedServices.length === 0 &&
                                          orderItems.length === 0 &&
                                          partItems.length === 0 && (
                                            <tr>
                                              <td
                                                colSpan="3"
                                                className="text-center py-4"
                                              >
                                                <div className="text-muted">
                                                  <i className="ti ti-shopping-cart-off fs-4 mb-2"></i>
                                                  <p className="mb-0">
                                                    No items selected
                                                  </p>
                                                </div>
                                              </td>
                                            </tr>
                                          )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="order-total bg-total bg-white p-0">
                              <table className="table table-responsive table-borderless">
                                <tbody>
                                  <tr>
                                    <td className="fw-bold border-top border-dashed p-4">
                                      Total
                                    </td>
                                    <td className="text-gray-9 fw-bold text-end border-top border-dashed p-4">
                                      ₹
                                      {selectedServices.reduce(
                                        (total, item) =>
                                          total + (item.price || 0),
                                        0
                                      ) +
                                        orderItems.reduce(
                                          (total, item) =>
                                            total + item.price * item.quantity,
                                          0
                                        ) +
                                        (ticketData.ticketItems?.reduce(
                                          (total, item) =>
                                            total + (item.serviceCharge || 0),
                                          0
                                        ) || 0) +
                                        partItems.reduce(
                                          (total, item) =>
                                            total + item.price * item.quantity,
                                          0
                                        )}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </aside>
                      </div>
                    )}
                  <div className="tab-content-wrap">
                    <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                      <div className="mb-3 d-flex align-items-center">
                        {(activeTab === "Mobiles" ||
                          activeTab === "Tablet" ||
                          (activeTab === "accessories" &&
                            (accessoriesNav.currentView === "products" ||
                              accessoriesNav.currentView ===
                                "subcategories"))) && (
                          <button
                            onClick={handleBackClick}
                            className="btn btn-sm btn-outline-secondary me-3"
                          >
                            <i className="ti ti-arrow-left me-1"></i> Back
                          </button>
                        )}
                        <div></div>
                      </div>
                    </div>
                    <div className="pos-products">
                      <div className="tabs_container">
                        <div
                          className={`tab_content ${
                            activeTab === "accessories" ? "active" : ""
                          }`}
                          data-tab="accessories"
                        >
                          <Accessories
                            setShowAlert1={setShowAlert1}
                            selectedCategory={accessoriesNav.currentCategory}
                            setSelectedCategory={(categoryId) => {
                              setSelectedCategory(categoryId);
                              setAccessoriesNav({
                                currentView: "subcategories",
                                currentCategory: categoryId,
                              });
                              setShowOrderList(true);
                            }}
                            selectedSubCategory={selectedSubCategory}
                            setSelectedSubCategory={(subCategoryId) => {
                              setAccessoriesNav({
                                currentView: "products",
                                currentCategory: selectedCategory,
                              });
                              setSelectedSubCategory(subCategoryId);
                              setShowOrderList(true);
                            }}
                            currentView={accessoriesNav.currentView}
                            setCurrentView={(view) => {
                              setAccessoriesNav((prev) => ({
                                ...prev,
                                currentView: view,
                              }));
                            }}
                            showOrderList={showOrderList}
                          />
                        </div>

                        <div
                          className={`tab_content ${
                            activeTab === "ticketmanagement" ? "active" : ""
                          } `}
                          style={{
                            width: roleName === "Technician" ? "100%" : "auto",
                            minWidth:
                              roleName === "Technician" ? "100%" : "auto",
                            padding: roleName === "Technician" ? "0" : "0",
                          }}
                          data-tab="ticketmanagement"
                        >
                          <TicketManagement
                            onNewTicketClick={() => handleTabChange("repairs")}
                            onViewTicket={(show) =>
                              setShowOrderList(show ?? true)
                            }
                            showOrderList={showOrderList}
                            activeTab={activeTab}
                          />
                        </div>

                        <div
                          className={`tab_content ${
                            activeTab === "Tablet" ? "active" : ""
                          }`}
                          data-tab="Tablet"
                        >
                          <div className="row g-3">
                            {showBrandForm && activeTab === "Tablet" && (
                              <div className="col-12">
                                <BrandForm
                                  brand={selectedBrand}
                                  onClose={() => {
                                    setShowBrandForm(false);
                                    setActiveTab("repairs");
                                    setShowOrderList(false);
                                    dispatch(removeSelectedService());
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {(roleName === "Admin" ||
        roleName === "Super Admin" ||
        roleName === "Franchise Admin" ||
        roleName === "Store Manager") &&
        (showOrderList ||
          (activeTab === "accessories" &&
            accessoriesNav.currentView === "products")) && (
          <div className="pos-footer bg-white p-3 border-top">
            <div className="d-flex align-items-center justify-content-center flex-wrap gap-2">
              <Link
                to="#"
                className={`btn btn-danger d-inline-flex align-items-center justify-content-center ${
                  !hasItems ? "disabled" : ""
                }`}
                data-bs-toggle={hasItems ? "modal" : undefined}
                data-bs-target={hasItems ? "#print-receipt" : undefined}
                disabled={!hasItems}
              >
                Submit & Print
              </Link>
            </div>
          </div>
        )}
      <PosModals onCustomerCreated={handleCustomerCreated} />
    </div>
  );
};

export default Pos;