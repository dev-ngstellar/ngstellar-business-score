export interface AssessmentInput {
  companyName: string;
  designation?: string;
  email: string;
  mobile: string;
  location: string;
  industry: string;
  industrySubCategory?: string;
  yearsInBusiness: string;
  employees: string;
  businessStructure?: string;
  gstRegistered?: string;
  annualTurnover?: string;
  trademarkRegistered?: string;
  
  website: string;         // Yes / No
  socialMedia: string;     // Yes / No / Yes, regularly / Sometimes / Not Sure
  googleBusiness: string;  // Yes / No / Not Sure
  digitalMarketing: string;// Yes / No / Yes, regularly / Sometimes / Not Sure
  brandIdentity: string;   // Yes / No / Not Sure
  
  managementMethod: string; // Mostly Manual, Excel Sheets, Business Software, ERP / CRM System
  areasToImprove: string[];
  customImprovementArea?: string;
  
  biggestChallenge: string;
  primaryGoal: string;
}

export interface LegalComplianceIndex {
  score: number;             // 0 - 100 percentage
  status: 'Strong' | 'Good' | 'Needs Attention';
  interpretation: string;
  note: string;
  attentionAreas: string[];  // Dynamic list of specific areas that need attention
  factors: {
    gstStatus: string;
    trademarkStatus: string;
    googleBusinessStatus: string;
    entityStructure: string;
  };
}

export interface AssessmentResult {
  score: number;                   // Single overall score (0 - 100)
  category: string;                // Category label
  legalComplianceIndex: LegalComplianceIndex; // Deterministic legal index
  strengths: string[];             // Your Business Strengths
  opportunities: string[];         // Key Opportunities
  recommendations: string[];       // Recommended Next Steps
}

export function getLegalComplianceAttentionAreas(factors: {
  gstRegistered?: string;
  trademarkRegistered?: string;
  googleBusiness?: string;
  businessStructure?: string;
  annualTurnover?: string;
  yearsInBusiness?: string;
  website?: string;
}): string[] {
  const {
    gstRegistered = '',
    trademarkRegistered = '',
    googleBusiness = '',
    businessStructure = '',
    website = '',
  } = factors;

  const attentionAreas: string[] = [];

  // 1. GST Registration Condition
  if (gstRegistered === 'Not Sure') {
    attentionAreas.push('Please check your GST registration status.');
  } else if (gstRegistered === 'No') {
    attentionAreas.push('GST registration is important for your business. Please check whether GST registration is required for you.');
  }

  // 2. Trademark Registration Condition
  if (trademarkRegistered === 'No') {
    attentionAreas.push('Trademark protection is important for your brand, especially for an established business.');
  } else if (trademarkRegistered === 'Not Sure') {
    attentionAreas.push('Please check your trademark registration status.');
  } else if (trademarkRegistered === 'In Progress') {
    attentionAreas.push('Your trademark registration is still in progress.');
  }

  // 3. Google Business Profile Condition
  if (googleBusiness === 'No') {
    attentionAreas.push('A Google Business Profile can help customers find and trust your business.');
  } else if (googleBusiness === 'Not Sure') {
    attentionAreas.push('Please check whether your business has an active Google Business Profile.');
  }

  // 4. Website Recommendation
  if (website === 'No') {
    attentionAreas.push('A professional website can help build trust and bring more customers to your business.');
  }

  // 5. Business Structure Condition
  if (!businessStructure || businessStructure === 'Other' || businessStructure.startsWith('Other (') || businessStructure === 'Not Sure') {
    attentionAreas.push('Please make sure your business structure is clearly defined.');
  }

  return attentionAreas;
}

export function calculateLegalComplianceIndex(input: AssessmentInput): LegalComplianceIndex {
  const {
    yearsInBusiness = '',
    businessStructure = '',
    gstRegistered = '',
    annualTurnover = '',
    trademarkRegistered = '',
    googleBusiness = '',
    website = '',
  } = input;

  let gstPoints = 0;
  let trademarkPoints = 0;
  let googlePoints = 0;
  let websitePoints = 0;
  let structurePoints = 0;

  const isOver5Years = ['5–10 years', '10–15 years', '15+ years'].includes(yearsInBusiness);
  const isCorporate = ['Private Limited Company', 'LLP'].includes(businessStructure);

  // 1. GST Registration (25 Max)
  if (gstRegistered === 'Yes') {
    gstPoints = 25;
  } else if (gstRegistered === 'Not Applicable') {
    gstPoints = 25; // Non-mandatory threshold: do NOT penalize
  } else if (gstRegistered === 'Not Sure') {
    gstPoints = 12; // Information gap
  } else {
    // 'No'
    const highTurnover = ['₹40 Lakhs - ₹1 Crore', '₹1 Crore - ₹5 Crores', '₹5 Crores+'].includes(annualTurnover);
    if (highTurnover || isCorporate || isOver5Years) {
      gstPoints = 0; // High review priority
    } else {
      gstPoints = 10;
    }
  }

  // 2. Trademark Registration (25 Max)
  if (trademarkRegistered === 'Yes') {
    trademarkPoints = 25;
  } else if (trademarkRegistered === 'In Progress') {
    trademarkPoints = 15; // Incomplete process
  } else if (trademarkRegistered === 'Not Sure') {
    trademarkPoints = 10; // Information gap
  } else {
    // 'No'
    if (isOver5Years || isCorporate) {
      trademarkPoints = 0; // Stronger impact for established businesses
    } else {
      trademarkPoints = 10;
    }
  }

  // 3. Google Business Profile (20 Max)
  if (googleBusiness === 'Yes') {
    googlePoints = 20;
  } else if (googleBusiness === 'Not Sure') {
    googlePoints = 8;
  } else {
    googlePoints = 0;
  }

  // 4. Business Website (15 Max)
  if (website === 'Yes') {
    websitePoints = 15;
  } else {
    websitePoints = 0;
  }

  // 5. Business Structure (15 Max)
  if (['Private Limited Company', 'LLP', 'OPC'].includes(businessStructure)) {
    structurePoints = 15;
  } else if (businessStructure === 'Partnership Firm') {
    structurePoints = 12;
  } else if (businessStructure === 'Sole Proprietorship') {
    structurePoints = 10;
  } else {
    structurePoints = 5;
  }

  const rawScore = gstPoints + trademarkPoints + googlePoints + websitePoints + structurePoints;
  const finalScore = Math.min(100, Math.max(0, rawScore));

  const attentionAreas = getLegalComplianceAttentionAreas({
    gstRegistered,
    trademarkRegistered,
    googleBusiness,
    businessStructure,
    annualTurnover,
    yearsInBusiness,
    website,
  });

  let status: 'Strong' | 'Good' | 'Needs Attention';
  let interpretation: string;

  if (attentionAreas.length === 0 && finalScore >= 80) {
    status = 'Strong';
    interpretation = 'Your business shows strong indicators of formal registration, brand protection, and professional digital presence based on the information provided.';
  } else if (attentionAreas.length <= 2 && finalScore >= 60) {
    status = 'Good';
    interpretation = 'Your business demonstrates a healthy compliance foundation with a few areas that may benefit from review.';
  } else {
    status = 'Needs Attention';
    interpretation = 'Your business has a few areas that may need attention.';
  }

  return {
    score: finalScore,
    status,
    interpretation,
    note: 'Indicative assessment based on the information provided. Actual legal and tax requirements may vary based on business type, turnover, structure, and applicable regulations.',
    attentionAreas,
    factors: {
      gstStatus: gstRegistered || 'Not Provided',
      trademarkStatus: trademarkRegistered || 'Not Provided',
      googleBusinessStatus: googleBusiness || 'Not Provided',
      entityStructure: businessStructure || 'Not Provided',
    },
  };
}

export function calculateBusinessHealthScore(input: AssessmentInput): AssessmentResult {
  const {
    yearsInBusiness = '',
    employees = '',
    businessStructure = '',
    annualTurnover = '',
    gstRegistered = '',
    trademarkRegistered = '',
    website = '',
    socialMedia = '',
    googleBusiness = '',
    digitalMarketing = '',
    brandIdentity = '',
    managementMethod = '',
    areasToImprove = [],
    biggestChallenge = '',
    primaryGoal = '',
  } = input;

  // Calculate Legal Compliance Index (kept completely separate)
  const legalComplianceIndex = calculateLegalComplianceIndex(input);

  const isEstablished = ['5–10 years', '10–15 years', '15+ years'].includes(yearsInBusiness);

  // =========================================================================
  // SECTION 2: Current Business Presence — 60% Weight (Normalized 0–100)
  // DOMINANT FACTOR — MOST IMPORTANT SECTION (60% WEIGHT)
  // =========================================================================
  // 1. Business Website (20 Pts Max)
  const s2Website = website === 'Yes' ? 20.0 : 0.0;

  // 2. Social Media Promotion (16 Pts Max)
  let s2Social = 0.0;
  if (socialMedia === 'Yes' || socialMedia === 'Yes, regularly') {
    s2Social = 16.0;
  } else if (socialMedia === 'Sometimes') {
    s2Social = 6.4; // 40%
  } else if (socialMedia === 'Not Sure') {
    s2Social = 3.2; // 20%
  }

  // 3. Google Business Profile (16 Pts Max)
  let s2Google = 0.0;
  if (googleBusiness === 'Yes') {
    s2Google = 16.0;
  } else if (googleBusiness === 'Not Sure') {
    s2Google = 3.2; // 20%
  }

  // 4. Digital Marketing / Online Ads (16 Pts Max)
  let s2Marketing = 0.0;
  if (digitalMarketing === 'Yes' || digitalMarketing === 'Yes, regularly') {
    s2Marketing = 16.0;
  } else if (digitalMarketing === 'Sometimes') {
    s2Marketing = 6.4; // 40%
  } else if (digitalMarketing === 'Not Sure') {
    s2Marketing = 3.2; // 20%
  }

  // 5. Company Logo / Brand Identity (16 Pts Max)
  let s2Brand = 0.0;
  if (brandIdentity === 'Yes') {
    s2Brand = 16.0;
  } else if (brandIdentity === 'Not Sure') {
    s2Brand = 3.2; // 20%
  }

  // 6. Trademark Registered (16 Pts Max)
  let s2Trademark = 0.0;
  if (trademarkRegistered === 'Yes') {
    s2Trademark = 16.0;
  } else if (trademarkRegistered === 'In Progress') {
    s2Trademark = 6.4; // 40%
  } else if (trademarkRegistered === 'Not Sure') {
    s2Trademark = 3.2; // 20%
  } else {
    // 'No'
    s2Trademark = isEstablished ? 0.0 : 2.0; // Operating > 5 years receives stronger negative impact (0 Pts)
  }

  const section2Score = Math.min(100, s2Website + s2Social + s2Google + s2Marketing + s2Brand + s2Trademark);

  // =========================================================================
  // SECTION 3: Business Operations — 20% Weight (Normalized 0–100)
  // HIGH INFLUENCE — Question 1 carries 85% of section weight
  // =========================================================================
  // Question 1: How do you currently manage your business? (85 Pts Max)
  let s3Management = 12.75;
  if (managementMethod === 'ERP / CRM System') {
    s3Management = 85.0; // 100%
  } else if (managementMethod === 'Business Software' || managementMethod === 'Standalone Software(s)') {
    s3Management = 63.75; // 75%
  } else if (managementMethod === 'Excel Sheets') {
    s3Management = 34.0; // 40%
  } else if (managementMethod === 'Mostly Manual') {
    s3Management = 12.75; // 15%
  }

  // Question 2: Areas to improve / help needed (15 Pts Max - LOW diagnostic influence)
  const numAreas = Array.isArray(areasToImprove) ? areasToImprove.length : 0;
  let s3Improvement = 10.0;
  if (numAreas >= 1 && numAreas <= 3) {
    s3Improvement = 15.0; // Focused intention & awareness
  } else if (numAreas >= 4) {
    s3Improvement = 10.0; // Operational friction indicator (does not inflate score)
  } else {
    s3Improvement = 10.0;
  }

  const section3Score = Math.min(100, s3Management + s3Improvement);

  // =========================================================================
  // SECTION 1: Business Information — 15% Weight (Normalized 0–100)
  // LIMITED SCORING — GST has moderate influence (40%), rest are profile context
  // =========================================================================
  // GST Registration (40 Pts Max)
  let s1Gst = 12.0;
  if (gstRegistered === 'Yes' || gstRegistered === 'Not Applicable') {
    s1Gst = 40.0; // No penalty for Not Applicable!
  } else if (gstRegistered === 'Not Sure') {
    s1Gst = 14.0; // Partial/low uncertainty score
  } else {
    // 'No'
    const highTurnover = ['₹40 Lakhs - ₹1 Crore', '₹1 Crore - ₹5 Crores', '₹5 Crores+'].includes(annualTurnover);
    const isCorporate = ['Private Limited Company', 'LLP'].includes(businessStructure);
    if (highTurnover || isCorporate || isEstablished) {
      s1Gst = 0.0;
    } else {
      s1Gst = 12.0;
    }
  }

  // Profile Context Fields (60 Pts Max total)
  let s1Years = 10.0;
  if (isEstablished) {
    s1Years = 15.0;
  } else if (yearsInBusiness === '3–5 years') {
    s1Years = 12.5;
  } else if (yearsInBusiness === '1–3 years') {
    s1Years = 10.0;
  } else if (yearsInBusiness === 'Less than 1 year') {
    s1Years = 7.5;
  }

  let s1Employees = 10.0;
  if (employees === '50+') {
    s1Employees = 15.0;
  } else if (employees === '16-50') {
    s1Employees = 13.5;
  } else if (employees === '6-15') {
    s1Employees = 12.0;
  } else if (employees === '1-5') {
    s1Employees = 10.0;
  }

  let s1Structure = 10.0;
  if (['Private Limited Company', 'LLP', 'OPC'].includes(businessStructure)) {
    s1Structure = 15.0;
  } else if (businessStructure === 'Partnership Firm') {
    s1Structure = 12.5;
  } else if (businessStructure === 'Sole Proprietorship') {
    s1Structure = 10.0;
  } else {
    s1Structure = 7.5;
  }

  let s1Turnover = 12.0;
  if (['₹5 Crores+', '₹1 Crore - ₹5 Crores'].includes(annualTurnover)) {
    s1Turnover = 15.0;
  } else if (annualTurnover === '₹40 Lakhs - ₹1 Crore') {
    s1Turnover = 13.5;
  } else if (annualTurnover === '₹10 Lakhs - ₹40 Lakhs') {
    s1Turnover = 12.0;
  } else if (annualTurnover === 'Below ₹10 Lakhs') {
    s1Turnover = 10.0;
  }

  const section1Score = Math.min(100, s1Gst + s1Years + s1Employees + s1Structure + s1Turnover);

  // =========================================================================
  // SECTION 4: Growth Goals — 5% Weight (Normalized 0–100)
  // VERY LOW / DIAGNOSTIC FEEDBACK SCORING
  // =========================================================================
  let s4Challenge = 25.0;
  const challengeStr = String(biggestChallenge || '').toLowerCase();
  if (challengeStr.length > 5) {
    s4Challenge = 45.0;
    if (/manual|excel|paper|process|slow|workflow|delay|lead|sales|tech|growth/.test(challengeStr)) {
      s4Challenge = 50.0;
    }
  }

  let s4Goal = 25.0;
  const goalStr = String(primaryGoal || '').toLowerCase();
  if (goalStr.length > 5) {
    s4Goal = 45.0;
    if (/automate|automation|digitize|digital|software|system|ai|crm|erp|scale|revenue|expand/.test(goalStr)) {
      s4Goal = 50.0;
    }
  }

  const section4Score = Math.min(100, s4Challenge + s4Goal);

  // =========================================================================
  // FINAL OVERALL BUSINESS HEALTH SCORE (0–100)
  // Formula: (Sec 1 × 0.15) + (Sec 2 × 0.60) + (Sec 3 × 0.20) + (Sec 4 × 0.05)
  // =========================================================================
  const weightedTotal =
    section1Score * 0.15 +
    section2Score * 0.60 +
    section3Score * 0.20 +
    section4Score * 0.05;

  const overallScore = Math.min(100, Math.max(0, Math.round(weightedTotal)));

  // Category determination
  let category = 'Transformation Opportunity';
  if (overallScore >= 80) {
    category = 'Transformation Leader';
  } else if (overallScore >= 65) {
    category = 'Growth Ready';
  } else if (overallScore >= 50) {
    category = 'Transformation Opportunity';
  } else if (overallScore >= 35) {
    category = 'Transformation Required';
  } else {
    category = 'Critical Transformation Need';
  }

  // ==========================================
  // Dynamic Strengths Generation
  // ==========================================
  const strengths: string[] = [];
  if (section2Score >= 24) {
    strengths.push('Strong digital presence across website, social media, and online visibility');
  } else if (website === 'Yes') {
    strengths.push('Established web presence and online customer touchpoint');
  }

  if (managementMethod === 'ERP / CRM System') {
    strengths.push('Advanced enterprise software & CRM infrastructure');
  } else if (managementMethod === 'Business Software') {
    strengths.push('Good technology adoption with core business software');
  } else if (managementMethod === 'Excel Sheets') {
    strengths.push('Structured data tracking and systematic record-keeping');
  }

  if (isEstablished) {
    strengths.push('Established business operating history and commercial experience');
  }

  if (strengths.length === 0) {
    strengths.push('Recognized active business operations with growth potential');
    strengths.push('Proactive participation in corporate health check assessment');
  }

  // ==========================================
  // Dynamic Key Opportunities Generation
  // ==========================================
  const opportunities: string[] = [];

  if (website === 'No') {
    opportunities.push('Build a professional website to strengthen credibility, visibility, and inbound customer acquisition');
  } else {
    opportunities.push('Optimize existing website performance, search rankings, and lead capture capabilities');
  }

  if (managementMethod === 'Mostly Manual' || managementMethod === 'Excel Sheets') {
    opportunities.push('Transition from manual/spreadsheet management to integrated business software');
  }

  if (googleBusiness === 'No' || googleBusiness === 'Not Sure') {
    opportunities.push('Optimize Google Business Profile listing for local search visibility');
  } else if (digitalMarketing === 'No') {
    opportunities.push('Expand digital marketing campaigns and online customer acquisition');
  }

  if (opportunities.length < 3) {
    opportunities.push('Implement real-time business performance analytics and executive reporting');
  }

  // ==========================================
  // Recommended Next Steps Generation
  // ==========================================
  const recommendations: string[] = [];

  if (website === 'No') {
    recommendations.push('Professional Website Recommended — A professional website can strengthen credibility, visibility, lead generation, and digital presence.');
  } else {
    recommendations.push('Professional Website & Digital Presence Foundation Enhancement');
  }

  if (managementMethod === 'Mostly Manual' || managementMethod === 'Excel Sheets' || areasToImprove.includes('Business Process Improvement')) {
    recommendations.push('Process Improvement & Workflow Standardization');
  }

  if (digitalMarketing === 'No' || areasToImprove.includes('Digital Marketing') || areasToImprove.includes('Website Development')) {
    recommendations.push('Digital Transformation & Inbound Lead Generation Strategy');
  }

  if (areasToImprove.includes('Technology Upgrade') || areasToImprove.includes('Custom Software') || areasToImprove.includes('ERP / CRM System')) {
    recommendations.push('Technology Modernization & Enterprise Software Integration');
  }

  if (recommendations.length < 3) {
    recommendations.push('Growth Strategy & Performance Optimization Consultation');
  }

  return {
    score: overallScore,
    category,
    legalComplianceIndex,
    strengths: strengths.slice(0, 3),
    opportunities: opportunities.slice(0, 3),
    recommendations: recommendations.slice(0, 3),
  };
}

