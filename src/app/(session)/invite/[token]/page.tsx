import { InvitationPageContent } from "@/features/organizations/components/invitation-page-content";

export default async function InvitationPage({ params }: PageProps<"/invite/[token]">) {
  const { token } = await params;
  return <InvitationPageContent token={token} />;
}
