/**
 * Medical Locations Management View for MedRoute
 * Full CRUD for Hospitals and Distribution Centers with validation,
 * search, filtering, and delete safeguards.
 */

import React, { useState } from 'react';
import { MedicalLocation, LocationType } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  MapPin, 
  Phone, 
  Hospital, 
  Warehouse, 
  Check, 
  X,
  AlertTriangle
} from 'lucide-react';

interface LocationsViewProps {
  locations: MedicalLocation[];
  onAddLocation: (loc: Omit<MedicalLocation, 'id' | 'createdAt'>) => void;
  onUpdateLocation: (loc: MedicalLocation) => void;
  onDeleteLocation: (id: number) => void;
}

export const LocationsView: React.FC<LocationsViewProps> = ({
  locations,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<MedicalLocation | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [locationType, setLocationType] = useState<LocationType>('Hospital');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [formError, setFormError] = useState('');

  // Delete Confirm Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const filtered = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          loc.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || loc.locationType === filterType;
    return matchesSearch && matchesFilter;
  });

  const openAddModal = () => {
    setEditingLocation(null);
    setName('');
    setLocationType('Hospital');
    setAddress('');
    setLatitude('28.5500');
    setLongitude('77.2200');
    setContactNumber('+91-11-');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (loc: MedicalLocation) => {
    setEditingLocation(loc);
    setName(loc.name);
    setLocationType(loc.locationType);
    setAddress(loc.address);
    setLatitude(loc.latitude.toString());
    setLongitude(loc.longitude.toString());
    setContactNumber(loc.contactNumber || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Facility name is required.');
      return;
    }
    if (!address.trim()) {
      setFormError('Address description is required.');
      return;
    }

    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setFormError('Latitude must be a valid decimal between -90.0 and +90.0.');
      return;
    }
    if (isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
      setFormError('Longitude must be a valid decimal between -180.0 and +180.0.');
      return;
    }

    if (editingLocation) {
      onUpdateLocation({
        ...editingLocation,
        name: name.trim(),
        locationType,
        address: address.trim(),
        latitude: latNum,
        longitude: lonNum,
        contactNumber: contactNumber.trim() || undefined
      });
    } else {
      onAddLocation({
        name: name.trim(),
        locationType,
        address: address.trim(),
        latitude: latNum,
        longitude: lonNum,
        contactNumber: contactNumber.trim() || undefined
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by facility name or address..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-slate-400" />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Types ({locations.length})</option>
              <option value="Hospital">Hospitals ({locations.filter(l => l.locationType === 'Hospital').length})</option>
              <option value="Distribution Center">Distribution Hubs ({locations.filter(l => l.locationType === 'Distribution Center').length})</option>
            </select>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
        >
          <Plus size={15} />
          <span>Add Medical Facility</span>
        </button>
      </div>

      {/* Locations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Facility Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Coordinates (Lat, Lon)</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No medical locations matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(loc => (
                  <tr key={loc.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono text-slate-400">#{loc.id}</td>
                    <td className="py-3 px-4 font-medium text-slate-900 flex items-center gap-2">
                      <span className="text-base">
                        {loc.locationType === 'Distribution Center' ? '📦' : '🏥'}
                      </span>
                      <span>{loc.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        loc.locationType === 'Distribution Center'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {loc.locationType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={loc.address}>
                      {loc.address}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {loc.contactNumber || '—'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(loc)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Edit Facility"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(loc.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete Facility"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingLocation ? 'Edit Medical Facility' : 'Add New Medical Facility'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facility Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City Apollo Specialty Hospital"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facility Type *</label>
                <select
                  value={locationType}
                  onChange={e => setLocationType(e.target.value as LocationType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                >
                  <option value="Hospital">Hospital</option>
                  <option value="Distribution Center">Distribution Center</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Address or Description *</label>
                <input
                  type="text"
                  required
                  placeholder="Street, Area, City"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Latitude (Decimal) *</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    placeholder="e.g. 28.5672"
                    value={latitude}
                    onChange={e => setLatitude(e.target.value)}
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Longitude (Decimal) *</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    placeholder="e.g. 77.2100"
                    value={longitude}
                    onChange={e => setLongitude(e.target.value)}
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone (Optional)</label>
                <input
                  type="text"
                  placeholder="+91-11-26588500"
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm transition"
                >
                  {editingLocation ? 'Update Location' : 'Save Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm p-5 text-center space-y-3">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Confirm Deletion</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this facility? All attached graph edges will also be removed.
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 border border-slate-300 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmId !== null) {
                    onDeleteLocation(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
