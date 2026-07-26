import { useState, useEffect } from "react";
import { subscribeUserNotes } from "../services/notesService";
import { useAuth } from "../../../context/AuthContext";

export const useNotes = (options = {}) => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(Boolean(currentUser));

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeUserNotes(currentUser.uid, options, (fetchedNotes) => {
      setNotes(fetchedNotes);
      setLoading(false);
    });

    return () => unsubscribe();
    // eslint-disable-next-deps
  }, [currentUser, options]);

  return { notes, loading };
};
