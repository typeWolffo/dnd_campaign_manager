import { useEffect, useState } from "react";

const LAST_ROOM_KEY = "grymlore_last_room";

export const useLastRoom = () => {
  const [lastRoomId, setLastRoomId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(LAST_ROOM_KEY);
    setLastRoomId(stored);
  }, []);

  const setLastRoom = (roomId: string) => {
    localStorage.setItem(LAST_ROOM_KEY, roomId);
    setLastRoomId(roomId);
  };

  const clearLastRoom = () => {
    localStorage.removeItem(LAST_ROOM_KEY);
    setLastRoomId(null);
  };

  return { lastRoomId, setLastRoom, clearLastRoom };
};
