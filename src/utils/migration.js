import { db } from "../firebase/config";
import { collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { convertMarkdownToSanitizedHtml, isMarkdownContent } from "./markdownToHtml";

/**
 * Scans all documents in the 'notes' collection.
 * Converts any legacy Markdown content to sanitized HTML and updates the Firestore document.
 * 
 * @param {Function} onProgress - Progress callback function (processedCount, totalCount, statusMessage)
 * @returns {Promise<{scanned: number, converted: number, errors: number}>} Summary result
 */
export const runNotesMigration = async (onProgress = () => {}) => {
  const notesRef = collection(db, "notes");
  const snapshot = await getDocs(notesRef);
  const total = snapshot.docs.length;
  
  let scanned = 0;
  let converted = 0;
  let errors = 0;

  onProgress(0, total, "Starting database scan for legacy Markdown notes...");

  for (const docSnap of snapshot.docs) {
    scanned++;
    const note = docSnap.data();
    const noteId = docSnap.id;
    
    if (note.content && (isMarkdownContent(note.content) || !/^<[a-z1-6][\s\S]*>/i.test(note.content.trim()))) {
      try {
        const sanitizedHtml = convertMarkdownToSanitizedHtml(note.content);
        await updateDoc(doc(db, "notes", noteId), {
          content: sanitizedHtml,
          isMigratedToHtml: true,
          migratedAt: serverTimestamp()
        });
        converted++;
      } catch (err) {
        console.error(`Migration error on note ID ${noteId}:`, err);
        errors++;
      }
    }
    
    onProgress(scanned, total, `Processed ${scanned} of ${total} notes (${converted} converted)...`);
  }

  return { scanned, converted, errors };
};
