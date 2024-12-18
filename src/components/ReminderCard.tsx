import { Reminder } from "@/types/reminder";
import { getColorForDueDate } from "@/utils/dateUtils";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";

interface ReminderCardProps {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
}

export const ReminderCard = ({ reminder, onEdit, onDelete }: ReminderCardProps) => {
  const colorClass = getColorForDueDate(reminder.dueDate);

  return (
    <Card className={`${colorClass} transition-colors duration-200`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="font-semibold text-lg">{reminder.title}</h3>
        <div className="space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(reminder)}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(reminder.id)}
            className="h-8 w-8 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
        <p className="text-xs text-gray-500">
          Due: {format(new Date(reminder.dueDate), "PPP")}
        </p>
      </CardContent>
    </Card>
  );
};