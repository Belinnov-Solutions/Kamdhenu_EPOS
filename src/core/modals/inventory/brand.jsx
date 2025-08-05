import React,{useState} from 'react'
// import { Link } from 'react-router-dom'
import axios from 'axios';
import PropTypes from 'prop-types';
// import Select from 'react-select'
// import ImageWithBasePath from '../../img/imagewithbasebath';

const Brand = ({ onUploadSuccess }) => {
     const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
     const [isDownloading, setIsDownloading] = useState(false);
      
      // Sample Excel file data (mock)
    const sampleExcelData = [
      {
        "Name": "",
        "CategoryName": "",
        "SubcategoryName": "",
        "BrandName": "",
        "Sku": "",
        "Price": "",
        "QuantityAlert": "",
        "ManufacturedDate": "",
        "ExpiryDate": "",
        "Description": "",
        "Barcode": "",
        "Stock": "",
        "Unit": "",
        "StoreName": ""
      }
    ];
    
      const handleDownloadSample = () => {
        setIsDownloading(true);
        
        try {
          // Create CSV content
          const headers = Object.keys(sampleExcelData[0]).join(',');
          const rows = sampleExcelData.map(obj => 
            Object.values(obj).map(value => 
              typeof value === 'string' && value.includes(',') ? `"${value}"` : value
            ).join(',')
          );
          const csvContent = [headers, ...rows].join('\n');
          
          // Create blob and download
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'ProductUploadTemplate.csv');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (err) {
          console.error('Error downloading sample file:', err);
          setError('Failed to download sample file');
        } finally {
          setIsDownloading(false);
        }
      };
    
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedFile) {
            setError('Please select a file to upload');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            setIsUploading(true);
             await axios.post(
                `${process.env.REACT_APP_BASEURL}api/v1/Product/UploadProductExcel`,                
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    //  params: { storeId }
                }
            );

            // Reset form and close modal on success
            setSelectedFile(null);
            document.getElementById('uploadFile').value = '';
            document.querySelector('[data-bs-dismiss="modal"]').click();
            
            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (err) {
            console.error('Upload failed:', err);
            setError(err.response?.data?.message || 'Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };
    // const product = [
    //     { value: 'choose', label: 'Choose' },
    //     { value: 'boldV3.2', label: 'Bold V3.2' },
    //     { value: 'nikeJordan', label: 'Nike Jordan' },
    //     { value: 'iphone14Pro', label: 'Iphone 14 Pro' },
    //   ];
    //   const category = [
    //     { value: 'choose', label: 'Choose' },
    //     { value: 'laptop', label: 'Laptop' },
    //     { value: 'electronics', label: 'Electronics' },
    //     { value: 'shoe', label: 'Shoe' },
    //   ];
    //   const status = [
    //     { value: 'choose', label: 'Choose' },
    //     { value: 'lenovo', label: 'Lenovo' },
    //     { value: 'bolt', label: 'Bolt' },
    //     { value: 'nike', label: 'Nike' },
    //   ];

    return (
        <div>
            {/* Import Product */}
            <div className="modal fade" id="view-notes">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header border-0 custom-modal-header">
                                    <div className="page-title">
                                        <h4>Import Product</h4>
                                    </div>
                                    <button
                                        type="button"
                                        className="close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    >
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                <div className="modal-body custom-modal-body">
                                    <form onSubmit={handleSubmit}>
                                        {/* <div className="row"> */}
                                        {/* <div className="col-lg-4 col-sm-6 col-12">
                                                    <div className="input-blocks">
                                                        <label>Product</label>
                                                        <Select options={product} classNamePrefix="react-select" placeholder="Choose" />

                                                    </div>
                                                </div> */}
                                        {/* <div className="col-lg-4 col-sm-6 col-12">
                                                    <div className="input-blocks">
                                                        <label>Category</label>
                                                        <Select options={category} classNamePrefix="react-select" placeholder="Choose" />

                                                    </div>
                                                </div> */}
                                                {/* <div className="col-lg-4 col-sm-6 col-12">
                                                    <div className="input-blocks">
                                                        <label>Satus</label>
                                                        <Select options={status} classNamePrefix="react-select" placeholder="Choose" />

                                                    </div>
                                                </div> */}
                                        <div className="col-lg-12 col-sm-6 col-12">
                                            <div className="row">
                                                <div>
                                                    <div className="modal-footer-btn download-file">
                                                        {/* <Link
                                                            to="#"
                                                            className="btn btn-submit"
                                                        >
                                                            Download Sample File
                                                        </Link> */}
                                                         <button
                        type="button"
                        className="btn btn-secondary mb-3"
                        onClick={handleDownloadSample}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Downloading...
                          </>
                        ) : 'Download Sample File'}
                      </button>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* <div className="col-lg-12">
                                                    <div className="input-blocks image-upload-down">
                                                        <label> Upload CSV File</label>
                                                        <div className="image-upload download">
                                                            <input type="file" />
                                                            <input type="file" accept=".csv" className="form-control" />
                                                            <div className="image-uploads">
                                                                <ImageWithBasePath src="assets/img/download-img.png" alt="img" />
                                                                <h4>
                                                                    Drag and drop a <span>file to upload</span>
                                                                </h4>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div> */}
                                        <div className="col-lg-12">
                                            <div className="input-blocks">
                                                <label htmlFor="uploadFile" className="form-label">
                                                    Upload Product Excel <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    id="uploadFile"
                                                    name="file"
                                                    accept=".xlsx, .xls"
                                                   onChange={handleFileChange}
                                                    required 
                                                   
                                                />
                                                {error && (
                                                    <div className="text-danger mt-2">{error}</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* <div className="col-lg-12 col-sm-6 col-12">
                                                    <div className="mb-3">
                                                        <label className="form-label">Created by</label>
                                                        <input type="text" className="form-control" />
                                                    </div>
                                                </div> */}
                                        {/* </div> */}
                                        {/* <div className="col-lg-12">
                                                <div className="mb-3 input-blocks">
                                                    <label className="form-label">Description</label>
                                                    <textarea className="form-control" defaultValue={""} />
                                                    <p className="mt-1">Maximum 60 Characters</p>
                                                </div>
                                            </div> */}
                                        <div className="col-lg-12">
                                            <div className="modal-footer-btn">
                                                <button
                                                    type="button"
                                                    className="btn btn-cancel me-2"
                                                    data-bs-dismiss="modal"
                                                     disabled={isUploading}
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                type="submit" 
                                                className="btn btn-submit"
                                                disabled={isUploading}>
                                                  {isUploading ? 'Uploading...' : 'Submit'}
                                                </button>
                                                {/* <Link to="#" className="btn btn-submit">
                                                    Submit
                                                </Link> */}
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* /Import Product */}
        </div>
    )
}
Brand.propTypes = {
    // storeId: PropTypes.string.isRequired,
    onUploadSuccess: PropTypes.func.isRequired
};
export default Brand
