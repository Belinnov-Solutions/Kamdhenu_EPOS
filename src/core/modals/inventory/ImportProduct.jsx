import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';

const ImportProduct = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
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
     setSuccessMessage(null);
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
        }
      );

      // Reset form and close modal on success
      setSelectedFile(null);
      document.getElementById('uploadFile').value = '';
       setSuccessMessage('Products imported successfully!');
      setError(null);
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || 'Failed to upload file');
      setSuccessMessage(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="page-title">
            <h4>Import Products</h4>
            <h6>Bulk import products via Excel</h6>
          </div>
          <div className="page-btn">
            <Link
              to="#"
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#import-product-modal"
            >
              <i className="ti ti-upload me-1"></i> Import Products
            </Link>
          </div>
        </div>
         {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {successMessage}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccessMessage(null)}
              aria-label="Close"
            ></button>
          </div>
        )}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError(null)}
              aria-label="Close"
            ></button>
          </div>
        )}

        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              {/* You can add a table here to show import history if needed */}
              <p>Upload an Excel file to import products in bulk.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Import Product Modal */}
      <div className="modal fade" id="import-product-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div className="page-title">
                <h4>Import Products</h4>
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
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      {/* <Link
                        to="#"
                        className="btn btn-secondary mb-3"
                        onClick={}
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
                  <div className="col-12">
                    <div className="mb-3">
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
                </div>
                <div className="modal-footer">
         <div className="d-flex justify-content-end w-100 gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isUploading}
                    data-bs-dismiss="modal"
                  >
                    {isUploading ? 'Uploading...' : 'Import Products'}
                  </button>
                </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ImportProduct.propTypes = {
  onUploadSuccess: PropTypes.func.isRequired
};

export default ImportProduct;