import { differenceInDays, parseISO } from "date-fns";

export const getColorForDueDate = (dueDate: string) => {
  const today = new Date();
  const dueDateObj = parseISO(dueDate);
  const daysLeft = differenceInDays(dueDateObj, today);

  if (daysLeft === 0) return "bg-red-100 border-red-300";
  if (daysLeft <= 2 && daysLeft > 0) return "bg-yellow-100 border-yellow-300";
  return "bg-white border-gray-200";
};