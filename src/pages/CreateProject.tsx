
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';
import { 
  FlaskConical, 
  CircleDollarSign, 
  Diamond, 
  Plus, 
  Upload,
  Check,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const CreateProject = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    goalAda: '',
    duration: '',
    milestones: [''],
    teamMembers: '',
    institution: '',
    researchField: '',
    expectedOutcomes: ''
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Project submitted:', formData);
    // Handle form submission
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
          <Card className="glass-card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    currentStep >= step.number 
                      ? 'bg-gradient-to-r from-cyan-500 to-violet-500 border-transparent text-white' 
                      : 'border-gray-600 text-gray-400'
                  }`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className={`ml-2 font-medium ${
                    currentStep >= step.number ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 mx-4 text-gray-600" />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
          </Card>

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
                      className="bg-midnight-800/50 border-white/20 text-white placeholder:text-gray-400"
                    />
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
                      placeholder="Describe your research project, its objectives, methodology, and potential impact..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-midnight-800/50 border-white/20 text-white placeholder:text-gray-400 min-h-32"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Expected Outcomes</label>
                    <Textarea
                      placeholder="What do you expect to achieve? How will this research benefit society?"
                      value={formData.expectedOutcomes}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedOutcomes: e.target.value }))}
                      className="bg-midnight-800/50 border-white/20 text-white placeholder:text-gray-400 min-h-24"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Team Members</label>
                    <Textarea
                      placeholder="List your research team members and their roles"
                      value={formData.teamMembers}
                      onChange={(e) => setFormData(prev => ({ ...prev, teamMembers: e.target.value }))}
                      className="bg-midnight-800/50 border-white/20 text-white placeholder:text-gray-400 min-h-20"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Project Images</label>
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-cyan-400/50 transition-colors">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-400 mb-2">Drag and drop images or click to browse</p>
                      <Button type="button" variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                        Choose Files
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Funding */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-semibold text-white mb-6">Funding & Timeline</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-medium mb-2">Funding Goal (ADA) *</label>
                      <Input
                        type="number"
                        placeholder="50000"
                        value={formData.goalAda}
                        onChange={(e) => setFormData(prev => ({ ...prev, goalAda: e.target.value }))}
                        className="bg-midnight-800/50 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Campaign Duration (days) *</label>
                      <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                        <SelectTrigger className="bg-midnight-800/50 border-white/20 text-white">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent className="bg-midnight-800 border-white/20">
                          <SelectItem value="30" className="text-white hover:bg-midnight-700">30 days</SelectItem>
                          <SelectItem value="45" className="text-white hover:bg-midnight-700">45 days</SelectItem>
                          <SelectItem value="60" className="text-white hover:bg-midnight-700">60 days</SelectItem>
                          <SelectItem value="90" className="text-white hover:bg-midnight-700">90 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                  
                  <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-cyan-400 mb-4">{formData.title || 'Project Title'}</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Category:</span>
                        <span className="text-white ml-2">{formData.category || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Institution:</span>
                        <span className="text-white ml-2">{formData.institution || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Funding Goal:</span>
                        <span className="text-white ml-2">{formData.goalAda || 0} ADA</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white ml-2">{formData.duration || 0} days</span>
                      </div>
                    </div>
                    {formData.description && (
                      <div className="mt-4">
                        <span className="text-gray-400">Description:</span>
                        <p className="text-white mt-1 text-sm leading-relaxed">{formData.description}</p>
                      </div>
                    )}
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
                <Button type="submit" className="web3-button">
                  <Check className="h-4 w-4 mr-2" />
                  Submit Project
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
