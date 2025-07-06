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
  Shield,
  Globe,
  Award,
  ArrowRight
} from 'lucide-react';

const About: React.FC = () => {
  const team = [
    {
      name: "Dr. Sarah Johnson",
      role: "Founder & CEO",
      bio: "Former research director with 15+ years in academic funding and blockchain technology.",
      avatar: "👩‍🔬"
    },
    {
      name: "Prof. Michael Chen",
      role: "Chief Technology Officer",
      bio: "Blockchain expert and former professor at leading universities in Asia.",
      avatar: "👨‍💻"
    },
    {
      name: "Dr. Priya Patel",
      role: "Head of Research",
      bio: "Specialist in research methodology and academic project evaluation.",
      avatar: "👩‍🎓"
    }
  ];

  const values = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Transparency",
      description: "Every transaction is recorded on the Cardano blockchain for complete transparency and accountability."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Impact",
      description: "Connecting talented students worldwide with donors who want to make a real difference."
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Quality Research",
      description: "Rigorous vetting process ensures only high-quality, legitimate research projects are funded."
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Community",
      description: "Building a supportive community of researchers, donors, and innovators."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            About EduFund
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Revolutionizing
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}Research Funding
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            EduFund is a blockchain-powered platform that connects talented students with global donors, 
            making research funding transparent, accessible, and impactful.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We believe that great research should never be limited by funding constraints. 
                Our mission is to democratize research funding by leveraging blockchain technology 
                to create a transparent, efficient, and accessible platform for students and donors.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                By connecting talented researchers with passionate donors, we're building a future 
                where innovative ideas can flourish regardless of geographical or financial barriers.
              </p>
              <Button size="lg" asChild>
                <Link to="/projects">
                  <Heart className="h-5 w-5 mr-2" />
                  Start Supporting
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">150+</div>
                  <div className="text-gray-600">Projects Funded</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-3xl font-bold text-purple-600 mb-2">200+</div>
                  <div className="text-gray-600">Students Supported</div>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
                  <div className="text-gray-600">ADA Raised</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-3xl font-bold text-orange-600 mb-2">1K+</div>
                  <div className="text-gray-600">Active Donors</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <div className="text-blue-600">{value.icon}</div>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How EduFund Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A simple, transparent process for funding research
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Students Apply</h3>
              <p className="text-gray-600">
                Students submit their research proposals with detailed methodology, 
                objectives, and funding requirements.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Projects Vetted</h3>
              <p className="text-gray-600">
                Our expert team reviews each project for quality, feasibility, 
                and potential impact before approval.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Donors Fund</h3>
              <p className="text-gray-600">
                Global donors browse projects and contribute ADA directly to 
                the research they want to support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The passionate individuals behind EduFund
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-4">{member.avatar}</div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="font-medium text-blue-600">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Join the Revolution
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Be part of the future of research funding. Whether you're a student with a great idea 
            or a donor who wants to make a difference, we're here to help.
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
      </section>
    </div>
  );
};

export default About; 
 
 