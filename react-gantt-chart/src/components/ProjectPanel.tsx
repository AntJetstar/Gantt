import React, { useState } from 'react';
import styled from 'styled-components';
import { Project } from '../types';
import { format } from 'date-fns';

const PanelContainer = styled.div`
  width: 400px;
  background: white;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const PanelHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
`;

const PanelTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #212529;
`;

const AddButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #0056b3;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const ProjectsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const ProjectItem = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const ProjectName = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #212529;
  flex: 1;
`;

const ColorDot = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-left: 8px;
  margin-top: 4px;
`;

const ProjectDates = styled.div`
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #6c757d;
`;

const DateInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DateLabel = styled.span`
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DateValue = styled.span`
  color: #212529;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 18px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #212529;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #495057;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const ColorInput = styled.input`
  width: 50px;
  height: 38px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border: 1px solid ${props => props.variant === 'primary' ? '#007bff' : '#6c757d'};
  border-radius: 6px;
  background: ${props => props.variant === 'primary' ? '#007bff' : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : '#6c757d'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#0056b3' : '#f8f9fa'};
    border-color: ${props => props.variant === 'primary' ? '#0056b3' : '#5a6268'};
    color: ${props => props.variant === 'primary' ? 'white' : '#5a6268'};
  }
`;

interface ProjectPanelProps {
  projects: Project[];
  onAddProject: (project: Omit<Project, 'id'>) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
}

export default function ProjectPanel({ 
  projects, 
  onAddProject, 
  onUpdateProject, 
  onDeleteProject 
}: ProjectPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    airport: '',
    startDate: '',
    endDate: '',
    color: '#007bff'
  });

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        airport: project.airport,
        startDate: format(project.startDate, 'yyyy-MM-dd'),
        endDate: format(project.endDate, 'yyyy-MM-dd'),
        color: project.color
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        airport: '',
        startDate: '',
        endDate: '',
        color: '#007bff'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData = {
      name: formData.name,
      airport: formData.airport,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      color: formData.color
    };

    if (editingProject) {
      onUpdateProject(editingProject.id, projectData);
    } else {
      onAddProject(projectData);
    }
    
    handleCloseModal();
  };

  return (
    <PanelContainer>
      <PanelHeader>
        <PanelTitle>Projects</PanelTitle>
        <AddButton onClick={() => handleOpenModal()}>
          + Add Project
        </AddButton>
      </PanelHeader>
      
      <ProjectsList>
        {projects.map(project => (
          <ProjectItem key={project.id}>
            <ProjectHeader>
              <ProjectName onClick={() => handleOpenModal(project)}>
                {project.name}
              </ProjectName>
              <ColorDot color={project.color} />
              <DeleteButton onClick={() => onDeleteProject(project.id)}>
                ×
              </DeleteButton>
            </ProjectHeader>
            
            <ProjectDates>
              <DateInfo>
                <DateLabel>Airport</DateLabel>
                <DateValue>{project.airport}</DateValue>
              </DateInfo>
              <DateInfo>
                <DateLabel>Start</DateLabel>
                <DateValue>{format(project.startDate, 'MMM dd, yyyy')}</DateValue>
              </DateInfo>
              <DateInfo>
                <DateLabel>End</DateLabel>
                <DateValue>{format(project.endDate, 'MMM dd, yyyy')}</DateValue>
              </DateInfo>
            </ProjectDates>
          </ProjectItem>
        ))}
      </ProjectsList>

      {isModalOpen && (
        <Modal>
          <ModalContent>
          <ModalTitle>
            {editingProject ? 'Edit Project' : 'Add New Project'}
          </ModalTitle>
          
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="airport">Airport</Label>
              <Input
                id="airport"
                type="text"
                value={formData.airport}
                onChange={(e) => setFormData({...formData, airport: e.target.value})}
                placeholder="e.g., JFK, LAX, ORD"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="color">Color</Label>
              <ColorInput
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
              />
            </FormGroup>
            
            <ButtonGroup>
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingProject ? 'Update' : 'Add'} Project
              </Button>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </Modal>
      )}
    </PanelContainer>
  );
}