import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Divider, 
  Alert, 
  Radio,
  Row,
  Col,
  Select
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined,
  UserAddOutlined,
  BankOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [error, setError] = useState<string>('');
  const [role, setRole] = useState<'student' | 'donor'>('donor');

  const onFinish = async (values: any) => {
    try {
      setError('');
      
      const userData = {
        displayName: values.displayName,
        email: values.email,
        password: values.password,
        role: role,
        walletAddress: values.walletAddress || undefined,
        institution: values.institution || undefined,
        researchField: values.researchField || undefined
      };

      const success = await register(userData);
      if (success) {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 500,
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: 'none'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img 
            src={logo} 
            alt="EduFund" 
            style={{ 
              height: '60px', 
              marginBottom: '16px',
              borderRadius: '12px'
            }} 
          />
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            Join EduFund
          </Title>
          <Paragraph style={{ color: '#666', margin: '8px 0 0 0' }}>
            Create your account to start supporting education
          </Paragraph>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="displayName"
            rules={[
              { required: true, message: 'Please enter your full name!' },
              { min: 2, message: 'Name must be at least 2 characters!' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Full name"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Email address"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Password"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Confirm password"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="walletAddress"
            rules={[
              { 
                pattern: /^addr_[a-zA-Z0-9]+$/, 
                message: 'Please enter a valid Cardano address!' 
              }
            ]}
          >
            <Input
              placeholder="Cardano wallet address (optional)"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item label="Account Type">
            <Radio.Group 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%' }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Radio.Button 
                    value="donor" 
                    style={{ 
                      width: '100%', 
                      textAlign: 'center',
                      height: '48px',
                      lineHeight: '48px',
                      borderRadius: '8px'
                    }}
                  >
                    <HeartOutlined style={{ marginRight: 8 }} />
                    Donor
                  </Radio.Button>
                </Col>
                <Col span={12}>
                  <Radio.Button 
                    value="student" 
                    style={{ 
                      width: '100%', 
                      textAlign: 'center',
                      height: '48px',
                      lineHeight: '48px',
                      borderRadius: '8px'
                    }}
                  >
                    <BankOutlined style={{ marginRight: 8 }} />
                    Student
                  </Radio.Button>
                </Col>
              </Row>
            </Radio.Group>
          </Form.Item>

          {role === 'student' && (
            <>
              <Form.Item
                name="institution"
                rules={[
                  { required: true, message: 'Please enter your institution!' }
                ]}
              >
                <Input
                  placeholder="University/Institution name"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item
                name="researchField"
                rules={[
                  { required: true, message: 'Please select your research field!' }
                ]}
              >
                <Select
                  placeholder="Select research field"
                  style={{ borderRadius: '8px' }}
                >
                  <Option value="Computer Science">Computer Science</Option>
                  <Option value="Engineering">Engineering</Option>
                  <Option value="Medicine">Medicine</Option>
                  <Option value="Business">Business</Option>
                  <Option value="Arts">Arts</Option>
                  <Option value="Social Sciences">Social Sciences</Option>
                  <Option value="Natural Sciences">Natural Sciences</Option>
                  <Option value="Education">Education</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{ 
                width: '100%',
                height: '48px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                border: 'none',
                fontSize: '16px'
              }}
              icon={<UserAddOutlined />}
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1890ff', fontWeight: 'bold' }}>
              Sign in here
            </Link>
          </Text>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            By creating an account, you agree to our{' '}
            <Link to="/terms" style={{ color: '#1890ff' }}>Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" style={{ color: '#1890ff' }}>Privacy Policy</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Register; 
 
 