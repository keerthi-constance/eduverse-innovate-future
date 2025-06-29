
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import ProjectCard from '@/components/ProjectCard';
import { Search, Filter, FlaskConical } from 'lucide-react';

const BrowseProjects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');

  // Mock project data
  const projects = [
    {
      id: '1',
      title: 'AI-Powered Medical Diagnosis for Rural Areas',
      description: 'Developing machine learning algorithms to assist healthcare workers in remote locations with accurate medical diagnoses using mobile devices.',
      category: 'AI',
      goalAda: 50000,
      raisedAda: 35750,
      backers: 124,
      daysLeft: 23,
      image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop'
    },
    {
      id: '2', 
      title: 'Sustainable Energy Storage Research',
      description: 'Investigating novel battery technologies using organic compounds to create environmentally friendly energy storage solutions.',
      category: 'Technology',
      goalAda: 75000,
      raisedAda: 42500,
      backers: 89,
      daysLeft: 31,
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop'
    },
    {
      id: '3',
      title: 'Quantum Computing Algorithms for Drug Discovery',
      description: 'Developing quantum algorithms to accelerate the discovery of new pharmaceutical compounds and reduce drug development costs.',
      category: 'Health',
      goalAda: 100000,
      raisedAda: 67800,
      backers: 203,
      daysLeft: 15,
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop'
    },
    {
      id: '4',
      title: 'Climate Change Impact on Marine Ecosystems',
      description: 'Comprehensive study of how rising ocean temperatures affect coral reef biodiversity and marine life patterns.',
      category: 'Environment',
      goalAda: 40000,
      raisedAda: 28900,
      backers: 156,
      daysLeft: 42,
      image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=300&fit=crop'
    },
    {
      id: '5',
      title: 'Neural Interface for Prosthetic Control',
      description: 'Creating advanced brain-computer interfaces to give amputees more natural control over prosthetic limbs.',
      category: 'Health',
      goalAda: 80000,
      raisedAda: 51200,
      backers: 178,
      daysLeft: 28,
      image: 'https://images.unsplash.com/photo-1473091534298-04dcbce3278c?w=400&h=300&fit=crop'
    },
    {
      id: '6',
      title: 'Blockchain-Based Academic Credential System',
      description: 'Building a decentralized platform for verifying and storing academic credentials to prevent fraud and increase accessibility.',
      category: 'Technology',
      goalAda: 35000,
      raisedAda: 19800,
      backers: 95,
      daysLeft: 37,
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop'
    }
  ];

  const categories = ['all', 'AI', 'Technology', 'Health', 'Environment'];
  const sortOptions = [
    { value: 'trending', label: 'Trending' },
    { value: 'newest', label: 'Newest' },
    { value: 'funding', label: 'Most Funded' },
    { value: 'ending', label: 'Ending Soon' }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-web3-gradient">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Discover Research Projects
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Support innovative student research projects and help shape the future of science and technology.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="glass-card p-6 rounded-2xl mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-midnight-800/50 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 bg-midnight-800/50 border-white/20 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-midnight-800 border-white/20">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-white hover:bg-midnight-700">
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48 bg-midnight-800/50 border-white/20 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-midnight-800 border-white/20">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-midnight-700">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                  <FlaskConical className="h-3 w-3 mr-1" />
                  {selectedCategory}
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary" className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                  <Search className="h-3 w-3 mr-1" />
                  "{searchTerm}"
                </Badge>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-400">
              Showing {filteredProjects.length} of {projects.length} projects
            </p>
            <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
              View Map
            </Button>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <div key={project.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <ProjectCard {...project} />
              </div>
            ))}
          </div>

          {/* Load More */}
          {filteredProjects.length > 0 && (
            <div className="text-center mt-12">
              <Button className="web3-button">
                Load More Projects
              </Button>
            </div>
          )}

          {/* No Results */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <FlaskConical className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search criteria or browse all categories.</p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="web3-button"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseProjects;
