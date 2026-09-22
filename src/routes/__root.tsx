import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import appCss from "../styles.css?url";
import { MyToastRegion } from "@/components/ui/Toast";

// ─── Theme ───────────────────────────────────────────────────────────────────
// Runs before paint to prevent flash of wrong theme
const themeBootScript = `(function(){
  try {
    var authPages = ["/login", "/signup", "/introduction"];
    if (authPages.includes(location.pathname)) {
      document.documentElement.classList.remove("dark");
      return;
    }
    var prefs = JSON.parse(localStorage.getItem("grandwiki_prefs") || "{}");
    var mode = prefs.theme || "dark";
    var isDark = mode === "dark" || 
      (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  } catch(e) {}
})();`;

// ─── 404 Page ─────────────────────────────────────────────────────────────────
function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black px-4">
      <div className="max-w-md text-center">
        <h1 className="text-8xl font-bold text-black dark:text-white tracking-tight">
          404
        </h1>
        <h2 className="mt-4 text-2xl font-semibold text-black dark:text-white">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-black dark:bg-white px-6 text-sm font-medium text-white dark:text-black transition-all hover:opacity-80"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Error Page ───────────────────────────────────────────────────────────────
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
          An error occurred. Try refreshing or go back home.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-4 text-left text-xs text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded-lg overflow-auto">
            {error.message}
          </pre>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-black dark:bg-white px-6 text-sm font-medium text-white dark:text-black transition-all hover:opacity-80"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 px-6 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Route Definition ─────────────────────────────────────────────────────────
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Grand Wiki" },
      { name: "description", content: "Grand Wiki - Comprehensive Grand RP Guides, Tools & Database" },
      { property: "og:title", content: "Grand Wiki" },
      { property: "og:description", content: "Grand Wiki - Comprehensive Grand RP Guides, Tools & Database" },
      { property: "og:type", content: "website" },
    links: [
  { rel: "icon", type: "image/png", href: "/Brand/Favicon.png" },
  { rel: "stylesheet", href: appCss },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Dancing+Script:wght@400..700&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
  },
],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// ─── Shell (HTML wrapper) ─────────────────────────────────────────────────────
function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-H9S3L43WCX" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-H9S3L43WCX');`,
          }}
        />
        <HeadContent />
        {/* Theme boot — runs before paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="bg-white dark:bg-black text-black dark:text-white antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────
function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();

  // Sync theme on route change
  useEffect(() => {
    const authPages = ["/login", "/signup", "/introduction"];
    const root = document.documentElement;

    if (authPages.includes(location.pathname)) {
      root.classList.remove("dark");
      return;
    }

    try {
      const prefs = JSON.parse(localStorage.getItem("grandwiki_prefs") || "{}");
      const mode = prefs.theme || "dark";
      const isDark =
        mode === "dark" ||
        (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.classList.toggle("dark", isDark);
    } catch {
      root.classList.add("dark"); // Default to dark
    }
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <MyToastRegion />
    </QueryClientProvider>
  );
}
