'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { deleteEmployee } from "@/lib/actions/admin.actions";
import { IUser } from "@/models/user.model";
import { Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { EditEmployeeDialog } from "./EditEmployeeDialog";

type EmployeeActionsProps = {
  employee: IUser;
};

export function EmployeeActions({ employee }: EmployeeActionsProps) {
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteEmployee(employee._id);
      if (result.success) {
        toast({ title: "Success", description: "Employee deleted successfully." });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to delete employee.",
        });
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditOpen(true)}>
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit Employee</span>
      </Button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Trash2 className="h-4 w-4 text-destructive" />
            <span className="sr-only">Delete Employee</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee
              and all their associated attendance records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletePending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeletePending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletePending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isEditOpen && (
        <EditEmployeeDialog 
          employee={employee}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}
    </div>
  );
}
