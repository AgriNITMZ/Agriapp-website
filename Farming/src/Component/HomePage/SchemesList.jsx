import React from "react";
import { ExternalLink, Info, Star, Leaf, Sprout } from "lucide-react";
import LatestNewsBox from './LatestNewsBox';

const mizoAgriLinks = [
  {
    title: "Mizoram Agriculture Department (Official)",
    url: "http://agriculturemizoram.nic.in",
    description:
      "Official portal with updates on projects and schemes like RKVY, ATMA, PKVY, NFSM, Oil Palm, MOVCD-NER, FOCUS, INM, SMAF, and more.",
    whyUseful:
      "Check state notifications, district contacts, and scheme components implemented across Mizoram."
  },
  {
    title: "Serchhip District Schemes (Agriculture)",
    url: "https://serchhip.nic.in/schemes/",
    description:
      "Detailed briefs of schemes like Soil Health Card, ATMA, SMAM, PMKSY, PKVY, MOVCD-NER, and more.",
    whyUseful:
      "Good reference for understanding district-level implementations and farmer benefits."
  },
  {
    title: "State Agriculture Plan (SAP) – Mizoram",
    url: "https://agriculturemizoram.nic.in/pages/sap.html",
    description:
      "Covers integrated planning for crop development, mechanization, markets, horticulture, and irrigation.",
    whyUseful: "Understand state priorities and long-term agricultural goals."
  },
  {
    title: "PM-KISAN (National Services Portal)",
    url: "https://services.india.gov.in/service/detail/pm-kisan-samman-nidhi",
    description:
      "Provides ₹6,000/year to eligible farmers directly via Aadhaar-linked accounts with e-KYC and status checks.",
    whyUseful:
      "Essential for direct income support and subsidy status tracking."
  },
  {
    title: "Lawngtlai District Agriculture Schemes",
    url: "https://lawngtlai.nic.in/agriculture/",
    description:
      "District-specific schemes for crop development, water resources, SMAM implementation, and NEDP programs.",
    whyUseful:
      "Access district-level agricultural services and scheme applications in southern Mizoram."
  },
  {
    title: "Mizoram Rural Bank – Agriculture Term Loan",
    url: "https://www.mizoramruralbank.in/agricul",
    description:
      "Kisan Credit Card, crop loans, term loans, agricultural insurance, and savings products for farmers.",
    whyUseful:
      "Apply for agricultural financing, KCC, and insurance coverage for farming activities."
  },
  {
    title: "Mizoram Rural Bank – Allied Agriculture Term Loan",
    url: "https://www.mizoramruralbank.in/alliedagri",
    description:
      "Specialized loan products for allied agricultural activities like dairy, poultry, fishery, and horticulture.",
    whyUseful:
      "Get financing for agricultural diversification and allied farming ventures."
  },
  {
    title: "Bana Kaih Financial Assistance Scheme",
    url: "https://www.goodreturns.in/news/mizoram-financial-assistance-scheme-farmers-entrepreneurs-011-1377555.html",
    description:
      "State flagship support program offering loans with interest subvention, minimum support prices, and registration guidelines.",
    whyUseful:
      "Access Mizoram's premier financial assistance program for farmers and entrepreneurs."
  },
  {
    title: "Handholding Scheme - Bana Kaih (Flagship Program)",
    url: "https://morungexpress.com/mizoram-launches-flagship-scheme-to-give-financial-aid-to-entrepreneurs-farmers",
    description:
      "Collateral-free, interest-free loans up to ₹50 lakh and grant-in-aid for smaller agricultural enterprises.",
    whyUseful:
      "Apply for substantial collateral-free funding for agricultural and entrepreneurial ventures."
  },
  {
    title: "National Agricultural Market (e-NAM) Portal",
    url: "https://www.enam.gov.in",
    description:
      "Pan-India electronic trading platform linking APMC mandis for unified agricultural commodity trading and price discovery.",
    whyUseful:
      "Access national marketplace for crop sales, real-time pricing, and inter-state trading opportunities."
  },
  {
    title: "ATMA Serchhip District Implementation",
    url: "https://serchhip.nic.in/scheme/atma-agricultural-technology-management-agency/",
    description:
      "Agricultural Technology Management Agency offering training, demonstrations, farm schools, and exposure visits.",
    whyUseful:
      "Participate in farmer training programs, technology demonstrations, and agricultural extension services."
  },
  {
    title: "ATMA Champhai District Programs",
    url: "https://champhai.nic.in/mz/scheme/atma-agricultural-technology-management-agencymz/",
    description:
      "District-level ATMA implementation with farmer-scientist interactions, demonstrations, and capacity building programs.",
    whyUseful:
      "Access agricultural technology support and training programs in eastern Mizoram."
  },
  {
    title: "PKVY Organic Farming Implementation",
    url: "http://agriculturemizoram.nic.in/pages/pkvy.html",
    description:
      "Paramparagat Krishi Vikas Yojana promoting organic farming through traditional wisdom and modern science with PGS certification.",
    whyUseful:
      "Join organic farming clusters, get vermi-composting support, and obtain organic certification."
  },
  {
    title: "MOVCD-NER Serchhip District Portal",
    url: "https://serchhip.nic.in/scheme/movcd-ner-mission-organic-value-chain-development-for-north-eastern-region/",
    description:
      "Mission Organic Value Chain Development offering quality seeds, organic inputs, NPOP certification, and FPO formation.",
    whyUseful:
      "Access organic farming support, certification assistance, and value chain development for organic produce."
  },
  {
    title: "Mission Organic Mizoram (MOM) Official",
    url: "https://agriculturemizoram.nic.in/pages/about_mom.html",
    description:
      "State implementation of MOVCD-NER with FPO formation, organic certification, value addition, and Farmers Business Network.",
    whyUseful:
      "Join organic farming initiatives, access certification support, and connect with organic buyers through FBNM."
  },
  {
    title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    url: "https://pmfby.gov.in",
    description:
      "Government-sponsored crop insurance scheme covering natural calamities, pest attacks, and post-harvest losses.",
    whyUseful:
      "Protect crops with affordable insurance coverage and receive quick claim settlements for crop losses."
  },
  {
    title: "Agromet Advisory Services Mizoram",
    url: "https://mausam.imd.gov.in/aizawl/mcdata/AAS_Bulletin_ENG.pdf",
    description:
      "Weekly weather-based agricultural advisories from ICAR-RCER covering crop management, pest control, and climate resilience.",
    whyUseful:
      "Get expert weather-based farming advice, crop stage guidance, and climate risk management strategies."
  },
  {
    title: "IMD Aizawl Weather Services",
    url: "https://mausam.imd.gov.in/aizawl/",
    description:
      "Meteorological department providing daily weather reports, weekly forecasts, district-wise warnings, and agricultural bulletins.",
    whyUseful:
      "Access accurate weather forecasts, rainfall data, and agricultural weather warnings for farming decisions."
  },
  {
    title: "Gramin Krishi Mausam Sewa (GKMS)",
    url: "https://kiran.nic.in/GKMS-IMDMizoram.html",
    description:
      "Farmer awareness programs on weather-based agro advisory services through ICAR training at district level.",
    whyUseful:
      "Participate in weather-based farming training and register for SMS-based agricultural advisories."
  },
  {
    title: "Sustainable Agriculture Project Report NAFCC",
    url: "https://moef.gov.in/uploads/2017/08/Mizoram.pdf",
    description:
      "Detailed project report on climate resilient farming, enhanced production technologies, and KVK infrastructure strengthening.",
    whyUseful:
      "Understand climate adaptation strategies, access technical project details, and contact information for implementation."
  },
  {
    title: "MSRLM Organic Farming Convergence",
    url: "https://srlm.mizoram.gov.in/post/farm-livelihoods-convergence/convergence-with-movcdner-for-promotion-of-organic-farming",
    description:
      "Mizoram State Rural Livelihood Mission convergence with MOVCD-NER for Mahila Kisan organic farming promotion.",
    whyUseful:
      "Women farmers can access organic farming support, capacity building, and livelihood enhancement programs."
  },
  {
    title: "Agriculture Department Organization Structure",
    url: "https://agriculturemizoram.nic.in/organizations.html",
    description:
      "Complete organizational structure with contact details of directors, deputy directors, and district agriculture officers.",
    whyUseful:
      "Direct contact information for all agricultural officials from state to district level for scheme inquiries."
  },
  {
    title: "Governor's CSS Review Meeting Report",
    url: "https://rajbhavan.mizoram.gov.in/governor-hovin-rural-development-agriculture-a-h-vety-leh-fisheries-department-kaltlanga-centrally-sponsored-scheme-hmalaknate-thlirho-mizo/",
    description:
      "High-level review of centrally sponsored agricultural schemes implementation progress and policy directions.",
    whyUseful:
      "Understand state-level policy implementation, challenges, and future directions for agricultural development."
  },
  {
    title: "FAO Livelihood Enhancement Project",
    url: "https://openknowledge.fao.org/bitstreams/77b46175-4441-4316-946b-ccab70f9fe86/download",
    description:
      "FAO project document on improving livelihoods through climate resilience, livestock health, and extension services.",
    whyUseful:
      "Access international best practices, technical guidance, and climate adaptation strategies for sustainable farming."
  }
];
export default function MizoramAgriSchemesList() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* ===== HERO SECTION ===== */}
      <div className="relative h-[300px] w-full overflow-hidden">
        <img
    src="https://images.pexels.com/photos/33731218/pexels-photo-33731218.jpeg?q=80&w=2000&auto=format&fit=crop"
    alt="Mizoram Terrace Farming"
    className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 ease-in-out hover:scale-105"
  />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            Mizoram Agriculture Resources
          </h1>
          <p className="text-lg text-green-100 mt-3 max-w-2xl">
            Explore official schemes, financial support, and agricultural tools designed to
            empower Mizoram's farmers and communities.
          </p>
        </div>

        {/* Floating Elements */}
        <Leaf className="absolute top-10 left-10 text-green-200 animate-bounce w-8 h-8" />
        <Sprout className="absolute bottom-10 right-10 text-green-200 animate-bounce w-8 h-8 delay-150" />
      </div>

      {/* ===== INTRO TEXT ===== */}
      <div className="max-w-5xl mx-auto px-6 text-center mt-10">
        <h2 className="text-3xl font-bold text-green-800">🌱 Schemes & Initiatives</h2>
        <p className="text-gray-700 mt-3">
          A curated collection of verified government resources, portals, and
          financial support programs for agriculture in Mizoram.
        </p>
      </div>

      {/* ===== LATEST NEWS BOX ===== */}
      <div className="max-w-6xl mx-auto px-6 mt-10">
        <LatestNewsBox />
      </div>

      {/* ===== CARD GRID ===== */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {mizoAgriLinks.map((item, index) => (
          <div
            key={item.url}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Card Header */}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-lg font-semibold text-green-700 group-hover:text-green-900"
            >
              <ExternalLink className="w-5 h-5" />
              {item.title}
            </a>

            {/* Card Content */}
            <div className="mt-4 text-gray-700 space-y-3 text-sm">
              <p className="flex gap-2">
                <Info className="w-4 h-4 text-green-600 mt-1" />
                <span>{item.description}</span>
              </p>
              <p className="flex gap-2">
                <Star className="w-4 h-4 text-yellow-500 mt-1" />
                <span className="italic">{item.whyUseful}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== MOVING LINKS MARQUEE ===== */}
      <div className="bg-green-50 py-6 border-t border-green-100">
        <div className="overflow-hidden whitespace-nowrap">
          <div className="animate-marquee inline-block space-x-10 text-green-700 text-sm font-medium">
            {mizoAgriLinks.map((item) => (
              <span key={item.url} className="hover:text-green-900 transition-colors">
                {item.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}