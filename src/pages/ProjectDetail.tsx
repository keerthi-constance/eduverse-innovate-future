import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { CircleDollarSign, Users, Edit, Trash2, Clock, Heart, ChevronLeft } from 'lucide-react';
import DonationModal from '@/components/DonationModal';

const ProjectDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  // Debug: Log the received ID
  console.log('ProjectDetail - Received ID:', id);

  // If no ID is provided, redirect to projects page
  if (!id) {
    console.log('ProjectDetail - No ID provided, redirecting to projects');
    navigate('/projects');
    return null;
  }

  const { data, isLoading, isError } = useProject(id);

  const project = data?.data?.project;
  const isOwner = user && project && user.id === project.student?.id;
  const progress = project ? (project.currentFunding / project.fundingGoal) * 100 : 0;
  const daysLeft = project ? Math.max(0, Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

  // Placeholder for delete logic
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      // TODO: Call delete API and navigate
      alert('Project deleted (not implemented)');
      navigate('/projects');
    }
  };

  const handleDonationSuccess = () => {
    // Refresh project data after successful donation
    window.location.reload();
  };

  if (isLoading) return <div className="text-center py-12">Loading project...</div>;
  if (isError || !project) return <div className="text-center py-12 text-red-500">Project not found or invalid ID.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/projects" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Projects
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Badge>{project.category}</Badge>
                <span className="text-gray-500 text-sm">by {project.student?.name || 'Unknown'}</span>
              </div>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {project.attachments && project.attachments.length > 0 && (
                <img
                  src={project.attachments[0].startsWith('/')
                    ? `${import.meta.env.VITE_API_URL || 'http://localhost:4567'}${project.attachments[0]}`
                    : `${import.meta.env.VITE_API_URL || 'http://localhost:4567'}/uploads/${project.attachments[0]}`}
                  alt={project.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              <div className="mb-4">
                <Progress value={progress} />
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-blue-600 font-medium">{progress.toFixed(1)}% funded</span>
                  <span className="text-gray-500">{project.backersCount} backers</span>
                  <span className="text-gray-500">{daysLeft} days left</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <CircleDollarSign className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{project.currentFunding.toLocaleString()}</span>
                  <span>ADA raised</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{project.fundingGoal.toLocaleString()}</span>
                  <span>ADA goal</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span>{project.student?.institution || 'Unknown Institution'}</span>
                </div>
              </div>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">About This Project</h3>
                <p className="text-gray-700">{project.description}</p>
              </div>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Expected Outcomes</h3>
                <p className="text-gray-700">{project.expectedOutcomes || 'N/A'}</p>
              </div>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Research Team</h3>
                <p className="text-gray-700">{project.teamMembers || 'N/A'}</p>
              </div>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Project Milestones</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  {Array.isArray(project.milestones) && project.milestones.length > 0 ? (
                    project.milestones.map((m: string, i: number) => <li key={i}>{m}</li>)
                  ) : (
                    <li>No milestones provided.</li>
                  )}
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Project Updates</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  {Array.isArray(project.updates) && project.updates.length > 0 ? (
                    project.updates.map((u: any, i: number) => <li key={i}>{u.title || u.content || 'Update'}</li>)
                  ) : (
                    <li>No updates yet.</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Actions or Donation Form */}
          {isOwner ? (
            <Card>
              <CardHeader>
                <CardTitle>Project Owner Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full mb-2">
                  <Link to={`/projects/${project.id}/edit`}><Edit className="h-4 w-4 mr-1" /> Edit Project</Link>
                </Button>
                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Support This Project</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-4">
                      Support this research project and receive an NFT receipt
                    </p>
                    <Button 
                      onClick={() => setIsDonationModalOpen(true)}
                      className="w-full"
                    >
                      <Heart className="h-4 w-4 mr-2" /> Donate & Mint NFT
                    </Button>
                  </div>
                  <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CircleDollarSign className="h-4 w-4 text-violet-400" />
                      <span className="text-violet-400 font-medium">NFT Receipt</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      You'll receive a unique NFT as proof of your donation, including project details and transaction hash.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Project Creator Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Creator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-6 w-6 text-blue-500" />
                <div>
                  <div className="font-medium">{project.student?.name || 'Unknown'}</div>
                  <div className="text-sm text-gray-500">{project.student?.institution || 'N/A'}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 break-all">Wallet: {project.student?.walletAddress || 'N/A'}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Donation Modal */}
      <DonationModal
        project={project}
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        onSuccess={handleDonationSuccess}
      />
    </div>
  );
};

export default ProjectDetail; 