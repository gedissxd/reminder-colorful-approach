import { ReminderCard } from "@/components/ReminderCard";
import { ReminderForm } from "@/components/ReminderForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Reminder } from "@/types/reminder";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Index = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reminders
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["reminders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .order("dueDate", { ascending: true });

      if (error) throw error;
      return data as Reminder[];
    },
  });

  // Create reminder
  const createMutation = useMutation({
    mutationFn: async (newReminder: Partial<Reminder>) => {
      const { data, error } = await supabase
        .from("reminders")
        .insert([{ ...newReminder, createdAt: new Date().toISOString() }])
        .select()
        .single();

      if (error) throw error;
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
      const { data, error } = await supabase
        .from("reminders")
        .update(reminder)
        .eq("id", reminder.id)
        .select()
        .single();

      if (error) throw error;
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

  // Delete reminder
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reminders").delete().eq("id", id);
      if (error) throw error;
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reminders.map((reminder) => (
          <ReminderCard
            key={reminder.id}
            reminder={reminder}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

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