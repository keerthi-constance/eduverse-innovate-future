
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, CircleDollarSign, DiamondPercent } from 'lucide-react';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  goalAda: number;
  raisedAda: number;
  backers: number;
  daysLeft: number;
  image?: string;
}

const ProjectCard = ({ 
  id, 
  title, 
  description, 
  category, 
  goalAda, 
  raisedAda, 
  backers, 
  daysLeft,
  image 
}: ProjectCardProps) => {
  const progressPercentage = (raisedAda / goalAda) * 100;
  
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ai':
      case 'technology':
        return <FlaskConical className="h-4 w-4" />;
      case 'health':
      case 'medicine':
        return <DiamondPercent className="h-4 w-4" />;
      default:
        return <FlaskConical className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ai':
      case 'technology':
        return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
      case 'health':
      case 'medicine':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
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
