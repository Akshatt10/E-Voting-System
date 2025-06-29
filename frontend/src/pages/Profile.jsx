import React, { useEffect, useState } from 'react';
import { Mail, User, Info, Loader2, Camera, Edit3, Save, X, Upload, Check } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No token found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to fetch profile');
        }

        setUser(data.data.user);
        setEditForm(data.data.user);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('profileImage', file);

      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/auth/upload-profile-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload image');
      }

      // Update user state with new image URL
      setUser(prev => ({ ...prev, profilePhotoUrl: data.data.imageUrl }));
      setEditForm(prev => ({ ...prev, profilePhotoUrl: data.data.imageUrl }));
      
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm(user); // Reset form to original user data
      setImagePreview(null);
    }
    setIsEditing(!isEditing);
    setError('');
  };

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setUser(data.data.user);
      setIsEditing(false);
      setImagePreview(null);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="flex flex-col items-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-lg text-gray-700 font-medium animate-pulse">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl max-w-md text-center border border-red-200">
          <Info className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transform hover:scale-105 transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const userInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';
  const displayImage = imagePreview || user?.profilePhotoUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 w-full max-w-2xl p-8 space-y-8 border border-white/20">
        
        {/* Error Alert */}
        {error && user && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
            <Info className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
            <button 
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Profile Header */}
        <div className="flex flex-col items-center text-center pb-8 border-b border-gray-200/50">
          {/* Profile Photo Section */}
          <div className="relative group mb-6">
            <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-2xl overflow-hidden">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                userInitial
              )}
              <div className="absolute inset-0 bg-black/10 rounded-full"></div>
            </div>
            
            {/* Upload/Edit Image Button */}
            <div className="absolute bottom-2 right-2">
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="imageUpload"
                className={`flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:bg-indigo-700 hover:scale-110 ${uploading ? 'animate-pulse cursor-wait' : ''}`}
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-lg text-gray-600 flex items-center justify-center">
              <Mail className="w-5 h-5 mr-2 text-indigo-500" />
              {user.email}
            </p>
          </div>
        </div>

        {/* User Details Section */}
        <div className="space-y-6">
          {/* First Name */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-500 mb-2">First Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.firstName || ''}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full p-4 bg-indigo-50 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-lg font-semibold"
                placeholder="Enter your first name"
              />
            ) : (
              <div className="flex items-center bg-indigo-50 p-4 rounded-xl shadow-sm border border-indigo-100 group-hover:shadow-md transition-all duration-300">
                <User className="w-6 h-6 mr-4 text-indigo-600" />
                <span className="text-lg font-semibold text-gray-800">{user.firstName}</span>
              </div>
            )}
          </div>

          {/* Last Name */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-500 mb-2">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.lastName || ''}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full p-4 bg-purple-50 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-lg font-semibold"
                placeholder="Enter your last name"
              />
            ) : (
              <div className="flex items-center bg-purple-50 p-4 rounded-xl shadow-sm border border-purple-100 group-hover:shadow-md transition-all duration-300">
                <User className="w-6 h-6 mr-4 text-purple-600" />
                <span className="text-lg font-semibold text-gray-800">{user.lastName}</span>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-500 mb-2">Email Address</label>
            {isEditing ? (
              <input
                type="email"
                value={editForm.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full p-4 bg-pink-50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 text-lg font-semibold"
                placeholder="Enter your email"
              />
            ) : (
              <div className="flex items-center bg-pink-50 p-4 rounded-xl shadow-sm border border-pink-100 group-hover:shadow-md transition-all duration-300">
                <Mail className="w-6 h-6 mr-4 text-pink-600" />
                <span className="text-lg font-semibold text-gray-800">{user.email}</span>
              </div>
            )}
          </div>

          {/* Account Status */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-500 mb-2">Account Status</label>
            <div className="flex items-center bg-green-50 p-4 rounded-xl shadow-sm border border-green-100 group-hover:shadow-md transition-all duration-300">
              <div className="w-6 h-6 mr-4 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-800">Active</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-8 border-t border-gray-200/50 flex flex-col sm:flex-row gap-4 justify-center">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveProfile}
                disabled={saveLoading}
                className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
              >
                {saveLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={handleEditToggle}
                disabled={saveLoading}
                className="flex items-center justify-center px-8 py-4 bg-gray-500 text-white font-semibold rounded-xl shadow-lg hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEditToggle}
              className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 min-w-[160px]"
            >
              <Edit3 className="w-5 h-5 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;