import { AuthEmailLayout } from './AuthEmailLayout';

export default function PasswordConfirmedEmail({ name }: { name: string }) {
  return (
    <AuthEmailLayout>
      <span className="block text-base mb-2 text-xl">Hi {name}</span>
      <span className="block text-sm leading-5 text-lg">
        Your password has been successfully confirmed.
      </span>
      <span className="text-xs text-gray-500 mt-8 leading-4">
        If it wasn't you, please contact support immediately.
      </span>
    </AuthEmailLayout>
  );
}
