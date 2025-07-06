import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useAuth } from '../contexts/AuthContext';
import { Card, Typography, Tag, Progress, Button, Row, Col, Modal, Space, Spin } from 'antd';

const { Title, Paragraph, Text } = Typography;

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Debug logging
  console.log('ProjectDetail - Debug:', { projectId, user: user?.id });

  // Handle navigation in useEffect instead of during render
  useEffect(() => {
    if (!projectId) {
    navigate('/projects');
    }
  }, [projectId, navigate]);

  // Return early if no projectId
  if (!projectId) {
    return null;
  }

  const { data, isLoading, isError } = useProject(projectId);
  const project = data?.data?.project || data?.project || data;
  const isOwner = user && project && user.id === project.student?.id;
  
  // Debug logging
  console.log('ProjectDetail - Data:', { 
    data, 
    project, 
    isLoading, 
    isError,
    isOwner,
    userId: user?.id,
    projectStudentId: project?.student?.id
  });

  const progress = project ? (project.currentFunding / project.fundingGoal) * 100 : 0;
  const daysLeft = project ? Math.max(0, Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

  if (isLoading) return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <Spin size="large" />
      <Paragraph style={{ marginTop: '16px' }}>Loading project details...</Paragraph>
    </div>
  );
  
  if (isError || !project) return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <Paragraph>Project not found or error loading project.</Paragraph>
      <Paragraph type="secondary">Project ID: {projectId}</Paragraph>
      <Paragraph type="secondary">Error: {isError ? 'API Error' : 'No project data'}</Paragraph>
      <Button type="primary" onClick={() => navigate('/projects')} style={{ marginTop: '16px' }}>
        Back to Projects
      </Button>
    </div>
  );

  return (
    <Row justify="center" style={{ minHeight: '80vh', padding: '32px 0' }}>
      <Col xs={24} md={18} lg={14}>
        <Card style={{ marginBottom: 24 }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Title level={2} style={{ margin: 0 }}>{project.title}</Title>
              <Tag color="magenta" style={{ fontSize: 16 }}>{project.category}</Tag>
            </div>
            <Paragraph>{project.description}</Paragraph>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Text strong>Institution:</Text> {project.student?.institution}
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Researcher:</Text> {project.student?.name}
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Text strong>Funding Goal:</Text> {(project.fundingGoal / 1_000_000).toLocaleString()} ADA
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Current Funding:</Text> {(project.currentFunding / 1_000_000).toLocaleString()} ADA
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Text strong>Deadline:</Text> {new Date(project.deadline).toLocaleDateString()}
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Days Left:</Text> {daysLeft}
              </Col>
            </Row>
            <div>
              <Progress percent={Math.min(progress, 100)} status={progress >= 100 ? 'success' : 'active'} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', marginTop: 8 }}>
                <span>{progress.toFixed(1)}% funded</span>
                <span>{(project.currentFunding / 1_000_000).toLocaleString()} / {(project.fundingGoal / 1_000_000).toLocaleString()} ADA</span>
              </div>
            </div>
            <Space>
              {!isOwner && (
                <Button type="primary" size="large" onClick={() => navigate(`/donate/${project.id}`)}>
                  Donate to this Project
                </Button>
              )}
              {isOwner && (
                <>
                  <Button type="default" size="large" onClick={() => navigate(`/projects/${project.id}/edit`)}>
                    Edit Project
                  </Button>
                  <Button type="default" size="large" danger onClick={() => Modal.confirm({
                    title: 'Delete Project',
                    content: 'Are you sure you want to delete this project?',
                    okText: 'Delete',
                    okType: 'danger',
                    cancelText: 'Cancel',
                    onOk: () => {
                      // TODO: Call delete API and navigate
                      alert('Project deleted (not implemented)');
                      navigate('/projects');
                    },
                  })}>
                    Delete Project
                  </Button>
                </>
              )}
              <Button size="large" onClick={() => navigate('/projects')}>Back to Projects</Button>
            </Space>
          </Space>
        </Card>

      </Col>
    </Row>
  );
} 