
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import { 
  CircleDollarSign, 
  FlaskConical, 
  Diamond, 
  Calendar,
  Users,
  Share2,
  Heart,
  ChevronLeft,
  Wallet,
  DiamondPercent
} from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const [donationAmount, setDonationAmount] = useState('');
  const [message, setMessage] = useState('');

  // Mock project data - in real app, fetch based on id
  const project = {
    id: id || '1',
    title: 'AI-Powered Medical Diagnosis for Rural Areas',
    description: 'Developing machine learning algorithms to assist healthcare workers in remote locations with accurate medical diagnoses using mobile devices. This research aims to bridge the healthcare gap in underserved communities by providing accessible diagnostic tools.',
    category: 'AI',
    goalAda: 50000,
    raisedAda: 35750,
    backers: 124,
    daysLeft: 23,
    creator: 'Dr. Sarah Chen',
    institution: 'Stanford University',
    image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=400&fit=crop',
    milestones: [
      'Data collection and preprocessing - 25%',
      'Algorithm development - 50%', 
      'Testing and validation - 75%',
      'Deployment and documentation - 100%'
    ],
    updates: [
      {
        date: '2024-06-25',
        title: 'Dataset Collection Complete',
        content: 'Successfully gathered 10,000+ medical case samples from partner hospitals.'
      },
      {
        date: '2024-06-20', 
        title: 'First Algorithm Prototype',
        content: 'Initial ML model showing 87% accuracy in preliminary tests.'
      }
    ],
    team: 'Dr. Sarah Chen (Lead), Alex Rodriguez (ML Engineer), Maria Santos (Data Scientist)',
    expectedOutcomes: 'A mobile application that can assist healthcare workers in rural areas with medical diagnoses, potentially improving healthcare outcomes for millions of people in underserved communities.'
  };

  const progressPercentage = (project.raisedAda / project.goalAda) * 100;

  const handleDonation = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Donation submitted:', { amount: donationAmount, message, projectId: id });
    // Handle donation logic here
  };

  return (
    <div className="min-h-screen bg-web3-gradient">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link to="/browse" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Projects
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Project Header */}
              <Card className="glass-card p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                        <FlaskConical className="h-3 w-3 mr-1" />
                        {project.category}
                      </Badge>
                      <span className="text-gray-400 text-sm">by {project.creator}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">{project.title}</h1>
                    <p className="text-gray-300 text-lg leading-relaxed">{project.description}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="border-white/20 text-gray-400 hover:text-white">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="border-white/20 text-gray-400 hover:text-white">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Project Image */}
                <div className="rounded-xl overflow-hidden mb-6">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-64 object-cover"
                  />
                </div>

                {/* Progress Section */}
                <div className="space-y-4">
                  <Progress value={progressPercentage} className="h-3" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">{project.raisedAda.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">ADA raised</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{progressPercentage.toFixed(1)}%</div>
                      <div className="text-sm text-gray-400">funded</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-violet-400">{project.backers}</div>
                      <div className="text-sm text-gray-400">backers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{project.daysLeft}</div>
                      <div className="text-sm text-gray-400">days left</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Project Details Tabs */}
              <Card className="glass-card p-8">
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-4">About This Project</h2>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Expected Outcomes</h3>
                    <p className="text-gray-300 leading-relaxed">{project.expectedOutcomes}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Research Team</h3>
                    <p className="text-gray-300">{project.team}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Project Milestones</h3>
                    <div className="space-y-2">
                      {project.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                          </div>
                          <span className="text-gray-300">{milestone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Updates */}
              <Card className="glass-card p-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Project Updates</h2>
                <div className="space-y-6">
                  {project.updates.map((update, index) => (
                    <div key={index} className="border-l-2 border-cyan-500 pl-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm text-gray-400">{update.date}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{update.title}</h3>
                      <p className="text-gray-300">{update.content}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar - Donation Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="glass-card p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Support This Project</h2>
                  
                  <form onSubmit={handleDonation} className="space-y-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Donation Amount (ADA)</label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        className="bg-midnight-800/50 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Message (Optional)</label>
                      <Textarea
                        placeholder="Leave an encouraging message for the researchers..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="bg-midnight-800/50 border-white/20 text-white placeholder:text-gray-400 min-h-20"
                      />
                    </div>

                    <Button type="submit" className="web3-button w-full">
                      <CircleDollarSign className="h-4 w-4 mr-2" />
                      Donate & Mint NFT
                    </Button>
                  </form>

                  <div className="mt-6 p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DiamondPercent className="h-4 w-4 text-violet-400" />
                      <span className="text-violet-400 font-medium">NFT Receipt</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      You'll receive a unique NFT as proof of your donation, including project details and transaction hash.
                    </p>
                  </div>

                  {/* Quick Amounts */}
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-3">Quick amounts:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[50, 100, 250].map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setDonationAmount(amount.toString())}
                          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          {amount} ADA
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Creator Info */}
                <Card className="glass-card p-6 mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Project Creator</h3>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{project.creator}</div>
                      <div className="text-sm text-gray-400">{project.institution}</div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-white/20 text-gray-300 hover:text-white">
                    View Profile
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
