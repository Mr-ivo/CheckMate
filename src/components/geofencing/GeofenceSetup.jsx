'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X,
  AlertCircle,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiService from '@/services/api.service';

export default function GeofenceSetup() {
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: 200,
    description: ''
  });

  useEffect(() => {
    fetchGeofences();
  }, []);

  const fetchGeofences = async () => {
    try {
      setLoading(true);
      const response = await apiService.getGeofences();
      console.log('Geofences response:', response); // Debug
      // Backend returns { status: 'success', data: { geofences: [...], count: N } }
      const geofencesList = response.data?.geofences || response.geofences || [];
      console.log('Geofences list:', geofencesList); // Debug
      setGeofences(geofencesList);
    } catch (error) {
      toast.error('Failed to load geofences');
      console.error('Error fetching geofences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    toast.loading('Getting your location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss();
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        toast.success('Location captured!');
      },
      (error) => {
        toast.dismiss();
        toast.error('Failed to get location: ' + error.message);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.latitude || !formData.longitude) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        await apiService.updateGeofence(editingId, formData);
        toast.success('Geofence updated successfully');
      } else {
        await apiService.createGeofence(formData);
        toast.success('Geofence created successfully');
      }
      
      setFormData({ name: '', latitude: '', longitude: '', radius: 200, description: '' });
      setShowAddForm(false);
      setEditingId(null);
      fetchGeofences();
    } catch (error) {
      toast.error(error.message || 'Failed to save geofence');
    }
  };

  const handleEdit = (geofence) => {
    // Extract coordinates from GeoJSON format: [longitude, latitude]
    const longitude = geofence.location?.coordinates?.[0] || '';
    const latitude = geofence.location?.coordinates?.[1] || '';
    
    setFormData({
      name: geofence.name,
      latitude: latitude,
      longitude: longitude,
      radius: geofence.radius,
      description: geofence.description || ''
    });
    setEditingId(geofence._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this geofence?')) return;

    try {
      await apiService.deleteGeofence(id);
      toast.success('Geofence deleted successfully');
      fetchGeofences();
    } catch (error) {
      toast.error('Failed to delete geofence');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', latitude: '', longitude: '', radius: 100, description: '' });
    setShowAddForm(false);
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Geofence Locations
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Define allowed check-in locations with radius
          </p>
        </div>
        
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 
                     flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Location
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border-2 border-emerald-500 p-6"
        >
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingId ? 'Edit Geofence' : 'Add New Geofence'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Location Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Main Office, Branch A"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 
                         dark:text-white"
                required
              />
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="e.g., 40.7128"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 
                           dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="e.g., -74.0060"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 
                           dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Get Current Location Button */}
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                       flex items-center justify-center gap-2 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Use My Current Location
            </button>

            {/* Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Radius (meters): {formData.radius}m
              </label>
              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={formData.radius}
                onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>50m</span>
                <span>5000m</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional notes about this location..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 
                         dark:text-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 
                         flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Save'} Geofence
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                         rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center 
                         gap-2 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Geofences List */}
      <div className="space-y-3">
        {geofences.map((geofence) => (
          <motion.div
            key={geofence._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 
                     dark:border-gray-700 p-4 hover:border-emerald-500 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3 flex-1">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {geofence.name}
                  </h4>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>
                      📍 {geofence.location?.coordinates?.[1]?.toFixed(6) || 'N/A'}, {geofence.location?.coordinates?.[0]?.toFixed(6) || 'N/A'}
                    </p>
                    <p>
                      🎯 Radius: {geofence.radius}m
                    </p>
                    {geofence.description && (
                      <p className="text-gray-500 dark:text-gray-500">
                        {geofence.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    {geofence.isActive ? (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 
                                     text-green-700 dark:text-green-400 text-xs rounded-full 
                                     flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 
                                     text-gray-600 dark:text-gray-400 text-xs rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(geofence)}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 
                           rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDelete(geofence._id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 
                           rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {geofences.length === 0 && !showAddForm && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No geofences configured</p>
            <p className="text-sm mt-1">Click "Add Location" to create your first geofence</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 
                    rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
              How Geofencing Works
            </h4>
            <ul className="text-sm text-emerald-800 dark:text-emerald-400 space-y-1">
              <li>• Users can only check-in when they are within the defined radius</li>
              <li>• Location is verified using GPS coordinates</li>
              <li>• Multiple geofences can be created for different locations</li>
              <li>• Radius can be adjusted from 50m to 5000m</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
