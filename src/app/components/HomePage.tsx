import { motion } from "motion/react";
import { Shield, Briefcase, Building2, FileCheck, Users, Globe, Lock, GraduationCap } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useUser } from "./UserContext";
import { Header } from "./Header";
import { Footer } from "./Footer";

const translations = {
  en: {
    title: "Unbiased AI Decision System",
    subtitle: "Fair, Secure, and Smart Decision-Making Without Bias",
    description: "An intelligent AI platform that ensures transparent decision-making across Job Hiring, Loan Approval, and Education System while protecting your privacy.",
    userButton: "Continue as User",
    adminButton: "Continue as Admin",
    features: "Key Features",
    feature1: "Bias-Free Decisions",
    feature1Desc: "AI removes sensitive attributes for fair results",
    feature2: "Smart Recommendations",
    feature2Desc: "Get job suggestions and skill improvement tips",
    feature3: "Document Verification",
    feature3Desc: "AI detects fake or edited documents",
    feature4: "Privacy Protection",
    feature4Desc: "Only AI accesses your sensitive data",
    feature5: "Multi-Language Support",
    feature5Desc: "Available in multiple languages",
    feature6: "Secure Access",
    feature6Desc: "Role-based authentication system",
  },
  hi: {
    title: "निष्पक्ष एआई निर्णय प्रणाली",
    subtitle: "निष्पक्षता के बिना उचित, सुरक्षित और स्मार्ट निर्णय लेना",
    description: "एक बुद्धिमान एआई प्लेटफॉर्म जो आपकी गोपनीयता की रक्षा करते हुए नौकरी भर्ती, ऋण अनुमोदन और शिक्षा प्रणाली में पारदर्शी निर्णय लेने को सुनिश्चित करता है।",
    userButton: "उपयोगकर्ता के रूप में जारी रखें",
    adminButton: "व्यवस्थापक के रूप में जारी रखें",
    features: "मुख्य विशेषताएं",
    feature1: "पूर्वाग्रह-मुक्त निर्णय",
    feature1Desc: "एआई उचित परिणामों के लिए संवेदनशील गुणों को हटा देता है",
    feature2: "स्मार्ट सिफारिशें",
    feature2Desc: "नौकरी सुझाव और कौशल सुधार युक्तियाँ प्राप्त करें",
    feature3: "दस्तावेज़ सत्यापन",
    feature3Desc: "एआई नकली या संपादित दस्तावेज़ों का पता लगाता है",
    feature4: "गोपनीयता सुरक्षा",
    feature4Desc: "केवल एआई आपके संवेदनशील डेटा तक पहुंचता है",
    feature5: "बहु-भाषा समर्थन",
    feature5Desc: "कई भाषाओं में उपलब्ध",
    feature6: "सुरक्षित पहुँच",
    feature6Desc: "भूमिका-आधारित प्रमाणीकरण प्रणाली",
  },
};

export function HomePage() {
  const { language } = useUser();
  const t = translations[language];

  const features = [
    { icon: Shield, title: t.feature1, desc: t.feature1Desc },
    { icon: Briefcase, title: t.feature2, desc: t.feature2Desc },
    { icon: FileCheck, title: t.feature3, desc: t.feature3Desc },
    { icon: Lock, title: t.feature4, desc: t.feature4Desc },
    { icon: Globe, title: t.feature5, desc: t.feature5Desc },
    { icon: Users, title: t.feature6, desc: t.feature6Desc },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full">
              <Shield className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-2">
            {t.subtitle}
          </p>
          
          <p className="text-gray-500 max-w-3xl mx-auto mb-8">
            {t.description}
          </p>

        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl text-center mb-8 text-gray-800">
            {t.features}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="group"
              >
                <Card className="border-2 hover:border-blue-300 transition-all duration-300 transform group-hover:-translate-y-[8px] group-hover:shadow-xl group-hover:shadow-blue-500/20 group-hover:border-blue-400 overflow-hidden">
                  <div className="absolute inset-0 bg-blue-400/0 group-hover:bg-blue-400/5 transition-colors pointer-events-none" />
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg transform transition-transform duration-300 group-hover:scale-110">
                        <feature.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="mb-2 text-gray-900 font-semibold">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Modules Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 transition-all duration-300 hover:-translate-y-[10px] hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/40 hover:from-blue-400 hover:to-blue-500 cursor-pointer overflow-hidden relative">
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none" />
              <CardContent className="p-8 text-center relative z-10">
                <Briefcase className="h-12 w-12 mx-auto mb-4 transition-transform duration-300 group-hover:glow-icon" style={{ filter: 'drop-shadow(0 0 0 transparent)' }} />
                <h3 className="text-xl mb-2 font-medium">Job Hiring</h3>
                <p className="text-blue-100 text-sm">
                  Fair resume analysis with smart recommendations
                </p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 transition-all duration-300 hover:-translate-y-[10px] hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/40 hover:from-purple-400 hover:to-purple-500 cursor-pointer overflow-hidden relative">
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none" />
              <CardContent className="p-8 text-center relative z-10">
                <Building2 className="h-12 w-12 mx-auto mb-4 transition-transform duration-300 group-hover:glow-icon" style={{ filter: 'drop-shadow(0 0 0 transparent)' }} />
                <h3 className="text-xl mb-2 font-medium">Loan Approval</h3>
                <p className="text-purple-100 text-sm">
                  Unbiased financial assessment for everyone
                </p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 transition-all duration-300 hover:-translate-y-[10px] hover:scale-[1.02] hover:shadow-2xl hover:shadow-teal-500/40 hover:from-teal-400 hover:to-teal-500 cursor-pointer overflow-hidden relative">
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none" />
              <CardContent className="p-8 text-center relative z-10">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 transition-transform duration-300 group-hover:glow-icon" style={{ filter: 'drop-shadow(0 0 0 transparent)' }} />
                <h3 className="text-xl mb-2 font-medium">Education System</h3>
                <p className="text-teal-100 text-sm">
                  AI-powered student evaluation, smart learning, and career guidance
                </p>
              </CardContent>
            </Card>
          </div>
          <style>{`
            .group:hover .group-hover\\:glow-icon {
              filter: drop-shadow(0 0 8px rgba(255,255,255,0.8)) !important;
            }
          `}</style>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
}
