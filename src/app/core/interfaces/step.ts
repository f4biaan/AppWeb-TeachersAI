export interface Step {
  id: string;
  title: string;
  status: 'todo' | 'done' | 'actual';
}
