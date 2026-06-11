"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getPartnerApplications, updateApplicationStatus } from "@/lib/api/admin";
import { PartnerApplication } from "@/types";
import { Check, X, Clock, AlertCircle, FileText, Search } from "lucide-react";
import Button from "@/components/shared/Button";

export default function AdminApplications() {
  const { token } = useAuth();
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Action states
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchApplications = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const statusFilter = filter !== "all" ? filter : undefined;
      const data = await getPartnerApplications(token, statusFilter);
      setApplications(data || []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setError("Failed to load partner applications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [token, filter]);

  const handleStatusUpdate = async (id: string, status: "approved" | "rejected", reason?: string) => {
    if (!token) return;
    
    setIsActionLoading(id);
    try {
      await updateApplicationStatus(token, id, status, reason);
      
      // Update local state or refetch if filtering
      if (filter === "all") {
        setApplications(applications.map(app => 
          app.id === id ? { ...app, status, rejectionReason: reason } : app
        ));
      } else {
        // Remove from current filtered view
        setApplications(applications.filter(app => app.id !== id));
      }
      
      // Reset rejection state
      setRejectingId(null);
      setRejectionReason("");
      
    } catch (err) {
      console.error(`Failed to ${status} application:`, err);
      alert(`Failed to ${status} application. Please try again.`);
    } finally {
      setIsActionLoading(null);
    }
  };

  const filteredApps = applications.filter(app => 
    app.salonName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Partner Applications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and manage requests from salon owners to join the platform.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-border-light">
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:max-w-xs sm:ml-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-start gap-3">
          <AlertCircle className="mt-0.5 flex-shrink-0" size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-border-light animate-pulse flex flex-col sm:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                  <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="sm:w-48 flex flex-col gap-2">
                <div className="h-10 bg-gray-200 rounded-lg"></div>
                <div className="h-10 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))
        ) : filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <div key={app.id} className="bg-white p-6 rounded-xl shadow-sm border border-border-light flex flex-col lg:flex-row gap-6 transition-all hover:shadow-md">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="text-primary" size={20} />
                    {app.salonName}
                  </h3>
                  
                  {/* Status Badge */}
                  {app.status === 'pending' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      <Clock size={12} className="mr-1.5" /> Pending Review
                    </span>
                  )}
                  {app.status === 'approved' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      <Check size={12} className="mr-1.5" /> Approved
                    </span>
                  )}
                  {app.status === 'rejected' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                      <X size={12} className="mr-1.5" /> Rejected
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 mb-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-medium">Owner Name</span>
                    <span className="text-gray-900">{app.ownerName}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-medium">City</span>
                    <span className="text-gray-900">{app.city}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-medium">Email</span>
                    <a href={`mailto:${app.email}`} className="text-primary hover:underline">{app.email}</a>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-medium">Phone</span>
                    <a href={`tel:${app.phone}`} className="text-primary hover:underline">{app.phone}</a>
                  </div>
                  <div className="flex flex-col sm:col-span-2">
                    <span className="text-gray-500 font-medium">Applied On</span>
                    <span className="text-gray-900">{new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
                
                {app.message && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-1">Message from applicant:</p>
                    <p className="text-sm text-gray-600 italic">"{app.message}"</p>
                  </div>
                )}
                
                {app.status === 'rejected' && app.rejectionReason && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                    <p className="text-sm text-red-700">{app.rejectionReason}</p>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              {app.status === 'pending' && (
                <div className="lg:w-48 flex flex-col gap-3 justify-center border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                  {rejectingId === app.id ? (
                    <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-200">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Reason for rejection</label>
                        <textarea
                          className="w-full text-sm rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500"
                          rows={3}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Briefly explain why..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate(app.id, "rejected", rejectionReason)}
                          disabled={isActionLoading === app.id || !rejectionReason.trim()}
                          className="flex-1 bg-red-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectionReason("");
                          }}
                          disabled={isActionLoading === app.id}
                          className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        onClick={() => handleStatusUpdate(app.id, "approved")}
                        disabled={isActionLoading === app.id || rejectingId !== null}
                        className="w-full bg-green-600 hover:bg-green-700 border-none shadow-sm"
                      >
                        <Check size={18} className="mr-2" /> Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setRejectingId(app.id)}
                        disabled={isActionLoading === app.id || rejectingId !== null}
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                      >
                        <X size={18} className="mr-2" /> Reject
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-xl border border-border-light text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No applications found</h3>
            <p className="text-gray-500">
              {searchQuery 
                ? "No applications matched your search criteria." 
                : filter !== "all" 
                  ? `There are no ${filter} applications at the moment.` 
                  : "There are no partner applications yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
