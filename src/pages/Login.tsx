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
  Space,
  Row,
  Col
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined,
  LoginOutlined,
  GoogleOutlined,
  GithubOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

const { Title, Text, Paragraph } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string>('');

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setError('');
      const success = await login(values.email, values.password);
      if (success) {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
          maxWidth: 400,
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
            Welcome Back
          </Title>
          <Paragraph style={{ color: '#666', margin: '8px 0 0 0' }}>
            Sign in to your EduFund account
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
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
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
              icon={<LoginOutlined />}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">or continue with</Text>
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Button
              icon={<GoogleOutlined />}
              style={{ 
                width: '100%',
                height: '40px',
                borderRadius: '8px'
              }}
              disabled
            >
              Google
            </Button>
          </Col>
          <Col span={12}>
            <Button
              icon={<GithubOutlined />}
              style={{ 
                width: '100%',
                height: '40px',
                borderRadius: '8px'
              }}
              disabled
            >
              GitHub
            </Button>
          </Col>
        </Row>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1890ff', fontWeight: 'bold' }}>
              Sign up here
            </Link>
          </Text>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/forgot-password" style={{ color: '#666', fontSize: '14px' }}>
            Forgot your password?
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login; 
 
 