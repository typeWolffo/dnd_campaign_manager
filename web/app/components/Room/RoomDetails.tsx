import type { GetApiRoomsData } from "~/api/data-contracts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type RoomDetailsProps = {
  room: GetApiRoomsData[number];
};

export const RoomDetails = ({ room }: RoomDetailsProps) => {
  return (
    <div className="lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Description</h3>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              {room.description || "No description provided."}
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Created</h3>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              {new Date(room.createdAt).toLocaleDateString()} at{" "}
              {new Date(room.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Last Updated</h3>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              {new Date(room.updatedAt).toLocaleDateString()} at{" "}
              {new Date(room.updatedAt).toLocaleTimeString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
