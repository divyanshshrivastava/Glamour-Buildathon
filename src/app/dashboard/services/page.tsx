"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  getMySalon,
  getSalonServices,
  createService,
  updateService,
  deleteService,
  ServiceItem,
} from "@/lib/api/dashboard";
import {
  Plus,
  Pencil,
  Trash2,
  Scissors,
  AlertCircle,
  X,
  Loader2,
  Clock,
  IndianRupee,
} from "lucide-react";
import Button from "@/components/shared/Button";

const CATEGORIES = [
  "Haircut",
  "Hair Treatment",
  "Coloring",
  "Styling",
  "Facial",
  "Massage",
  "Manicure",
  "Pedicure",
];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  duration: "",
  category: CATEGORIES[0],
};

export default function ServicesPage() {
  const { token } = useAuth();
  const [salonId, setSalonId] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchServices = async (sId: string) => {
    if (!token) return;
    try {
      const data = await getSalonServices(token, sId);
      setServices(data);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError("Failed to load services.");
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!token) return;
      try {
        const salon = await getMySalon(token);
        setSalonId(salon.id);
        await fetchServices(salon.id);
      } catch (err) {
        console.error("Failed to load salon:", err);
        setError("Failed to load salon data.");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [token]);

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError(null);
    setShowForm(true);
  };

  const openEditForm = (svc: ServiceItem) => {
    setForm({
      name: svc.name,
      description: svc.description || "",
      price: String(svc.price),
      duration: svc.duration,
      category: svc.category,
    });
    setEditingId(svc.id);
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !salonId) return;

    if (!form.name.trim() || !form.price || !form.duration.trim() || !form.category) {
      setFormError("Name, price, duration, and category are required.");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: parseFloat(form.price),
        duration: form.duration.trim(),
        category: form.category,
      };

      if (editingId) {
        const updated = await updateService(token, editingId, payload);
        setServices((prev) =>
          prev.map((s) => (s.id === editingId ? { ...s, ...updated } : s))
        );
      } else {
        const created = await createService(token, salonId, payload);
        setServices((prev) => [...prev, created]);
      }

      closeForm();
    } catch (err: any) {
      setFormError(err.message || "Failed to save service.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!token) return;
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`))
      return;

    setDeleteLoading(id);
    try {
      await deleteService(token, id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete service.");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Services
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the services offered by your salon.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openAddForm}
          className="bg-violet-600 hover:bg-violet-700 border-none shadow-sm"
        >
          <Plus size={18} className="mr-2" /> Add Service
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-start gap-3">
          <AlertCircle className="mt-0.5 flex-shrink-0" size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit Service" : "Add New Service"}
              </h2>
              <button
                onClick={closeForm}
                className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-violet-500 focus:border-violet-500"
                  placeholder="e.g. Haircut & Styling"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-violet-500 focus:border-violet-500"
                  rows={2}
                  placeholder="Brief description of the service..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-violet-500 focus:border-violet-500"
                    placeholder="500"
                    min="0"
                    step="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration *
                  </label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-violet-500 focus:border-violet-500"
                    placeholder="30 min"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-violet-500 focus:border-violet-500 bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {formError && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={formLoading}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 border-none"
                >
                  {formLoading ? (
                    <Loader2 size={18} className="animate-spin mx-auto" />
                  ) : editingId ? (
                    "Save Changes"
                  ) : (
                    "Add Service"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse"
            >
              <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
              <div className="h-4 w-full bg-gray-200 rounded mb-2" />
              <div className="h-4 w-2/3 bg-gray-200 rounded mb-4" />
              <div className="flex gap-3">
                <div className="h-8 w-20 bg-gray-200 rounded" />
                <div className="h-8 w-20 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{svc.name}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-violet-50 text-violet-700 mt-1 border border-violet-100">
                    {svc.category}
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditForm(svc)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(svc.id, svc.name)}
                    disabled={deleteLoading === svc.id}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deleteLoading === svc.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>

              {svc.description && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {svc.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1 font-semibold text-gray-900">
                  <IndianRupee size={14} className="text-green-600" />
                  {svc.price.toLocaleString("en-IN")}
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Clock size={14} />
                  {svc.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-gray-100 text-center">
          <Scissors
            className="mx-auto h-12 w-12 text-gray-300 mb-4"
            strokeWidth={1.5}
          />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No services yet
          </h3>
          <p className="text-gray-500 mb-6">
            Add services to let customers know what you offer.
          </p>
          <Button
            variant="primary"
            onClick={openAddForm}
            className="bg-violet-600 hover:bg-violet-700 border-none"
          >
            <Plus size={18} className="mr-2" /> Add Your First Service
          </Button>
        </div>
      )}
    </div>
  );
}
