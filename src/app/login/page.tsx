import { AuthForm } from "@/components/auth/auth-form";
import { SiteHeader } from "@/components/site-header";

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen px-4 py-12">
        <AuthForm />
      </main>
    </>
  );
}
