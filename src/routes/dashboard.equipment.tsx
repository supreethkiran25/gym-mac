import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Dumbbell,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  MapPin,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useGymStore, GymEquipment } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/equipment")({
  component: EquipmentManager,
});

function EquipmentManager() {
  const {
    equipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    serviceEquipment,
  } = useGymStore();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<GymEquipment | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"Cardio" | "Strength" | "Cables" | "Free Weights">("Strength");
  const [status, setStatus] = useState<"Operational" | "Service Due" | "Under Repair">("Operational");
  const [serialNumber, setSerialNumber] = useState("");
  const [location, setLocation] = useState("Main Floor");
  const [lastServiced, setLastServiced] = useState(new Date().toISOString().split("T")[0]);
  const [nextServiceDate, setNextServiceDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split("T")[0];
  });
  const [vendorName, setVendorName] = useState("");

  const filteredEquipment = equipment.filter((eq) => {
    const matches =
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      eq.location.toLowerCase().includes(search.toLowerCase());
    if (!matches) return false;
    if (filterCategory === "All") return true;
    return eq.category === filterCategory;
  });

  const handleOpenAdd = () => {
    setName("");
    setCategory("Strength");
    setStatus("Operational");
    setSerialNumber(`EQ-${Math.floor(1000 + Math.random() * 9000)}`);
    setLocation("Strength Bay");
    setVendorName("");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (eq: GymEquipment) => {
    setEditingEquipment(eq);
    setName(eq.name);
    setCategory(eq.category);
    setStatus(eq.status);
    setSerialNumber(eq.serialNumber);
    setLocation(eq.location);
    setLastServiced(eq.lastServiced);
    setNextServiceDate(eq.nextServiceDate);
    setVendorName(eq.vendorName || "");
  };

  const handleSaveEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingEquipment) {
      updateEquipment(editingEquipment.id, {
        name: name.trim(),
        category,
        status,
        serialNumber: serialNumber.trim(),
        location: location.trim(),
        lastServiced,
        nextServiceDate,
        vendorName: vendorName.trim(),
      });
      toast.success(`Updated ${name} successfully!`);
      setEditingEquipment(null);
    } else {
      addEquipment({
        name: name.trim(),
        category,
        status,
        serialNumber: serialNumber.trim(),
        location: location.trim(),
        lastServiced,
        nextServiceDate,
        vendorName: vendorName.trim(),
      });
      toast.success(`Added new equipment: ${name}!`);
      setIsAddModalOpen(false);
    }
  };

  const handleDelete = (id: string, eqName: string) => {
    if (window.confirm(`Are you sure you want to remove "${eqName}" from the asset inventory?`)) {
      deleteEquipment(id);
      toast.success(`Removed ${eqName}`);
    }
  };

  const handleService = (id: string, eqName: string) => {
    serviceEquipment(id);
    toast.success(`Logged service completion for ${eqName}. Next service scheduled in 90 days.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Equipment Health & Asset Registry</h1>
            <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
              {equipment.filter((e) => e.status === "Operational").length} / {equipment.length} Active
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Monitor machine status, track maintenance warranties, and log scheduled service tasks.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add Equipment Item</span>
        </button>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search equipment by name, serial number or zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-xs outline-none focus:border-emerald"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["All", "Strength", "Cardio", "Cables", "Free Weights"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition border ${
                filterCategory === cat
                  ? "bg-foreground text-background border-foreground shadow-xs"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipment.map((eq) => {
          const isDue = eq.status === "Service Due";
          const isRepair = eq.status === "Under Repair";

          return (
            <div
              key={eq.id}
              className={`rounded-2xl border p-5 space-y-4 transition flex flex-col justify-between shadow-2xs ${
                isDue
                  ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500"
                  : isRepair
                  ? "border-rose-500/40 bg-rose-500/5 hover:border-rose-500"
                  : "border-border bg-surface hover:border-foreground/40"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                      {eq.category}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">{eq.serialNumber}</span>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isDue
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : isRepair
                        ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                        : "bg-emerald-soft text-accent-foreground"
                    }`}
                  >
                    {eq.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground">{eq.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{eq.location}</span>
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-canvas/80 p-3 text-xs space-y-1 font-mono">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Last Serviced:</span>
                    <span className="font-semibold text-foreground">{eq.lastServiced}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Next Due:</span>
                    <span className={`font-semibold ${isDue ? "text-amber-500" : "text-foreground"}`}>
                      {eq.nextServiceDate}
                    </span>
                  </div>
                  {eq.vendorName && (
                    <div className="flex justify-between text-muted-foreground text-[10px] pt-0.5 border-t border-border/40 font-sans">
                      <span>Vendor:</span>
                      <span>{eq.vendorName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-border/60 gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(eq)}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition"
                    title="Edit Item"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(eq.id, eq.name)}
                    className="p-1.5 rounded-lg border border-border hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition"
                    title="Delete Item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleService(eq.id, eq.name)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-xl bg-foreground text-background px-3 py-1.5 hover:opacity-90 transition"
                >
                  <Wrench className="h-3.5 w-3.5 text-emerald" />
                  <span>Log Service</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Equipment Modal */}
      {(isAddModalOpen || editingEquipment) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold">
                {editingEquipment ? `Edit ${editingEquipment.name}` : "Add Equipment Machine / Asset"}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingEquipment(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LifeFitness Incline Bench Press #2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  >
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Cables">Cables</option>
                    <option value="Free Weights">Free Weights</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Service Due">Service Due</option>
                    <option value="Under Repair">Under Repair</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Serial / Asset Tag</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LF-BP-004"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-mono outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Location / Bay</label>
                  <input
                    type="text"
                    placeholder="e.g. Free Weights Zone"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Last Serviced</label>
                  <input
                    type="date"
                    value={lastServiced}
                    onChange={(e) => setLastServiced(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Next Service Due</label>
                  <input
                    type="date"
                    value={nextServiceDate}
                    onChange={(e) => setNextServiceDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Vendor / Maintenance Partner</label>
                <input
                  type="text"
                  placeholder="e.g. Life Fitness India Ltd."
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingEquipment(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-border font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-foreground text-background font-semibold hover:opacity-90"
                >
                  {editingEquipment ? "Save Changes" : "Create Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
