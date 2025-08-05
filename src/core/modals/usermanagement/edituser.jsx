import React, {useRef, useState, useEffect } from 'react'
// import { Link } from 'react-router-dom'
import Select from 'react-select'
import axios from 'axios';
// import ImageWithBasePath from '../../img/imagewithbasebath';
// import { Modal } from 'bootstrap';
import AddUsers from './addusers';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
const EditUser = ({ userToEdit, onSuccess  }) => {
    const [formData, setFormData] = useState({
        userId: null,
        username: '',
        phone: '',
        email: '',
        role: null,
        password: '',
        confirmPassword: '',
        // description: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [apiMessage, setApiMessage] = useState({ text: '', isError: false });
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

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                userId: userToEdit.userId,
                username: userToEdit.username || '',
                phone: userToEdit.phone || '',
                email: userToEdit.email || '',
                role: statusOptions.find(opt => opt.value === userToEdit.role) || null,
                password: '',
                confirmPassword: '',
                // description: userToEdit.description || ''
            });
             // Set the selected store if available
            if (userToEdit.storeId) {
                const store = storeOptions.find(opt => opt.value === userToEdit.storeId);
                if (store) setSelectedStore(store);
            }
        }
    }, [userToEdit, storeOptions]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (selected, { name }) => {
        setFormData(prev => ({ ...prev, [name]: selected }));
    };

    const handleTogglePassword = () => setShowPassword(prev => !prev);
    const handleToggleConfirmPassword = () => setShowConfirmPassword(prev => !prev);
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

        if (formData.password) {
            if (formData.password.length < 6)
                newErrors.password = 'Password must be at least 6 characters';
            if (formData.password !== formData.confirmPassword)
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

// handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setApiMessage({ text: '', isError: false });

        const payload = {
            userId: formData.userId,
            username: formData.username,
            phone: formData.phone,
            email: formData.email,
            password: formData.password || undefined,
            isActive: true,
            role: formData.role?.value,
            storeId: selectedStore?.value || storeId,
            pin: null,
            // description: formData.description || ''
        };

        try {
            const res = await axios.post(
                `${process.env.REACT_APP_BASEURL}api/v1/User/UpsertUser`, payload
                // `https://3250a7b43343.ngrok-free.app/api/v1/User/UpsertUser`, payload
            );
            if (res.data && (res.data.success || res.status === 200)) {
                setApiMessage({ text: res.data.message || 'User updated successfully', isError: false });

                // const modalEl = document.getElementById('edit-units');
                // const modal = Modal.getInstance(modalEl);
                // if (modal) modal.hide();
             // Call the success callback to refresh the user list
                if (onSuccess) {
                    onSuccess();
                }    
            } else {
                throw new Error(res.data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            setApiMessage({ text: error.response?.data?.message || 'Update failed', isError: true });
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div>
            {/* Edit User */}
            <div className="modal fade" id="edit-units">
                <div className="modal-dialog modal-dialog-centered custom-modal-two">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header border-0 custom-modal-header">
                                    <div className="page-title">
                                        <h4>Edit User</h4>
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
                                                    <div className="profile-pic-upload edit-pic">
                                                        <div className="profile-pic">
                                                            <span>
                                                                <ImageWithBasePath
                                                                    src="assets/img/users/edit-user.jpg"
                                                                    className="user-editer"
                                                                    alt="User"
                                                                />
                                                            </span>
                                                            <div className="close-img">
                                                                <i data-feather="x" className="info-img" />
                                                            </div>
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
                                                    <input type="text" name="username"
                                                        className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                                        value={formData.username}
                                                        onChange={handleChange}
                                                        placeholder="Enter user name" />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Phone</label>
                                                    <input type="text" name="phone"
                                                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        placeholder="Enter phone number" />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Email</label>
                                                    <input type="email" name="email"
                                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder="Enter email" />
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
                                                        name="role"
                                                        classNamePrefix="react-select"
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
                                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                            placeholder="Enter new password "
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
                                                    <label>Confirm Passworrd</label>
                                                    <div className="pass-group">
                                                        <input
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            name="confirmPassword"
                                                            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                                            placeholder="Re-enter new password"
                                                            value={formData.confirmPassword}
                                                            onChange={handleChange}
                                                            style={{ paddingRight: '30px' }}
                                                        />
                                                        <span
                                                            className={`ti   toggle-password  ${showConfirmPassword ? 'ti-eye' : 'ti-eye-off'}`}
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
                                                        defaultValue={""}
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
                                            {/* <Link to="#"
                                                className="btn btn-submit"
                                                disabled={isSubmitting}
                                                data-bs-dismiss="modal">
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
                                                        Updating...
                                                    </>
                                                ) : 'Update'}
                                            </button>
                                    
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* /Edit User */}
             <AddUsers userToEdit={userToEdit} />
        </div>        
    )
}
EditUser.propTypes = {
  userToEdit: PropTypes.shape({
    userId: PropTypes.string,
    username: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    storeId: PropTypes.string,
    // description: PropTypes.string
  }),
  onSuccess: PropTypes.func.isRequired
};

export default EditUser
