import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '@meshsdk/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Wallet, Shield, GraduationCap } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'donor' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, connectWallet, isLoading } = useAuth();
  const { connected } = useWallet();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to wallet...</p>
        </div>
      </div>
    );
  }

  // Not connected to wallet
  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <Wallet className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your Cardano wallet to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-600">
              <p>This page requires wallet authentication.</p>
              <p>Please connect your Cardano wallet to continue.</p>
            </div>
            <Button 
              onClick={connectWallet}
              className="w-full"
              size="lg"
            >
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet
            </Button>
            <div className="text-xs text-gray-500 text-center">
              <p>We support Eternl, Nami, and other Cardano wallets</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authenticated (wallet connected but not verified with backend)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full w-fit">
              <Shield className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Authentication Required</CardTitle>
            <CardDescription>
              Please complete wallet authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-600">
              <p>Your wallet is connected but authentication is pending.</p>
              <p>Please wait or try reconnecting.</p>
            </div>
            <Button 
              onClick={connectWallet}
              className="w-full"
              size="lg"
              variant="outline"
            >
              <Shield className="mr-2 h-5 w-5" />
              Complete Authentication
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Role-based access control
  if (requiredRole && user?.role !== requiredRole) {
    const roleMessages = {
      student: {
        title: 'Student Access Required',
        description: 'This page is only available to Sri Lankan students',
        icon: GraduationCap,
        color: 'bg-green-100 text-green-600',
        message: 'You need to upgrade your account to a student role to access this page.'
      },
      donor: {
        title: 'Donor Access Required',
        description: 'This page is only available to donors',
        icon: Wallet,
        color: 'bg-blue-100 text-blue-600',
        message: 'This page is only available to donors.'
      },
      admin: {
        title: 'Admin Access Required',
        description: 'This page is only available to administrators',
        icon: Shield,
        color: 'bg-red-100 text-red-600',
        message: 'This page is only available to administrators.'
      }
    };

    const roleInfo = roleMessages[requiredRole];
    const IconComponent = roleInfo.icon;

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className={`mx-auto mb-4 p-3 rounded-full w-fit ${roleInfo.color}`}>
              <IconComponent className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold">{roleInfo.title}</CardTitle>
            <CardDescription>{roleInfo.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-600">
              <p>{roleInfo.message}</p>
              {requiredRole === 'student' && (
                <p className="mt-2">
                  <strong>Current role:</strong> {user?.role === 'donor' ? 'Global Donor' : user?.role}
                </p>
              )}
            </div>
            {requiredRole === 'student' && user?.role === 'donor' && (
              <Button 
                onClick={() => window.location.href = '/profile'}
                className="w-full"
                size="lg"
              >
                <GraduationCap className="mr-2 h-5 w-5" />
                Upgrade to Student
              </Button>
            )}
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
              variant="outline"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
};

export default ProtectedRoute; 