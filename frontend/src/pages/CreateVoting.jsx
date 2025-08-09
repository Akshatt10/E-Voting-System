import React, { useState, useEffect, useRef } from "react";
import {     Calendar, Clock, Users, FileText, Plus, X, CheckCircle, AlertCircle, Mail, Scale, Bold, Italic, 
    Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, CreditCard, Landmark, 
    Smartphone, Shield, Loader2  } from "lucide-react";

const RichTextEditor = ({ value, onChange, placeholder = "Provide details for this resolution..." }) => {
  const editorRef = useRef(null);
  const isUserTyping = useRef(false);

  const handleInput = () => {
    if (editorRef.current) {
      isUserTyping.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    handleInput(); // Update state after command
  };

  useEffect(() => {
    if (editorRef.current && !isUserTyping.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
    isUserTyping.current = false;
  }, [value]);

  // A simple check for empty content
  const isEmpty = !value || value === '<p><br></p>' || value === '<div><br></div>';

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-indigo-500 transition-colors duration-200 relative">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-3">
        <div className="flex flex-wrap gap-1 items-center">
          {/* Text Formatting */}
          <div className="flex border-r border-gray-300 pr-2 mr-2">
            <button type="button" onClick={() => execCommand('bold')} className="p-2 hover:bg-gray-200 rounded" title="Bold"><Bold size={16} /></button>
            <button type="button" onClick={() => execCommand('italic')} className="p-2 hover:bg-gray-200 rounded" title="Italic"><Italic size={16} /></button>
            <button type="button" onClick={() => execCommand('underline')} className="p-2 hover:bg-gray-200 rounded" title="Underline"><Underline size={16} /></button>
          </div>
          {/* Alignment */}
          <div className="flex border-r border-gray-300 pr-2 mr-2">
            <button type="button" onClick={() => execCommand('justifyLeft')} className="p-2 hover:bg-gray-200 rounded" title="Align Left"><AlignLeft size={16} /></button>
            <button type="button" onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-gray-200 rounded" title="Align Center"><AlignCenter size={16} /></button>
            <button type="button" onClick={() => execCommand('justifyRight')} className="p-2 hover:bg-gray-200 rounded" title="Align Right"><AlignRight size={16} /></button>
          </div>
          {/* Lists */}
          <div className="flex border-r border-gray-300 pr-2 mr-2">
            <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-gray-200 rounded" title="Bullet List"><List size={16} /></button>
            <button type="button" onClick={() => execCommand('insertOrderedList')} className="p-2 hover:bg-gray-200 rounded" title="Numbered List"><ListOrdered size={16} /></button>
          </div>
          {/* Font Size */}
          <div className="flex items-center">
            <select onChange={(e) => execCommand('fontSize', e.target.value)} className="text-sm border border-gray-300 rounded px-2 py-1 bg-white" title="Font Size" defaultValue="3">
              <option value="1">Small</option>
              <option value="3">Normal</option>
              <option value="5">Large</option>
              <option value="7">Extra Large</option>
            </select>
          </div>
        </div>
      </div>
      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[120px] p-4 focus:outline-none text-gray-800"
        onInput={handleInput}
        suppressContentEditableWarning={true}
      />
      {/* Placeholder */}
      {isEmpty && (
        <div className="absolute top-[calc(3rem+1rem+8px)] left-4 text-gray-400 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};

const RazorpayStaticUI = ({ onCancel, electionTitle }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      alert("This is a static UI. In a real application, this would process the payment and create the election.");
      setIsProcessing(false);
      onCancel(); // Close modal on "success"
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel - Payment Methods */}
        <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Payment Method</h2>
          <div className="space-y-2">
            <button onClick={() => setPaymentMethod('card')} className={`w-full flex items-center gap-3 p-4 rounded-lg text-left font-semibold transition-colors ${paymentMethod === 'card' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200'}`}>
              <CreditCard /> Card
            </button>
            <button onClick={() => setPaymentMethod('upi')} className={`w-full flex items-center gap-3 p-4 rounded-lg text-left font-semibold transition-colors ${paymentMethod === 'upi' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200'}`}>
              <Smartphone /> UPI / QR
            </button>
            <button onClick={() => setPaymentMethod('netbanking')} className={`w-full flex items-center gap-3 p-4 rounded-lg text-left font-semibold transition-colors ${paymentMethod === 'netbanking' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200'}`}>
              <Landmark /> Netbanking
            </button>
          </div>
          <div className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Shield size={14} /> Secure Payments by Razorpay
          </div>
        </div>

        {/* Right Panel - Order Details & Form */}
        <div className="w-full md:w-2/3 p-8 relative">
          <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
          <div className="mb-6">
            <p className="text-slate-500">Paying for:</p>
            <h3 className="text-2xl font-bold text-slate-900">{electionTitle}</h3>
          </div>
          <div className="flex justify-between items-baseline mb-8">
            <p className="text-lg font-semibold text-slate-600">Total Amount</p>
            <p className="text-4xl font-bold text-slate-900">₹500.00</p>
          </div>

          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Card Number</label>
                <input type="text" placeholder="0000 0000 0000 0000" className="w-full mt-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Expiry Date</label>
                  <input type="text" placeholder="MM / YY" className="w-full mt-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">CVV</label>
                  <input type="text" placeholder="123" className="w-full mt-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>
          )}
          {paymentMethod === 'upi' && (
            <div className="text-center p-8 border rounded-lg bg-slate-50">
              <p className="font-semibold">Scan QR code with any UPI app</p>
              <img src="https://placehold.co/200x200/e2e8f0/334155?text=QR+Code" alt="QR Code" className="mx-auto my-4" />
              <p className="text-sm text-slate-500">or enter UPI ID</p>
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full mt-8 bg-indigo-600 text-white font-bold py-4 rounded-lg text-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 flex items-center justify-center"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : `Pay ₹500.00`}
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateVoting = () => {
  const [form, setForm] = useState({
    Matter: "",
    title: "",
    // Replaced 'description' with a 'resolutions' array
    resolutions: [{
      title: "",
      description: "",
      options: { agree: "Agree", disagree: "Disagree", abstain: "Abstain from voting" }
    }],
    startTime: "",
    endTime: "",
    candidates: [{ name: "", email: "", share: "" }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [totalShareError, setTotalShareError] = useState("");
  const [showPaymentUI, setShowPaymentUI] = useState(false);


  // --- NEW Handlers for Resolutions ---
  const handleResolutionChange = (index, field, value) => {
    const updatedResolutions = [...form.resolutions];
    const keys = field.split('.'); // For nested fields like 'options.agree'
    if (keys.length === 2) {
      updatedResolutions[index][keys[0]][keys[1]] = value;
    } else {
      updatedResolutions[index][field] = value;
    }
    setForm({ ...form, resolutions: updatedResolutions });
  };

  const addResolution = () => {
    setForm({
      ...form,
      resolutions: [
        ...form.resolutions,
        { title: "", description: "", options: { agree: "Agree", disagree: "Disagree", abstain: "Abstain from voting" } }
      ]
    });
  };

  const removeResolution = (index) => {
    if (form.resolutions.length <= 1) return; // Prevent removing the last one
    const updatedResolutions = form.resolutions.filter((_, i) => i !== index);
    setForm({ ...form, resolutions: updatedResolutions });
  };
  // --- End of New Handlers ---

  const calculateTotalShare = () => {
    const validShares = form.candidates
      .map(c => parseFloat(c.share))
      .filter(share => !isNaN(share) && share >= 0);

    const sum = validShares.reduce((acc, curr) => acc + curr, 0);
    return parseFloat(sum.toFixed(2));
  };

  useEffect(() => {
    if (currentStep === 3) {
      const total = calculateTotalShare();
      if (total !== 100) {
        setTotalShareError(`Total share is ${total}%. It must be exactly 100%.`);
      } else {
        setTotalShareError("");
      }
    } else {
      setTotalShareError("");
    }
  }, [form.candidates, currentStep]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCandidateChange = (idx, field, value) => {
    const updated = [...form.candidates];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, candidates: updated });
  };

  const addCandidate = () => {
    setForm({ ...form, candidates: [...form.candidates, { name: "", email: "", share: "" }] });
  };

  const removeCandidate = (idx) => {
    const updated = form.candidates.filter((_, i) => i !== idx);
    setForm({ ...form, candidates: updated });
  };

  const validateEmail = (email) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validations...
    if (form.resolutions.some(r => r.title.trim() === "")) {
      setError("Please provide a title for every resolution.");
      setLoading(false);
      setCurrentStep(1);
      return;
    }

    // ... (rest of the validations: candidates, shares, time, etc.)
    const validCandidates = form.candidates.filter(c => c.name.trim());
    if (validCandidates.length < 2) {
      setError("Please enter at least two candidate names.");
      setLoading(false);
      return;
    }
    const invalidEmails = validCandidates.filter(c => c.email && !validateEmail(c.email));
    if (invalidEmails.length > 0) {
      setError("Please enter valid email addresses for all candidates.");
      setLoading(false);
      return;
    }
    const invalidShares = form.candidates.filter(c => isNaN(parseFloat(c.share)) || parseFloat(c.share) < 0 || c.share === '');
    if (invalidShares.length > 0) {
      setError("Please enter valid non-negative share percentages for all candidates.");
      setLoading(false);
      return;
    }
    const total = calculateTotalShare();
    if (total !== 100) {
      setError(`The total share for all candidates must be exactly 100%. Current total is ${total}%.`);
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
      const candidatesToSend = form.candidates.map(c => ({ ...c, share: parseFloat(c.share) }));

      const response = await fetch('/api/elections/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          Matter: form.Matter,
          title: form.title,
          resolutions: form.resolutions, // Send resolutions array
          startTime: form.startTime,
          endTime: form.endTime,
          candidates: candidatesToSend
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("Election created successfully!");
        setTimeout(() => {
          setForm({
            Matter: "",
            title: "",
            resolutions: [{ title: "", description: "", options: { agree: "Agree", disagree: "Disagree", abstain: "Abstain from voting" } }],
            startTime: "",
            endTime: "",
            candidates: [{ name: "", email: "", share: "" }]
          });
          setCurrentStep(1);
          setSuccess("");
        }, 3000);
      } else {
        setError(data.message || "Failed to create election.");
      }
    } catch (err) {
      console.error('Error creating election:', err);
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const getNowLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const isStepComplete = (step) => {
    switch (step) {
      case 1:
        // Updated validation for resolutions
        return form.Matter.trim() !== "" && form.title.trim() !== "" && form.resolutions.every(r => r.title.trim() !== "");
      case 2:
        return form.startTime !== "" && form.endTime !== "";
      case 3:
        const hasMinCandidates = form.candidates.filter(c => c.name.trim()).length >= 2;
        const allSharesValid = form.candidates.every(c => !isNaN(parseFloat(c.share)) && parseFloat(c.share) >= 0 && c.share !== '');
        const totalIs100 = calculateTotalShare() === 100;
        return hasMinCandidates && allSharesValid && totalIs100;
      default:
        return false;
    }
  };

  const handleStepClick = (stepId) => {
    setError("");
    if (stepId === 1) setCurrentStep(1);
    else if (stepId === 2 && isStepComplete(1)) setCurrentStep(2);
    else if (stepId === 3 && isStepComplete(1) && isStepComplete(2)) setCurrentStep(3);
  };

  const handleNextStep = () => {
    setError("");
    if (currentStep === 1 && !isStepComplete(1)) {
      setError("Please fill in Matter Name, Election Title, and all Resolution Titles.");
      return;
    }
    if (currentStep === 2) {
      if (!isStepComplete(2)) {
        setError("Please select both Start and End Times.");
        return;
      }
      if (form.endTime <= form.startTime) {
        setError("End time must be after start time.");
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setError("");

    // Run all final validations before showing payment modal
    if (!isStepComplete(1) || !isStepComplete(2) || !isStepComplete(3)) {
      setError("Please complete all previous steps accurately before proceeding to payment.");
      return;
    }
    if (totalShareError) {
      setError(totalShareError);
      return;
    }

    // If all validations pass, show the payment UI
    setShowPaymentUI(true);
  };

  const steps = [
    { id: 1, title: "Basic Info", icon: FileText },
    { id: 2, title: "Schedule", icon: Calendar },
    { id: 3, title: "Candidates", icon: Users },
  ];

  const isSubmitDisabled = loading || totalShareError !== "" || form.candidates.filter(c => c.name.trim()).length < 2 || form.candidates.some(c => c.email && !validateEmail(c.email)) || form.candidates.some(c => parseFloat(c.share) < 0 || c.share === '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      {/* --- NEW: Conditionally render the payment UI --- */}
      {showPaymentUI && <RazorpayStaticUI onCancel={() => setShowPaymentUI(false)} electionTitle={form.title} />}

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
              const isCompleted = isStepComplete(step.id); // This will now consider share sum for step 3
              const isClickable = (step.id === 1) ||
                (step.id === 2 && isStepComplete(1)) ||
                (step.id === 3 && isStepComplete(1) && isStepComplete(2)); // Still allow clicking to step 3 if previous steps are valid

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                      } ${isCompleted && step.id !== currentStep // Only show completed for past steps, current step shows active
                        ? "bg-green-500 border-green-500 text-white"
                        : isActive
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    onClick={() => isClickable && handleStepClick(step.id)}
                  >
                    {isCompleted && step.id !== currentStep ? <CheckCircle size={20} /> : <Icon size={20} />}
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
            {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg"><div className="flex items-center"><AlertCircle className="text-red-500 mr-2" size={20} /><span className="text-red-700 font-medium">{error}</span></div></div>}
            {success && <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg"><div className="flex items-center"><CheckCircle className="text-green-500 mr-2" size={20} /><span className="text-green-700 font-medium">{success}</span></div></div>}

            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-6">
                  <FileText className="mx-auto text-indigo-600 mb-2" size={32} />
                  <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
                  <p className="text-gray-600">Let's start with the essential details</p>
                </div>

                <div className="space-y-6">
                  {/* Matter and Title inputs (no changes) */}
                  <div className="group">
                    <label htmlFor="Matter" className="block text-sm font-semibold text-gray-700 mb-2"><Scale className="inline mr-1" size={16} /> Matter Name *</label>
                    <input id="Matter" type="text" name="Matter" value={form.Matter} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-lg" placeholder="e.g., Board Resolution, Policy Amendment" autoFocus />
                  </div>
                  <div className="group">
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">Title of Meeting *</label>
                    <input id="title" type="text" name="title" value={form.title} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-lg" placeholder="e.g., Annual General Meeting 2024" />
                  </div>

                  {/* --- NEW DYNAMIC RESOLUTION SECTION --- */}
                  <div className="group">
                    <div className="space-y-8">
                      {form.resolutions.map((resolution, index) => (
                        <div key={index} className="p-6 border border-gray-200 rounded-xl relative space-y-4 bg-gray-50/50">
                          <h3 className="text-lg font-semibold text-gray-700">Resolution #{index + 1}</h3>
                          {form.resolutions.length > 1 && (
                            <button type="button" onClick={() => removeResolution(index)} className="absolute top-4 right-4 p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors duration-200" title="Remove Resolution">
                              <X size={18} />
                            </button>
                          )}

                          <div>
                            <label htmlFor={`resolution-title-${index}`} className="block text-sm font-semibold text-gray-700 mb-2">RESOLUTION TITLE *</label>
                            <input id={`resolution-title-${index}`} type="text" value={resolution.title} onChange={(e) => handleResolutionChange(index, 'title', e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" placeholder={`Enter title for resolution #${index + 1}`} />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">RESOLUTION BODY</label>
                            <RichTextEditor value={resolution.description} onChange={(newDesc) => handleResolutionChange(index, 'description', newDesc)} />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Selections Name</label>
                            <div className="grid md:grid-cols-3 gap-4">
                              <input type="text" value={resolution.options.agree} onChange={(e) => handleResolutionChange(index, 'options.agree', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" placeholder="Agree Label" />
                              <input type="text" value={resolution.options.disagree} onChange={(e) => handleResolutionChange(index, 'options.disagree', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" placeholder="Disagree Label" />
                              <input type="text" value={resolution.options.abstain} onChange={(e) => handleResolutionChange(index, 'options.abstain', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" placeholder="Abstain Label" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end mt-4">
                      <button type="button" onClick={addResolution} className="flex items-center justify-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-semibold">
                        <Plus size={16} className="mr-2" />
                        Add More
                      </button>
                    </div>
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
                  <h2 className="text-2xl font-bold text-gray-800">Add COC members</h2>
                  <p className="text-gray-600">Who are the candidates for this voting? Assign their share percentage.</p>
                </div>

                <div className="space-y-4">
                  {form.candidates.map((candidate, idx) => (
                    <div key={idx} className="group">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm mt-1">
                          {idx + 1}
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3"> {/* Use grid for better layout */}
                          {/* Name */}
                          <div>
                            <label htmlFor={`candidate-name-${idx}`} className="sr-only">Candidate Name</label>
                            <input
                              id={`candidate-name-${idx}`}
                              type="text"
                              value={candidate.name}
                              onChange={(e) => handleCandidateChange(idx, 'name', e.target.value)}
                              required
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-lg"
                              placeholder={`Candidate ${idx + 1} name *`}
                            />
                          </div>

                          {/* Email */}
                          <div className="relative">
                            <label htmlFor={`candidate-email-${idx}`} className="sr-only">Candidate Email</label>
                            <input
                              id={`candidate-email-${idx}`}
                              type="email"
                              value={candidate.email}
                              onChange={(e) => handleCandidateChange(idx, 'email', e.target.value)}
                              className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200"
                              placeholder={`Candidate ${idx + 1} email (optional)`}
                            />
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            {candidate.email && !validateEmail(candidate.email) && (
                              <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
                            )}
                          </div>

                          {/* Share */}
                          <div className="relative">
                            <label htmlFor={`candidate-share-${idx}`} className="sr-only">Candidate Share</label>
                            <input
                              id={`candidate-share-${idx}`}
                              type="number"
                              min="0"
                              step="0.01" // Allows decimal shares like 25.50
                              value={candidate.share} // Keeps it as string for empty input, but parseFloat in handleCandidateChange
                              onChange={(e) => handleCandidateChange(idx, 'share', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200"
                              placeholder={`Share % *`}
                              required
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">%</span>
                            {/* Visual feedback for invalid individual share */}
                            {parseFloat(candidate.share) < 0 && (
                              <p className="text-red-500 text-sm mt-1">Share cannot be negative</p>
                            )}
                            {candidate.share !== '' && isNaN(parseFloat(candidate.share)) && (
                              <p className="text-red-500 text-sm mt-1">Enter a valid number</p>
                            )}
                          </div>
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
                    <span>Add Another COC member</span>
                  </button>
                </div>

                        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                          <div className="font-semibold text-gray-800">
                          Total Share:{" "}
                          <span className={calculateTotalShare() === 100 ? "text-green-600" : "text-red-600"}>
                            {calculateTotalShare()}%
                          </span>
                          </div>
                          {totalShareError && (
                          <p className="text-red-500 text-sm flex items-center">
                            <AlertCircle size={16} className="mr-1" />
                            {totalShareError}
                          </p>
                          )}
                        </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                        <div className="flex space-x-3">
                        {/* Removed the Next button here */}
                        {currentStep === 3 && (
                          // --- MODIFIED: Final button now triggers payment ---
                          <button
                          type="button"
                          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white ..."
                          disabled={isSubmitDisabled}
                          onClick={handleProceedToPayment}
                          >
                          {loading ? 'Processing...' : 'Proceed to Payment'}
                          </button>
                        )}
                        </div>
                      </div>

                      {/* Existing completion message - adjust if needed */}
            {currentStep === 3 && form.candidates.filter(c => c.name.trim()).length >= 2 && calculateTotalShare() === 100 && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-green-800 text-sm">
                  <CheckCircle className="inline mr-1" size={16} />
                  <strong>{form.candidates.filter(c => c.name.trim()).length} candidates</strong> are ready. Total share is 100%.
                </p>
                <p className="text-green-700 text-xs mt-1">
                  📧 Email notifications will be sent to candidates with email addresses
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors duration-200 ${currentStep === 1
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
                disabled={isSubmitDisabled} // Use the new disabled logic here
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
      {currentStep === 3 && form.title && (
        <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Election Summary</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Matter:</span>
              <p className="text-gray-800">{form.Matter}</p>
            </div>
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
            <div className="md:col-span-2">
              <span className="font-medium text-gray-600">Total Assigned Share:</span>
              <p className={`font-bold ${calculateTotalShare() === 100 ? "text-green-700" : "text-red-700"}`}>
                {calculateTotalShare()}%
              </p>
            </div>
          </div>
        </div>
      )}
      <style>{`
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







