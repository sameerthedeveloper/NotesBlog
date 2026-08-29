import NoteEditorPage from "@/screens/NoteEditorPage";

export default async function NoteView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NoteEditorPage id={id} />;
}
