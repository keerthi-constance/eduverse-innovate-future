import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProject } from '../hooks/useProjects';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';
import { toast } from 'react-hot-toast';
import { 
  FlaskConical, 
  CircleDollarSign, 
  Diamond, 
  Plus, 
  Upload,
  Check,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createProjectMutation = useCreateProject();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    fundingGoal: '',
    deadline: '',
    milestones: [''],
    teamMembers: '',
    institution: '',
    researchField: '',
    expectedOutcomes: '',
    tags: [] as string[]
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

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

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, '']
    }));
  };

  const updateMilestone = (index: number, value: string) => {
    const newMilestones = [...formData.milestones];
    newMilestones[index] = value;
    setFormData(prev => ({
      ...prev,
      milestones: newMilestones
    }));
  };

  const removeMilestone = (index: number) => {
    if (formData.milestones.length > 1) {
      const newMilestones = formData.milestones.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        milestones: newMilestones
      }));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        toast.error(`${file.name} is not a supported file type`);
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
      }
      
      return isValidType && isValidSize;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.description || !formData.category || !formData.fundingGoal || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate institution (must be non-empty string)
    if (!formData.institution || formData.institution.trim() === '') {
      toast.error('Institution is required and cannot be empty');
      return;
    }

    // Validate description length
    if (formData.description.length < 20) {
      toast.error('Description must be at least 20 characters');
      return;
    }

    // Validate fundingGoal is a number
    const fundingGoalNumber = Number(formData.fundingGoal);
    if (isNaN(fundingGoalNumber) || fundingGoalNumber <= 0) {
      toast.error('Funding goal must be a positive number');
      return;
    }

    // Validate deadline is a future date
    const deadlineDate = new Date(formData.deadline);
    if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
      toast.error('Deadline must be a future date');
      return;
    }

    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        fundingGoal: fundingGoalNumber * 1000000, // Convert ADA to lovelace
        deadline: deadlineDate.toISOString(),
        tags: formData.tags,
        attachments: [], // Will be populated after file upload
        milestones: formData.milestones.filter(m => m.trim() !== ''),
        teamMembers: formData.teamMembers,
        institution: formData.institution.trim(),
        researchField: formData.researchField,
        expectedOutcomes: formData.expectedOutcomes
      };

      console.log('🔍 [CreateProject] Sending project data:', projectData);
      console.log('🔍 [CreateProject] Institution value:', projectData.institution);
      console.log('🔍 [CreateProject] Institution type:', typeof projectData.institution);
      console.log('🔍 [CreateProject] Institution length:', projectData.institution.length);

      // Upload files first
      const uploadedFiles = [];
      for (const file of selectedFiles) {
        try {
          const formData = new FormData();
          formData.append('image', file);
          
          // Upload file to backend
          const response = await apiService.upload.uploadImage(file);
          uploadedFiles.push(response.data.url);
          
          toast.success(`${file.name} uploaded successfully`);
        } catch (error) {
          console.error('File upload failed:', error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      // Create project
      await createProjectMutation.mutateAsync({
        ...projectData,
        attachments: uploadedFiles
      });

      toast.success('Project created successfully!');
      navigate('/my-projects');
      
    } catch (error: any) {
      // Try to show backend error message if available
      const backendMsg = error?.response?.data?.message || error?.message;
      const backendDetails = error?.response?.data?.details;
      if (backendDetails && Array.isArray(backendDetails)) {
        backendDetails.forEach((d: any) => toast.error(`${d.field}: ${d.message}`));
      } else {
        toast.error(backendMsg || 'Failed to create project. Please try again.');
      }
      console.error('Project creation failed:', error, error?.response?.data);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: FlaskConical },
    { number: 2, title: 'Details', icon: Diamond },
    { number: 3, title: 'Funding', icon: CircleDollarSign },
    { number: 4, title: 'Review', icon: Check }
  ];

  return (
    <div className="min-h-screen bg-web3-gradient">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Create Research Project
            </h1>
            <p className="text-xl text-gray-300">
              Share your research vision with the world and get funded
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {steps.map((step) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number 
                      ? 'border-cyan-400 bg-cyan-400 text-white' 
                      : 'border-gray-600 text-gray-400'
                  }`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  {step.number < totalSteps && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      currentStep > step.number ? 'bg-cyan-400' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              {steps.map((step) => (
                <span key={step.number} className={currentStep >= step.number ? 'text-cyan-400' : ''}>
                  {step.title}
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="glass-card p-8 mb-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-semibold text-white mb-6">Project Basics</h2>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Project Title *</label>
                    <Input
                      placeholder="Enter your research project title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-midnight-800/50 border-white/20 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Category *</label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="bg-midnight-800/50 border-white/20 text-white">
                        <SelectValue placeholder="Select research category" />
                      </SelectTrigger>
                      <SelectContent className="bg-midnight-800 border-white/20">
                        {categories.map((category) => (
                          <SelectItem key={category} value={category} className="text-white hover:bg-midnight-700">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Institution *</label>
                    <Input
                      placeholder="Your university or research institution"
                      value={formData.institution}
                      onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                      className={`bg-midnight-800/50 border-white/20 text-white placeholder:text-gray-400${!formData.institution || formData.institution.trim() === '' ? ' border-red-500' : ''}`}
                      required
                    />
                    {(!formData.institution || formData.institution.trim() === '') && (
                      <p className="text-red-400 text-xs mt-1">Institution is required</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Research Field</label>
                    <Input
                      placeholder="Specific field of study"
                      value={formData.researchField}
                      onChange={(e) => setFormData(prev => ({ ...prev, researchField: e.target.value }))}
                      className="bg-midnight-800/50 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Details */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-semibold text-white mb-6">Project Details</h2>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Project Description *</label>
                    <Textarea
                      placeholder="Describe your research project in detail..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-midnight-800/50 border-white/20 text-white placeholder:text-gray-400 min-h-[120px]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Expected Outcomes</label>
                    <Textarea
                      placeholder="What do you expect to achieve with this research?"
                      value={formData.expectedOutcomes}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedOutcomes: e.target.value }))}
                      className="bg-midnight-800/50 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Team Members</label>
                    <Input
                      placeholder="Names of team members (optional)"
                      value={formData.teamMembers}
                      onChange={(e) => setFormData(prev => ({ ...prev, teamMembers: e.target.value }))}
                      className="bg-midnight-800/50 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Project Images & Documents</label>
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-cyan-400/50 transition-colors">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-400 mb-2">Drag and drop files or click to browse</p>
                      <p className="text-gray-500 text-sm mb-4">Supports: JPG, PNG, WebP, PDF (max 5MB each)</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose Files
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                    
                    {/* Selected Files */}
                    {selectedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-white font-medium">Selected Files:</h4>
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-midnight-800/30 rounded-lg p-3">
                            <span className="text-gray-300 text-sm">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Funding */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-semibold text-white mb-6">Funding & Timeline</h2>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Funding Goal (ADA) *</label>
                    <Input
                      type="number"
                      placeholder="Enter amount in ADA"
                      value={formData.fundingGoal}
                      onChange={(e) => setFormData(prev => ({ ...prev, fundingGoal: e.target.value }))}
                      className="bg-midnight-800/50 border-white/20 text-white placeholder:text-gray-400"
                      min="1"
                      step="0.1"
                      required
                    />
                    <p className="text-gray-400 text-sm mt-1">1 ADA = 1,000,000 Lovelace</p>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Project Deadline *</label>
                    <Input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      className="bg-midnight-800/50 border-white/20 text-white placeholder:text-gray-400"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Project Milestones</label>
                    <p className="text-gray-400 text-sm mb-4">Define key milestones for your research project</p>
                    {formData.milestones.map((milestone, index) => (
                      <div key={index} className="flex gap-2 mb-3">
                        <Input
                          placeholder={`Milestone ${index + 1}`}
                          value={milestone}
                          onChange={(e) => updateMilestone(index, e.target.value)}
                          className="bg-midnight-800/50 border-white/20 text-white placeholder:text-gray-400"
                        />
                        {formData.milestones.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeMilestone(index)}
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addMilestone}
                      className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Milestone
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-semibold text-white mb-6">Review & Submit</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-midnight-800/30 rounded-lg p-4">
                      <h4 className="text-cyan-400 font-semibold mb-2">Project Information</h4>
                      <div className="space-y-2 text-gray-300">
                        <p><strong>Title:</strong> {formData.title}</p>
                        <p><strong>Category:</strong> {formData.category}</p>
                        <p><strong>Institution:</strong> {formData.institution}</p>
                        <p><strong>Research Field:</strong> {formData.researchField || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className="bg-midnight-800/30 rounded-lg p-4">
                      <h4 className="text-cyan-400 font-semibold mb-2">Funding Details</h4>
                      <div className="space-y-2 text-gray-300">
                        <p><strong>Goal:</strong> {formData.fundingGoal} ADA</p>
                        <p><strong>Deadline:</strong> {formData.deadline ? new Date(formData.deadline).toLocaleDateString() : 'Not set'}</p>
                        <p><strong>Files:</strong> {selectedFiles.length} selected</p>
                      </div>
                    </div>

                    <div className="bg-midnight-800/30 rounded-lg p-4">
                      <h4 className="text-cyan-400 font-semibold mb-2">Description</h4>
                      <p className="text-gray-300 text-sm">{formData.description}</p>
                    </div>
                  </div>

                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                    <h4 className="text-cyan-400 font-semibold mb-2">⚠️ Before You Submit</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Make sure all information is accurate and complete</li>
                      <li>• Your project will be reviewed by our team before going live</li>
                      <li>• You'll receive an email confirmation once approved</li>
                      <li>• NFT receipts will be automatically generated for donors</li>
                    </ul>
                  </div>
                </div>
              )}
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="border-gray-600 text-gray-400 hover:bg-gray-600/10 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep === totalSteps ? (
                <Button 
                  type="submit" 
                  className="web3-button"
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Submit Project
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="web3-button"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
