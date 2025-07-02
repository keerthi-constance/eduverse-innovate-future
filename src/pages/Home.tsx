import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Heart, 
  GraduationCap, 
  Target, 
  Users, 
  DollarSign,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Student Research Funding",
      description: "Connect talented Sri Lankan students with global donors to fund innovative research projects."
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Transparent Donations",
      description: "Every donation is recorded on the Cardano blockchain for complete transparency and traceability."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "NFT Receipts",
      description: "Receive unique NFT receipts for your donations as proof of contribution and impact."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Global Community",
      description: "Join a community of donors and researchers working together to advance education and innovation."
    }
  ];

  const stats = [
    { label: "Projects Funded", value: "150+", icon: <Target className="h-5 w-5" /> },
    { label: "Students Supported", value: "200+", icon: <GraduationCap className="h-5 w-5" /> },
    { label: "Total Donations", value: "50,000+ ADA", icon: <DollarSign className="h-5 w-5" /> },
    { label: "Active Donors", value: "1,000+", icon: <Users className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-4" variant="secondary">
              Powered by Cardano Blockchain
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Fund the Future of
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}Sri Lankan Research
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect talented students with global donors through transparent, blockchain-powered funding. 
              Every donation creates real impact and comes with NFT receipts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/projects">
                  <Heart className="h-5 w-5 mr-2" />
                  Browse Projects
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/create-project">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Create Project
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <div className="text-blue-600">{stat.icon}</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose EduFund?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing how research gets funded through blockchain technology and global collaboration.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <div className="text-blue-600">{feature.icon}</div>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to fund research and make a difference
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Browse Projects</h3>
              <p className="text-gray-600">
                Explore research projects from talented Sri Lankan students across various fields.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Make a Donation</h3>
              <p className="text-gray-600">
                Connect your Cardano wallet and donate ADA to support the projects you believe in.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get NFT Receipt</h3>
              <p className="text-gray-600">
                Receive a unique NFT receipt as proof of your contribution and track the project's progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of donors supporting the next generation of Sri Lankan researchers and innovators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/projects">
                <Heart className="h-5 w-5 mr-2" />
                Start Donating
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
