import NoteEditorPage from "@/screens/NoteEditorPage";

export default async function NoteEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NoteEditorPage id={id} />;
}
