import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Select from "react-select";
import PosModals from "../../core/modals/pos-modal/posModals";
import BrandForm from "./BrandForm";
// import TicketManagement from "./TicketManagement";
import Accessories from "./accessories";
import { useSelector } from "react-redux"; // Add this import
import axios from "axios"; // Import axios for API calls
import { useDispatch } from "react-redux";
import { customerAdded } from "../../core/redux/customerSlice";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { selectCartItems } from "../../core/redux/accessoriesSlice";
import { selectCartItems as selectPartItems } from "../../core/redux/partSlice";
import { removeCartItem as removeAccessoryItem } from "../../core/redux/accessoriesSlice";
import { removeSelectedService } from "../../core/redux/serviceTypeSlice";
import { removePartItem } from "../../core/redux/partSlice";
import { removeTicketItem } from "../../core/redux/ticketSlice";
import { removeRepairByOrderId } from "../../core/redux/repairSlice";
import { clearChecklist } from "../../core/redux/checklistSlice";
import "./pos.css";
import { clearTickets } from "../../core/redux/ticketSlice";
import { resetCart } from "../../core/redux/partSlice";

const Pos = () => {
  const BASE_URL = process.env.REACT_APP_BASEURL;
  const [contactMethods, setContactMethods] = useState({
    call: false,
    sms: false,
    email: false,
  });
  const [isAdded, setIsAdded] = useState(false);

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
  // const [selectedCategory, setSelectedCategory] = useState(null);
  const [apiCustomers, setApiCustomers] = useState([]);
  const [orderData, setOrderData] = useState({
    orderNumber: "",
    items: [],
    totalAmount: 0,
  });
  // const addRepairItem = (newItem) => {
  //   setOrderData((prev) => ({
  //     ...prev,
  //     items: [...prev.items, newItem],
  //     totalAmount: prev.totalAmount + (newItem.price || 0),
  //   }));
  // };
  const [loading, setLoading] = useState(true);
  const orderItems = useSelector(selectCartItems);
  // const partItems = useSelector((state) => state.parts?.cartItems || []);
  const partItems = useSelector(selectPartItems); // Rename the variable
  const Location = useLocation();
  const [customers, setCustomers] = useState([
    { value: "1", label: "Walk in Customer" },
    ...(customerName ? [{ value: "current", label: customerName }] : []),
  ]);

  const handleCheckboxChange = (method) => {
    setContactMethods((prev) => ({
      ...prev,
      [method]: !prev[method],
    }));
    // Reset added status when changing selections
    setIsAdded(false);
  };

  const handleAddClick = () => {
    // Only mark as added if at least one method is selected
    if (contactMethods.call || contactMethods.sms || contactMethods.email) {
      setIsAdded(true);
      // Here you would typically save the preferences to your state/API
    }
  };
  useEffect(() => {
    const handleClick = (event) => {
      if (!event.target.closest(".product-info")) return;

      const productInfo = event.target.closest(".product-info");
      productInfo.classList.toggle("active");

      // Safely get elements with null checks
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

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/v1/User/GetCustomers`);
        if (response.data && response.data.data) {
          // Transform API data to match Select component format
          const formattedCustomers = response.data.data.map((customer) => ({
            value: customer.customerId,
            label: customer.customerName,
            ...customer, // Include all customer data in case needed later
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

  useEffect(() => {
    setCustomers([
      { value: "1", label: "Walk in Customer" },
      ...(customerName ? [{ value: "current", label: customerName }] : []),
      ...apiCustomers,
    ]);
  }, [apiCustomers, customerName]);

  const [selectedCustomer, setSelectedCustomer] = useState(
    customerName
      ? { value: "current", label: customerName }
      : { value: "1", label: "Walk in Customer" }
  );

  // const [selectedCustomer, setSelectedCustomer] = useState(customers[0]);
  const handleCustomerCreated = (newCustomer) => {
    const newCustomerOption = {
      value: Date.now().toString(),
      label: newCustomer.fullName || newCustomer.customerName,
    };
    setCustomers([...customers, newCustomerOption]);
    setSelectedCustomer(newCustomerOption);
  };

  // In Pos.js
  // const handleBrandClick = (brand) => {
  //   setSelectedBrand({
  //     ...brand,
  //     deviceType: brand.name === "Mobiles" ? "Mobile" : "Tablet", // Set deviceType based on clicked card
  //   });
  //   setShowBrandForm(true);
  //   setShowOrderList(true); // Add this line
  // };

  // Handle quantity changes
  // const handleQuantityChange = (productOrId, quantityOrProduct) => {
  //   // If first parameter is an object (from product selection)
  //   if (typeof productOrId === "object") {
  //     const product = productOrId;
  //     setOrderItems((prevItems) => {
  //       const existingItemIndex = prevItems.findIndex(
  //         (item) => item.id === product.id
  //       );

  //       if (existingItemIndex >= 0) {
  //         // Update existing item
  //         const updatedItems = [...prevItems];
  //         updatedItems[existingItemIndex] = {
  //           ...updatedItems[existingItemIndex],
  //           quantity:
  //             updatedItems[existingItemIndex].quantity + product.quantity,
  //         };
  //         return updatedItems;
  //       } else {
  //         // Add new item if quantity > 0
  //         return product.quantity > 0 ? [...prevItems, product] : prevItems;
  //       }
  //     });
  //   }
  //   // If called from CartCounter (id and quantity)
  //   else {
  //     const id = productOrId;
  //     const quantity = quantityOrProduct;
  //     setOrderItems((prevItems) => {
  //       const existingItemIndex = prevItems.findIndex((item) => item.id === id);

  //       if (existingItemIndex >= 0) {
  //         if (quantity === 0) {
  //           return prevItems.filter((item) => item.id !== id);
  //         }
  //         const updatedItems = [...prevItems];
  //         updatedItems[existingItemIndex] = {
  //           ...updatedItems[existingItemIndex],
  //           quantity: quantity,
  //         };
  //         return updatedItems;
  //       }
  //       return prevItems;
  //     });
  //   }
  // };

  // const handleTabChange = (tab) => {
  //   // Reset accessories navigation when switching to accessories tab
  //   if (tab === "accessories") {
  //     setAccessoriesNav({
  //       currentView: "categories",
  //       currentCategory: null,
  //     });
  //     setShowOrderList(true); // Explicitly show order list for accessories
  //   } else if (tab === "ticketmanagement") {
  //     setShowOrderList(false); // Hide order list for ticket management
  //   } else if (tab === "repairs") {
  //     setShowOrderList(false); // Hide order list for repairs
  //   }

  //   setActiveTab(tab);
  //   setShowBrandForm(false);
  // };

  const handleTabChange = (tab) => {
    // Reset accessories navigation when switching to accessories tab
    if (tab === "accessories") {
      setAccessoriesNav({
        currentView: "categories",
        currentCategory: null,
      });
      setSelectedSubCategory(null);
      setShowOrderList(false); // Start with no order list for categories view
    } else {
      setShowOrderList(false); // Hide for other tabs
    }
    if (tab !== "Mobiles" && tab !== "Tablet") {
      setShowBrandForm(false);
      setSelectedBrand(null);
      dispatch(removeSelectedService());
    }

    setActiveTab(tab);
    setShowBrandForm(false);
    // Add this to reset ticket-related states
    if (tab !== "ticketmanagement") {
      dispatch(clearTickets());
      dispatch(resetCart());
    }
  };

  // const handleBackClick = () => {
  //   if (activeTab === "accessories") {
  //     if (accessoriesNav.currentView === "products") {
  //       // If viewing products, go back to categories
  //       setAccessoriesNav({
  //         currentView: "categories",
  //         currentCategory: null,
  //       });
  //       setShowOrderList(false);
  //     } else {
  //       // If already viewing categories, go to repairs tab
  //       setActiveTab("repairs");
  //       setShowOrderList(false);
  //     }
  //   } else if (activeTab === "Mobiles" || activeTab === "Tablet") {
  //     setActiveTab("repairs");
  //     setShowBrandForm(false);
  //     setShowOrderList(false);
  //   } else {
  //     setActiveTab("repairs");
  //     setShowOrderList(false);
  //   }
  // };
  const handleBackClick = () => {
    if (activeTab === "accessories") {
      if (accessoriesNav.currentView === "products") {
        // If viewing products, go back to subcategories
        setAccessoriesNav({
          currentView: "subcategories",
          currentCategory: accessoriesNav.currentCategory,
        });
        setSelectedSubCategory(null);
      } else if (accessoriesNav.currentView === "subcategories") {
        // If viewing subcategories, go back to categories
        setAccessoriesNav({
          currentView: "categories",
          currentCategory: null,
        });
        setSelectedCategory(null);
      } else {
        // If already viewing categories, go to repairs tab
        setActiveTab("repairs");
      }
    } else if (activeTab === "Mobiles" || activeTab === "Tablet") {
      setActiveTab("repairs");
      setShowBrandForm(false);
      setShowOrderList(false);
    }
  };
  useEffect(() => {
    const handleClick = (event) => {
      // Check if the clicked element is a product-info
      if (!event.target.closest(".product-info")) return;

      const productInfo = event.target.closest(".product-info");
      productInfo.classList.toggle("active");

      // Safely get the elements with null checks
      const emptyCart = document.querySelector(".product-wrap .empty-cart");
      const productList = document.querySelector(".product-wrap .product-list");

      // If elements don't exist, exit early
      if (!emptyCart || !productList) {
        console.warn("Required DOM elements not found");
        return;
      }

      const hasActiveProducts =
        document.querySelectorAll(".product-info.active").length > 0;

      // Update styles
      emptyCart.style.display = hasActiveProducts ? "none" : "flex";
      productList.style.display = hasActiveProducts ? "block" : "none";
    };

    // Add the event listener
    document.addEventListener("click", handleClick);
    document.body.classList.add("pos-page");

    // Cleanup function
    return () => {
      document.removeEventListener("click", handleClick);
      document.body.classList.remove("pos-page");
    };
  }, [Location.pathname, showAlert1]);

  const handleCustomerSelect = (selectedOption) => {
    setSelectedCustomer(selectedOption);

    // Dispatch the selected customer to Redux
    if (selectedOption && selectedOption.value !== "1") {
      // Skip for "Walk in Customer"
      dispatch(
        customerAdded({
          customerId: selectedOption.value,
          customerName: selectedOption.label,
          phone: selectedOption.phone || "",
          email: selectedOption.email || "",
          address: selectedOption.address || "",
          city: selectedOption.city || "",
          state: selectedOption.state || "",
          country: selectedOption.country || "",
          zipcode: selectedOption.zipcode || "",
        })
      );
    }
  };

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
        // Set the customer from the order data
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
  }, [repairData]);

  const handleDeleteTicketItem = (repairOrderId) => {
    dispatch(removeTicketItem(repairOrderId));
    dispatch(clearChecklist()); // Clear all checklist data
  };

  const handleDeleteService = (serviceId) => {
    dispatch(removeSelectedService(serviceId));
    dispatch(clearChecklist()); // Clear all checklist data

    const repairItems = repairData.repairItems || [];
    const repairItemToDelete = repairItems.find(
      (item) => item.taskTypeId === serviceId
    );

    if (repairItemToDelete) {
      dispatch(removeRepairByOrderId(repairItemToDelete.repairOrderId));
    }
  };

  const handleDeleteAccessory = (accessoryId) => {
    dispatch(removeAccessoryItem(accessoryId));
  };

  const handleDeletePart = (partId) => {
    dispatch(removePartItem(partId));
  };

  return (
    <div className="main-wrapper pos-five">
      <div className="page-wrapper pos-pg-wrapper ms-0">
        <div className="content pos-design p-0">
          <div className="row pos-wrapper">
            {/* Products */}
            <div
              className={`col-md-12 ${(roleName === "Admin" ||
                  roleName === "Super Admin" ||
                  roleName === "Franchise Admin" ||
                  roleName === "Store Manager") &&
                  (showOrderList ||
                    (activeTab === "accessories" &&
                      accessoriesNav.currentView === "products"))
                  ? "col-lg-8 col-xl-9"
                  : "col-12"
                } d-flex`}
            >
              <div className="pos-categories tabs_wrapper p-0 flex-fill">
                <div className="content-wrap">
                  <div className="tab-wrap">
                    <ul className="tabs owl-carousel pos-category5">
                      {/* Show Repairs tab for Admin, Store Manager, Franchise Admin */}
                      {/* {(roleName === "Admin" ||
                        roleName === "Super Admin" ||
                        roleName === "Store Manager" ||
                        roleName === "Franchise Admin") && (
                        <li
                          id="repairs"
                          onClick={() => handleTabChange("repairs")}
                          className={activeTab === "repairs" ? "active" : ""}
                        >
                          <Link to="#">
                              <img
                                style={{ width: "204px" }}
                                src="assets/img/products/pos-product-02.svg"
                                alt="Categories"
                              />
                            </Link>
                          <h6>
                            <Link to="#">
                              <b>Repairs</b>
                            </Link>
                          </h6>
                        </li>
                      )} */}

                      {/* Show Accessories tab for Admin, Store Manager, Franchise Admin */}
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
                            className={activeTab === "accessories" ? "active" : ""}
                          >
                            <h6>
                              <Link to="#" onClick={(e) => e.preventDefault()}>
                                <b>Products</b>
                              </Link>
                            </h6>
                          </li>
                        )}

                      {/* Show Ticket Management for all authorized roles */}
                      {/* {(roleName === "Admin" ||
                        roleName === "Super Admin" ||
                        roleName === "Store Manager" ||
                        roleName === "Franchise Admin" ||
                        roleName === "Technician") && (
                        <li
                          id="ticketmanagement"
                          onClick={() => {
                            setActiveTab("ticketmanagement");
                            setShowOrderList(false); // Explicitly hide order list
                          }}
                          className={
                            activeTab === "ticketmanagement" ? "active" : ""
                          }
                        >
                          <Link to="#">
                              <img
                                style={{ width: "204px" }}
                                src="assets/img/products/pos-product-02.svg"
                                alt="Categories"
                              />
                            </Link>
                          <h6>
                            <Link to="#">
                              <b>
                                Ticket <br />
                                Management
                              </b>
                            </Link>
                          </h6>
                        </li>
                      )} */}
                    </ul>
                  </div>
                  <div className="tab-content-wrap">
                    <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                      <div className="mb-3 d-flex align-items-center">
                        {(activeTab === "Mobiles" ||
                          activeTab === "Tablet" ||
                          (activeTab === "accessories" &&
                            (accessoriesNav.currentView === "products" ||
                              accessoriesNav.currentView === "subcategories"))) && (
                            <button
                              onClick={handleBackClick}
                              className="btn btn-sm btn-outline-secondary me-3"
                            >
                              <i className="ti ti-arrow-left me-1"></i> Back
                            </button>
                          )}
                        <div>
                          {/* <h5 className="mb-1">Welcome, {username}</h5> */}
                          {/* <p className="fs-15">
                              {new Date().toLocaleString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>{" "} */}
                        </div>
                      </div>
                    </div>
                    <div className="pos-products">
                      <div className="tabs_container">
                        <div
                          className={`tab_content ${activeTab === "accessories" ? "active" : ""
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
                              setShowOrderList(true); // This should make the order list appear
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
                              setAccessoriesNav(prev => ({
                                ...prev,
                                currentView: view
                              }));
                            }}
                            showOrderList={showOrderList} // Pass the showOrderList prop
                          />
                        </div>

                        {/* Ticket management */}
                        {/* <div
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
                            onViewTicket={(show) => setShowOrderList(show ?? true)}
                            showOrderList={showOrderList}
                            activeTab={activeTab} // Add this line
                          />
                        </div> */}

                        {/* categories */}
                        {/* <div
                          className={`tab_content ${
                            activeTab === "repairs" ? "active" : ""
                          } `}
                          data-tab="repairs"
                        >
                          <div className="modal-header">
                            <h5 className="modal-title">Create New Ticket</h5>
                          </div>
                          <div className="row g-3">
                            <div className="col-sm-6 col-md-6 col-lg-6 col-xl-4 col-xxl-3">
                              <div
                                className={`product-info card mb-0 ${
                                  activeTab === "Tablet" ? "active" : ""
                                }`}
                                onClick={() => {
                                  setActiveTab("Tablet");
                                  handleBrandClick({
                                    name: "Tablet",
                                    deviceType: "Tablet",
                                  });
                                }}
                                tabIndex="0"
                                id="Tablet"
                                style={{ minHeight: "300px" }} // Add fixed height or min-height
                              >
                                <Link
                                  to="#"
                                  className="pro-img d-flex justify-content-center align-items-center"
                                  style={{ height: "200px" }}
                                >
                                  <img
                                    src="assets/img/products/tab1.png"
                                    alt="Products"
                                    className="img-fluid"
                                    style={{
                                      maxHeight: "100%",
                                      maxWidth: "100%",
                                      objectFit: "contain",
                                    }}
                                  />
                                  <span>
                                    <i className="ti ti-circle-check-filled" />
                                  </span>
                                </Link>
                                <h6 className="cat-name">
                                  <Link to="#">Repair</Link>
                                </h6>
                                <h6 className="product-name">
                                  <Link to="#">Tablet</Link>
                                </h6>
                              </div>
                            </div>

                            <div className="col-sm-6 col-md-6 col-lg-6 col-xl-4 col-xxl-3">
                              <div
                                className={`product-info card mb-0 ${
                                  activeTab === "Mobiles" ? "active" : ""
                                }`}
                                onClick={() => {
                                  setActiveTab("Mobiles");
                                  handleBrandClick({
                                    name: "Mobiles",
                                    deviceType: "Mobile",
                                  });
                                }}
                                tabIndex="0"
                                id="Mobiles"
                                style={{ minHeight: "300px" }} // Same height as Tablet card
                              >
                                <Link
                                  to="#"
                                  className="pro-img d-flex justify-content-center align-items-center"
                                  style={{ height: "200px" }}
                                >
                                  <img
                                    src="assets/img/products/expire-product-02.png"
                                    alt="Products"
                                    className="img-fluid"
                                    style={{
                                      maxHeight: "100%",
                                      maxWidth: "100%",
                                      objectFit: "contain",
                                    }}
                                  />{" "}
                                  <span>
                                    <i className="ti ti-circle-check-filled" />
                                  </span>
                                </Link>
                                <h6 className="cat-name">
                                  <Link to="#">Repair</Link>
                                </h6>
                                <h6 className="product-name">
                                  <Link to="#">Mobile</Link>
                                </h6>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`tab_content ${
                            activeTab === "Mobiles" ? "active" : ""
                          }`}
                          data-tab="Mobiles"
                        >
                          <div className="row g-3">
                            {showBrandForm && activeTab === "Mobiles" && (
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
                        </div> */}
                        <div
                          className={`tab_content ${activeTab === "Tablet" ? "active" : ""
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

            {/* /Products */}
            {/* Order Details */}
            {/* Only show order sidebar for Admin, Franchise Admin, and Store Manager */}
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
                        <div className="order-head d-flex align-items-center justify-content-between w-100">
                          <div>
                            <h3>Order Summary</h3>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge badge-dark fs-10 fw-medium badge-xs">
                              {orderData?.orderNumber}
                            </span>
                          </div>
                        </div>
                        <div className="customer-info block-section">
                          <h5 className="mb-2">Customer Information</h5>
                          <div className="d-flex align-items-center gap-2">
                            <div className="flex-grow-1">
                              {loading ? (
                                <div>Loading customers...</div>
                              ) : (
                                <Select
                                  options={customers}
                                  classNamePrefix="react-select select"
                                  placeholder={
                                    selectedCustomer?.label || "Choose a Name"
                                  }
                                  value={selectedCustomer}
                                  onChange={handleCustomerSelect}
                                  isLoading={loading}
                                />
                              )}
                            </div>
                            <Link
                              to="#"
                              className="btn btn-teal btn-icon fs-20"
                              data-bs-toggle="modal"
                              data-bs-target="#create"
                            >
                              <i className="ti ti-user-plus" />
                            </Link>
                          </div>

                          <div className="preferred-contact mt-3">
                            <h6 className="mb-2">Preferred Contact Method:</h6>
                            <div className="d-flex flex-column gap-2">
                              <div className="d-flex align-items-center gap-3">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="contactCall"
                                    checked={contactMethods.call}
                                    onChange={() =>
                                      handleCheckboxChange("call")
                                    }
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="contactCall"
                                  >
                                    Call
                                  </label>
                                </div>
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="contactSMS"
                                    checked={contactMethods.sms}
                                    onChange={() => handleCheckboxChange("sms")}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="contactSMS"
                                  >
                                    SMS
                                  </label>
                                </div>
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="contactEmail"
                                    checked={contactMethods.email}
                                    onChange={() =>
                                      handleCheckboxChange("email")
                                    }
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="contactEmail"
                                  >
                                    Email
                                  </label>
                                </div>
                              </div>

                              <div className="align-self-center">
                                <button
                                  className={`btn btn-sm ${isAdded ? "btn-success" : "btn-primary"
                                    }`}
                                  onClick={handleAddClick}
                                  disabled={
                                    isAdded ||
                                    (!contactMethods.call &&
                                      !contactMethods.sms &&
                                      !contactMethods.email)
                                  }
                                >
                                  {isAdded ? "Added" : "Add"}
                                </button>
                              </div>
                            </div>
                          </div>

                          {showAlert && (
                            <div className="customer-item  d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3">
                              {/* <div>
                                  <h6 className="fs-16 fw-bold mb-1">
                                    Customer: {orderData.customerName}
                                  </h6>
                                </div> */}
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
                            <div className="table-responsive" style={{ overflowX: 'hidden' }}>
                              <table className="table table-borderless" style={{ tableLayout: 'fixed', width: '100%' }}>
                                <thead>
                                  <tr>
                                    <th className="fw-bold bg-light" style={{ width: '70%' }}>Item</th>
                                    <th className="fw-bold bg-light text-end" style={{ width: '30%' }}>
                                      Cost
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {/* Render ticket items if they exist */}
                                  {ticketData.ticketItems?.length > 0 &&
                                    ticketData.ticketItems.map((item) => (
                                      <tr key={`repair-${item.repairOrderId}`}>
                                        <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          <div className="d-flex align-items-center">
                                            <Link
                                              to="#"
                                              className="close-icon"
                                              onClick={() =>
                                                handleDeleteTicketItem(
                                                  item.repairOrderId
                                                )
                                              }
                                              style={{ flexShrink: 0, marginRight: '8px' }}
                                            >
                                              <i className="ti ti-trash" />
                                            </Link>
                                            <h6 className="fs-13 fw-normal" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                              {item.taskTypeName}
                                              {/* <Link
                                                to="#"
                                                className="link-default"
                                                style={{ fontSize: "12px" }}
                                              >
                                               
                                              </Link> */}
                                            </h6>
                                          </div>
                                        </td>
                                        <td
                                          className="fs-13 fw-semibold text-gray-9 text-end"
                                        // style={{ fontSize: "12px" }}
                                        >
                                          ₹{item.serviceCharge}
                                        </td>
                                      </tr>
                                    ))}

                                  {/* Render other items only if they exist */}
                                  {(selectedServices.length > 0 ||
                                    orderItems.length > 0 ||
                                    partItems.length > 0) && (
                                      <>
                                        {/* Render selected services */}
                                        {selectedServices.map((item) => (
                                          <tr key={`service-${item.id}`}>
                                            <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                              <div className="d-flex align-items-center">
                                                <Link
                                                  to="#"
                                                  className="close-icon"
                                                  onClick={() =>
                                                    handleDeleteService(item.id)
                                                  }
                                                  style={{ flexShrink: 0, marginRight: '8px' }}
                                                >
                                                  <i className="ti ti-trash" />
                                                </Link>
                                                <h6 className="fs-13 fw-normal m-0" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                  {item.name}
                                                  {/* <Link
                                                  to="#"
                                                  className="link-default"
                                                  style={{ fontSize: "12px" }}
                                                >
                                                 
                                                </Link> */}
                                                </h6>
                                              </div>
                                            </td>
                                            <td
                                              className="fs-13 fw-semibold text-gray-9 text-end"
                                            // style={{ fontSize: "12px" }}
                                            >
                                              ₹{item.price}
                                            </td>
                                          </tr>
                                        ))}

                                        {/* Render order items */}
                                        {orderItems.map((item) => (
                                          <tr key={`order-item-${item.id}`}>
                                            <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                              <div className="d-flex align-items-center">
                                                <Link
                                                  to="#"
                                                  className="close-icon"
                                                  onClick={() =>
                                                    handleDeleteAccessory(item.id)
                                                  }
                                                  style={{ flexShrink: 0, marginRight: '8px' }}
                                                >
                                                  <i className="ti ti-trash" />
                                                </Link>
                                                <h6 className="fs-13 fw-normal m-0" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                  {item.name}
                                                  {/* <Link
                                                  to="#"
                                                  className="link-default"
                                                  style={{ fontSize: "12px" }}
                                                >
                                                 
                                                </Link> */}
                                                </h6>
                                              </div>
                                            </td>
                                            <td
                                              className="fs-13 fw-semibold text-gray-9 text-end"
                                            // style={{ fontSize: "12px" }}
                                            >
                                              ₹{item.price * item.quantity}
                                            </td>
                                          </tr>
                                        ))}

                                        {/* Render part items */}
                                        {partItems.map((item) => (
                                          <tr key={`part-item-${item.id}`}>
                                            <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                              <div className="d-flex align-items-center">
                                                <Link
                                                  to="#"
                                                  className="close-icon"
                                                  onClick={() =>
                                                    handleDeletePart(item.id)
                                                  }
                                                  style={{ flexShrink: 0, marginRight: '8px' }}
                                                >
                                                  <i className="ti ti-trash" />
                                                </Link>
                                                <h6 className="fs-13 fw-normal m-0" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                  {item.name}
                                                  {/* <Link
                                                  to="#"
                                                  className="link-default"
                                                  style={{ fontSize: "12px" }}
                                                >
                                                 
                                                </Link> */}
                                                </h6>
                                              </div>
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

                                  {/* Show "No items" message only when absolutely nothing exists */}
                                  {!ticketData.ticketItems?.length &&
                                    selectedServices.length === 0 &&
                                    orderItems.length === 0 &&
                                    partItems.length === 0 && (
                                      <tr>
                                        <td
                                          colSpan="2"
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
                        {/* <div className="discount-item d-flex align-items-center justify-content-between  bg-purple-transparent mt-3 flex-wrap gap-2">
                            <div className="d-flex align-items-center">
                              <span className="bg-purple discount-icon br-5 flex-shrink-0 me-2">
                                <img
                                  src="assets/img/icons/discount-icon.svg"
                                  alt="img"
                                />
                              </span>
                              <div>
                                <h6 className="fs-14 fw-bold text-purple mb-1">
                                  Discount 5%
                                </h6>
                                <p className="mb-0">
                                  For $20 Minimum Purchase, all Items
                                </p>
                                <p></p>
                              </div>
                            </div>
                            <Link to="#" className="close-icon">  
                              <i className="ti ti-trash" />
                            </Link>
                          </div> */}
                      </div>
                      <div className="order-total bg-total bg-white p-0">
                        {/* <h5 className="mb-3">Payment Summary</h5> */}
                        <table className="table table-responsive table-borderless">
                          <tbody>
                            {/* <tr>
                                <td>
                                  Shipping
                                  <Link
                                    to="#"
                                    className="ms-3 link-default"
                                    data-bs-toggle="modal"
                                    data-bs-target="#shipping-cost"
                                  >
                                    <i className="ti ti-edit" />
                                  </Link>
                                </td>
                                <td className="text-gray-9 text-end">$40.21</td>
                              </tr> */}
                            {/* <tr>
                                <td>
                                  Tax
                                  <Link
                                    to="#"
                                    className="ms-3 link-default"
                                    data-bs-toggle="modal"
                                    data-bs-target="#order-tax"
                                  >
                                    <i className="ti ti-edit" />
                                  </Link>
                                </td>
                                <td className="text-gray-9 text-end">$25</td>
                              </tr> */}
                            {/* <tr>
                                <td>
                                  Coupon
                                  <Link
                                    to="#"
                                    className="ms-3 link-default"
                                    data-bs-toggle="modal"
                                    data-bs-target="#coupon-code"
                                  >
                                    <i className="ti ti-edit" />
                                  </Link>
                                </td>
                                <td className="text-gray-9 text-end">$25</td>
                              </tr> */}
                            {/* <tr>
                                <td>
                                  <span className="text-danger">Discount</span>
                                  <Link
                                    to="#"
                                    className="ms-3 link-default"
                                    data-bs-toggle="modal"
                                    data-bs-target="#discount"
                                  >
                                    <i className="ti ti-edit" />
                                  </Link>
                                </td>
                                <td className="text-danger text-end">$15.21</td>
                              </tr> */}
                            {/* <tr>
                                <td>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                      id="round"
                                      defaultChecked
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="round"
                                    >
                                      Roundoff
                                    </label>
                                  </div>
                                </td>
                                <td className="text-gray-9 text-end">+0.11</td>
                              </tr>
                              <tr>
                                <td>Sub Total</td>
                                <td className="text-gray-9 text-end">$60,454</td>
                              </tr> */}
                            <tr>
                              <td className="fw-bold border-top border-dashed p-4">
                                Total
                              </td>
                              <td className="text-gray-9 fw-bold text-end border-top border-dashed p-4">
                                ₹{selectedServices.reduce(
                                  (total, item) => total + (item.price || 0),
                                  0
                                ) +
                                  orderItems.reduce(
                                    (total, item) => total + item.price * item.quantity,
                                    0
                                  ) +
                                  (ticketData.ticketItems?.reduce(
                                    (total, item) => total + (item.serviceCharge || 0),
                                    0
                                  ) || 0) +
                                  partItems.reduce(
                                    (total, item) => total + item.price * item.quantity,
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
            {/* <div className="card payment-method">
                <div className="card-body">
                  <h5 className="mb-3">Select Payment</h5>
                  <div className="row align-items-center methods g-2">
                    <div className="col-sm-6 col-md-4 d-flex">
                      <Link
                        to="#"
                        className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
                        data-bs-toggle="modal"
                        data-bs-target="#payment-cash"
                      >
                        <img
                          src="assets/img/icons/cash-icon.svg"
                          className="me-2"
                          alt="img"
                        />
                        <p className="fs-14 fw-medium">Cash</p>
                      </Link>
                    </div>
                    <div className="col-sm-6 col-md-4 d-flex">
                      <Link
                        to="#"
                        className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
                        data-bs-toggle="modal"
                        data-bs-target="#payment-card"
                      >
                        <img
                          src="assets/img/icons/card.svg"
                          className="me-2"
                          alt="img"
                        />
                        <p className="fs-14 fw-medium">Card</p>
                      </Link>
                    </div>
                    <div className="col-sm-6 col-md-4 d-flex">
                                <Link
                                  to="#"
                                  className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
                                  data-bs-toggle="modal"
                                  data-bs-target="#payment-points"
                                >
                                  <img
                                    src="assets/img/icons/points.svg"
                                    className="me-2"
                                    alt="img"
                                  />
                                  <p className="fs-14 fw-medium">Points</p>
                                </Link>
                              </div>
                              <div className="col-sm-6 col-md-4 d-flex">
                                <Link
                                  to="#"
                                  className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
                                  data-bs-toggle="modal"
                                  data-bs-target="#payment-deposit"
                                >
                                  <img
                                    src="assets/img/icons/deposit.svg"
                                    className="me-2"
                                    alt="img"
                                  />
                                  <p className="fs-14 fw-medium">Deposit</p>
                                </Link>
                              </div>
                              <div className="col-sm-6 col-md-4 d-flex">
                                <Link
                                  to="#"
                                  className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
                                  data-bs-toggle="modal"
                                  data-bs-target="#payment-cheque"
                                >
                                  <img
                                    src="assets/img/icons/cheque.svg"
                                    className="me-2"
                                    alt="img"
                                  />
                                  <p className="fs-14 fw-medium">Cheque</p>
                                </Link>
                              </div>
                              <div className="col-sm-6 col-md-4 d-flex">
                                <Link
                                  to="#"
                                  className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
                                  data-bs-toggle="modal"
                                  data-bs-target="#gift-payment"
                                >
                                  <img
                                    src="assets/img/icons/giftcard.svg"
                                    className="me-2"
                                    alt="img"
                                  />
                                  <p className="fs-14 fw-medium">Gift Card</p>
                                </Link>
                              </div>
                              <div className="col-sm-6 col-md-4 d-flex">
                                <Link
                                  to="#"
                                  className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
                                  data-bs-toggle="modal"
                                  data-bs-target="#scan-payment"
                                >
                                  <img
                                    src="assets/img/icons/scan-icon.svg"
                                    className="me-2"
                                    alt="img"
                                  />
                                  <p className="fs-14 fw-medium">Scan</p>
                                </Link>
                              </div>
                              <div className="col-sm-6 col-md-4 d-flex">
                                <Link
                                  to="#"
                                  className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
                                >
                                  <img
                                    src="assets/img/icons/paylater.svg"
                                    className="me-2"
                                    alt="img"
                                  />
                                  <p className="fs-14 fw-medium">Pay Later</p>
                                </Link>
                              </div>
                              <div className="col-sm-6 col-md-4 d-flex">
                                <Link
                                  to="#"
                                  className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
                                >
                                  <img
                                    src="assets/img/icons/external.svg"
                                    className="me-2"
                                    alt="img"
                                  />
                                  <p className="fs-14 fw-medium">External</p>
                                </Link>
                              </div>
                              <div className="col-sm-6 col-md-4 d-flex">
                                <Link
                                  to="#"
                                  className="payment-item d-flex align-items-center justify-content-center p-2 flex-fill"
                                  data-bs-toggle="modal"
                                  data-bs-target="#split-payment"
                                >
                                  <img
                                    src="assets/img/icons/split-bill.svg"
                                    className="me-2"
                                    alt="img"
                                  />
                                  <p className="fs-14 fw-medium">Split Bill</p>
                                </Link>
                              </div>
                  </div>
                </div>
              </div> */}
            {/* <div className="btn-row d-flex align-items-center justify-content-between gap-3">
                <Link
                  to="#"
                  className="btn btn-white d-flex align-items-center justify-content-center flex-fill m-0"
                  data-bs-toggle="modal"
                  data-bs-target="#hold-order"
                >
                  <i className="ti ti-printer me-2" />
                  Print Order
                </Link>
                <Link
                  to="#"
                  className="btn btn-secondary d-flex align-items-center justify-content-center flex-fill m-0"
                >
                  <i className="ti ti-shopping-cart me-2" />
                  Place Order
                </Link>
              </div> */}
          </div>
        </div>

        {/* /Order Details */}
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
              {/* <Link
                    to="#"
                    className="btn btn-orange d-inline-flex align-items-center justify-content-center"
                    data-bs-toggle="modal"
                    data-bs-target="#hold-order"
                  >
                    <i className="ti ti-player-pause me-2" />
                    Hold
                  </Link> */}
              {/* <Link
                    to="#"
                    className="btn btn-info d-inline-flex align-items-center justify-content-center"
                  >
                    <i className="ti ti-trash me-2" />
                    Void
                  </Link> */}
              {/* <Link
                to="#"
                className="btn btn-cyan d-flex align-items-center justify-content-center"
              >
                <i className="ti ti-cash-banknote me-2" />
                Print Order
              </Link> */}
              {/* <Link
                to="#"
                className="btn btn-secondary d-inline-flex align-items-center justify-content-center"
                data-bs-toggle="modal"
                data-bs-target="#print-receipt"
              >
                <i className="ti ti-shopping-cart me-2" />
                View Orders
              </Link> */}
              <Link
                to="#"
                className="btn btn-danger d-inline-flex align-items-center justify-content-center"
                data-bs-toggle="modal"
                data-bs-target="#print-receipt"
              >
                Submit & Print
              </Link>
              {/* <Link
                    to="#"
                    className="btn btn-danger d-inline-flex align-items-center justify-content-center"
                    data-bs-toggle="modal"
                    data-bs-target="#recents"
                  >
                    <i className="ti ti-refresh-dot me-2" />
                    Transaction
                  </Link> */}
            </div>
          </div>
        )}
      <PosModals onCustomerCreated={handleCustomerCreated} />
      {/* {showBrandForm && (
        <BrandForm
          brand={selectedBrand}
          onClose={() => {
            setShowBrandForm(false);
            setActiveTab("repairs");
            setShowOrderList(false);
            // Clear any selected services or other related states
            dispatch(removeSelectedService()); // If applicable
          }}
        />
      )}{" "} */}
    </div>
  );
};

export default Pos;
