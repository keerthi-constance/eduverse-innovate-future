import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/apiService';

// Types
export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  fundingGoal: number;
  currentFunding: number;
  deadline: string;
  status: 'active' | 'funded' | 'expired';
  tags: string[];
  attachments: string[];
  student: {
    id: string;
    name: string;
    walletAddress: string;
    institution: string;
    fieldOfStudy: string;
  };
  donations: any[];
  nfts: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  title: string;
  description: string;
  category: string;
  fundingGoal: number;
  deadline: string;
  tags?: string[];
  attachments?: string[];
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}

// Query keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: any) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  myProjects: () => [...projectKeys.all, 'my-projects'] as const,
  byCategory: (category: string) => [...projectKeys.all, 'category', category] as const,
  students: (country: string) => [...projectKeys.all, 'students', country] as const,
};

// Hooks
export const useProjects = (filters?: any) => {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => apiService.projects.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => apiService.projects.getById(id),
    enabled: !!id && id !== 'undefined' && id.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyProjects = () => {
  return useQuery({
    queryKey: projectKeys.myProjects(),
    queryFn: () => apiService.projects.getMyProjects(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useProjectsByCategory = (category: string, filters?: any) => {
  return useQuery({
    queryKey: projectKeys.byCategory(category),
    queryFn: () => apiService.projects.getByCategory(category, filters),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
};

export const useStudentsByCountry = (country: string = 'Sri Lanka') => {
  return useQuery({
    queryKey: projectKeys.students(country),
    queryFn: () => apiService.projects.getStudentsByCountry(country),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSearchProjects = (query: string, filters?: any) => {
  return useQuery({
    queryKey: [...projectKeys.lists(), 'search', query, filters],
    queryFn: () => apiService.projects.search(query, filters),
    enabled: !!query && query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
};

// Mutations
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectData) => apiService.projects.create(data),
    onSuccess: () => {
      // Invalidate and refetch projects lists
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.myProjects() });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectData }) =>
      apiService.projects.update(id, data),
    onSuccess: (data, variables) => {
      // Update the specific project in cache
      queryClient.setQueryData(projectKeys.detail(variables.id), data);
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.myProjects() });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.projects.delete(id),
    onSuccess: (data, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.myProjects() });
    },
  });
};

// Utility functions
export const getProjectProgress = (project: Project): number => {
  return Math.min((project.currentFunding / project.fundingGoal) * 100, 100);
};

export const getProjectStatus = (project: Project): 'active' | 'funded' | 'expired' => {
  if (project.status === 'funded') return 'funded';
  if (new Date(project.deadline) < new Date()) return 'expired';
  return 'active';
};

export const getProjectDaysLeft = (project: Project): number => {
  const deadline = new Date(project.deadline);
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const formatProjectAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ADA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}; 
 
 