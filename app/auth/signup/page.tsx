import { redirect } from "next/navigation"

export default async function SignUpPage() {
  // Redirect to login page since registration is disabled
  redirect("/auth/login")
}
