export interface Assessment {
  id: string;
  submission: string;
  fileType: string;
  status: 'reviewed' | 'pending' | 'missing';
  aiAssessment?: AIAssessment;
  reAssessment?: ReAssessment;
  feedback?: string;
}

export interface AIAssessment {
  aiGenerration: string;
  generationRating: 'good' | 'bad' | undefined;
  globalGrade: number;
  componentsGrades: Record<string, ComponentGrade>;
}

export interface ReAssessment {
  aiGenerration: string;
  teacherComment: string;
  generationRating: 'good' | 'bad' | undefined;
  globalGrade: number;
  componentsGrades: Record<string, ComponentGrade>;
}

export interface ComponentGrade {
  content: string;
  grade: number;
  maxGrade: number;
}
