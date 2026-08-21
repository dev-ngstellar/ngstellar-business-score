import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const allowedResponses = new Set(['YES', 'NO']);

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const followUpResponse = body.followUpResponse;

    if (!allowedResponses.has(followUpResponse)) {
      return NextResponse.json(
        { error: 'Follow-up response must be YES or NO.' },
        { status: 400 }
      );
    }

    const assessment = await prisma.businessHealthAssessment.update({
      where: { id: params.id },
      data: { followUpResponse },
      select: { id: true, followUpResponse: true },
    });

    return NextResponse.json(assessment);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 });
    }

    console.error('Error saving follow-up response:', error);
    return NextResponse.json(
      { error: 'Unable to save your response. Please try again.' },
      { status: 500 }
    );
  }
}
