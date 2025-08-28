import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import { all_routes } from "../../Router/all_routes";
// import { DatePicker } from "antd";
import Addunits from "../../core/modals/inventory/addunits";
import AddCategory from "../../core/modals/inventory/addcategory";
import AddSubcategory from "../../core/modals/inventory/addsubcategory";
import AddBrand from "../../core/modals/addbrand";
import {
  ArrowLeft,
  // Calendar,
  // Image,
  Info,
  LifeBuoy,
  // List,
  Plus,
  PlusCircle,
  // X,
} from "feather-icons-react/build/IconComponents";
// import ImageWithBasePath from "../../core/img/imagewithbasebath";
import CounterThree from "../../core/common/counter/counterThree";
// import RefreshIcon from "../../core/common/tooltip-content/refresh"; 
// import CollapesIcon from "../../core/common/tooltip-content/collapes";
import AddVariant from "../../core/modals/inventory/addvariant";
import AddVarientNew from "../../core/modals/inventory/addVarientNew";
import CommonTagsInput from "../../core/common/Taginput";
// import TextEditor from "./texteditor";
import axios from "axios";
// import moment from 'moment';
import { useSelector } from "react-redux";

const AddProduct = () => {
  const storeId = useSelector((state) => state.user.storeId);
  const route = all_routes;
  const [tags, setTags] = useState(["Red", "Black"]);
  const [product, setProduct] = useState(false);
  const [product2, setProduct2] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [refreshCategories, setRefreshCategories] = useState(false);
  // const storeId = "67aa7f75-0ed9-4378-9b3d-50e1e34903ce";
  // const [storeOptions, setStoreOptions] = useState([]);
  // const [selectedStore, setSelectedStore] = useState(null);
  // const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // new State for reference data
  const [referenceData, setReferenceData] = useState({
    categories: [],
    subcategories: [],
    brands: [],
    units: [],
    isLoading: true,
    error: null
  });

  // State for form fields
  const [formData, setFormData] = useState({
    storeId: storeId,
    productName: "",
    slug: "",
    sku: "",
    sellingType: "",
    categoryId: null,
    subcategoryId: null,
    // brandId: null,
    unit: "",
    barcode: "",
    description: "",
    isVariable: false,
    price: "",
    taxType: "",
    discountType: "",
    discountValue: "",
    stock: "",
    quantityAlert: "",
    // warrantyType: "",
    // manufacturer: "",
    // manufacturedDate: "",
    // expiryDate: ""
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  // image upload handler
  // const handleImageUpload = (e) => {
  //   const files = Array.from(e.target.files);

  //   const newImages = files.map((file, index) => ({
  //     file,
  //     preview: URL.createObjectURL(file),
  //     imageId: images.length + index,
  //     main: images.length === 0 && index === 0 // First image is main
  //   }));

  //   setImages([...images, ...newImages]);
  // };
  // image removal handler
  // const handleRemoveImage = (index) => {
  //   const newImages = [...images];
  //   const wasMain = newImages[index].main;
  //   newImages.splice(index, 1);

  //   // If we removed the main image and there are remaining images,
  //   // set the first remaining image as main
  //   if (wasMain && newImages.length > 0) {
  //     newImages[0].main = true;
  //   }

  //   setImages(newImages);
  // };
  // updated handleSelectChange
  const handleSelectChange = async (selectedOption, fieldName) => {
    const newFormData = {
      ...formData,
      [fieldName]: selectedOption ? selectedOption.value : null
    };

    if (fieldName === "categoryId") {
      // Reset subcategory when category changes
      newFormData.subcategoryId = null;

      if (selectedOption) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BASEURL}api/v1/Product/GetSubcategories`,
            {
              params: {
                storeId: storeId,
                categoryId: selectedOption.value
              }
            }
          );
          // Filter subcategories by the selected categoryId
          const filteredSubcategories = response.data.data.filter(
            sc => sc.categoryId === selectedOption.value
          );
          setReferenceData(prev => ({
            ...prev,
            subcategories: filteredSubcategories.map(sc => ({
              value: sc.subCategoryId,
              label: sc.subCategoryName
            })),
            error: null
          }));
        } catch (error) {
          setReferenceData(prev => ({
            ...prev,
            subcategories: [],
            error: error.message || "Failed to load subcategories"
          }));
        }
      } else {
        setReferenceData(prev => ({
          ...prev,
          subcategories: []
        }));
      }
    }

    setFormData(newFormData);
  };

  // Handle date changes
  // const handleDateChange = (date, dateString, fieldName) => {
  //   setFormData({
  //     ...formData,
  //     [fieldName]: date ? dateString : " "
  //   });
  // };
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    //   const imageList = images.map((img, index) => ({
    //   ImageName:"",  
    //   imageId: index,
    //   main: img.main
    // }));

    const submissionData = {
      ...formData,
      stock: parseInt(formData.stock) || 0,
      //  imageList,
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASEURL}api/v1/Product/SaveProduct`,
        submissionData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setMessage({
        text: response.data.message,
        type: "success"
      });

      // Reset form after successful submission
      setFormData({
        storeId: storeId,
        productName: "",
        slug: "",
        sku: "",
        sellingType: "",
        categoryId: null,
        subcategoryId: null,
        brandId: null,
        unit: "",
        barcode: "",
        description: "",
        isVariable: false,
        price: "",
        taxType: "",
        discountType: "",
        discountValue: "",
        stock: "",
        quantityAlert: "",
        warrantyType: "",
        manufacturer: "",
        manufacturedDate: "",
        // expiryDate: ""
      });
    //  setSelectedStore(null);
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Failed to add product",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch reference data

  const fetchReferenceData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}api/v1/Product/GetReferenceData`,
        {
          params: { storeId: formData.storeId }
        }
      );

      setReferenceData({
        categories: response.data.data.categories.map(c => ({
          value: c.categoryId,
          label: c.categoryName
        })),
        subcategories: [], // Initialize as empty
        brands: response.data.data.brands.map(b => ({
          value: b.brandId,
          label: b.brandName
        })),
        units: response.data.data.units.map(u => ({
          value: u.unitName,
          label: u.unitName
        })),
        isLoading: false,
        error: null
      });
    } catch (error) {
      setReferenceData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to load reference data"
      }));
      setMessage({
        text: "Failed to load product reference data",
        type: "error"
      });
    }
  };
  // fetch store from api
  const hasFetchedStores = useRef(false);
  // fetch store data from api 
  // const fetchStores = async () => {
  //   try {
  //     const response = await axios.get(`${process.env.REACT_APP_BASEURL}api/v1/Admin/GetStore`);
  //     const stores = response.data || [];

  //     const mappedOptions = stores.map(store => ({
  //       value: store.id,
  //       label: store.name,
  //     }));
  //     setStoreOptions(mappedOptions);
  //   } catch (error) {
  //     console.error("Failed to fetch store options:", error);
  //   }
  // };
  useEffect(() => {
    fetchReferenceData();
    if (!hasFetchedStores.current) {
      // fetchStores();
      hasFetchedStores.current = true;
    }
  }, [formData.storeId, refreshCategories]);

  // cleanup for object URLs
  //   useEffect(() => {
  //   return () => {
  //     // Clean up object URLs to avoid memory leaks
  //     images.forEach(image => URL.revokeObjectURL(image.preview));
  //   };
  // }, [images]);

  // const store = [
  //   { value: "choose", label: "Choose" },
  //   { value: "thomas", label: "Thomas" },
  //   { value: "rasmussen", label: "Rasmussen" },
  //   { value: "fredJohn", label: "Fred John" },
  // ];
  // const warehouse = [
  //   { value: "choose", label: "Choose" },
  //   { value: "legendary", label: "Legendary" },
  //   { value: "determined", label: "Determined" },
  //   { value: "sincere", label: "Sincere" },
  // ];
  // const category = [
  //   { value: "choose", label: "Choose" },
  //   { value: "lenovo", label: "Lenovo" },
  //   { value: "electronics", label: "Electronics" },
  // ];
  // const subcategory = [
  //   { value: "choose", label: "Choose" },
  //   { value: "lenovo", label: "Lenovo" },
  //   { value: "electronics", label: "Electronics" },
  // ];

  // const brand = [
  //   { value: "choose", label: "Choose" },
  //   { value: "nike", label: "Nike" },
  //   { value: "bolt", label: "Bolt" },
  // ];
  // const unit = [
  //   { value: "choose", label: "Choose" },
  //   { value: "kg", label: "Kg" },
  //   { value: "pc", label: "Pc" },
  // ];
  // const sellingtype = [
  //   { value: "choose", label: "Choose" },
  //   { value: "transactionalSelling", label: "Transactional selling" },
  //   { value: "solutionSelling", label: "Solution selling" },
  // ];
  // const barcodesymbol = [
  //   { value: "choose", label: "Choose" },
  //   { value: "code34", label: "Code34" },
  //   { value: "code35", label: "Code35" },
  //   { value: "code36", label: "Code36" },
  // ];
  const taxtype = [
    { value: "GST", label: "GST" },
    // { value: "salesTax", label: "Sales Tax" },
  ];
  const discounttype = [
    { value: "choose", label: "Choose" },
    { value: "percentage", label: "Percentage" },
    { value: "Amount", label: "Amount" },
  ];

  // const warrenty = [
  //   { value: "choose", label: "Choose" },
  //   { value: "Replacement Warranty", label: "Replacement Warranty" },
  //   { value: "On-Site Warranty", label: "On-Site Warranty" },
  //   { value: "Accidental Protection Plan", label: "Accidental Protection Plan" },
  // ];
  // const [isImageVisible, setIsImageVisible] = useState(true);

  // const handleRemoveProduct = () => {
  //   setIsImageVisible(false);
  // };
  // const [isImageVisible1, setIsImageVisible1] = useState(true);

  // const handleRemoveProduct1 = () => {
  //   setIsImageVisible1(false);
  // };
  return (
    <>

      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Create Product</h4>
                <h6>Create new product</h6>
              </div>
            </div>
            <ul className="table-top-head">
              {/* <RefreshIcon /> */}
              {/* <CollapesIcon /> */}
              <li>
                <div className="page-btn">
                  <Link to={route.productlist} className="btn btn-secondary">
                    <ArrowLeft className="me-2" />
                    Back to Product
                  </Link>
                </div>
              </li>
            </ul>
          </div>

          {/* Message display */}
          {message.text && (
            <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`}>
              {message.text}
            </div>
          )}

          {/* /add */}
          <form className="add-product-form" onSubmit={handleSubmit}>
            <div className="add-product">

              <div className="accordions-items-seperate" id="accordionSpacingExample">
                <div className="accordion-item border mb-4">
                  <h2 className="accordion-header" id="headingSpacingOne">
                    <div
                      className="accordion-button collapsed bg-white"
                      data-bs-toggle="collapse"
                      data-bs-target="#SpacingOne"
                      aria-expanded="true"
                      aria-controls="SpacingOne"
                    >
                      <div className="d-flex align-items-center justify-content-between flex-fill">
                        <h5 className="d-flex align-items-center">
                          <Info className="text-primary me-2" />
                          <span>Product Information</span>
                        </h5>
                      </div>
                    </div>
                  </h2>
                  <div
                    id="SpacingOne"
                    className="accordion-collapse collapse show"
                    aria-labelledby="headingSpacingOne"
                  >
                    <div className="accordion-body border-top">
                      {/* <div className="row">
                        <div className="col-sm-6 col-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Store<span className="text-danger ms-1">*</span>
                            </label>
                            <Select
                              classNamePrefix="react-select"
                              name="store"
                              options={storeOptions}
                              placeholder="Choose Store"
                              value={selectedStore}
                              onChange={(selectedOption) => setSelectedStore(selectedOption)}
                            />
                          </div>
                        </div>
                        <div className="col-sm-6 col-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Warehouse<span className="text-danger ms-1">*</span>
                            </label>
                            <Select
                              classNamePrefix="react-select"
                              options={warehouse}
                              placeholder="Choose"
                            />
                          </div>
                        </div>
                      </div> */}
                      <div className="row">
                        <div className="col-sm-6 col-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Product Name<span className="text-danger ms-1">*</span>
                            </label>
                            <input type="text" className="form-control"
                              name="productName"
                              value={formData.productName}
                              onChange={handleInputChange} />
                          </div>
                        </div>
                        <div className="col-sm-6 col-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Slug<span className="text-danger ms-1">*</span>
                            </label>
                            <input type="text" className="form-control"
                              name="slug"
                              value={formData.slug}
                              onChange={handleInputChange} />
                          </div>
                        </div>
                      </div>
                     {/* <div className="row">
                        <div className="col-sm-6 col-12">
                          <div className="mb-3 list position-relative">
                            <label className="form-label">
                              SKU<span className="text-danger ms-1">*</span>
                            </label>
                            <input type="text" className="form-control list"
                              name="sku"
                              value={formData.sku}
                              onChange={handleInputChange}
                              required
                            />
                            <button type="button" className="btn btn-primaryadd">
                              Generate
                            </button>
                          </div>
                        </div>
                        </div> */}
                         {/* <div className="col-sm-6 col-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Selling Type<span className="text-danger ms-1">*</span>
                            </label>
                            <Select
                              classNamePrefix="react-select"
                              options={sellingtype}
                              placeholder="Choose"
                              onChange={(selectedOption) => handleSelectChange(selectedOption, "sellingType")}
                            />
                          </div>
                        </div>
                      </div> */}
                      <div className="addservice-info">
                        <div className="row">
                          <div className="col-sm-6 col-12">
                            <div className="mb-3">
                              <div className="add-newplus">
                                <label className="form-label">
                                  Category<span className="text-danger ms-1">*</span>
                                </label>
                                <Link
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#add-units-category"
                                >
                                  <PlusCircle
                                    data-feather="plus-circle"
                                    className="plus-down-add"
                                  />
                                  <span>Add New</span>
                                </Link>
                              </div>
                              <Select
                                classNamePrefix="react-select"
                                options={referenceData.categories}
                                placeholder={referenceData.isLoading ? "Loading..." : "Choose"}
                                isLoading={referenceData.isLoading}
                                // isDisabled={referenceData.isLoading || referenceData.error}
                                value={referenceData.categories.find(option => option.value === formData.categoryId)}
                                onChange={(selectedOption) => handleSelectChange(selectedOption, "categoryId")}
                              />
                              {referenceData.error && (
                                <div className="text-danger small mt-1">{referenceData.error}</div>
                              )}
                            </div>
                          </div>
                          <div className="col-sm-6 col-12">
                            <div className="mb-3">
                              <div className="add-newplus">
                                <label className="form-label">
                                  Sub Category<span className="text-danger ms-1">*</span>
                                </label>
                                <Link
                                  to="#"
                                  data-bs-toggle="modal"
                                  data-bs-target="#add-units-subcategory"
                                >
                                  <PlusCircle
                                    data-feather="plus-circle"
                                    className="plus-down-add"
                                  />
                                  <span>Add New</span>
                                </Link>
                              </div>
                              <Select
                                classNamePrefix="react-select"
                                options={referenceData.subcategories}
                                placeholder={
                                  formData.categoryId
                                    ? referenceData.subcategories.length === 0
                                      ? "No subcategories available"
                                      : "Choose"
                                    : "Select a category first"
                                }
                                // isDisabled={!formData.categoryId || referenceData.isLoading || referenceData.error}
                                value={referenceData.subcategories.find(option => option.value === formData.subcategoryId)}
                                onChange={(selectedOption) => handleSelectChange(selectedOption, "subcategoryId")}
                              />

                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="add-product-new">
                        <div className="row">
                          {/* <div className="col-sm-6 col-12">
                            <div className="mb-3">
                              <div className="add-newplus">
                                <label className="form-label">
                                  Brand<span className="text-danger ms-1">*</span>
                                </label>
                              </div>
                              <Select
                                classNamePrefix="react-select"
                                options={referenceData.brands}
                                placeholder={referenceData.isLoading ? "Loading..." : "Choose"}
                                isLoading={referenceData.isLoading}
                                // isDisabled={referenceData.isLoading || referenceData.error}
                                value={referenceData.brands.find(option => option.value === formData.brandId)}
                                onChange={(selectedOption) => handleSelectChange(selectedOption, "brandId")}
                              />
                            </div>
                          </div> */}
                          <div className="col-sm-6 col-12">
                          <div className="mb-3 list position-relative">
                            <label className="form-label">
                              SKU<span className="text-danger ms-1">*</span>
                            </label>
                            <input type="text" className="form-control list"
                              name="sku"
                              value={formData.sku}
                              onChange={handleInputChange}
                              required
                            />
                            {/* <button type="button" className="btn btn-primaryadd">
                              Generate
                            </button> */}
                          </div>
                        </div>
                          <div className="col-sm-6 col-12">
                            <div className="mb-3">
                              <div className="add-newplus">
                                <label className="form-label">
                                  Unit<span className="text-danger ms-1">*</span>
                                </label>
                              </div>
                              <Select
                                classNamePrefix="react-select"
                                options={referenceData.units}
                                placeholder={referenceData.isLoading ? "Loading..." : "Choose"}
                                isLoading={referenceData.isLoading}
                                // isDisabled={referenceData.isLoading || referenceData.error}
                                value={referenceData.units.find(option => option.value === formData.unit)}
                                onChange={(selectedOption) => handleSelectChange(selectedOption, "unit")}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* <div className="row">
                        <div className="col-lg-6 col-sm-6 col-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Barcode Symbology<span className="text-danger ms-1">*</span>
                            </label>
                            <Select
                              classNamePrefix="react-select"
                              options={barcodesymbol}
                              placeholder="Choose"
                              onChange={(selectedOption) => handleSelectChange(selectedOption, "barcode")}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-sm-6 col-12">
                          <div className="mb-3 list position-relative">
                            <label className="form-label">
                              Item Code<span className="text-danger ms-1">*</span>
                            </label>
                            <input type="text" className="form-control list"
                              value={formData.barcode}
                              onChange={handleInputChange} />
                            <button type="submit" className="btn btn-primaryadd">
                              Generate
                            </button>
                          </div>
                        </div>
                      </div> */}
                      {/* Editor */}
                      <div className="col-lg-12">
                        <div className="summer-description-box">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter product description"
                          />
                          <p className="fs-14 mt-1">Maximum 60 Words</p>
                        </div>
                      </div>
                      {/* /Editor */}

                    </div>
                  </div>
                </div>
                {/* Pricing & Stocks Section */}
                <div className="accordion-item border mb-4">
                  <h2 className="accordion-header" id="headingSpacingTwo">
                    <div
                      className="accordion-button collapsed bg-white"
                      data-bs-toggle="collapse"
                      data-bs-target="#SpacingTwo"
                      aria-expanded="true"
                      aria-controls="SpacingTwo"
                    >
                      <div className="d-flex align-items-center justify-content-between flex-fill">
                        <h5 className="d-flex align-items-center">
                          <LifeBuoy data-feather="life-buoy" className="text-primary me-2" />
                          <span>Pricing &amp; Stocks</span>
                        </h5>
                      </div>
                    </div>
                  </h2>
                  <div
                    id="SpacingTwo"
                    className="accordion-collapse collapse show"
                    aria-labelledby="headingSpacingTwo"
                  >
                    <div className="accordion-body border-top">
                      <div className="mb-3s">
                        <label className="form-label">
                          Product Type<span className="text-danger ms-1">*</span>
                        </label>
                        <div className="single-pill-product mb-3">
                          <ul className="nav nav-pills" id="pills-tab1" role="tablist">
                            <li className="nav-item" role="presentation">
                              <span
                                className="custom_radio me-4 mb-0 active"
                                id="pills-home-tab"
                                data-bs-toggle="pill"
                                data-bs-target="#pills-home"
                                role="tab"
                                aria-controls="pills-home"
                                aria-selected="true"
                              >
                                <input
                                  type="radio"
                                  className="form-control"
                                  name="isVariable"
                                  checked={!formData.isVariable}
                                  onChange={() => setFormData({ ...formData, isVariable: false })}
                                />
                                <span className="checkmark" /> Single Product
                              </span>
                            </li>
                            {/* <li className="nav-item" role="presentation">
                              <span
                                className="custom_radio me-2 mb-0"
                                id="pills-profile-tab"
                                data-bs-toggle="pill"
                                data-bs-target="#pills-profile"
                                role="tab"
                                aria-controls="pills-profile"
                                aria-selected="false"
                              >
                                <input
                                  type="radio"
                                  className="form-control"
                                  name="isVariable"
                                  checked={formData.isVariable}
                                  onChange={() => setFormData({ ...formData, isVariable: true })}
                                />
                                <span className="checkmark" /> Variable Product
                              </span>
                            </li> */}
                          </ul>
                        </div>
                      </div>
                      <div className="tab-content" id="pills-tabContent">
                        <div
                          className="tab-pane fade show active"
                          id="pills-home"
                          role="tabpanel"
                          aria-labelledby="pills-home-tab"
                        >
                          <div className="single-product">
                            <div className="row">
                              <div className="col-lg-4 col-sm-6 col-12">
                                <div className="mb-3">
                                  <label className="form-label">
                                    Stock<span className="text-danger ms-1">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="stock"  // Same name for both inputs
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                  />
                                </div>
                              </div>
                              <div className="col-lg-4 col-sm-6 col-12">
                                <div className="mb-3">
                                  <label className="form-label">
                                    Price<span className="text-danger ms-1">*</span>
                                  </label>
                                  <input type="text" className="form-control"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                  />
                                </div>
                              </div>
                              <div className="col-lg-4 col-sm-6 col-12">
                                <div className="mb-3">
                                  <label className="form-label">
                                    Tax Type<span className="text-danger ms-1">*</span>
                                  </label>
                                  <Select
                                    classNamePrefix="react-select"
                                    options={taxtype}
                                    placeholder="Select Option"
                                    onChange={(selectedOption) => handleSelectChange(selectedOption, "taxType")}
                                  />
                                </div>
                              </div>
                              <div className="col-lg-4 col-sm-6 col-12">
                                <div className="mb-3" >
                                  <label className="form-label">
                                    Discount Type
                                    <span className="text-danger ms-1">*</span>
                                  </label>
                                  <Select
                                    classNamePrefix="react-select"
                                    options={discounttype}
                                    placeholder="Choose"
                                    menuPortalTarget={document.body}
                                    styles={{
                                      menuPortal: base => ({ ...base, zIndex: 9999 }),
                                      // control: (base) => ({
                                      //   ...base,
                                      //   '&:hover': {
                                      //     borderColor: '#7638ff' 
                                      //   }
                                      // })

                                    }}
                                    onChange={(selectedOption) => handleSelectChange(selectedOption, "discountType")}

                                  />
                                </div>
                              </div>
                              <div className="col-lg-4 col-sm-6 col-12">
                                <div className="mb-3">
                                  <label className="form-label">
                                    Discount Value
                                    <span className="text-danger ms-1">*</span>
                                  </label>
                                  <input className="form-control" type="text"
                                    name="discountValue"
                                    value={formData.discountValue}
                                    onChange={handleInputChange} />
                                </div>
                              </div>
                              <div className="col-lg-4 col-sm-6 col-12">
                                <div className="mb-3">
                                  <label className="form-label">
                                    Stock Alert
                                    <span className="text-danger ms-1">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="quantityAlert"
                                    value={formData.quantityAlert}
                                    onChange={handleInputChange}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className="tab-pane fade"
                          id="pills-profile"
                          role="tabpanel"
                          aria-labelledby="pills-profile-tab"
                        >
                          <div className="row select-color-add">
                            <div className="col-lg-6 col-sm-6 col-12">
                              <div className="mb-3">
                                <label className="form-label">
                                  Variant Attribute{" "}
                                  <span className="text-danger ms-1">*</span>
                                </label>
                                <div className="row">
                                  <div className="col-lg-10 col-sm-10 col-10">
                                    <select
                                      className="form-control variant-select select-option"
                                      id="colorSelect"
                                      onChange={() => setProduct(true)}
                                    >
                                      <option>Choose</option>
                                      <option>Color</option>
                                      <option value="red">Red</option>
                                      <option value="black">Black</option>
                                    </select>
                                  </div>
                                  <div className="col-lg-2 col-sm-2 col-2 ps-0">
                                    <div className="add-icon tab">
                                      <Link
                                        className="btn btn-filter"
                                        data-bs-toggle="modal"
                                        data-bs-target="#add-units"
                                      >
                                        <i className="feather feather-plus-circle" />
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {product &&
                                <div className={`selected-hide-color ${product2 ? 'd-block' : ''} `} id="input-show">
                                  <label className="form-label">
                                    Variant Attribute{" "}
                                    <span className="text-danger ms-1">*</span>
                                  </label>
                                  <div className="row align-items-center">
                                    <div className="col-lg-10 col-sm-10 col-10">
                                      <div className="mb-3">

                                        <CommonTagsInput
                                          value={tags}
                                          onChange={setTags}
                                          placeholder="Add new"
                                          className="input-tags form-control" // Optional custom class
                                        />
                                      </div>
                                    </div>
                                    <div className="col-lg-2 col-sm-2 col-2 ps-0">
                                      <div className="mb-3 ">
                                        <Link
                                          to="#"
                                          className="remove-color"
                                          onClick={() => setProduct2(false)}
                                        >
                                          <i className="far fa-trash-alt" />
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </div>}

                            </div>
                          </div>
                          {product &&
                            <div
                              className="modal-body-table variant-table d-block"
                              id="variant-table"

                            >
                              <div className="table-responsive">
                                <table className="table">
                                  <thead>
                                    <tr>
                                      <th>Variantion</th>
                                      <th>Variant Value</th>
                                      <th>SKU</th>
                                      <th>Quantity</th>
                                      <th>Price</th>
                                      <th className="no-sort" />
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td>
                                        <div className="add-product">
                                          <input
                                            type="text"
                                            className="form-control"
                                            defaultValue="color"
                                          />
                                        </div>
                                      </td>
                                      <td>
                                        <div className="add-product">
                                          <input
                                            type="text"
                                            className="form-control"
                                            defaultValue="red"
                                          />
                                        </div>
                                      </td>
                                      <td>
                                        <div className="add-product">
                                          <input
                                            type="text"
                                            className="form-control"
                                            defaultValue={1234}
                                          />
                                        </div>
                                      </td>
                                      <td>
                                        <CounterThree defaultValue={2} />
                                      </td>
                                      <td>
                                        <div className="add-product">
                                          <input
                                            type="text"
                                            className="form-control"
                                            defaultValue={50000}
                                          />
                                        </div>
                                      </td>
                                      <td className="action-table-data">
                                        <div className="edit-delete-action">
                                          <div className="input-block add-lists">
                                            <label className="checkboxs">
                                              <input type="checkbox" defaultChecked="" />
                                              <span className="checkmarks" />
                                            </label>
                                          </div>
                                          <Link
                                            className="me-2 p-2"
                                            to="#"
                                            data-bs-toggle="modal"
                                            data-bs-target="#add-variation"
                                          >
                                            <Plus
                                              data-feather="plus"
                                              className="feather-edit"
                                            />
                                          </Link>
                                          <Link
                                            data-bs-toggle="modal"
                                            data-bs-target="#delete-modal"
                                            className="p-2"
                                            to="#"
                                          >
                                            <i
                                              data-feather="trash-2"
                                              className="feather-trash-2"
                                            />
                                          </Link>
                                        </div>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>
                                        <div className="add-product">
                                          <input
                                            type="text"
                                            className="form-control"
                                            defaultValue="color"
                                          />
                                        </div>
                                      </td>
                                      <td>
                                        <div className="add-product">
                                          <input
                                            type="text"
                                            className="form-control"
                                            defaultValue="black"
                                          />
                                        </div>
                                      </td>
                                      <td>
                                        <div className="add-product">
                                          <input
                                            type="text"
                                            className="form-control"
                                            defaultValue={2345}
                                          />
                                        </div>
                                      </td>
                                      <td>
                                        <CounterThree defaultValue={2} />
                                      </td>
                                      <td>
                                        <div className="add-product">
                                          <input
                                            type="text"
                                            className="form-control"
                                            defaultValue={50000}
                                          />
                                        </div>
                                      </td>
                                      <td className="action-table-data">
                                        <div className="edit-delete-action">
                                          <div className="input-block add-lists">
                                            <label className="checkboxs">
                                              <input type="checkbox" defaultChecked="" />
                                              <span className="checkmarks" />
                                            </label>
                                          </div>
                                          <Link
                                            className="me-2 p-2"
                                            to="#"
                                            data-bs-toggle="modal"
                                            data-bs-target="#edit-units"
                                          >
                                            <Plus
                                              data-feather="plus"
                                              className="feather-edit"
                                            />
                                          </Link>
                                          <Link
                                            data-bs-toggle="modal"
                                            data-bs-target="#delete-modal"
                                            className="p-2"
                                            to="#"
                                          >
                                            <i
                                              data-feather="trash-2"
                                              className="feather-trash-2"
                                            />
                                          </Link>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          }

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Images Section */}
                {/* <div className="accordion-item border mb-4">
                  <h2 className="accordion-header" id="headingSpacingThree">
                    <div
                      className="accordion-button collapsed bg-white"
                      data-bs-toggle="collapse"
                      data-bs-target="#SpacingThree"
                      aria-expanded="true"
                      aria-controls="SpacingThree"
                    >
                      <div className="d-flex align-items-center justify-content-between flex-fill">
                        <h5 className="d-flex align-items-center">
                          <Image data-feather="image" className="text-primary me-2" />
                          <span>Images</span>
                        </h5>
                      </div>
                    </div>
                  </h2>
                  <div
                    id="SpacingThree"
                    className="accordion-collapse collapse show"
                    aria-labelledby="headingSpacingThree"
                  >
                    <div className="accordion-body border-top">
                      <div className="text-editor add-list add">
                        <div className="col-lg-12">
                          <div className="add-choosen">
                            <div className="mb-3">
                              <div className="image-upload">                            
                               <input 
                  type="file" 
                  multiple 
                  onChange={handleImageUpload}
                  accept="image/*"
                />
                                <div className="image-uploads">
                                  <PlusCircle
                                    data-feather="plus-circle"
                                    className="plus-down-add me-0"
                                  />
                                  <h4>Add Images</h4>
                                </div>
                              </div>
                            </div>                          */}
                {/* {isImageVisible1 && (
                              <div className="phone-img">
                                <ImageWithBasePath
                                  src="assets/img/products/phone-add-2.png"
                                  alt="image"
                                />
                                <Link to="#">
                                  <X
                                    className="x-square-add remove-product"
                                    onClick={handleRemoveProduct1}
                                  />
                                </Link>
                              </div>
                            )}
                            {isImageVisible && (
                              <div className="phone-img">
                                <ImageWithBasePath
                                  src="assets/img/products/phone-add-1.png"
                                  alt="image"
                                />
                                <Link to="#">
                                  <X
                                    className="x-square-add remove-product"
                                    onClick={handleRemoveProduct}
                                  />
                                </Link>
                              </div>
                            )} */}
                {/* {images.map((image, index) => (
              <div className="phone-img" key={index}>
                <img
                  src={image.preview}
                  alt={`Product preview ${index}`}
                  style={{ 
                    width: '100px', 
                    height: '100px',
                    objectFit: 'cover',
                    border: image.main ? '2px solid #7638ff' : 'none'
                  }}
                />
                <Link to="#" onClick={() => handleRemoveImage(index)}>
                  <X className="x-square-add remove-product" />
                </Link>
              </div>
            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div> */}
                {/* Custom fields section */}
                {/* <div className="accordion-item border mb-4">
                  <h2 className="accordion-header" id="headingSpacingFour">
                    <div
                      className="accordion-button collapsed bg-white"
                      data-bs-toggle="collapse"
                      data-bs-target="#SpacingFour"
                      aria-expanded="true"
                      aria-controls="SpacingFour"
                    >
                      <div className="d-flex align-items-center justify-content-between flex-fill">
                        <h5 className="d-flex align-items-center">
                          <List data-feather="list" className="text-primary me-2" />
                          <span>Custom Fields</span>
                        </h5>
                      </div>
                    </div>
                  </h2>
                  <div
                    id="SpacingFour"
                    className="accordion-collapse collapse show"
                    aria-labelledby="headingSpacingFour"
                  >
                    <div className="accordion-body border-top">
                      <div> */}
                        {/* <div className="p-3 bg-light rounded d-flex align-items-center border mb-3">
                          <div className=" d-flex align-items-center">
                            <div className="form-check form-check-inline">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="warranties"
                                defaultValue="option1"
                                checked={!!formData.warrantyType}
                                onChange={(e) => {
                                  if (!e.target.checked) {
                                    setFormData({ ...formData, warrantyType: "" });
                                  }
                                }}
                              />
                              <label className="form-check-label" htmlFor="warranties">
                                Warranties
                              </label>
                            </div>
                            <div className="form-check form-check-inline">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="manufacturer"
                                defaultValue="option2"
                                checked={!!formData.manufacturer}
                                onChange={(e) => {
                                  if (!e.target.checked) {
                                    setFormData({ ...formData, manufacturer: "" });
                                  }
                                }}
                              />
                              <label className="form-check-label" htmlFor="manufacturer">
                                Manufacturer
                              </label>
                            </div>
                            <div className="form-check form-check-inline">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="expiry"
                                defaultValue="option2"
                                checked={!!formData.expiryDate}
                                onChange={(date) => {
                                  if (!date.target.checked) {
                                    setFormData({ ...formData, expiryDate: "" });
                                  }
                                }}
                                value={formData.expiryDate ? moment(formData.expiryDate) : null}

                              />
                              <label className="form-check-label" htmlFor="expiry">
                                Expiry
                              </label>
                            </div>
                          </div>
                        </div> */}
                        {/* <div className="row">
                          <div className="col-sm-6 col-12">
                            <div className="mb-3">
                              <label className="form-label">
                                Warranty<span className="text-danger ms-1">*</span>
                              </label>
                              <Select
                                classNamePrefix="react-select"
                                options={warrenty}
                                placeholder="Choose"
                                onChange={(selectedOption) => handleSelectChange(selectedOption, "warrantyType")}
                                value={warrenty.find(option => option.value === formData.warrantyType)}
                              isDisabled={!formData.warrantyType}
                              />
                            </div>
                          </div>
                          <div className="col-sm-6 col-12">
                            <div className="mb-3 add-product">
                              <label className="form-label">
                                Manufacturer<span className="text-danger ms-1">*</span>
                              </label>
                              <input type="text" className="form-control"
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleInputChange} />
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-sm-6 col-12">
                            <div className="mb-3">
                              <label className="form-label">
                                Manufactured Date<span className="text-danger ms-1">*</span>
                              </label>
                              <div className="input-groupicon calender-input">
                                <Calendar className="info-img" />
                                <DatePicker
                                  className="form-control datetimepicker"
                                  placeholder="dd/mm/yyyy"
                                  onChange={(date, dateString) => handleDateChange(date, dateString, "manufacturedDate")}
                                  value={formData.manufacturedDate ? moment(formData.manufacturedDate) : null}
                                />

                              </div>
                            </div>
                          </div> */}
                          {/* <div className="col-sm-6 col-12">
                            <div className="mb-3">
                              <label className="form-label">
                                Expiry On<span className="text-danger ms-1">*</span>
                              </label>
                              <div className="input-groupicon calender-input">
                                <Calendar className="info-img" />
                                <DatePicker
                                  className="form-control datetimepicker"
                                  placeholder="dd/mm/yyyy"
                                  onChange={(date, dateString) => handleDateChange(date, dateString, "expiryDate")}
                                />

                              </div>
                            </div>
                          </div> */}
                        {/* </div>
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
            <div className="col-lg-12">
              <div className="d-flex align-items-center justify-content-end mb-4">
                <button type="button" className="btn btn-secondary me-2">
                  Cancel
                </button>
                <button type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}>
                  {isSubmitting ? 'Adding Product...' : 'Add Product'}
                </button>
              </div>
            </div>

          </form>
          {/* /add */}
        </div>
        <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
          <p className="mb-0 text-gray-9">
            2025 © Belinnov Solutions. All Right Reserved
          </p>
          {/*<p>
            Designed &amp; Developed By{" "}
            <Link to="#" className="text-primary">
              Dreams
            </Link>
          </p>*/}
        </div>

      </div>
      <Addunits />
      <AddCategory
        onCategoryAdded={() => {
          // This will trigger a refresh of categories
          setRefreshCategories(prev => !prev);
        }}
      />
      <AddVariant />
      <AddBrand />
      <AddVarientNew />
      <div className="modal fade" id="delete-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content p-5 px-3 text-center">
                <span className="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2"><i className="ti ti-trash fs-24 text-danger"></i></span>
                <h4 className="fs-20 fw-bold mb-2 mt-1">Delete Attribute</h4>
                <p className="mb-0 fs-16">Are you sure you want to delete Attribute?</p>
                <div className="modal-footer-btn mt-3 d-flex justify-content-center">
                  <button type="button" className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">Cancel</button>
                  <button type="button" className="btn btn-primary fs-13 fw-medium p-2 px-3">Yes Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddSubcategory
        onSubCategoryAdded={() => {
          // This will refresh the subcategories list when a new one is added
          if (formData.categoryId) {
            handleSelectChange(
              { value: formData.categoryId },
              "categoryId"
            );
          }
        }}
        selectedCategoryId={formData.categoryId}
      />
    </>
  );
};

export default AddProduct;
