// import { PlusCircle } from 'feather-icons-react/build/IconComponents'
// import { Modal } from 'bootstrap';
import React, { useRef, useState, useEffect } from 'react'
// import { Link } from 'react-router-dom'
import Select from 'react-select'
import axios from 'axios';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
const AddUsers = ({onSuccess,userToEdit}) => {
    const [formData, setFormData] = useState({
        username: '',
        phone: '',
        email: '',
        role: null,
        password: '',
        confirmPassword: '',
        description: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [apiMessage, setApiMessage] = useState({ text: '', isError: false })
    const storeId = useSelector(state => state.user.storeId);
    const [storeOptions, setStoreOptions] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);

    const statusOptions = [
        { value: 'Inventory Manager', label: 'Inventory Manager' },
        { value: 'Super Admin', label: 'Super Admin' },
        { value: 'Accounts', label: 'Accounts' },
        { value: 'Store Manager', label: 'Store Manager' },
        { value: 'Technician', label: 'Technician' },
        { value: 'Sales Staff', label: 'Sales Staff' },
    ];
    // const storeOptions = [
    //     { value: 'Choose', label: 'Choose Store' },
    //     { value: 'Store1', label: 'Store 1' },
    //     { value: 'Store2', label: 'Store 2' },
    //     { value: 'Store3', label: 'Store 3' },
    // ];

    const handleTogglePassword = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    const handleToggleConfirmPassword = () => {
        setShowConfirmPassword((prevShowPassword) => !prevShowPassword);
    };
    // handle change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (selectedOption, { name }) => {
        setFormData(prev => ({
            ...prev,
            [name]: selectedOption
        }));
    };

    // form validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) newErrors.username = 'Username is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.role) newErrors.role = 'Role is required';
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const hasFetchedStores = useRef(false);
    // fetch store data from api 
    const fetchStores = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASEURL}api/v1/Admin/GetStore`);
            const stores = response.data || [];

            const mappedOptions = stores.map(store => ({
                value: store.id,
                label: store.name,
            }));
            setStoreOptions(mappedOptions);
        } catch (error) {
            console.error("Failed to fetch store options:", error);
        }
    };
    useEffect(() => {
        if (!hasFetchedStores.current) {
            fetchStores();
            hasFetchedStores.current = true;
        }
    }, []);
    //useEffect to populate form when userToEdit changes 
       useEffect(() => {
        if (userToEdit) {
            setFormData(prev => ({
                ...prev,
                username: userToEdit.username || '',
                phone: userToEdit.phone || '',
                email: userToEdit.email || '',
                role: statusOptions.find(opt => opt.value === userToEdit.role) || null,
                password: '',
                confirmPassword: '',
                description: userToEdit.description || ''
            }));
        }
    }, [userToEdit]);

    //   handle form submit 
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setApiMessage({ text: '', isError: false });

        try {
            const payload = {
                // userId: userToEdit?.userId || null,
                username: formData.username,
                password: formData.password,
                isActive: true,
                role: formData.role.value,
                phone: formData.phone,
                email: formData.email,
                description: '',
                pin: null,
                storeId: selectedStore?.value || storeId,
            };

            const response = await axios.post(`${process.env.REACT_APP_BASEURL}api/v1/User/UpsertUser`, payload);

            if (response.data && (response.data.success || response.status === 200)) {
                setApiMessage({
                    text: response.data.message || 'User created successfully',
                    isError: false
                });

                // Reset form on success
                resetForm();
                // Call the success callback to refresh the user list
                if (onSuccess) {
                    onSuccess();
                }

                // const modalEl = document.getElementById('add-units');
                // const modal = Modal.getInstance(modalEl);
                // if (modal) modal.hide();
            } else {
                throw new Error(response.data.message || 'Failed to create user');
            }

        } catch (error) {
            console.error('Error creating user:', error);
            setApiMessage({
                text: error.response?.data?.message || 'Failed to create user',
                isError: true
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    // function to handle form reset
    const resetForm = () => {
        setFormData({
            username: '',
            phone: '',
            email: '',
            role: null,
            password: '',
            confirmPassword: '',
            description: ''
        });
        setSelectedStore(null);
        setErrors({});
    };

    return (
        <div>
            {/* Add User */}
            <div className="modal fade" id="add-units">
                <div className="modal-dialog modal-dialog-centered custom-modal-two">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header border-0 custom-modal-header">
                                    <div className="page-title">
                                        <h4>Add User</h4>
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
                                    {apiMessage.text && (
                                        <div className={`alert ${apiMessage.isError ? 'alert-danger' : 'alert-success'}`}>
                                            {apiMessage.text}
                                        </div>
                                    )}
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            {/* <div className="col-lg-12">
                                                <div className="new-employee-field">
                                                    <span>Avatar</span>
                                                    <div className="profile-pic-upload mb-2">
                                                        <div className="profile-pic">
                                                            <span>
                                                                <PlusCircle className="plus-down-add" />
                                                                Profile Photo
                                                            </span>
                                                        </div>
                                                        <div className="input-blocks mb-0">
                                                            <div className="image-upload mb-0">
                                                                <input type="file" />
                                                                <div className="image-uploads">
                                                                    <h4>Change Image</h4>
                                                                </div>
                                                            </div>
                                                        </div>                                      
                                                    </div>
                                                </div>
                                            </div> */}
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>User Name</label>
                                                    <input
                                                        type="text"
                                                        name="username"
                                                        autoComplete="off"
                                                        className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                                        value={formData.username}
                                                        onChange={handleChange}
                                                         placeholder="Enter user name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Phone</label>
                                                    <input
                                                        type="text"
                                                        name="phone"
                                                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        placeholder="Enter phone number"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Email</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder="Enter email" 
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Store</label>
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
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Role</label>

                                                    <Select
                                                        classNamePrefix="react-select"
                                                        name="role"
                                                        options={statusOptions}
                                                        placeholder="Select Role"
                                                        value={formData.role}
                                                        onChange={(selected) => handleSelectChange(selected, { name: 'role' })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Password</label>
                                                    <div className="pass-group" style={{ position: 'relative' }}>
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            name="password"
                                                            autoComplete="new-password"
                                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                            placeholder="Enter your password"
                                                            value={formData.password}
                                                            onChange={handleChange}
                                                            style={{ paddingRight: '30px' }}
                                                        />
                                                        <span
                                                            className={`ti toggle-password ${showPassword ? 'ti-eye' : 'ti-eye-off'}`}
                                                            onClick={handleTogglePassword}
                                                            style={{
                                                                position: 'absolute',
                                                                right: '10px',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                cursor: 'pointer'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Confirm Password</label>
                                                    <div className="pass-group" style={{ position: 'relative' }}>
                                                        <input
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            name="confirmPassword"
                                                            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                                            placeholder="Confirm your password"
                                                            value={formData.confirmPassword}
                                                            onChange={handleChange}
                                                            style={{ paddingRight: '30px' }}
                                                        />
                                                        <span
                                                            className={`ti toggle-password  ${showConfirmPassword ? 'ti-eye' : 'ti-eye-off'}`}
                                                            onClick={handleToggleConfirmPassword}
                                                            style={{
                                                                position: 'absolute',
                                                                right: '10px',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                cursor: 'pointer'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* <div className="col-lg-12">
                                                <div className="mb-0 input-blocks">
                                                    <label className="form-label">Descriptions</label>
                                                    <textarea
                                                        className="form-control mb-1"
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleChange}
                                                    />
                                                    <p>Maximum 600 Characters</p>
                                                </div>
                                            </div> */}
                                        </div>
                                        <div className="modal-footer-btn">
                                            <button
                                                type="button"
                                                className="btn btn-cancel me-2"
                                                data-bs-dismiss="modal"
                                                disabled={isSubmitting}
                                            >
                                                Cancel
                                            </button>
                                            {/* <Link to="#" className="btn btn-submit">
                                                Submit
                                            </Link> */}
                                            <button
                                                type="submit"
                                                className="btn btn-submit"
                                                disabled={isSubmitting}
                                                data-bs-dismiss="modal"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Submitting...
                                                    </>
                                                ) : 'Submit'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* /Add User */}
        </div>
    )
}
AddUsers.propTypes = {
    
    userToEdit: PropTypes.shape({
        userId: PropTypes.string,
        username: PropTypes.string,
        phone: PropTypes.string,
        email: PropTypes.string,
        role: PropTypes.string,
        description: PropTypes.string        
    }),
      onSuccess: PropTypes.func.isRequired
};

AddUsers.defaultProps = {
    userToEdit: null
};

export default AddUsers
