import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyProjects } from '../hooks/useProjects';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Eye, 
  Calendar, 
  Target, 
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  FileText,
  Settings,
  Trash2,
  CheckCircle,
  AlertCircle,
  Pause
} from 'lucide-react';
import { Typography, Row, Col, Tag } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const MyProjects: React.FC = () => {
  const { user } = useAuth();
  const { data: projectsData, isLoading } = useMyProjects();
  const projects = projectsData?.data?.projects || [];
  const [activeTab, setActiveTab] = useState('all');

  // Filter projects by status
  const getFilteredProjects = () => {
    switch (activeTab) {
      case 'active':
        return projects.filter(p => p.status === 'active');
      case 'pending':
        return projects.filter(p => p.status === 'pending');
      case 'funded':
        return projects.filter(p => p.status === 'funded');
      case 'expired':
        return projects.filter(p => p.status === 'expired');
      case 'draft':
        return projects.filter(p => p.status === 'draft');
      default:
        return projects;
    }
  };

  const filteredProjects = getFilteredProjects();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'funded':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'draft':
        return <Pause className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'funded':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Calculate stats
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    funded: projects.filter(p => p.status === 'funded').length,
    pending: projects.filter(p => p.status === 'pending').length,
    totalRaised: projects.reduce((sum, p) => sum + p.currentFunding, 0),
    totalGoal: projects.reduce((sum, p) => sum + p.fundingGoal, 0),
    totalBackers: projects.reduce((sum, p) => sum + p.backersCount, 0)
  };

  return (
    <div style={{ minHeight: '80vh', padding: '32px 0' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>My Projects</Title>
      <Paragraph style={{ textAlign: 'center', color: '#555', marginBottom: 32 }}>
        Manage and track your research projects
      </Paragraph>
      <div style={{ textAlign: 'right', marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} size="large">
          <Link to="/create-project" style={{ color: '#fff' }}>Create New Project</Link>
        </Button>
      </div>
      <Row gutter={[24, 24]} justify="center">
        {isLoading ? (
          <Col span={24} style={{ textAlign: 'center' }}>
            <Paragraph>Loading projects...</Paragraph>
          </Col>
        ) : projects.length === 0 ? (
          <Col span={24} style={{ textAlign: 'center' }}>
            <Paragraph>No projects yet. Start your research journey by creating your first project.</Paragraph>
          </Col>
        ) : (
          projects.map(project => (
            <Col xs={24} sm={12} md={8} lg={6} key={project.id}>
              <Card
                hoverable
                style={{ minHeight: 280 }}
                title={<Link to={`/projects/${project.id}`}>{project.title}</Link>}
                extra={<Tag color="magenta">{project.category}</Tag>}
              >
                <Paragraph ellipsis={{ rows: 2 }}>{project.description}</Paragraph>
                <div style={{ margin: '16px 0' }}>
                  <Progress
                    percent={Math.min((project.currentFunding / project.fundingGoal) * 100, 100)}
                    size="small"
                    status={project.currentFunding >= project.fundingGoal ? 'success' : 'active'}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888' }}>
                    <span>{(project.currentFunding / 1_000_000).toFixed(1)} / {(project.fundingGoal / 1_000_000).toFixed(1)} ADA</span>
                    <span>{project.status}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button icon={<EyeOutlined />}>
                    <Link to={`/projects/${project.id}`}>View</Link>
                  </Button>
                  <Button icon={<EditOutlined />}>
                    <Link to={`/projects/${project.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </div>
  );
};

export default MyProjects; 
 
 