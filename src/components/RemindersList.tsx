import { Reminder } from "@/types/reminder";
import { ReminderCard } from "./ReminderCard";

interface RemindersListProps {
  reminders: Reminder[];
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string, archived: boolean) => void;
  title: string;
}

export const RemindersList = ({ reminders, onEdit, onDelete, onArchive, title }: RemindersListProps) => {
  if (reminders.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reminders.map((reminder) => (
          <ReminderCard
            key={reminder.id}
            reminder={reminder}
            onEdit={onEdit}
            onDelete={onDelete}
            onArchive={onArchive}
          />
        ))}
      </div>
    </div>
  );
};