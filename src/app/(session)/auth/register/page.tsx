import { RegisterForm } from "@/features/auth/components/register-form";
import { getValidInvitationReturnTo } from "@/features/auth/lib/invitation-return";

export default async function RegisterPage({
  searchParams,
}: PageProps<"/auth/register">) {
  const params = await searchParams;
  const invitationToken = getStringParam(params.invitationToken);
  const email = getStringParam(params.email);
  const organizationName = getStringParam(params.organizationName);
  const invitation =
    invitationToken &&
    email &&
    organizationName &&
    getValidInvitationReturnTo(`/invite/${invitationToken}`)
      ? { invitationToken, email, organizationName }
      : undefined;

  return <RegisterForm invitation={invitation} />;
}

function getStringParam(value: string | string[] | undefined): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}
