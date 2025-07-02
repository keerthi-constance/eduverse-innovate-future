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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Projects</h1>
              <p className="text-gray-600">
                Manage and track your research projects
              </p>
            </div>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link to="/create-project">
                <Plus className="h-4 w-4 mr-2" />
                Create New Project
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Raised</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(stats.totalRaised / 1000000).toFixed(1)} ADA
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Backers</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalBackers}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Status Tabs */}
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                All ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Active ({stats.active})
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="funded" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Funded ({stats.funded})
              </TabsTrigger>
              <TabsTrigger value="expired" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Expired
              </TabsTrigger>
              <TabsTrigger value="draft" className="flex items-center gap-2">
                <Pause className="h-4 w-4" />
                Drafts
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const progress = (project.currentFunding / project.fundingGoal) * 100;
              const daysLeft = Math.max(0, Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
              
              return (
                <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    {/* Project Image */}
                    <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      {project.attachments && project.attachments.length > 0 ? (
                        <img 
                          src={project.attachments[0]} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className={`${getStatusColor(project.status)} text-xs`}>
                          {getStatusIcon(project.status)}
                          <span className="ml-1">{project.status}</span>
                        </Badge>
                      </div>

                      {/* Days Left Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                          {daysLeft} days left
                        </Badge>
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {project.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {project.description}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-blue-600 font-medium">
                            {progress.toFixed(1)}% funded
                          </span>
                          <span className="text-gray-500">
                            {project.backersCount} backers
                          </span>
                        </div>
                      </div>

                      {/* Funding Info */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-1 text-gray-900">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="font-semibold">
                            {(project.currentFunding / 1000000).toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500">ADA</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          of {(project.fundingGoal / 1000000).toFixed(1)} ADA goal
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                          {project.student.institution}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/projects/${project.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/projects/${project.id}/edit`}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {activeTab === 'all' ? '' : activeTab} projects yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {activeTab === 'all' 
                  ? 'Start your research journey by creating your first project'
                  : `You don't have any ${activeTab} projects yet.`
                }
              </p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Link to="/create-project">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyProjects; 