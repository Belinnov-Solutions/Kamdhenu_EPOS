// hooks/useAuth.js
import { useState } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, logoutSuccess } from "../../../core/redux/userSlice";
import { all_routes } from "../../../Router/all_routes";
export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null); 
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const login = async (username, password) => {
    if (!username || !password) {
      message.error("Please fill in all required fields");
      return { success: false };
    }

    setLoading(true);
    setAuthError(null);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASEURL}api/v1/User/login`,
      //  ` https://412ee0ba6528.ngrok-free.app/api/v1/User/login`,
        { username, password },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // hooks/useAuth.js (inside login success branch)
      if (response.data.message === "Login successful") {
        const userData = response.data.user;

        dispatch(loginSuccess(userData));

        // ✅ Persist for guard + refresh
        localStorage.setItem("auth_user", JSON.stringify(userData));

        const normalizedRole = userData.rolename?.toLowerCase().trim() || "";
        let targetRoute = "/dashboard";
        if (normalizedRole.includes("store manager") || normalizedRole.includes("technician")) {
          targetRoute = "/pos";
        } else if (normalizedRole.includes("super admin")) {
          targetRoute = "/index";
        }

        // Single source of navigation truth: keep it here
        // (and REMOVE navigate(route.dashboard) in SigninThree)
        setTimeout(() => {
          navigate(targetRoute, { replace: true });
        }, 0);

        message.success("Login successful");
        return { success: true, data: response.data };
      } else {
        message.error(response.data.message || "Login failed");
        return { success: false };
      }
    } catch (error) {
      console.error("Login error:", error);

       if (error.response) {
        if (error.response.status === 401) {
          const errorMessage = error.response.data?.message?.toLowerCase?.() ||'';
          
          if (errorMessage.includes("username")) {
            setAuthError("Username is incorrect");
          } else if (errorMessage.includes("password")) {
            setAuthError("Password is incorrect");
          } else {
            setAuthError("Invalid credentials");
          }
        } else {
          setAuthError(
            error.response.data?.message ||
            "An error occurred during login"
          );
        }
      } else {
        setAuthError(error.message || "An error occurred during login");
      }
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axios.get(`${process.env.REACT_APP_BASEURL}api/v1/User/logout`, {
        withCredentials: true,
      });

      // Clear user data in Redux
      dispatch(logoutSuccess());
      localStorage.removeItem("auth_user");
      navigate(all_routes.signinthree); // "/signin"
      message.success("Logged out successfully");
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred during logout";
      message.error(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    logout,
    loading,
    user, // Now comes from Redux
    isAuthenticated: !!user.userId, // Helper for auth checks
    authError, // Export the auth error state
    clearAuthError: () => setAuthError(null),
  };
};
