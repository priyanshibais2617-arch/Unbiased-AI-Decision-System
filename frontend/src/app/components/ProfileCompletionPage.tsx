import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ChevronRight, UserCircle2, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";

type FeatureType = "job" | "loan" | "education" | "document" | null;

const FEATURE_CONFIG = {
  job: {
    title: "Complete Your Professional Profile",
    subtitle: "Job Hiring & Recruitment System",
    color: "blue",
    path: "/job-hiring",
    fields: [
      { id: "resume", label: "Resume Upload", type: "file", placeholder: "Upload PDF or DOCX" },
      { id: "skills", label: "Skills", type: "text", placeholder: "e.g. React, Python, Communication" },
      { id: "experience", label: "Experience (Years)", type: "number", placeholder: "e.g. 3" },
      { id: "preferredRole", label: "Preferred Role", type: "text", placeholder: "e.g. Software Engineer" }
    ]
  },
  loan: {
    title: "Complete Financial Profile",
    subtitle: "Advanced Loan System",
    color: "purple",
    path: "/loan-approval",
    fields: [
      { id: "monthlyIncome", label: "Monthly Income", type: "number", placeholder: "e.g. 50000" },
      { id: "existingEMI", label: "Existing EMI", type: "number", placeholder: "e.g. 5000" },
      { id: "employmentType", label: "Employment Type", type: "select", options: ["Salaried", "Self-Employed", "Business"] },
      { id: "panAadhaar", label: "PAN / Aadhaar Number", type: "text", placeholder: "Enter ID number" }
    ]
  },
  education: {
    title: "Student Academic Profile",
    subtitle: "Education Evaluation System",
    color: "teal",
    path: "/education-system",
    fields: [
      { id: "fullName", label: "Full Name", type: "text", placeholder: "Your registered full name", readonly: false },
      { id: "email", label: "Email Address", type: "email", placeholder: "Your registered email", readonly: true },
      { id: "course", label: "Course / Stream", type: "text", placeholder: "e.g. B.Tech Computer Science" },
      { id: "year", label: "Year / Semester", type: "text", placeholder: "e.g. 3rd Year / 6th Semester" },
      { id: "institution", label: "Institution Name", type: "text", placeholder: "e.g. MIT University" },
      { id: "subjectPreference", label: "Subject Preference", type: "text", placeholder: "e.g. Machine Learning" }
    ]
  },
  document: {
    title: "Identity Verification Setup",
    subtitle: "Document Verification System",
    color: "green",
    path: "/document-verification",
    fields: [
      { id: "documentType", label: "Document Type Selector", type: "select", options: ["PAN Card", "Aadhaar Card", "Academic Certificate", "Salary Slip"] },
      { id: "documentUpload", label: "Document Upload", type: "file", placeholder: "Upload Scan" }
    ]
  }
};

export function ProfileCompletionPage() {
  const navigate = useNavigate();
  const [feature, setFeature] = useState<FeatureType>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Get the selected feature from localStorage
    const savedFeature = localStorage.getItem("selectedFeature") as FeatureType;
    if (!savedFeature || !FEATURE_CONFIG[savedFeature]) {
      // If no feature selected, go back to home
      navigate("/");
    } else {
      setFeature(savedFeature);
      // Initialize form data
      const initialData: Record<string, string> = {};
      FEATURE_CONFIG[savedFeature].fields.forEach(f => {
        initialData[f.id] = "";
      });
      
      // For education feature, auto-fill name and email from registered account
      if (savedFeature === "education") {
        const registeredName = localStorage.getItem('userFullName') || localStorage.getItem('userName') || "Aisha Rahman";
        const registeredEmail = localStorage.getItem('userEmail') || "aisha.r@university.edu";
        initialData["fullName"] = registeredName;
        initialData["email"] = registeredEmail;
      }
      
      setFormData(initialData);
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "file") {
      const files = (e.target as HTMLInputElement).files;
      setFormData(prev => ({ ...prev, [name]: files && files.length > 0 ? files[0].name : "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (error) setError(""); // Clear error on change
  };

  const handleSwitchFeature = () => {
    if (window.confirm("Are you sure you want to switch to a different service? Your progress here will not be saved.")) {
      localStorage.removeItem("selectedFeature");
      navigate("/dashboard");
    }
  };

  if (!feature) return null; // Or a loading spinner

  const config = FEATURE_CONFIG[feature];
  
  // Calculate completion percentage
  const totalFields = config.fields.length;
  const filledFields = Object.values(formData).filter(val => val.trim() !== "").length;
  const completionPercentage = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filledFields < totalFields) {
      setError("Please complete all fields to proceed.");
      return;
    }

    setIsLoading(true);
    // 5. Save Data (Frontend Only)
    setTimeout(() => {
      localStorage.setItem(`userProfile_${feature}`, JSON.stringify(formData));
      // 6. Allow Feature Access -> redirect ONLY to selected feature dashboard
      navigate(config.path);
    }, 1500);
  };

  // Dynamic colors based on feature
  const colorMap: Record<string, string> = {
    blue: "bg-blue-600 hover:bg-blue-700 text-blue-600 focus:ring-blue-500",
    purple: "bg-purple-600 hover:bg-purple-700 text-purple-600 focus:ring-purple-500",
    teal: "bg-teal-600 hover:bg-teal-700 text-teal-600 focus:ring-teal-500",
    green: "bg-green-600 hover:bg-green-700 text-green-600 focus:ring-green-500"
  };
  const themeColor = colorMap[config.color] || colorMap.blue;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl relative">
        <Button 
          variant="ghost" 
          onClick={handleSwitchFeature} 
          className="absolute -top-12 left-0 gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Switch Service
        </Button>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-white">
            <div className={`h-2 w-full ${themeColor.split(" ")[0]} transition-colors duration-500`} />
            
            <CardContent className="p-8 sm:p-10">
              <div className="flex items-start gap-5 mb-8">
                <div className={`p-4 rounded-full ${themeColor.split(" ")[0].replace("bg-", "bg-opacity-10 ")} bg-indigo-50 text-indigo-600 flex items-center justify-center`}>
                   <UserCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{config.title}</h1>
                  <p className="text-gray-500 font-medium">{config.subtitle}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-700">Profile Completion Tracker</span>
                  <span className={`text-sm font-bold ${completionPercentage === 100 ? 'text-green-600' : 'text-gray-500'}`}>
                    {completionPercentage}%
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-2.5 bg-gray-100" />
              </div>

              <AnimatePresence>
                {error && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                      <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-bold">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        {error}
                      </div>
                   </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {config.fields.map((field, index) => {
                    const isFilled = formData[field.id] && formData[field.id].trim() !== "";
                    
                    return (
                      <motion.div 
                        key={field.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2 relative"
                      >
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-bold text-gray-700">{field.label}</label>
                          <AnimatePresence>
                            {isFilled && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 right-0">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {field.type === "select" ? (
                          <select 
                            name={field.id}
                            value={formData[field.id]}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-opacity-50 transition-colors bg-gray-50 hover:bg-white focus:bg-white outline-none ${isFilled ? 'border-green-300' : 'border-gray-200'} ${themeColor.split(" ")[2].replace("text-", "focus:border-").replace("600", "500")}`}
                          >
                            <option value="">Select {field.label}</option>
                            {field.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.type === "file" ? (
                           <div className={`relative w-full border-2 border-dashed rounded-xl p-4 transition-colors flex items-center justify-center ${isFilled ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                             <input 
                               type="file" 
                               name={field.id}
                               onChange={handleChange}
                               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                             />
                             <div className="text-center cursor-pointer">
                               {isFilled ? (
                                  <span className="text-sm font-bold text-green-700 truncate block max-w-xs">{formData[field.id]}</span>
                               ) : (
                                  <span className="text-sm font-medium text-gray-500">Click to upload or drag and drop</span>
                               )}
                             </div>
                           </div>
                        ) : (
                          <input 
                            type={field.type} 
                            name={field.id}
                            placeholder={field.placeholder}
                            value={formData[field.id]}
                            onChange={handleChange}
                            readOnly={field.readonly}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-opacity-50 transition-colors outline-none ${
                              field.readonly 
                                ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed' 
                                : `bg-gray-50 hover:bg-white focus:bg-white ${isFilled ? 'border-green-300' : 'border-gray-200'}`
                            } ${!field.readonly && themeColor.split(" ")[2].replace("text-", "focus:border-").replace("600", "500")}`}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <div className="pt-4 mt-8 border-t border-gray-100">
                  <Button 
                    type="submit" 
                    disabled={isLoading || completionPercentage < 100}
                    className={`w-full py-6 rounded-xl shadow-lg transition-all text-white text-base font-bold flex items-center justify-center gap-2 
                      ${completionPercentage < 100 ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none hover:bg-gray-300' : themeColor.split(" ")[0] + ' ' + themeColor.split(" ")[1]}`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Saving Profile...
                      </>
                    ) : (
                      <>
                        Complete Profile & Continue
                        <ChevronRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
