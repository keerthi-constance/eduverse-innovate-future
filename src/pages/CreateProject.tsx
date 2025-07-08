import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Select, DatePicker, InputNumber, Button, Card, Typography, Row, Col, message } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useCreateProject } from '../hooks/useProjects';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { toast } from 'react-hot-toast';
import { 
  FlaskConical, 
  CircleDollarSign, 
  Diamond, 
  Plus, 
  Check,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createProject = useCreateProject();

  const [form] = Form.useForm();

  // Role-based access control - only students can create projects
  useEffect(() => {
    if (user && user.role === 'donor') {
      message.error('Donors cannot create projects. Only students can create projects. Switch to Student mode to create projects.');
      navigate('/browse');
    }
  }, [user, navigate]);

  // Show loading if user data is not yet loaded
  if (!user) {
    return (
      <div className="min-h-screen bg-web3-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Show a message for donors instead of the form
  if (user.role === 'donor') {
    return (
      <div className="min-h-screen bg-web3-gradient">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center">
              <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-8 mb-8">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Access Restricted</h2>
                <p className="text-red-300 mb-6">
                  Only Student Researchers can create projects. Donors can browse and fund existing projects.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={() => navigate('/browse')}
                    className="bg-gradient-to-r from-cyan-500 to-violet-500"
                  >
                    Browse Projects
                  </Button>
                  <Button 
                    size="large"
                    onClick={() => navigate('/profile')}
                    className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20"
                  >
                    Switch to Student Mode
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const onFinish = async (values) => {
    try {
      const projectData = {
        title: values.title,
        description: values.description,
        category: values.category,
        fundingGoal: Number(values.fundingGoal) * 1_000_000, // Convert ADA to lovelace
        deadline: values.deadline.toISOString(), // Use ISO string for backend compatibility
        status: values.status,
        institution: values.institution || 'University of Colombo',
        researchField: values.researchField || '',
        expectedOutcomes: values.expectedOutcomes || '',
        teamMembers: values.teamMembers || '',
        milestones: values.milestones
          ? Array.isArray(values.milestones)
            ? values.milestones
            : values.milestones.split(',').map(m => m.trim()).filter(Boolean)
          : [],
        tags: values.tags
          ? Array.isArray(values.tags)
            ? values.tags
            : values.tags.split(',').map(t => t.trim()).filter(Boolean)
          : []
      };

      console.log('Submitting project data:', projectData);

      const result = await createProject.mutateAsync(projectData);
      console.log('Project creation result:', result);
      if (result && result.success) {
      message.success('Project created successfully!');
      navigate('/my-projects');
      } else {
        // Log backend error details
        if (result?.details) {
          console.error('Backend validation errors:', result.details);
          message.error(result.details.map(d => d.message).join('; '));
      } else {
        message.error(result?.message || 'Failed to create project. Please try again.');
        }
      }
    } catch (error) {
      // If error.response?.data?.details exists, show it
      if (error?.response?.data?.details) {
        console.error('Backend validation errors:', error.response.data.details);
        message.error(error.response.data.details.map(d => d.message).join('; '));
      } else {
      console.error('Project creation error:', error);
      message.error('Failed to create project. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-web3-gradient">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <Title level={2}>Create New Project</Title>
            <Paragraph style={{ color: '#666' }}>
              Share your research vision and start your funding journey
            </Paragraph>
          </div>

          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                category: 'Computer Science',
                status: 'pending',
                institution: 'University of Colombo'
              }}
            >
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    name="title"
                    label="Project Title"
                    rules={[{ required: true, message: 'Please enter a project title' }]}
                  >
                    <Input placeholder="Enter your project title" size="large" />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    name="description"
                    label="Project Description"
                    rules={[{ required: true, message: 'Please enter a project description' }]}
                  >
                    <TextArea 
                      rows={6} 
                      placeholder="Describe your research project, objectives, and expected outcomes"
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="category"
                    label="Category"
                    rules={[{ required: true, message: 'Please select a category' }]}
                  >
                    <Select size="large">
                      <Option value="Artificial Intelligence">Artificial Intelligence</Option>
                      <Option value="Biotechnology">Biotechnology</Option>
                      <Option value="Climate Science">Climate Science</Option>
                      <Option value="Computer Science">Computer Science</Option>
                      <Option value="Environmental Science">Environmental Science</Option>
                      <Option value="Health & Medicine">Health & Medicine</Option>
                      <Option value="Materials Science">Materials Science</Option>
                      <Option value="Physics">Physics</Option>
                      <Option value="Space Science">Space Science</Option>
                      <Option value="Other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="fundingGoal"
                    label="Funding Goal (ADA)"
                    rules={[
                      { required: true, message: 'Please enter funding goal' },
                      { type: 'number', min: 1, message: 'Minimum funding goal is 1 ADA' }
                    ]}
                  >
                    <InputNumber 
                      placeholder="1000" 
                      size="large"
                      addonAfter="ADA"
                      min={1}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="deadline"
                    label="Project Deadline"
                    rules={[{ required: true, message: 'Please select a deadline' }]}
                  >
                    <DatePicker 
                      size="large" 
                      style={{ width: '100%' }}
                      placeholder="Select deadline"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="institution"
                    label="Institution"
                    rules={[{ required: true, message: 'Please enter your institution' }]}
                  >
                    <Input placeholder="Your university or institution" size="large" />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    name="researchField"
                    label="Research Field"
                  >
                    <Input placeholder="Specific field of study" size="large" />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    name="expectedOutcomes"
                    label="Expected Outcomes"
                  >
                    <TextArea 
                      rows={4} 
                      placeholder="What do you expect to achieve? How will this research benefit society?"
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    name="teamMembers"
                    label="Team Members"
                  >
                    <TextArea 
                      rows={3} 
                      placeholder="List your research team members and their roles"
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    name="milestones"
                    label="Project Milestones"
                  >
                    <TextArea 
                      rows={3} 
                      placeholder="Key milestones for your project (comma-separated)"
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    name="tags"
                    label="Tags"
                  >
                    <Input placeholder="Relevant tags (comma-separated)" size="large" />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: 'Please select a status' }]}
                  >
                    <Select size="large">
                      <Option value="pending">Pending</Option>
                      <Option value="active">Active</Option>
                      <Option value="completed">Completed</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <div className="flex justify-between mt-8">
                <Button 
                  type="default" 
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/projects')}
                  size="large"
                >
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  size="large"
                  loading={createProject.isPending}
                >
                  Create Project
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
