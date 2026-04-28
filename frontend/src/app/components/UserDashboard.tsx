import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Briefcase, Building2, FileCheck, LogOut, Bell, User, GraduationCap, ShieldCheck, FileText, Activity, Clock, CheckCircle, X, Loader2, Download, Share2, Award, BarChart3, Star, Sparkles, RefreshCw, CheckCircle2, Trash2, Settings, Upload, ChevronRight, ArrowLeft, Lock, MapPin, Navigation, ChevronDown, BookOpen, Bot } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { useUser } from "./UserContext";
import { AIHelpCenterPanel } from "./AIHelpCenterPanel";
import { apiFetch } from "../api";

export function UserDashboard() {
  const navigate = useNavigate();
  const { setUserRole } = useUser();
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [helpCenterTab, setHelpCenterTab] = useState("guidelines");
  const [activeService, setActiveService] = useState<string | null>(null);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [docUploadedFile, setDocUploadedFile] = useState<string | null>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch("/user/dashboard")
      .then((result) => console.log("User dashboard data:", result.data))
      .catch((error) => console.error("User dashboard API error:", error));
  }, []);

  // ── Document Verification onboarding state ──
  const DOC_STORAGE_KEY = 'docVerificationProfile';
  const DOC_TYPES = ['Aadhaar Card','PAN Card','Passport','Driving License','Voter ID','Marksheet','Degree Certificate','Experience Letter','Salary Slip','Bank Statement','Income Certificate','Address Proof'];
  const [docForm, setDocForm] = useState({ fullName: '', email: '', mobile: '' });
  const [docDocTypes, setDocDocTypes] = useState<string[]>([]);
  const [docDocTypeSearch, setDocDocTypeSearch] = useState('');
  const [docDocTypeOpen, setDocDocTypeOpen] = useState(false);
  const [docSaveInfo, setDocSaveInfo] = useState(false);
  const [docErrors, setDocErrors] = useState<Record<string,string>>({});

  const validateDocField = (name: string, value: string) => {
    if (name === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email';
    if (name === 'mobile') return /^[6-9]\d{9}$/.test(value.replace(/\s/g, '')) ? '' : 'Enter a valid 10-digit number';
    return value.trim() ? '' : 'This field is required';
  };
  const handleDocField = (name: string, value: string) => {
    setDocForm(prev => ({ ...prev, [name]: value }));
    setDocErrors(prev => ({ ...prev, [name]: validateDocField(name, value) }));
  };
  const isDocFormValid = () => ['fullName','email','mobile'].every(k => docForm[k as keyof typeof docForm].trim() !== '' && validateDocField(k, docForm[k as keyof typeof docForm]) === '') && docDocTypes.length > 0;
  const handleDocContinue = () => {
    if (!isDocFormValid()) return;
    if (docSaveInfo) localStorage.setItem(DOC_STORAGE_KEY, JSON.stringify({ ...docForm, docTypes: docDocTypes }));
    else localStorage.removeItem(DOC_STORAGE_KEY);
    navigate('/document-verification');
  };

  // ── Job Hiring form state ──
  const JOB_STORAGE_KEY = 'jobHiringProfile';
  const [jobForm, setJobForm] = useState({ fullName: '', email: '', mobile: '', skills: '', experience: '', role: '', company: '', location: '', qualification: '' });
  const [jobSaveInfo, setJobSaveInfo] = useState(false);
  const [jobErrors, setJobErrors] = useState<Record<string,string>>({});
  // When true, Full Name & Email are locked (readonly) because they were pre-filled from the registered account
  const [jobAccountFieldsLocked, setJobAccountFieldsLocked] = useState(false);

  // ── Location dropdown state ──
  const INDIA_CITIES = [
    'Bengaluru', 'Mumbai', 'Delhi', 'Noida', 'Gurugram', 'Hyderabad',
    'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Chandigarh',
    'Indore', 'Bhopal', 'Lucknow', 'Kochi', 'Coimbatore', 'Surat',
    'Nagpur', 'Vadodara', 'Patna', 'Agra', 'Nashik', 'Faridabad', 'Meerut',
  ];
  const [locationQuery, setLocationQuery]   = useState('');
  const [locationOpen,  setLocationOpen]    = useState(false);
  const [gpsLoading,    setGpsLoading]      = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  const filteredCities = locationQuery.trim()
    ? INDIA_CITIES.filter(c => c.toLowerCase().startsWith(locationQuery.toLowerCase()))
      .concat(INDIA_CITIES.filter(c => !c.toLowerCase().startsWith(locationQuery.toLowerCase()) && c.toLowerCase().includes(locationQuery.toLowerCase())))
    : INDIA_CITIES;

  const handleLocationSelect = (city: string) => {
    setJobForm(p => ({ ...p, location: city }));
    setLocationQuery(city);
    setLocationOpen(false);
  };

  const handleGPSLocation = () => {
    setGpsLoading(true);
    const SIMULATED = ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune'];
    setTimeout(() => {
      const city = SIMULATED[Math.floor(Math.random() * SIMULATED.length)];
      handleLocationSelect(city);
      setGpsLoading(false);
    }, 1200);
  };

  // Close location dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  // ── Education form state ──
  const EDU_STORAGE_KEY = 'educationSetupProfile';
  const [eduStudentType, setEduStudentType] = useState<'school'|'college'>('college');
  const [eduForm, setEduForm] = useState({ fullName: '', email: '', course: '', year: '', institution: '', subjects: '' });
  const [eduErrors, setEduErrors] = useState<Record<string,string>>({});
  const [eduClass, setEduClass] = useState('');
  const [eduBoard, setEduBoard] = useState('');
  const [eduStateBoard, setEduStateBoard] = useState('');
  const [eduStateBoardOpen, setEduStateBoardOpen] = useState(false);
  const [eduSubjectChips, setEduSubjectChips] = useState<string[]>([]);
  const [eduCollegeSubjectChips, setEduCollegeSubjectChips] = useState<string[]>([]);
  const [eduCourseOpen, setEduCourseOpen] = useState(false);
  const [eduInstOpen, setEduInstOpen] = useState(false);
  const [eduClassOpen, setEduClassOpen] = useState(false);
  const [eduBoardOpen, setEduBoardOpen] = useState(false);
  const [eduYearOpen, setEduYearOpen] = useState(false);
  const [eduSubjectInput, setEduSubjectInput] = useState('');
  const [eduSubjectOpen, setEduSubjectOpen] = useState(false);
  const [eduCity, setEduCity] = useState('');
  const [eduCityOpen, setEduCityOpen] = useState(false);
  const [eduSaveInfo, setEduSaveInfo] = useState(false);

  const EDU_COURSES = ['Engineering','Medical','Commerce','Arts / Humanities','Science','Management','Law','Pharmacy','Nursing','Computer Applications','Design','Education'];
  const EDU_CLASSES = ['Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'];
  const EDU_BOARDS = ['CBSE','ICSE','State Board','IB','Cambridge'];
  const EDU_YEARS = ['1st Year / 1st Sem','1st Year / 2nd Sem','2nd Year / 3rd Sem','2nd Year / 4th Sem','3rd Year / 5th Sem','3rd Year / 6th Sem','4th Year / 7th Sem','4th Year / 8th Sem'];
  const EDU_STATE_BOARDS = ['Andhra Pradesh State Board','Arunachal Pradesh State Board','Assam State Board','Bihar State Board','Chhattisgarh State Board','Goa State Board','Gujarat State Board','Haryana State Board','Himachal Pradesh State Board','Jharkhand State Board','Karnataka State Board','Kerala State Board','Madhya Pradesh State Board','Maharashtra State Board','Manipur State Board','Meghalaya State Board','Mizoram State Board','Nagaland State Board','Odisha State Board','Punjab State Board','Rajasthan State Board','Sikkim State Board','Tamil Nadu State Board','Telangana State Board','Tripura State Board','Uttar Pradesh State Board','Uttarakhand State Board','West Bengal State Board','Delhi Board','Jammu & Kashmir Board','Ladakh Board','Puducherry Board','Chandigarh Board'];
  const EDU_CITIES = ['Indore','Bhopal','Delhi','Mumbai','Pune','Bengaluru','Hyderabad','Chennai','Kolkata','Jaipur','Ahmedabad','Lucknow','Chandigarh','Noida','Gurugram','Kochi','Patna','Surat','Nagpur','Dehradun'];

  // Dynamic subjects based on class + board
  const getSchoolSubjects = (cls: string, board: string): string[] => {
    const n = parseInt(cls.replace('Class ',''));
    if (n >= 6 && n <= 8) return ['Mathematics','Science','English','Hindi','Social Science','Computer Science','General Knowledge','Sanskrit'];
    if (n === 9 || n === 10) return ['Mathematics','Science','English','Hindi','Social Science','Computer Applications','Artificial Intelligence','Sanskrit'];
    if (n === 11 || n === 12) {
      if (board === 'CBSE' || board === 'ICSE') return [
        'Physics','Chemistry','Mathematics','Biology','Computer Science','English','Physical Education',
        'Accountancy','Business Studies','Economics','Entrepreneurship','Informatics Practices',
        'History','Political Science','Sociology','Psychology','Geography','Hindi'
      ];
      return ['Physics','Chemistry','Mathematics','Biology','Computer Science','Accountancy','Business Studies','Economics','History','Political Science','English','Hindi'];
    }
    return ['Mathematics','Science','English','Hindi','Social Science'];
  };

  // Dynamic subjects based on college course
  const getCollegeSubjects = (course: string): string[] => {
    if (course === 'Engineering' || course === 'Computer Applications') return ['Data Structures','Algorithms','DBMS','Operating Systems','Computer Networks','Web Development','Artificial Intelligence','Machine Learning','Cloud Computing','Cyber Security','Software Engineering','Mathematics'];
    if (course === 'Medical' || course === 'Pharmacy' || course === 'Nursing') return ['Anatomy','Physiology','Biochemistry','Pathology','Pharmacology','Microbiology','Community Medicine','Nursing Fundamentals'];
    if (course === 'Commerce' || course === 'Management') return ['Accounting','Business Studies','Economics','Finance','Taxation','Auditing','Business Law','Marketing','HR Management','Business Analytics','Operations Management'];
    if (course === 'Arts / Humanities') return ['History','Political Science','Sociology','Psychology','Geography','English Literature','Economics','Hindi Literature'];
    if (course === 'Science') return ['Mathematics','Physics','Chemistry','Biology','Statistics','Environmental Science','Zoology','Botany'];
    return ['Mathematics','English','Economics','Computer Applications','Statistics','Research Methods'];
  };

  // Location-aware institution lists
  const ALL_SCHOOLS: Record<string, string[]> = {
    Indore: ['Choithram School','IPS Academy School','Delhi Public School Indore','Emerald Heights International','DPS Indore','Sagar Public School','Shri Ram School Indore'],
    Delhi: ['Delhi Public School','The Shri Ram School','DPS RK Puram','Bal Bharati Public School','Modern School'],
    Mumbai: ['Podar International School','Cathedral School','Ryan International Mumbai','St. Xavier\'s Mumbai','Bombay Scottish School'],
    Pune: ['Symbiosis School','The Bishop\'s School','DPS Pune','Podar School Pune'],
    default: ['Delhi Public School','Kendriya Vidyalaya','Jawahar Navodaya Vidyalaya','DAV Public School','St. Xavier\'s School','Ryan International School','The Shri Ram School','Podar International School','Sagar Public School','Emerald Heights International','Choithram School','IPS Academy School','St. Paul\'s School','DPS Indore','Army Public School'],
  };
  const ALL_COLLEGES: Record<string, string[]> = {
    Indore: ['IPS Academy Indore','Medicaps University','DAVV Indore','SGSITS Indore','Oriental University','Acropolis Institute','Prestige Institute Indore','Malwa Institute'],
    Delhi: ['IIT Delhi','Delhi University','Jamia Millia','JNU','IGDTUW','IP University','Amity Delhi'],
    Mumbai: ['IIT Bombay','Mumbai University','NMIMS','TISS','Somaiya College','Jai Hind College'],
    Pune: ['Symbiosis Pune','Pune University','COEP','MIT Pune','Fergusson College'],
    default: ['IIT Delhi','IIT Bombay','IIT Madras','IIT Kanpur','NIT Trichy','Delhi University','Mumbai University','Pune University','Anna University','VIT University','SRM University','Amity University','Manipal University','IPS Academy Indore','Medicaps University Indore','DAVV Indore','SGSITS Indore','LNCT Bhopal','Oriental University','Symbiosis Pune'],
  };

  const getInstSuggestions = (isSchool: boolean, city: string, query: string): string[] => {
    const cityKey = Object.keys(isSchool ? ALL_SCHOOLS : ALL_COLLEGES).find(k => k !== 'default' && city.toLowerCase().includes(k.toLowerCase())) || 'default';
    const list = (isSchool ? ALL_SCHOOLS : ALL_COLLEGES)[cityKey];
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return [...list.filter(s => s.toLowerCase().includes(q)), ...(isSchool ? ALL_SCHOOLS.default : ALL_COLLEGES.default).filter(s => s.toLowerCase().includes(q) && !list.includes(s))];
  };

  const addEduChip = (chip: string, isSchool: boolean) => {
    const t = chip.trim();
    if (!t) return;
    if (isSchool) { if (!eduSubjectChips.includes(t)) setEduSubjectChips(p => [...p, t]); }
    else { if (!eduCollegeSubjectChips.includes(t)) setEduCollegeSubjectChips(p => [...p, t]); }
    setEduSubjectInput('');
  };
  const removeEduChip = (chip: string, isSchool: boolean) => {
    if (isSchool) setEduSubjectChips(p => p.filter(s => s !== chip));
    else setEduCollegeSubjectChips(p => p.filter(s => s !== chip));
  };

  // Reset subjects when class/board/course changes
  useEffect(() => { setEduSubjectChips([]); setEduSubjectInput(''); }, [eduClass, eduBoard]);
  useEffect(() => { setEduCollegeSubjectChips([]); setEduSubjectInput(''); }, [eduForm.course]);
  useEffect(() => {
    setEduSubjectChips([]); setEduCollegeSubjectChips([]);
    setEduClass(''); setEduBoard(''); setEduStateBoard('');
    setEduForm(p => ({ ...p, course: '', year: '', institution: '' }));
    setEduSubjectInput(''); setEduCity('');
    setEduCityOpen(false); setEduStateBoardOpen(false);
  }, [eduStudentType]);

  const isEduSchoolValid = () => !!(eduForm.fullName.trim() && eduForm.email.trim() && eduCity.trim() && eduForm.institution.trim() && eduClass && eduBoard && (eduBoard !== 'State Board' || eduStateBoard) && eduSubjectChips.length > 0);
  const isEduCollegeValid = () => !!(eduForm.fullName.trim() && eduForm.email.trim() && eduCity.trim() && eduForm.institution.trim() && eduForm.course.trim() && eduForm.year.trim() && eduCollegeSubjectChips.length > 0);

  // Auto-fill registered user details when Document modal opens
  useEffect(() => {
    if (activeService === 'document') {
      const registeredName  = localStorage.getItem('userFullName') || localStorage.getItem('userName') || '';
      const registeredEmail = localStorage.getItem('userEmail') || '';
      const saved = localStorage.getItem(DOC_STORAGE_KEY);
      if (saved) {
        try {
          const p = JSON.parse(saved);
          setDocForm({ fullName: registeredName || p.fullName, email: registeredEmail || p.email, mobile: p.mobile || '' });
          setDocDocTypes(p.docTypes || []);
          setDocSaveInfo(true);
        } catch {}
      } else {
        setDocForm({ fullName: registeredName, email: registeredEmail, mobile: '' });
        setDocDocTypes([]);
        setDocSaveInfo(false);
      }
      setDocErrors({});
      setDocDocTypeSearch('');
      setDocDocTypeOpen(false);
    }
  }, [activeService]);

  // ── Loan form state ──
  const LOAN_STORAGE_KEY = 'loanSetupProfile';
  const LOAN_EMPLOYMENT_TYPES = ['Salaried', 'Self-Employed', 'Business Owner', 'Freelancer', 'Student'];
  const LOAN_PURPOSES = ['Personal Loan', 'Home Loan', 'Education Loan', 'Business Loan', 'Vehicle Loan'];
  const [loanForm, setLoanForm] = useState({ fullName: '', email: '', mobile: '', employment: '', purpose: '' });
  const [loanErrors, setLoanErrors] = useState<Record<string,string>>({});
  const [loanSaveInfo, setLoanSaveInfo] = useState(false);

  const [companySearch, setCompanySearch] = useState('');
  const [companyDropOpen, setCompanyDropOpen] = useState(false);

  const JOB_COMPANIES = ['Google','Microsoft','Amazon','Meta','Apple','Netflix','TCS','Infosys','Wipro','Accenture','Cognizant','Capgemini','Deloitte','IBM','HCL','Oracle','Adobe','Flipkart','Paytm','Zomato','Swiggy'];
  const JOB_ROLES = ['Frontend Developer','Backend Developer','Full Stack Developer','React Developer','Node.js Developer','Python Developer','Java Developer','Data Analyst','Data Scientist','UI/UX Designer','Product Designer','DevOps Engineer','QA Engineer','Software Engineer','Machine Learning Engineer','Business Analyst','HR Executive','Marketing Executive','Content Writer','Project Manager'];
  const JOB_QUALS = ['High School','Diploma','Bachelor\'s Degree','Master\'s Degree','PhD','Other'];

  const filteredCompanies = companySearch.trim()
    ? JOB_COMPANIES.filter(c => c.toLowerCase().includes(companySearch.toLowerCase()))
    : JOB_COMPANIES;

  // Auto-fill from localStorage when job modal opens
  useEffect(() => {
    if (activeService === 'job') {
      // Auto-fill registered user name & email from localStorage
      const registeredName  = localStorage.getItem('userFullName') || localStorage.getItem('userName') || '';
      const registeredEmail = localStorage.getItem('userEmail') || '';
      // Lock fields (readonly) when we have registered account data to pre-fill
      const hasAccountData = !!(registeredName || registeredEmail);

      const saved = localStorage.getItem(JOB_STORAGE_KEY);
      if (saved) {
        try {
          const p = JSON.parse(saved);
          // Always override name/email with latest registered data
          setJobForm({ ...p, fullName: registeredName || p.fullName, email: registeredEmail || p.email });
          setLocationQuery(p.location || '');
          setJobSaveInfo(true);
        } catch {}
      } else {
        // Fresh open — prefill name & email only
        setJobForm(prev => ({ ...prev, fullName: registeredName, email: registeredEmail, mobile: '', skills: '', experience: '', role: '', company: '', location: '', qualification: '' }));
        setLocationQuery('');
        setJobSaveInfo(false);
      }
      // Lock name/email fields only when account data is available
      setJobAccountFieldsLocked(hasAccountData);
      setJobErrors({});
      setCompanySearch('');
      setCompanyDropOpen(false);
      setLocationOpen(false);
    }
  }, [activeService]);

  // Auto-fill registered user name & email when Education modal opens; restore saved data
  useEffect(() => {
    if (activeService === 'education') {
      const registeredName  = localStorage.getItem('userFullName') || localStorage.getItem('userName') || '';
      const registeredEmail = localStorage.getItem('userEmail') || '';
      const saved = localStorage.getItem(EDU_STORAGE_KEY);
      if (saved) {
        try {
          const p = JSON.parse(saved);
          setEduStudentType(p.studentType || 'college');
          setEduForm(prev => ({ ...prev, fullName: registeredName || p.fullName, email: registeredEmail || p.email, institution: p.institution || '', course: p.course || '', year: p.year || '' }));
          setEduClass(p.class || '');
          setEduBoard(p.board || '');
          setEduStateBoard(p.stateBoard || '');
          setEduCity(p.city || '');
          setEduSubjectChips(p.schoolSubjects || []);
          setEduCollegeSubjectChips(p.collegeSubjects || []);
          setEduSaveInfo(true);
        } catch {}
      } else {
        setEduForm(prev => ({ ...prev, fullName: registeredName, email: registeredEmail }));
        setEduSaveInfo(false);
      }
      setEduErrors({});
    }
  }, [activeService]);

  // Auto-fill registered user name & email when Loan modal opens
  useEffect(() => {
    if (activeService === 'loan') {
      const registeredName  = localStorage.getItem('userFullName') || localStorage.getItem('userName') || '';
      const registeredEmail = localStorage.getItem('userEmail') || '';
      const saved = localStorage.getItem(LOAN_STORAGE_KEY);
      if (saved) {
        try {
          const p = JSON.parse(saved);
          setLoanForm({ ...p, fullName: registeredName || p.fullName, email: registeredEmail || p.email });
          setLoanSaveInfo(true);
        } catch {}
      } else {
        setLoanForm(prev => ({ ...prev, fullName: registeredName, email: registeredEmail, mobile: '', employment: '', purpose: '' }));
        setLoanSaveInfo(false);
      }
      setLoanErrors({});
    }
  }, [activeService]);

  const validateLoanField = (name: string, value: string) => {
    if (name === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email';
    if (name === 'mobile') return /^[6-9]\d{9}$/.test(value.replace(/\s/g, '')) ? '' : 'Enter a valid 10-digit number';
    return value.trim() ? '' : 'This field is required';
  };

  const handleLoanField = (name: string, value: string) => {
    setLoanForm(prev => ({ ...prev, [name]: value }));
    setLoanErrors(prev => ({ ...prev, [name]: validateLoanField(name, value) }));
  };

  const isLoanFormValid = () => {
    const req = ['fullName', 'email', 'mobile', 'employment', 'purpose'];
    return req.every(k => loanForm[k as keyof typeof loanForm].trim() !== '' && validateLoanField(k, loanForm[k as keyof typeof loanForm]) === '');
  };

  const handleLoanContinue = () => {
    if (!isLoanFormValid()) return;
    if (loanSaveInfo) localStorage.setItem(LOAN_STORAGE_KEY, JSON.stringify(loanForm));
    else localStorage.removeItem(LOAN_STORAGE_KEY);
    navigate('/loan-approval');
  };

  const validateEduField = (name: string, value: string) => {
    if (name === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email';
    return value.trim() ? '' : 'This field is required';
  };

  const handleEduField = (name: string, value: string) => {
    setEduForm(prev => ({ ...prev, [name]: value }));
    setEduErrors(prev => ({ ...prev, [name]: validateEduField(name, value) }));
  };

  const isEduFormValid = () => eduStudentType === 'school' ? isEduSchoolValid() : isEduCollegeValid();

  const handleEduContinue = () => {
    if (!isEduFormValid()) return;
    if (eduSaveInfo) {
      localStorage.setItem(EDU_STORAGE_KEY, JSON.stringify({ studentType: eduStudentType, fullName: eduForm.fullName, email: eduForm.email, institution: eduForm.institution, course: eduForm.course, year: eduForm.year, class: eduClass, board: eduBoard, stateBoard: eduStateBoard, city: eduCity, schoolSubjects: eduSubjectChips, collegeSubjects: eduCollegeSubjectChips }));
    } else {
      localStorage.removeItem(EDU_STORAGE_KEY);
    }
    navigate('/education-system');
  };

  const validateJobField = (name: string, value: string) => {
    if (name === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email';
    if (name === 'mobile') return /^[6-9]\d{9}$/.test(value.replace(/\s/g,'')) ? '' : 'Enter a valid 10-digit mobile number';
    if (['skills','experience','role','company','fullName'].includes(name)) return value.trim() ? '' : 'This field is required';
    return '';
  };

  const handleJobField = (name: string, value: string) => {
    setJobForm(prev => ({ ...prev, [name]: value }));
    setJobErrors(prev => ({ ...prev, [name]: validateJobField(name, value) }));
  };

  const isJobFormValid = () => {
    const req = ['fullName','email','mobile','skills','experience','role','company'];
    return req.every(k => jobForm[k as keyof typeof jobForm].trim() !== '' && validateJobField(k, jobForm[k as keyof typeof jobForm]) === '');
  };

  const handleJobContinue = () => {
    if (!isJobFormValid()) return;
    if (jobSaveInfo) localStorage.setItem(JOB_STORAGE_KEY, JSON.stringify(jobForm));
    else localStorage.removeItem(JOB_STORAGE_KEY);
    
    // Close modal immediately
    closeService();
    
    // Show success toast
    setToastMsg('Job Hiring profile completed successfully');
    setTimeout(() => setToastMsg(''), 5000);
    
    // Navigate immediately
    navigate('/job-hiring');
  };

  const openService = (key: string) => {
    setActiveService(key);
    requestAnimationFrame(() => requestAnimationFrame(() => setServiceModalVisible(true)));
  };

  const closeService = () => {
    setServiceModalVisible(false);
    setTimeout(() => setActiveService(null), 320);
  };

  const handleLogout = () => {
    setUserRole(null);
    navigate('/');
  };

  const modules = [
    {
      key: "job",
      title: "Job Hiring",
      description: "Upload your resume for AI-powered analysis and get smart job recommendations",
      icon: Briefcase,
      color: "bg-[#2563EB]",
      path: "/job-hiring",
    },
    {
      key: "loan",
      title: "Advanced Loan System",
      description: "Submit financial documents for fair, interactive, and unbiased loan assessment",
      icon: Building2,
      color: "bg-[#7C3AED]",
      path: "/loan-approval",
    },
    {
      key: "education",
      title: "Education System",
      description: "AI-powered unbiased student evaluation, smart learning recommendations.",
      icon: GraduationCap,
      color: "bg-[#14B8A6]",
      path: "/education-system",
    },
    {
      key: "document",
      title: "Document Verification",
      description: "Verify authenticity of certificates, salary slips, and medical reports",
      icon: FileCheck,
      color: "bg-[#1E3A8A]",
      path: "/document-verification",
    },
  ];

  const [activities, setActivities] = useState([
    { id: 1, type: "Job Application", status: "Under Review", date: "2 hours ago" },
    { id: 2, type: "Assignment Evaluated", status: "Completed", date: "5 hours ago" },
    { id: 3, type: "Document Verified", status: "Authentic", date: "1 day ago" },
    { id: 4, type: "Education Report Generated", status: "Pending", date: "3 days ago" },
  ]);

  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const selectedActivity = activities.find(a => a.id === selectedActivityId);
  const [detailedActivityId, setDetailedActivityId] = useState<number | null>(null);
  const detailedActivity = activities.find(a => a.id === detailedActivityId);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Notification States
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 101, title: 'Job Application submitted', time: '2h ago', read: false, icon: Briefcase, color: "text-blue-500", bg: "bg-blue-50", type: 'Job Application' },
    { id: 102, title: 'Assignment evaluated', time: '5h ago', read: false, icon: FileText, color: "text-purple-500", bg: "bg-purple-50", type: 'Assignment Evaluated' },
    { id: 103, title: 'Document verified', time: '1d ago', read: false, icon: ShieldCheck, color: "text-[#075bea]", bg: "bg-blue-50", type: 'Document Verified' },
    { id: 104, title: 'Report generated', time: '3d ago', read: false, icon: GraduationCap, color: "text-teal-500", bg: "bg-teal-50", type: 'Education Report Generated' }
  ]);
  const notificationCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notif: any) => {
    // Mark as read
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setIsNotificationsOpen(false);
    
    // Find corresponding activity to show details modal if possible (dummy matching)
    const matchedActivity = activities.find(a => a.type === notif.type);
    if (matchedActivity) {
      setSelectedActivityId(matchedActivity.id);
    } else {
      setToastMsg(`Viewing details for: ${notif.title}`);
      setTimeout(() => setToastMsg(""), 3000);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleViewDetails = (id: number) => {
     setSelectedActivityId(null);
     setIsLoadingDetails(true);
     setToastMsg("Fetching detailed report...");
     setTimeout(() => {
       setToastMsg("");
       setIsLoadingDetails(false);
       setDetailedActivityId(id);
     }, 1500);
  };

  // Simulate Pending -> Completed after 5s
  useEffect(() => {
    const pendingItem = activities.find(a => a.status === "Pending");
    if (pendingItem) {
      const timer = setTimeout(() => {
        setActivities(prev => prev.map(a => 
          a.status === "Pending" 
            ? { ...a, status: "Completed", date: "Just now" } 
            : a
        ));
        setNotifications(prev => [
          { id: Date.now(), title: 'Report generated', time: 'Just now', read: false, icon: GraduationCap, color: "text-teal-500", bg: "bg-teal-50", type: 'Education Report Generated' },
          ...prev
        ]);
        setToastMsg("Education Report is now completed!");
        setTimeout(() => setToastMsg(""), 5000);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activities]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#E6F0FF] pb-12 relative font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-30 pointer-events-none" />
      

      {/* ── Service Setup Modal Overlay ── */}
      <AnimatePresence>
        {activeService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md bg-slate-900/45"
            onClick={closeService}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
            {/* ── JOB HIRING ── */}
            {activeService === 'job' && (
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-lg">

                {/* Header */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                  <button onClick={closeService} className="absolute top-4 right-4 h-9 w-9 bg-white/15 hover:bg-white/30 active:scale-90 hover:scale-110 rounded-full flex items-center justify-center transition-all cursor-pointer z-20">
                    <X className="h-5 w-5" />
                  </button>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-white/20 rounded-xl"><Briefcase className="h-5 w-5" /></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-100">Job Hiring &amp; Recruitment System</span>
                  </div>
                  <h2 className="text-xl font-black tracking-tight mt-2">Complete Your Professional Profile</h2>
                  <p className="text-blue-100 text-sm mt-1 font-medium">AI evaluates candidates on merit, skills and experience only</p>
                </div>

                {/* Form body */}
                <div className="p-6 space-y-3 max-h-[65vh] overflow-y-auto custom-scrollbar">

                  {/* Row 1: Full Name + Email — auto-filled from registered account */}
                  {/* Account info banner shown when fields are pre-filled */}
                  {jobAccountFieldsLocked && (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                          <User className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-[11px] font-bold text-blue-700">Auto-filled from your registered account</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setJobAccountFieldsLocked(false)}
                        className="text-[10px] font-bold text-blue-500 hover:text-blue-700 underline underline-offset-2 transition-colors shrink-0 ml-2"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Full Name <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <input
                          value={jobForm.fullName}
                          onChange={e => handleJobField('fullName', e.target.value)}
                          type="text"
                          placeholder="John Doe"
                          readOnly={jobAccountFieldsLocked}
                          className={`w-full border rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none transition-all ${
                            jobAccountFieldsLocked
                              ? 'bg-blue-50/60 border-blue-200 text-blue-900 cursor-default select-all focus:ring-0'
                              : `bg-gray-50 focus:ring-2 focus:ring-blue-400/30 ${
                                  jobErrors.fullName ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
                                }`
                          }`}
                        />
                        {jobAccountFieldsLocked && (
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                            <CheckCircle className="h-3.5 w-3.5 text-blue-400" />
                          </span>
                        )}
                      </div>
                      {jobErrors.fullName && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{jobErrors.fullName}</p>}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Email <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <input
                          value={jobForm.email}
                          onChange={e => handleJobField('email', e.target.value)}
                          type="email"
                          placeholder="you@email.com"
                          readOnly={jobAccountFieldsLocked}
                          className={`w-full border rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none transition-all ${
                            jobAccountFieldsLocked
                              ? 'bg-blue-50/60 border-blue-200 text-blue-900 cursor-default select-all focus:ring-0'
                              : `bg-gray-50 focus:ring-2 focus:ring-blue-400/30 ${
                                  jobErrors.email ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
                                }`
                          }`}
                        />
                        {jobAccountFieldsLocked && (
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                            <CheckCircle className="h-3.5 w-3.5 text-blue-400" />
                          </span>
                        )}
                      </div>
                      {jobErrors.email && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{jobErrors.email}</p>}
                    </div>
                  </div>

                  {/* Row 2: Mobile */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Mobile Number <span className="text-red-400">*</span></label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-500">+91</span>
                      <input value={jobForm.mobile} onChange={e => handleJobField('mobile', e.target.value.replace(/\D/g,'').slice(0,10))} type="tel" placeholder="98765 43210" maxLength={10} className={`flex-1 bg-gray-50 border rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all ${jobErrors.mobile ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'}`} />
                    </div>
                    {jobErrors.mobile && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{jobErrors.mobile}</p>}
                  </div>

                  {/* Row 3: Skills + Experience */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Skills <span className="text-red-400">*</span></label>
                      <input value={jobForm.skills} onChange={e => handleJobField('skills', e.target.value)} type="text" placeholder="React, Python, SQL…" className={`w-full bg-gray-50 border rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all ${jobErrors.skills ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'}`} />
                      {jobErrors.skills && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{jobErrors.skills}</p>}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Experience (Yrs) <span className="text-red-400">*</span></label>
                      <input value={jobForm.experience} onChange={e => handleJobField('experience', e.target.value)} type="number" placeholder="e.g. 3" min="0" max="40" className={`w-full bg-gray-50 border rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all ${jobErrors.experience ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'}`} />
                      {jobErrors.experience && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{jobErrors.experience}</p>}
                    </div>
                  </div>

                  {/* Row 4: Preferred Role */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Preferred Role <span className="text-red-400">*</span></label>
                    <select value={jobForm.role} onChange={e => handleJobField('role', e.target.value)} className={`w-full bg-gray-50 border rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all appearance-none ${jobErrors.role ? 'border-red-300' : 'border-gray-200 focus:border-blue-400'}`}>
                      <option value="">Select a role…</option>
                      {JOB_ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>

                  {/* Row 5: Preferred Company */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Preferred Company <span className="text-red-400">*</span></label>
                    <select value={jobForm.company} onChange={e => handleJobField('company', e.target.value)} className={`w-full bg-gray-50 border rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all appearance-none ${jobErrors.company ? 'border-red-300' : 'border-gray-200 focus:border-blue-400'}`}>
                      <option value="">Select target company…</option>
                      {JOB_COMPANIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <p className="text-[10px] text-gray-400 mt-0.5">Mention the company you want to target</p>
                  </div>

                  {/* Row 6: Location + Qualification (optional) */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Smart Location Selector */}
                    <div ref={locationRef} className="relative">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Current Location <span className="text-gray-300">(optional)</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-400 pointer-events-none" />
                        <input
                          value={locationQuery}
                          onChange={e => {
                            setLocationQuery(e.target.value);
                            setJobForm(p => ({ ...p, location: e.target.value }));
                            setLocationOpen(true);
                          }}
                          onFocus={() => setLocationOpen(true)}
                          type="text"
                          placeholder="Search city…"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-14 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all"
                        />
                        {/* GPS button */}
                        <button
                          type="button"
                          onClick={handleGPSLocation}
                          disabled={gpsLoading}
                          title="Use current location"
                          className="absolute right-7 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                        >
                          {gpsLoading
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Navigation className="h-3.5 w-3.5" />}
                        </button>
                        {/* Dropdown chevron */}
                        <ChevronDown
                          onClick={() => setLocationOpen(v => !v)}
                          className={`absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 cursor-pointer transition-transform duration-200 ${locationOpen ? 'rotate-180' : ''}`}
                        />
                      </div>

                      {/* Suggestions dropdown */}
                      <AnimatePresence>
                        {locationOpen && filteredCities.length > 0 && (
                          <motion.ul
                            initial={{ opacity: 0, y: -4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-[300] left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-44 overflow-y-auto"
                          >
                            {filteredCities.slice(0, 10).map(city => (
                              <li
                                key={city}
                                onMouseDown={() => handleLocationSelect(city)}
                                className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition-colors ${
                                  jobForm.location === city
                                    ? 'bg-blue-50 text-blue-700 font-bold'
                                    : 'text-gray-700 hover:bg-gray-50 font-medium'
                                }`}
                              >
                                <MapPin className={`h-3 w-3 shrink-0 ${
                                  jobForm.location === city ? 'text-blue-500' : 'text-gray-400'
                                }`} />
                                {city}
                                {jobForm.location === city && (
                                  <CheckCircle2 className="h-3 w-3 text-blue-500 ml-auto" />
                                )}
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Highest Qualification <span className="text-gray-300">(optional)</span></label>
                      <select value={jobForm.qualification} onChange={e => setJobForm(p => ({...p, qualification: e.target.value}))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all appearance-none">
                        <option value="">Select…</option>
                        {JOB_QUALS.map(q => <option key={q}>{q}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Resume Upload */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Resume Upload <span className="text-gray-300">(optional)</span></label>
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-blue-200 rounded-xl p-3 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all group flex items-center gap-3 justify-center">
                      <Upload className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
                      <p className="text-sm font-semibold text-gray-500">{uploadedFile ?? 'Upload PDF or DOCX (max 5 MB)'}</p>
                    </div>
                    <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={e => setUploadedFile(e.target.files?.[0]?.name ?? null)} />
                  </div>

                  {/* Save Login Info */}
                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-blue-50/50 rounded-xl border border-blue-100 hover:bg-blue-50 transition-colors">
                    <div onClick={() => setJobSaveInfo(p => !p)} className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${jobSaveInfo ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}>
                      {jobSaveInfo && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">Save login info &amp; Remember my details</p>
                      <p className="text-[10px] text-gray-400 font-medium">Auto-fill fields next time you open Job Hiring setup</p>
                    </div>
                  </label>

                  {/* Continue button */}
                  <button
                    onClick={handleJobContinue}
                    disabled={!isJobFormValid()}
                    className={`w-full mt-1 font-bold rounded-xl py-3 flex items-center justify-center gap-2 transition-all ${
                      isJobFormValid()
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90 active:scale-[0.98] shadow-md shadow-blue-200 cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isJobFormValid() ? <><CheckCircle className="h-4 w-4" /> Continue to Job Hiring</> : <><Lock className="h-4 w-4" /> Fill required fields to continue</>}
                  </button>

                  <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
                    <Lock className="h-3 w-3" /> All evaluations are fully AI-driven and bias-free
                  </p>
                </div>
              </div>
            )}

            {/* ── LOAN SYSTEM ── */}
            {activeService === 'loan' && (
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

                {/* ── Header: purple-to-pink gradient ── */}
                <div className="bg-gradient-to-br from-violet-600 via-purple-500 to-pink-500 p-7 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
                  <button onClick={closeService} className="absolute top-5 right-5 h-10 w-10 bg-white/15 hover:bg-white/30 active:scale-90 hover:scale-110 rounded-full flex items-center justify-center transition-all cursor-pointer z-20">
                    <X className="h-5 w-5" />
                  </button>
                  <div className="flex items-center gap-3 mb-2 relative z-10">
                    <div className="p-2.5 bg-white/20 rounded-xl shadow-inner">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-purple-100">AI Powered Loan Recommendation System</span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight mt-2 relative z-10">Advanced Loan System</h2>
                  <p className="text-purple-100 text-sm mt-1 font-medium relative z-10">Unbiased AI assessment based on financial merit only</p>
                </div>

                {/* ── Form body ── */}
                <div className="p-7 space-y-4">

                  {/* Row 1: Full Name + Email — auto-filled */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="loan-fullName"
                          type="text"
                          value={loanForm.fullName}
                          onChange={e => handleLoanField('fullName', e.target.value)}
                          placeholder="Your full name"
                          className={`w-full bg-purple-50/60 border rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400/30 transition-all ${
                            loanErrors.fullName ? 'border-red-300 focus:border-red-400' : 'border-purple-200 focus:border-purple-400'
                          }`}
                        />
                        {loanForm.fullName && !loanErrors.fullName && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                      {loanErrors.fullName && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{loanErrors.fullName}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="loan-email"
                          type="email"
                          value={loanForm.email}
                          onChange={e => handleLoanField('email', e.target.value)}
                          placeholder="your@email.com"
                          className={`w-full bg-purple-50/60 border rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400/30 transition-all ${
                            loanErrors.email ? 'border-red-300 focus:border-red-400' : 'border-purple-200 focus:border-purple-400'
                          }`}
                        />
                        {loanForm.email && !loanErrors.email && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                      {loanErrors.email && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{loanErrors.email}</p>}
                    </div>
                  </div>

                  {/* Auto-fill notice */}
                  {(loanForm.fullName || loanForm.email) && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-100 rounded-xl">
                      <CheckCircle className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                      <p className="text-[11px] font-semibold text-purple-700">Account details auto-filled from your registered profile</p>
                    </div>
                  )}

                  {/* Row 2: Mobile Number */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                      Mobile Number <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 shrink-0">+91</span>
                      <div className="relative flex-1">
                        <input
                          id="loan-mobile"
                          type="tel"
                          value={loanForm.mobile}
                          onChange={e => handleLoanField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="98765 43210"
                          maxLength={10}
                          className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400/30 transition-all ${
                            loanErrors.mobile ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-purple-400'
                          }`}
                        />
                        {loanForm.mobile && !loanErrors.mobile && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                    {loanErrors.mobile && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{loanErrors.mobile}</p>}
                  </div>

                  {/* Row 3: Employment Type + Loan Purpose */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                        Employment Type <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="loan-employment"
                        value={loanForm.employment}
                        onChange={e => handleLoanField('employment', e.target.value)}
                        className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400/30 transition-all appearance-none ${
                          loanErrors.employment ? 'border-red-300' : 'border-gray-200 focus:border-purple-400'
                        }`}
                      >
                        <option value="">Select type…</option>
                        {LOAN_EMPLOYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                      {loanErrors.employment && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{loanErrors.employment}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                        Loan Purpose <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="loan-purpose"
                        value={loanForm.purpose}
                        onChange={e => handleLoanField('purpose', e.target.value)}
                        className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400/30 transition-all appearance-none ${
                          loanErrors.purpose ? 'border-red-300' : 'border-gray-200 focus:border-purple-400'
                        }`}
                      >
                        <option value="">Select purpose…</option>
                        {LOAN_PURPOSES.map(p => <option key={p}>{p}</option>)}
                      </select>
                      {loanErrors.purpose && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{loanErrors.purpose}</p>}
                    </div>
                  </div>

                  {/* Save details toggle */}
                  <label className="flex items-center gap-3 cursor-pointer p-3.5 bg-purple-50/60 rounded-xl border border-purple-100 hover:bg-purple-50 transition-colors">
                    <div
                      onClick={() => setLoanSaveInfo(p => !p)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                        loanSaveInfo ? 'bg-purple-500 border-purple-500' : 'bg-white border-gray-300'
                      }`}
                    >
                      {loanSaveInfo && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">Remember my details for next time</p>
                      <p className="text-[10px] text-gray-400 font-medium">Auto-fill these fields next time you open Loan setup</p>
                    </div>
                  </label>

                  {/* Continue button — gated */}
                  <button
                    onClick={handleLoanContinue}
                    disabled={!isLoanFormValid()}
                    className={`w-full mt-1 font-bold rounded-xl py-3 flex items-center justify-center gap-2 transition-all ${
                      isLoanFormValid()
                        ? 'bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 text-white hover:opacity-90 active:scale-[0.98] shadow-md shadow-purple-200 cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isLoanFormValid()
                      ? <><CheckCircle className="h-4 w-4" /> Continue to Loan System</>
                      : <><Lock className="h-4 w-4" /> Fill required fields to continue</>}
                  </button>

                  <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                    <Lock className="h-3 w-3" /> Your financial data is encrypted and processed anonymously
                  </p>
                </div>
              </div>
            )}

            {/* ── EDUCATION SYSTEM ── */}
            {activeService === 'education' && (
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Header — unchanged teal gradient */}
                <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-7 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                  <button onClick={closeService} className="absolute top-5 right-5 h-10 w-10 bg-white/15 hover:bg-white/30 active:scale-90 hover:scale-110 rounded-full flex items-center justify-center transition-all cursor-pointer z-20">
                    <X className="h-5 w-5" />
                  </button>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-teal-100">Education Evaluation System</span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight mt-3">Student Academic Profile</h2>
                  <p className="text-teal-100 text-sm mt-1 font-medium">Fair AI evaluation based purely on academic performance</p>
                </div>

                {/* Form body */}
                <div className="p-7 space-y-4">

                  {/* ── AUTO-FILLED: Full Name + Email ── */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="edu-fullName"
                          type="text"
                          value={eduForm.fullName}
                          onChange={e => handleEduField('fullName', e.target.value)}
                          placeholder="Your full name"
                          className={`w-full bg-teal-50/60 border rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all ${
                            eduErrors.fullName ? 'border-red-300 focus:border-red-400' : 'border-teal-200 focus:border-teal-400'
                          }`}
                        />
                        {eduForm.fullName && !eduErrors.fullName && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500 text-xs font-bold flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                      {eduErrors.fullName && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{eduErrors.fullName}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="edu-email"
                          type="email"
                          value={eduForm.email}
                          onChange={e => handleEduField('email', e.target.value)}
                          placeholder="your@email.com"
                          className={`w-full bg-teal-50/60 border rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all ${
                            eduErrors.email ? 'border-red-300 focus:border-red-400' : 'border-teal-200 focus:border-teal-400'
                          }`}
                        />
                        {eduForm.email && !eduErrors.email && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                      {eduErrors.email && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{eduErrors.email}</p>}
                    </div>
                  </div>

                  {/* Auto-fill notice badge */}
                  {(eduForm.fullName || eduForm.email) && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-100 rounded-xl">
                      <CheckCircle className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                      <p className="text-[11px] font-semibold text-teal-700">Account details auto-filled from your registered profile</p>
                    </div>
                  )}

                  {/* ── Student Type Toggle ── */}
                  <div className="flex gap-1.5 bg-gray-100 p-1.5 rounded-xl">
                    {(['school','college'] as const).map(type => (
                      <button key={type} type="button"
                        onClick={() => { setEduStudentType(type); setEduSubjectInput(''); setEduSubjectOpen(false); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                          eduStudentType === type
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md'
                            : 'text-gray-500 hover:bg-white/60'
                        }`}>
                        {type === 'school' ? <BookOpen className="h-4 w-4"/> : <GraduationCap className="h-4 w-4"/>}
                        {type === 'school' ? 'School Student' : 'College Student'}
                      </button>
                    ))}
                  </div>

                  {/* ── City (searchable dropdown) ── */}
                  <div className="relative">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Your City <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <input type="text" value={eduCity}
                        onChange={e => { setEduCity(e.target.value); setEduCityOpen(true); }}
                        onFocus={() => setEduCityOpen(true)}
                        onBlur={() => setTimeout(() => setEduCityOpen(false), 180)}
                        placeholder="Search or type your city..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all pr-8"
                      />
                      <ChevronDown onClick={() => setEduCityOpen(v => !v)} className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer transition-transform ${eduCityOpen ? 'rotate-180 text-teal-500' : ''}`}/>
                    </div>
                    {eduCityOpen && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-44 overflow-y-auto">
                        {EDU_CITIES.filter(c => c.toLowerCase().includes(eduCity.toLowerCase())).map(city => (
                          <button key={city} type="button" onMouseDown={() => { setEduCity(city); setEduCityOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between ${
                              eduCity === city ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}>
                            {city}{eduCity === city && <CheckCircle className="h-3.5 w-3.5 text-teal-500 shrink-0"/>}
                          </button>
                        ))}
                        {eduCity.trim() && !EDU_CITIES.some(c => c.toLowerCase() === eduCity.toLowerCase()) && (
                          <div className="px-4 py-2.5 text-xs text-gray-400 italic border-t border-gray-100">Custom city "{eduCity}" will be used</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Institution / School Name ── */}
                  <div className="relative">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                      {eduStudentType === 'school' ? 'School Name' : 'College / University Name'} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input type="text"
                        value={eduForm.institution}
                        onChange={e => { handleEduField('institution', e.target.value); setEduInstOpen(true); }}
                        onFocus={() => setEduInstOpen(true)}
                        onBlur={() => setTimeout(() => setEduInstOpen(false), 180)}
                        placeholder={eduStudentType === 'school' ? 'Search or type your school...' : 'Search or type your college...'}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all pr-8"
                      />
                      <ChevronDown onClick={() => setEduInstOpen(v => !v)} className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer transition-transform ${eduInstOpen ? 'rotate-180 text-teal-500' : ''}`}/>
                    </div>
                    {eduInstOpen && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {eduCity.trim() && (
                          <div className="px-4 py-2 text-[11px] font-bold text-teal-600 uppercase tracking-wider bg-teal-50 border-b border-teal-100">
                            📍 Showing suggestions near {eduCity}
                          </div>
                        )}
                        {getInstSuggestions(eduStudentType === 'school', eduCity, eduForm.institution).slice(0, 12).map(opt => (
                          <button key={opt} type="button" onMouseDown={() => { handleEduField('institution', opt); setEduInstOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between ${
                              eduForm.institution === opt ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}>
                            {opt}
                            {eduForm.institution === opt && <CheckCircle className="h-3.5 w-3.5 text-teal-500 shrink-0"/>}
                          </button>
                        ))}
                        {eduForm.institution.trim() && !getInstSuggestions(eduStudentType === 'school', eduCity, eduForm.institution).some(o => o.toLowerCase() === eduForm.institution.toLowerCase()) && (
                          <div className="px-4 py-2.5 text-xs text-gray-400 border-t border-gray-100 italic">Custom entry: "{eduForm.institution}" will be saved</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── SCHOOL: Class + Board ── */}
                  {eduStudentType === 'school' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Class / Grade <span className="text-red-400">*</span></label>
                        <div className="relative">
                          <button type="button" onClick={() => setEduClassOpen(v => !v)}
                            className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm font-medium text-left flex items-center justify-between transition-all ${
                              eduClassOpen ? 'border-teal-400 ring-2 ring-teal-400/20' : eduClass ? 'border-teal-300' : 'border-gray-200'
                            }`}>
                            <span className={eduClass ? 'text-gray-800' : 'text-gray-400'}>{eduClass || 'Select class...'}</span>
                            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${eduClassOpen ? 'rotate-180 text-teal-500' : ''}`}/>
                          </button>
                        </div>
                        {eduClassOpen && (
                          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-44 overflow-y-auto">
                            {EDU_CLASSES.map(c => (
                              <button key={c} type="button" onMouseDown={() => { setEduClass(c); setEduClassOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between ${
                                  eduClass === c ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                                }`}>
                                {c}{eduClass === c && <CheckCircle className="h-3.5 w-3.5 text-teal-500 shrink-0"/>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Board <span className="text-red-400">*</span></label>
                        <div className="relative">
                          <button type="button" onClick={() => setEduBoardOpen(v => !v)}
                            className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm font-medium text-left flex items-center justify-between transition-all ${
                              eduBoardOpen ? 'border-teal-400 ring-2 ring-teal-400/20' : eduBoard ? 'border-teal-300' : 'border-gray-200'
                            }`}>
                            <span className={eduBoard ? 'text-gray-800' : 'text-gray-400'}>{eduBoard || 'Select board...'}</span>
                            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${eduBoardOpen ? 'rotate-180 text-teal-500' : ''}`}/>
                          </button>
                        </div>
                        {eduBoardOpen && (
                          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-44 overflow-y-auto">
                            {EDU_BOARDS.map(b => (
                              <button key={b} type="button" onMouseDown={() => { setEduBoard(b); setEduBoardOpen(false); if (b !== 'State Board') setEduStateBoard(''); }}
                                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between ${
                                  eduBoard === b ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                                }`}>
                                {b}{eduBoard === b && <CheckCircle className="h-3.5 w-3.5 text-teal-500 shrink-0"/>}
                              </button>
                            ))}
                          </div>
                        )}
                        {/* State Board selector */}
                        {eduBoard === 'State Board' && (
                          <div className="relative mt-2">
                            <button type="button" onClick={() => setEduStateBoardOpen(v => !v)}
                              className={`w-full bg-teal-50 border rounded-xl px-4 py-2.5 text-sm font-medium text-left flex items-center justify-between transition-all ${
                                eduStateBoardOpen ? 'border-teal-400 ring-2 ring-teal-400/20' : eduStateBoard ? 'border-teal-300' : 'border-teal-200'
                              }`}>
                              <span className={eduStateBoard ? 'text-gray-800' : 'text-teal-500 font-medium'}>{eduStateBoard || 'Select State Board…'}</span>
                              <ChevronDown className={`h-4 w-4 text-teal-400 transition-transform ${eduStateBoardOpen ? 'rotate-180' : ''}`}/>
                            </button>
                            {eduStateBoardOpen && (
                              <div className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-44 overflow-y-auto">
                                {EDU_STATE_BOARDS.map(sb => (
                                  <button key={sb} type="button" onMouseDown={() => { setEduStateBoard(sb); setEduStateBoardOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors flex items-center justify-between ${
                                      eduStateBoard === sb ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                                    }`}>
                                    {sb}{eduStateBoard === sb && <CheckCircle className="h-3.5 w-3.5 text-teal-500 shrink-0"/>}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── COLLEGE: Course + Year ── */}
                  {eduStudentType === 'college' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Course / Stream <span className="text-red-400">*</span></label>
                        <div className="relative">
                          <input type="text" value={eduForm.course}
                            onChange={e => { handleEduField('course', e.target.value); setEduCourseOpen(true); }}
                            onFocus={() => setEduCourseOpen(true)}
                            placeholder="Select course..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all pr-8"
                          />
                          <ChevronDown onClick={() => setEduCourseOpen(v => !v)} className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer transition-transform ${eduCourseOpen ? 'rotate-180 text-teal-500' : ''}`}/>
                        </div>
                        {eduCourseOpen && (
                          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-44 overflow-y-auto">
                            {EDU_COURSES.filter(o => o.toLowerCase().includes(eduForm.course.toLowerCase())).map(opt => (
                              <button key={opt} type="button" onMouseDown={() => { handleEduField('course', opt); setEduCourseOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between ${
                                  eduForm.course === opt ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                                }`}>
                                {opt}{eduForm.course === opt && <CheckCircle className="h-3.5 w-3.5 text-teal-500 shrink-0"/>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Year / Semester <span className="text-red-400">*</span></label>
                        <div className="relative">
                          <button type="button" onClick={() => setEduYearOpen(v => !v)}
                            className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm font-medium text-left flex items-center justify-between transition-all ${
                              eduYearOpen ? 'border-teal-400 ring-2 ring-teal-400/20' : eduForm.year ? 'border-teal-300' : 'border-gray-200'
                            }`}>
                            <span className={`text-sm truncate ${eduForm.year ? 'text-gray-800' : 'text-gray-400'}`}>{eduForm.year || 'Select...'}</span>
                            <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${eduYearOpen ? 'rotate-180 text-teal-500' : ''}`}/>
                          </button>
                        </div>
                        {eduYearOpen && (
                          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-44 overflow-y-auto">
                            {EDU_YEARS.map(y => (
                              <button key={y} type="button" onMouseDown={() => { handleEduField('year', y); setEduYearOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between ${
                                  eduForm.year === y ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                                }`}>
                                {y}{eduForm.year === y && <CheckCircle className="h-3.5 w-3.5 text-teal-500 shrink-0"/>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Subject Preference (multi-select chips) ── */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Subject Preference <span className="text-red-400">*</span></label>
                    <div
                      className={`w-full bg-gray-50 border rounded-xl px-3 py-2 flex flex-wrap gap-1.5 min-h-[46px] cursor-text transition-all ${
                        eduSubjectOpen ? 'border-teal-400 ring-2 ring-teal-400/20' : (eduStudentType==='school'?eduSubjectChips:eduCollegeSubjectChips).length > 0 ? 'border-teal-300' : 'border-gray-200'
                      }`}
                      onClick={() => setEduSubjectOpen(true)}
                    >
                      {(eduStudentType==='school' ? eduSubjectChips : eduCollegeSubjectChips).map(chip => (
                        <span key={chip} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800 text-[11px] font-bold leading-none">
                          {chip}
                          <button type="button" onMouseDown={e => { e.stopPropagation(); removeEduChip(chip, eduStudentType==='school'); }}
                            className="hover:text-rose-500 transition-colors ml-0.5"><X className="h-3 w-3"/></button>
                        </span>
                      ))}
                      <input
                        value={eduSubjectInput}
                        onChange={e => { setEduSubjectInput(e.target.value); setEduSubjectOpen(true); }}
                        onFocus={() => setEduSubjectOpen(true)}
                        onBlur={() => setTimeout(() => setEduSubjectOpen(false), 200)}
                        onKeyDown={e => {
                          if (e.key==='Enter' && eduSubjectInput.trim()) { e.preventDefault(); addEduChip(eduSubjectInput, eduStudentType==='school'); }
                          if (e.key==='Backspace' && !eduSubjectInput) {
                            if (eduStudentType==='school' && eduSubjectChips.length) removeEduChip(eduSubjectChips[eduSubjectChips.length-1], true);
                            else if (eduStudentType==='college' && eduCollegeSubjectChips.length) removeEduChip(eduCollegeSubjectChips[eduCollegeSubjectChips.length-1], false);
                          }
                        }}
                        placeholder={(eduStudentType==='school'?eduSubjectChips:eduCollegeSubjectChips).length===0 ? 'Search & select subjects...' : 'Add more...'}
                        className="flex-1 min-w-[120px] outline-none bg-transparent text-sm font-medium text-gray-800 placeholder:text-gray-400 py-0.5"
                      />
                      <ChevronDown className={`h-4 w-4 self-center text-gray-400 shrink-0 transition-transform ${eduSubjectOpen ? 'rotate-180 text-teal-500' : ''}`}/>
                    </div>
                    {eduSubjectOpen && (() => {
                      const dynSubjects = eduStudentType === 'school'
                        ? getSchoolSubjects(eduClass, eduBoard)
                        : getCollegeSubjects(eduForm.course);
                      const activeChips = eduStudentType === 'school' ? eduSubjectChips : eduCollegeSubjectChips;
                      const filtered = dynSubjects.filter(o => o.toLowerCase().includes(eduSubjectInput.toLowerCase()) && !activeChips.includes(o));
                      return (
                        <div className="relative z-50">
                          <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                            {eduStudentType === 'school' && eduClass && (
                              <div className="px-4 py-2 text-[11px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 border-b border-indigo-100">
                                {eduClass}{eduBoard ? ` · ${eduBoard}` : ''} subjects
                              </div>
                            )}
                            {eduStudentType === 'college' && eduForm.course && (
                              <div className="px-4 py-2 text-[11px] font-bold text-teal-600 uppercase tracking-wider bg-teal-50 border-b border-teal-100">
                                {eduForm.course} subjects
                              </div>
                            )}
                            {filtered.length === 0 && !eduSubjectInput && (
                              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                                {eduStudentType === 'school' && !eduClass ? 'Select class first to see subjects' : 'All subjects selected'}
                              </div>
                            )}
                            {filtered.map(opt => (
                              <button key={opt} type="button" onMouseDown={() => addEduChip(opt, eduStudentType==='school')}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">{opt}</button>
                            ))}
                            {eduSubjectInput.trim() && !dynSubjects.some(o => o.toLowerCase() === eduSubjectInput.toLowerCase()) && (
                              <button type="button" onMouseDown={() => addEduChip(eduSubjectInput, eduStudentType==='school')}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors flex items-center gap-2">
                                <span className="text-xs bg-teal-100 px-1.5 py-0.5 rounded font-bold">+ Add</span>"{eduSubjectInput}"
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Save info checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-teal-50/50 rounded-xl border border-teal-100 hover:bg-teal-50 transition-colors">
                    <div onClick={() => setEduSaveInfo(p => !p)} className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${eduSaveInfo ? 'bg-teal-500 border-teal-500' : 'bg-white border-gray-300'}`}>
                      {eduSaveInfo && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">Save my academic details for next time</p>
                      <p className="text-[10px] text-gray-400 font-medium">Auto-fill this information when I open Education setup again</p>
                    </div>
                  </label>

                  {/* Continue button — gated on all required fields */}
                  <button
                    onClick={handleEduContinue}
                    disabled={!isEduFormValid()}
                    className={`w-full mt-2 font-bold rounded-xl py-3 flex items-center justify-center gap-2 transition-all ${
                      isEduFormValid()
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:opacity-90 active:scale-[0.98] shadow-md shadow-teal-200 cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isEduFormValid()
                      ? <><CheckCircle className="h-4 w-4" /> Continue to Education System</>
                      : <><Lock className="h-4 w-4" /> Fill required fields to continue</>}
                  </button>

                  <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                    <Lock className="h-3 w-3" /> AI evaluates performance anonymously without bias
                  </p>
                </div>
              </div>
            )}

            {/* ── DOCUMENT VERIFICATION ── */}
            {activeService === 'document' && (
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-br from-[#0f172a] via-[#123b7a] to-[#075bea] p-7 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                  <button onClick={closeService} className="absolute top-5 right-5 h-10 w-10 bg-white/15 hover:bg-white/30 active:scale-90 hover:scale-110 rounded-full flex items-center justify-center transition-all cursor-pointer z-20">
                    <X className="h-5 w-5" />
                  </button>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-white/20 rounded-xl"><FileCheck className="h-5 w-5" /></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-100">Document Verification System</span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight mt-3">Verification Setup</h2>
                  <p className="text-blue-100 text-sm mt-1 font-medium">Tell us who you are before we verify your document</p>
                </div>

                {/* Form body */}
                <div className="p-7 space-y-4">

                  {/* Row 1: Full Name + Email */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Full Name <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <input id="doc-fullName" type="text"
                          value={docForm.fullName}
                          onChange={e => handleDocField('fullName', e.target.value)}
                          placeholder="Your full name"
                          className={`w-full bg-blue-50/50 border rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all ${
                            docErrors.fullName ? 'border-red-300' : 'border-blue-200 focus:border-[#075bea]'
                          }`}
                        />
                        {docForm.fullName && !docErrors.fullName && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#075bea]"><CheckCircle className="h-3.5 w-3.5" /></span>
                        )}
                      </div>
                      {docErrors.fullName && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{docErrors.fullName}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Email Address <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <input id="doc-email" type="email"
                          value={docForm.email}
                          onChange={e => handleDocField('email', e.target.value)}
                          placeholder="your@email.com"
                          className={`w-full bg-blue-50/50 border rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all ${
                            docErrors.email ? 'border-red-300' : 'border-blue-200 focus:border-[#075bea]'
                          }`}
                        />
                        {docForm.email && !docErrors.email && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#075bea]"><CheckCircle className="h-3.5 w-3.5" /></span>
                        )}
                      </div>
                      {docErrors.email && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{docErrors.email}</p>}
                    </div>
                  </div>

                  {/* Auto-fill notice */}
                  {(docForm.fullName || docForm.email) && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl">
                      <CheckCircle className="h-3.5 w-3.5 text-[#075bea] shrink-0" />
                      <p className="text-[11px] font-semibold text-blue-800">Account details auto-filled from your registered profile</p>
                    </div>
                  )}

                  {/* Row 2: Mobile Number */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Mobile Number <span className="text-red-400">*</span></label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 shrink-0">+91</span>
                      <div className="relative flex-1">
                        <input id="doc-mobile" type="tel"
                          value={docForm.mobile}
                          onChange={e => handleDocField('mobile', e.target.value.replace(/\D/g,'').slice(0,10))}
                          placeholder="98765 43210" maxLength={10}
                          className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all ${
                            docErrors.mobile ? 'border-red-300' : 'border-gray-200 focus:border-[#075bea]'
                          }`}
                        />
                        {docForm.mobile && !docErrors.mobile && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#075bea]"><CheckCircle className="h-3.5 w-3.5" /></span>
                        )}
                      </div>
                    </div>
                    {docErrors.mobile && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{docErrors.mobile}</p>}
                  </div>

                  {/* Row 3: Document Types — multi-select chips */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Document Type to Verify <span className="text-red-400">*</span></label>
                    <div
                      className={`w-full bg-gray-50 border rounded-xl px-3 py-2 flex flex-wrap gap-1.5 min-h-[46px] cursor-text transition-all ${
                        docDocTypeOpen ? 'border-[#075bea] ring-2 ring-blue-400/20' : docDocTypes.length > 0 ? 'border-blue-300' : 'border-gray-200'
                      }`}
                      onClick={() => setDocDocTypeOpen(true)}
                    >
                      {docDocTypes.map(dt => (
                        <span key={dt} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-[11px] font-bold leading-none">
                          {dt}
                          <button type="button" onMouseDown={e => { e.stopPropagation(); setDocDocTypes(p => p.filter(d => d !== dt)); }} className="hover:text-rose-500 transition-colors ml-0.5"><X className="h-3 w-3"/></button>
                        </span>
                      ))}
                      <input
                        value={docDocTypeSearch}
                        onChange={e => { setDocDocTypeSearch(e.target.value); setDocDocTypeOpen(true); }}
                        onFocus={() => setDocDocTypeOpen(true)}
                        onBlur={() => setTimeout(() => setDocDocTypeOpen(false), 200)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && docDocTypeSearch.trim() && !DOC_TYPES.includes(docDocTypeSearch.trim())) {
                            e.preventDefault();
                            if (!docDocTypes.includes(docDocTypeSearch.trim())) setDocDocTypes(p => [...p, docDocTypeSearch.trim()]);
                            setDocDocTypeSearch('');
                          }
                        }}
                        placeholder={docDocTypes.length === 0 ? 'Search & select document types...' : 'Add more...'}
                        className="flex-1 min-w-[140px] outline-none bg-transparent text-sm font-medium text-gray-800 placeholder:text-gray-400 py-0.5"
                      />
                      <ChevronDown className={`h-4 w-4 self-center text-gray-400 shrink-0 transition-transform ${docDocTypeOpen ? 'rotate-180 text-[#075bea]' : ''}`}/>
                    </div>
                    {docDocTypeOpen && (() => {
                      const filtered = DOC_TYPES.filter(t => t.toLowerCase().includes(docDocTypeSearch.toLowerCase()) && !docDocTypes.includes(t));
                      return (
                        <div className="relative z-50">
                          <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                            {filtered.map(opt => (
                              <button key={opt} type="button" onMouseDown={() => { setDocDocTypes(p => [...p, opt]); setDocDocTypeSearch(''); }}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                {opt}
                                {docDocTypes.includes(opt) && <CheckCircle className="h-3.5 w-3.5 text-[#075bea] shrink-0"/>}
                              </button>
                            ))}
                            {filtered.length === 0 && docDocTypeSearch.trim() && (
                              <div className="px-4 py-2.5 text-xs text-gray-400 italic">Press Enter to add "{docDocTypeSearch}" as custom type</div>
                            )}
                            {filtered.length === 0 && !docDocTypeSearch.trim() && (
                              <div className="px-4 py-3 text-sm text-gray-400 text-center">All document types selected</div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                    {docDocTypes.length > 0 && (
                      <p className="text-[11px] text-[#075bea] font-semibold mt-1.5 flex items-center gap-1.5">
                        <CheckCircle className="h-3 w-3" />
                        {docDocTypes.length === 1
                          ? `You'll upload your ${docDocTypes[0]} on the next page.`
                          : `You'll upload ${docDocTypes.slice(0,-1).join(', ')} and ${docDocTypes[docDocTypes.length-1]} on the next page.`}
                      </p>
                    )}
                  </div>

                  {/* Save details toggle */}
                  <label className="flex items-center gap-3 cursor-pointer p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 hover:bg-blue-50 transition-colors">
                    <div onClick={() => setDocSaveInfo(p => !p)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                        docSaveInfo ? 'bg-[#075bea] border-[#075bea]' : 'bg-white border-gray-300'
                      }`}>
                      {docSaveInfo && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">Save my details for next time</p>
                      <p className="text-[10px] text-gray-400 font-medium">Auto-fill these fields when you return</p>
                    </div>
                  </label>

                  {/* Info notice */}
                  <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <FileCheck className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-blue-700 leading-relaxed">
                      Document upload, AI verification, confidence score, and tamper detection happen on the <strong>next page</strong> after you continue.
                    </p>
                  </div>

                  {/* Continue button */}
                  <button
                    onClick={handleDocContinue}
                    disabled={!isDocFormValid()}
                    className={`w-full mt-1 font-bold rounded-xl py-3 flex items-center justify-center gap-2 transition-all ${
                      isDocFormValid()
                        ? 'bg-gradient-to-r from-[#0f172a] to-[#075bea] text-white hover:opacity-90 active:scale-[0.98] shadow-md shadow-blue-200 cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isDocFormValid()
                      ? <><CheckCircle className="h-4 w-4" /> Continue to Verification</>
                      : <><Lock className="h-4 w-4" /> Fill required fields to continue</>}
                  </button>

                  <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                    <Lock className="h-3 w-3" /> Documents are verified using tamper-proof AI analysis
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 font-medium text-sm"
          >
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Details Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
            onClick={() => setSelectedActivityId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedActivity.type}</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">{selectedActivity.date}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedActivityId(null)} className="h-8 w-8 rounded-full -mr-2 -mt-2 text-gray-500 hover:bg-gray-100">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-2">
                  {selectedActivity.status === "Under Review" && (
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="text-amber-700">In Progress</span>
                        <span className="text-gray-900">60%</span>
                      </div>
                      <Progress value={60} className="h-2.5 bg-amber-100 [&>div]:bg-amber-500" />
                      <p className="text-sm text-amber-800 font-medium mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 text-center flex flex-col items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-600 mb-1" />
                        Expected response within 24 hours
                      </p>
                    </div>
                  )}

                  {selectedActivity.status === "Completed" && (
                    <div className="space-y-4 text-center">
                      <div className="mx-auto w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-7 w-7 text-emerald-600" />
                      </div>
                      <p className="text-slate-800 font-bold mb-1 px-4">Result has been successfully evaluated.</p>
                      <p className="text-slate-500 text-sm mb-6 pb-2">All checks passed with no warnings.</p>
                      <Button onClick={() => handleViewDetails(selectedActivity.id)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 font-bold shadow-md transition-all active:scale-95">
                        <BarChart3 className="w-4 h-4 mr-2" /> View Detailed Analysis
                      </Button>
                    </div>
                  )}

                  {selectedActivity.status === "Authentic" && (
                    <div className="space-y-4 text-center">
                      <div className="mx-auto w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-100">
                        <ShieldCheck className="h-7 w-7 text-[#075bea]" />
                      </div>
                      <p className="text-[#0f172a] font-bold mb-2 text-lg">Document successfully verified</p>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left mt-6">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Verification ID</span>
                          <span className="font-bold text-slate-800 text-sm font-mono bg-slate-200/50 px-2 py-0.5 rounded">VER-12345</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Verified At</span>
                          <span className="font-semibold text-slate-700 text-sm">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedActivity.status === "Pending" && (
                    <div className="space-y-5 text-center py-4">
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                        <Loader2 className="absolute inset-0 m-auto h-6 w-6 text-blue-600 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold text-base mb-1">Your report is being generated</p>
                        <p className="text-sm text-slate-500 font-medium">Please wait while our system analyzes properties...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
         {isLoadingDetails && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
               <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-2xl shadow-2xl">
                  <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                  <p className="text-sm font-bold text-gray-800">Compiling your insight report...</p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Detailed Result View Modal */}
      <AnimatePresence>
        {detailedActivity && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 overflow-y-auto"
            onClick={() => setDetailedActivityId(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-gray-50 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Badge variant="outline" className="mb-3 bg-indigo-50 text-indigo-700 border-indigo-200">Detailed Analytics</Badge>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{detailedActivity.type}</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">{detailedActivity.date}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setDetailedActivityId(null)} className="h-10 w-10 rounded-full bg-white text-gray-500 hover:bg-gray-100 shadow-sm border border-gray-100">
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {detailedActivity.type === "Assignment Evaluated" && (
                   <div className="space-y-6">
                      {/* Evaluation Summary */}
                      <div className="grid grid-cols-3 gap-4">
                         <Card className="border border-indigo-100 bg-white shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-4 text-center">
                               <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Score</p>
                               <div className="flex items-end justify-center gap-1">
                                  <span className="text-3xl font-black text-indigo-600">85</span>
                                  <span className="text-sm font-bold text-gray-400 mb-1">/100</span>
                               </div>
                            </CardContent>
                         </Card>
                         <Card className="border border-amber-100 bg-white shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-4 text-center">
                               <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Grade</p>
                               <span className="text-3xl font-black text-amber-500">A</span>
                            </CardContent>
                         </Card>
                         <Card className="border border-emerald-100 bg-white shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-4 text-center">
                               <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Status</p>
                               <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shadow-none border-0 px-3 py-1">Completed</Badge>
                            </CardContent>
                         </Card>
                      </div>

                      {/* Section Breakdown & Feedback grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-blue-500" /> Section Breakdown</h3>
                            <div className="space-y-4">
                               <div>
                                  <div className="flex justify-between text-xs font-bold text-gray-600 mb-1.5"><span>Content Accuracy</span><span className="text-blue-600">9/10</span></div>
                                  <Progress value={90} className="h-2 bg-gray-100 [&>div]:bg-blue-500" />
                               </div>
                               <div>
                                  <div className="flex justify-between text-xs font-bold text-gray-600 mb-1.5"><span>Structure & Flow</span><span className="text-amber-500">8/10</span></div>
                                  <Progress value={80} className="h-2 bg-gray-100 [&>div]:bg-amber-500" />
                               </div>
                               <div>
                                  <div className="flex justify-between text-xs font-bold text-gray-600 mb-1.5"><span>Grammar</span><span className="text-emerald-500">9/10</span></div>
                                  <Progress value={90} className="h-2 bg-gray-100 [&>div]:bg-emerald-500" />
                               </div>
                            </div>
                         </div>

                         <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100 shadow-sm">
                            <h3 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-600" /> AI Feedback</h3>
                            <ul className="space-y-3">
                               <li className="flex items-start gap-2.5 text-sm font-medium text-indigo-800/80 leading-relaxed">
                                  <span className="text-emerald-500 shrink-0 mt-0.5">●</span> Strong conceptual clarity
                               </li>
                               <li className="flex items-start gap-2.5 text-sm font-medium text-indigo-800/80 leading-relaxed">
                                  <span className="text-amber-500 shrink-0 mt-0.5">●</span> Improve structure in introduction
                               </li>
                               <li className="flex items-start gap-2.5 text-sm font-medium text-indigo-800/80 leading-relaxed">
                                  <span className="text-blue-500 shrink-0 mt-0.5">●</span> Minor grammar improvements needed
                               </li>
                            </ul>
                         </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                         <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-bold shadow-md"><Download className="h-4 w-4 mr-2"/> Download Report</Button>
                         <Button variant="outline" className="flex-1 bg-white border-gray-300 rounded-xl h-12 font-bold shadow-sm text-gray-700 hover:bg-gray-50"><RefreshCw className="h-4 w-4 mr-2"/> Re-evaluate</Button>
                      </div>
                   </div>
                )}

                {detailedActivity.type === "Education Report Generated" && (
                   <div className="space-y-6">
                      <div className="flex items-center gap-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-[0.03]"><Award className="w-48 h-48" /></div>
                         <div className="relative z-10 w-24 h-24 rounded-full border-[6px] border-emerald-50 flex items-center justify-center shrink-0 shadow-inner">
                            <div className="absolute inset-0 border-4 border-emerald-400 rounded-full border-t-transparent -rotate-45" />
                            <span className="text-2xl font-black text-emerald-600">92%</span>
                         </div>
                         <div className="relative z-10">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">Completion Rate</p>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Excellent</h3>
                            <p className="text-sm font-medium text-emerald-600 mt-1 flex items-center gap-1.5 bg-emerald-50 w-fit px-2.5 py-0.5 rounded-lg"><Star className="w-3.5 h-3.5 fill-emerald-600" /> Top 8% bracket</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <Card className="border border-gray-100 shadow-sm bg-white">
                            <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-bold uppercase text-gray-500 tracking-wider">Top Insights</CardTitle></CardHeader>
                            <CardContent className="p-4 pt-0 space-y-2.5">
                               <p className="text-sm font-medium text-gray-800 flex items-start gap-2"><span className="text-green-500 mt-0.5">↑</span> Strong in analytical subjects</p>
                               <p className="text-sm font-medium text-gray-800 flex items-start gap-2"><span className="text-orange-500 mt-0.5">↓</span> Needs improvement in communication</p>
                            </CardContent>
                         </Card>
                         <Card className="border border-gray-100 shadow-sm bg-white">
                            <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-bold uppercase text-gray-500 tracking-wider">Included Data</CardTitle></CardHeader>
                            <CardContent className="p-4 pt-0 space-y-1.5">
                               {['Assignments analyzed', 'Attendance data', 'Performance trends'].map(d => (
                                 <p key={d} className="text-sm font-medium text-gray-600 flex items-center gap-2"><CheckCircle className="h-3 w-3 text-indigo-400" /> {d}</p>
                               ))}
                            </CardContent>
                         </Card>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                         <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-bold shadow-md"><Download className="h-4 w-4 mr-2"/> Download Full PDF</Button>
                         <Button variant="outline" className="flex-1 bg-white border-gray-300 rounded-xl h-12 font-bold shadow-sm text-gray-700 hover:bg-gray-50"><Share2 className="h-4 w-4 mr-2"/> Share Report</Button>
                      </div>
                   </div>
                )}
                
                {/* Fallback for other document types */}
                {!['Assignment Evaluated', 'Education Report Generated'].includes(detailedActivity.type) && (
                   <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
                      <FileCheck className="h-12 w-12 text-indigo-200 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">View not yet implemented</h3>
                      <p className="text-gray-500 text-sm">Rich reporting for this activity type is coming soon.</p>
                   </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] shadow-lg shadow-blue-500/20 rounded-2xl">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight">User Dashboard</h1>
                <p className="text-xs md:text-sm text-[#64748B] font-medium mt-0.5">Welcome back! Manage your applications and track progress</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="relative rounded-xl hidden md:flex border-slate-200 bg-white hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <Bell className="h-5 w-5 text-[#64748B]" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 rounded-full text-[10px] font-black text-white flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-red-200">
                      {notificationCount}
                    </span>
                  )}
                </Button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                          <h3 className="font-bold text-gray-900 border-none flex items-center gap-2">
                            Notifications {notificationCount > 0 && <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">{notificationCount} new</Badge>}
                          </h3>
                          <div className="flex gap-2">
                            <button onClick={markAllAsRead} title="Mark all as read" className="text-gray-400 hover:text-indigo-600 transition-colors p-1">
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button onClick={clearAllNotifications} title="Clear all" className="text-gray-400 hover:text-red-500 transition-colors p-1">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="max-h-[350px] overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                              <Bell className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                              <p className="text-sm font-medium">You're all caught up!</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-50">
                              {notifications.map((notif) => (
                                <div 
                                  key={notif.id} 
                                  onClick={() => handleNotificationClick(notif)}
                                  className={`p-4 flex gap-4 cursor-pointer hover:bg-indigo-50/50 transition-colors ${notif.read ? 'opacity-70' : 'bg-white'}`}
                                >
                                  <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${notif.bg} h-fit`}>
                                    <notif.icon className={`h-4 w-4 ${notif.color}`} />
                                  </div>
                                  <div className="flex-1">
                                    <p className={`text-sm ${notif.read ? 'font-medium text-gray-600' : 'font-bold text-gray-900'}`}>
                                      {notif.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                                      {notif.time}
                                      {!notif.read && <span className="h-2 w-2 rounded-full bg-blue-500"></span>}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="p-3 border-t border-gray-50 bg-gray-50 text-center">
                          <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                            View Activity Log
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              <Button variant="outline" onClick={handleLogout} className="gap-2 rounded-xl border-slate-200 text-[#64748B] font-bold hover:bg-slate-50 hover:text-[#0F172A] transition-all active:scale-95 shadow-sm">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-7xl space-y-10 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          
          {/* Main Content (70%) */}
          <div className="lg:col-span-7 flex flex-col">
            <h2 className="text-xl font-black text-[#0F172A] mb-6 tracking-tight px-1 flex items-center gap-2 uppercase text-xs">
              <Activity className="h-4 w-4 text-[#2563EB]" /> Available Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
              {modules.map((module, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
                  className="h-full"
                >
                  <Card
                    className="cursor-pointer bg-white shadow-[0_10px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-500 border-none group h-full rounded-[20px] flex flex-col overflow-hidden"
                    onClick={() => openService(module.key)}
                  >
                    <CardContent className="p-7 flex-grow flex flex-col items-start text-left relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-50 transition-colors duration-500" />
                      <div className={`p-4 ${module.color} rounded-2xl mb-6 shadow-lg shadow-blue-500/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10`}>
                        <module.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-black text-[#0F172A] mb-3 tracking-tight group-hover:text-[#2563EB] transition-colors relative z-10">{module.title}</h3>
                      <p className="text-sm font-medium text-[#64748B] leading-relaxed flex-grow relative z-10">{module.description}</p>
                      
                      <div className="mt-6 flex items-center gap-2 text-[#2563EB] font-black text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0 relative z-10">
                        Get Started <ChevronRight className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Privacy Info (Full Width) */}
              <div className="md:col-span-2 mt-4">
                <Card className="border-none bg-[#DBEAFE] shadow-sm rounded-[20px] hover:shadow-md transition-all duration-300 h-full w-full overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/5 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" />
                  <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="flex items-center gap-2 text-[#1E3A8A] text-base font-black uppercase tracking-tight">
                      <ShieldCheck className="h-5 w-5 text-[#2563EB]" />
                      Privacy Protection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-sm font-bold text-[#1E3A8A]/70 leading-relaxed">
                      🔒 Your sensitive data is encrypted and completely walled off from human system admins. All AI processing evaluates your profile anonymously ensuring 100% fair and blind decisions.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Sidebar (30%) */}
          <div className="lg:col-span-3 space-y-6 flex flex-col h-full lg:mt-0">
            <Card className="bg-white rounded-[20px] shadow-[0_10px_25px_rgba(0,0,0,0.05)] border-none overflow-hidden h-full">
              <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/30">
                <CardTitle className="text-lg font-black text-[#0F172A] tracking-tight">Recent Activity</CardTitle>
                <CardDescription className="text-[#64748B] font-medium">Your latest submissions and results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 px-5 pb-6">
                {activities.map((activity) => {
                  let Icon = FileText;
                  let iconColor = "text-[#64748B]";
                  let iconBg = "bg-slate-100";
                  
                  if (activity.type.includes("Job")) {
                    Icon = Briefcase; iconColor = "text-[#2563EB]"; iconBg = "bg-blue-50";
                  } else if (activity.type.includes("Assignment")) {
                    Icon = FileText; iconColor = "text-[#7C3AED]"; iconBg = "bg-purple-50";
                  } else if (activity.type.includes("Document")) {
                    Icon = ShieldCheck; iconColor = "text-[#075bea]"; iconBg = "bg-blue-50";
                  } else if (activity.type.includes("Education")) {
                    Icon = GraduationCap; iconColor = "text-[#1E3A8A]"; iconBg = "bg-slate-100";
                  }

                  let badgeClasses = "";
                  if (activity.status === "Authentic") {
                    badgeClasses = "bg-blue-50 text-[#075bea] border-blue-100";
                  } else if (activity.status === "Completed") {
                    badgeClasses = "bg-emerald-50 text-emerald-700 border-emerald-100";
                  } else if (activity.status === "Pending" && activity.type.includes("Education")) {
                    badgeClasses = "bg-blue-50 text-blue-700 border-blue-100";
                  } else if (activity.status === "Under Review" || activity.status === "Pending") {
                    badgeClasses = "bg-amber-50 text-amber-700 border-amber-100";
                  } else if (activity.status === "Verified") {
                    badgeClasses = "bg-teal-50 text-teal-700 border-teal-100";
                  } else {
                    badgeClasses = "bg-slate-50 text-slate-700 border-slate-200";
                  }

                  return (
                    <motion.div 
                      key={activity.id} 
                      onClick={() => setSelectedActivityId(activity.id)}
                      className="flex items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-slate-100/50 transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-blue-100 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${iconBg} transition-transform group-hover:scale-110 duration-300`}>
                          <Icon className={`h-4 w-4 ${iconColor}`} />
                        </div>
                        <div>
                          <p className="font-black text-[#0F172A] text-[13px] tracking-tight">{activity.type}</p>
                          <p className="text-[11px] font-bold text-[#64748B] mt-0.5">{activity.date}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[9px] font-black tracking-wider uppercase border-none ${badgeClasses}`}>
                        {activity.status}
                      </Badge>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#5738F5] via-[#5635EE] to-[#332FD0] text-white border-none shadow-[0_14px_26px_rgba(79,70,229,0.28)] rounded-[16px] transition-all duration-300 relative overflow-hidden group h-auto min-h-[236px] gap-0 shrink-0">
              <div className="absolute top-3 right-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <Bot className="absolute right-9 top-5 h-20 w-20 text-white/18 opacity-60" strokeWidth={2} />
              <CardHeader className="relative z-10 pb-0 pt-7 px-7">
                <CardTitle className="text-white font-black tracking-tight flex items-center gap-2 text-[16px]">
                  AI Help Center
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 px-7 pb-6 pt-7 flex-1 flex flex-col justify-between">
                <p className="text-[13px] text-white/90 font-bold leading-[1.65] max-w-[88%]">
                  Confused about a recent rejection? Need advice on application formatting? Consult our built-in Smart Assistant anytime.
                </p>
                <Button variant="secondary" onClick={() => { setHelpCenterTab("guidelines"); setIsHelpCenterOpen(true); }} className="w-full h-[48px] text-[#3F33D8] font-black text-[15px] bg-white hover:bg-slate-50 border-none rounded-full shadow-[0_5px_14px_rgba(15,23,42,0.15)] transition-all active:scale-95 flex items-center justify-center relative shrink-0">
                  <span>Open Guidelines</span>
                  <span className="absolute right-3 h-8 w-8 rounded-full bg-[#4B3EF0] text-white flex items-center justify-center">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AIHelpCenterPanel isOpen={isHelpCenterOpen} onClose={() => setIsHelpCenterOpen(false)} initialTab={helpCenterTab} />
    </div>
  );
}
