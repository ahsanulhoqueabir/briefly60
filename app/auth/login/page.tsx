import AuthForm from "@/components/auth/AuthForm";
import { Suspense } from "react";

function AuthFormWrapper() {
  return <AuthForm mode="login" />;
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <AuthFormWrapper />
    </Suspense>
  );
}
