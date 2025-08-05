import React from 'react';
import { useAuth } from './useAuth';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const { logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { success } = await logout();
    if (success) {
      message.success('Logged out successfully');
      navigate('/signin'); // Redirect to login page
    }
  };

  return (
    <Button 
      type="primary" 
      danger
      onClick={handleLogout}
      loading={loading}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;