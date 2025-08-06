import SubjectPageClient from "./SubjectPageClient";

type Props = {
  params: Promise<{ id: string }>; // params is a Promise here in Next 15
};

export default async function SubjectPage({ params }: Props) {
  const { id: subjectId } = await params; // await params here

  return <SubjectPageClient subjectId={subjectId} />;
}
