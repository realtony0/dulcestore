import Link from "next/link";
import { isAuthenticated, isAdminConfigured } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin-nav";

/** Formulaire de connexion, affiché tant que la session n'est pas ouverte. */
function LoginScreen({ configured }: { configured: boolean }) {
  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <h1 className="text-2xl font-extrabold">Espace gestion</h1>

      {!configured ? (
        <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Aucun mot de passe administrateur n&apos;est configuré. Ajoutez{" "}
          <code className="font-mono">ADMIN_PASSWORD</code> dans les variables
          d&apos;environnement puis redémarrez.
        </p>
      ) : (
        <form action="/api/admin/session" method="post" className="mt-6">
          <label className="label" htmlFor="password">
            Mot de passe
          </label>
          <input id="password" name="password" type="password" required autoFocus className="field" />
          <button type="submit" className="btn-primary focus-ring mt-4 w-full">
            Se connecter
          </button>
        </form>
      )}
    </div>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) {
    return <LoginScreen configured={isAdminConfigured()} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dulce-border pb-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-lg font-extrabold tracking-tight">
            Gestion
          </Link>
          <AdminNav />
        </div>
        <form action="/api/admin/logout" method="post">
          <button type="submit" className="text-sm font-semibold text-dulce-ink/50 hover:text-dulce-orange">
            Se déconnecter
          </button>
        </form>
      </div>

      <div className="pt-8">{children}</div>
    </div>
  );
}
