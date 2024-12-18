import { RemindersList } from "@/components/RemindersList";
import { ReminderForm } from "@/components/ReminderForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Reminder } from "@/types/reminder";
import { isPastDue } from "@/utils/dateUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { useState, useMemo } from "react";

const Index = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reminders
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["reminders"],
    queryFn: async () => {
      console.log("Fetching reminders...");
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) {
        console.error("Error fetching reminders:", error);
        throw error;
      }
      
      const mappedReminders = (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        dueDate: item.due_date,
        createdAt: item.created_at,
        archived: item.archived || isPastDue(item.due_date), // Auto-archive past due reminders
      }));

      // Auto-archive past due reminders in the database
      mappedReminders.forEach((reminder) => {
        if (!reminder.archived && isPastDue(reminder.dueDate)) {
          archiveMutation.mutate({ id: reminder.id, archived: true });
        }
      });

      return mappedReminders as Reminder[];
    },
  });

  // Split reminders into active and archived
  const { activeReminders, archivedReminders } = useMemo(() => {
    return {
      activeReminders: reminders.filter(r => !r.archived),
      archivedReminders: reminders.filter(r => r.archived)
    };
  }, [reminders]);

  // Create reminder
  const createMutation = useMutation({
    mutationFn: async (newReminder: Partial<Reminder>) => {
      console.log("Creating reminder:", newReminder);
      const { data, error } = await supabase
        .from("reminders")
        .insert([{
          title: newReminder.title,
          description: newReminder.description,
          due_date: newReminder.dueDate,
          created_at: new Date().toISOString(),
          archived: false
        }])
        .select()
        .single();

      if (error) {
        console.error("Error creating reminder:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast({
        title: "Success",
        description: "Reminder created successfully",
      });
    },
  });

  // Update reminder
  const updateMutation = useMutation({
    mutationFn: async (reminder: Partial<Reminder>) => {
      console.log("Updating reminder:", reminder);
      const { data, error } = await supabase
        .from("reminders")
        .update({
          title: reminder.title,
          description: reminder.description,
          due_date: reminder.dueDate
        })
        .eq("id", reminder.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating reminder:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast({
        title: "Success",
        description: "Reminder updated successfully",
      });
    },
  });

  // Archive reminder
  const archiveMutation = useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      console.log(`${archived ? 'Archiving' : 'Unarchiving'} reminder:`, id);
      const { data, error } = await supabase
        .from("reminders")
        .update({ archived })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error archiving reminder:", error);
        throw error;
      }
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast({
        title: "Success",
        description: `Reminder ${variables.archived ? 'archived' : 'unarchived'} successfully`,
      });
    },
  });

  // Delete reminder
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting reminder:", id);
      const { error } = await supabase.from("reminders").delete().eq("id", id);
      if (error) {
        console.error("Error deleting reminder:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast({
        title: "Success",
        description: "Reminder deleted successfully",
      });
    },
  });

  const handleSubmit = (data: Partial<Reminder>) => {
    if (editingReminder) {
      updateMutation.mutate({ ...data, id: editingReminder.id });
      setEditingReminder(null);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleArchive = (id: string, archived: boolean) => {
    archiveMutation.mutate({ id, archived });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingReminder(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reminders</h1>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-5 w-5" />
          Add Reminder
        </Button>
      </div>

      <RemindersList
        title="Active Reminders"
        reminders={activeReminders}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onArchive={handleArchive}
      />

      <RemindersList
        title="Archived Reminders"
        reminders={archivedReminders}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onArchive={handleArchive}
      />

      <ReminderForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        initialData={editingReminder || undefined}
      />
    </div>
  );
};

export default Index;