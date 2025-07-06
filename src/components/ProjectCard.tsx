import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FlaskConical, 
  CircleDollarSign, 
  DiamondPercent, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  Users,
  Target
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  fundingGoal: number;
  currentFunding: number;
  deadline: string;
  status: 'active' | 'funded' | 'expired' | 'pending' | 'draft';
  backersCount: number;
  student: {
    id: string;
    name: string;
    walletAddress: string;
    institution: string;
  };
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  isOwner?: boolean;
}

const ProjectCard = ({ project, viewMode, isOwner = false }: ProjectCardProps) => {
  const progressPercentage = (project.currentFunding / project.fundingGoal) * 100;
  const daysLeft = Math.max(0, Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'artificial intelligence':
      case 'computer science':
        return <FlaskConical className="h-4 w-4" />;
      case 'health & medicine':
      case 'biotechnology':
        return <DiamondPercent className="h-4 w-4" />;
      default:
        return <FlaskConical className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'artificial intelligence':
      case 'computer science':
        return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
      case 'health & medicine':
      case 'biotechnology':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'climate science':
      case 'environmental science':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Project Image */}
            <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-gradient-to-br from-midnight-700 to-midnight-800 flex-shrink-0">
              {project.attachments && project.attachments.length > 0 ? (
                <img 
                  src={project.attachments[0]
                    ? `${import.meta.env.VITE_API_URL || 'http://localhost:4567'}${project.attachments[0].startsWith('/')
                        ? project.attachments[0]
                        : '/uploads/' + project.attachments[0]}`
                    : undefined}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FlaskConical className="h-8 w-8 text-gray-600" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-2 left-2">
                <Badge className={`${getStatusColor(project.status)} text-xs`}>
                  {project.status}
                </Badge>
              </div>
            </div>

            {/* Project Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${getCategoryColor(project.category)} border`}>
                      {getCategoryIcon(project.category)}
                      <span className="ml-1">{project.category}</span>
                    </Badge>
                    {isOwner && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Your Project
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Progress and Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-600 font-medium">
                      {progressPercentage.toFixed(1)}% funded
                    </span>
                    <span className="text-gray-500">
                      {project.backersCount} backers
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <CircleDollarSign className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{project.currentFunding.toLocaleString()}</span>
                    <span>ADA raised</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{project.fundingGoal.toLocaleString()}</span>
                    <span>ADA goal</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>{daysLeft} days left</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span>{project.student?.name || "Unknown Student"}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {project.student?.institution || "Unknown Institution"}
                </div>
                <div className="flex items-center gap-2">
                  {isOwner && (
                    <>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/projects/${project.id || project._id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                  <Button asChild>
                    <Link to={`/projects/${project.id || project._id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (original design)
  return (
    <Link to={`/projects/${project.id || project._id}`} className="block">
      <Card className="project-card group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardContent className="p-6">
          {/* Project Image */}
          <div className="relative h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-midnight-700 to-midnight-800">
            {project.attachments && project.attachments.length > 0 ? (
              <img 
                src={project.attachments[0]
                  ? `${import.meta.env.VITE_API_URL || 'http://localhost:4567'}${project.attachments[0].startsWith('/')
                      ? project.attachments[0]
                      : '/uploads/' + project.attachments[0]}`
                  : undefined}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FlaskConical className="h-16 w-16 text-gray-600" />
              </div>
            )}
            
            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <Badge className={`${getCategoryColor(project.category)} border`}>
                {getCategoryIcon(project.category)}
                <span className="ml-1">{project.category}</span>
              </Badge>
            </div>

            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              <Badge className={`${getStatusColor(project.status)} text-xs`}>
                {project.status}
              </Badge>
            </div>

            {/* Days Left Badge */}
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                {daysLeft} days left
              </Badge>
            </div>

            {/* Owner Badge */}
            {isOwner && (
              <div className="absolute bottom-3 left-3">
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Your Project
                </Badge>
              </div>
            )}
          </div>

          {/* Project Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                {project.title}
              </h3>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {project.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-600 font-medium">
                  {progressPercentage.toFixed(1)}% funded
                </span>
                <span className="text-gray-500">
                  {project.backersCount} backers
                </span>
              </div>
            </div>

            {/* Funding Info */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-1 text-gray-900">
                <CircleDollarSign className="h-4 w-4 text-green-500" />
                <span className="font-semibold">{project.currentFunding.toLocaleString()}</span>
                <span className="text-xs text-gray-500">ADA</span>
              </div>
              <div className="text-xs text-gray-500">
                of {project.fundingGoal.toLocaleString()} ADA goal
              </div>
            </div>

            {/* Student Info */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-600">{project.student?.name || "Unknown Student"}</span>
              </div>
              <div className="text-xs text-gray-500 truncate max-w-24">
                {project.student?.institution || "Unknown Institution"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProjectCard;

    <Link to={`/project/${id}`} className="block">
      <div className="project-card group">
        {/* Project Image */}
        <div className="relative h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-midnight-700 to-midnight-800">
          {image ? (
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FlaskConical className="h-16 w-16 text-gray-600" />
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={`${getCategoryColor(category)} border`}>
              {getCategoryIcon(category)}
              <span className="ml-1">{category}</span>
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
            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors duration-200 line-clamp-2">
              {title}
            </h3>
            <p className="text-sm text-gray-400 mt-2 line-clamp-2">
              {description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-cyan-400 font-medium">
                {progressPercentage.toFixed(1)}% funded
              </span>
              <span className="text-gray-400">
                {backers} backers
              </span>
            </div>
          </div>

          {/* Funding Info */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center space-x-1 text-white">
              <CircleDollarSign className="h-4 w-4 text-cyan-400" />
              <span className="font-semibold">{raisedAda.toLocaleString()}</span>
              <span className="text-xs text-gray-400">ADA</span>
            </div>
            <div className="text-xs text-gray-400">
              of {goalAda.toLocaleString()} ADA goal
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;