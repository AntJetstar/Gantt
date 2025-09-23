export interface Project {
  id: string;
  name: string;
  airport: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

export type TimeScale = 'days' | 'weeks' | 'months' | 'quarters' | 'years';

export interface TimelineItem {
  date: Date;
  label: string;
  isHeader: boolean;
}