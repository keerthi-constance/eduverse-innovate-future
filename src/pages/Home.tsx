
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { 
  GraduationCap, 
  FlaskConical, 
  CircleDollarSign, 
  Diamond,
  DiamondPercent,
  Wallet,
  Plus,
  Search
} from 'lucide-react';

const Home = () => {
  const stats = [
    { label: 'Projects Funded', value: '2,847', icon: FlaskConical },
    { label: 'ADA Raised', value: '1.2M', icon: CircleDollarSign },
    { label: 'Students Supported', value: '12,456', icon: GraduationCap },
    { label: 'NFTs Minted', value: '8,932', icon: Diamond }
  ];

  const features = [
    {
      icon: DiamondPercent,
      title: 'NFT Donation Receipts',
      description: 'Receive unique NFTs as proof of your contribution to student research projects.'
    },
    {
      icon: FlaskConical,
      title: 'Verified Research',
      description: 'All projects undergo rigorous review to ensure legitimate academic research.'
    },
    {
      icon: CircleDollarSign,
      title: 'Transparent Funding',
      description: 'Track exactly how your ADA contributions are used with blockchain transparency.'
    }
  ];

  return (
    <div className="min-h-screen bg-hero-gradient">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Support Tomorrow's Innovators
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Empower student researchers worldwide through blockchain-powered crowdfunding. 
              Fund breakthrough discoveries and earn exclusive NFT receipts.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button className="web3-button text-lg px-8 py-4">
                <Wallet className="h-5 w-5 mr-2" />
                Connect Wallet
              </Button>
              <Link to="/browse">
                <Button variant="outline" className="text-lg px-8 py-4 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                  <Search className="h-5 w-5 mr-2" />
                  Browse Projects
                </Button>
              </Link>
              <Link to="/create">
                <Button variant="outline" className="text-lg px-8 py-4 border-2 border-violet-500 text-violet-400 hover:bg-violet-500/10">
                  <Plus className="h-5 w-5 mr-2" />
                  Start a Project
                </Button>
              </Link>
            </div>

            {/* Floating Animation Elements */}
            <div className="relative">
              <div className="absolute -top-10 left-10 animate-float">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full opacity-20 blur-xl"></div>
              </div>
              <div className="absolute -top-5 right-20 animate-float" style={{ animationDelay: '1s' }}>
                <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full opacity-30 blur-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="glass-card p-6 text-center animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-cyan-400" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Why Choose EduFund?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The future of academic funding is here. Transparent, secure, and rewarding.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card p-8 text-center animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-2xl flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Card className="glass-card p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Support Innovation?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of supporters helping fund the next generation of groundbreaking research.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="web3-button text-lg px-8 py-4">
                <Wallet className="h-5 w-5 mr-2" />
                Connect Wallet & Start
              </Button>
              <Link to="/browse">
                <Button variant="outline" className="text-lg px-8 py-4 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                  Explore Projects
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
