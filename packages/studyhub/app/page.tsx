// app/page.tsx eller hvor du har din komponent
import styles from "./page.module.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Alt til studiet samlet i én platform</h1>
      <p className={styles.subtitle}>Slip for kaos – saml dine noter ét sted</p>
    </main>
  );
}
