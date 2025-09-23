import React, { useState } from 'react';
import styled from 'styled-components';
import ProjectPanel from './components/ProjectPanel';
import GanttChart from './components/GanttChart';
import { Project, TimeScale } from './types';
import { v4 as uuidv4 } from 'uuid';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background-color: #f8f9fa;
`;

const Header = styled.header`
  height: 60px;
  background: white;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  padding: 0 24px;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

const BottomSidebar = styled.div`
  height: 80px;
  background: white;
  border-top: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 32px;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #212529;
`;

const ColumnWidthControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 16px;
  font-size: 14px;
  color: #495057;
`;

const ImportExportControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: 16px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #007bff;
  border-radius: 6px;
  background: white;
  color: #007bff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #007bff;
    color: white;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const WidthSlider = styled.input`
  width: 120px;
  margin: 0 8px;
  
  &::-webkit-slider-thumb {
    appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #007bff;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #007bff;
    cursor: pointer;
    border: none;
  }
`;

const TimeScaleSelector = styled.select`
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const initialProjects: Project[] = [
  {
    id: uuidv4(),
    name: 'Website Redesign',
    airport: 'JFK',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-03-15'),
    color: '#007bff'
  },
  {
    id: uuidv4(),
    name: 'Mobile App Development',
    airport: 'LAX',
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-05-30'),
    color: '#28a745'
  },
  {
    id: uuidv4(),
    name: 'Database Migration',
    airport: 'ORD',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-02-15'),
    color: '#dc3545'
  },
  {
    id: uuidv4(),
    name: 'Security Audit',
    airport: 'ATL',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-04-15'),
    color: '#ffc107'
  }
];

function App() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [timeScale, setTimeScale] = useState<TimeScale>('weeks');
  const [columnWidth, setColumnWidth] = useState<number>(100);
  const [projectColumnWidth, setProjectColumnWidth] = useState<number>(200);

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: uuidv4(),
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map(project => 
      project.id === id ? { ...project, ...updates } : project
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const exportToJSON = () => {
    const exportData = {
      projects: projects.map(project => ({
        ...project,
        startDate: project.startDate.toISOString(),
        endDate: project.endDate.toISOString()
      })),
      settings: {
        timeScale,
        columnWidth,
        projectColumnWidth
      },
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `gantt-chart-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);
        
        // Validate and import projects
        if (importData.projects && Array.isArray(importData.projects)) {
          const importedProjects = importData.projects.map((project: any) => ({
            ...project,
            id: project.id || uuidv4(), // Ensure each project has an ID
            startDate: new Date(project.startDate),
            endDate: new Date(project.endDate)
          }));
          
          setProjects(importedProjects);
        }
        
        // Import settings if available
        if (importData.settings) {
          if (importData.settings.timeScale) {
            setTimeScale(importData.settings.timeScale);
          }
          if (importData.settings.columnWidth) {
            setColumnWidth(importData.settings.columnWidth);
          }
          if (importData.settings.projectColumnWidth) {
            setProjectColumnWidth(importData.settings.projectColumnWidth);
          }
        }
        
        alert('Projects imported successfully!');
      } catch (error) {
        alert('Error importing file. Please make sure it\'s a valid JSON file.');
        console.error('Import error:', error);
      }
    };
    
    reader.readAsText(file);
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const triggerFileInput = () => {
    document.getElementById('json-file-input')?.click();
  };

  return (
    <AppContainer>
      <Header>
        <Title>Ant's Chart Tool</Title>
      </Header>
      
      <MainContent>
        <ProjectPanel
          projects={projects}
          onAddProject={addProject}
          onUpdateProject={updateProject}
          onDeleteProject={deleteProject}
        />
        <GanttChart
          projects={projects}
          timeScale={timeScale}
          columnWidth={columnWidth}
          projectColumnWidth={projectColumnWidth}
        />
      </MainContent>
      
      <BottomSidebar>
        <ImportExportControls>
          <ActionButton onClick={exportToJSON}>
            📥 Export JSON
          </ActionButton>
          <ActionButton onClick={triggerFileInput}>
            📤 Import JSON
          </ActionButton>
          <HiddenFileInput
            id="json-file-input"
            type="file"
            accept=".json"
            onChange={importFromJSON}
          />
        </ImportExportControls>
        
        <ColumnWidthControl>
          <span>Date Column:</span>
          <WidthSlider
            type="range"
            min="10"
            max="200"
            value={columnWidth}
            onChange={(e) => setColumnWidth(Number(e.target.value))}
          />
          <span>{columnWidth}px</span>
        </ColumnWidthControl>
        
        <ColumnWidthControl>
          <span>Project Column:</span>
          <WidthSlider
            type="range"
            min="100"
            max="400"
            value={projectColumnWidth}
            onChange={(e) => setProjectColumnWidth(Number(e.target.value))}
          />
          <span>{projectColumnWidth}px</span>
        </ColumnWidthControl>
        
        <ColumnWidthControl>
          <span>Time Scale:</span>
          <TimeScaleSelector 
            value={timeScale} 
            onChange={(e) => setTimeScale(e.target.value as TimeScale)}
          >
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="quarters">Quarters</option>
            <option value="years">Years</option>
          </TimeScaleSelector>
        </ColumnWidthControl>
      </BottomSidebar>
    </AppContainer>
  );
}

export default App;
