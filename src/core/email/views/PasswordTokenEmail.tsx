import { AuthEmailLayout } from './AuthEmailLayout';

export default function PasswordTokenEmail({
  name,
  token,
}: {
  name: string;
  token: number;
}) {
  return (
    <AuthEmailLayout>
      <span className="block text-base mb-2 text-xl">Hi {name}</span>
      <span className="block text-sm leading-5 text-lg">
        Your password reset token is {token}
      </span>
      <span className="text-xs text-gray-500 mt-8 leading-4">
        If you didn't request this, you can safely ignore this email.
      </span>
    </AuthEmailLayout>
  );
}
