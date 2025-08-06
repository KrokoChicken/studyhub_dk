export async function getSubjects() {
  const res = await fetch("/api/subjects/get");
  if (!res.ok) throw new Error("Kunne ikke hente fag");
  return res.json();
}

export async function addSubject(name: string) {
  const res = await fetch("/api/subjects/add", {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Kunne ikke tilføje fag");

  return res.json();
}