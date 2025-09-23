import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Project, TimeScale, TimelineItem } from '../types';
import { 
  format, 
  startOfWeek, 
  endOfWeek,
  startOfMonth, 
  endOfMonth,
  startOfQuarter, 
  endOfQuarter,
  startOfYear,
  endOfYear,
  addDays, 
  addWeeks, 
  addMonths, 
  addYears,
  addQuarters,
  differenceInDays,
  isSameMonth,
  isSameQuarter,
  getQuarter,
  min,
  max
} from 'date-fns';

const ChartContainer = styled.div`
  flex: 1;
  background: white;
  overflow: auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
`;

const TimelineHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  border-bottom: 2px solid #dee2e6;
`;

const TimelineRow = styled.div`
  display: flex;
  border-bottom: 1px solid #e9ecef;
`;

const TimelineCell = styled.div<{ width: number; isHeader?: boolean }>`
  width: ${props => props.width}px;
  min-width: ${props => props.width}px;
  height: ${props => props.isHeader ? '40px' : '32px'};
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #e9ecef;
  font-size: ${props => props.isHeader ? '14px' : '12px'};
  font-weight: ${props => props.isHeader ? '600' : '400'};
  background: ${props => props.isHeader ? '#f8f9fa' : 'white'};
  color: ${props => props.isHeader ? '#495057' : '#6c757d'};
`;

const ChartBody = styled.div`
  flex: 1;
`;

const ProjectRow = styled.div`
  display: flex;
  align-items: center;
  height: 50px;
  border-bottom: 1px solid #f8f9fa;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const TimelineContainer = styled.div`
  display: flex;
  position: relative;
  flex: 1;
`;

const AirportLabel = styled.div`
  width: 80px;
  min-width: 80px;
  padding: 0 12px;
  background: white;
  border-right: 1px solid #dee2e6;
  font-weight: 500;
  color: #495057;
  display: flex;
  align-items: center;
  font-size: 14px;
`;

const ProjectLabel = styled.div<{ width: number }>`
  width: ${props => props.width}px;
  min-width: ${props => props.width}px;
  padding: 0 16px;
  background: white;
  border-right: 2px solid #dee2e6;
  font-weight: 500;
  color: #495057;
  display: flex;
  align-items: center;
`;

const GanttBar = styled.div<{ 
  color: string; 
  left: number; 
  width: number; 
  cellWidth: number;
  fontSize: number;
}>`
  position: absolute;
  left: ${props => props.left * props.cellWidth}px;
  width: ${props => props.width * props.cellWidth}px;
  height: 24px;
  background: ${props => props.color};
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  color: white;
  font-size: ${props => props.fontSize}px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6c757d;
  font-size: 16px;
`;

interface GanttChartProps {
  projects: Project[];
  timeScale: TimeScale;
  columnWidth: number;
  projectColumnWidth: number;
  fontSize: number;
}

export default function GanttChart({ projects, timeScale, columnWidth, projectColumnWidth, fontSize }: GanttChartProps) {
  const { timeline, cellWidth, startDate } = useMemo(() => {
    if (projects.length === 0) {
      return { timeline: [], cellWidth: columnWidth, startDate: new Date() };
    }

    const minDate = min(projects.map(p => p.startDate));
    const maxDate = max(projects.map(p => p.endDate));
    
    const timeline: TimelineItem[] = [];
    let start: Date;
    let end: Date;

    // Use the global column width instead of calculating responsive width
    const width = columnWidth;
    
    switch (timeScale) {
      case 'days':
        start = startOfWeek(minDate);
        end = endOfWeek(maxDate);
        
        let currentDay = start;
        while (currentDay <= end) {
          timeline.push({
            date: currentDay,
            label: format(currentDay, 'EEE dd'),
            isHeader: false
          });
          currentDay = addDays(currentDay, 1);
        }
        break;

      case 'weeks':
        start = startOfWeek(minDate);
        end = endOfWeek(maxDate);
        
        let currentWeek = start;
        while (currentWeek <= end) {
          timeline.push({
            date: currentWeek,
            label: format(currentWeek, 'MMM dd'),
            isHeader: false
          });
          currentWeek = addWeeks(currentWeek, 1);
        }
        break;

      case 'months':
        start = startOfMonth(minDate);
        end = endOfMonth(maxDate);
        
        let currentMonth = start;
        while (currentMonth <= end) {
          timeline.push({
            date: currentMonth,
            label: format(currentMonth, 'MMM yyyy'),
            isHeader: false
          });
          currentMonth = addMonths(currentMonth, 1);
        }
        break;

      case 'quarters':
        start = startOfQuarter(minDate);
        end = endOfQuarter(maxDate);
        
        let currentQuarter = start;
        while (currentQuarter <= end) {
          timeline.push({
            date: currentQuarter,
            label: `Q${getQuarter(currentQuarter)} ${format(currentQuarter, 'yyyy')}`,
            isHeader: false
          });
          currentQuarter = addQuarters(currentQuarter, 1);
        }
        break;

      case 'years':
        start = startOfYear(minDate);
        end = endOfYear(maxDate);
        
        let currentYear = start;
        while (currentYear <= end) {
          timeline.push({
            date: currentYear,
            label: format(currentYear, 'yyyy'),
            isHeader: false
          });
          currentYear = addYears(currentYear, 1);
        }
        break;
    }

    return { timeline, cellWidth: width, startDate: start };
  }, [projects, timeScale, columnWidth]);

  const calculateBarPosition = (project: Project) => {
    let startIndex = 0;
    let endIndex = 0;

    switch (timeScale) {
      case 'days':
        startIndex = differenceInDays(project.startDate, startDate);
        endIndex = differenceInDays(project.endDate, startDate);
        break;
      case 'weeks':
        startIndex = Math.floor(differenceInDays(project.startDate, startDate) / 7);
        endIndex = Math.ceil(differenceInDays(project.endDate, startDate) / 7);
        break;
      case 'months':
        startIndex = timeline.findIndex(item => 
          isSameMonth(item.date, project.startDate)
        );
        endIndex = timeline.findIndex(item => 
          isSameMonth(item.date, project.endDate)
        );
        if (endIndex === -1) endIndex = timeline.length - 1;
        break;
      case 'quarters':
        startIndex = timeline.findIndex(item => 
          isSameQuarter(item.date, project.startDate)
        );
        endIndex = timeline.findIndex(item => 
          isSameQuarter(item.date, project.endDate)
        );
        if (endIndex === -1) endIndex = timeline.length - 1;
        break;
      case 'years':
        startIndex = timeline.findIndex(item => 
          item.date.getFullYear() === project.startDate.getFullYear()
        );
        endIndex = timeline.findIndex(item => 
          item.date.getFullYear() === project.endDate.getFullYear()
        );
        if (endIndex === -1) endIndex = timeline.length - 1;
        break;
    }

    return {
      left: Math.max(0, startIndex),
      width: Math.max(1, endIndex - startIndex + 1)
    };
  };

  if (projects.length === 0) {
    return (
      <ChartContainer>
        <EmptyState>
          No projects to display. Add a project to get started.
        </EmptyState>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <TimelineHeader>
        <TimelineRow>
          <TimelineCell width={80} isHeader>
            Airport
          </TimelineCell>
          <TimelineCell width={projectColumnWidth} isHeader>
            Project
          </TimelineCell>
          {timeline.map((item, index) => (
            <TimelineCell 
              key={index} 
              width={cellWidth} 
              isHeader
            >
              {item.label}
            </TimelineCell>
          ))}
        </TimelineRow>
      </TimelineHeader>

      <ChartBody>
        {projects.map(project => {
          const { left, width } = calculateBarPosition(project);
          
          return (
            <ProjectRow key={project.id}>
              <AirportLabel>{project.airport}</AirportLabel>
              <ProjectLabel width={projectColumnWidth}>{project.name}</ProjectLabel>
              
              <TimelineContainer>
                {timeline.map((_, index) => (
                  <TimelineCell 
                    key={index} 
                    width={cellWidth}
                  />
                ))}
                
                <GanttBar
                  color={project.color}
                  left={left}
                  width={width}
                  cellWidth={cellWidth}
                  fontSize={fontSize}
                  title={`${project.name} (${project.airport})\n${format(project.startDate, 'MMM dd, yyyy')} - ${format(project.endDate, 'MMM dd, yyyy')}`}
                >
                  {width * cellWidth > 100 ? project.name : ''}
                </GanttBar>
              </TimelineContainer>
            </ProjectRow>
          );
        })}
      </ChartBody>
    </ChartContainer>
  );
}