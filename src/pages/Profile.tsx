import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { 
  User, 
  GraduationCap, 
  Heart, 
  Wallet, 
  Edit, 
  Save, 
  X,
  MapPin,
  Building,
  BookOpen,
  Calendar,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';

const Profile: React.FC = () => {
  const { user, updateProfile, upgradeToStudent, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    location: {
      city: user?.location?.city || '',
      institution: user?.location?.institution || '',
    },
    studentInfo: {
      studentId: user?.studentInfo?.studentId || '',
      fieldOfStudy: user?.studentInfo?.fieldOfStudy || '',
      academicLevel: user?.studentInfo?.academicLevel || 'undergraduate',
      graduationYear: user?.studentInfo?.graduationYear || '',
      gpa: user?.studentInfo?.gpa || '',
      researchInterests: user?.studentInfo?.researchInterests || [],
    },
    donorInfo: {
      preferredCategories: user?.donorInfo?.preferredCategories || [],
    },
  });

  const [newResearchInterest, setNewResearchInterest] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentUpgradeData, setStudentUpgradeData] = useState({
    studentId: '',
    fieldOfStudy: '',
    academicLevel: 'undergraduate',
    institution: '',
  });

  const academicLevels = [
    { value: 'undergraduate', label: 'Undergraduate' },
    { value: 'postgraduate', label: 'Postgraduate' },
    { value: 'phd', label: 'PhD' },
    { value: 'research', label: 'Research' },
  ];

  const categories = [
    'Technology', 'Science', 'Engineering', 'Medicine', 'Arts',
    'Business', 'Education', 'Environment', 'Social Impact', 'Other'
  ];

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleUpgradeToStudent = async () => {
    // Check if any required field is missing
    const missing =
      !formData.name ||
      !formData.location.institution ||
      !formData.studentInfo.studentId ||
      !formData.studentInfo.fieldOfStudy ||
      !formData.studentInfo.academicLevel;

    if (missing) {
      // Pre-fill modal with any available data
      setStudentUpgradeData({
        studentId: formData.studentInfo.studentId || '',
        fieldOfStudy: formData.studentInfo.fieldOfStudy || '',
        academicLevel: formData.studentInfo.academicLevel || 'undergraduate',
        institution: formData.location.institution || '',
      });
      setShowStudentModal(true);
      return;
    }

    setIsUpgrading(true);
    try {
      await upgradeToStudent({
        ...formData.studentInfo,
        institution: formData.location.institution,
        city: formData.location.city,
      });
      toast.success('Successfully upgraded to student role!');
    } catch (error) {
      toast.error('Failed to upgrade to student');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleStudentModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentUpgradeData.studentId || !studentUpgradeData.fieldOfStudy || !studentUpgradeData.academicLevel || !studentUpgradeData.institution) {
      toast.error('Please fill in all required student information');
      return;
    }
    setIsUpgrading(true);
    try {
      await upgradeToStudent({
        ...studentUpgradeData,
        institution: studentUpgradeData.institution,
        city: formData.location.city,
      });
      toast.success('Successfully upgraded to student role!');
      setShowStudentModal(false);
    } catch (error) {
      toast.error('Failed to upgrade to student');
    } finally {
      setIsUpgrading(false);
    }
  };

  const addResearchInterest = () => {
    if (newResearchInterest.trim() && !formData.studentInfo.researchInterests.includes(newResearchInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        studentInfo: {
          ...prev.studentInfo,
          researchInterests: [...prev.studentInfo.researchInterests, newResearchInterest.trim()]
        }
      }));
      setNewResearchInterest('');
    }
  };

  const removeResearchInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      studentInfo: {
        ...prev.studentInfo,
        researchInterests: prev.studentInfo.researchInterests.filter(i => i !== interest)
      }
    }));
  };

  const addCategory = () => {
    if (newCategory && !formData.donorInfo.preferredCategories.includes(newCategory)) {
      setFormData(prev => ({
        ...prev,
        donorInfo: {
          ...prev.donorInfo,
          preferredCategories: [...prev.donorInfo.preferredCategories, newCategory]
        }
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      donorInfo: {
        ...prev.donorInfo,
        preferredCategories: prev.donorInfo.preferredCategories.filter(c => c !== category)
      }
    }));
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">Please connect your wallet to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account and preferences</p>
          </div>
          <div className="flex items-center space-x-2">
            {user.role === 'donor' && (
              <Button
                onClick={handleUpgradeToStudent}
                disabled={isUpgrading}
                className="bg-green-600 hover:bg-green-700"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                {isUpgrading ? 'Upgrading...' : 'Upgrade to Student'}
              </Button>
            )}
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          {user.role === 'donor' && <TabsTrigger value="donor">Donor Info</TabsTrigger>}
          {user.role === 'student' && <TabsTrigger value="student">Student Info</TabsTrigger>}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {user.role === 'student' ? (
                  <GraduationCap className="h-5 w-5 text-green-600" />
                ) : (
                  <Heart className="h-5 w-5 text-red-600" />
                )}
                <span>Account Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{user.name || 'Not set'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wallet className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Wallet:</span>
                      <span className="font-mono text-xs">
                        {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Role:</span>
                      <Badge variant={user.role === 'student' ? 'default' : 'secondary'}>
                        {user.role === 'student' ? 'Sri Lankan Student' : 'Global Donor'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Location</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Country:</span>
                      <span className="font-medium">{user.location?.country || 'Not set'}</span>
                    </div>
                    {user.location?.city && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">City:</span>
                        <span className="font-medium">{user.location.city}</span>
                      </div>
                    )}
                    {user.location?.institution && (
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Institution:</span>
                        <span className="font-medium">{user.location.institution}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {user.role === 'donor' && user.donorInfo && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Donor Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {user.donorInfo.totalDonated} ADA
                      </div>
                      <div className="text-sm text-blue-600">Total Donated</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {user.donorInfo.donationCount}
                      </div>
                      <div className="text-sm text-green-600">Donations Made</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {user.donorInfo.supporterRank}
                      </div>
                      <div className="text-sm text-purple-600">Supporter Rank</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>
                Update your basic profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    value={formData.location.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, city: e.target.value }
                    }))}
                    disabled={!isEditing}
                    placeholder="Enter your city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution
                  </label>
                  <Input
                    value={formData.location.institution}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, institution: e.target.value }
                    }))}
                    disabled={!isEditing}
                    placeholder="University or organization"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Info Tab */}
        {user.role === 'student' && (
          <TabsContent value="student">
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
                <CardDescription>
                  Your academic and research details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student ID
                    </label>
                    <Input
                      value={formData.studentInfo.studentId}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        studentInfo: { ...prev.studentInfo, studentId: e.target.value }
                      }))}
                      disabled={!isEditing}
                      placeholder="Enter your student ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field of Study
                    </label>
                    <Input
                      value={formData.studentInfo.fieldOfStudy}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        studentInfo: { ...prev.studentInfo, fieldOfStudy: e.target.value }
                      }))}
                      disabled={!isEditing}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Academic Level
                    </label>
                    <Select
                      value={formData.studentInfo.academicLevel}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        studentInfo: { ...prev.studentInfo, academicLevel: value as any }
                      }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {academicLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Graduation Year
                    </label>
                    <Input
                      type="number"
                      value={formData.studentInfo.graduationYear}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        studentInfo: { ...prev.studentInfo, graduationYear: parseInt(e.target.value) || undefined }
                      }))}
                      disabled={!isEditing}
                      placeholder="2025"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GPA
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={formData.studentInfo.gpa}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        studentInfo: { ...prev.studentInfo, gpa: parseFloat(e.target.value) || undefined }
                      }))}
                      disabled={!isEditing}
                      placeholder="3.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Research Interests
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        value={newResearchInterest}
                        onChange={(e) => setNewResearchInterest(e.target.value)}
                        disabled={!isEditing}
                        placeholder="Add a research interest"
                        onKeyPress={(e) => e.key === 'Enter' && addResearchInterest()}
                      />
                      {isEditing && (
                        <Button onClick={addResearchInterest} size="sm">
                          Add
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.studentInfo.researchInterests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                          <span>{interest}</span>
                          {isEditing && (
                            <button
                              onClick={() => removeResearchInterest(interest)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Donor Info Tab */}
        {user.role === 'donor' && (
          <TabsContent value="donor">
            <Card>
              <CardHeader>
                <CardTitle>Donor Preferences</CardTitle>
                <CardDescription>
                  Manage your donation preferences and categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Categories
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Select
                        value={newCategory}
                        onValueChange={setNewCategory}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isEditing && (
                        <Button onClick={addCategory} size="sm">
                          Add
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.donorInfo.preferredCategories.map((category, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                          <span>{category}</span>
                          {isEditing && (
                            <button
                              onClick={() => removeCategory(category)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={showStudentModal} onOpenChange={setShowStudentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to Student</DialogTitle>
            <DialogDescription>
              Please provide your student details to upgrade your account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStudentModalSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
              <Input
                value={studentUpgradeData.studentId}
                onChange={e => setStudentUpgradeData(prev => ({ ...prev, studentId: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study *</label>
              <Input
                value={studentUpgradeData.fieldOfStudy}
                onChange={e => setStudentUpgradeData(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Level *</label>
              <Select
                value={studentUpgradeData.academicLevel}
                onValueChange={value => setStudentUpgradeData(prev => ({ ...prev, academicLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {academicLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
              <Input
                value={studentUpgradeData.institution}
                onChange={e => setStudentUpgradeData(prev => ({ ...prev, institution: e.target.value }))}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isUpgrading}>
                {isUpgrading ? 'Upgrading...' : 'Upgrade'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile; 