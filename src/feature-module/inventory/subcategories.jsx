import React, { useState, useEffect } from "react";
// import ImageWithBasePath from "../../core/img/imagewithbasebath";
import { Link } from "react-router-dom";
// import { useSelector } from "react-redux";
import Table from "../../core/pagination/datatable";
import CommonFooter from "../../core/common/footer/commonFooter";
// import TooltipIcons from "../../core/common/tooltip-content/tooltipIcons";
// import RefreshIcon from "../../core/common/tooltip-content/refresh";
// import CollapesIcon from "../../core/common/tooltip-content/collapes";
// import { Category } from "../../core/common/selectOption/selectOption";
// import DefaultEditor from "react-simple-wysiwyg";
import Select from "react-select";
import CommonDeleteModal from "../../core/common/modal/commonDeleteModal";
import EditSubcategories from "./editsubcategories";
import axios from "axios";
import { useSelector } from "react-redux";


const SubCategories = () => {

  // const dataSource = useSelector((state) => state.rootReducer.subcategory_data);

const storeId = useSelector((state) => state.user.storeId);
  // For Add
  const [values, setValue] = useState(""); // initialize with empty string
  const [subCategoryName, setSubCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState(true);
  // For edit
  const [editId, setEditId] = useState(null);
  // state For storing the values
  const [dataSource, setDataSource] = useState([]);
  const [categories, setCategories] = useState([]); // State for storing categories
  const [searchText, setSearchText] = useState("");
  // const storeId = "67aa7f75-0ed9-4378-9b3d-50e1e34903ce";


  // for showing description as plain text if we're using defaultEditor
  // const stripHtml = (html) => {
  //   const tmp = document.createElement("DIV");
  //   tmp.innerHTML = html;
  //   return tmp.textContent || tmp.innerText || "";
  // };

// Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}api/v1/Product/GetReferenceData?storeId=${storeId}`
      );
      if (response.data && response.data.data && response.data.data.categories) {
        const categoryOptions = response.data.data.categories.map(category => ({
          value: category.categoryId,
          label: category.categoryName
        }));
        setCategories(categoryOptions);
      }
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };
  
  const fetchSubCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}api/v1/Product/GetSubcategories?storeId=${storeId}`
      );
      if (response.data && response.data.data) {
        const subcategories = response.data.data.map((item) => ({
          subCategoryId: item.subCategoryId,
          subCategoryName: item.subCategoryName,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          image: item.image,
          code: item.code || item.Code, 
          description: item.description,
          status: item.status || item.Status, 
        }));
        setDataSource(subcategories);
      } else {
        console.log("No data found in response.");
      }
    } catch (error) {
      console.error("Error fetching subcategories", error);
    }
  };


  // calling api on full page refresh
  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  const handleSubmit = async () => {
    if (!selectedCategory || !subCategoryName || !categoryCode || !values) {
      alert("Please fill all required fields");
      return;
    }
    // Payload for add subCategory
   const payload = {
      categoryId: selectedCategory.value,
      SubCategoryName: subCategoryName, //updated
      image: imageFile?.name || "",
      code: categoryCode,
      storeid: storeId,
      description: values,
      // description: stripHtml(values),
      status: status ? "Active" : "Inactive",
    };
    // Post request for add subCategory
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASEURL}api/v1/Product/savesubcategories`,
        payload
      );
      console.log("Add Response:", response.data);
      alert("Subcategory added successfully");
      await fetchSubCategories();

      // reset the form after submitting the form
      resetForm();

      //  Programmatically close modal after add
      window.document.getElementById("closeAddModal").click();

    } catch (error) {
      console.error("Error:", error);
      alert("Error adding subcategory");
    }
  };

  const handleEditClick = (record) => {
    setEditId(record.subCategoryId);
  };
  // Filter data based on search text
  const filteredData = dataSource.filter(item => {
    return (
      item.subCategoryName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchText.toLowerCase()))
    );
  });


  const columns = [
  //  {
  //     title: "Image",
  //     dataIndex: "image",
  //     key: "image",
  //     render: (image) => (
  //       <img 
  //         src={image ? `${process.env.REACT_APP_BASEURL}${image}` : '/assets/img/placeholder.jpg'} 
  //         alt="subcategory" 
  //         style={{ width: '50px', height: '50px', objectFit: 'cover' }}
  //       />
  //     ),
  //   },
    {
      title: "Sub Category",
      dataIndex: "subCategoryName",
      key: "subCategoryName",
      sorter:(a,b)=> a.subCategoryName.localeCompare(b.subCategoryName),
    },
    // {
    //   title: "Category Code",
    //   dataIndex: "code",
    //   key: "code",
    // },
    {
      title: "Category",
      dataIndex: "categoryName",
      key: "categoryName",
      sorter:(a,b)=> a.categoryName.localeCompare(b.categoryName),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   key: "status",
    //   render: (text) => (
    //     <span className={`badge ${text === "Active" ? "bg-success" : "bg-danger"} fw-medium fs-10`}>
    //       {text}
    //     </span>
    //   ),
    // },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <div className="action-table-data">
          <div className="edit-delete-action">
            <Link
              className="me-2 p-2"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#edit-category"
              onClick={() => handleEditClick(record)}
            >
              <i data-feather="edit" className="feather-edit"></i>
            </Link>
            <Link data-bs-toggle="modal" data-bs-target="#delete-modal" className="p-2" to="#">
              <i data-feather="trash-2" className="feather-trash-2"></i>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  // const onChange = (e) => {
  //   setValue(e.target.value);
  // };
  // reset form values after add subcategory
  const resetForm = () => {
    setSubCategoryName("");
    setCategoryCode("");
    setSelectedCategory(null);
    setValue("");
    setImageFile(null);
    setStatus(true);
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4 className="fw-bold">Sub Category</h4>
                <h6>Manage your sub categories</h6>
              </div>
            </div>
            <ul className="table-top-head">
              {/* <TooltipIcons />
              <RefreshIcon />
              <CollapesIcon /> */}
            </ul>
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#add-category"
                onClick={resetForm}
              >
                <i className="ti ti-circle-plus me-1"></i> Add Sub Category
              </Link>
            </div>
          </div>

          <div className="card table-list-card">
             <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
    <div className="search-set">
      <div className="search-input">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button className="btn btn-searchset">
          <i className="ti ti-search"></i>
        </button>
      </div>
    </div>
  </div>
            <div className="card-body">
              <div className="table-responsive sub-category-table">
                <Table columns={columns} dataSource={searchText ? filteredData : dataSource} />
              </div>
            </div>
          </div>
        </div>
        <CommonFooter />
      </div>

      {/* Add Modal */}
      <div className="modal fade" id="add-category">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="content">
              <div className="modal-header">
                <div className="page-title">
                  <h4>Add Sub Category</h4>
                </div>
                <button
                  type="button"
                  id="closeAddModal"
                  className="close bg-danger text-white"
                  data-bs-dismiss="modal"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Upload Image</label>
                    <input
                      type="file"
                      className="form-control" 
                      accept="image/*"   
                      onChange={(e) => setImageFile(e.target.files[0])}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category *</label>
                    <Select
                      classNamePrefix="react-select"
                      options={categories}
                      placeholder="select category"
                      value={selectedCategory}
                      onChange={(selected) => setSelectedCategory(selected)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Sub Category *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={subCategoryName}
                      onChange={(e) => setSubCategoryName(e.target.value)}
                      placeholder="Enter subcategory name"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={categoryCode}
                      onChange={(e) => setCategoryCode(e.target.value)}
                      placeholder="Enter category code"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description *</label>
                    {/* <DefaultEditor value={values} onChange={onChange} />  */}
                    <textarea
                      className="form-control"
                      rows="3"
                      value={values}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Enter description"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="status-toggle modal-status d-flex justify-content-between">
                      <span className="status-label">Status</span>
                      <input
                        type="checkbox"
                        id="user2"
                        className="check"
                        checked={status}
                        onChange={() => setStatus(!status)}
                      />
                      <label htmlFor="user2" className="checktoggle" />
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3"
                  data-bs-dismiss="modal"

                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary fs-13 fw-medium p-2 px-3"
                  onClick={handleSubmit}
                // data-bs-dismiss="modal"
                //  onRefresh={fetchSubCategories}
                >
                  Create Subcategory
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Edit Modal */}
      <EditSubcategories
        id={editId}
        onUpdate={fetchSubCategories}
        categories={categories}
      />

      {/* Delete Modal */}
      <CommonDeleteModal />
    </>
  );
};

export default SubCategories;
