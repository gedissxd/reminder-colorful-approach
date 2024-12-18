export interface Reminder {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  createdAt: string;
  archived: boolean;
}