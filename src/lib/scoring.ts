export interface AssessmentInput {
  companyName: string;
  designation?: string;
  email: string;
  mobile: string;
  location: string;
  industry: string;
  yearsInBusiness: string;
  employees: string;
  
  website: string;         // Yes / No
  socialMedia: string;     // Yes / No
  googleBusiness: string;  // Yes / No / Not Sure
  digitalMarketing: string;// Yes / No
  brandIdentity: string;   // Yes / No
  
  managementMethod: string; // Mostly Manual, Excel Sheets, Business Software, ERP / CRM System
  areasToImprove: string[];
  customImprovementArea?: string;
  
  biggestChallenge: string;
  primaryGoal: string;
}

export interface AssessmentResult {
  score: number;             // Single overall score (0 - 100)
  category: string;          // Category label
  strengths: string[];       // Your Business Strengths
  opportunities: string[];   // Key Opportunities
  recommendations: string[]; // Recommended Next Steps
}

export function calculateBusinessHealthScore(input: AssessmentInput): AssessmentResult {
  const {
    website,
    socialMedia,
    googleBusiness,
    digitalMarketing,
    brandIdentity,
    managementMethod,
    areasToImprove,
    biggestChallenge,
    primaryGoal,
  } = input;

  // ==========================================
  // A. Digital Presence — 30 Points Max
  // ==========================================
  let digitalPresenceScore = 0;
  if (website === 'Yes') digitalPresenceScore += 6;
  
  if (socialMedia === 'Yes' || socialMedia === 'Yes, regularly') digitalPresenceScore += 6;
  else if (socialMedia === 'Sometimes') digitalPresenceScore += 4;
  else if (socialMedia === 'Not Sure') digitalPresenceScore += 2;

  if (googleBusiness === 'Yes') digitalPresenceScore += 6;
  else if (googleBusiness === 'Not Sure') digitalPresenceScore += 3;
  
  if (digitalMarketing === 'Yes' || digitalMarketing === 'Yes, regularly') digitalPresenceScore += 6;
  else if (digitalMarketing === 'Sometimes') digitalPresenceScore += 4;
  else if (digitalMarketing === 'Not Sure') digitalPresenceScore += 2;

  if (brandIdentity === 'Yes') digitalPresenceScore += 6;
  else if (brandIdentity === 'Not Sure') digitalPresenceScore += 3;

  digitalPresenceScore = Math.min(30, digitalPresenceScore);

  // ==========================================
  // B. Business Operations — 40 Points Max
  // ==========================================
  let operationsScore = 10;
  if (managementMethod === 'ERP / CRM System') {
    operationsScore = 40;
  } else if (managementMethod === 'Business Software') {
    operationsScore = 30;
  } else if (managementMethod === 'Excel Sheets') {
    operationsScore = 20;
  } else if (managementMethod === 'Mostly Manual') {
    operationsScore = 10;
  }

  operationsScore = Math.min(40, operationsScore);

  // ==========================================
  // C. Growth Readiness — 30 Points Max
  // ==========================================
  let readinessScore = 0;

  // 1. Intent from Improvement Selections
  const numAreas = Array.isArray(areasToImprove) ? areasToImprove.length : 0;
  if (numAreas >= 4) {
    readinessScore += 12;
  } else if (numAreas >= 1) {
    readinessScore += 10;
  } else {
    readinessScore += 5;
  }

  // 2. Intent Analysis from Biggest Challenge (Rule-based Keyword Engine)
  const challengeText = (biggestChallenge || '').toLowerCase();
  let challengeIdentified = false;

  if (challengeText.length > 5) {
    challengeIdentified = true;
    readinessScore += 4; // Base intent score for describing challenge

    if (/manual|excel|paper|repetitive|process|slow|workflow|delay/.test(challengeText)) {
      readinessScore += 2;
    }
    if (/customer|lead|sales|marketing|client|revenue|growth|acquisition/.test(challengeText)) {
      readinessScore += 2;
    }
    if (/tech|software|system|app|legacy|automation|integration/.test(challengeText)) {
      readinessScore += 2;
    }
  }

  // 3. Intent Analysis from Primary 12-Month Goal (Rule-based Keyword Engine)
  const goalText = (primaryGoal || '').toLowerCase();
  if (goalText.length > 5) {
    readinessScore += 6; // Base intent score for articulating clear goal

    if (/automate|automation|digitize|digital|software|system|ai|crm|erp/.test(goalText)) {
      readinessScore += 4;
    } else if (/revenue|sales|growth|expand|market|customer|double|increase/.test(goalText)) {
      readinessScore += 4;
    } else if (/profit|margin|cost|efficiency|streamline|optimize/.test(goalText)) {
      readinessScore += 4;
    } else {
      readinessScore += 2;
    }
  } else {
    readinessScore += 3;
  }

  readinessScore = Math.min(30, readinessScore);

  // ==========================================
  // Total Overall Business Health Score (0–100)
  // ==========================================
  const overallScore = Math.min(100, Math.max(0, Math.round(digitalPresenceScore + operationsScore + readinessScore)));

  // Category determination
  let category = '';
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
  // Generate Business Strengths
  // ==========================================
  const strengths: string[] = [];
  if (digitalPresenceScore >= 24) {
    strengths.push('Strong digital presence across website, social media, and Google Business');
  } else if (digitalPresenceScore >= 18) {
    strengths.push('Solid digital foundation with active online channels');
  } else if (website === 'Yes') {
    strengths.push('Established web presence and online touchpoint');
  }

  if (managementMethod === 'ERP / CRM System') {
    strengths.push('Advanced enterprise software & CRM infrastructure');
  } else if (managementMethod === 'Business Software') {
    strengths.push('Good technology adoption with core business software');
  } else if (managementMethod === 'Excel Sheets') {
    strengths.push('Structured data tracking and systematic record-keeping');
  }

  if (readinessScore >= 20) {
    strengths.push('High growth readiness and proactive business transformation mindset');
  } else if (numAreas > 0) {
    strengths.push('Clear vision for operational and commercial target improvements');
  }

  if (strengths.length === 0) {
    strengths.push('Recognized active business operations with growth potential');
    strengths.push('Proactive participation in corporate health check assessment');
  }

  // ==========================================
  // Generate Key Opportunities
  // ==========================================
  const opportunities: string[] = [];

  // Check management method for operational opportunity
  if (managementMethod === 'Mostly Manual' || managementMethod === 'Excel Sheets') {
    opportunities.push('Transition from manual/spreadsheet management to integrated business software');
  }

  // Check digital presence gaps
  if (website === 'No' || digitalMarketing === 'No') {
    opportunities.push('Expand digital marketing campaigns and online customer acquisition');
  }
  if (googleBusiness === 'No' || googleBusiness === 'Not Sure') {
    opportunities.push('Optimize Google Business Profile listing for local search visibility');
  }

  // Check improvement selections
  if (areasToImprove.includes('AI & Automation') || areasToImprove.includes('Business Process Improvement')) {
    opportunities.push('Automate repetitive daily operations to reduce overhead and manual errors');
  }
  if (areasToImprove.includes('More Customers & Leads') || areasToImprove.includes('Digital Marketing')) {
    opportunities.push('Establish a predictable sales pipeline and lead generation engine');
  }

  if (opportunities.length < 3) {
    opportunities.push('Implement real-time business performance analytics and executive reporting');
  }

  // ==========================================
  // Generate Recommended Next Steps
  // ==========================================
  const recommendations: string[] = [];

  if (managementMethod === 'Mostly Manual' || managementMethod === 'Excel Sheets' || areasToImprove.includes('Business Process Improvement')) {
    recommendations.push('Process Improvement & Workflow Standardization');
  }
  if (website === 'No' || digitalMarketing === 'No' || areasToImprove.includes('Digital Marketing') || areasToImprove.includes('Website Development')) {
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
    strengths: strengths.slice(0, 3),
    opportunities: opportunities.slice(0, 3),
    recommendations: recommendations.slice(0, 3),
  };
}
