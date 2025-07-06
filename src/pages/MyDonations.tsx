import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Avatar, 
  Progress, 
  Empty, 
  Spin,
  Tooltip,
  Modal,
  Image,
  Divider,
  Timeline,
  Badge
} from 'antd';
import { 
  HeartOutlined, 
  GiftOutlined, 
  EyeOutlined, 
  DownloadOutlined,
  TrophyOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  LinkOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { message } from 'antd';

const { Title, Paragraph, Text } = Typography;

interface Donation {
  _id: string;
  amount: number;
  message?: string;
  anonymous: boolean;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: string;
  project: {
    _id: string;
    title: string;
    category: string;
    student: {
      name: string;
      institution: string;
    };
  };
  blockchainTransaction?: {
    txHash: string;
    status: string;
  };
  receipt?: {
    receiptNumber: string;
    nftMetadata?: {
      image: string;
      name: string;
      description: string;
    };
  };
}

const MyDonations: React.FC = () => {
  const { user, token } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [nftModalVisible, setNftModalVisible] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, [token]);

  const fetchDonations = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.get('/donations/my-donations', token);
      if (response.success) {
        setDonations(response.data.donations);
      }
    } catch (error) {
      console.error('Failed to fetch donations:', error);
      message.error('Failed to load donation history');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'processing';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  const formatAmount = (amount: number) => {
    return (amount / 1_000_000).toFixed(2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const confirmedDonations = donations.filter(d => d.status === 'confirmed').length;
  const totalProjects = new Set(donations.map(d => d.project._id)).size;

  const columns = [
    {
      title: 'Project',
      key: 'project',
      render: (donation: Donation) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            size={40} 
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1890ff', marginRight: 12 }}
          />
          <div>
            <Text strong style={{ display: 'block' }}>{donation.project.title}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              by {donation.project.student.name}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Amount',
      key: 'amount',
      render: (donation: Donation) => (
        <div>
          <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
            {formatAmount(donation.amount)} ADA
          </Text>
          {donation.anonymous && (
            <Tag color="orange" style={{ marginLeft: 8 }}>Anonymous</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (donation: Donation) => (
        <Badge 
          status={getStatusColor(donation.status) as any}
          text={getStatusText(donation.status)}
        />
      ),
    },
    {
      title: 'Date',
      key: 'date',
      render: (donation: Donation) => (
        <div>
          <Text>{formatDate(donation.createdAt)}</Text>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (donation: Donation) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => setSelectedDonation(donation)}
            />
          </Tooltip>
          {donation.receipt?.nftMetadata && (
            <Tooltip title="View NFT Receipt">
              <Button 
                type="text" 
                icon={<GiftOutlined />} 
                onClick={() => {
                  setSelectedDonation(donation);
                  setNftModalVisible(true);
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <Paragraph style={{ marginTop: '16px' }}>Loading your donation history...</Paragraph>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', padding: '32px 0', background: '#f5f5f5' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Title level={1} style={{ marginBottom: 16 }}>
            <HeartOutlined style={{ marginRight: 12, color: '#ff4d4f' }} />
            My Donation History
          </Title>
          <Paragraph style={{ fontSize: '1.1rem', color: '#666' }}>
            Track all your contributions and NFT receipts
          </Paragraph>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={8}>
            <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
              <Statistic
                title="Total Donated"
                value={formatAmount(totalDonated)}
                suffix="ADA"
                valueStyle={{ color: '#52c41a', fontSize: '2rem' }}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
              <Statistic
                title="Projects Supported"
                value={totalProjects}
                suffix="projects"
                valueStyle={{ color: '#1890ff', fontSize: '2rem' }}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
              <Statistic
                title="Confirmed Donations"
                value={confirmedDonations}
                suffix={`/ ${donations.length}`}
                valueStyle={{ color: '#722ed1', fontSize: '2rem' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Donations Table */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <GiftOutlined style={{ marginRight: 8 }} />
              Donation History
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          {donations.length === 0 ? (
            <Empty
              description="No donations yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" href="/projects">
                Browse Projects
              </Button>
            </Empty>
          ) : (
            <Table
              dataSource={donations}
              columns={columns}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} donations`
              }}
              style={{ marginTop: 16 }}
            />
          )}
        </Card>

        {/* Donation Details Modal */}
        <Modal
          title="Donation Details"
          open={!!selectedDonation}
          onCancel={() => setSelectedDonation(null)}
          footer={null}
          width={600}
        >
          {selectedDonation && (
            <div>
              <Card size="small" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <Avatar 
                    size={48} 
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#1890ff', marginRight: 16 }}
                  />
                  <div>
                    <Title level={4} style={{ margin: 0 }}>{selectedDonation.project.title}</Title>
                    <Text type="secondary">by {selectedDonation.project.student.name}</Text>
                  </div>
                </div>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Amount"
                      value={formatAmount(selectedDonation.amount)}
                      suffix="ADA"
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Status"
                      value={getStatusText(selectedDonation.status)}
                      valueStyle={{ 
                        color: getStatusColor(selectedDonation.status) === 'success' ? '#52c41a' : 
                               getStatusColor(selectedDonation.status) === 'processing' ? '#fa8c16' : '#ff4d4f'
                      }}
                    />
                  </Col>
                </Row>

                {selectedDonation.message && (
                  <div style={{ marginTop: 16 }}>
                    <Text strong>Message:</Text>
                    <Paragraph style={{ margin: '8px 0 0 0', fontStyle: 'italic' }}>
                      "{selectedDonation.message}"
                    </Paragraph>
                  </div>
                )}

                <Timeline style={{ marginTop: 16 }}>
                  <Timeline.Item dot={<CalendarOutlined style={{ color: '#1890ff' }} />}>
                    <Text>Donation made on {formatDate(selectedDonation.createdAt)}</Text>
                  </Timeline.Item>
                  {selectedDonation.blockchainTransaction && (
                    <Timeline.Item dot={<CheckCircleOutlined style={{ color: '#52c41a' }} />}>
                      <div>
                        <Text>Transaction confirmed</Text>
                        <div style={{ marginTop: 4 }}>
                          <Text code style={{ fontSize: '12px' }}>
                            {selectedDonation.blockchainTransaction.txHash}
                          </Text>
                          <Button 
                            type="text" 
                            size="small" 
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard(selectedDonation.blockchainTransaction!.txHash)}
                          />
                        </div>
                      </div>
                    </Timeline.Item>
                  )}
                  {selectedDonation.receipt && (
                    <Timeline.Item dot={<GiftOutlined style={{ color: '#722ed1' }} />}>
                      <Text>NFT receipt generated</Text>
                    </Timeline.Item>
                  )}
                </Timeline>
              </Card>

              {selectedDonation.blockchainTransaction && (
                <Card size="small" title="Blockchain Transaction" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>Transaction Hash:</Text>
                    <Button 
                      type="link" 
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(selectedDonation.blockchainTransaction!.txHash)}
                    >
                      Copy
                    </Button>
                  </div>
                  <Text code style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                    {selectedDonation.blockchainTransaction.txHash}
                  </Text>
                </Card>
              )}
            </div>
          )}
        </Modal>

        {/* NFT Receipt Modal */}
        <Modal
          title="NFT Receipt"
          open={nftModalVisible}
          onCancel={() => setNftModalVisible(false)}
          footer={null}
          width={500}
        >
          {selectedDonation?.receipt?.nftMetadata && (
            <div style={{ textAlign: 'center' }}>
              <Image
                src={selectedDonation.receipt.nftMetadata.image}
                alt="NFT Receipt"
                style={{ borderRadius: '12px', marginBottom: 16 }}
              />
              <Title level={4}>{selectedDonation.receipt.nftMetadata.name}</Title>
              <Paragraph>{selectedDonation.receipt.nftMetadata.description}</Paragraph>
              <Divider />
              <Space>
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    // Download NFT image
                    const link = document.createElement('a');
                    link.href = selectedDonation.receipt.nftMetadata.image;
                    link.download = `donation-receipt-${selectedDonation.receipt.receiptNumber}.png`;
                    link.click();
                  }}
                >
                  Download NFT
                </Button>
                <Button 
                  icon={<LinkOutlined />}
                  onClick={() => {
                    // View on blockchain explorer
                    const txHash = selectedDonation.blockchainTransaction?.txHash;
                    if (txHash) {
                      window.open(`https://preprod.cardanoscan.io/transaction/${txHash}`, '_blank');
                    }
                  }}
                >
                  View on Explorer
                </Button>
              </Space>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MyDonations; 
 
 