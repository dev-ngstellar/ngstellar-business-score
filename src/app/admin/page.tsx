'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Search, Filter, Eye, RefreshCw,
  Building2, X, LogOut
} from 'lucide-react';

interface AssessmentSummary {
  id: string; companyName: string;
  email: string; mobile: string; industry: string; location: string;
  employees: string; score: number; category: string; createdAt: string;
}
interface AssessmentDetail extends AssessmentSummary {
  designation?: string; yearsInBusiness: string; website: string;
  socialMedia: string; googleBusiness: string; digitalMarketing: string;
  brandIdentity: string; managementMethod: string; areasToImprove: string[];
  biggestChallenge: string; primaryGoal: string;
  strengths: string[]; opportunities: string[]; recommendations: string[];
  followUpResponse: 'YES' | 'NO' | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<AssessmentDetail | null>(null);

  // On mount: check for token, redirect to login if missing
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
    if (ready && token) fetchAssessments();
  }, [ready, token, categoryFilter]);

  const authHeaders = () => ({ 'Authorization': `Bearer ${token}` });

  const handleUnauth = () => {
    sessionStorage.removeItem('ng_admin_token');
    router.replace('/admin/login');
  };

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (categoryFilter !== 'ALL') params.set('category', categoryFilter);
      const res = await fetch(`/api/admin/business-health-check?${params}`, { headers: authHeaders() });
      if (res.status === 401) { handleUnauth(); return; }
      const data = await res.json();
      setAssessments(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleViewDetail = async (id: string) => {
    setSelectedId(id);
    setDetailData(null);
    const res = await fetch(`/api/admin/business-health-check/${id}`, { headers: authHeaders() });
    if (res.status === 401) { handleUnauth(); return; }
    setDetailData(await res.json());
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ng_admin_token');
    router.replace('/admin/login');
  };

  const badge = (cat: string) => {
    if (cat === 'Transformation Leader') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (cat === 'Growth Ready') return 'bg-blue-100 text-blue-800 border-blue-300';
    if (cat === 'Transformation Opportunity') return 'bg-amber-100 text-amber-800 border-amber-300';
    if (cat === 'Transformation Required') return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  // Show nothing while checking auth (avoids flash)
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-3">
          <LayoutDashboard className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">Business Health Check — Admin Portal</h1>
            <p className="text-xs text-slate-500">View and manage submitted assessments</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAssessments}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1.5 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />Refresh
          </button>
          <button onClick={handleLogout}
            className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-red-600 flex items-center gap-1.5 transition-colors">
            <LogOut className="w-3.5 h-3.5" />Logout
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3">
        <form onSubmit={e => { e.preventDefault(); fetchAssessments(); }} className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input type="text" placeholder="Search company, email..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600" />
          </div>
          <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">Search</button>
        </form>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600">
            <option value="ALL">All Categories</option>
            <option>Transformation Leader</option>
            <option>Growth Ready</option>
            <option>Transformation Opportunity</option>
            <option>Transformation Required</option>
            <option>Critical Transformation Need</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" /><span>Loading assessments...</span>
          </div>
        ) : assessments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold">No submissions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  {['ID','Company','Contact','Industry','Location','Employees','Score','Category','Date',''].map(h => (
                    <th key={h} className="py-3.5 px-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessments.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">{item.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">{item.companyName}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium whitespace-nowrap">{item.companyName}</p>
                      <p className="text-[10px] text-slate-400">{item.email}</p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">{item.industry}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">{item.location}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">{item.employees}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-extrabold text-slate-900">{item.score}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${badge(item.category)}`}>{item.category}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button onClick={() => handleViewDetail(item.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-semibold border border-blue-200 flex items-center gap-1.5 ml-auto transition-all text-xs whitespace-nowrap">
                        <Eye className="w-3.5 h-3.5" />View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
            <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <h3 className="font-bold text-slate-900">Full Assessment Details</h3>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setSelectedId(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-950"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto p-6 text-slate-700">
              {!detailData ? (
                <div className="p-8 text-center"><RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto" /></div>
              ) : (
                <div className="space-y-5 text-xs">
                  {/* Score Hero */}
                  <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-black">{detailData.companyName}</h4>
                      <p className="text-slate-300 text-xs">{detailData.email} · {detailData.mobile}</p>
                    </div>
                    <div className="text-center shrink-0">
                      <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Overall Score</p>
                      <p className="text-3xl font-black text-blue-400">{detailData.score}/100</p>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${badge(detailData.category)}`}>{detailData.category}</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
                    {[['Industry',detailData.industry],['Location',detailData.location],['Employees',detailData.employees],['Years',detailData.yearsInBusiness],['Designation',detailData.designation||'N/A']].map(([k,v])=>(
                      <div key={k}><span className="text-slate-400 block text-[10px]">{k}</span><span className="font-semibold text-slate-900">{v}</span></div>
                    ))}
                  </div>

                  {/* Presence + Operations */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1.5">
                      <p className="font-bold text-slate-800 mb-2">Business Presence</p>
                      {[['Website',detailData.website],['Social Media',detailData.socialMedia],['Google Business',detailData.googleBusiness],['Digital Ads',detailData.digitalMarketing],['Brand Identity',detailData.brandIdentity]].map(([k,v])=>(
                        <p key={k}><span className="text-slate-400">{k}:</span> <strong className={v==='Yes'||v==='Yes, regularly'?'text-emerald-700':v==='Sometimes'?'text-blue-700':v==='Not Sure'?'text-amber-700':'text-slate-700'}>{v}</strong></p>
                      ))}
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                      <p className="font-bold text-slate-800 mb-2">Operations</p>
                      <p><span className="text-slate-400">Method:</span> <strong className="text-blue-700">{detailData.managementMethod}</strong></p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {detailData.areasToImprove.map((a,i)=>(
                          <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded border border-blue-100">{a}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Growth Goals */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                    <p className="font-bold text-slate-800">Growth Goals</p>
                    <div><p className="text-slate-400 mb-0.5 text-[10px] uppercase font-semibold">Biggest Challenge</p><p className="text-slate-800">{detailData.biggestChallenge||'—'}</p></div>
                    <div><p className="text-slate-400 mb-0.5 text-[10px] uppercase font-semibold">Primary Goal</p><p className="text-slate-800">{detailData.primaryGoal||'—'}</p></div>
                  </div>

                  {/* Growth Interest */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="font-bold text-slate-800 mb-2">Growth Interest</p>
                    {detailData.followUpResponse === 'YES' ? (
                      <p className="text-emerald-700 font-semibold">✓ Interested — Our team will contact them.</p>
                    ) : detailData.followUpResponse === 'NO' ? (
                      <p className="text-slate-700 font-semibold">Thank you for visiting NG Stellar — Not interested.</p>
                    ) : (
                      <p className="text-slate-500">No response yet.</p>
                    )}
                  </div>

                  {/* Results */}
                  <div className="space-y-3">
                    <div><p className="font-bold text-emerald-700 mb-1">Strengths</p><ul className="space-y-1 text-slate-700">{detailData.strengths.map((s,i)=><li key={i} className="flex items-start gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"/>{s}</li>)}</ul></div>
                    <div><p className="font-bold text-amber-700 mb-1">Opportunities</p><ul className="space-y-1 text-slate-700">{detailData.opportunities.map((o,i)=><li key={i} className="flex items-start gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"/>{o}</li>)}</ul></div>
                    <div><p className="font-bold text-blue-700 mb-1">Recommendations</p><ul className="space-y-1 text-slate-700">{detailData.recommendations.map((r,i)=><li key={i} className="flex items-start gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"/>{r}</li>)}</ul></div>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-end">
              <button onClick={() => setSelectedId(null)} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-700 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
