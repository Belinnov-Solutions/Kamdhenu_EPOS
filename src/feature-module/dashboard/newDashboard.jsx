import React, { useState, useEffect, useRef } from "react";
import { DateRangePicker } from "react-bootstrap-daterangepicker";
import moment from "moment";
import PropTypes from "prop-types";
import "bootstrap-daterangepicker/daterangepicker.css";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate

// Register the necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const PredefinedDateRanges = ({ onDateChange, startDate, endDate }) => {
  const [state, setState] = useState({
    start: startDate ? moment(startDate) : moment().subtract(29, "days"),
    end: moment(endDate) || moment(),
  });
  // keep in sync when parent updates filters
  useEffect(() => {
    if (startDate && endDate) {
      setState({ start: moment(startDate), end: moment(endDate) });
    }
  }, [startDate, endDate]);

  const { start, end } = state;

  const handleCallback = (start, end) => {
    setState({ start, end });
    if (onDateChange) {
      onDateChange({ startDate: start, endDate: end });
    }
  };

  // Format to "YYYY/MM/DD" as requested
  const label = `${start.format("YYYY/MM/DD")} - ${end.format("YYYY/MM/DD")}`;

  return (
    <DateRangePicker
      initialSettings={{
        startDate: start.toDate(),
        endDate: end.toDate(),
        ranges: {
          Today: [moment().toDate(), moment().toDate()],
          Yesterday: [
            moment().subtract(1, "days").toDate(),
            moment().subtract(1, "days").toDate(),
          ],
          "Last 7 Days": [
            moment().subtract(6, "days").toDate(),
            moment().toDate(),
          ],
          "Last 30 Days": [
            moment().subtract(29, "days").toDate(),
            moment().toDate(),
          ],
          "This Month": [
            moment().startOf("month").toDate(),
            moment().endOf("month").toDate(),
          ],
          "Last Month": [
            moment().subtract(1, "month").startOf("month").toDate(),
            moment().subtract(1, "month").endOf("month").toDate(),
          ],
        },
      }}
      onCallback={handleCallback}
    >
      <div
        id="reportrange"
        className="col-4"
        style={{
          background: "#fff",
          cursor: "pointer",
          padding: "0.5rem 0.625rem",
          border: "1px solid #E9EDF4",
          width: "100%",
          borderRadius: "5px",
          fontSize: "14px",
          color: "#202C4B",
          height: "38px",
        }}
      >
        <i className="ti ti-calendar"></i>&nbsp;
        <span>{label}</span>
      </div>
    </DateRangePicker>
  );
};

// Add PropTypes validation
PredefinedDateRanges.propTypes = {
  onDateChange: PropTypes.func,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
};

const NewDashboard = () => {
  const BASE_URL = process.env.REACT_APP_BASEURL;
  const { storeId } = useSelector((state) => state.user);
  const navigate = useNavigate(); // Initialize navigate

  const [salesData, setSalesData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dateFrom: moment().subtract(29, "days").toISOString(), // default 30 days ago
    dateTo: moment().toISOString(),                        // default today
    categoryId: null,
    groupBy: "day",
  });


  const categoriesContainerRef = useRef(null);

  useEffect(() => {
    fetchSalesReport();
    fetchCategories();
  }, [filters]);

  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.groupBy) params.append("groupBy", filters.groupBy);

      const response = await axios.get(
        `${BASE_URL}api/v1/Order/SalesReport?${params.toString()}`
      );

      setSalesData(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error("Error fetching sales report:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axios.get(
        `${BASE_URL}api/v1/Product/GetCategories?storeId=${storeId}`
      );

      setCategories(response.data.data);
      setCategoriesLoading(false);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategoriesLoading(false);
    }
  };

  const handleDateRangeChange = (dates) => {
    setFilters({
      ...filters,
      dateFrom: dates.startDate.toISOString(),
      dateTo: dates.endDate.toISOString(),
    });
  };

  const handleGroupByChange = (groupBy) => {
    setFilters({
      ...filters,
      groupBy,
    });
  };

  const handleCategoryFilter = (categoryId) => {
    setFilters({
      ...filters,
      categoryId: categoryId === filters.categoryId ? null : categoryId,
    });
  };

  const scrollCategories = (direction) => {
    if (categoriesContainerRef.current) {
      const scrollAmount = 300;
      if (direction === "left") {
        categoriesContainerRef.current.scrollLeft -= scrollAmount;
      } else {
        categoriesContainerRef.current.scrollLeft += scrollAmount;
      }
    }
  };

  // Function to handle view details navigation
  const handleViewDetails = (period) => {
    // You can pass any necessary data to the dashboard page via state
    navigate("/dashboard", {
      state: {
        periodData: period,
        groupBy: filters.groupBy,
      },
    });
  };

  // Calculate total statistics from sales data
  const totalSales = salesData
    ? salesData.reportData.reduce((sum, day) => sum + day.totalSalesAmount, 0)
    : 0;
  const totalItemsSold = salesData
    ? salesData.reportData.reduce((sum, day) => sum + day.itemsSold, 0)
    : 0;
  const totalOrders = salesData
    ? salesData.reportData.reduce((sum, day) => sum + day.orders, 0)
    : 0;

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "300px" }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger">
            Error loading sales data: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-2">
          <div className="mb-3">
            <h3 className="mb-1">Sales Reports</h3>
            {/* <h1 className="mb-1">Welcome, {roleName}</h1> */}
          </div>
          <div className="d-flex gap-2">
            <div className="input-icon-start position-relative mb-3">
              <PredefinedDateRanges
                onDateChange={handleDateRangeChange}
                startDate={filters.dateFrom}
                endDate={filters.dateTo}
              />

            </div>
            <div className="dropdown mb-3">
              <button
                className="btn btn-outline-secondary dropdown-toggle"
                type="button"
                id="groupByDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Group By: {filters.groupBy}
              </button>
              <ul className="dropdown-menu" aria-labelledby="groupByDropdown">
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleGroupByChange("day")}
                  >
                    Day
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleGroupByChange("week")}
                  >
                    Week
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleGroupByChange("month")}
                  >
                    Month
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Category Cards with Slider */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="mb-0">Categories</h5>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => scrollCategories("left")}
                  disabled={categoriesLoading}
                >
                  <i className="ti ti-chevron-left"></i>
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => scrollCategories("right")}
                  disabled={categoriesLoading}
                >
                  <i className="ti ti-chevron-right"></i>
                </button>
              </div>
            </div>

            <div className="position-relative">
              {categoriesLoading && (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75 rounded">
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}

              <div
                ref={categoriesContainerRef}
                className="d-flex overflow-auto pb-2 scrollbar-hidden"
                style={{
                  scrollBehavior: "smooth",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  gap: "0.75rem",
                }}
              >
                <button
                  className={`btn ${!filters.categoryId ? "btn-primary" : "btn-outline-primary"
                    } flex-shrink-0 mb-2`}
                  onClick={() => handleCategoryFilter(null)}
                  style={{ minWidth: "120px" }}
                >
                  All Categories
                </button>

                {categories.map((category) => (
                  <button
                    key={category.categoryId}
                    className={`btn ${filters.categoryId === category.categoryId
                        ? "btn-primary"
                        : "btn-outline-primary"
                      } flex-shrink-0 mb-2`}
                    onClick={() => handleCategoryFilter(category.categoryId)}
                    style={{ minWidth: "120px" }}
                  >
                    {category.categoryName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-4 col-sm-6 col-12 d-flex">
            <div className="card bg-primary sale-widget flex-fill">
              <div className="card-body d-flex align-items-center">
                <span className="sale-icon bg-white text-primary">
                  <i className="ti ti-file-text fs-24" />
                </span>
                <div className="ms-2">
                  <p className="text-white mb-1">Total Sales</p>
                  <div className="d-inline-flex align-items-center flex-wrap gap-2">
                    <h4 className="text-white">₹{totalSales.toFixed(2)}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-sm-6 col-12 d-flex">
            <div className="card bg-teal sale-widget flex-fill">
              <div className="card-body d-flex align-items-center">
                <span className="sale-icon bg-white text-teal">
                  <i className="ti ti-shopping-cart fs-24" />
                </span>
                <div className="ms-2">
                  <p className="text-white mb-1">Items Sold</p>
                  <div className="d-inline-flex align-items-center flex-wrap gap-2">
                    <h4 className="text-white">{totalItemsSold}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-sm-6 col-12 d-flex">
            <div className="card bg-orange sale-widget flex-fill">
              <div className="card-body d-flex align-items-center">
                <span className="sale-icon bg-white text-orange">
                  <i className="ti ti-receipt fs-24" />
                </span>
                <div className="ms-2">
                  <p className="text-white mb-1">Total Orders</p>
                  <div className="d-inline-flex align-items-center flex-wrap gap-2">
                    <h4 className="text-white">{totalOrders}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Report Table */}
        <div className="row mt-4">
          <div className="col-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <h5 className="card-title mb-0">Sales Report</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>
                          {filters.groupBy === "day"
                            ? "Date"
                            : filters.groupBy === "week"
                              ? "Week"
                              : "Month"}
                        </th>
                        <th>Total Sales</th>
                        <th>Items Sold</th>
                        <th>Orders</th>
                        {/* <th>Top Products</th> */}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData &&
                        salesData.reportData.map((period, index) => (
                          <tr key={index}>
                            <td>
                              {filters.groupBy === "day"
                                ? new Date(period.date).toLocaleDateString(
                                  "en-CA"
                                )
                                : filters.groupBy === "week"
                                  ? `Week ${moment(period.date).week()}, ${moment(
                                    period.date
                                  ).year()}`
                                  : moment(period.date).format("MMMM YYYY")}
                            </td>
                            <td>₹{period.totalSalesAmount.toFixed(2)}</td>
                            <td>{period.itemsSold}</td>
                            <td>{period.orders}</td>
                            {/* <td>
                              {period.products
                                .slice(0, 2) // Show only 2 products
                                .map((product, pIndex) => (
                                  <span
                                    key={pIndex}
                                    className="badge bg-primary me-1"
                                  >
                                    {product.productName}: {product.qtySold}
                                  </span>
                                ))}
                              {period.products.length > 2 && (
                                <span className="badge bg-secondary">
                                  +{period.products.length - 2} more
                                </span>
                              )}
                            </td> */}
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleViewDetails(period)}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Performance */}
        <div className="row mt-4">
          <div className="col-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <h5 className="card-title mb-0">Top Performing Products</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity Sold</th>
                        <th>Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData &&
                        (() => {
                          // Aggregate product sales across all days
                          const productMap = {};
                          salesData.reportData.forEach((day) => {
                            day.products.forEach((product) => {
                              if (!productMap[product.productId]) {
                                productMap[product.productId] = {
                                  name: product.productName,
                                  qty: 0,
                                  revenue: 0,
                                };
                              }
                              productMap[product.productId].qty +=
                                product.qtySold;
                              productMap[product.productId].revenue +=
                                product.totalSalesAmount;
                            });
                          });

                          // Convert to array and sort by revenue
                          const topProducts = Object.values(productMap)
                            .sort((a, b) => b.revenue - a.revenue)
                            .slice(0, 10);

                          return topProducts.map((product, index) => (
                            <tr key={index}>
                              <td>{product.name}</td>
                              <td>{product.qty}</td>
                              <td>₹{product.revenue.toFixed(2)}</td>
                            </tr>
                          ));
                        })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="copyright-footer d-flex align-items-center justify-content-between border-top bg-white gap-3 flex-wrap">
        <p className="fs-13 text-gray-9 mb-0">
          2025 © Belinnov Solutions. All Right Reserved
        </p>
      </div>

      <style>
        {`
          .scrollbar-hidden::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hidden {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
    </div>
  );
};

export default NewDashboard;
