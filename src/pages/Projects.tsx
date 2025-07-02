import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects, useSearchProjects, useMyProjects } from '../hooks/useProjects';
import { useAuth } from '../contexts/AuthContext';
import ProjectCard from '../components/ProjectCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  TrendingUp, 
  Clock, 
  Target,
  Users,
  Sparkles,
  Eye,
  Edit,
  Trash2,
  Heart,
  Share2
} from 'lucide-react';

const Projects: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');

  // Fetch all projects
  const { data: projectsData, isLoading: projectsLoading } = useProjects({
    category: category === 'all' ? undefined : category,
  });

  // Fetch search results
  const { data: searchData, isLoading: searchLoading } = useSearchProjects(
    searchQuery,
    { category: category === 'all' ? undefined : category }
  );

  // Fetch user's own projects (if student)
  const { data: myProjectsData, isLoading: myProjectsLoading } = useMyProjects();

  const isLoading = projectsLoading || searchLoading || myProjectsLoading;
  
  // Determine which projects to show based on active tab
  let projects = [];
  if (activeTab === 'my-projects' && user?.role === 'student') {
    projects = myProjectsData?.data?.projects || [];
  } else {
    projects = searchQuery ? searchData?.data?.projects || [] : projectsData?.data?.projects || [];
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing Research Projects
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Support innovative research from talented students across Sri Lanka. 
            Every contribution helps bring groundbreaking ideas to life.
          </p>
        </div>

        {/* Role-based Tabs */}
        {user?.role === 'student' && (
          <div className="mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Browse All
                </TabsTrigger>
                <TabsTrigger value="my-projects" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  My Projects
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects by title, description, or researcher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View Controls and Actions */}
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Create Project Button (Students only) */}
              {user?.role === 'student' && activeTab === 'my-projects' && (
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link to="/create-project">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || category) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-blue-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {category && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Category: {category}
                  <button
                    onClick={() => setCategory('')}
                    className="ml-1 hover:text-green-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setCategory('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeTab === 'my-projects' ? 'My Projects' : 'All Projects'}
              </h2>
              <Badge variant="outline" className="bg-white">
                {isLoading ? 'Loading...' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
              </Badge>
            </div>
            
            {/* Quick Stats */}
            {projects.length > 0 && (
              <div className="hidden md:flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{projects.filter(p => p.status === 'active').length} active</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>{projects.filter(p => p.status === 'funded').length} funded</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Projects Display */}
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
        ) : projects.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id || project._id || `project-${index}`}
                project={project}
                viewMode={viewMode}
                isOwner={user?.role === 'student' && project.student?.id === user.id}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {activeTab === 'my-projects' ? 'No projects yet' : 'No projects found'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {activeTab === 'my-projects' 
                  ? 'Start your research journey by creating your first project'
                  : searchQuery || category 
                    ? 'Try adjusting your search criteria or filters'
                    : 'No projects are currently available. Check back soon!'
                }
              </p>
              <div className="flex items-center justify-center gap-4">
                {(searchQuery || category) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setCategory('');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                {activeTab === 'my-projects' && user?.role === 'student' && (
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Link to="/create-project">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Project
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action for Donors */}
        {user?.role === 'donor' && projects.length > 0 && (
          <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-red-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Support Research That Matters
                </h3>
              </div>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Your contributions help students turn their innovative ideas into reality. 
                Every ADA makes a difference in advancing research and education in Sri Lanka.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" className="border-blue-300 text-blue-700">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share with Friends
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Trending Projects
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Projects; 