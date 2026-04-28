import { ArrowLeft, Camera, Check, Shield, ChevronDown, X, Search, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useState, useRef, useEffect } from "react";

// ─── Static Data ──────────────────────────────────────────────────────────────

const CLASS_OPTIONS = [
  "Class 6", "Class 7", "Class 8", "Class 9",
  "Class 10", "Class 11", "Class 12",
];

const BOARD_OPTIONS = ["CBSE", "ICSE", "State Board", "IB", "Cambridge"];

const SCHOOL_SUBJECTS = [
  "Mathematics", "Science", "English", "Social Science",
  "Computer Science", "Physics", "Chemistry", "Biology",
  "Economics", "Accountancy", "Business Studies",
];

const COLLEGE_COURSE_OPTIONS = [
  "Engineering", "Medical", "Commerce", "Arts / Humanities",
  "Science", "Management", "Law", "Pharmacy",
  "Nursing", "Computer Applications", "Design", "Education",
];

const BRANCH_MAP: Record<string, string[]> = {
  Engineering: ["Computer Science", "Information Technology", "Electronics", "Electrical", "Mechanical", "Civil", "AI & ML", "Data Science"],
  Medical: ["MBBS", "BDS", "BAMS", "BHMS", "Nursing", "Pharmacy", "Physiotherapy"],
  Commerce: ["B.Com", "BBA", "CA Foundation", "Accounting", "Finance", "Business Studies"],
  "Arts / Humanities": ["English Literature", "Psychology", "Sociology", "Political Science", "History", "Economics"],
};

const COLLEGE_SUBJECTS = [
  "Data Structures", "Algorithms", "Operating Systems",
  "Database Management System", "Computer Networks",
  "Machine Learning", "Artificial Intelligence",
  "Web Development", "Cloud Computing", "Cyber Security",
  "Software Engineering", "Mathematics", "Statistics",
  "Physics", "Chemistry", "Biology", "Economics",
  "Accountancy", "Business Law", "Marketing",
];

const YEAR_OPTIONS = [
  "1st Year / 1st Sem", "1st Year / 2nd Sem",
  "2nd Year / 3rd Sem", "2nd Year / 4th Sem",
  "3rd Year / 5th Sem", "3rd Year / 6th Sem",
  "4th Year / 7th Sem", "4th Year / 8th Sem",
];

const INSTITUTION_OPTIONS = [
  "IIT Delhi", "IIT Bombay", "IIT Madras", "IIT Kanpur", "IIT Kharagpur",
  "NIT Trichy", "NIT Surathkal", "Delhi University", "Mumbai University",
  "Bangalore University", "Anna University", "Amity University",
  "SRM University", "VIT University",
];

const SCHOOL_LIST = [
  "Delhi Public School", "Kendriya Vidyalaya", "Navodaya Vidyalaya",
  "Ryan International School", "DAV Public School",
  "St. Xavier's School", "Carmel Convent School",
  "Army Public School", "Jawahar Navodaya Vidyalaya",
];

// ─── SearchableSelect (single value) ─────────────────────────────────────────

interface SearchableSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}

function SearchableSelect({ label, options, value, onChange, placeholder, required }: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (opt: string) => {
    onChange(opt);
    setOpen(false);
    setSearch("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    onChange(e.target.value);
    if (!open) setOpen(true);
  };

  const isValid = !!value;

  return (
    <div className="space-y-1" ref={ref}>
      <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
        {label}
        {required && <span className="text-rose-400">*</span>}
      </label>
      <div className="relative">
        <div
          className={`w-full bg-white border rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 cursor-pointer transition-all ${
            open ? "border-teal-500 ring-2 ring-teal-500/20" : isValid ? "border-teal-300" : "border-slate-200 hover:border-teal-400"
          }`}
          onClick={() => setOpen((p) => !p)}
        >
          {open ? (
            <input
              autoFocus
              className="flex-1 outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={search || value}
              onChange={handleInputChange}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={`flex-1 truncate ${value ? "text-slate-800" : "text-slate-400"}`}>
              {value || placeholder || `Select ${label}`}
            </span>
          )}
          <Search className={`h-4 w-4 shrink-0 transition-opacity ${open ? "opacity-60 text-teal-500" : "opacity-0"}`} />
          {isValid && !open && <Check className="h-3.5 w-3.5 text-teal-500 shrink-0" />}
          <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180 text-teal-500" : ""}`} />
        </div>

        {open && (
          <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="max-h-52 overflow-y-auto custom-scrollbar">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">
                  No match — your typed value will be saved
                </div>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between gap-2 ${
                      value === opt ? "bg-teal-50 text-teal-700" : "text-slate-700 hover:bg-slate-50"
                    }`}
                    onClick={() => handleSelect(opt)}
                  >
                    {opt}
                    {value === opt && <Check className="h-3.5 w-3.5 text-teal-500 shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MultiSelect (chip tags) ──────────────────────────────────────────────────

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  required?: boolean;
}

function MultiSelect({ label, options, selected, onChange, required }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter(
    (o) => o.toLowerCase().includes(search.toLowerCase()) && !selected.includes(o)
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addItem = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !selected.includes(trimmed)) onChange([...selected, trimmed]);
    setSearch("");
    inputRef.current?.focus();
  };

  const removeItem = (item: string) => onChange(selected.filter((s) => s !== item));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) { e.preventDefault(); addItem(search.trim()); }
    if (e.key === "Backspace" && !search && selected.length > 0) removeItem(selected[selected.length - 1]);
  };

  const isValid = selected.length > 0;

  return (
    <div className="space-y-1" ref={ref}>
      <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
        {label}
        {required && <span className="text-rose-400">*</span>}
      </label>

      <div
        className={`w-full bg-white border rounded-xl px-3 py-2.5 flex flex-wrap gap-1.5 min-h-[46px] cursor-text transition-all ${
          open ? "border-teal-500 ring-2 ring-teal-500/20" : isValid ? "border-teal-300" : "border-slate-200 hover:border-teal-400"
        }`}
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        {selected.map((item) => (
          <span key={item} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800 text-[11px] font-bold leading-none">
            {item}
            <button type="button" className="hover:text-rose-500 transition-colors ml-0.5" onClick={(e) => { e.stopPropagation(); removeItem(item); }}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="flex-1 min-w-[100px] outline-none bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 py-0.5"
          placeholder={selected.length === 0 ? "Search & select subjects..." : "Add more..."}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <ChevronDown className={`h-4 w-4 self-center text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-teal-500" : ""}`} />
      </div>

      {open && (
        <div className="relative z-50">
          <div className="absolute mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="max-h-48 overflow-y-auto custom-scrollbar">
              {filtered.length === 0 && !search ? (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">All options selected</div>
              ) : filtered.length === 0 && search ? (
                <button
                  type="button"
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors flex items-center gap-2"
                  onClick={() => addItem(search.trim())}
                >
                  <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-bold">+ Add</span>
                  "{search}"
                </button>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => addItem(opt)}
                  >
                    {opt}
                  </button>
                ))
              )}
            </div>
            {selected.length > 0 && (
              <div className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400 font-medium">
                {selected.length} subject{selected.length > 1 ? "s" : ""} selected · Backspace to remove last
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Field Row helper ─────────────────────────────────────────────────────────
function TextInput({ label, value, onChange, placeholder, readOnly, required, badge }: {
  label: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; readOnly?: boolean; required?: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <div className="space-y-1 relative">
      <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
        {label}
        {required && <span className="text-rose-400">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={readOnly ? undefined : (e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition-all ${
            readOnly
              ? "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
              : value
              ? "bg-white border-teal-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              : "bg-white border-slate-200 hover:border-teal-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          }`}
        />
        {badge && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{badge}</div>
        )}
      </div>
    </div>
  );
}

// ─── Progress Dot Step ────────────────────────────────────────────────────────
function FieldProgress({ filled, total }: { filled: number; total: number }) {
  const pct = Math.round((filled / total) * 100);
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-slate-700">Form Completion</span>
        <span className={`text-sm font-bold ${pct === 100 ? "text-teal-600" : "text-slate-400"}`}>{pct}%</span>
      </div>
      <Progress value={pct} className="h-2 [&>div]:bg-teal-500 bg-slate-100" />
      <p className="text-[11px] text-slate-400 mt-1.5">{filled} of {total} required fields filled</p>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

type StudentType = "school" | "college";

export function StudentEditProfilePanel({ onBack }: { onBack: () => void }) {
  const [showToast, setShowToast] = useState(false);
  const [studentType, setStudentType] = useState<StudentType>("college");

  // Shared fields
  const [fullName, setFullName] = useState("Aisha Rahman");
  const [email] = useState("aisha.r@university.edu");

  // School-only fields
  const [schoolName, setSchoolName] = useState("");
  const [classGrade, setClassGrade] = useState("");
  const [board, setBoard] = useState("");
  const [schoolSubjects, setSchoolSubjects] = useState<string[]>([]);

  // College-only fields
  const [collegeName, setCollegeName] = useState("IIT Delhi");
  const [course, setCourse] = useState("Computer Science");
  const [branch, setBranch] = useState("");
  const [yearSem, setYearSem] = useState("3rd Year / 6th Sem");
  const [collegeSubjects, setCollegeSubjects] = useState<string[]>(["Data Structures", "Machine Learning"]);

  // Derived branch options for selected course
  const branchOptions = BRANCH_MAP[course] ?? [];

  // Validation
  const schoolFilled = [fullName, email, schoolName, classGrade, board].filter(Boolean).length
    + (schoolSubjects.length > 0 ? 1 : 0);
  const schoolTotal = 6;

  const collegeFilled = [fullName, email, collegeName, course, yearSem].filter(Boolean).length
    + (collegeSubjects.length > 0 ? 1 : 0);
  const collegeTotal = 6;

  const isValid = studentType === "school"
    ? schoolFilled === schoolTotal
    : collegeFilled === collegeTotal;

  const handleSave = () => {
    if (!isValid) return;
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Reset branch when course changes
  useEffect(() => { setBranch(""); }, [course]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 absolute inset-0 z-10 animate-in slide-in-from-right-full duration-300">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-4 text-white flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold leading-tight">Student Academic Profile</h2>
          <p className="text-[11px] text-teal-100 font-medium">Fill your academic details for AI personalisation</p>
        </div>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar relative">

        {/* Toast */}
        {showToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-4 z-50 whitespace-nowrap">
            <Check className="h-4 w-4 text-teal-400" /> Profile updated successfully
          </div>
        )}

        {/* ── Student Type Segmented Selector ── */}
        <div className="mb-5 bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex gap-1">
          <button
            type="button"
            onClick={() => setStudentType("school")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              studentType === "school"
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            School Student
          </button>
          <button
            type="button"
            onClick={() => setStudentType("college")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              studentType === "college"
                ? "bg-gradient-to-r from-teal-500 to-indigo-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            College Student
          </button>
        </div>

        {/* ── Type badge hint ── */}
        <div className={`mb-5 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
          studentType === "school"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-indigo-50 text-indigo-700 border border-indigo-200"
        }`}>
          {studentType === "school" ? <BookOpen className="h-3.5 w-3.5 shrink-0" /> : <GraduationCap className="h-3.5 w-3.5 shrink-0" />}
          {studentType === "school"
            ? "Showing School Student fields — Class, Board, and School-specific subjects"
            : "Showing College Student fields — Course, Branch, and University-level subjects"}
        </div>

        {/* ── Progress ── */}
        <FieldProgress
          filled={studentType === "school" ? schoolFilled : collegeFilled}
          total={studentType === "school" ? schoolTotal : collegeTotal}
        />

        {/* ── Avatar ── */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group cursor-pointer">
            <div className="h-20 w-20 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-2xl font-black shadow-md border-4 border-white">
              AR
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-2 hover:text-teal-600 cursor-pointer">Change Photo</p>
        </div>

        {/* ══════════════ SCHOOL FIELDS ══════════════ */}
        {studentType === "school" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">

            {/* Full Name */}
            <TextInput
              label="Full Name" value={fullName}
              onChange={setFullName} placeholder="Enter your full name" required
            />

            {/* Email */}
            <TextInput
              label="Email Address" value={email} readOnly required
              badge={
                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">
                  <Shield className="h-3 w-3" /> Verified
                </div>
              }
            />

            {/* School Name */}
            <SearchableSelect
              label="School Name"
              options={SCHOOL_LIST}
              value={schoolName}
              onChange={setSchoolName}
              placeholder="Search or type your school..."
              required
            />

            {/* Class / Grade + Board */}
            <div className="grid grid-cols-2 gap-3">
              <SearchableSelect
                label="Class / Grade"
                options={CLASS_OPTIONS}
                value={classGrade}
                onChange={setClassGrade}
                placeholder="Select class..."
                required
              />
              <SearchableSelect
                label="Board"
                options={BOARD_OPTIONS}
                value={board}
                onChange={setBoard}
                placeholder="Select board..."
                required
              />
            </div>

            {/* Subject Preference */}
            <MultiSelect
              label="Subject Preference"
              options={SCHOOL_SUBJECTS}
              selected={schoolSubjects}
              onChange={setSchoolSubjects}
              required
            />

            {schoolSubjects.length > 0 && (
              <p className="text-[11px] text-slate-400 ml-1">
                AI will tailor evaluation rubrics based on your selected subjects.
              </p>
            )}
          </div>
        )}

        {/* ══════════════ COLLEGE FIELDS ══════════════ */}
        {studentType === "college" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">

            {/* Full Name */}
            <TextInput
              label="Full Name" value={fullName}
              onChange={setFullName} placeholder="Enter your full name" required
            />

            {/* Email */}
            <TextInput
              label="Email Address" value={email} readOnly required
              badge={
                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">
                  <Shield className="h-3 w-3" /> Verified
                </div>
              }
            />

            {/* College / University Name */}
            <SearchableSelect
              label="College / University Name"
              options={INSTITUTION_OPTIONS}
              value={collegeName}
              onChange={setCollegeName}
              placeholder="Search or type your institution..."
              required
            />

            {/* Course / Stream */}
            <SearchableSelect
              label="Course / Stream"
              options={COLLEGE_COURSE_OPTIONS}
              value={course}
              onChange={setCourse}
              placeholder="Select your course..."
              required
            />

            {/* Branch — only shown if course has sub-branches */}
            {branchOptions.length > 0 && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <SearchableSelect
                  label={`${course} Branch / Specialisation`}
                  options={branchOptions}
                  value={branch}
                  onChange={setBranch}
                  placeholder={`Select ${course} branch...`}
                />
              </div>
            )}

            {/* Year / Semester */}
            <SearchableSelect
              label="Year / Semester"
              options={YEAR_OPTIONS}
              value={yearSem}
              onChange={setYearSem}
              placeholder="Select year & semester..."
              required
            />

            {/* Subject Preference */}
            <MultiSelect
              label="Subject Preference"
              options={COLLEGE_SUBJECTS}
              selected={collegeSubjects}
              onChange={setCollegeSubjects}
              required
            />

            {collegeSubjects.length > 0 && (
              <p className="text-[11px] text-slate-400 ml-1">
                AI will personalise your evaluation rubric based on selected subjects.
              </p>
            )}
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>

      {/* ── Footer CTA ── */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        {!isValid && (
          <p className="text-[11px] text-slate-400 text-center mb-2">
            Fill all required fields (<span className="text-rose-400 font-bold">*</span>) to save
          </p>
        )}
        <Button
          onClick={handleSave}
          disabled={!isValid}
          className={`w-full font-bold h-12 rounded-xl text-sm shadow-sm transition-all ${
            isValid
              ? "bg-teal-600 hover:bg-teal-700 text-white"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isValid ? (
            <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Save Profile</span>
          ) : (
            "Complete required fields to Save"
          )}
        </Button>
      </div>
    </div>
  );
}
