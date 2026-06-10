"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getAdminSalons, verifySalon, deleteSalon } from "@/lib/api/admin";
import { Salon } from "@/types";
import { Search, Shield, ShieldCheck, Trash2, ExternalLink, AlertCircle, Store, Star } from "lucide-react";
import Button from "@/components/shared/Button";

export default function AdminSalons() {
  const { token } = useAuth();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Action states
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const fetchSalons = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getAdminSalons(token);
      setSalons(data.salons || []);
    } catch (err) {
      console.error("Failed to fetch salons:", err);
      setError("Failed to load salons list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalons();
  }, [token]);

  const handleVerify = async (id: string, currentlyVerified: boolean) => {
    if (!token) return;
    if (currentlyVerified) return; // Only allow verifying, not un-verifying for now
    
    setIsActionLoading(id);
    try {
      await verifySalon(token, id);
      // Update local state
      setSalons(salons.map(salon => 
        salon.id === id ? { ...salon, verified: true } : salon
      ));
    } catch (err) {
      console.error("Failed to verify salon:", err);
      alert("Failed to verify salon. Please try again.");
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!token) return;
    
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }
    
    setIsActionLoading(id);
    try {
      await deleteSalon(token, id);
      // Remove from local state
      setSalons(salons.filter(salon => salon.id !== id));
    } catch (err) {
      console.error("Failed to delete salon:", err);
      alert("Failed to delete salon. It may have associated bookings.");
    } finally {
      setIsActionLoading(null);
    }
  };

  const filteredSalons = salons.filter(salon => 
    salon.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    salon.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Salons Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            View, verify, and manage all salons on the platform.
          </p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary"
            placeholder="Search by name or city..."
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

      <div className="bg-white shadow-sm border border-border-light rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salon
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                // Loading skeleton
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                        <div className="ml-4 space-y-2">
                          <div className="h-4 w-32 bg-gray-200 rounded"></div>
                          <div className="h-3 w-24 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 w-12 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right"><div className="h-8 w-24 bg-gray-200 rounded inline-block"></div></td>
                  </tr>
                ))
              ) : filteredSalons.length > 0 ? (
                filteredSalons.map((salon) => (
                  <tr key={salon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          {salon.coverImage ? (
                            <img src={salon.coverImage} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Store className="h-5 w-5 text-gray-400 m-2.5" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{salon.name}</div>
                          <div className="text-sm text-gray-500">{salon.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{salon.city}</div>
                      <div className="text-sm text-gray-500 truncate max-w-[150px]">{salon.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="text-amber-500 mr-1" size={14} fill="currentColor" />
                        <span className="text-sm font-medium text-gray-900">{salon.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500 ml-1">({salon.reviewCount})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {salon.verified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <ShieldCheck size={12} className="mr-1" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Shield size={12} className="mr-1" /> Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={`/salons/${salon.slug}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
                          title="View on site"
                        >
                          <ExternalLink size={18} />
                        </a>
                        
                        <button
                          onClick={() => handleVerify(salon.id, salon.verified)}
                          disabled={salon.verified || isActionLoading === salon.id}
                          className={`p-1.5 rounded-md transition-colors ${
                            salon.verified 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={salon.verified ? "Already verified" : "Verify salon"}
                        >
                          <ShieldCheck size={18} />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(salon.id, salon.name)}
                          disabled={isActionLoading === salon.id}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete salon"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No salons found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination (simplified for MVP) */}
        {!isLoading && filteredSalons.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 flex items-center justify-between">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{filteredSalons.length}</span> results
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
