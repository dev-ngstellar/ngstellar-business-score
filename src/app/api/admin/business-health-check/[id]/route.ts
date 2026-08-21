import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function parseJSON(val: string, fallback: any) {
  try { return JSON.parse(val); } catch { return fallback; }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { id } = params;
    const item = await prisma.businessHealthAssessment.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });

    return NextResponse.json({
      ...item,
      areasToImprove: parseJSON(item.areasToImprove, []),
      strengths: parseJSON(item.strengths, []),
      opportunities: parseJSON(item.opportunities, []),
      recommendations: parseJSON(item.recommendations, []),
    });
  } catch (error) {
    console.error('Error fetching assessment detail:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
