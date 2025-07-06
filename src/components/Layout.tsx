import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Layout as AntLayout, 
  Menu, 
  Button, 
  Avatar, 
  Dropdown, 
  Space, 
  Typography, 
  Badge,
  Tooltip,
  Divider
} from 'antd';
import {
  HomeOutlined,
  ProjectOutlined,
  PlusOutlined,
  UserOutlined,
  LogoutOutlined,
  WalletOutlined,
  GiftOutlined,
  SettingOutlined,
  MenuOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useLucidWallet } from '../hooks/useLucidWallet';
import logo from '../assets/logo.png';

const { Header, Content, Footer } = AntLayout;
const { Text } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, setUserFromWallet } = useAuth();
  const { 
    connected, 
    address, 
    balance, 
    error: walletError,
    loading: walletLoading, 
    connect, 
    disconnect, 
    refreshBalance,
    availableWallets,
    hasWallets
  } = useLucidWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userBalanceADA = balance ? Number(balance) / 1_000_000 : 0;

  // Add debugging logs
  console.log('Layout component rendered');
  console.log('User:', user);
  console.log('User displayName:', user?.displayName);
  console.log('User role:', user?.role);
  console.log('Is authenticated:', !!user);
  console.log('Wallet connected:', connected);
  console.log('Wallet address:', address);

  // Auto-set user when wallet connects
  useEffect(() => {
    if (connected && address && !user) {
      console.log('Layout: Auto-setting user from connected wallet');
      setUserFromWallet(address, balance);
    }
  }, [connected, address, balance, user, setUserFromWallet]);

  const handleLogout = () => {
    logout();
    if (connected) {
      disconnect();
    }
  };

  const walletMenuItems = [
    {
      key: 'status',
      label: (
        <div style={{ padding: '8px 0' }}>
          <Text strong>Wallet Status</Text>
          <div>
            <Text type={connected ? 'success' : 'danger'}>
              {connected ? 'Connected' : 'Not Connected'}
            </Text>
          </div>
        </div>
      )
    },
    {
      type: 'divider' as const
    },
    {
      key: 'balance',
      label: (
        <div style={{ padding: '8px 0' }}>
          <Text>Balance</Text>
          <div>
            <Text strong style={{ color: '#52c41a' }}>
              {userBalanceADA.toFixed(2)} ADA
            </Text>
          </div>
        </div>
      )
    },
    {
      key: 'address',
      label: (
        <div style={{ padding: '8px 0' }}>
          <Text>Address</Text>
          <div>
            <Text code style={{ fontSize: '12px' }}>
              {address ? `${address.slice(0, 20)}...${address.slice(-20)}` : 'Not available'}
            </Text>
          </div>
        </div>
      )
    },
    {
      type: 'divider' as const
    },
    {
      key: 'refresh',
      label: (
        <Button 
          type="text" 
          size="small" 
          onClick={refreshBalance}
          style={{ width: '100%', textAlign: 'left' }}
        >
          Refresh Balance
        </Button>
      )
    },
    {
      key: 'disconnect',
      label: (
        <Button 
          type="text" 
          danger 
          size="small" 
          onClick={disconnect}
          style={{ width: '100%', textAlign: 'left' }}
        >
          Disconnect Wallet
        </Button>
      )
    }
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
          <UserOutlined /> Profile
        </Link>
      )
    },
    {
      key: 'my-projects',
      label: (
        <Link to="/my-projects" onClick={() => setMobileMenuOpen(false)}>
          <ProjectOutlined /> My Projects
        </Link>
      )
    },
    {
      key: 'my-donations',
      label: (
        <Link to="/my-donations" onClick={() => setMobileMenuOpen(false)}>
          <GiftOutlined /> My Donations
        </Link>
      )
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      label: (
        <Button 
          type="text" 
          danger 
          onClick={handleLogout}
          style={{ width: '100%', textAlign: 'left' }}
        >
          <LogoutOutlined /> Logout
        </Button>
      )
    }
  ];

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: <Link to="/projects">Projects</Link>
    },
    {
      key: '/create-project',
      icon: <PlusOutlined />,
      label: <Link to="/create-project">Create Project</Link>
    }
  ];

  const selectedKeys = [location.pathname];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header 
        style={{ 
          background: '#fff', 
          padding: '0 24px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          height: '100%'
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img 
              src={logo} 
              alt="EduFund" 
              style={{ 
                height: '40px', 
                marginRight: '12px',
                borderRadius: '8px'
              }} 
            />
            <Typography.Title 
              level={3} 
              style={{ 
                margin: 0, 
                color: '#1890ff',
                fontWeight: 'bold'
              }}
            >
              EduFund
            </Typography.Title>
          </Link>

          {/* Desktop Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Navigation Menu */}
            <Menu
              mode="horizontal"
              selectedKeys={selectedKeys}
              items={menuItems.filter(item => !item.hidden)}
              style={{ 
                border: 'none', 
                background: 'transparent',
                flex: 1
              }}
            />

            {/* Wallet Connection */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {connected ? (
                <Dropdown
                  menu={{ items: walletMenuItems }}
                  placement="bottomRight"
                  trigger={['click']}
                >
                  <Button 
                    type="primary" 
                    icon={<WalletOutlined />}
                    style={{ 
                      background: 'linear-gradient(135deg, #52c41a 0%, #1890ff 100%)',
                      border: 'none'
                    }}
                  >
                    <Space>
                      <Text style={{ color: 'white' }}>
                        {userBalanceADA.toFixed(2)} ADA
                      </Text>
                    </Space>
                  </Button>
                </Dropdown>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Button 
                  type="primary" 
                  icon={<WalletOutlined />}
                  onClick={connect}
                  loading={walletLoading}
                  style={{ 
                    background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                    border: 'none'
                  }}
                >
                  Connect Wallet
                </Button>
                  {walletError && (
                    <Text type="danger" style={{ fontSize: '10px', marginTop: '4px', textAlign: 'center' }}>
                      {walletError}
                    </Text>
                  )}
                  {!hasWallets && !walletLoading && (
                    <Text type="secondary" style={{ fontSize: '10px', marginTop: '4px', textAlign: 'center' }}>
                      Install Eternl, Nami, or Flint
                    </Text>
                  )}
                </div>
              )}
            </div>

            {/* User Menu - Only show if user is authenticated */}
            {user ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button 
                  type="text" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    height: '40px',
                    padding: '0 12px'
                  }}
                >
                  <Avatar 
                    size={32} 
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#1890ff' }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <Text strong style={{ display: 'block', fontSize: '14px' }}>
                      {user.displayName}
                    </Text>
                    <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                      {user.role === 'student' ? 'Student' : 'Donor'}
                    </Text>
                  </div>
                </Button>
              </Dropdown>
            ) : (
              // Show wallet connection prompt when not authenticated
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Connect wallet to continue
                </Text>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              type="text"
              icon={mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'none' }}
              className="mobile-menu-toggle"
            />
          </div>
        </div>
      </Header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 999,
            padding: '16px',
            display: 'none'
          }}
          className="mobile-menu"
        >
          <Menu
            mode="vertical"
            selectedKeys={selectedKeys}
            items={menuItems.filter(item => !item.hidden)}
            style={{ border: 'none' }}
          />
          <Divider />
          {user && (
            <Menu
              mode="vertical"
              items={userMenuItems}
              style={{ border: 'none' }}
            />
          )}
        </div>
      )}

      <Content style={{ padding: '0', background: '#f5f5f5' }}>
        {children}
      </Content>

      <Footer style={{ 
        textAlign: 'center', 
        background: '#001529', 
        color: '#fff',
        padding: '24px'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <img 
              src={logo} 
              alt="EduFund" 
              style={{ 
                height: '32px', 
                marginRight: '12px',
                borderRadius: '6px'
              }} 
            />
            <Typography.Title 
              level={4} 
              style={{ 
                margin: 0, 
                color: '#fff',
                display: 'inline-block'
              }}
            >
              EduFund
            </Typography.Title>
          </div>
          <Typography.Text style={{ color: 'rgba(255,255,255,0.8)' }}>
            Empowering education through blockchain technology
          </Typography.Text>
          <div style={{ marginTop: '16px' }}>
            <Typography.Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
              © 2024 EduFund. Built on Cardano blockchain.
            </Typography.Text>
          </div>
        </div>
      </Footer>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: block !important;
          }
          .mobile-menu {
            display: block !important;
          }
        }
      `}</style>
    </AntLayout>
  );
};

export default AppLayout; 
 
 