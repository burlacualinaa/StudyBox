import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getUserById } from "../../../../lib/userAccessor";
import EditUserForm from "./EditUserForm";
export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p className="p-8">Se încarcă formularul...</p>}>
      <EditUserLoader params={params} />
    </Suspense>
  );
}

async function EditUserLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number(id);

  if (!Number.isInteger(userId) || userId <= 0) {
    notFound();
  }

  const user = await getUserById(userId);

  if (!user) {
    notFound();
  }

  return <EditUserForm user={user} />;
}