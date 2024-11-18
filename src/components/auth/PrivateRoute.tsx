import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactElement; // React element to render if authenticated
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const authContext = useContext(AuthContext);

  // Ensure the context is defined
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }

  const { currentUser } = authContext;

  return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
