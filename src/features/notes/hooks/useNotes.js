import { useState, useEffect } from "react";
import { subscribeUserNotes } from "../services/notesService";
import { useAuth } from "../../../context/AuthContext";

export const useNotes = (options = {}) => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeUserNotes(currentUser.uid, options, (fetchedNotes) => {
      setNotes(fetchedNotes);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, options.sortField, options.sortOrder, options.pageSize]);

  return { notes, loading, error };
};
