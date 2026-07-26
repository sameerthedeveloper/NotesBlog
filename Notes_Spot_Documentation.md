# EXPT_11 DATE: May 8, 2026
# DB connection with front end (OpenNotes)

**AIM:** To create a notes-sharing application and to perform the database connection using Firebase Firestore.

## PROCEDURE:

**Step 1:** Create a new React project using Vite and install necessary dependencies including `firebase`, `@mui/material`, and `@tiptap/react`.
**Step 2:** Set up a Firebase project in the Google Cloud Console and enable **Firestore Database**, **Firebase Authentication** (Google Provider), and **Firebase Storage**.
**Step 3:** Configure the `.env` file with Firebase credentials (API Key, Project ID, etc.) and initialize the Firebase app in `src/firebase/config.js`.
**Step 4:** Define the data structure for notes, including fields for `title`, `content`, `authorId`, `visibility`, and `viewCount`.
**Step 5:** Implement Firestore Security Rules to ensure users can only edit their own notes while allowing public access to notes marked as 'public'.
**Step 6:** Create a service layer (`notesService.js`) to handle asynchronous CRUD operations such as `createNote`, `updateNote`, `deleteNote`, and `incrementViewCount`.
**Step 7:** Develop a rich text editor using **TipTap** with extensions for images and custom PDF block support.
**Step 8:** Implement a viewer tracking system that records viewer metadata (UID, display name, timestamp) in a subcollection named `views` under each note.
**Step 9:** Configure **Firebase Storage** to allow users to upload and attach PDF files to their notes, storing the resulting download URL in the Firestore document.
**Step 10:** Deploy the application to **Vercel** and configure environment variables in the deployment dashboard for production use.

## DATABASE DESIGN:
The database is built using **Firebase Firestore**, a NoSQL document-oriented database. It uses a collection-centric design with subcollections for relational data.

## LOGIN:
Authentication is handled via **Firebase Auth** using the **Google Search Provider**, ensuring secure and seamless user onboarding.

## DATA SCHEMA:

### Collection: `users`
| Field | Type | Description |
| :--- | :--- | :--- |
| `uid` | String (ID) | Unique identifier from Firebase Auth |
| `displayName` | String | User's full name |
| `email` | String | User's email address |
| `photoURL` | String | URL to user's profile picture |
| `updatedAt` | Timestamp | Last profile update time |

### Collection: `notes`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String (ID) | Auto-generated Document ID |
| `title` | String | Title of the note/blog |
| `content` | String (HTML) | Rich text content from TipTap |
| `authorId` | String | UID of the user who created the note |
| `visibility` | String | "public" or "private" |
| `viewCount` | Number | Total number of views |
| `isPinned` | Boolean | Whether the note is pinned to top |
| `isFavorite` | Boolean | Whether the note is marked as favorite |
| `createdAt` | Timestamp | Creation time |
| `updatedAt` | Timestamp | Last modification time |

### Subcollection: `notes/{noteId}/views`
| Field | Type | Description |
| :--- | :--- | :--- |
| `uid` | String (ID) | UID of the viewer (or "guest_ID") |
| `displayName` | String | Name of the viewer |
| `lastViewedAt` | Timestamp | Time of the most recent view |
| `viewCount` | Number | Number of times this specific user viewed |

## SNAPSHOTS:
*(Placeholders for UI Screenshots of the Dashboard, Note Editor, and Firestore Console)*

## RESULT:
Thus, a notes-sharing application with a secure database connection and real-time view tracking has been successfully developed and implemented.
