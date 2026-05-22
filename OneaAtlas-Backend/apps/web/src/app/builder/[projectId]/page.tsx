import { BuilderClient } from "./builder-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface BuilderPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function BuilderPage({ params }: BuilderPageProps) {
  const { projectId } = await params;
  return <BuilderClient projectId={projectId} />;
}
