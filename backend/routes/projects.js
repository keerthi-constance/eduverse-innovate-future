import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { projectSchema } from '../utils/validation.js';
import { createValidationMiddleware } from '../utils/validation.js';
import Project from '../models/Project.js';

const router = express.Router();

// Validation middleware
const validateProject = createValidationMiddleware(projectSchema);

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
router.get('/', async (req, res) => {
  try {
    logger.info('📋 [PROJECTS] Get all projects request');
    
    const projects = await Project.find({})
      .populate('student', 'name walletAddress institution')
      .sort({ createdAt: -1 });

    // Map student._id to student.id for all projects
    const projectsWithMappedIds = projects.map(project => {
      const projectObj = project.toObject();
      if (projectObj.student && projectObj.student._id) {
        projectObj.student.id = projectObj.student._id.toString();
        delete projectObj.student._id;
      }
      return projectObj;
    });

    res.status(200).json({
      success: true,
      data: {
        projects: projectsWithMappedIds
      }
    });

  } catch (error) {
    logger.error('📋 [PROJECTS] Get all projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get projects',
      error: error.message
    });
  }
});

// @desc    Get my projects
// @route   GET /api/projects/my-projects
// @access  Private
router.get('/my-projects', protect, async (req, res) => {
  try {
    logger.info('📋 [PROJECTS] Get my projects request:', {
      userId: req.user.id
    });

    const projects = await Project.getProjectsByStudent(req.user.id)
      .populate('student', 'name walletAddress institution')
      .sort({ createdAt: -1 });

    // Map student._id to student.id for all projects
    const projectsWithMappedIds = projects.map(project => {
      const projectObj = project.toObject();
      if (projectObj.student && projectObj.student._id) {
        projectObj.student.id = projectObj.student._id.toString();
        delete projectObj.student._id;
      }
      return projectObj;
    });

    res.status(200).json({
      success: true,
      data: {
        projects: projectsWithMappedIds
      }
    });

  } catch (error) {
    logger.error('📋 [PROJECTS] Get my projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get my projects',
      error: error.message
    });
  }
});

// @desc    Search projects
// @route   GET /api/projects/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { query, category } = req.query;
    
    logger.info('📋 [PROJECTS] Search projects request:', {
      query,
      category
    });

    let projects;
    
    if (query) {
      projects = await Project.searchProjects(query);
    } else if (category) {
      projects = await Project.getProjectsByCategory(category);
    } else {
      projects = await Project.getActiveProjects();
    }

    res.status(200).json({
      success: true,
      data: {
        projects
      }
    });

  } catch (error) {
    logger.error('📋 [PROJECTS] Search projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search projects',
      error: error.message
    });
  }
});

// @desc    Get projects by category
// @route   GET /api/projects/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    logger.info(`📋 [PROJECTS] Get projects by category: ${category}`);

    const projects = await Project.getProjectsByCategory(category)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        projects
      }
    });

  } catch (error) {
    logger.error('📋 [PROJECTS] Get projects by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get projects by category',
      error: error.message
    });
  }
});

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`📋 [PROJECTS] Get project by ID: ${id}`);
    
    const project = await Project.findById(id)
      .populate('student', 'name walletAddress institution')
      .populate('donations')
      .populate('nfts');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Map student._id to student.id if populated
    if (project.student && typeof project.student === 'object' && project.student._id) {
      project.student = {
        ...project.student.toObject(),
        id: project.student._id.toString()
      };
      delete project.student._id;
    }

    res.status(200).json({
      success: true,
      data: {
        project
      }
    });

  } catch (error) {
    logger.error('📋 [PROJECTS] Get project by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get project',
      error: error.message
    });
  }
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Students only)
router.post('/', protect, authorize('student'), validateProject, async (req, res) => {
  try {
    const projectData = req.body;
    logger.info('📋 [PROJECTS] Create project request:', {
      userId: req.user.id,
      projectTitle: projectData.title,
      receivedData: projectData,
      institutionValue: projectData.institution,
      institutionType: typeof projectData.institution,
      institutionLength: projectData.institution ? projectData.institution.length : 'undefined'
    });

    const project = new Project({
      ...projectData,
      student: req.user.id,
      status: 'pending', // Projects need approval
      currentFunding: 0
    });
    
    await project.save();

    // Populate student info for response
    await project.populate('student', 'name walletAddress institution');

    logger.info('📋 [PROJECTS] Project created successfully:', {
      projectId: project._id,
      title: project.title
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully and pending approval',
      data: {
        project
      }
    });

  } catch (error) {
    logger.error('📋 [PROJECTS] Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Project owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    logger.info(`📋 [PROJECTS] Update project request:`, {
      projectId: id,
      userId: req.user.id
    });

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project
    if (project.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('student', 'name walletAddress institution');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project: updatedProject
      }
    });

  } catch (error) {
    logger.error('📋 [PROJECTS] Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Project owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info(`📋 [PROJECTS] Delete project request:`, {
      projectId: id,
      userId: req.user.id
    });

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project
    if (project.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    await Project.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    logger.error('📋 [PROJECTS] Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
});

export default router; 