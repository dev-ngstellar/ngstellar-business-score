import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Auth guard — returns 401 if token missing or invalid
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';

    const where: any = {};
    if (category && category !== 'ALL') where.category = category;
    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { email: { contains: search } },
        { mobile: { contains: search } },
        { industry: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const assessments = await prisma.businessHealthAssessment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        companyName: true,
        email: true,
        mobile: true,
        industry: true,
        location: true,
        employees: true,
        score: true,
        category: true,
        followUpResponse: true,
        createdAt: true,
      },
    });

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
