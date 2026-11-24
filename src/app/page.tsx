import { redirect } from "next/navigation";

/** O app abre direto na página inicial. */
export default function Root() {
  redirect("/inicio");
}
