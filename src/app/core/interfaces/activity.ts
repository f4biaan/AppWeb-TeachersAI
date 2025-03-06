export interface Activity {
  id: string;
  name: string;
  createdAt: Date;
  teacherId: string;
  courseId: string;
  typeActivity: string;
  learningComponent: string;
  academicLevel: string;
  unitTheme: string;
  expectedLearningOutcomes: string;
  didacticStrategies: string;
  assessmentRubric: string;
  solution: string;
  lastUpdate: Date;
}
