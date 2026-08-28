import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateBusinessHealthScore, AssessmentInput } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Required fields validation
    // Note: biggestChallenge and primaryGoal are optional free-text fields
    const requiredFields = [
      'companyName',
      'email',
      'mobile',
      'location',
      'industry',
      'yearsInBusiness',
      'employees',
      'businessStructure',
      'gstRegistered',
      'trademarkRegistered',
      'website',
      'socialMedia',
      'googleBusiness',
      'digitalMarketing',
      'brandIdentity',
      'managementMethod',
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }


    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    // Prepare cleaned input
    const inputData: AssessmentInput = {
      companyName: String(body.companyName).trim(),
      designation: body.designation ? String(body.designation).trim() : '',
      email: String(body.email).trim().toLowerCase(),
      mobile: String(body.mobile).trim(),
      location: String(body.location).trim(),
      industry: body.industry === 'Other' && body.customIndustry
        ? `Other (${String(body.customIndustry).trim()})`
        : String(body.industry).trim(),
      industrySubCategory: body.industrySubCategory ? String(body.industrySubCategory).trim() : '',
      yearsInBusiness: String(body.yearsInBusiness).trim(),
      employees: String(body.employees).trim(),
      businessStructure: body.businessStructure === 'Other' && body.customBusinessStructure
        ? `Other (${String(body.customBusinessStructure).trim()})`
        : body.businessStructure ? String(body.businessStructure).trim() : '',
      gstRegistered: body.gstRegistered ? String(body.gstRegistered).trim() : '',
      annualTurnover: body.annualTurnover ? String(body.annualTurnover).trim() : '',
      trademarkRegistered: body.trademarkRegistered ? String(body.trademarkRegistered).trim() : '',

      website: String(body.website),
      socialMedia: String(body.socialMedia),
      googleBusiness: String(body.googleBusiness),
      digitalMarketing: String(body.digitalMarketing),
      brandIdentity: String(body.brandIdentity),

      managementMethod: String(body.managementMethod),
      areasToImprove: Array.isArray(body.areasToImprove) ? body.areasToImprove : [],
      customImprovementArea: body.customImprovementArea
        ? String(body.customImprovementArea).trim()
        : '',

      biggestChallenge: Array.isArray(body.biggestChallenge)
        ? body.biggestChallenge
            .map((item: string) =>
              item === 'Other' && body.customChallenge
                ? `Other (${String(body.customChallenge).trim()})`
                : item
            )
            .join(', ')
        : String(body.biggestChallenge || '').trim(),
      primaryGoal: Array.isArray(body.primaryGoal)
        ? body.primaryGoal
            .map((item: string) =>
              item === 'Other' && body.customGoal
                ? `Other (${String(body.customGoal).trim()})`
                : item
            )
            .join(', ')
        : String(body.primaryGoal || '').trim(),
    };

    // Calculate score using backend deterministic algorithm
    const result = calculateBusinessHealthScore(inputData);

    // Generate unique ID
    const count = await prisma.businessHealthAssessment.count();
    const id = `BHC-${String(count + 1).padStart(3, '0')}`;

    // Save complete submission to SQLite database
    const saved = await prisma.businessHealthAssessment.create({
      data: {
        id,
        companyName: inputData.companyName,
        designation: inputData.designation || null,
        email: inputData.email,
        mobile: inputData.mobile,
        location: inputData.location,
        industry: inputData.industry,
        industrySubCategory: inputData.industrySubCategory || null,
        yearsInBusiness: inputData.yearsInBusiness,
        employees: inputData.employees,
        businessStructure: inputData.businessStructure || null,
        gstRegistered: inputData.gstRegistered || null,
        annualTurnover: inputData.annualTurnover || null,
        trademarkRegistered: inputData.trademarkRegistered || null,

        website: inputData.website,
        socialMedia: inputData.socialMedia,
        googleBusiness: inputData.googleBusiness,
        digitalMarketing: inputData.digitalMarketing,
        brandIdentity: inputData.brandIdentity,

        managementMethod: inputData.managementMethod,
        areasToImprove: JSON.stringify(inputData.areasToImprove),
        customImprovementArea: inputData.customImprovementArea || null,

        biggestChallenge: inputData.biggestChallenge,
        primaryGoal: inputData.primaryGoal,

        reportPreference: '',
        consent: true,

        score: result.score,
        category: result.category,
        legalComplianceScore: result.legalComplianceIndex.score,
        legalComplianceStatus: result.legalComplianceIndex.status,
        strengths: JSON.stringify(result.strengths),
        opportunities: JSON.stringify(result.opportunities),
        recommendations: JSON.stringify(result.recommendations),
      },
    });

    // Return response containing score, legal compliance index & insights
    return NextResponse.json({
      id: saved.id,
      companyName: inputData.companyName,
      score: result.score,
      category: result.category,
      legalComplianceIndex: result.legalComplianceIndex,
      strengths: result.strengths,
      opportunities: result.opportunities,
      recommendations: result.recommendations,
      createdAt: saved.createdAt,
    });
  } catch (error: any) {
    console.error('Error submitting Business Health Check:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your Business Health Check.' },
      { status: 500 }
    );
  }
}
