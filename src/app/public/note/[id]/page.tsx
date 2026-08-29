import PublicNotePage from "@/screens/PublicNotePage";

export default async function PublicNote({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PublicNotePage id={id} />;
}
