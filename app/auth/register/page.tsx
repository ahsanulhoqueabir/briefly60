import AuthForm from "@/components/AuthForm";
import { Suspense } from "react";

function AuthFormWrapper() {
  return <AuthForm mode="register" />;
}

export default function RegisterPage() {
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
