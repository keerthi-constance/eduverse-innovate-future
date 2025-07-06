import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects, useSearchProjects, useMyProjects } from '../hooks/useProjects';
import { useAuth } from '../contexts/AuthContext';
import { Card, Row, Col, Typography, Tag, Progress, Button, Input, Select } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;

export default function Projects() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');

  // Fetch all projects
  const { data: projectsData, isLoading: projectsLoading } = useProjects({
    category: category === 'all' ? undefined : category,
  });

  // Fetch search results
  const { data: searchData, isLoading: searchLoading } = useSearchProjects(
    searchQuery,
    { category: category === 'all' ? undefined : category }
  );

  const isLoading = projectsLoading || searchLoading;
  const projects = searchQuery ? searchData?.data?.projects || [] : projectsData?.data?.projects || [];

  const categories = [
    'Artificial Intelligence',
    'Biotechnology',
    'Climate Science',
    'Computer Science',
    'Environmental Science',
    'Health & Medicine',
    'Materials Science',
    'Physics',
    'Space Science',
    'Other'
  ];

  return (
    <div style={{ minHeight: '80vh', padding: '32px 0' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>Discover Amazing Research Projects</Title>
      <Paragraph style={{ textAlign: 'center', fontSize: 18, color: '#555', marginBottom: 32 }}>
        Support innovative research from talented students across Sri Lanka. Every contribution helps bring groundbreaking ideas to life.
      </Paragraph>
      <Row gutter={16} justify="center" style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={8}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search projects..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            allowClear
            size="large"
          />
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Select
            value={category}
            onChange={setCategory}
            size="large"
            style={{ width: '100%' }}
          >
            <Option value="all">All Categories</Option>
            {categories.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
        </Col>
        {user?.role === 'student' && (
          <Col xs={24} sm={8} md={6} style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} size="large">
              <Link to="/create-project" style={{ color: '#fff' }}>Create Project</Link>
            </Button>
          </Col>
        )}
      </Row>
      <Row gutter={[24, 24]} justify="center">
        {isLoading ? (
          <Col span={24} style={{ textAlign: 'center' }}>
            <Paragraph>Loading projects...</Paragraph>
          </Col>
        ) : projects.length === 0 ? (
          <Col span={24} style={{ textAlign: 'center' }}>
            <Paragraph>No projects found.</Paragraph>
          </Col>
        ) : (
          projects.map(project => (
            <Col xs={24} sm={12} md={8} lg={6} key={project.id}>
              <Card
                hoverable
                style={{ marginBottom: 16, minHeight: 320 }}
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
                    <span>{project.student?.institution}</span>
                  </div>
                </div>
                <Button type="primary" block>
                  <Link to={`/projects/${project.id}`} style={{ color: '#fff' }}>View Details</Link>
                </Button>
                <Button type="default" block style={{ marginTop: 8 }}>
                  <Link to={`/donate/${project.id}`} style={{ color: '#1890ff' }}>Donate Now</Link>
                </Button>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </div>
  );
} 
 
 