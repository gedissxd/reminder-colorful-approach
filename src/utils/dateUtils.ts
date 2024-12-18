import { differenceInDays, parseISO, isAfter } from "date-fns";

export const getColorForDueDate = (dueDate: string) => {
  const today = new Date();
  const dueDateObj = parseISO(dueDate);
  const daysLeft = differenceInDays(dueDateObj, today);

  if (daysLeft === 0) return "bg-red-100 border-red-300";
  if (daysLeft <= 2 && daysLeft > 0) return "bg-yellow-100 border-yellow-300";
  return "bg-white border-gray-200";
};

export const isPastDue = (dueDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  const dueDateObj = parseISO(dueDate);
  return isAfter(today, dueDateObj);
};