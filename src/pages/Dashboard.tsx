import { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Progress, Button, Table, Tag } from 'antd';
import { 
  DollarOutlined, 
  UserOutlined, 
  ProjectOutlined, 
  TrophyOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMyProjects } from '../hooks/useProjects';
import { useMyDonations } from '../hooks/useDonations';
import WalletConnect from '../components/WalletConnect';

const { Title, Paragraph } = Typography;

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { data: projectsData } = useMyProjects();
  const { data: donationsData } = useMyDonations();
  
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalRaised: 0,
    totalDonations: 0,
    recentActivity: []
  });

  useEffect(() => {
    if (projectsData?.data?.projects) {
      const projects = projectsData.data.projects;
      const totalRaised = projects.reduce((sum, p) => sum + p.currentFunding, 0);
      
      setStats({
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        totalRaised,
        totalDonations: donationsData?.data?.donations?.length || 0,
        recentActivity: projects.slice(0, 5)
      });
    }
  }, [projectsData, donationsData]);

  const projectColumns = [
    {
      title: 'Project',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Link to={`/projects/${record.id}`} style={{ color: '#1890ff' }}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => {
        const percent = Math.min((record.currentFunding / record.fundingGoal) * 100, 100);
        return (
          <div>
            <Progress percent={percent} size="small" />
            <div style={{ fontSize: 12, color: '#666' }}>
              {(record.currentFunding / 1_000_000).toFixed(1)} / {(record.fundingGoal / 1_000_000).toFixed(1)} ADA
            </div>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          active: 'green',
          pending: 'orange',
          funded: 'blue',
          expired: 'red'
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />}>
          <Link to={`/projects/${record.id}`}>View</Link>
        </Button>
      ),
    },
  ];

  // If not authenticated, show wallet connect prompt
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '80vh', padding: '32px 0' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: 32 }}>Welcome to EduFund Dashboard</Title>
          <Paragraph style={{ fontSize: 16, color: '#666', marginBottom: 32 }}>
            Connect your Cardano wallet to access your personalized dashboard and manage your projects and donations.
          </Paragraph>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <WalletConnect />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', padding: '32px 0' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        Welcome back, {user?.name || 'User'}!
      </Title>
      
      {/* Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={stats.totalProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Projects"
              value={stats.activeProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Raised"
              value={(stats.totalRaised / 1_000_000).toFixed(1)}
              suffix="ADA"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Donations"
              value={stats.totalDonations}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col span={24}>
          <Card title="Quick Actions">
            <Row gutter={[16, 16]}>
              <Col>
                <Button type="primary" icon={<ProjectOutlined />} size="large">
                  <Link to="/create-project" style={{ color: '#fff' }}>Create New Project</Link>
                </Button>
              </Col>
              <Col>
                <Button icon={<EyeOutlined />} size="large">
                  <Link to="/projects">Browse Projects</Link>
                </Button>
              </Col>
              <Col>
                <Button icon={<TrophyOutlined />} size="large">
                  <Link to="/leaderboard">View Leaderboard</Link>
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Recent Projects */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Recent Projects" extra={<Link to="/my-projects">View All</Link>}>
            <Table
              columns={projectColumns}
              dataSource={stats.recentActivity}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="Platform Statistics">
            <div style={{ marginBottom: 24 }}>
              <Paragraph>Total Projects Funded</Paragraph>
              <Statistic value={156} suffix="projects" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <Paragraph>Total Amount Raised</Paragraph>
              <Statistic value={1250.5} suffix="ADA" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <Paragraph>Active Donors</Paragraph>
              <Statistic value={89} suffix="donors" />
            </div>
            <div>
              <Paragraph>Success Rate</Paragraph>
              <Statistic value={78.5} suffix="%" />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import { 
  Diamond, 
  CircleDollarSign, 
  FlaskConical, 
  Calendar,
  ExternalLink,
  Download,
  Wallet,
  DiamondPercent,
  GraduationCap
} from 'lucide-react';

const Dashboard = () => {
  const [walletConnected] = useState(true); // Mock wallet connection state

  // Mock user data
  const userStats = {
    totalDonated: 2850,
    projectsSupported: 12,
    nftsOwned: 15,
    rank: 'Gold Supporter'
  };

  const nftReceipts = [
    {
      id: '1',
      projectTitle: 'AI-Powered Medical Diagnosis for Rural Areas',
      donationAmount: 500,
      date: '2024-06-25',
      transactionHash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
      nftImage: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop',
      status: 'Minted',
      category: 'AI'
    },
    {
      id: '2',
      projectTitle: 'Sustainable Energy Storage Research',
      donationAmount: 750,
      date: '2024-06-20',
      transactionHash: '0x8f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91386',
      nftImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=200&fit=crop',
      status: 'Minted',
      category: 'Technology'
    },
    {
      id: '3',
      projectTitle: 'Quantum Computing Algorithms for Drug Discovery',
      donationAmount: 1200,
      date: '2024-06-15',
      transactionHash: '0x9f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91387',
      nftImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&h=200&fit=crop',
      status: 'Minted',
      category: 'Health'
    },
    {
      id: '4',
      projectTitle: 'Climate Change Impact on Marine Ecosystems',
      donationAmount: 400,
      date: '2024-06-10',
      transactionHash: '0xaf9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91388',
      nftImage: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=200&h=200&fit=crop',
      status: 'Pending',
      category: 'Environment'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ai':
      case 'technology':
        return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
      case 'health':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'environment':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const shortenHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-web3-gradient">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center">
                <Wallet className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
              <p className="text-xl text-gray-300 mb-8 max-w-md">
                Connect your Cardano wallet to view your donation history and NFT receipts.
              </p>
              <Button className="web3-button text-lg px-8 py-4">
                <Wallet className="h-5 w-5 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-web3-gradient">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Donor Dashboard
            </h1>
            <p className="text-xl text-gray-300">
              Track your contributions and manage your NFT collection
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card p-6 text-center">
              <CircleDollarSign className="h-8 w-8 mx-auto mb-3 text-cyan-400" />
              <div className="text-3xl font-bold text-white mb-1">{userStats.totalDonated.toLocaleString()}</div>
              <div className="text-sm text-gray-400">ADA Donated</div>
            </Card>

            <Card className="glass-card p-6 text-center">
              <FlaskConical className="h-8 w-8 mx-auto mb-3 text-violet-400" />
              <div className="text-3xl font-bold text-white mb-1">{userStats.projectsSupported}</div>
              <div className="text-sm text-gray-400">Projects Supported</div>
            </Card>

            <Card className="glass-card p-6 text-center">
              <Diamond className="h-8 w-8 mx-auto mb-3 text-cyan-400" />
              <div className="text-3xl font-bold text-white mb-1">{userStats.nftsOwned}</div>
              <div className="text-sm text-gray-400">NFTs Owned</div>
            </Card>

            <Card className="glass-card p-6 text-center">
              <GraduationCap className="h-8 w-8 mx-auto mb-3 text-violet-400" />
              <div className="text-lg font-bold text-white mb-1">{userStats.rank}</div>
              <div className="text-sm text-gray-400">Supporter Rank</div>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="nfts" className="space-y-6">
            <TabsList className="bg-midnight-800/50 border border-white/20">
              <TabsTrigger value="nfts" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                NFT Collection
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                Donation History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nfts" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Your NFT Receipts</h2>
                <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                  <Download className="h-4 w-4 mr-2" />
                  Export Collection
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nftReceipts.map((nft) => (
                  <Card key={nft.id} className="glass-card p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="relative mb-4">
                      <img 
                        src={nft.nftImage} 
                        alt={nft.projectTitle}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className={getCategoryColor(nft.category)}>
                          {nft.category}
                        </Badge>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <Badge className={nft.status === 'Minted' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }>
                          {nft.status}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="font-semibold text-white mb-2 line-clamp-2">{nft.projectTitle}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Donation:</span>
                        <span className="text-cyan-400 font-medium">{nft.donationAmount} ADA</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Date:</span>
                        <span className="text-white">{nft.date}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">TX Hash:</span>
                        <span className="text-white">{shortenHash(nft.transactionHash)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 border-violet-500 text-violet-400 hover:bg-violet-500/10">
                        <DiamondPercent className="h-3 w-3 mr-1" />
                        View NFT
                      </Button>
                      <Button variant="outline" size="sm" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Donation History</h2>
                <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <Card className="glass-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 text-gray-400 font-medium">Project</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nftReceipts.map((donation) => (
                        <tr key={donation.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={donation.nftImage} 
                                alt={donation.projectTitle}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div>
                                <div className="text-white font-medium line-clamp-1">{donation.projectTitle}</div>
                                <Badge className={`${getCategoryColor(donation.category)} text-xs`}>
                                  {donation.category}
                                </Badge>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-cyan-400 font-semibold">{donation.donationAmount} ADA</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center text-gray-300">
                              <Calendar className="h-4 w-4 mr-1" />
                              {donation.date}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={donation.status === 'Minted' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            }>
                              {donation.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="border-violet-500 text-violet-400 hover:bg-violet-500/10">
                                View Receipt
                              </Button>
                              <Button variant="outline" size="sm" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import { 
  Diamond, 
  CircleDollarSign, 
  FlaskConical, 
  Calendar,
  ExternalLink,
  Download,
  Wallet,
  DiamondPercent,
  GraduationCap
} from 'lucide-react';

const Dashboard = () => {
  const [walletConnected] = useState(true); // Mock wallet connection state

  // Mock user data
  const userStats = {
    totalDonated: 2850,
    projectsSupported: 12,
    nftsOwned: 15,
    rank: 'Gold Supporter'
  };

  const nftReceipts = [
    {
      id: '1',
      projectTitle: 'AI-Powered Medical Diagnosis for Rural Areas',
      donationAmount: 500,
      date: '2024-06-25',
      transactionHash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
      nftImage: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop',
      status: 'Minted',
      category: 'AI'
    },
    {
      id: '2',
      projectTitle: 'Sustainable Energy Storage Research',
      donationAmount: 750,
      date: '2024-06-20',
      transactionHash: '0x8f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91386',
      nftImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=200&fit=crop',
      status: 'Minted',
      category: 'Technology'
    },
    {
      id: '3',
      projectTitle: 'Quantum Computing Algorithms for Drug Discovery',
      donationAmount: 1200,
      date: '2024-06-15',
      transactionHash: '0x9f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91387',
      nftImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&h=200&fit=crop',
      status: 'Minted',
      category: 'Health'
    },
    {
      id: '4',
      projectTitle: 'Climate Change Impact on Marine Ecosystems',
      donationAmount: 400,
      date: '2024-06-10',
      transactionHash: '0xaf9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91388',
      nftImage: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=200&h=200&fit=crop',
      status: 'Pending',
      category: 'Environment'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ai':
      case 'technology':
        return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
      case 'health':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'environment':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const shortenHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-web3-gradient">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center">
                <Wallet className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
              <p className="text-xl text-gray-300 mb-8 max-w-md">
                Connect your Cardano wallet to view your donation history and NFT receipts.
              </p>
              <Button className="web3-button text-lg px-8 py-4">
                <Wallet className="h-5 w-5 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-web3-gradient">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Donor Dashboard
            </h1>
            <p className="text-xl text-gray-300">
              Track your contributions and manage your NFT collection
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card p-6 text-center">
              <CircleDollarSign className="h-8 w-8 mx-auto mb-3 text-cyan-400" />
              <div className="text-3xl font-bold text-white mb-1">{userStats.totalDonated.toLocaleString()}</div>
              <div className="text-sm text-gray-400">ADA Donated</div>
            </Card>

            <Card className="glass-card p-6 text-center">
              <FlaskConical className="h-8 w-8 mx-auto mb-3 text-violet-400" />
              <div className="text-3xl font-bold text-white mb-1">{userStats.projectsSupported}</div>
              <div className="text-sm text-gray-400">Projects Supported</div>
            </Card>

            <Card className="glass-card p-6 text-center">
              <Diamond className="h-8 w-8 mx-auto mb-3 text-cyan-400" />
              <div className="text-3xl font-bold text-white mb-1">{userStats.nftsOwned}</div>
              <div className="text-sm text-gray-400">NFTs Owned</div>
            </Card>

            <Card className="glass-card p-6 text-center">
              <GraduationCap className="h-8 w-8 mx-auto mb-3 text-violet-400" />
              <div className="text-lg font-bold text-white mb-1">{userStats.rank}</div>
              <div className="text-sm text-gray-400">Supporter Rank</div>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="nfts" className="space-y-6">
            <TabsList className="bg-midnight-800/50 border border-white/20">
              <TabsTrigger value="nfts" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                NFT Collection
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                Donation History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nfts" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Your NFT Receipts</h2>
                <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                  <Download className="h-4 w-4 mr-2" />
                  Export Collection
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nftReceipts.map((nft) => (
                  <Card key={nft.id} className="glass-card p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="relative mb-4">
                      <img 
                        src={nft.nftImage} 
                        alt={nft.projectTitle}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className={getCategoryColor(nft.category)}>
                          {nft.category}
                        </Badge>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <Badge className={nft.status === 'Minted' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }>
                          {nft.status}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="font-semibold text-white mb-2 line-clamp-2">{nft.projectTitle}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Donation:</span>
                        <span className="text-cyan-400 font-medium">{nft.donationAmount} ADA</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Date:</span>
                        <span className="text-white">{nft.date}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">TX Hash:</span>
                        <span className="text-white">{shortenHash(nft.transactionHash)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 border-violet-500 text-violet-400 hover:bg-violet-500/10">
                        <DiamondPercent className="h-3 w-3 mr-1" />
                        View NFT
                      </Button>
                      <Button variant="outline" size="sm" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Donation History</h2>
                <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <Card className="glass-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 text-gray-400 font-medium">Project</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nftReceipts.map((donation) => (
                        <tr key={donation.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={donation.nftImage} 
                                alt={donation.projectTitle}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div>
                                <div className="text-white font-medium line-clamp-1">{donation.projectTitle}</div>
                                <Badge className={`${getCategoryColor(donation.category)} text-xs`}>
                                  {donation.category}
                                </Badge>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-cyan-400 font-semibold">{donation.donationAmount} ADA</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center text-gray-300">
                              <Calendar className="h-4 w-4 mr-1" />
                              {donation.date}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={donation.status === 'Minted' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            }>
                              {donation.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="border-violet-500 text-violet-400 hover:bg-violet-500/10">
                                View Receipt
                              </Button>
                              <Button variant="outline" size="sm" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
