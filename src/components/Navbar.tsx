import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, Wallet, Menu, X, User, LogOut, Switch } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLucidWallet } from '../hooks/useLucidWallet';
import { Switch as AntSwitch, message } from 'antd';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, setUserFromWallet, updateUser } = useAuth();
  const { connected, address, balance, connect, disconnect } = useLucidWallet();

  const userBalanceADA = balance ? Number(balance) / 1_000_000 : 0;

  // Debug user state changes
  useEffect(() => {
    console.log('Navbar: User state changed:', {
      hasUser: !!user,
      userRole: user?.role,
      userDisplayName: user?.displayName,
      connected,
      address: address ? `${address.slice(0, 10)}...` : null
    });
  }, [user, connected, address]);

  // Auto-set user when wallet connects
  useEffect(() => {
    console.log('Navbar: Wallet connection effect triggered', { connected, address, user: !!user });
    if (connected && address && !user) {
      console.log('Navbar: Auto-setting user from connected wallet');
      setUserFromWallet(address, balance);
    }
  }, [connected, address, balance, user, setUserFromWallet]);

  // Role-based navigation items - do NOT include Create Project here
  const navItems = useMemo(() => {
    const baseItems = [
    { path: '/', label: 'Home' },
    { path: '/browse', label: 'Browse Projects' },
    { path: '/dashboard', label: 'Dashboard' }
  ];
    return baseItems;
  }, []); // No dependency on user role

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    if (connected) {
      disconnect();
    }
  };

  const handleRoleSwitch = async (checked: boolean) => {
    try {
      const newRole = checked ? 'donor' : 'student';
      const currentRole = user?.role;
      
      console.log('Navbar: Role switch triggered:', {
        currentRole,
        newRole,
        checked,
        user: user?.displayName
      });
      
      // Show confirmation message
      const confirmMessage = `Are you sure you want to switch from ${currentRole === 'student' ? 'Student Researcher' : 'Donor'} to ${newRole === 'student' ? 'Student Researcher' : 'Donor'}?`;
      
      if (window.confirm(confirmMessage)) {
        console.log('Navbar: User confirmed role switch');
        await updateUser({ role: newRole });
        console.log('Navbar: Role updated successfully to:', newRole);
        message.success(`Successfully switched to ${newRole === 'student' ? 'Student Researcher' : 'Donor'} mode!`);
        
        // Navigation will update automatically due to reactive navItems
      } else {
        console.log('Navbar: User cancelled role switch');
      }
    } catch (error) {
      console.error('Navbar: Role switch failed:', error);
      message.error('Failed to switch role. Please try again.');
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg group-hover:shadow-lg transition-all duration-300">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              EduFund
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors duration-200 hover:text-cyan-400 ${
                  isActive(item.path) 
                    ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' 
                    : 'text-gray-300'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {user?.role === 'student' && (
              <Link
                to="/create"
                className={`text-sm font-medium transition-colors duration-200 hover:text-cyan-400 ${
                  isActive('/create')
                    ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1'
                    : 'text-gray-300'
                }`}
                style={{ fontWeight: 600, fontSize: '1.05em', marginLeft: 8 }}
              >
                + Create Project
              </Link>
            )}
          </div>

          {/* User Profile and Wallet Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Wallet Status */}
            {connected ? (
              <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-green-400 font-medium">
                  {userBalanceADA.toFixed(2)} ADA
                </span>
              </div>
            ) : (
              <Button 
                className="web3-button"
                onClick={connect}
              >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
            )}

            {/* User Profile */}
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Role Switch for Students */}
                {user.role === 'student' && (
                  <div className="flex items-center space-x-2 bg-blue-500/20 px-3 py-2 rounded-lg">
                    <span className="text-xs text-blue-300 font-medium">Student</span>
                    <AntSwitch
                      size="small"
                      onChange={handleRoleSwitch}
                      checked={false}
                      checkedChildren="Donor"
                      unCheckedChildren="Student"
                      style={{
                        backgroundColor: '#3b82f6',
                        opacity: 0.8
                      }}
                    />
                    <span className="text-xs text-blue-300 font-medium">Want to become donor?</span>
                  </div>
                )}
                
                {/* Role Switch for Donors */}
                {user.role === 'donor' && (
                  <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-2 rounded-lg">
                    <span className="text-xs text-green-300 font-medium">Donor</span>
                    <AntSwitch
                      size="small"
                      onChange={handleRoleSwitch}
                      checked={true}
                      checkedChildren="Donor"
                      unCheckedChildren="Student"
                      style={{
                        backgroundColor: '#10b981',
                        opacity: 0.8
                      }}
                    />
                    <span className="text-xs text-green-300 font-medium">Want to become student?</span>
                  </div>
                )}
                
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">
                      {user.displayName}
                    </div>
                    <div className="text-xs text-gray-300">
                      {user.role === 'student' ? 'Student' : 'Donor'}
                    </div>
                  </div>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white hover:bg-red-500/20"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-sm">
                  Connect wallet to continue
                </span>
                <Button 
                  size="sm"
                  onClick={() => {
                    console.log('Debug: Current state:', { connected, address, user: !!user });
                    if (connected && address) {
                      console.log('Debug: Manually setting user');
                      setUserFromWallet(address, balance);
                    }
                  }}
                  className="text-xs"
                >
                  Debug
                </Button>
                <Button 
                  size="sm"
                  onClick={() => {
                    console.log('=== NAVBAR DEBUG ===');
                    console.log('Current user:', user);
                    console.log('User role:', user?.role);
                    console.log('Navigation items:', navItems);
                    console.log('Connected:', connected);
                    console.log('Address:', address);
                    console.log('=== END NAVBAR DEBUG ===');
                  }}
                  className="text-xs ml-2"
                >
                  Debug Nav
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors duration-200 hover:text-cyan-400 ${
                    isActive(item.path) ? 'text-cyan-400' : 'text-gray-300'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {user?.role === 'student' && (
                <Link
                  to="/create"
                  className={`text-sm font-medium transition-colors duration-200 hover:text-cyan-400 ${
                    isActive('/create') ? 'text-cyan-400' : 'text-gray-300'
                  }`}
                  style={{ fontWeight: 600, fontSize: '1.05em', marginLeft: 8 }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  + Create Project
                </Link>
              )}
              
              {/* Mobile User Section */}
              {user ? (
                <>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {user.displayName}
                        </div>
                        <div className="text-xs text-gray-300">
                          {user.role === 'student' ? 'Student' : 'Donor'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Role Switch for Students - Mobile */}
                    {user.role === 'student' && (
                      <div className="flex items-center justify-between bg-blue-500/20 px-3 py-2 rounded-lg mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-blue-300 font-medium">Student</span>
                          <AntSwitch
                            size="small"
                            onChange={handleRoleSwitch}
                            checked={false}
                            checkedChildren="Donor"
                            unCheckedChildren="Student"
                            style={{
                              backgroundColor: '#3b82f6',
                              opacity: 0.8
                            }}
                          />
                        </div>
                        <span className="text-xs text-blue-300 font-medium">Want to become donor?</span>
                      </div>
                    )}
                    
                    {/* Role Switch for Donors - Mobile */}
                    {user.role === 'donor' && (
                      <div className="flex items-center justify-between bg-green-500/20 px-3 py-2 rounded-lg mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-green-300 font-medium">Donor</span>
                          <AntSwitch
                            size="small"
                            onChange={handleRoleSwitch}
                            checked={true}
                            checkedChildren="Donor"
                            unCheckedChildren="Student"
                            style={{
                              backgroundColor: '#10b981',
                              opacity: 0.8
                            }}
                          />
                        </div>
                        <span className="text-xs text-green-300 font-medium">Want to become student?</span>
                      </div>
                    )}
                    
                    {connected && (
                      <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-2 rounded-lg mb-4">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-green-400 font-medium">
                          {userBalanceADA.toFixed(2)} ADA
                        </span>
                      </div>
                    )}
                    
                    <Link 
                      to="/profile"
                      className="block text-sm text-gray-300 hover:text-cyan-400 mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block text-sm text-red-400 hover:text-red-300"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="border-t border-white/10 pt-4">
                    <span className="block text-sm text-gray-300 mb-2">
                      Connect wallet to continue
                    </span>
                  </div>
                </>
              )}
              
              {/* Mobile Wallet Section */}
              {!connected && (
                <Button 
                  className="web3-button w-full mt-4"
                  onClick={() => {
                    connect();
                    setIsMenuOpen(false);
                  }}
                >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
