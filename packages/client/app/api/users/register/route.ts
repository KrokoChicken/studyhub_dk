import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: 'Navn, email og adgangskode er påkrævet' },
      { status: 400 }
    );
  }

  // Tjek om email allerede findes
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: 'Email er allerede i brug' }, { status: 409 });
  }

  // Hash adgangskode
  const hashedPassword = await bcrypt.hash(password, 10);

  // Indsæt ny bruger
  await db.insert(users).values({
    name,
    email,
    passwordHash: hashedPassword,
  });

  return NextResponse.json({ success: true });
}