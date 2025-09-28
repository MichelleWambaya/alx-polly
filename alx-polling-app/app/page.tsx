import { redirect } from "next/navigation";

/**
 * Home page component that redirects users to the polls dashboard.
 * This is a server component that performs an immediate redirect,
 * avoiding unnecessary client-side rendering and improving performance.
 */
export default function Home() {
  // Immediate server-side redirect to polls dashboard
  // This happens before any client-side JavaScript is loaded
  redirect("/polls");
}