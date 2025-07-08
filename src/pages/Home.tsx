import { Typography, Button, Card, Row, Col, Statistic, Steps, Avatar, Divider } from 'antd';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardStats } from '../hooks/useDashboard';
import { 
  HeartOutlined, 
  BookOutlined, 
  GlobalOutlined, 
  TrophyOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  TeamOutlined,
  SafetyOutlined,
  GiftOutlined,
  StarOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useDashboardStats();
  const stats = data?.data;

  const features = [
    {
      icon: <BookOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
      title: 'Student Projects',
      description: 'Browse innovative research projects from Sri Lankan students across various fields.'
    },
    {
      icon: <HeartOutlined style={{ fontSize: 32, color: '#f5222d' }} />,
      title: 'Global Donations',
      description: 'Support students worldwide using Cardano blockchain for secure, transparent donations.'
    },
    {
      icon: <GiftOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      title: 'NFT Receipts',
      description: 'Receive unique NFT receipts for every donation as proof of your contribution.'
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      title: 'Blockchain Security',
      description: 'All transactions are secured on the Cardano blockchain with full transparency.'
    }
  ];

  const steps = [
    {
      title: 'Connect Wallet',
      description: 'Connect your Cardano wallet (Eternl, Nami, etc.)',
      icon: <GlobalOutlined />
    },
    {
      title: 'Browse Projects',
      description: 'Explore student research projects from Sri Lanka',
      icon: <BookOutlined />
    },
    {
      title: 'Make Donation',
      description: 'Donate ADA to support promising research',
      icon: <HeartOutlined />
    },
    {
      title: 'Get NFT Receipt',
      description: 'Receive a unique NFT as proof of your donation',
      icon: <GiftOutlined />
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Research Donor',
      content: 'EduFund has made it incredibly easy to support promising research from Sri Lankan students. The transparency and NFT receipts give me confidence in my contributions.',
      avatar: 'SJ'
    },
    {
      name: 'Kumara Perera',
      role: 'Student Researcher',
      content: 'Thanks to EduFund, I was able to secure funding for my renewable energy research. The platform connected me with donors who believe in my vision.',
      avatar: 'KP'
    },
    {
      name: 'Michael Chen',
      role: 'Blockchain Enthusiast',
      content: 'I love how EduFund leverages Cardano blockchain for transparency. The NFT receipts are a brilliant touch that makes every donation memorable.',
      avatar: 'MC'
    }
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 0 60px',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Title level={1} style={{ color: 'white', marginBottom: 16, fontSize: '3.5rem' }}>
            Empowering Sri Lankan Students
          </Title>
          <Paragraph style={{ 
            fontSize: '1.25rem', 
            color: 'rgba(255,255,255,0.9)', 
            marginBottom: 32,
            maxWidth: 600,
            margin: '0 auto 32px'
          }}>
            Connect your Cardano wallet and support innovative research projects from talented Sri Lankan students. 
            Every donation makes a difference in advancing education and research.
          </Paragraph>
          
          <Row gutter={[16, 16]} justify="center">
            <Col>
              <Button type="primary" size="large" style={{ 
                background: 'rgba(255,255,255,0.2)', 
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white',
                height: 48,
                padding: '0 32px'
              }}>
                <Link to="/projects" style={{ color: 'white' }}>Browse Projects</Link>
              </Button>
            </Col>
            <Col>
              <Button size="large" style={{ 
                background: 'rgba(255,255,255,0.1)', 
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white',
                height: 48,
                padding: '0 32px'
              }}>
                <Link to="/about" style={{ color: 'white' }}>Learn More</Link>
              </Button>
            </Col>
          </Row>
        </div>
      </div>

      {/* Statistics Section */}
      <div style={{ padding: '60px 0', background: '#f8f9fa' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} sm={12} md={6}>
              <Card style={{ textAlign: 'center', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Statistic
                  title="Projects Funded"
                  value={isLoading ? '...' : stats?.fundedProjects ?? 0}
                  suffix="+"
                  valueStyle={{ color: '#1890ff', fontSize: '2rem' }}
                  prefix={<TrophyOutlined style={{ color: '#1890ff' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ textAlign: 'center', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Statistic
                  title="Total Donations"
                  value={isLoading ? '...' : stats?.totalAmount ? (stats.totalAmount / 1_000_000).toFixed(2) : 0}
                  suffix="ADA"
                  valueStyle={{ color: '#52c41a', fontSize: '2rem' }}
                  prefix={<HeartOutlined style={{ color: '#52c41a' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ textAlign: 'center', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Statistic
                  title="Active Donors"
                  value={isLoading ? '...' : stats?.totalDonors ?? 0}
                  suffix="+"
                  valueStyle={{ color: '#722ed1', fontSize: '2rem' }}
                  prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ textAlign: 'center', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Statistic
                  title="Success Rate"
                  value={isLoading ? '...' : stats?.successRate ?? 0}
                  suffix="%"
                  valueStyle={{ color: '#fa8c16', fontSize: '2rem' }}
                  prefix={<CheckCircleOutlined style={{ color: '#fa8c16' }} />}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <Title level={2} style={{ marginBottom: 16 }}>Why Choose EduFund?</Title>
            <Paragraph style={{ fontSize: '1.1rem', color: '#666', maxWidth: 600, margin: '0 auto' }}>
              We're revolutionizing how students get funded and how donors support education through blockchain technology.
            </Paragraph>
          </div>
          
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card 
                  style={{ 
                    textAlign: 'center', 
                    height: '100%',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease'
                  }}
                  hoverable
                >
                  <div style={{ marginBottom: 16 }}>
                    {feature.icon}
                  </div>
                  <Title level={4} style={{ marginBottom: 12 }}>{feature.title}</Title>
                  <Paragraph style={{ color: '#666' }}>{feature.description}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* How It Works Section */}
      <div style={{ padding: '80px 0', background: '#f8f9fa' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <Title level={2} style={{ marginBottom: 16 }}>How It Works</Title>
            <Paragraph style={{ fontSize: '1.1rem', color: '#666', maxWidth: 600, margin: '0 auto' }}>
              Getting started with EduFund is simple and secure. Follow these steps to make your first donation.
            </Paragraph>
          </div>
          
          <Steps
            direction="horizontal"
            current={-1}
            style={{ maxWidth: 800, margin: '0 auto' }}
            items={steps.map((step, index) => ({
              title: step.title,
              description: step.description,
              icon: step.icon
            }))}
          />
        </div>
      </div>

      {/* Testimonials Section */}
      <div style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <Title level={2} style={{ marginBottom: 16 }}>What People Say</Title>
            <Paragraph style={{ fontSize: '1.1rem', color: '#666', maxWidth: 600, margin: '0 auto' }}>
              Hear from donors and students who have experienced the power of EduFund.
            </Paragraph>
          </div>
          
          <Row gutter={[32, 32]}>
            {testimonials.map((testimonial, index) => (
              <Col xs={24} md={8} key={index}>
                <Card style={{ 
                  height: '100%',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <Avatar size={48} style={{ backgroundColor: '#1890ff', marginRight: 12 }}>
                      {testimonial.avatar}
                    </Avatar>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{testimonial.name}</div>
                      <div style={{ color: '#666', fontSize: '0.9rem' }}>{testimonial.role}</div>
                    </div>
                  </div>
                  <Paragraph style={{ color: '#666', fontStyle: 'italic' }}>
                    "{testimonial.content}"
                  </Paragraph>
                  <div style={{ textAlign: 'right' }}>
                    <StarOutlined style={{ color: '#faad14' }} />
                    <StarOutlined style={{ color: '#faad14' }} />
                    <StarOutlined style={{ color: '#faad14' }} />
                    <StarOutlined style={{ color: '#faad14' }} />
                    <StarOutlined style={{ color: '#faad14' }} />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Call to Action Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 0',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          <Title level={2} style={{ color: 'white', marginBottom: 16 }}>
            Ready to Make a Difference?
          </Title>
          <Paragraph style={{ 
            fontSize: '1.1rem', 
            color: 'rgba(255,255,255,0.9)', 
            marginBottom: 32 
          }}>
            Join our community of donors and help shape the future of education in Sri Lanka. 
            Every donation, no matter how small, makes a real impact.
          </Paragraph>
          
          <Row gutter={[16, 16]} justify="center">
            <Col>
              <Button type="primary" size="large" style={{ 
                background: 'rgba(255,255,255,0.2)', 
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white',
                height: 48,
                padding: '0 32px'
              }}>
                <Link to="/projects" style={{ color: 'white' }}>
                  <RocketOutlined style={{ marginRight: 8 }} />
                  Start Donating
                </Link>
              </Button>
            </Col>
            {/* Only show Create Project for authenticated users */}
            {isAuthenticated && (
              <Col>
                <Button size="large" style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  height: 48,
                  padding: '0 32px'
                }}>
                  <Link to="/create-project" style={{ color: 'white' }}>
                    <BookOutlined style={{ marginRight: 8 }} />
                    Create Project
                  </Link>
                </Button>
              </Col>
            )}
          </Row>
        </div>
      </div>
    </div>
  );
}
