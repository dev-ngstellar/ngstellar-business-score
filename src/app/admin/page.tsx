'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Eye,
  RefreshCw,
  Building2,
  X,
  LogOut,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Briefcase,
  Users,
  Target,
} from 'lucide-react';

interface AssessmentSummary {
  id: string;
  companyName: string;
  email: string;
  mobile: string;
  industry: string;
  location: string;
  employees: string;
  score: number;
  category?: string;
  followUpResponse?: 'YES' | 'NO' | null;
  createdAt: string;
}

interface AssessmentDetail extends AssessmentSummary {
  designation?: string;
  yearsInBusiness: string;
  businessStructure?: string;
  gstRegistered?: string;
  website: string;
  socialMedia: string;
  googleBusiness: string;
  digitalMarketing: string;
  brandIdentity: string;
  managementMethod: string;
  areasToImprove: string[];
  biggestChallenge: string | string[];
  primaryGoal: string | string[];
  strengths: string[];
  opportunities: string[];
  recommendations: string[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [interestFilter, setInterestFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'score-high' | 'score-low'>('newest');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<AssessmentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('ng_admin_token');
    if (!saved) {
      router.replace('/admin/login');
    } else {
      setToken(saved);
      setReady(true);
    }
  }, [router]);

  useEffect(() => {
    if (ready && token) {
      fetchAssessments();
    }
  }, [ready, token]);

  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  const handleUnauth = () => {
    sessionStorage.removeItem('ng_admin_token');
    router.replace('/admin/login');
  };

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/business-health-check`, {
        headers: authHeaders(),
      });
      if (res.status === 401) {
        handleUnauth();
        return;
      }
      let data = await res.json();
      data = Array.isArray(data) ? data : [];
      setAssessments(data);
    } catch (err) {
      console.error('Failed to fetch assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id: string) => {
    setSelectedId(id);
    setDetailData(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/business-health-check/${id}`, {
        headers: authHeaders(),
      });
      if (res.status === 401) {
        handleUnauth();
        return;
      }
      const data = await res.json();
      setDetailData(data);
    } catch (err) {
      console.error('Error fetching detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ng_admin_token');
    router.replace('/admin/login');
  };

  // Filtered and Sorted Assessments
  const filteredAssessments = useMemo(() => {
    return assessments
      .filter((item) => {
        // Search filter
        if (searchTerm.trim()) {
          const s = searchTerm.toLowerCase();
          const matchesName = item.companyName?.toLowerCase().includes(s);
          const matchesEmail = item.email?.toLowerCase().includes(s);
          const matchesMobile = item.mobile?.includes(searchTerm);
          const matchesIndustry = item.industry?.toLowerCase().includes(s);
          const matchesLocation = item.location?.toLowerCase().includes(s);
          if (!matchesName && !matchesEmail && !matchesMobile && !matchesIndustry && !matchesLocation) {
            return false;
          }
        }
        // Follow up interest filter
        if (interestFilter === 'YES' && item.followUpResponse !== 'YES') return false;
        if (interestFilter === 'NO' && item.followUpResponse !== 'NO') return false;
        if (interestFilter === 'PENDING' && item.followUpResponse !== null && item.followUpResponse !== undefined) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'score-high') return b.score - a.score;
        if (sortBy === 'score-low') return a.score - b.score;
        return 0;
      });
  }, [assessments, searchTerm, interestFilter, sortBy]);

  // Score Badge Color Helper
  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10';
    if (score >= 60) return 'bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-sky-500/10';
    if (score >= 40) return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-500/10';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-rose-500/10';
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
          <p className="text-sm font-medium text-slate-400">Authenticating session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Title & Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Business Health Check — Admin Portal
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  View and manage submitted assessments and lead responses.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={fetchAssessments}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white hover:border-white/20 hover:bg-slate-800 flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-semibold text-slate-300 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Search, Filter & Controls */}
        <div className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-6 relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search company, email, phone, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-slate-950/70 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Growth Interest Filter */}
            <div className="md:col-span-3">
              <select
                value={interestFilter}
                onChange={(e) => setInterestFilter(e.target.value)}
                className="w-full py-3 px-4 bg-slate-950/70 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="ALL">All Leads</option>
                <option value="YES">Interested Only</option>
                <option value="NO">Not Interested</option>
                <option value="PENDING">Pending Response</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="md:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full py-3 px-4 bg-slate-950/70 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="score-high">Highest Score</option>
                <option value="score-low">Lowest Score</option>
              </select>
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
            <span>
              Showing <strong className="text-white">{filteredAssessments.length}</strong> of{' '}
              <strong className="text-white">{assessments.length}</strong> assessments
            </span>

            {(searchTerm || interestFilter !== 'ALL' || sortBy !== 'newest') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setInterestFilter('ALL');
                  setSortBy('newest');
                }}
                className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Table & Mobile Cards Container */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <span>Fetching assessment submissions...</span>
            </div>
          ) : filteredAssessments.length === 0 ? (
            <div className="p-16 text-center text-slate-400 space-y-3">
              <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-base font-bold text-slate-200">No matching submissions found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try adjusting your search keywords or filter dropdowns to view matching business scores.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop & Tablet Table (Visible on md and larger) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-200 border-collapse">
                  <thead className="bg-slate-950/90 border-b border-white/10 sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="px-5 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Company</th>
                      <th className="px-5 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Contact Info</th>
                      <th className="px-5 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Industry & Location</th>
                      <th className="px-5 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider text-center">Score</th>
                      <th className="px-5 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider text-center">Growth Lead</th>
                      <th className="px-5 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Date</th>
                      <th className="px-5 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredAssessments.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-500/[0.04] transition-colors group">
                        {/* Company */}
                        <td className="px-5 py-4">
                          <div className="space-y-0.5">
                            <p className="font-bold text-white group-hover:text-blue-300 transition-colors">
                              {item.companyName}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <span className="inline-flex items-center gap-1">
                                <Users className="w-3 h-3 text-slate-400" />
                                {item.employees || 'N/A'} employees
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-5 py-4">
                          <div className="space-y-1 text-xs">
                            <a
                              href={`mailto:${item.email}`}
                              className="flex items-center gap-1.5 text-slate-300 hover:text-blue-400 transition-colors truncate max-w-[200px]"
                              title={item.email}
                            >
                              <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span className="truncate">{item.email}</span>
                            </a>
                            <a
                              href={`tel:${item.mobile}`}
                              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{item.mobile}</span>
                            </a>
                          </div>
                        </td>

                        {/* Industry & Location */}
                        <td className="px-5 py-4">
                          <div className="space-y-1 text-xs">
                            <p className="font-medium text-slate-200">{item.industry}</p>
                            <p className="text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                              <span>{item.location}</span>
                            </p>
                          </div>
                        </td>

                        {/* Score (Percentage) */}
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center min-w-[50px] px-3 py-1.5 rounded-xl border font-black text-sm shadow-md ${getScoreBadge(
                              item.score
                            )}`}
                          >
                            {item.score}%
                          </span>
                        </td>

                        {/* Follow Up Response */}
                        <td className="px-5 py-4 text-center">
                          {item.followUpResponse === 'YES' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Interested
                            </span>
                          ) : item.followUpResponse === 'NO' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-white/10 text-xs font-medium">
                              <XCircle className="w-3.5 h-3.5" />
                              Declined
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleViewDetail(item.id)}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Grid (Visible on small screens < md) */}
              <div className="block md:hidden divide-y divide-white/10">
                {filteredAssessments.map((item) => (
                  <div key={item.id} className="p-5 space-y-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-white text-base">{item.companyName}</h3>
                        <p className="text-xs text-slate-400">{item.industry} · {item.location}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-xl border font-black text-sm ${getScoreBadge(
                          item.score
                        )}`}
                      >
                        {item.score}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/50 p-3 rounded-xl border border-white/5">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Email</span>
                        <a href={`mailto:${item.email}`} className="text-blue-400 truncate block font-medium">
                          {item.email}
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Mobile</span>
                        <a href={`tel:${item.mobile}`} className="text-emerald-400 font-medium">
                          {item.mobile}
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Employees</span>
                        <span className="text-slate-200">{item.employees}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Lead Status</span>
                        {item.followUpResponse === 'YES' ? (
                          <span className="text-emerald-400 font-semibold">Interested</span>
                        ) : item.followUpResponse === 'NO' ? (
                          <span className="text-slate-400">Declined</span>
                        ) : (
                          <span className="text-amber-400">Pending</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => handleViewDetail(item.id)}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Assessment Detail Modal */}
      {selectedId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 rounded-3xl border border-white/15 shadow-2xl text-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/10 bg-slate-950/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg sm:text-xl">Assessment Report</h3>
                  <p className="text-xs text-slate-400">Submission ID: {selectedId}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="p-2.5 rounded-xl bg-slate-800 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {detailLoading || !detailData ? (
                <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                  <span>Loading full diagnostic details...</span>
                </div>
              ) : (
                <>
                  {/* Hero Summary Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-white/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <h4 className="text-2xl font-black text-white">{detailData.companyName}</h4>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                        <a href={`mailto:${detailData.email}`} className="flex items-center gap-1 text-blue-400 hover:underline">
                          <Mail className="w-3.5 h-3.5" />
                          {detailData.email}
                        </a>
                        <a href={`tel:${detailData.mobile}`} className="flex items-center gap-1 text-emerald-400 hover:underline">
                          <Phone className="w-3.5 h-3.5" />
                          {detailData.mobile}
                        </a>
                        <span className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          {detailData.location}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-white/10 self-stretch sm:self-auto justify-center">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Health Score</p>
                        <p className="text-3xl font-black text-blue-400">{detailData.score}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Business Profile Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950/50 border border-white/10">
                    <div>
                      <span className="text-slate-400 text-xs block">Industry</span>
                      <strong className="text-white font-semibold text-xs">{detailData.industry || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs block">Employees</span>
                      <strong className="text-white font-semibold text-xs">{detailData.employees || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs block">Years in Business</span>
                      <strong className="text-white font-semibold text-xs">{detailData.yearsInBusiness || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs block">Designation</span>
                      <strong className="text-white font-semibold text-xs">{detailData.designation || 'N/A'}</strong>
                    </div>
                  </div>

                  {/* Presence & Digital Footprint */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3">
                      <h5 className="font-bold text-white text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-sky-400" />
                        Digital Presence & Marketing
                      </h5>
                      <div className="space-y-2 text-xs">
                        {[
                          ['Website', detailData.website],
                          ['Social Media', detailData.socialMedia],
                          ['Google Business Profile', detailData.googleBusiness],
                          ['Digital Marketing Ads', detailData.digitalMarketing],
                          ['Brand Identity', detailData.brandIdentity],
                        ].map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between border-b border-white/5 pb-1.5">
                            <span className="text-slate-400">{k}</span>
                            <span
                              className={`font-semibold px-2.5 py-0.5 rounded-md text-[11px] ${
                                v === 'Yes' || v === 'Yes, regularly'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : v === 'Sometimes'
                                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                  : v === 'Not Sure'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-slate-800 text-slate-400 border border-white/10'
                              }`}
                            >
                              {v || 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Operations */}
                    <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3">
                      <h5 className="font-bold text-white text-sm flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-emerald-400" />
                        Operations & Improvement Focus
                      </h5>
                      <div className="space-y-3 text-xs">
                        <div>
                          <span className="text-slate-400 block mb-1">Management Method</span>
                          <span className="font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20 inline-block">
                            {detailData.managementMethod || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-1.5">Priority Areas for Improvement</span>
                          <div className="flex flex-wrap gap-1.5">
                            {detailData.areasToImprove && detailData.areasToImprove.length > 0 ? (
                              detailData.areasToImprove.map((area, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 bg-slate-800 text-slate-200 text-[11px] font-medium rounded-lg border border-white/10"
                                >
                                  {area}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 font-italic">None specified</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Strategic Challenges & Goals */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3">
                    <h5 className="font-bold text-white text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-400" />
                      Growth Goals & Strategic Challenges
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-900 p-3.5 rounded-xl border border-white/5 space-y-1">
                        <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                          Biggest Challenge
                        </span>
                        <p className="text-slate-200 font-medium leading-relaxed">
                          {Array.isArray(detailData.biggestChallenge)
                            ? detailData.biggestChallenge.join(', ')
                            : detailData.biggestChallenge || '—'}
                        </p>
                      </div>
                      <div className="bg-slate-900 p-3.5 rounded-xl border border-white/5 space-y-1">
                        <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                          Primary Growth Goal
                        </span>
                        <p className="text-slate-200 font-medium leading-relaxed">
                          {Array.isArray(detailData.primaryGoal)
                            ? detailData.primaryGoal.join(', ')
                            : detailData.primaryGoal || '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Diagnostic Breakdown */}
                  <div className="space-y-4 pt-2">
                    <h5 className="font-bold text-white text-base">Automated Strategic Diagnostic Report</h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Strengths */}
                      <div className="p-4 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/20 space-y-2">
                        <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Key Strengths
                        </p>
                        <ul className="space-y-2 text-slate-300">
                          {detailData.strengths?.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Opportunities */}
                      <div className="p-4 rounded-2xl bg-amber-500/[0.05] border border-amber-500/20 space-y-2">
                        <p className="font-bold text-amber-400 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          Growth Opportunities
                        </p>
                        <ul className="space-y-2 text-slate-300">
                          {detailData.opportunities?.map((o, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                              <span>{o}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommendations */}
                      <div className="p-4 rounded-2xl bg-sky-500/[0.05] border border-sky-500/20 space-y-2">
                        <p className="font-bold text-sky-400 flex items-center gap-1.5">
                          <Target className="w-4 h-4" />
                          Action Recommendations
                        </p>
                        <ul className="space-y-2 text-slate-300">
                          {detailData.recommendations?.map((r, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer Quick Actions */}
            {detailData && (
              <div className="px-6 py-4 border-t border-white/10 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <a
                    href={`tel:${detailData.mobile}`}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call {detailData.mobile}</span>
                  </a>
                  <a
                    href={`mailto:${detailData.email}`}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Lead</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-semibold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
