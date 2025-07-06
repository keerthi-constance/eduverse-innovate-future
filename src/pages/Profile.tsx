import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Row, Col, Avatar, Tabs, message, Divider, Badge, Tag, Space, Select } from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  SaveOutlined, 
  WalletOutlined, 
  MailOutlined, 
  BankOutlined, 
  BookOutlined,
  CalendarOutlined,
  IdcardOutlined,
  BarChartOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useLucidWallet } from '../hooks/useLucidWallet';
import WalletConnect from '../components/WalletConnect';
import { Link as RouterLink } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

export default function Profile() {
  const { user, logout, updateUser, setUserFromWallet, forceConnectWallet } = useAuth();
  const { connected, address, balance, connect } = useLucidWallet();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentRole, setCurrentRole] = useState(user?.role || 'donor');

  const userBalanceADA = balance ? Number(balance) / 1_000_000 : 0;

  // Update currentRole when user changes
  useEffect(() => {
    if (user?.role) {
      setCurrentRole(user.role);
    }
  }, [user?.role]);

  // Auto-set user when wallet connects
  useEffect(() => {
    if (connected && address && !user) {
      console.log('Profile: Auto-setting user from connected wallet');
      setUserFromWallet(address, balance);
    }
  }, [connected, address, balance, user, setUserFromWallet]);

  // Handle role change
  const handleRoleChange = (value: string) => {
    const oldRole = currentRole;
    setCurrentRole(value);
    
    // Show confirmation message
    if (oldRole !== value) {
      message.info(`Role changed from ${oldRole === 'student' ? 'Student Researcher' : 'Donor'} to ${value === 'student' ? 'Student Researcher' : 'Donor'}. Remember to save your changes.`);
    }
    
    // Update form field labels and placeholders based on role
    form.setFieldsValue({
      institution: '',
      researchField: ''
    });
  };

  // Add debugging logs
  console.log('=== PROFILE DEBUG ===');
  console.log('Profile component rendered');
  console.log('User:', user);
  console.log('Connected:', connected);
  console.log('Address:', address);
  console.log('Balance:', balance);
  console.log('Current Role:', currentRole);
  console.log('User Role:', user?.role);
  console.log('Wallet connected but no user:', connected && address && !user);
  console.log('=== END PROFILE DEBUG ===');

  // If wallet is not connected, show wallet connection message
  if (!connected) {
    return (
      <div style={{ minHeight: '80vh', padding: '32px 0', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Title level={2} style={{ marginBottom: 24 }}>Profile</Title>
          <Card>
            <Title level={4} style={{ marginBottom: 16 }}>Wallet Connection Required</Title>
            <Paragraph style={{ marginBottom: 24 }}>
              Please connect your Cardano wallet to view and manage your profile. Your wallet address will be used to identify you on the platform.
            </Paragraph>
            <WalletConnect />
            <div style={{ marginTop: 16 }}>
              <Button 
                type="default" 
                onClick={() => {
                  console.log('Debug: Current connection state:', connected);
                  console.log('Debug: Current address:', address);
                  console.log('Debug: Current user:', user);
                }}
                style={{ marginRight: 8 }}
              >
                Debug Connection State
              </Button>
              <Button 
                type="primary" 
                onClick={async () => {
                  console.log('Manual wallet connection triggered');
                  try {
                    await connect();
                  } catch (error) {
                    console.error('Manual connection failed:', error);
                  }
                }}
                style={{ marginRight: 8 }}
              >
                Connect Wallet
              </Button>
              <Button 
                type="dashed" 
                onClick={() => {
                  console.log('Debug wallet state...');
                  if (window.debugWallet) {
                    window.debugWallet();
                  }
                }}
                style={{ marginRight: 8 }}
              >
                Debug Wallet
              </Button>
              <Button 
                type="default" 
                onClick={async () => {
                  console.log('Force connecting wallet...');
                  try {
                    const result = await forceConnectWallet();
                    console.log('Force connect result:', result);
                  } catch (error) {
                    console.error('Force connect failed:', error);
                  }
                }}
              >
                Force Connect
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // If wallet is connected but no user profile exists yet
  if (connected && address && !user) {
    return (
      <div style={{ minHeight: '80vh', padding: '32px 0', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Title level={2} style={{ marginBottom: 24 }}>Profile</Title>
          <Card>
            <Title level={4} style={{ marginBottom: 16 }}>Setting Up Your Profile</Title>
            <Paragraph style={{ marginBottom: 24 }}>
              Your wallet is connected! Setting up your profile...
            </Paragraph>
            <div style={{ textAlign: 'left', marginBottom: 24 }}>
              <Text strong>Wallet Address:</Text>
              <Paragraph copyable style={{ fontSize: '12px', marginTop: 4 }}>
                {address}
              </Paragraph>
            </div>
            <div style={{ textAlign: 'left', marginBottom: 24 }}>
              <Text strong>Wallet Balance:</Text>
              <div>
                <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                  {userBalanceADA.toFixed(2)} ADA
                </Text>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <Button 
                type="primary" 
                onClick={() => {
                  console.log('Manual user setup triggered');
                  setUserFromWallet(address, balance);
                }}
                style={{ marginRight: 8 }}
              >
                Create Profile
              </Button>
              <Button 
                type="dashed" 
                onClick={() => {
                  console.log('Debug wallet state...');
                  if (window.debugWallet) {
                    window.debugWallet();
                  }
                }}
                style={{ marginRight: 8 }}
              >
                Debug Wallet
              </Button>
              <Button 
                type="default" 
                onClick={async () => {
                  console.log('Force connecting wallet...');
                  try {
                    const result = await forceConnectWallet();
                    console.log('Force connect result:', result);
                  } catch (error) {
                    console.error('Force connect failed:', error);
                  }
                }}
              >
                Force Connect
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const onFinish = async (values) => {
    try {
      console.log('=== PROFILE UPDATE DEBUG ===');
      console.log('Profile update triggered with values:', values);
      console.log('Current user before update:', user);
      console.log('Is updating state:', isUpdating);
      
      setIsUpdating(true);
      
      console.log('Calling updateUser with values:', values);
      const result = await updateUser(values);
      console.log('updateUser result:', result);
      
      if (result) {
        console.log('Profile update successful');
      message.success('Profile updated successfully!');
      setIsEditing(false);
      } else {
        console.log('Profile update failed');
        message.error('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      message.error('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
      console.log('=== END PROFILE UPDATE DEBUG ===');
    }
  };

  const handleLogout = () => {
    logout();
    message.success('Logged out successfully');
  };

  const getRoleColor = (role: string) => {
    return role === 'student' ? 'blue' : 'green';
  };

  const getRoleIcon = (role: string) => {
    return role === 'student' ? <BookOutlined /> : <BankOutlined />;
  };

  return (
    <div style={{ minHeight: '80vh', padding: '32px 0' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>Profile</Title>
        
        <Row gutter={[24, 24]}>
          {/* Profile Overview */}
          <Col xs={24} md={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Badge.Ribbon 
                  text={currentRole === 'student' ? 'Student' : 'Donor'} 
                  color={getRoleColor(currentRole)}
                >
                <Avatar 
                  size={120} 
                  icon={<UserOutlined />} 
                    style={{ 
                      marginBottom: 16,
                      backgroundColor: getRoleColor(currentRole) === 'blue' ? '#1890ff' : '#52c41a'
                    }}
                />
                </Badge.Ribbon>
                
                <Title level={3} style={{ marginBottom: 8 }}>
                  {user?.displayName || 'User'}
                </Title>
                
                <Space direction="vertical" size="small" style={{ width: '100%', marginBottom: 16 }}>
                  <Tag 
                    icon={getRoleIcon(currentRole)} 
                    color={getRoleColor(currentRole)}
                    style={{ fontSize: '14px', padding: '4px 12px' }}
                  >
                    {currentRole === 'student' ? 'Student Researcher' : 'Donor'}
                  </Tag>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <MailOutlined style={{ color: '#666' }} />
                    <Text type="secondary">{user?.email || 'No email provided'}</Text>
                  </div>
                  
                  {user?.institution && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <BankOutlined style={{ color: '#666' }} />
                      <Text type="secondary">{user.institution}</Text>
                    </div>
                  )}
                  
                  {user?.researchField && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <BookOutlined style={{ color: '#666' }} />
                      <Text type="secondary">{user.researchField}</Text>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <CalendarOutlined style={{ color: '#666' }} />
                    <Text type="secondary">
                      Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </Text>
                  </div>
                </Space>

                <Divider />

                {/* Wallet Information */}
                <div style={{ textAlign: 'left' }}>
                  <Title level={5} style={{ marginBottom: 12 }}>
                    <WalletOutlined style={{ marginRight: 8 }} />
                    Wallet Information
                  </Title>
                  
                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Status:</Text>
                    <div>
                      <Tag color={connected ? 'success' : 'error'}>
                        {connected ? 'Connected' : 'Not Connected'}
                      </Tag>
                    </div>
                  </div>
                  
                  {connected && (
                    <>
                      <div style={{ marginBottom: 12 }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Balance:</Text>
                        <div>
                          <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                            {userBalanceADA.toFixed(2)} ADA
                          </Text>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: 12 }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Address:</Text>
                        <Paragraph copyable style={{ fontSize: 11, marginTop: 4, marginBottom: 0 }}>
                          {address ? `${address.slice(0, 20)}...${address.slice(-20)}` : 'Not available'}
                </Paragraph>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </Col>

          {/* Profile Details */}
          <Col xs={24} md={16}>
            <Card>
              <Tabs defaultActiveKey="profile">
                <TabPane tab="Profile Information" key="profile">
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                      displayName: user?.displayName || '',
                      email: user?.email || '',
                      institution: user?.institution || '',
                      researchField: user?.researchField || '',
                      role: user?.role || 'student'
                    }}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="displayName"
                          label="Full Name"
                          rules={[{ required: true, message: 'Please enter your name' }]}
                        >
                          <Input 
                            placeholder="Enter your full name" 
                            disabled={!isEditing}
                            size="large"
                            prefix={<UserOutlined />}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="email"
                          label="Email"
                          rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Please enter a valid email' }
                          ]}
                        >
                          <Input 
                            placeholder="Enter your email" 
                            disabled={!isEditing}
                            size="large"
                            prefix={<MailOutlined />}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                    <Form.Item
                      name="institution"
                          label={currentRole === 'student' ? "University/Institution" : "Organization"}
                        >
                          <Input 
                            placeholder={currentRole === 'student' ? "Your university or research institution" : "Your organization"}
                            disabled={!isEditing}
                            size="large"
                            prefix={<BankOutlined />}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="researchField"
                          label={currentRole === 'student' ? "Research Field" : "Area of Interest"}
                    >
                      <Input 
                            placeholder={currentRole === 'student' ? "e.g., Computer Science, Biology, etc." : "e.g., Education, Technology, etc."}
                        disabled={!isEditing}
                        size="large"
                            prefix={<BookOutlined />}
                      />
                    </Form.Item>
                      </Col>
                    </Row>



                    <Row gutter={16}>
                      <Col span={12}>
                    <Form.Item
                          name="role"
                          label="Role"
                          rules={[{ required: true, message: 'Please select your role' }]}
                          extra={isEditing ? "Changing your role will update the labels and placeholders for other fields." : ""}
                        >
                          <Select
                            placeholder="Select your role"
                        disabled={!isEditing}
                        size="large"
                            onChange={handleRoleChange}
                          >
                            <Option value="student">Student Researcher</Option>
                            <Option value="donor">Donor</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="walletAddress"
                          label="Wallet Address"
                        >
                          <Input 
                            placeholder="Your Cardano wallet address" 
                            disabled={true}
                            size="large"
                            prefix={<WalletOutlined />}
                            value={address || user?.walletAddress || 'Not connected'}
                      />
                    </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button 
                            type="primary" 
                            htmlType="submit" 
                            icon={<SaveOutlined />}
                            loading={isUpdating}
                          >
                            Save Changes
                          </Button>
                          <Button onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          type="primary" 
                          icon={<EditOutlined />}
                          onClick={() => setIsEditing(true)}
                        >
                          Edit Profile
                        </Button>
                      )}
                    </Form.Item>
                  </Form>
                </TabPane>

                <TabPane tab="Wallet & Security" key="wallet">
                  <div style={{ padding: '16px 0' }}>
                    <div style={{ marginBottom: 24 }}>
                      <Title level={4}>
                        <WalletOutlined style={{ marginRight: 8 }} />
                        Wallet Connection
                      </Title>
                      <Paragraph style={{ color: '#666', marginBottom: 16 }}>
                        Manage your Cardano wallet connection and view your wallet details.
                      </Paragraph>
                      
                      <Card style={{ marginBottom: 16 }}>
                        <Row gutter={16}>
                          <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                              <Text strong>Connection Status:</Text>
                              <div style={{ marginTop: 4 }}>
                                <Tag color={connected ? 'success' : 'error'} size="large">
                                  {connected ? 'Connected' : 'Not Connected'}
                                </Tag>
                              </div>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                              <Text strong>Wallet Balance:</Text>
                              <div style={{ marginTop: 4 }}>
                                <Text strong style={{ color: '#52c41a', fontSize: '18px' }}>
                                  {userBalanceADA.toFixed(2)} ADA
                                </Text>
                              </div>
                            </div>
                          </Col>
                        </Row>
                        
                        {connected && address && (
                          <div style={{ marginBottom: 16 }}>
                            <Text strong>Wallet Address:</Text>
                            <div style={{ marginTop: 4 }}>
                              <Paragraph copyable style={{ fontSize: '12px', marginBottom: 0 }}>
                                {address}
                              </Paragraph>
                            </div>
                          </div>
                        )}
                      </Card>
                      
                      <WalletConnect />
                    </div>

                    <Divider />

                    <div style={{ marginTop: 16 }}>
                      <Title level={4}>
                        <IdcardOutlined style={{ marginRight: 8 }} />
                        Account Actions
                      </Title>
                      <Space>
                      <Button danger onClick={handleLogout}>
                        Logout
                      </Button>
                        <Button type="default">
                          Export Data
                        </Button>
                      </Space>
                    </div>
                  </div>
                </TabPane>

                <TabPane tab="Preferences" key="preferences">
                  <div style={{ padding: '16px 0' }}>
                    <Title level={4}>
                      <SettingOutlined style={{ marginRight: 8 }} />
                      Account Preferences
                    </Title>
                    
                    <Card style={{ marginBottom: 16 }}>
                      <Title level={5}>Notification Settings</Title>
                      <Paragraph style={{ color: '#666', marginBottom: 16 }}>
                        Manage how you receive notifications about your projects and donations.
                      </Paragraph>
                      
                      <div style={{ marginBottom: 16 }}>
                        <Text strong>Email Notifications:</Text>
                        <div style={{ marginTop: 8 }}>
                          <Tag color="blue">Project Updates</Tag>
                          <Tag color="blue">Donation Confirmations</Tag>
                          <Tag color="blue">New Messages</Tag>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: 16 }}>
                        <Text strong>Wallet Notifications:</Text>
                        <div style={{ marginTop: 8 }}>
                          <Tag color="green">Transaction Confirmations</Tag>
                          <Tag color="green">Balance Updates</Tag>
                        </div>
                      </div>
                    </Card>
                    
                    <Card>
                      <Title level={5}>Privacy Settings</Title>
                      <Paragraph style={{ color: '#666', marginBottom: 16 }}>
                        Control your privacy and data sharing preferences.
                      </Paragraph>
                      
                      <div style={{ marginBottom: 16 }}>
                        <Text strong>Profile Visibility:</Text>
                        <div style={{ marginTop: 8 }}>
                          <Tag color="orange">Public Profile</Tag>
                          <Tag color="orange">Show Institution</Tag>
                          <Tag color="orange">Show Research Field</Tag>
                        </div>
                      </div>
                      
                      <div>
                        <Text strong>Data Sharing:</Text>
                        <div style={{ marginTop: 8 }}>
                          <Tag color="purple">Analytics</Tag>
                          <Tag color="purple">Research Purposes</Tag>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabPane>

                <TabPane tab="Statistics" key="statistics">
                  <div style={{ padding: '16px 0' }}>
                    <Title level={4}>
                      <BarChartOutlined style={{ marginRight: 8 }} />
                      Activity & Statistics
                    </Title>
                    
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} md={8}>
                        <Card>
                          <div style={{ textAlign: 'center' }}>
                            <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
                              {currentRole === 'student' ? '0' : '0'}
                            </Title>
                            <Text type="secondary">
                              {currentRole === 'student' ? 'Projects Created' : 'Projects Funded'}
                            </Text>
                          </div>
                        </Card>
                      </Col>
                      
                      <Col xs={24} sm={12} md={8}>
                        <Card>
                          <div style={{ textAlign: 'center' }}>
                            <Title level={2} style={{ color: '#52c41a', marginBottom: 8 }}>
                              {currentRole === 'student' ? '0' : '0'}
                            </Title>
                            <Text type="secondary">
                              {currentRole === 'student' ? 'Total Raised' : 'Total Donated'}
                            </Text>
                          </div>
                        </Card>
                      </Col>
                      
                      <Col xs={24} sm={12} md={8}>
                        <Card>
                          <div style={{ textAlign: 'center' }}>
                            <Title level={2} style={{ color: '#722ed1', marginBottom: 8 }}>
                              0
                            </Title>
                            <Text type="secondary">
                              Days Active
                            </Text>
                          </div>
                        </Card>
                      </Col>
                    </Row>
                    
                    <Card style={{ marginTop: 16 }}>
                      <Title level={5}>Recent Activity</Title>
                      <Paragraph style={{ color: '#666' }}>
                        Your recent activity will appear here once you start using the platform.
                    </Paragraph>
                    </Card>
                  </div>
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
} 
 
 