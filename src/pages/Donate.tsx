import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useCreateDonation } from '../hooks/useDonations';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Send, Heart, GraduationCap, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Donate: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: projectData, isLoading } = useProject(projectId || '');
  const createDonationMutation = useCreateDonation();
  const { user } = useAuth();

  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const project = projectData?.data?.project;

  const handleDonate = async () => {
    if (!projectId || !amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    setIsProcessing(true);
    try {
      await createDonationMutation.mutateAsync({
        amount: parseFloat(amount),
        projectId,
        message: message.trim() || undefined,
        anonymous,
      });
      
      toast.success('Donation submitted successfully!');
      setAmount('');
      setMessage('');
      setAnonymous(false);
    } catch (error) {
      toast.error('Failed to submit donation');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const progress = (project.currentFunding / project.fundingGoal) * 100;
  const daysLeft = Math.max(0, Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Support This Project</h1>
        <p className="text-gray-600">Make a difference by supporting this student's research</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{project.title}</CardTitle>
              <CardDescription className="text-sm">
                by {project.student.name} • {project.student.institution}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{project.description}</p>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <GraduationCap className="h-4 w-4" />
                <span>{project.student.fieldOfStudy}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Building className="h-4 w-4" />
                <span>{project.student.institution}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Funding Progress</span>
                  <span className="font-medium">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {project.currentFunding} ADA raised
                  </span>
                  <span className="text-gray-600">
                    Goal: {project.fundingGoal} ADA
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {daysLeft} days left
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'funded' ? 'bg-purple-100 text-purple-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {project.status === 'active' ? 'Active' :
                   project.status === 'funded' ? 'Funded' : 'Expired'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Donation Form or Owner Message */}
        <div>
          {user?.id !== project.student?.id ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  <span>Make a Donation</span>
                </CardTitle>
                <CardDescription>
                  Support this project with ADA from your Cardano wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Donation Amount (ADA)
                  </label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount in ADA"
                    min="1"
                    step="0.1"
                    className="text-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum donation: 1 ADA
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Leave a message of support..."
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {message.length}/500 characters
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={anonymous}
                    onCheckedChange={(checked) => setAnonymous(checked as boolean)}
                  />
                  <label htmlFor="anonymous" className="text-sm text-gray-700">
                    Make this donation anonymous
                  </label>
                </div>

                {amount && parseFloat(amount) > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Donation Summary</h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-medium">{parseFloat(amount)} ADA</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Network Fee:</span>
                        <span className="font-medium">~0.17 ADA</span>
                      </div>
                      <div className="border-t border-blue-200 pt-1 flex justify-between font-medium">
                        <span>Total:</span>
                        <span>{(parseFloat(amount) + 0.17).toFixed(2)} ADA</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleDonate}
                  disabled={!amount || parseFloat(amount) <= 0 || isProcessing || createDonationMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing || createDonationMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Donate {amount ? `${amount} ADA` : ''}
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By making a donation, you agree to our terms of service and privacy policy.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>This is your project</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-center mt-4">
                  You cannot donate to your own project.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Donate; 