import React, { useEffect, useState, useRef } from 'react';
import { Mail, User, Info, Loader2, Camera, Edit3, Save, X, Upload, Check, Phone, Shield } from 'lucide-react';
import api from "../utils/interceptor";

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
        try {
            const res = await api.get("/auth/profile");
            if (!res.data.success) throw new Error(res.data.message || "Failed to fetch profile");

            setUser(res.data.data.user);
            setEditForm(res.data.data.user);
        } catch (err) {
            console.error("Profile fetch error:", err);
            setError(err.message || "Failed to load profile.");
        } finally {
            setLoading(false);
        }
        };
        fetchProfile();
    }, []);

    // ✅ Image upload handler (you said logic remains same)
    const handleImageUpload = async (event) => {
        // ... existing image upload logic ...
    };

    // ✅ Toggle between edit/view modes
    const handleEditToggle = () => {
        if (isEditing) {
        setEditForm(user);
        setImagePreview(null);
        }
        setIsEditing(!isEditing);
        setError("");
    };

    // ✅ Save updated profile
    const handleSaveProfile = async () => {
        setSaveLoading(true);
        setError("");

        try {
        const res = await api.put("/auth/update-profile", {
            firstname: editForm.firstname,
            lastname: editForm.lastname,
            phone: editForm.phone,
        });

        if (!res.data.success) throw new Error(res.data.message || "Failed to update profile");

        setUser(res.data.data.user);
        setIsEditing(false);
        setImagePreview(null);
        } catch (err) {
        console.error("Profile update error:", err);
        setError(err.message || "Failed to update profile.");
        } finally {
        setSaveLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-50">
                <div className="text-center p-8">
                    <Info className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-900">Oops! Something went wrong</h2>
                    <p className="text-slate-600 mt-2">{error}</p>
                </div>
            </div>
        );
    }
    
    if (!user) return null; // Should not happen if loading/error is handled

    const userInitial = user?.firstname ? user.firstname.charAt(0).toUpperCase() : 'U';
    const displayImage = imagePreview || user?.profilePhotoUrl;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg ring-1 ring-slate-200 w-full max-w-3xl">
                {/* Profile Header */}
                <div className="p-8 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group">
                        <div className="relative w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-5xl font-bold ring-4 ring-white overflow-hidden">
                            {displayImage ? (
                                <img src={displayImage} alt={`${user.firstname} ${user.lastname}`} className="w-full h-full object-cover" />
                            ) : (
                                userInitial
                            )}
                        </div>
                        <label
                            htmlFor="imageUpload"
                            className="absolute bottom-1 right-1 flex items-center justify-center w-10 h-10 bg-indigo-600 text-white rounded-full shadow-md cursor-pointer transition-all duration-300 hover:bg-indigo-700 hover:scale-110"
                        >
                            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                            <input type="file" id="imageUpload" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                        </label>
                    </div>
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-slate-900">{user.firstname} {user.lastname}</h1>
                        <p className="text-md text-slate-500 flex items-center justify-center sm:justify-start mt-2">
                            <Mail className="w-4 h-4 mr-2 text-slate-400" />
                            {user.email}
                        </p>
                    </div>
                </div>

                {/* Profile Details Form */}
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Personal Information</h2>
                        {!isEditing && (
                            <button onClick={handleEditToggle} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors text-sm">
                                <Edit3 size={16} /> Edit Profile
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center text-sm">
                            <Info className="w-5 h-5 mr-2 flex-shrink-0" />
                            <span>{error}</span>
                            <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700"><X size={16} /></button>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* First Name */}
                            <InfoField label="First Name" isEditing={isEditing} value={editForm.firstname} name="firstname" onChange={handleInputChange} />
                            {/* Last Name */}
                            <InfoField label="Last Name" isEditing={isEditing} value={editForm.lastname} name="lastname" onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Phone Number */}
                            <InfoField label="Phone Number" icon={Phone} isEditing={isEditing} value={editForm.phone} name="phone" onChange={handleInputChange} />
                            {/* Registration Number (Read-only) */}
                            <InfoField label="Registration No." icon={Shield} value={user.IBBI} isReadOnly />
                        </div>
                        
                        {/* Action Buttons for Edit Mode */}
                        {isEditing && (
                            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row gap-4 justify-end">
                                <button
                                    onClick={handleEditToggle}
                                    disabled={saveLoading}
                                    className="px-6 py-3 bg-slate-100 text-slate-800 font-semibold rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saveLoading}
                                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 flex items-center justify-center gap-2"
                                >
                                    {saveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper component for displaying profile fields
const InfoField = ({ label, icon: Icon, value, isEditing, isReadOnly, name, onChange }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">{label}</label>
            {isEditing && !isReadOnly ? (
                <input
                    type="text"
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                />
            ) : (
                <div className="flex items-center bg-slate-50 p-3 rounded-lg ring-1 ring-slate-200">
                    {Icon && <Icon className="w-5 h-5 mr-3 text-slate-400" />}
                    <span className={`text-base font-medium ${isReadOnly ? 'text-slate-500' : 'text-slate-800'}`}>
                        {value || 'Not provided'}
                    </span>
                </div>
            )}
        </div>
    );
};

export default Profile;
