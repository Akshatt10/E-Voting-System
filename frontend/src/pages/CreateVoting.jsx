import React, { useState } from "react";
import { Calendar, Clock, Users, FileText, Plus, X, CheckCircle, AlertCircle, Mail } from "lucide-react";

const CreateVoting = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    candidates: [{ name: "", email: "" }], // Changed to objects with name and email
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e) => { 
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCandidateChange = (idx, field, value) => {
    const updated = [...form.candidates];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, candidates: updated });
  };

  const addCandidate = () => {
    setForm({ ...form, candidates: [...form.candidates, { name: "", email: "" }] });
  };

  const removeCandidate = (idx) => {
    const updated = form.candidates.filter((_, i) => i !== idx);
    setForm({ ...form, candidates: updated });
  };

  const validateEmail = (email) => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccess("");

  // Validate candidates
  const validCandidates = form.candidates.filter(c => c.name.trim());
  if (validCandidates.length < 2) {
    setError("Please enter at least two candidate names.");
    setLoading(false);
    return;
  }

  // Validate emails
  const invalidEmails = validCandidates.filter(c => c.email && !validateEmail(c.email));
  if (invalidEmails.length > 0) {
    setError("Please enter valid email addresses for all candidates.");
    setLoading(false);
    return;
  }

  if (form.endTime <= form.startTime) {
    setError("End time must be after start time.");
    setLoading(false);
    return;
  }

  try {
    const accessToken = localStorage.getItem('accessToken');
    
    const response = await fetch('/api/elections/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        startTime: form.startTime,
        endTime: form.endTime,
        candidates: validCandidates // Now sends objects with name and email
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setSuccess("Election created successfully! Email notifications have been sent to candidates.");
      // Reset form after successful creation
      setTimeout(() => {
        setForm({ 
          title: "", 
          description: "", 
          startTime: "", 
          endTime: "", 
          candidates: [{ name: "", email: "" }] 
        });
        setCurrentStep(1);
        setSuccess("");
      }, 3000);
    } else {
      setError(data.message || "Failed to create election. Please try again.");
    }
  } catch (err) {
    console.error('Error creating election:', err);
    setError("Network error. Please check your connection and try again.");
  }
  setLoading(false);
};

  const getNowLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const steps = [
    { id: 1, title: "Basic Info", icon: FileText },
    { id: 2, title: "Schedule", icon: Calendar },
    { id: 3, title: "Candidates", icon: Users },
  ];

  const isStepComplete = (step) => {
    switch (step) {
      case 1:
        return form.title.trim() !== "";
      case 2:
        return form.startTime !== "" && form.endTime !== "";
      case 3:
        return form.candidates.filter(c => c.name.trim()).length >= 2;
      default:
        return false;
    }
  };

  const handleStepClick = (stepId) => {
    if (stepId === 1) {
      setCurrentStep(1);
    } else if (stepId === 2) {
      if (isStepComplete(1)) {
        setCurrentStep(2);
      } else {
        setError("Please complete Basic Information first.");
      }
    } else if (stepId === 3) {
      if (isStepComplete(1) && isStepComplete(2)) {
        setCurrentStep(3);
      } else {
        setError("Please complete Basic Information and Schedule first.");
      }
    }
  };

  const handleNextStep = () => {
    setError("");
    if (currentStep === 1 && !isStepComplete(1)) {
      setError("Please enter the Election Title.");
      return;
    }
    if (currentStep === 2 && !isStepComplete(2)) {
      setError("Please select both Start and End Times.");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Create New Voting Event</h1>
          <p className="text-gray-600">Set up a secure and transparent election in just a few steps</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = isStepComplete(step.id);
              const isClickable = (step.id === 1) || 
                                  (step.id === 2 && isStepComplete(1)) || 
                                  (step.id === 3 && isStepComplete(1) && isStepComplete(2));
              
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                      isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                    } ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isActive
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                    onClick={() => isClickable && handleStepClick(step.id)}
                  >
                    {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                  </div>
                  <div className="ml-2">
                    <p className={`text-sm font-medium ${isActive ? "text-indigo-600" : "text-gray-500"}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${isCompleted ? "bg-green-500" : "bg-gray-300"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                <div className="flex items-center">
                  <AlertCircle className="text-red-500 mr-2" size={20} />
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2" size={20} />
                  <span className="text-green-700 font-medium">{success}</span>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-6">
                  <FileText className="mx-auto text-indigo-600 mb-2" size={32} />
                  <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
                  <p className="text-gray-600">Let's start with the essential details</p>
                </div>

                <div className="space-y-6">
                  <div className="group">
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                      Election Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-lg"
                      placeholder="e.g., Student Council Election 2024"
                      autoFocus
                    />
                  </div>

                  <div className="group">
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200 resize-none"
                      rows={4}
                      placeholder="Provide additional details about this election..."
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-6">
                  <Calendar className="mx-auto text-indigo-600 mb-2" size={32} />
                  <h2 className="text-2xl font-bold text-gray-800">Election Schedule</h2>
                  <p className="text-gray-600">When will your election take place?</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="group">
                    <label htmlFor="startTime" className="block text-sm font-semibold text-gray-700 mb-2">
                      <Clock className="inline mr-1" size={16} />
                      Start Time *
                    </label>
                    <input
                      id="startTime"
                      type="datetime-local"
                      name="startTime"
                      value={form.startTime}
                      onChange={handleChange}
                      required
                      min={getNowLocal()}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-lg"
                    />
                  </div>

                  <div className="group">
                    <label htmlFor="endTime" className="block text-sm font-semibold text-gray-700 mb-2">
                      <Clock className="inline mr-1" size={16} />
                      End Time *
                    </label>
                    <input
                      id="endTime"
                      type="datetime-local"
                      name="endTime"
                      value={form.endTime}
                      onChange={handleChange}
                      required
                      min={form.startTime || getNowLocal()}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-lg"
                    />
                  </div>
                </div>

                {form.startTime && form.endTime && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-blue-800 text-sm">
                      <strong>Duration:</strong> {Math.round((new Date(form.endTime) - new Date(form.startTime)) / (1000 * 60 * 60))} hours
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-6">
                  <Users className="mx-auto text-indigo-600 mb-2" size={32} />
                  <h2 className="text-2xl font-bold text-gray-800">Add Candidates</h2>
                  <p className="text-gray-600">Who are the candidates for this election?</p>
                </div>

                <div className="space-y-4">
                  {form.candidates.map((candidate, idx) => (
                    <div key={idx} className="group">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm mt-1">
                          {idx + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={candidate.name}
                            onChange={(e) => handleCandidateChange(idx, 'name', e.target.value)}
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-lg"
                            placeholder={`Candidate ${idx + 1} name *`}
                          />
                          <div className="relative">
                            <input
                              type="email"
                              value={candidate.email}
                              onChange={(e) => handleCandidateChange(idx, 'email', e.target.value)}
                              className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200"
                              placeholder={`Candidate ${idx + 1} email (optional)`}
                            />
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          </div>
                          {candidate.email && !validateEmail(candidate.email) && (
                            <p className="text-red-500 text-sm">Please enter a valid email address</p>
                          )}
                        </div>
                        {form.candidates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCandidate(idx)}
                            className="flex-shrink-0 w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors duration-200 flex items-center justify-center mt-1"
                            title="Remove candidate"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addCandidate}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Plus size={20} />
                    <span>Add Another Candidate</span>
                  </button>

                  {form.candidates.filter(c => c.name.trim()).length >= 2 && (
                    <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                      <p className="text-green-800 text-sm">
                        <CheckCircle className="inline mr-1" size={16} />
                        <strong>{form.candidates.filter(c => c.name.trim()).length} candidates</strong> added successfully
                      </p>
                      <p className="text-green-700 text-xs mt-1">
                        📧 Email notifications will be sent to candidates with email addresses
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                className={`px-6 py-3 rounded-xl font-semibold transition-colors duration-200 ${
                  currentStep === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
                disabled={currentStep === 1}
              >
                Previous
              </button>

              <div className="flex space-x-3">
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                    onClick={handleSubmit}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Create Election
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {currentStep === 3 && form.title && (
          <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Election Summary</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Title:</span>
                <p className="text-gray-800">{form.title}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Candidates:</span>
                <p className="text-gray-800">{form.candidates.filter(c => c.name.trim()).length} candidates</p>
              </div>
              {form.startTime && (
                <div>
                  <span className="font-medium text-gray-600">Start:</span>
                  <p className="text-gray-800">{new Date(form.startTime).toLocaleString()}</p>
                </div>
              )}
              {form.endTime && (
                <div>
                  <span className="font-medium text-gray-600">End:</span>
                  <p className="text-gray-800">{new Date(form.endTime).toLocaleString()}</p>
                </div>
              )}
              <div className="md:col-span-2">
                <span className="font-medium text-gray-600">Email Notifications:</span>
                <p className="text-gray-800">
                  {form.candidates.filter(c => c.email && c.name.trim()).length} candidates will receive email notifications
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CreateVoting;