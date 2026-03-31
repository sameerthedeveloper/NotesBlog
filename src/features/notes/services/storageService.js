import { storage } from "./config";
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";

export const uploadFile = async (path, file, onProgress) => {
  const fileRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(fileRef, file);
  
  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          url: downloadURL,
          path: path,
          name: file.name,
          size: file.size,
          type: file.type
        });
      }
    );
  });
};

export const deleteFile = async (path) => {
  const fileRef = ref(storage, path);
  await deleteObject(fileRef);
};
