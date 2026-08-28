'use client';

import React, { useState, useRef } from 'react';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Loader2,
  ChevronRight,
  Check,
  Printer,
  TrendingUp,
  Target,
  ThumbsUp,
  ThumbsDown,
  Globe,
  Megaphone,
  MapPinned,
  Palette,
  ArrowUpRight,
  Activity,
  FileText,
  ShieldCheck,
  Info,
} from 'lucide-react';

import { getLegalComplianceAttentionAreas } from '@/lib/scoring';

interface LegalComplianceIndex {
  score: number;
  status: 'Strong' | 'Good' | 'Needs Attention';
  interpretation: string;
  note: string;
  attentionAreas?: string[];
  factors: {
    gstStatus: string;
    trademarkStatus: string;
    googleBusinessStatus: string;
    entityStructure: string;
  };
}

interface ResultData {
  id: string;
  companyName?: string;
  score: number;
  category: string;
  legalComplianceIndex: LegalComplianceIndex;
  strengths: string[];
  opportunities: string[];
  recommendations: string[];
  createdAt: string;
  yearsInBusiness?: string;
  businessStructure?: string;
  gstRegistered?: string;
  annualTurnover?: string;
  trademarkRegistered?: string;
  googleBusiness?: string;
  website?: string;
}

export default function BusinessHealthCheckForm() {
  const [formData, setFormData] = useState({
    // Section 1: Business Information
    companyName: '',
    designation: '',
    email: '',
    mobile: '',
    location: '',
    industry: '',
    customIndustry: '',
    yearsInBusiness: '',
    employees: '',
    businessStructure: '',
    customBusinessStructure: '',
    gstRegistered: '',
    annualTurnover: '',
    trademarkRegistered: '',

    // Section 2: Current Business Presence
    website: '',
    socialMedia: '',
    googleBusiness: '',
    digitalMarketing: '',
    brandIdentity: '',

    // Section 3: Business Operations
    managementMethod: '',
    areasToImprove: [] as string[],
    customImprovementArea: '',

    // Section 4: Growth Goals
    biggestChallenge: [] as string[],
    customChallenge: '',
    primaryGoal: [] as string[],
    customGoal: '',
  });

  // Hero headline sequential animation steps:
  // Step 0: "Blood Report" visible (coral text)
  // Step 1: Strike-through appears across "Blood Report"
  // Step 2: "Blood Report" fades out completely
  // Step 3: "Business Health" (gradient) is revealed
  const [animStep, setAnimStep] = useState<0 | 1 | 2 | 3>(0);

  React.useEffect(() => {
    // Step 1: Strike-through appears after 800ms
    const timer1 = setTimeout(() => setAnimStep(1), 800);
    // Step 2: Fade out Blood Report after strike-through (1800ms)
    const timer2 = setTimeout(() => setAnimStep(2), 1800);
    // Step 3: Reveal Business Health (2300ms)
    const timer3 = setTimeout(() => setAnimStep(3), 2300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Cleanup follow-up timer on component unmount
  React.useEffect(() => {
    return () => {
      if (followUpTimerRef.current !== null) {
        clearTimeout(followUpTimerRef.current);
        followUpTimerRef.current = null;
      }
    };
  }, []);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [followUp, setFollowUp] = useState<'yes' | 'no' | null>(null);
  const [followUpSaving, setFollowUpSaving] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);
  const followUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollPositionRef = useRef<number>(0);

  // Certificate download via browser print-to-PDF
  const downloadCertificate = () => {
    if (!result) return;
    window.print();
  };

  const resetAssessment = () => {
    // Reset form data to initial state
    setFormData({
      companyName: '',
      designation: '',
      email: '',
      mobile: '',
      location: '',
      industry: '',
      customIndustry: '',
      yearsInBusiness: '',
      employees: '',
      businessStructure: '',
      customBusinessStructure: '',
      gstRegistered: '',
      annualTurnover: '',
      trademarkRegistered: '',
      website: '',
      socialMedia: '',
      googleBusiness: '',
      digitalMarketing: '',
      brandIdentity: '',
      managementMethod: '',
      areasToImprove: [] as string[],
      customImprovementArea: '',
      biggestChallenge: [] as string[],
      customChallenge: '',
      primaryGoal: [] as string[],
      customGoal: '',
    });

    // Clear result and errors
    setResult(null);
    setErrors({});
    setErrorMessage(null);
    setSubmitted(false);
    setFollowUp(null);
    setShowCertificateModal(false);
    followUpTimerRef.current = null;

    // Scroll to top
    window.scrollTo(0, 0);
  };

  const handleFollowUp = async (choice: 'yes' | 'no') => {
    if (!result || followUp !== null || followUpSaving || followUpTimerRef.current !== null) return;

    // Preserve scroll position before state changes
    scrollPositionRef.current = window.scrollY || window.pageYOffset;

    setFollowUpSaving(true);

    try {
      const response = await fetch(`/api/business-health-check/${result.id}/follow-up`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followUpResponse: choice.toUpperCase() }),
      });

      if (!response.ok) {
        throw new Error('Unable to save your response. Please try again.');
      }

      setFollowUp(choice);
      if (choice === 'yes') {
        // Close the Yes popup after 1.8 seconds, then reset the page
        followUpTimerRef.current = setTimeout(() => {
          resetAssessment();
        }, 1800);
      } else if (choice === 'no') {
        // Close the No popup after 2.5 seconds, then reset the page
        followUpTimerRef.current = setTimeout(() => {
          resetAssessment();
        }, 2500);
      }
    } catch {
      setFollowUp(null);
      setErrorMessage('Unable to save your response. Please try again.');
    } finally {
      setFollowUpSaving(false);
    }
  };

  // Restore scroll position after state changes and prevent unintended scrolling
  React.useEffect(() => {
    if (followUp !== null) {
      // Restore the saved scroll position immediately when modal appears
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current);
      });
    }
  }, [followUp]);

  // ------------------------------------------------------------
  // VALIDATION
  // ------------------------------------------------------------

  const validateField = (field: string, value: any): boolean => {
    let errorMsg = '';
    const trimmed =
      typeof value === 'string' ? value.trim() : value;

    const mobileRe = /^[6-9]\d{9}$/;

    switch (field) {
      case 'companyName':
        if (!trimmed || trimmed.length < 2) {
          errorMsg = 'Company name is required.';
        }
        break;

      case 'email':
        if (!trimmed) {
          errorMsg = 'Email address is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          errorMsg = 'Please enter a valid email address.';
        }
        break;

      case 'mobile': {
        const cleanMobile =
          typeof value === 'string'
            ? value.replace(/\s/g, '')
            : '';

        if (!cleanMobile || !mobileRe.test(cleanMobile)) {
          errorMsg = 'Please enter a valid 10-digit Indian mobile number.';
        }

        break;
      }

      case 'location':
        if (!trimmed || trimmed.length < 2) {
          errorMsg = 'Business location is required.';
        } else if (/^[^a-zA-Z0-9]+$/.test(trimmed)) {
          errorMsg =
            'Location must contain letters or numbers.';
        }
        break;

      case 'industry':
        if (!value || value === '') {
          errorMsg = 'Please select an industry.';
        }
        break;

      case 'customIndustry':
        if (formData.industry === 'Other' && (!trimmed || trimmed.length < 2)) {
          errorMsg = 'Please specify your industry.';
        }
        break;

      case 'yearsInBusiness':
        if (!value || value === '') {
          errorMsg = 'Please select years in business.';
        }
        break;

      case 'employees':
        if (!value) {
          errorMsg = 'Please select number of employees.';
        }
        break;

      case 'businessStructure':
        if (!value) {
          errorMsg = 'Please select your business structure.';
        }
        break;

      case 'customBusinessStructure':
        if (
          formData.businessStructure === 'Other' &&
          (!trimmed || trimmed.length < 2)
        ) {
          errorMsg = 'Please specify your business structure.';
        }
        break;

      case 'gstRegistered':
        if (!value) {
          errorMsg = 'Please select your GST registration status.';
        }
        break;

      case 'trademarkRegistered':
        if (!value) {
          errorMsg = 'Please select your trademark registration status.';
        }
        break;

      case 'website':
        if (!value) {
          errorMsg = 'Please select an option.';
        }
        break;

      case 'socialMedia':
        if (!value) {
          errorMsg = 'Please select an option.';
        }
        break;

      case 'googleBusiness':
        if (!value) {
          errorMsg = 'Please select an option.';
        }
        break;

      case 'digitalMarketing':
        if (!value) {
          errorMsg = 'Please select an option.';
        }
        break;

      case 'brandIdentity':
        if (!value) {
          errorMsg = 'Please select an option.';
        }
        break;

      case 'managementMethod':
        if (!value) {
          errorMsg = 'Please select an option.';
        }
        break;

      case 'customImprovementArea':
        if (
          formData.areasToImprove.includes('Other') &&
          !trimmed
        ) {
          errorMsg = 'Please specify the improvement area.';
        }
        break;

      case 'biggestChallenge':
        if (!value || (Array.isArray(value) && value.length === 0)) {
          errorMsg = 'Please select at least one business challenge.';
        }
        break;

      case 'customChallenge':
        if (
          formData.biggestChallenge.includes('Other') &&
          !trimmed
        ) {
          errorMsg = 'Please specify your challenge.';
        }
        break;

      case 'primaryGoal':
        if (!value || (Array.isArray(value) && value.length === 0)) {
          errorMsg = 'Please select at least one business goal.';
        }
        break;

      case 'customGoal':
        if (
          formData.primaryGoal.includes('Other') &&
          !trimmed
        ) {
          errorMsg = 'Please specify your goal.';
        }
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [field]: errorMsg,
    }));

    return !errorMsg;
  };

  const handleInputChange = (
    field: string,
    value: any
  ) => {
    if (field === 'industry') {
      setFormData((prev) => ({
        ...prev,
        industry: value,
        customIndustry: value === 'Other' ? prev.customIndustry : '',
      }));

      if (value !== 'Other') {
        setErrors((prev) => ({
          ...prev,
          industry: '',
          customIndustry: '',
        }));
      } else if (errors.industry) {
        validateField('industry', value);
      }
      return;
    }

    if (field === 'businessStructure') {
      setFormData((prev) => ({
        ...prev,
        businessStructure: value,
        customBusinessStructure:
          value === 'Other' ? prev.customBusinessStructure : '',
      }));

      if (value !== 'Other') {
        setErrors((prev) => ({
          ...prev,
          businessStructure: '',
          customBusinessStructure: '',
        }));
      } else if (errors.businessStructure) {
        validateField('businessStructure', value);
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      validateField(field, value);
    }
  };

  const handleAreaToggle = (area: string) => {
    setFormData((prev) => {
      const exists = prev.areasToImprove.includes(area);

      const updated = exists
        ? prev.areasToImprove.filter((a) => a !== area)
        : [...prev.areasToImprove, area];

      return {
        ...prev,
        areasToImprove: updated,
        customImprovementArea:
          area === 'Other' && exists
            ? ''
            : prev.customImprovementArea,
      };
    });

    if (area === 'Other' && formData.areasToImprove.includes('Other')) {
      setErrors((prev) => ({
        ...prev,
        customImprovementArea: '',
      }));
    }
  };

  const handleChallengeToggle = (item: string) => {
    setFormData((prev) => {
      const exists = prev.biggestChallenge.includes(item);

      const updated = exists
        ? prev.biggestChallenge.filter((a) => a !== item)
        : [...prev.biggestChallenge, item];

      return {
        ...prev,
        biggestChallenge: updated,
        customChallenge:
          item === 'Other' && exists
            ? ''
            : prev.customChallenge,
      };
    });

    if (item === 'Other' && formData.biggestChallenge.includes('Other')) {
      setErrors((prev) => ({
        ...prev,
        customChallenge: '',
      }));
    }

    if (errors.biggestChallenge) {
      setErrors((prev) => ({
        ...prev,
        biggestChallenge: '',
      }));
    }
  };

  const handleGoalToggle = (item: string) => {
    setFormData((prev) => {
      const exists = prev.primaryGoal.includes(item);

      const updated = exists
        ? prev.primaryGoal.filter((a) => a !== item)
        : [...prev.primaryGoal, item];

      return {
        ...prev,
        primaryGoal: updated,
        customGoal:
          item === 'Other' && exists
            ? ''
            : prev.customGoal,
      };
    });

    if (item === 'Other' && formData.primaryGoal.includes('Other')) {
      setErrors((prev) => ({
        ...prev,
        customGoal: '',
      }));
    }

    if (errors.primaryGoal) {
      setErrors((prev) => ({
        ...prev,
        primaryGoal: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const fields = [
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
      'biggestChallenge',
      'primaryGoal',
    ];

    let isValid = true;

    fields.forEach((field) => {
      const valid = validateField(
        field,
        (formData as any)[field]
      );

      if (!valid) {
        isValid = false;
      }
    });

    if (formData.industry === 'Other') {
      const valid = validateField(
        'customIndustry',
        formData.customIndustry
      );

      if (!valid) {
        isValid = false;
      }
    }

    if (formData.businessStructure === 'Other') {
      const valid = validateField(
        'customBusinessStructure',
        formData.customBusinessStructure
      );

      if (!valid) {
        isValid = false;
      }
    }

    if (formData.areasToImprove.includes('Other')) {
      const valid = validateField(
        'customImprovementArea',
        formData.customImprovementArea
      );

      if (!valid) {
        isValid = false;
      }
    }

    if (formData.biggestChallenge.includes('Other')) {
      const valid = validateField(
        'customChallenge',
        formData.customChallenge
      );

      if (!valid) {
        isValid = false;
      }
    }

    if (formData.primaryGoal.includes('Other')) {
      const valid = validateField(
        'customGoal',
        formData.customGoal
      );

      if (!valid) {
        isValid = false;
      }
    }

    return isValid;
  };

  // ------------------------------------------------------------
  // SUBMIT
  // ------------------------------------------------------------

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (submitted) return;

    setErrorMessage(null);

    if (!validateForm()) {
      setTimeout(() => {
        const firstErr =
          document.querySelector('[data-error]');

        firstErr?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 50);

      return;
    }

    setLoading(true);
    setSubmitted(true);

    try {
      const res = await fetch(
        '/api/business-health-check',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || 'Submission failed.'
        );
      }

      setResult(data);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof TypeError && err.message === 'Failed to fetch'
          ? 'Unable to reach the Business Health Check service. Please make sure the app server is running and try again.'
          : err instanceof Error
            ? err.message
            : 'An error occurred. Please try again.'
      );

      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // PROGRESS
  // ------------------------------------------------------------

  const calculateProgress = () => {
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
      'biggestChallenge',
      'primaryGoal',
    ];

    const filled = requiredFields.filter(
      (field) => {
        const val = (formData as any)[field];

        return typeof val === 'string'
          ? val.trim().length > 0
          : Array.isArray(val)
            ? val.length > 0
            : !!val;
      }
    ).length;

    return Math.round(
      (filled / requiredFields.length) * 100
    );
  };

  // ------------------------------------------------------------
  // ERROR
  // ------------------------------------------------------------

  const Err = ({
    field,
  }: {
    field: string;
  }) =>
    errors[field] ? (
      <p
        data-error
        className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-300"
      >
        <AlertTriangle className="h-3 w-3 shrink-0" />
        {errors[field]}
      </p>
    ) : null;

  // ------------------------------------------------------------
  // INPUT STYLING
  // ------------------------------------------------------------

  const inputClass = (field: string) => {
    const hasErr = !!errors[field];

    return `
      w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold text-slate-900
      outline-none transition-all duration-200
      placeholder:text-slate-400
      ${hasErr
        ? `
            border-red-400
            bg-red-50/50
            focus:border-red-500
            focus:ring-4
            focus:ring-red-500/10
          `
        : `
            border-slate-300
            bg-slate-50/60
            hover:border-slate-400
            hover:bg-white
            focus:border-blue-600
            focus:bg-white
            focus:ring-4
            focus:ring-blue-600/10
          `
      }
    `;
  };

  const improvementOptions = [
    'More Customers & Leads',
    'Website Development',
    'Digital Marketing',
    'Branding',
    'Mobile Application',
    'Custom Software',
    'Business Process Improvement',
    'Technology Upgrade',
    'Business Strategy',
    'AI & Automation',
    'Other',
  ];

  const challengeOptions = [
    'Getting More Customers',
    'Generating More Leads',
    'Increasing Sales',
    'Improving Profitability',
    'Managing Cash Flow',
    'Reducing Costs',
    'Improving Business Operations',
    'Too Much Manual Work',
    'Technology Challenges',
    'Employee / Team Challenges',
    'Customer Retention',
    'Marketing Challenges',
    'Competition',
    'Other',
  ];

  const goalOptions = [
    'Increase Revenue',
    'Improve Profitability',
    'Get More Customers',
    'Increase Sales',
    'Expand to New Markets',
    'Improve Business Operations',
    'Automate Processes',
    'Upgrade Technology',
    'Improve Marketing',
    'Build the Team',
    'Improve Customer Experience',
    'Launch a New Product / Service',
    'Business Expansion',
    'Other',
  ];

  const getCategoryBadgeClass = (
    category: string
  ) => {
    switch (category) {
      case 'Transformation Leader':
        return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300';

      case 'Growth Ready':
        return 'border-blue-400/30 bg-blue-500/10 text-blue-300';

      case 'Transformation Opportunity':
        return 'border-amber-400/30 bg-amber-500/10 text-amber-300';

      case 'Transformation Required':
        return 'border-orange-400/30 bg-orange-500/10 text-orange-300';

      default:
        return 'border-red-400/30 bg-red-500/10 text-red-300';
    }
  };

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <>
    <div id="top" className="stellar-page relative min-h-screen overflow-hidden bg-slate-950 pb-20">

      {/* --------------------------------------------------------
          BACKGROUND
      --------------------------------------------------------- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute -right-40 top-40 h-[30rem] w-[30rem] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="absolute bottom-20 left-1/3 h-72 w-72 rounded-full bg-cyan-400/5 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #2563eb 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative z-10">

        {/* ------------------------------------------------------
            HERO
        ------------------------------------------------------- */}
        <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/60 text-white shadow-lg">

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-4xl px-4 py-10 text-center sm:px-6 lg:px-8">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold tracking-[0.16em] text-cyan-200 uppercase">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              NG STELLAR TRANSFORMATION HEALTH CHECK
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl leading-tight">
              Get Your{' '}
              <span className="relative inline-grid text-center align-bottom">
                {/* STEP 1 & 2: "Blood Report" with strike-through, then fade out */}
                <span className="col-start-1 row-start-1 text-[#EF4444] whitespace-nowrap animate-[heroBloodReport_7.3s_ease-in-out_infinite]">
                  Blood Report
                </span>

                {/* STEP 3: "Business Health" gradient text fades in */}
                <span className="col-start-1 row-start-1 bg-gradient-to-r from-sky-400 via-teal-300 to-lime-300 bg-clip-text text-transparent whitespace-nowrap opacity-0 animate-[heroBusinessHealth_7.3s_ease-in-out_infinite]">
                  Business Health Report
                </span>
              </span>
              <span className="block mt-1 sm:mt-2">in 30 Seconds.</span>
            </h1>

            <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              Just like a blood report helps you understand your body&apos;s health, the NG Stellar Transformation Health Check helps you understand your business health, identify gaps, and know what to transform next.
            </p>

            <p className="mt-3 text-xs font-extrabold uppercase tracking-wider text-cyan-300">
              Check. Understand. Transform.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-300">

              <span className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5">
                Free Assessment &amp; Certificate
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5">
                Growth Insights
              </span>

            </div>

          </div>
        </header>

        {/* ------------------------------------------------------
            MAIN CONTAINER
        ------------------------------------------------------- */}
        <div className="stellar-form-area mx-auto mt-6 w-full max-w-[1380px] rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 md:p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">

          {/* ----------------------------------------------------
              PROGRESS
          ----------------------------------------------------- */}
          <div id="assessment" className="mb-6 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 sm:p-5 shadow-sm">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500 bg-blue-600 text-xs font-black text-white shadow-md shadow-blue-600/20">
                  {calculateProgress()}%
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Assessment Progress
                  </h3>

                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                    Complete all required fields across the 4 sections.
                  </p>
                </div>

              </div>

              <div className="w-full sm:w-80">

                <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  <span>Assessment Progress</span>
                  <span className="text-blue-600 font-bold">{calculateProgress()}%</span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 transition-all duration-500"
                    style={{
                      width: `${calculateProgress()}%`,
                    }}
                  />
                </div>

              </div>

            </div>
          </div>

          {/* ----------------------------------------------------
              FORM
          ----------------------------------------------------- */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* API ERROR */}
            {errorMessage && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">

                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                <div>
                  <p className="text-sm font-bold text-red-900">
                    Something went wrong
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-red-700">
                    {errorMessage}
                  </p>
                </div>

              </div>
            )}

            {/* ==================================================
                SECTIONS 1–4 INDEPENDENT COLUMN LAYOUT
                Desktop: Left Column (1 -> 3), Right Column (2 -> 4)
                Mobile: Stacked (1 -> 2 -> 3 -> 4)
            ================================================== */}
            <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">

              {/* SECTION 1 */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all h-full">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3 border-b border-slate-200/70 pb-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-500 bg-blue-600 text-xs font-extrabold text-white shadow-sm">
                      01
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold tracking-tight text-slate-900">
                        Business Information
                      </h2>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Company profile and operational background
                      </p>
                    </div>
                    <span className="ml-auto whitespace-nowrap text-[10px] font-bold text-slate-500">
                      <span className="text-red-500">*</span> Required field
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    {/* Company */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Company Name
                      </label>
                      <div className="relative">
                        <Building2 className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. Acme Innovations Pvt Ltd"
                          value={formData.companyName}
                          onChange={(e) =>
                            handleInputChange('companyName', e.target.value)
                          }
                          onBlur={(e) =>
                            validateField('companyName', e.target.value)
                          }
                          className={`${inputClass('companyName')} pl-10`}
                        />
                      </div>
                      <Err field="companyName" />
                    </div>

                    {/* Designation */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Designation{' '}
                        <span className="font-normal text-slate-400">
                          (Optional)
                        </span>
                      </label>
                      <div className="relative">
                        <Briefcase className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. Founder & CEO"
                          value={formData.designation}
                          onChange={(e) =>
                            handleInputChange('designation', e.target.value)
                          }
                          className={`${inputClass('designation')} pl-10`}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          placeholder="e.g. rajesh@acme.com"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange('email', e.target.value)
                          }
                          onBlur={(e) =>
                            validateField('email', e.target.value)
                          }
                          className={`${inputClass('email')} pl-10`}
                        />
                      </div>
                      <Err field="email" />
                    </div>

                    {/* Mobile */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={formData.mobile}
                          maxLength={10}
                          inputMode="numeric"
                          pattern="[6-9][0-9]{9}"
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                            handleInputChange('mobile', value);
                          }}
                          onBlur={(e) => validateField('mobile', e.target.value)}
                          className={`${inputClass('mobile')} pl-10`}
                        />
                      </div>
                      <Err field="mobile" />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Business Location
                      </label>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. Coimbatore, Tamil Nadu"
                          value={formData.location}
                          onChange={(e) =>
                            handleInputChange('location', e.target.value)
                          }
                          onBlur={(e) =>
                            validateField('location', e.target.value)
                          }
                          className={`${inputClass('location')} pl-10`}
                        />
                      </div>
                      <Err field="location" />
                    </div>

                    {/* Industry */}
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Industry
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) =>
                          handleInputChange('industry', e.target.value)
                        }
                        onBlur={(e) =>
                          validateField('industry', e.target.value)
                        }
                        className={inputClass('industry')}
                      >
                        <option value="">-- Select Industry --</option>
                        <option value="Digital Marketing &amp; Software Services">Digital Marketing &amp; Software Services</option>
                        <option value="IT / SaaS">IT / SaaS</option>
                        <option value="Manufacturing &amp; Engineering">Manufacturing &amp; Engineering</option>
                        <option value="Healthcare &amp; Pharmaceuticals">Healthcare &amp; Pharmaceuticals</option>
                        <option value="Retail &amp; E-commerce">Retail &amp; E-commerce</option>
                        <option value="Financial Services &amp; Fintech">Financial Services &amp; Fintech</option>
                        <option value="Real Estate &amp; Construction">Real Estate &amp; Construction</option>
                        <option value="Education &amp; EdTech">Education &amp; EdTech</option>
                        <option value="Professional Services &amp; Consulting">Professional Services &amp; Consulting</option>
                        <option value="Hospitality &amp; Food Services">Hospitality &amp; Food Services</option>
                        <option value="Logistics &amp; Supply Chain">Logistics &amp; Supply Chain</option>
                        <option value="Other">Other</option>
                      </select>
                      <Err field="industry" />

                      {formData.industry === 'Other' && (
                        <div className="mt-3">
                          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                            Specify Your Industry
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Textile Manufacturing, Automobile Parts, Event Management"
                            value={formData.customIndustry}
                            onChange={(e) => handleInputChange('customIndustry', e.target.value)}
                            onBlur={(e) => validateField('customIndustry', e.target.value)}
                            className={inputClass('customIndustry')}
                          />
                          <Err field="customIndustry" />
                        </div>
                      )}
                    </div>

                    {/* Years */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Years in Business
                      </label>
                      <select
                        value={formData.yearsInBusiness}
                        onChange={(e) =>
                          handleInputChange('yearsInBusiness', e.target.value)
                        }
                        onBlur={(e) =>
                          validateField('yearsInBusiness', e.target.value)
                        }
                        className={inputClass('yearsInBusiness')}
                      >
                        <option value="">-- Select Duration --</option>
                        <option value="Less than 1 year">Less than 1 year</option>
                        <option value="1–3 years">1–3 years</option>
                        <option value="3–5 years">3–5 years</option>
                        <option value="5–10 years">5–10 years</option>
                        <option value="10–15 years">10–15 years</option>
                        <option value="15+ years">15+ years</option>
                      </select>
                      <Err field="yearsInBusiness" />
                    </div>

                    {/* Employees */}
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Number of Employees
                      </label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {['1–10', '11–50', '51–200', '200+'].map((emp) => (
                          <label
                            key={emp}
                            className="block w-full cursor-pointer select-none"
                          >
                            <input
                              type="radio"
                              name="employees"
                              value={emp}
                              checked={formData.employees === emp}
                              onChange={() => {
                                handleInputChange('employees', emp);
                                validateField('employees', emp);
                              }}
                              className="sr-only"
                            />
                            <span
                              className={`flex min-h-[38px] w-full items-center justify-center rounded-xl border px-3 py-2 text-center text-xs font-semibold transition-all duration-200 ${
                                formData.employees === emp
                                  ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/15'
                                  : 'border-slate-300 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md'
                              }`}
                            >
                              {emp}
                            </span>
                          </label>
                        ))}
                      </div>
                      <Err field="employees" />
                    </div>

                    {/* Business Structure */}
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-xs font-semibold leading-5 text-slate-800">
                        What is your business structure?
                      </label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {[
                          'Sole Proprietorship',
                          'Partnership Firm',
                          'Private Limited Company',
                          'LLP',
                          'OPC',
                          'Other',
                        ].map((structure) => (
                          <label
                            key={structure}
                            className="block w-full cursor-pointer select-none"
                          >
                            <input
                              type="radio"
                              name="businessStructure"
                              value={structure}
                              checked={formData.businessStructure === structure}
                              onChange={() => {
                                handleInputChange('businessStructure', structure);
                                validateField('businessStructure', structure);
                              }}
                              className="sr-only"
                            />
                            <span
                              className={`flex min-h-[40px] w-full items-center justify-center rounded-xl border px-3 py-2 text-center text-xs font-semibold transition-all ${
                                formData.businessStructure === structure
                                  ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/15'
                                  : 'border-slate-300 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md'
                              }`}
                            >
                              {structure}
                            </span>
                          </label>
                        ))}
                      </div>
                      <Err field="businessStructure" />

                      {formData.businessStructure === 'Other' && (
                        <div className="mt-3">
                          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                            Specify Business Structure
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Family Business, Trust, NGO, Cooperative"
                            value={formData.customBusinessStructure}
                            onChange={(e) =>
                              handleInputChange('customBusinessStructure', e.target.value)
                            }
                            onBlur={(e) =>
                              validateField('customBusinessStructure', e.target.value)
                            }
                            className={inputClass('customBusinessStructure')}
                          />
                          <Err field="customBusinessStructure" />
                        </div>
                      )}
                    </div>

                    {/* GST Registration */}
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-xs font-semibold leading-5 text-slate-800">
                        Is GST registered for your business?
                      </label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {['Yes', 'No', 'Not Applicable', 'Not Sure'].map((status) => (
                          <label
                            key={status}
                            className="block w-full cursor-pointer select-none"
                          >
                            <input
                              type="radio"
                              name="gstRegistered"
                              value={status}
                              checked={formData.gstRegistered === status}
                              onChange={() => {
                                handleInputChange('gstRegistered', status);
                                validateField('gstRegistered', status);
                              }}
                              className="sr-only"
                            />
                            <span
                              className={`flex min-h-[40px] w-full items-center justify-center rounded-xl border px-3 py-2 text-center text-xs font-semibold transition-all ${
                                formData.gstRegistered === status
                                  ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/15'
                                  : 'border-slate-300 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md'
                              }`}
                            >
                              {status}
                            </span>
                          </label>
                        ))}
                      </div>
                      <Err field="gstRegistered" />
                    </div>

                    {/* Annual Turnover */}
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Annual Turnover{' '}
                        <span className="font-normal text-slate-400">(Optional)</span>
                      </label>
                      <select
                        value={formData.annualTurnover}
                        onChange={(e) => handleInputChange('annualTurnover', e.target.value)}
                        className={inputClass('annualTurnover')}
                      >
                        <option value="">-- Select Range --</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                        <option value="Below ₹10 Lakhs">Below ₹10 Lakhs</option>
                        <option value="₹10–25 Lakhs">₹10–25 Lakhs</option>
                        <option value="₹25–50 Lakhs">₹25–50 Lakhs</option>
                        <option value="₹50 Lakhs–₹1 Crore">₹50 Lakhs–₹1 Crore</option>
                        <option value="₹1–5 Crore">₹1–5 Crore</option>
                        <option value="₹5–10 Crore">₹5–10 Crore</option>
                        <option value="Above ₹10 Crore">Above ₹10 Crore</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2 */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all h-full">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3 border-b border-slate-200/70 pb-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-500 bg-blue-600 text-xs font-extrabold text-white shadow-sm">
                      02
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold tracking-tight text-slate-900">
                        Current Business Presence
                      </h2>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Digital presence and marketing reach
                      </p>
                    </div>
                    <span className="ml-auto whitespace-nowrap text-[10px] font-bold text-slate-500">
                      <span className="text-red-500">*</span> Required field
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        field: 'trademarkRegistered',
                        question: 'Trademark Registered?',
                        options: ['Yes', 'No', 'In Progress', 'Not Sure'],
                        icon: ShieldCheck,
                      },
                      {
                        field: 'website',
                        question: 'Do you have a business website?',
                        options: ['Yes', 'No'],
                        icon: Globe,
                      },
                      {
                        field: 'socialMedia',
                        question:
                          'Are you actively promoting your business on social media?',
                        options: ['Yes, regularly', 'Sometimes', 'No', 'Not Sure'],
                        icon: Megaphone,
                      },
                      {
                        field: 'googleBusiness',
                        question:
                          'Is your business listed on Google Business Profile?',
                        options: ['Yes', 'No', 'Not Sure'],
                        icon: MapPinned,
                      },
                      {
                        field: 'digitalMarketing',
                        question: 'Do you run Digital Marketing or Online Ads?',
                        options: ['Yes, regularly', 'Sometimes', 'No', 'Not Sure'],
                        icon: TrendingUp,
                      },
                      {
                        field: 'brandIdentity',
                        question: 'Do you have a company logo and brand identity?',
                        options: ['Yes', 'No', 'Not Sure'],
                        icon: Palette,
                      },
                    ].map(({ field, question, options, icon: Icon }) => (
                      <div
                        key={field}
                        className={`rounded-2xl border p-3 transition-all ${errors[field]
                          ? 'border-red-200 bg-red-50/40'
                          : 'border-slate-200/80 bg-white hover:border-slate-300'
                          }`}
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex min-w-0 items-start gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <span className="text-xs font-semibold leading-5 text-slate-800">
                                {question}
                              </span>
                            </div>
                          </div>
                          <div className="grid w-full min-w-0 grid-cols-2 items-center gap-1.5 lg:flex lg:w-auto lg:shrink-0 lg:flex-nowrap">
                            {options.map((opt) => (
                              <label
                                key={opt}
                                className="block w-full cursor-pointer select-none lg:w-auto"
                              >
                                <input
                                  type="radio"
                                  name={field}
                                  value={opt}
                                  checked={(formData as any)[field] === opt}
                                  onChange={() => {
                                    handleInputChange(field, opt);
                                    validateField(field, opt);
                                  }}
                                  className="sr-only"
                                />
                                <span
                                  className={`flex min-h-[38px] min-w-0 w-full items-center justify-center rounded-xl border px-3 py-2 text-center text-xs font-bold transition-all duration-200 lg:min-w-[70px] ${
                                    (formData as any)[field] === opt
                                      ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/15'
                                      : 'border-slate-300 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md'
                                  }`}
                                >
                                  {opt}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <Err field={field} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/60 p-4 shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 border border-blue-100 shadow-sm">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-950">
                      Digital Footprint & Growth Impact
                    </h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                      Your digital presence contributes to the overall assessment and helps identify areas where digital improvement may support business growth.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 3 */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all h-full">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3 border-b border-slate-200/70 pb-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-500 bg-blue-600 text-xs font-extrabold text-white shadow-sm">
                      03
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold tracking-tight text-slate-900">
                        Business Operations
                      </h2>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Operational tools and improvement priorities
                      </p>
                    </div>
                    <span className="ml-auto whitespace-nowrap text-[10px] font-bold text-slate-500">
                      <span className="text-red-500">*</span> Required field
                    </span>
                  </div>

                  <div className="space-y-5">
                    {/* Management Method */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold leading-5 text-slate-800">
                        1. How do you currently manage your business?{' '}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          'Mostly Manual',
                          'Excel Sheets',
                          'Business Software',
                          'ERP / CRM System',
                        ].map((method) => (
                          <label
                            key={method}
                            className="block w-full cursor-pointer select-none"
                          >
                            <input
                              type="radio"
                              name="managementMethod"
                              value={method}
                              checked={formData.managementMethod === method}
                              onChange={() => {
                                handleInputChange('managementMethod', method);
                                validateField('managementMethod', method);
                              }}
                              className="sr-only"
                            />
                            <span
                              className={`flex min-h-[40px] w-full items-center justify-center rounded-xl border px-3 py-2 text-center text-xs font-semibold transition-all ${
                                formData.managementMethod === method
                                  ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/15'
                                  : 'border-slate-300 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md'
                              }`}
                            >
                              {method === 'Business Software'
                                ? 'Standalone Software(s)'
                                : method}
                            </span>
                          </label>
                        ))}
                      </div>
                      <Err field="managementMethod" />
                    </div>

                    {/* Improvement Areas */}
                    <div>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                        <label className="text-xs font-semibold text-slate-800">
                          2. Which area of your business would you like to improve / need help with from us?{' '}
                        </label>
                        <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Select all that apply
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {improvementOptions.map((area) => {
                          const selected = formData.areasToImprove.includes(area);
                          return (
                            <label
                              key={area}
                              className="block w-full cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                name="areasToImprove"
                                value={area}
                                checked={selected}
                                onChange={() => handleAreaToggle(area)}
                                className="sr-only"
                              />
                              <span
                                className={`flex min-h-[38px] w-full items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left text-[11px] transition-all ${
                                  selected
                                    ? 'border-blue-400 bg-blue-50 text-blue-800 font-semibold shadow-sm'
                                    : 'border-slate-300 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md'
                                }`}
                              >
                                <span
                                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border ${
                                    selected
                                      ? 'border-blue-600 bg-blue-600 text-white'
                                      : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {selected && (
                                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                                  )}
                                </span>
                                <span className="font-medium">{area}</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>

                      {formData.areasToImprove.includes('Other') && (
                        <div className="mt-3">
                          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                            Specify Other Improvement Area
                          </label>
                          <textarea
                            rows={3}
                            placeholder="e.g. Customer retention, supply chain management, staff training..."
                            value={formData.customImprovementArea}
                            onChange={(e) =>
                              handleInputChange(
                                'customImprovementArea',
                                e.target.value
                              )
                            }
                            onBlur={(e) =>
                              validateField(
                                'customImprovementArea',
                                e.target.value
                              )
                            }
                            className={`${inputClass(
                              'customImprovementArea'
                            )} resize-none`}
                          />
                          <Err field="customImprovementArea" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 flex items-start gap-3 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/60 p-4 shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 border border-blue-100 shadow-sm">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-950">
                      Operational & Workflow Efficiency
                    </h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                      Identifying key improvement areas allows us to pinpoint manual bottlenecks and evaluate modern automation opportunities.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 4 */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all h-full">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3 border-b border-slate-200/70 pb-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-500 bg-blue-600 text-xs font-extrabold text-white shadow-sm">
                      04
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold tracking-tight text-slate-900">
                        Growth Goals
                      </h2>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Current challenges and 12-month goals
                      </p>
                    </div>
                    <span className="ml-auto whitespace-nowrap text-[10px] font-bold text-slate-500">
                      <span className="text-red-500">*</span> Required field
                    </span>
                  </div>

                  <div className="space-y-5">
                    {/* Challenge */}
                    <div>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                        <label className="text-xs font-semibold text-slate-800">
                          1. What is your biggest business challenge today?{' '}
                        </label>
                        <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Select all that apply
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {challengeOptions.map((item) => {
                          const selected = formData.biggestChallenge.includes(item);
                          return (
                            <label
                              key={item}
                              className="block w-full cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                name="biggestChallenge"
                                value={item}
                                checked={selected}
                                onChange={() => handleChallengeToggle(item)}
                                className="sr-only"
                              />
                              <span
                                className={`flex min-h-[38px] w-full items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left text-[11px] transition-all ${
                                  selected
                                    ? 'border-blue-400 bg-blue-50 text-blue-800 font-semibold shadow-sm'
                                    : 'border-slate-300 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md'
                                }`}
                              >
                                <span
                                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border ${
                                    selected
                                      ? 'border-blue-600 bg-blue-600 text-white'
                                      : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {selected && (
                                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                                  )}
                                </span>
                                <span className="font-medium">{item}</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>

                      <Err field="biggestChallenge" />

                      {formData.biggestChallenge.includes('Other') && (
                        <div className="mt-3">
                          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                            Specify Other Challenge
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Supply chain issues, regulatory challenges..."
                            value={formData.customChallenge}
                            onChange={(e) =>
                              handleInputChange(
                                'customChallenge',
                                e.target.value
                              )
                            }
                            onBlur={(e) =>
                              validateField(
                                'customChallenge',
                                e.target.value
                              )
                            }
                            className={inputClass('customChallenge')}
                          />
                          <Err field="customChallenge" />
                        </div>
                      )}
                    </div>

                    {/* Goal */}
                    <div>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                        <label className="text-xs font-semibold text-slate-800">
                          2. What is your primary business goal for the next 12 months?{' '}
                        </label>
                        <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Select all that apply
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {goalOptions.map((item) => {
                          const selected = formData.primaryGoal.includes(item);
                          return (
                            <label
                              key={item}
                              className="block w-full cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                name="primaryGoal"
                                value={item}
                                checked={selected}
                                onChange={() => handleGoalToggle(item)}
                                className="sr-only"
                              />
                              <span
                                className={`flex min-h-[38px] w-full items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left text-[11px] transition-all ${
                                  selected
                                    ? 'border-blue-400 bg-blue-50 text-blue-800 font-semibold shadow-sm'
                                    : 'border-slate-300 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md'
                                }`}
                              >
                                <span
                                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border ${
                                    selected
                                      ? 'border-blue-600 bg-blue-600 text-white'
                                      : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {selected && (
                                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                                  )}
                                </span>
                                <span className="font-medium">{item}</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>

                      <Err field="primaryGoal" />

                      {formData.primaryGoal.includes('Other') && (
                        <div className="mt-3">
                          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                            Specify Other Goal
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Launch a new service, enter a new city..."
                            value={formData.customGoal}
                            onChange={(e) =>
                              handleInputChange(
                                'customGoal',
                                e.target.value
                              )
                            }
                            onBlur={(e) =>
                              validateField(
                                'customGoal',
                                e.target.value
                              )
                            }
                            className={inputClass('customGoal')}
                          />
                          <Err field="customGoal" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-50/60 p-4 shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 border border-indigo-100 shadow-sm">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-indigo-950">
                      Strategic Growth Focus
                    </h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                      Clear goals help identify the most relevant improvement and growth opportunities for your business.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* ==================================================
                SUBMIT CTA
            ================================================== */}
            <div className="pt-2">

              <button
                type="submit"
                disabled={loading}
                className="
                  group
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2.5
                  rounded-2xl
                  bg-gradient-to-r
                  from-blue-600
                  via-blue-700
                  to-indigo-600
                  px-6
                  py-4
                  text-base
                  font-extrabold
                  tracking-wide
                  text-white
                  shadow-lg
                  shadow-blue-600/25
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:shadow-xl
                  hover:shadow-blue-600/35
                  focus:outline-none
                  focus:ring-4
                  focus:ring-blue-500/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>
                      Calculating Business Health Score...
                    </span>
                  </>
                ) : (
                  <>
                    <Award className="h-5 w-5" />

                    <span>
                      Get My Free Business Health Check
                    </span>

                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-[11px] font-medium text-slate-500">
                Complete the assessment to receive your overall Business Health Score.
              </p>

            </div>

          </form>

          {/* ====================================================
              RESULT
          ===================================================== */}
          {result && (
            <div
              ref={resultRef}
              data-result
              className="mt-6 space-y-3"
            >

              {/* Compact Result Card Container */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-white shadow-2xl sm:p-5">

                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />

                <div className="relative z-10 space-y-3">

                  {/* ── BUSINESS HEALTH REPORT HEADER ── */}
                  <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 sm:flex-row">
                    {/* Left: label + title + category */}
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400">
                        Business Health Report
                      </span>
                      <h2 className="mt-0.5 text-xl font-extrabold tracking-tight sm:text-2xl">
                        {result.companyName ? `${result.companyName} — Business Health Report` : 'Your Business Health Report'}
                      </h2>
                      <div
                        className={`mt-2 inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-bold ${getCategoryBadgeClass(
                          result.category
                        )}`}
                      >
                        {result.category}
                      </div>
                    </div>

                    {/* Right: PRIMARY score ring — Business Health Score only */}
                    <div className="flex shrink-0 flex-col items-center gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Business Health Score</span>
                      <div className="relative flex h-24 w-24 items-center justify-center">
                        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="#EF4444" strokeWidth="10" fill="transparent" className="opacity-30" />
                          <circle
                            cx="50" cy="50" r="40" stroke="#22C55E" strokeWidth="10" fill="transparent"
                            strokeDasharray={282.74}
                            strokeDashoffset={282.74 - (282.74 * Math.min(100, Math.max(0, result.score))) / 100}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-black text-white">{result.score}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Important Assessment Note */}
                  <aside className="rounded-xl border border-amber-400/30 bg-gradient-to-br from-blue-950/80 via-slate-900/95 to-amber-950/30 p-4 shadow-lg shadow-blue-950/20 sm:p-5" role="note">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-300/30 bg-amber-400/10 text-amber-300">
                        <Info className="h-4 w-4" aria-hidden="true" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-amber-300">
                          Important Note
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-slate-200 sm:text-sm">
                          <strong className="font-extrabold text-white">Note:</strong>{' '}
                          Your Health Check score is calculated based on the information provided through this assessment. It does not include your business&apos;s financial performance, such as profit, loss, cash flow, outstanding liabilities, or recent financial losses.
                        </p>
                        <p className="mt-3 text-xs font-semibold leading-relaxed text-cyan-100 sm:text-sm">
                          For a comprehensive 100% business assessment, including financial performance and financial health, please contact the NG Stellar team for a detailed evaluation.
                        </p>
                      </div>
                    </div>
                  </aside>

                  {/* ── LEGAL COMPLIANCE INDEX — secondary supporting metric ── */}
                  {result.legalComplianceIndex && (() => {
                    const lci = result.legalComplianceIndex;
                    
                    // Retrieve attention list from result object or fall back to calculation
                    const attentionList = (lci.attentionAreas && lci.attentionAreas.length > 0)
                      ? lci.attentionAreas
                      : getLegalComplianceAttentionAreas({
                          gstRegistered: result.gstRegistered || formData.gstRegistered,
                          trademarkRegistered: result.trademarkRegistered || formData.trademarkRegistered,
                          googleBusiness: result.googleBusiness || formData.googleBusiness,
                          businessStructure: result.businessStructure || formData.businessStructure,
                          annualTurnover: result.annualTurnover || formData.annualTurnover,
                          yearsInBusiness: result.yearsInBusiness || formData.yearsInBusiness,
                          website: result.website || formData.website,
                        });

                    const showAttentionList = attentionList.length > 0;
                    
                    // Theme styling based on status
                    const isStrong = lci.status === 'Strong';
                    const isGood = lci.status === 'Good';

                    const cardTheme = isStrong
                      ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-950/30 via-slate-900/90 to-slate-950 shadow-lg shadow-emerald-950/20'
                      : isGood
                      ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-950/30 via-slate-900/90 to-slate-950 shadow-lg shadow-cyan-950/20'
                      : 'border-amber-500/60 bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-slate-950 shadow-xl shadow-amber-950/30';

                    const badgeTheme = isStrong
                      ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300'
                      : isGood
                      ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-300'
                      : 'border-amber-400/60 bg-amber-500/20 text-amber-300';

                    const iconColor = isStrong
                      ? 'text-emerald-400'
                      : isGood
                      ? 'text-cyan-400'
                      : 'text-amber-400';

                    return (
                      <div className={`rounded-xl border p-4 sm:p-5 space-y-3 transition-all ${cardTheme}`}>
                        {/* Heading row: icon + label + status badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800/80 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg border ${
                              isStrong ? 'bg-emerald-500/10 border-emerald-500/30' : isGood ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-amber-500/10 border-amber-500/30'
                            }`}>
                              <ShieldCheck className={`h-5 w-5 ${iconColor}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
                                  LEGAL COMPLIANCE INDEX
                                </h3>
                                <span className="text-[10px] text-slate-400 font-medium">— Indicative</span>
                              </div>
                              <p className="text-[11px] text-slate-400">Formal Registration &amp; Establishment Review</p>
                            </div>
                          </div>
                          <span className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-sm ${badgeTheme}`}>
                            {lci.status}
                          </span>
                        </div>

                        {/* Interpretation */}
                        <p className="text-xs sm:text-sm leading-relaxed text-slate-200 font-medium">
                          {lci.interpretation}
                        </p>

                        {/* Dynamic "Areas That Need Attention" List */}
                        {showAttentionList && (
                          <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-950/40 p-4 space-y-3 shadow-inner">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                              <span>Areas That Need Attention</span>
                            </h4>
                            <ul className="space-y-2 pl-1">
                              {attentionList.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                                  <span className="text-amber-400 font-bold select-none text-base leading-none">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>

                            {/* Contact NG Stellar Recommendation CTA */}
                            <div className="mt-3 pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                              <div className="space-y-0.5 min-w-0">
                                <h5 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                                  <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                                  <span>Need Help With Your Business Compliance &amp; Digital Setup?</span>
                                </h5>
                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                  NG Stellar can help you review and improve your business&apos;s digital presence, technology, branding, and business transformation requirements.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleFollowUp('yes')}
                                disabled={followUp !== null || followUpSaving}
                                className="shrink-0 rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 transition-all flex items-center gap-1.5 border border-blue-400/30 active:scale-[0.98]"
                              >
                                <span>Contact NG Stellar</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Disclaimer */}
                        <p className="text-[10px] sm:text-[11px] leading-relaxed text-slate-400 italic border-t border-slate-800/80 pt-2.5 mt-2.5">
                          {lci.note}
                        </p>
                      </div>
                    );
                  })()}

                  {/* ── ASSESSMENT CERTIFICATE BANNER ── */}
                  <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                    <div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-cyan-300 shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                          ASSESSMENT CERTIFICATE
                        </span>
                      </div>
                      <h3 className="mt-1 text-sm font-extrabold text-white">
                        NG Stellar Transformation Health Check™ Certificate
                      </h3>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Official, branded business assessment certificate for {result.companyName || 'your company'}.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCertificateModal(true)}
                      className="shrink-0 flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-2.5 text-xs font-bold text-cyan-200 transition-all hover:border-cyan-400 hover:bg-cyan-500/30 hover:text-white shadow-sm"
                    >
                      <Award className="h-4 w-4" />
                      <span>Download Assessment Certificate</span>
                    </button>
                  </div>

                  {/* Strengths & Opportunities side-by-side Grid */}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                    {/* Strengths */}
                    <div className="rounded-xl border border-emerald-500/20 bg-slate-950/50 p-3.5">
                      <h3 className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Your Business Strengths
                      </h3>

                      <ul className="mt-2.5 space-y-1.5">
                        {result.strengths.map((str, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs text-slate-200"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                            <span className="leading-snug">{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Opportunities */}
                    <div className="rounded-xl border border-amber-500/20 bg-slate-950/50 p-3.5">
                      <h3 className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Key Opportunities
                      </h3>

                      <ul className="mt-2.5 space-y-1.5">
                        {result.opportunities.map((opp, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs text-slate-200"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                            <span className="leading-snug">{opp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="rounded-xl border border-blue-500/20 bg-slate-950/50 p-3.5">
                    <h3 className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                      <Target className="h-3.5 w-3.5" />
                      Recommended Next Steps
                    </h3>

                    <div className="mt-2.5 space-y-1.5">
                      {result.recommendations.map((rec, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[11px] font-bold text-blue-400">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-medium text-slate-200">
                            {rec}
                          </span>
                          <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-500" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlighted & Enlarged Follow-up Question CTA Banner */}
                  <div className="relative overflow-hidden rounded-xl border border-blue-500/40 bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 p-5 shadow-lg shadow-blue-600/10 sm:p-6">
                    <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/20 blur-2xl" />
                    
                    <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                          <Sparkles className="h-3 w-3" />
                          Growth Opportunity
                        </div>
                        <h4 className="text-sm font-extrabold leading-snug text-white sm:text-base">
                          Would you like to improve your Business Health Score and explore opportunities for growth?
                        </h4>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleFollowUp('yes')}
                          disabled={followUp !== null || followUpSaving}
                          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold transition-all duration-200 active:scale-[0.98] ${
                            followUp === 'yes'
                              ? 'border border-emerald-400 bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-950/40 hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-600/25'
                          }`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>Yes, I&apos;m Interested</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleFollowUp('no')}
                          disabled={followUp !== null || followUpSaving}
                          className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
                            followUp === 'no'
                              ? 'border-slate-500 bg-slate-700 text-white'
                              : 'border-slate-700/80 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                          <span>No</span>
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* ====================================================
              FOLLOW-UP MODALS / POPUPS
          ===================================================== */}

          {/* YES MODAL */}
          {followUp === 'yes' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-2xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-sm">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Thank you for your response.
                </h3>
                <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
                  Our team will contact you soon.
                </p>
              </div>
            </div>
          )}

          {/* NO MODAL */}
          {followUp === 'no' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-2xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Thank you for visiting NG Stellar.
                </h3>
                <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
                  Whenever you need help improving your business, feel free to contact our team.
                </p>
              </div>
            </div>
          )}

          {/* CERTIFICATE MODAL (A4 Landscape Preview) */}
          {showCertificateModal && result && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto no-print">
              <div className="relative w-full max-w-4xl rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden text-white my-auto flex flex-col">
                {/* Modal Header & Actions Bar */}
                <div className="border-b border-slate-800 bg-slate-950/90 px-6 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Assessment Certificate Preview (A4 Landscape)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCertificateModal(false)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={downloadCertificate}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white text-xs font-extrabold shadow-md hover:brightness-110 transition-all"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>

                {/* Certificate A4 Landscape Card Container */}
                <div className="p-4 sm:p-8 bg-slate-950 flex items-center justify-center overflow-x-auto">
                  <div className="relative w-full max-w-[840px] aspect-[297/210] rounded-xl border-2 border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/90 p-6 sm:p-10 text-center flex flex-col justify-between shadow-2xl overflow-hidden min-h-[420px]">
                    {/* Corner Ornaments */}
                    <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-sm pointer-events-none" />
                    <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-sm pointer-events-none" />
                    <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-sm pointer-events-none" />
                    <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-cyan-400/60 rounded-br-sm pointer-events-none" />

                    {/* Glowing Accent Blobs */}
                    <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -right-20 -bottom-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

                    {/* Certificate Top Header */}
                    <div className="flex flex-col items-center gap-1.5 z-10">
                      <img
                        src="/images/ng-stellar-logo.png"
                        alt="NG Stellar"
                        className="h-10 sm:h-12 w-auto object-contain mb-1"
                      />
                      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-cyan-300">
                        Free Assessment &amp; Certificate
                      </div>
                      <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white mt-1">
                        Business Assessment Certificate
                      </h2>
                      <p className="text-xs sm:text-sm font-semibold tracking-wider text-cyan-400/90 uppercase">
                        NG Stellar Transformation Health Check™
                      </p>
                    </div>

                    <div className="mx-auto w-48 sm:w-64 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent my-2" />

                    {/* Certificate Main Recipient Body */}
                    <div className="space-y-2.5 z-10 my-auto">
                      <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                        THIS CERTIFIES THAT
                      </p>
                      <h3 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-sky-200 tracking-tight">
                        {result.companyName || 'Your Business'}
                      </h3>
                      <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed pt-1 font-medium">
                        has successfully completed the <strong>NG Stellar Business Health Check Assessment</strong>.
                      </p>
                    </div>

                    <div className="mx-auto w-48 sm:w-64 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent my-2" />

                    {/* Certificate Footer Metadata & Disclaimer */}
                    <div className="z-10 pt-1">
                      <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-xs text-slate-400 gap-2 border-t border-white/10 pt-2.5">
                        <span className="font-semibold text-slate-300">NG Stellar Business Transformation</span>
                        <span className="text-slate-400">
                          Ref ID: <strong className="text-slate-200">{result.id}</strong> &nbsp;·&nbsp; Date: <strong className="text-slate-200">{new Date(result.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
                        </span>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-slate-500 italic mt-1.5 text-center">
                        Indicative business assessment certificate issued by NG Stellar Business Transformation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>

    {/* ============================================================
        PRINT-ONLY CERTIFICATE LAYER (A4 Landscape Printable PDF)
        Hidden on screen — visible ONLY during window.print()
    ============================================================= */}
    {result && (
      <div
        id="ng-certificate-print"
        className="hidden print:block"
        style={{
          display: 'none',
          fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
          background: '#0f172a',
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          padding: 0,
          margin: 0,
          boxSizing: 'border-box',
        }}
      >
        {/* Certificate Outer Frame */}
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #0f172a 100%)',
          position: 'relative',
          overflow: 'hidden',
          color: '#ffffff',
          padding: '48px 64px',
          boxSizing: 'border-box',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}>
          {/* Corner Ornaments */}
          <div style={{ position: 'absolute', top: 28, left: 28, width: 64, height: 64, borderTop: '3px solid #22d3ee', borderLeft: '3px solid #22d3ee', borderRadius: '4px 0 0 0' }} />
          <div style={{ position: 'absolute', top: 28, right: 28, width: 64, height: 64, borderTop: '3px solid #22d3ee', borderRight: '3px solid #22d3ee', borderRadius: '0 4px 0 0' }} />
          <div style={{ position: 'absolute', bottom: 28, left: 28, width: 64, height: 64, borderBottom: '3px solid #22d3ee', borderLeft: '3px solid #22d3ee', borderRadius: '0 0 0 4px' }} />
          <div style={{ position: 'absolute', bottom: 28, right: 28, width: 64, height: 64, borderBottom: '3px solid #22d3ee', borderRight: '3px solid #22d3ee', borderRadius: '0 0 4px 0' }} />

          {/* Certificate Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 10 }}>
            <img
              src="/images/ng-stellar-logo.png"
              alt="NG Stellar"
              style={{ height: 48, width: 'auto', objectFit: 'contain', marginBottom: 12 }}
            />

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: 100, padding: '4px 18px', marginBottom: 12 }}>
              <span style={{ color: '#67e8f9', fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Free Assessment &amp; Certificate
              </span>
            </div>

            <h1 style={{ color: '#ffffff', fontSize: 34, fontWeight: 900, letterSpacing: '-0.5px', margin: '0 0 6px', lineHeight: 1.1 }}>
              Business Assessment Certificate
            </h1>
            <p style={{ color: '#38bdf8', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
              NG Stellar Transformation Health Check™
            </p>
          </div>

          {/* Divider */}
          <div style={{ width: 340, height: 1, background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent)', margin: '16px auto' }} />

          {/* Certificate Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', margin: 'auto 0', zIndex: 10 }}>
            <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12 }}>
              THIS CERTIFIES THAT
            </p>
            <h2 style={{ color: '#ffffff', fontSize: 38, fontWeight: 900, margin: '0 0 14px', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              {result.companyName || 'Your Business'}
            </h2>
            <p style={{ color: '#e2e8f0', fontSize: 16, maxWidth: 580, lineHeight: 1.6, margin: '0 auto', fontWeight: 500 }}>
              has successfully completed the <strong>NG Stellar Business Health Check Assessment</strong>.
            </p>
          </div>

          {/* Divider */}
          <div style={{ width: 340, height: 1, background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent)', margin: '16px auto' }} />

          {/* Certificate Footer */}
          <div style={{ zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 14, fontSize: 11, color: '#94a3b8' }}>
              <span style={{ fontWeight: 700, color: '#cbd5e1', letterSpacing: '0.05em' }}>
                NG Stellar Business Transformation
              </span>
              <span style={{ color: '#94a3b8' }}>
                Ref ID: <strong style={{ color: '#e2e8f0' }}>{result.id}</strong> &nbsp;·&nbsp; Date: <strong style={{ color: '#e2e8f0' }}>{new Date(result.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
              </span>
            </div>

            <p style={{ color: '#64748b', fontSize: 9, textAlign: 'center', margin: '10px 0 0', fontStyle: 'italic' }}>
              Indicative business assessment certificate issued by NG Stellar Business Transformation.
            </p>
          </div>
        </div>
      </div>
    )}
    </>
  );
}