import React, { useState,useEffect } from "react";
import ImageWithBasePath from "../../../core/img/imagewithbasebath";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../../Router/all_routes";
// import axios from "axios";
// import { message } from "antd";
import { useAuth } from "./useAuth";
import { Alert } from "antd";

const SigninThree = () => {
  const route = all_routes;
  const navigate = useNavigate();
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const { login, loading, authError, clearAuthError } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);

  // const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (authError) {
      clearAuthError();
    }
  };
  // const handleCheckboxChange = (e) => {
  //   setRememberMe(e.target.checked);
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(formData.username, formData.password);
    if (result.success) {
      if (rememberMe) {
        localStorage.setItem("rememberedUser", JSON.stringify({
          username: formData.username,
          password: formData.password,
        }));
      } else {
        localStorage.removeItem("rememberedUser");
      }
      navigate(route.dashboard);
    }
  };
  // prefilled data from localStorage
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("rememberedUser"));
    if (savedUser?.username) {
      setFormData(prev => ({ ...prev, username: savedUser.username }));
      setRememberMe(true);
    }
  }, []);

  return (
    <>
      {/* Main Wrapper */}
      <div className="main-wrapper">
        <div className="account-content">
          <div className="login-wrapper login-new">
            <div className="row w-100"
             style={{ backgroundColor: 'rgb(62 18 81)' }}
            // style={{ backgroundColor: "#b38e432f" }}
             >
              <div className="col-lg-5 mx-auto"
               style={{ backgroundColor: 'rgb(62 18 81)' }} 
              // style={{ backgroundColor: "#b38e432f" }}
               >
                <div className="login-content user-login">
                  
                  <form onSubmit={handleSubmit}>
                    <div className="card">
                      <div className="card-body p-5">
                        <div className="login-logo">
                    <ImageWithBasePath src="assets/img/logo.png" alt="img" />
                    <Link
                      to={route.dashboard}
                      className="login-logo logo-white"
                    >
                      <ImageWithBasePath
                        src="assets/img/logo-white.png"
                        alt="Img"
                      />
                    </Link>
                  </div>
                        <div className="login-userheading">
                          <h3>Sign In</h3>
                          {/* <h4>
                            Access the EPOS panel using your email and
                            passcode.
                          </h4> */}
                        </div>
                        <div className="mb-3">
                          {authError && (
                            <Alert
                              message={authError}
                              type="error"
                              showIcon
                              style={{ marginBottom: '16px' }}
                            />
                          )}
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            UserName <span className="text-danger"> *</span>
                          </label>
                          <div className="input-group">
                            <input
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleInputChange}
                              className="form-control border-end-0"
                              required
                            />
                            <span className="input-group-text border-start-0">
                              <i className="ti ti-mail" />
                            </span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Password <span className="text-danger"> *</span>
                          </label>
                          <div className="pass-group">
                            <input
                              type={isPasswordVisible ? "text" : "password"}
                              className="pass-input form-control"
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              required
                            />
                            <span
                              className={`ti toggle-password ${isPasswordVisible ? "ti-eye" : "ti-eye-off"
                                }`}
                              onClick={togglePasswordVisibility}
                            ></span>
                          </div>
                        </div>
                        {/* <div className="form-login authentication-check">
                          <div className="row">
                            <div className="col-12 d-flex align-items-center justify-content-between">
                              <div className="custom-control custom-checkbox">
                                <label className="checkboxs ps-4 mb-0 pb-0 line-height-1 fs-16 text-gray-6">
                                  <input
                                    type="checkbox"
                                    className="form-control"
                                    checked={rememberMe}
                                    onChange={handleCheckboxChange}
                                  />

                                  <span className="checkmarks" />
                                  Remember me
                                </label>
                              </div>
                              <div className="text-end">
                                <Link
                                  className="text-black fs-16 fw-medium"
                                  to={route.forgotPasswordThree}
                                >
                                  Forgot Password?
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div> */}
                        <div className="form-login">
                          <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={loading}
                          >
                            {loading ? "Signing In..." : "Sign In"}
                          </button>
                        </div>
                        {/* <div className="signinform">
                          <h4>
                            New on our platform?
                            <Link to={route.registerThree} className="hover-a">
                              {" "}
                              Create an account
                            </Link>
                          </h4>
                        </div> */}
                        {/* <div className="form-setlogin or-text">
                          <h4>OR</h4>
                        </div>
                        <div className="mt-2">
                          <div className="d-flex align-items-center justify-content-center flex-wrap">
                            <div className="text-center me-2 flex-fill">
                              <Link
                                to="#"
                                className="br-10 p-2 btn btn-info d-flex align-items-center justify-content-center"
                              >
                                <ImageWithBasePath
                                  className="img-fluid m-1"
                                  src="assets/img/icons/facebook-logo.svg"
                                  alt="Facebook"
                                />
                              </Link>
                            </div>
                            <div className="text-center me-2 flex-fill">
                              <Link
                                to="#"
                                className="btn btn-white br-10 p-2  border d-flex align-items-center justify-content-center"
                              >
                                <ImageWithBasePath
                                  className="img-fluid m-1"
                                  src="assets/img/icons/google-logo.svg"
                                  alt="Facebook"
                                />
                              </Link>
                            </div>
                            <div className="text-center flex-fill">
                              <Link
                                to="#"
                                className="bg-dark br-10 p-2 btn btn-dark d-flex align-items-center justify-content-center"
                              >
                                <ImageWithBasePath
                                  className="img-fluid m-1"
                                  src="assets/img/icons/apple-logo.svg"
                                  alt="Apple"
                                />
                              </Link>
                            </div>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </form>
                </div>
                <div className="my-4 d-flex justify-content-center align-items-center copyright-text text-white">
                  <p>Copyright © 2025 Belinnov Solutions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default SigninThree;
