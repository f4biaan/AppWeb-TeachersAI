import { AIAssessment, ReAssessment } from "./assessment";

export interface studentAssessment {
  id: string;
  name: string;
  email: string;
  username: string;
  submission: string;
  fileType: string;
  statusAssessment: 'reviewed' | 'pending' | 'missing';
  // aiAssessment?: string;
  aiAssessment?: AIAssessment;
  reAssessment?: ReAssessment;
}
