'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { RoleProtectedRoute } from '@/app/components/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  BarChart3, 
  TrendingUp, 
  UserCircle, 
  Search, 
  MapPin, 
  IdCard, 
  GraduationCap,
  UserCog,
  Briefcase as BriefcaseIcon,
  ShieldAlert, 
  AlertCircle,
  Download, 
  FileText, 
  PieChart, 
  Activity, 
  ShieldCheck, 
  UserSquare2, 
  MoreHorizontal,
  ClipboardList,
  Clock,
  CheckCircle2,
  Table as TableIcon,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  HandHeart
} from 'lucide-react';
import { authFetch } from '@/app/lib/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'claims', label: 'Claims', icon: ClipboardList },
  { id: 'ids', label: 'ID Inventory', icon: Search },
  { id: 'users', label: 'System Users', icon: UserCircle },
  { id: 'submissions', label: 'Submissions', icon: HandHeart },
];

export default function AdminReportsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAdmin, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [dateRange, setDateRange] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [claimsFilter, setClaimsFilter] = useState('all');
  const [idsFilter, setIdsFilter] = useState('all');
  const [usersFilter, setUsersFilter] = useState('all');
  const [submissionsFilter, setSubmissionsFilter] = useState('all');

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  const years = [2024, 2025, 2026];

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [authLoading, user, isAdmin, router]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchReportData();
    }
  }, [user, isAdmin, dateRange, selectedMonth, selectedYear]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      let url = `/api/admin/reports?range=${dateRange}`;
      if (dateRange === 'monthly') {
        url += `&month=${selectedMonth}&year=${selectedYear}`;
      }
      const response = await authFetch(url);
      const data = await response.json();
      if (data.success) {
        setReportData(data.data);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClaims = reportData?.claims?.details?.filter((c: any) => {
    if (claimsFilter === 'all') return true;
    return c.status === claimsFilter;
  }) || [];

  const filteredIds = reportData?.ids?.details?.filter((i: any) => {
    if (idsFilter === 'all') return true;
    return i.status === idsFilter;
  }) || [];

  const filteredUsers = reportData?.users?.details?.filter((u: any) => {
    if (usersFilter === 'all') return true;
    return u.role === usersFilter;
  }) || [];

  const filteredSubmissions = [
    ...(submissionsFilter === 'all' || submissionsFilter === 'found' ? (reportData?.submissions?.details?.found || []).map((s: any) => ({ ...s, subtype: 'found' })) : []),
    ...(submissionsFilter === 'all' || submissionsFilter === 'lost' ? (reportData?.submissions?.details?.lost || []).map((l: any) => ({ ...l, subtype: 'lost' })) : [])
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const downloadReport = (type: string, format: 'csv' | 'pdf' = 'csv') => {
    const dataToExport = type === 'claims' ? filteredClaims : 
                        type === 'users' ? filteredUsers : 
                        type === 'ids' ? filteredIds : 
                        type === 'submissions' ? filteredSubmissions : [];

    if (format === 'csv') {
      // CSV logic for Claims, IDs, or Users
      if (type === 'claims' && dataToExport) {
        const headers = ['Claimant', 'Target Item', 'ID Number', 'ID Type', 'Status', 'Date'];
        const csvData = dataToExport.map((c: any) => [
          c.claimant_name,
          c.id_name,
          c.id_number || 'N/A',
          c.id_type,
          c.status,
          new Date(c.created_at).toLocaleDateString()
        ]);
        
        const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${type}-report-${dateRange}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      
      if (type === 'ids' && dataToExport) {
        const headers = ['Name', 'ID Number', 'Category', 'Status', 'Location', 'Date Recorded'];
        const csvData = dataToExport.map((i: any) => [
          i.full_name,
          i.registration_number,
          i.id_type,
          i.status,
          i.location,
          new Date(i.created_at).toLocaleDateString()
        ]);
        const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `inventory-report-${dateRange}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      if (type === 'users' && dataToExport) {
        const headers = ['Full Name', 'Email', 'Role', 'Registration No', 'Date Joined'];
        const csvData = dataToExport.map((u: any) => [
          u.full_name,
          u.email,
          u.role,
          u.registration_number || 'N/A',
          new Date(u.created_at).toLocaleDateString()
        ]);
        const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `users-report-${dateRange}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      if (type === 'submissions' && dataToExport) {
        const headers = ['Type', 'Full Name', 'ID Type', 'ID Number', 'Contact', 'Date'];
        const csvData = dataToExport.map((s: any) => [
          s.subtype.toUpperCase(),
          s.full_name,
          s.id_type,
          s.registration_number || s.serial_number || 'N/A',
          s.contact_phone || 'N/A',
          new Date(s.created_at).toLocaleDateString()
        ]);
        const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `submissions-report-${dateRange}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      alert(`Generating ${type} CSV report...`);
    } else {
      generatePDFReport(type, dataToExport);
    }
  };

  const generatePDFReport = async (type: string, filteredData: any[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Design Tokens
    const primaryColor: [number, number, number] = [11, 61, 145]; // #0B3D91
    const textColor: [number, number, number] = [40, 40, 40];
    
    // Header Bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Add Logo if possible
    try {
      const imgData = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = '/images/jkuat-logo.png';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
      });
      doc.addImage(imgData, 'PNG', 160, 5, 30, 30);
    } catch (e) {
      console.warn("Logo failed to load for PDF:", e);
    }
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("JKUAT FINDMYID", 20, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Official Platform Administration Report", 20, 32);
    
    // Report Info
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    
    const periodName = dateRange === 'all' ? 'March 2026 up to date' : 
                      dateRange === 'weekly' ? 'the Last 7 Days' : 
                      `${months[parseInt(selectedMonth)]} ${selectedYear}`;

    const activeFilter = type === 'claims' ? claimsFilter : 
                        type === 'users' ? usersFilter : 
                        type === 'ids' ? idsFilter : 'all';
    
    const typeLabel = type.replace(/^\w/, (c) => c.toUpperCase());
    const filterLabel = activeFilter === 'all' ? '' : activeFilter.replace(/^\w/, (c) => c.toUpperCase());
    
    const activeTypeName = type === 'submissions' 
      ? (activeFilter === 'all' ? 'Activity Submissions' : (activeFilter === 'found' ? 'Found ID Reports' : 'Lost ID Requests'))
      : typeLabel;

    const reportTitle = activeFilter === 'all' 
      ? `${activeTypeName} Audit Report (${periodName})`
      : `${filterLabel} Audit Report (${periodName})`;
      
    doc.setFont("helvetica", "bold");
    doc.text(reportTitle, 20, 55);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const summaryTypeLabel = type === 'submissions' 
      ? (activeFilter === 'found' ? 'found reports' : (activeFilter === 'lost' ? 'lost requests' : 'platform submissions'))
      : type;

    const summaryText = activeFilter === 'all'
      ? `This document presents the complete comprehensive report of all ${summaryTypeLabel} recorded from ${periodName}.`
      : `This document presents a report specifically for all ${summaryTypeLabel} recorded during ${periodName}.`;
    doc.text(summaryText, 20, 63);
    
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 68);
    
    // Separator
    doc.setDrawColor(230, 230, 230);
    doc.line(20, 72, pageWidth - 20, 72);

    if (type === 'claims') {
      autoTable(doc, {
        startY: 80,
        head: [['Claimant', 'Item', 'ID Type', 'ID Number', 'Status', 'Date']],
        body: (filteredData || []).map((c: any) => [
          c.claimant_name,
          c.id_name,
          c.id_type?.replace('_', ' ') || 'N/A',
          c.id_number || 'N/A',
          c.status.toUpperCase(),
          new Date(c.created_at).toLocaleDateString()
        ]),
        headStyles: { fillColor: primaryColor, textColor: 255 },
      });
    } else if (type === 'users') {
      autoTable(doc, {
        startY: 80,
        head: [['Full Name', 'Role', 'Email', 'Registration No']],
        body: (filteredData || []).map((u: any) => [
          u.full_name,
          u.role.toUpperCase(),
          u.email,
          u.registration_number || 'N/A'
        ]),
        headStyles: { fillColor: primaryColor, textColor: 255 },
      });
    } else if (type === 'ids') {
      // Distribution Table First
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("ID Categories Breakdown", 20, 80);
      
      autoTable(doc, {
        startY: 85,
        head: [['ID Category', 'Volume Count', 'Percentage']],
        body: Object.entries(reportData?.ids?.byType || {}).map(([type, count]: [string, any]) => [
          type.replace('_', ' ').toUpperCase(),
          count,
          ((count / reportData?.ids?.total) * 100).toFixed(1) + '%'
        ]),
        headStyles: { fillColor: primaryColor, textColor: 255 },
      });

      // Item Records Next
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      // @ts-ignore
      doc.text("Complete ID Records List", 20, doc.lastAutoTable.finalY + 15);
      
      autoTable(doc, {
        // @ts-ignore
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Name', 'ID Number', 'Status', 'Date Recorded']],
        body: (filteredData || []).map((i: any) => [
          i.full_name,
          i.registration_number,
          i.status.toUpperCase(),
          new Date(i.created_at).toLocaleDateString()
        ]),
        headStyles: { fillColor: primaryColor, textColor: 255 },
      });
    } else if (type === 'submissions') {
      autoTable(doc, {
        startY: 80,
        head: [['Type', 'Full Name', 'ID Category', 'Reference No', 'Contact', 'Date']],
        body: (filteredData || []).map((s: any) => [
          s.subtype?.toUpperCase() || 'N/A',
          s.full_name || 'N/A',
          s.id_type?.replace('_', ' ').toUpperCase() || 'N/A',
          s.registration_number || s.serial_number || 'N/A',
          s.contact_phone || 'N/A',
          s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A'
        ]),
        headStyles: { fillColor: primaryColor, textColor: 255 },
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`JKUAT FindMyID - Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    const fileName = activeFilter === 'all' ? type : activeFilter;
    doc.save(`${fileName}-report-${periodName.replace(/\s+/g, '-')}.pdf`);
  };

  if (authLoading || (isLoading && !reportData)) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-zinc-400 italic text-sm">
        Loading system data...
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Registered Users" 
          value={reportData?.summary?.totalUsers} 
          sub="Platform member count" 
          icon={UserCircle} 
          color="text-blue-600" 
          bg="bg-blue-50" 
        />
        <MetricCard 
          title="Total Item Claims" 
          value={reportData?.summary?.totalClaims} 
          sub="Ownership verifications" 
          icon={ClipboardList} 
          color="text-green-600" 
          bg="bg-green-50" 
        />
        <MetricCard 
          title="Found ID Records" 
          value={reportData?.ids?.total} 
          sub="Total items in database" 
          icon={Search} 
          color="text-purple-600" 
          bg="bg-purple-50" 
        />
        <MetricCard 
          title="Submissions Received" 
          value={reportData?.submissions?.found} 
          sub="Recent found reports" 
          icon={HandHeart} 
          color="text-orange-600" 
          bg="bg-orange-50" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="border-0 shadow-sm">
           <CardHeader>
             <CardTitle className="text-lg">Recent Claims Activity</CardTitle>
             <CardDescription>Latest verification requests waiting for action</CardDescription>
           </CardHeader>
           <CardContent>
             <div className="space-y-3">
                {reportData?.claims?.recent?.map((claim: any) => (
                  <div key={claim.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100/50">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-zinc-900">{claim.profiles?.full_name}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-zinc-500">{claim.status}</Badge>
                  </div>
                ))}
             </div>
           </CardContent>
         </Card>

         <Card className="border-0 shadow-sm">
           <CardHeader>
             <CardTitle className="text-lg">ID Category Breakdown</CardTitle>
             <CardDescription>Distribution of items currently held</CardDescription>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
                {Object.entries(reportData?.ids?.byType || {}).map(([type, count]: [string, any]) => (
                  <div key={type} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-400">
                      <span>{type.replace('_', ' ')}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(count / reportData?.ids?.total) * 100}%` }} />
                    </div>
                  </div>
                ))}
             </div>
           </CardContent>
         </Card>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* User Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-white shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Users</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-xl font-black text-zinc-900">{reportData?.users?.total || 0}</p>
              {dateRange !== 'all' && (
                <p className="text-[10px] font-bold text-zinc-400">/ {reportData?.users?.allTime} total</p>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-white shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Administrators</p>
            <p className="text-xl font-black text-zinc-900">{reportData?.users?.admins || 0}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-white shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Staff Members</p>
            <p className="text-xl font-black text-zinc-900">{reportData?.users?.staff || 0}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-white shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Students</p>
            <p className="text-xl font-black text-zinc-900">{reportData?.users?.students || 0}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-zinc-100/50 p-1 rounded-xl w-fit">
          {[{ label: 'All Users', value: 'all' }, { label: 'Administrators', value: 'admin' }, { label: 'Staff', value: 'staff' }, { label: 'Students', value: 'student' }].map((f) => (
            <button
              key={f.value}
              onClick={() => setUsersFilter(f.value)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                usersFilter === f.value ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="rounded-full shadow-sm text-red-600 border-red-100 hover:bg-red-50" onClick={() => downloadReport('users', 'pdf')}>
            Export PDF
          </Button>
          <Button size="sm" variant="outline" className="rounded-full shadow-sm" onClick={() => downloadReport('users', 'csv')}>
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b">
                <tr>
                  <th className="py-4 px-6 font-semibold text-zinc-500 uppercase text-xs tracking-wider">Name</th>
                  <th className="py-4 px-6 font-semibold text-zinc-500 uppercase text-xs tracking-wider">Email</th>
                  <th className="py-4 px-6 font-semibold text-zinc-500 uppercase text-xs tracking-wider">Role</th>
                  <th className="py-4 px-6 font-semibold text-zinc-500 uppercase text-xs tracking-wider">ID Number</th>
                  <th className="py-4 px-6 font-semibold text-zinc-500 uppercase text-xs tracking-wider">Date Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredUsers.length > 0 ? filteredUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-zinc-900">{user.full_name}</td>
                    <td className="py-4 px-6 text-zinc-600 font-medium">{user.email}</td>
                    <td className="py-4 px-6">
                      <Badge variant={user.role === 'admin' ? 'default' : user.role === 'staff' ? 'secondary' : 'outline'} className="text-[10px] capitalize">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-zinc-500 font-mono text-[10px]">{user.registration_number || 'N/A'}</td>
                    <td className="py-4 px-6 text-zinc-400 font-medium">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-zinc-400 italic font-medium">No users found matching this filter</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderClaims = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Claims Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-white shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Claims</p>
            <div className="flex items-baseline gap-1.5">
               <p className="text-xl font-black text-zinc-900">{reportData?.claims?.total || 0}</p>
               {dateRange !== 'all' && (
                 <p className="text-[10px] font-bold text-zinc-400">/ {reportData?.claims?.allTime} total</p>
               )}
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-white shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Approved</p>
            <p className="text-xl font-black text-zinc-900">{reportData?.claims?.approved || 0}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-white shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pending</p>
            <p className="text-xl font-black text-zinc-900">{reportData?.claims?.pending || 0}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-white shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Rejected</p>
            <p className="text-xl font-black text-zinc-900">{reportData?.claims?.rejected || 0}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="flex items-center gap-2 bg-zinc-100/50 p-1 rounded-xl w-fit">
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setClaimsFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  claimsFilter === f ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {f}
              </button>
            ))}
         </div>
         <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="rounded-full shadow-sm text-red-600 border-red-100 hover:bg-red-50" onClick={() => downloadReport('claims', 'pdf')}>
              Export PDF
            </Button>
            <Button size="sm" variant="outline" className="rounded-full shadow-sm" onClick={() => downloadReport('claims', 'csv')}>
              Export CSV
            </Button>
         </div>
      </div>

      {/* Claims Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                 <thead className="bg-zinc-50 border-b">
                    <tr>
                       <th className="py-4 px-6 font-semibold text-zinc-500 uppercase text-xs tracking-wider">Claimant</th>
                       <th className="py-4 px-6 font-semibold text-zinc-500 uppercase text-xs tracking-wider">Target Item</th>
                       <th className="py-4 px-6 font-semibold text-zinc-500 uppercase text-xs tracking-wider">ID Reference</th>
                       <th className="py-4 px-6 font-semibold text-zinc-500 uppercase text-xs tracking-wider">Status</th>
                       <th className="py-4 px-6 font-semibold text-zinc-500 uppercase text-xs tracking-wider">Date Submitted</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-100">
                    {filteredClaims.length > 0 ? filteredClaims.map((claim: any) => (
                       <tr key={claim.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="py-4 px-6 font-semibold text-zinc-900">{claim.claimant_name}</td>
                          <td className="py-4 px-6 text-zinc-600 uppercase font-medium">{claim.id_name}</td>
                          <td className="py-4 px-6 text-zinc-500 font-mono text-[10px]">{claim.id_number}</td>
                          <td className="py-4 px-6">
                             <Badge variant={claim.status === 'approved' ? 'default' : claim.status === 'pending' ? 'secondary' : 'outline'} className="text-[10px] capitalize">
                                {claim.status}
                             </Badge>
                          </td>
                          <td className="py-4 px-6 text-zinc-400 font-medium">{new Date(claim.created_at).toLocaleDateString()}</td>
                       </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-zinc-400 italic font-medium">No claims found matching this filter</td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderIds = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
       {/* High-level Distribution & Stats */}
       <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border bg-white shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recorded In Period</p>
              <div className="flex items-baseline gap-1.5">
                 <p className="text-xl font-black text-zinc-900">{reportData?.ids?.total || 0}</p>
                 {dateRange !== 'all' && (
                    <p className="text-[10px] font-bold text-zinc-400">/ {reportData?.ids?.allTime} total</p>
                 )}
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl border bg-white shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Verified Records</p>
              <p className="text-xl font-black text-zinc-900">{reportData?.ids?.verified || 0}</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border bg-white shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Successfully Returned</p>
              <p className="text-xl font-black text-zinc-900">{reportData?.ids?.returned || 0}</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border bg-white shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Awaiting Verification</p>
              <p className="text-xl font-black text-zinc-900">{reportData?.ids?.pending || 0}</p>
            </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">ID Categories</CardTitle>
              <CardDescription>Breakdown of IDs by their type</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                 {Object.entries(reportData?.ids?.byType || {}).map(([type, count]: [string, any]) => (
                   <div key={type} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500">
                        <span>{type.replace('_', ' ')}</span>
                        <span>{count} IDs ({((count / reportData?.ids?.total) * 100).toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-[#0B3D91] transition-all duration-1000" 
                           style={{ width: `${(count / reportData?.ids?.total) * 100}%` }} 
                        />
                      </div>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-0 shadow-sm flex flex-col">
             <CardHeader className="flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="text-lg">ID Records List</CardTitle>
                   <CardDescription>Complete list of all recorded items</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                   <Button size="sm" variant="outline" className="rounded-full shadow-sm text-red-600 border-red-100" onClick={() => downloadReport('ids', 'pdf')}>
                      PDF
                   </Button>
                   <Button size="sm" variant="outline" className="rounded-full shadow-sm" onClick={() => downloadReport('ids', 'csv')}>
                      CSV
                   </Button>
                </div>
             </CardHeader>
             <CardContent className="flex-1 p-0">
                <div className="px-6 py-2 border-b flex items-center gap-2 overflow-x-auto no-scrollbar">
                   {['all', 'verified', 'pending', 'claimed', 'returned'].map(status => (
                      <button
                         key={status}
                         onClick={() => setIdsFilter(status)}
                         className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                            idsFilter === status 
                               ? "bg-[#0B3D91] text-white" 
                               : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                         }`}
                      >
                         {status}
                      </button>
                   ))}
                </div>
                <div className="overflow-y-auto max-h-[400px]">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-50/50 sticky top-0 backdrop-blur-md">
                         <tr>
                            <th className="py-3 px-6 font-semibold text-zinc-500 uppercase text-xs tracking-wider">Name on ID</th>
                            <th className="py-3 px-6 font-semibold text-zinc-500 uppercase text-xs tracking-wider">Reference</th>
                            <th className="py-3 px-6 font-semibold text-zinc-500 uppercase text-xs tracking-wider">Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                         {filteredIds.length > 0 ? filteredIds.map((id: any) => (
                            <tr key={id.id} className="hover:bg-zinc-50/50 transition-colors">
                               <td className="py-3 px-6 font-semibold text-zinc-900 truncate max-w-[150px]">{id.full_name}</td>
                               <td className="py-3 px-6 text-zinc-500 font-mono text-[10px]">{id.registration_number}</td>
                               <td className="py-3 px-6">
                                  <Badge variant={id.status === 'returned' ? 'default' : id.status === 'verified' ? 'outline' : 'secondary'} className="text-[10px] scale-90">
                                     {id.status}
                                  </Badge>
                               </td>
                            </tr>
                         )) : (
                            <tr><td colSpan={3} className="py-20 text-center text-zinc-400 italic">No matching inventory records</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </CardContent>
          </Card>
       </div>
    </div>
  );

  const renderSubmissions = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900">
          {submissionsFilter === 'all' ? 'Consolidated Platform Submissions' : 
           submissionsFilter === 'found' ? 'Found Item Reports' : 'Lost Item Retrieval Requests'}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard 
          title="Found ID Reports" 
          value={reportData?.submissions?.found} 
          sub="Items reported as found on campus" 
          icon={Search} 
          color="text-blue-600" 
          bg="bg-blue-50" 
        />
        <MetricCard 
          title="Lost ID Requests" 
          value={reportData?.submissions?.lost} 
          sub="Ownership retrieval requests" 
          icon={AlertCircle} 
          color="text-red-600" 
          bg="bg-red-50" 
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-zinc-100/50 p-1 rounded-xl w-fit">
          {[{ label: 'All Submissions', value: 'all' }, { label: 'Found Reports', value: 'found' }, { label: 'Lost Requests', value: 'lost' }].map((f) => (
            <button
              key={f.value}
              onClick={() => setSubmissionsFilter(f.value)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                submissionsFilter === f.value ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
           <Button size="sm" variant="outline" className="rounded-full shadow-sm text-red-600 border-red-100 hover:bg-red-50" onClick={() => downloadReport('submissions', 'pdf')}>
              Export PDF
           </Button>
           <Button size="sm" variant="outline" className="rounded-full shadow-sm" onClick={() => downloadReport('submissions', 'csv')}>
              Export CSV
           </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-zinc-50 border-b">
                <tr>
                  <th className="py-4 px-6 font-semibold text-zinc-500 uppercase text-xs tracking-wider">Submission Type</th>
                  <th className="py-4 px-6 font-semibold text-zinc-500 uppercase text-xs tracking-wider">Reported Name</th>
                  <th className="py-4 px-6 font-semibold text-zinc-500 uppercase text-xs tracking-wider">Item Category</th>
                  <th className="py-4 px-6 font-semibold text-zinc-500 uppercase text-xs tracking-wider">Item Reference</th>
                  <th className="py-4 px-6 font-semibold text-zinc-500 uppercase text-xs tracking-wider">Contact Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredSubmissions.length > 0 ? filteredSubmissions.map((sub: any, idx: number) => (
                  <tr key={`${sub.id}-${idx}`} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <Badge variant={sub.subtype === 'found' ? 'default' : 'secondary'} className="text-[10px] uppercase font-bold">
                        {sub.subtype}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 font-semibold text-zinc-900">{sub.full_name}</td>
                    <td className="py-4 px-6 text-zinc-600 font-medium uppercase text-[10px]">{sub.id_type?.replace('_', ' ')}</td>
                    <td className="py-4 px-6 text-zinc-500 font-mono text-[10px]">{sub.registration_number || sub.serial_number || 'N/A'}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-zinc-600 font-bold text-[10px]">{sub.contact_phone || 'No Phone'}</span>
                        <span className="text-zinc-400 text-[10px]">{new Date(sub.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-zinc-400 italic font-medium">
                      No {submissionsFilter === 'all' ? 'submissions' : submissionsFilter === 'found' ? 'found item reports' : 'lost item requests'} found matching this filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <RoleProtectedRoute allowedRoles={['super_admin']}>
      <div className="min-h-screen space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-zinc-900">System Reports</h1>
          <p className="text-sm text-zinc-500">Comprehensive platform performance & security auditing</p>
        </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border shadow-sm self-start">
             {dateRange === 'monthly' && (
               <div className="flex items-center gap-2 pr-2 border-r mr-2">
                 <select 
                   value={selectedMonth}
                   onChange={(e) => setSelectedMonth(e.target.value)}
                   className="bg-transparent text-xs font-bold text-zinc-600 focus:outline-none pl-2"
                 >
                   {months.map((m, idx) => (
                     <option key={m} value={idx}>{m}</option>
                   ))}
                 </select>
                 <select 
                   value={selectedYear}
                   onChange={(e) => setSelectedYear(e.target.value)}
                   className="bg-transparent text-xs font-bold text-zinc-600 focus:outline-none"
                 >
                   {years.map(y => (
                     <option key={y} value={y}>{y}</option>
                   ))}
                 </select>
               </div>
             )}
            {['weekly', 'monthly', 'all'].map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  dateRange === r ? "bg-[#0B3D91] text-white shadow-md shadow-blue-500/20" : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl transition-all shrink-0 font-semibold text-sm ${
              activeTab === tab.id 
                ? "bg-[#0B3D91] text-white shadow-lg shadow-blue-500/10" 
                : "bg-white text-zinc-500 border border-zinc-100 hover:border-[#0B3D91]/30 hover:text-[#0B3D91]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'claims' && renderClaims()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'ids' && renderIds()}
          {activeTab === 'submissions' && renderSubmissions()}
        </motion.div>
      </AnimatePresence>
      </div>
    </RoleProtectedRoute>
  );
}

function MetricCard({ title, value, sub, color, bg }: any) {
  return (
    <Card className="border-0 shadow-sm overflow-hidden group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
             <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-500">{title}</p>
                <div className="flex items-baseline gap-1">
                   <h3 className="text-2xl font-bold text-zinc-900 mt-1">{value}</h3>
                </div>
                <p className="text-xs text-zinc-400 font-medium opacity-80 mt-1">{sub}</p>
             </div>
          </div>
        </CardContent>
    </Card>
  );
}
