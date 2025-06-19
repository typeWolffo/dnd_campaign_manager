import { useState, type PropsWithChildren } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useCreateRoom } from "../lib/api-hooks";
import type { CreateRoomFormData } from "../lib/schemas";
import { validateRequired } from "../lib/schemas";

export function CreateRoomDialog({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const createRoom = useCreateRoom();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFieldError,
    reset,
  } = useForm<CreateRoomFormData>();

  const onSubmit = async (data: CreateRoomFormData) => {
    if (!validateRequired(data.name)) {
      setFieldError("name", { message: "Room name is required" });
      return;
    }

    try {
      await createRoom.mutateAsync(data);
      setOpen(false);
      reset();
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Create a new D&D campaign room and invite your players.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input id="name" placeholder="The Dragon Heist" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="A thrilling adventure in Waterdeep..."
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRoom.isPending}>
              {createRoom.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
