import { InvitationRegisterBoundary } from "@/features/auth/components/invitation-register-boundary";
import { RegisterForm } from "@/features/auth/components/register-form";
import { getValidInvitationReturnTo } from "@/features/auth/lib/invitation-return";

export default async function RegisterPage({
  searchParams,
}: PageProps<"/auth/register">) {
  const params = await searchParams;
  const invitationToken = getStringParam(params.invitationToken);
  const validInvitationToken =
    invitationToken && getValidInvitationReturnTo(`/invite/${invitationToken}`)
      ? invitationToken
      : null;

  return validInvitationToken
    ? <InvitationRegisterBoundary token={validInvitationToken} />
    : <RegisterForm />;
}

function getStringParam(value: string | string[] | undefined): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}
