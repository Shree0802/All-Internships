import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Shirt,
  ShieldCheck,
  Check,
  Users,
  Palette,
  Send,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Flame,
  Upload,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  Package,
  ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import { get, post } from '../services/api';
import { formatPrice, formatDate } from '../utils/formatters';
import Spinner from '../components/ui/Spinner';
import JerseyPreview from '../components/ui/JerseyPreview';

const SPORTS = [
  { id: 'Cricket', name: 'Cricket', icon: '🏏', desc: 'Custom sublimation whites, colored T20 kits & track pants' },
  { id: 'Football', name: 'Football', icon: '⚽', desc: 'Breathable dry-fit jerseys, match shorts & socks' },
  { id: 'Basketball', name: 'Basketball', icon: '🏀', desc: 'Moisture-wicking mesh jerseys & wide-cut shorts' },
  { id: 'Badminton', name: 'Badminton', icon: '🏸', desc: 'Lightweight stretch polos & tournament shorts' },
  { id: 'Other', name: 'Other Sports', icon: '🏆', desc: 'Track & field, volleyball, table tennis & varsity gear' }
];

const KIT_TYPES = [
  { id: 'Team jersey', name: 'Team Jersey', desc: 'Custom printed top wear with team crest, player name & number' },
  { id: 'Full sports kit', name: 'Full Sports Kit', desc: 'Complete match day outfit: Jersey + Matching Shorts + Socks' },
  { id: 'Training wear', name: 'Training Wear', desc: 'Warm-up tracksuits, practice bibs & compression layers' },
  { id: 'Custom merchandise', name: 'Custom Merchandise', desc: 'Varsity hoodies, college supporters tees & caps' },
  { id: 'Other', name: 'Other Spec', desc: 'Specific custom athletic garments' }
];

const JERSEY_STYLES = [
  'Round Neck Athletic',
  'V-Neck Sublimation',
  'Polo Collar with Buttons',
  'Sleeveless Mesh Tank',
  'Quarter-Zip Performance'
];

const PRESET_COLOR_PALETTES = [
  { name: 'Navy & Electric Blue', primary: '#0B1730', secondary: '#2677FF', accent: '#FFFFFF' },
  { name: 'Midnight Purple & Pink', primary: '#2D1B69', secondary: '#F044A5', accent: '#FFD700' },
  { name: 'Varsity Crimson & Gold', primary: '#800020', secondary: '#FFD700', accent: '#0B1730' },
  { name: 'Stealth Black & Orange', primary: '#172033', secondary: '#FF7849', accent: '#FFFFFF' },
  { name: 'Forest Emerald & White', primary: '#0B5345', secondary: '#2ECC71', accent: '#FFFFFF' }
];

export default function TeamKitStudio() {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active view tab: 'studio' | 'my-requests'
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') === 'my-requests' ? 'my-requests' : 'studio';
  });

  // Keep activeTab in sync if URL query parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'my-requests') {
      setActiveTab('my-requests');
    } else if (tabParam === 'studio') {
      setActiveTab('studio');
    }
  }, [searchParams]);

  // Multi-step form step (1 to 7)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Sport
  const [sport, setSport] = useState('Cricket');

  // Step 2: Kit Type
  const [kitType, setKitType] = useState('Team jersey');

  // Step 3: Team Information
  const [teamName, setTeamName] = useState('CAMPUS TITANS');
  const [organization, setOrganization] = useState('DY PATIL UNIVERSITY');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Step 4: Design Preferences & Live Personalization
  const [primaryColor, setPrimaryColor] = useState(PRESET_COLOR_PALETTES[0].primary);
  const [secondaryColor, setSecondaryColor] = useState(PRESET_COLOR_PALETTES[0].secondary);
  const [accentColor, setAccentColor] = useState(PRESET_COLOR_PALETTES[0].accent);
  const [jerseyStyle, setJerseyStyle] = useState(JERSEY_STYLES[0]);
  const [playerName, setPlayerName] = useState('CAPTAIN');
  const [jerseyNumber, setJerseyNumber] = useState('10');
  const [previewView, setPreviewView] = useState('front');
  const [singleSize, setSingleSize] = useState('M');
  const [customJerseyProduct, setCustomJerseyProduct] = useState(null);
  const [addingToBag, setAddingToBag] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [rosterNotes, setRosterNotes] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Fetch base matchday jersey catalog product for direct add-to-bag purchase
  useEffect(() => {
    async function loadBaseJersey() {
      try {
        const res = await get('/products/dypulse-matchday-poly-mesh-sports-jersey');
        const prod = res?.data?.product || res?.product;
        if (prod) {
          setCustomJerseyProduct(prod);
        }
      } catch (err) {
        console.warn('Could not fetch base jersey product:', err);
      }
    }
    loadBaseJersey();
  }, []);

  // Direct Single Customized Jersey Add-To-Bag
  const handleAddCustomToBag = async () => {
    if (!customJerseyProduct) {
      toast.error('Loading jersey catalog product. Please wait a moment.');
      return;
    }
    setAddingToBag(true);
    try {
      const customColorLabel = `${primaryColor} (${jerseyStyle})`;
      const success = await addToCart(
        customJerseyProduct,
        1,
        singleSize,
        customColorLabel,
        `CUSTOM-${sport.toUpperCase()}-${jerseyNumber}`
      );
      if (success) {
        toast.success(`Custom jersey #${jerseyNumber} (${playerName || 'Player'}) added to bag! 🛍️`, {
          icon: '⚡',
          style: {
            borderRadius: '12px',
            background: '#0B1730',
            color: '#fff'
          }
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add customized jersey');
    } finally {
      setAddingToBag(false);
    }
  };

  // Step 5: Size Breakdown
  const [sizes, setSizes] = useState({
    XS: 0,
    S: 2,
    M: 6,
    L: 5,
    XL: 2,
    XXL: 0
  });

  // Step 6: Additional Requirements
  const [desiredDeliveryDate, setDesiredDeliveryDate] = useState('');
  const [instructions, setInstructions] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // Customer Requests list state
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  // Prefill contact info from authenticated user
  useEffect(() => {
    if (user) {
      if (!contactPerson) setContactPerson(`${user.firstName || ''} ${user.lastName || ''}`.trim());
      if (!contactEmail) setContactEmail(user.email || '');
      if (!contactPhone && user.phone) setContactPhone(user.phone);
    }
  }, [user]);

  // Fetch my requests when tab is opened
  const fetchMyRequests = async () => {
    if (!isAuthenticated) return;
    setLoadingRequests(true);
    try {
      const res = await get('/team-kits/my-requests');
      setMyRequests(res?.data?.requests || []);
    } catch (err) {
      console.warn('Failed to fetch team kit requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my-requests' && isAuthenticated) {
      fetchMyRequests();
    }
  }, [activeTab, isAuthenticated]);

  const totalQuantity =
    (sizes.XS || 0) +
    (sizes.S || 0) +
    (sizes.M || 0) +
    (sizes.L || 0) +
    (sizes.XL || 0) +
    (sizes.XXL || 0);

  const updateSizeCount = (sizeKey, delta) => {
    setSizes((prev) => ({
      ...prev,
      [sizeKey]: Math.max(0, (prev[sizeKey] || 0) + delta)
    }));
  };

  // Upload logo helper
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo file size must be under 5MB');
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('images', file);

    try {
      const res = await post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const uploadedUrl = res?.data?.images?.[0]?.url;
      if (uploadedUrl) {
        setLogoUrl(uploadedUrl);
        toast.success('Team crest uploaded!');
      }
    } catch {
      // Fallback: create object URL for local preview
      const localUrl = URL.createObjectURL(file);
      setLogoUrl(localUrl);
      toast('Logo preview loaded');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Step validation
  const validateCurrentStep = () => {
    if (currentStep === 1 && !sport) {
      toast.error('Please select a sport');
      return false;
    }
    if (currentStep === 2 && !kitType) {
      toast.error('Please select a kit type');
      return false;
    }
    if (currentStep === 3) {
      if (!teamName.trim()) {
        toast.error('Team name is required');
        return false;
      }
      if (!organization.trim()) {
        toast.error('College or organization is required');
        return false;
      }
      if (!contactPerson.trim()) {
        toast.error('Contact person name is required');
        return false;
      }
      if (!contactEmail.trim() || !contactEmail.includes('@')) {
        toast.error('Valid contact email is required');
        return false;
      }
    }
    if (currentStep === 4 && (!primaryColor || !jerseyStyle)) {
      toast.error('Primary color and jersey style are required');
      return false;
    }
    if (currentStep === 5 && totalQuantity <= 0) {
      toast.error('Please specify at least 1 jersey in your size breakdown');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(7, prev + 1));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSubmitRequest = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to submit your team kit request');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        sport,
        kitType,
        teamInfo: {
          teamName: teamName.trim(),
          organization: organization.trim(),
          contactPerson: contactPerson.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim()
        },
        design: {
          primaryColor,
          secondaryColor,
          accentColor,
          jerseyStyle,
          playerName: playerName.trim(),
          jerseyNumber: jerseyNumber.trim(),
          logoUrl,
          referenceImageUrl,
          rosterNotes: rosterNotes.trim()
        },
        sizeBreakdown: sizes,
        totalQuantity,
        additionalRequirements: {
          desiredDeliveryDate: desiredDeliveryDate || null,
          instructions: instructions.trim()
        }
      };

      const res = await post('/team-kits', payload);
      const created = res?.data?.request;

      setSubmissionSuccess(created);
      toast.success('Team kit request submitted successfully! ⚡');
      await fetchMyRequests();
    } catch (err) {
      toast.error(err.message || 'Failed to submit customization request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    setCancellingId(requestId);
    try {
      await post(`/team-kits/${requestId}/cancel`, {
        reason: 'Cancelled by team captain'
      });
      toast.success('Request cancelled');
      await fetchMyRequests();
    } catch (err) {
      toast.error(err.message || 'Could not cancel request');
    } finally {
      setCancellingId(null);
    }
  };

  const STEPS = [
    { num: 1, title: 'Sport' },
    { num: 2, title: 'Kit Type' },
    { num: 3, title: 'Team Details' },
    { num: 4, title: 'Colors & Style' },
    { num: 5, title: 'Sizes' },
    { num: 6, title: 'Schedule' },
    { num: 7, title: 'Review & Submit' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B1730] via-[#11244D] to-[#1c3872] p-8 sm:p-12 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-[#2677FF] border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DYPULSE Custom Team Kit Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight">
            YOUR TEAM. YOUR COLORS.
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Create a kit that represents your team. Tell us what you need and submit your customization request.
          </p>

          {/* Tab Navigation */}
          <div className="pt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveTab('studio');
                setSubmissionSuccess(null);
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'studio'
                  ? 'bg-[#2677FF] text-white shadow-md shadow-blue-500/25'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              Custom Kit Builder
            </button>
            <button
              onClick={() => setActiveTab('my-requests')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'my-requests'
                  ? 'bg-[#2677FF] text-white shadow-md shadow-blue-500/25'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <span>My Custom Requests</span>
              {myRequests.length > 0 && (
                <span className="px-2 py-0.2 rounded-full bg-pink-500 text-white text-[10px]">
                  {myRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Decorative graphic */}
        <div className="absolute right-6 -bottom-8 opacity-15 pointer-events-none hidden sm:block">
          <Shirt className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: STUDIO BUILDER */}
      {/* ============================================================== */}
      {activeTab === 'studio' && (
        <>
          {submissionSuccess ? (
            /* Success confirmation card */
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs text-center max-w-xl mx-auto space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-heading font-black text-[#172033]">
                Custom Kit Request Received!
              </h2>
              <p className="text-xs text-slate-500">
                Your request reference code is{' '}
                <strong className="text-[#2677FF] font-mono text-sm">
                  {submissionSuccess.requestReference}
                </strong>
                . Our sportswear tailoring team will review your specs, verify the crest, and prepare an official quotation.
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-left space-y-1">
                <p>
                  <strong>Sport:</strong> {submissionSuccess.sport}
                </p>
                <p>
                  <strong>Team:</strong> {submissionSuccess.teamInfo?.teamName} (
                  {submissionSuccess.teamInfo?.organization})
                </p>
                <p>
                  <strong>Total Quantity:</strong> {submissionSuccess.totalQuantity} items
                </p>
                <p>
                  <strong>Contact:</strong> {submissionSuccess.teamInfo?.contactEmail}
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSubmissionSuccess(null);
                    setCurrentStep(1);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Create Another Request
                </button>
                <button
                  onClick={() => setActiveTab('my-requests')}
                  className="px-5 py-2.5 rounded-xl bg-[#0B1730] text-white text-xs font-bold hover:bg-[#172033]"
                >
                  View My Requests
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Interactive Live Jersey Mockup + Direct Quick Buy Card */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-heading font-black text-sm text-[#172033]">
                        Live Kit Visualizer
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Real-time collegiate mockup
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2677FF] font-bold text-[10px] uppercase">
                      {sport}
                    </span>
                  </div>

                  {/* Dynamic SVG Jersey Mockup */}
                  <JerseyPreview
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    accentColor={accentColor}
                    jerseyStyle={jerseyStyle}
                    sport={sport}
                    teamName={teamName}
                    organization={organization}
                    playerName={playerName}
                    jerseyNumber={jerseyNumber}
                    logoUrl={logoUrl}
                    view={previewView}
                    onViewChange={setPreviewView}
                  />

                  {/* Direct Single Custom Jersey Purchase Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Single Custom Jersey
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-heading font-black text-lg text-[#172033]">
                            ₹899
                          </span>
                          <span className="text-[10px] text-emerald-600 font-bold">
                            (Free Sublimation Print)
                          </span>
                        </div>
                      </div>

                      {/* Size picker for single kit */}
                      <div className="flex items-center gap-1">
                        {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSingleSize(sz)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              singleSize === sz
                                ? 'bg-[#0B1730] text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={addingToBag}
                      onClick={handleAddCustomToBag}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#2677FF] hover:bg-[#1b64e0] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {addingToBag ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <ShoppingBag className="w-3.5 h-3.5" />
                      )}
                      <span>Add Customized Kit to Bag (1 Pc)</span>
                    </button>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Squad Bulk (12+ units):</span>
                      <strong className="text-[#2677FF] font-heading font-bold">₹799 / unit</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Step Progress Bar & Multi-Step Wizard Cards */}
              <div className="lg:col-span-7 space-y-6">
                {/* Step Progress Bar */}
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs overflow-x-auto">
                <div className="flex items-center justify-between min-w-[540px]">
                  {STEPS.map((st, idx) => {
                    const isPassed = currentStep > st.num;
                    const isCurrent = currentStep === st.num;

                    return (
                      <div key={st.num} className="flex items-center flex-1 last:flex-none">
                        <button
                          type="button"
                          onClick={() => {
                            if (st.num < currentStep) setCurrentStep(st.num);
                          }}
                          className={`flex items-center gap-2 group text-left ${
                            st.num <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isPassed
                                ? 'bg-emerald-500 text-white'
                                : isCurrent
                                ? 'bg-[#2677FF] text-white ring-4 ring-blue-100 shadow-sm'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {isPassed ? <Check className="w-4 h-4" /> : st.num}
                          </div>
                          <span
                            className={`text-xs font-bold whitespace-nowrap ${
                              isCurrent ? 'text-[#2677FF]' : isPassed ? 'text-slate-800' : 'text-slate-400'
                            }`}
                          >
                            {st.title}
                          </span>
                        </button>
                        {idx < STEPS.length - 1 && (
                          <div
                            className={`h-0.5 flex-1 mx-3 transition-colors ${
                              isPassed ? 'bg-emerald-400' : 'bg-slate-100'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step Cards Container */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
                {/* STEP 1: SELECT SPORT */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="text-xl font-heading font-black text-[#172033]">
                        Step 1: Choose Your Team Sport
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Select the primary collegiate discipline for your custom uniform.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {SPORTS.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => setSport(s.id)}
                          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                            sport === s.id
                              ? 'border-[#2677FF] bg-blue-50/40 ring-2 ring-[#2677FF]/20 shadow-sm'
                              : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="text-3xl mb-3">{s.icon}</div>
                          <h3 className="font-heading font-bold text-sm text-[#172033]">{s.name}</h3>
                          <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: SELECT KIT TYPE */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="text-xl font-heading font-black text-[#172033]">
                        Step 2: Choose Kit Specification
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Select whether you need standalone match jerseys, full tournament kits, or merchandise.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {KIT_TYPES.map((k) => (
                        <div
                          key={k.id}
                          onClick={() => setKitType(k.id)}
                          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                            kitType === k.id
                              ? 'border-[#2677FF] bg-blue-50/40 ring-2 ring-[#2677FF]/20 shadow-sm'
                              : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                          }`}
                        >
                          <h3 className="font-heading font-bold text-sm text-[#172033] flex items-center justify-between">
                            <span>{k.name}</span>
                            {kitType === k.id && <CheckCircle2 className="w-4 h-4 text-[#2677FF]" />}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">{k.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: TEAM & CONTACT INFORMATION */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="text-xl font-heading font-black text-[#172033]">
                        Step 3: Team & College Details
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Tell us about your team and how our kit studio representative can reach you.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Team Name *</label>
                        <input
                          type="text"
                          required
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="e.g. CAMPUS TITANS XI"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2677FF] font-bold uppercase"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          College or Organization *
                        </label>
                        <input
                          type="text"
                          required
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="e.g. D.Y. Patil University / IIT Bombay"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2677FF]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Captain / Contact Person *
                        </label>
                        <input
                          type="text"
                          required
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          placeholder="e.g. Rahul Deshmukh"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2677FF]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Contact Email *</label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="captain@college.edu"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2677FF]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">
                          Contact Phone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2677FF]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: DESIGN PREFERENCES & LOGO */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="text-xl font-heading font-black text-[#172033]">
                        Step 4: Design, Colors & Team Crest
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Select team colors, collar style, and attach your university or department logo.
                      </p>
                    </div>

                    {/* Presets */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Popular Color Palettes
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {PRESET_COLOR_PALETTES.map((pal) => (
                          <button
                            key={pal.name}
                            type="button"
                            onClick={() => {
                              setPrimaryColor(pal.primary);
                              setSecondaryColor(pal.secondary);
                              setAccentColor(pal.accent);
                            }}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                              primaryColor === pal.primary && secondaryColor === pal.secondary
                                ? 'border-[#2677FF] ring-2 ring-[#2677FF]/20 bg-blue-50/30'
                                : 'border-slate-100 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex gap-1 mb-2">
                              <span
                                className="w-5 h-5 rounded-full border border-black/10"
                                style={{ backgroundColor: pal.primary }}
                              />
                              <span
                                className="w-5 h-5 rounded-full border border-black/10"
                                style={{ backgroundColor: pal.secondary }}
                              />
                              <span
                                className="w-5 h-5 rounded-full border border-black/10"
                                style={{ backgroundColor: pal.accent }}
                              />
                            </div>
                            <p className="text-[11px] font-bold text-[#172033] line-clamp-1">
                              {pal.name}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Color Pickers */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Primary Color *</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                          />
                          <input
                            type="text"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Secondary Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={secondaryColor || '#2677FF'}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                          />
                          <input
                            type="text"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Accent / Numbers</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={accentColor || '#FFFFFF'}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                          />
                          <input
                            type="text"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs uppercase"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Jersey Style */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Jersey Cut & Collar Style *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {JERSEY_STYLES.map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setJerseyStyle(st)}
                            className={`p-3 rounded-xl border text-xs font-bold text-left cursor-pointer transition-all ${
                              jerseyStyle === st
                                ? 'border-[#2677FF] bg-blue-50/50 text-[#2677FF] ring-1 ring-[#2677FF]'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Player Name and Jersey Number Personalization */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Player Name on Back (Max 14 chars)
                        </label>
                        <input
                          type="text"
                          maxLength={14}
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                          placeholder="e.g. CAPTAIN"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-heading font-black text-xs uppercase focus:outline-none focus:border-[#2677FF]"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Rendered live on the jersey back view</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Jersey Number (00-99)
                        </label>
                        <input
                          type="text"
                          maxLength={3}
                          value={jerseyNumber}
                          onChange={(e) => setJerseyNumber(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="10"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-heading font-black text-xs focus:outline-none focus:border-[#2677FF]"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Rendered live on front & back</p>
                      </div>
                    </div>

                    {/* Team Crest / Logo Upload */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-xs">
                        <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                          <Upload className="w-4 h-4 text-[#2677FF]" />
                          <span>Upload Team Crest / Logo (Max 5MB)</span>
                        </label>
                        <p className="text-[11px] text-slate-400 mb-3">
                          PNG, SVG, or high-res JPG for chest printing
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0B1730] file:text-white hover:file:bg-[#172033]"
                        />
                        {uploadingLogo && <p className="text-[11px] text-blue-600 mt-2">Uploading logo...</p>}
                        {logoUrl && (
                          <div className="mt-3 flex items-center gap-3">
                            <img src={logoUrl} alt="Logo preview" className="w-12 h-12 object-contain rounded-lg border bg-white p-1" />
                            <span className="text-[11px] text-emerald-600 font-bold">Crest attached!</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs">
                        <label className="block font-bold text-slate-700 mb-1">
                          Reference Design Link / Image URL
                        </label>
                        <p className="text-[11px] text-slate-400 mb-2">
                          Got an existing jersey design inspiration? Paste image URL here
                        </p>
                        <input
                          type="url"
                          value={referenceImageUrl}
                          onChange={(e) => setReferenceImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#2677FF] text-xs"
                        />
                      </div>
                    </div>

                    {/* Roster & Numbers */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Player Names & Numbers Notes (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={rosterNotes}
                        onChange={(e) => setRosterNotes(e.target.value)}
                        placeholder="e.g. 10 - SHARMA (L), 07 - VERMA (M), 18 - KOHLI (XL) or specify captain arm-band requirements."
                        className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#2677FF]"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 5: SIZE BREAKDOWN */}
                {currentStep === 5 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h2 className="text-xl font-heading font-black text-[#172033]">
                          Step 5: Size Breakdown & Quantities
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          Specify how many units your squad needs in each standardized jersey size.
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 border border-blue-100 text-[#2677FF] self-start sm:self-auto">
                        <Users className="w-4 h-4" />
                        <span className="font-heading font-black text-sm">
                          Total Squad Order: {totalQuantity} kits
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                        <div
                          key={sz}
                          className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-center space-y-2"
                        >
                          <span className="text-xs font-bold text-slate-400 uppercase">Size</span>
                          <p className="font-heading font-black text-lg text-[#172033]">{sz}</p>

                          <div className="flex items-center justify-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => updateSizeCount(sz, -1)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold flex items-center justify-center text-xs"
                            >
                              -
                            </button>
                            <span className="font-bold text-sm text-[#172033] w-6">
                              {sizes[sz] || 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateSizeCount(sz, 1)}
                              className="w-7 h-7 rounded-lg bg-[#2677FF] text-white hover:bg-[#1b64e0] font-bold flex items-center justify-center text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Collegiate Bulk Pricing Advantage</p>
                        <p className="text-[11px] mt-0.5">
                          Orders of 12+ units receive subsidized university tournament pricing, complimentary digital crest vectorization, and individual player names printed at zero extra charge.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: DELIVERY SCHEDULE & INSTRUCTIONS */}
                {currentStep === 6 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="text-xl font-heading font-black text-[#172033]">
                        Step 6: Delivery Timeline & Special Notes
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        When is your tournament or matchday? Let our production line know your target date.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#2677FF]" />
                          <span>Desired Delivery Date</span>
                        </label>
                        <input
                          type="date"
                          value={desiredDeliveryDate}
                          onChange={(e) => setDesiredDeliveryDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2677FF]"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          Standard custom sublimation turnaround is 7–10 days. Expedited production available for varsity matches.
                        </p>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Special Instructions / Fabric Requirements
                        </label>
                        <textarea
                          rows={4}
                          value={instructions}
                          onChange={(e) => setInstructions(e.target.value)}
                          placeholder="e.g. Need mesh underarm ventilation panels, college emblem on left sleeve, sponsor logo on back."
                          className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#2677FF]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 7: REVIEW & SUBMIT */}
                {currentStep === 7 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <h2 className="text-xl font-heading font-black text-[#172033]">
                        Step 7: Final Request Summary
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Review your customization request before sending it to the DYPULSE studio workshop.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      {/* Left specs card */}
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                        <h3 className="font-bold text-sm text-[#172033] pb-2 border-b border-slate-200">
                          Team & Sport Specifications
                        </h3>
                        <p>
                          <span className="text-slate-500">Sport:</span>{' '}
                          <strong className="text-slate-800">{sport}</strong>
                        </p>
                        <p>
                          <span className="text-slate-500">Kit Type:</span>{' '}
                          <strong className="text-slate-800">{kitType}</strong>
                        </p>
                        <p>
                          <span className="text-slate-500">Team Name:</span>{' '}
                          <strong className="text-slate-800">{teamName}</strong>
                        </p>
                        <p>
                          <span className="text-slate-500">Organization:</span>{' '}
                          <strong className="text-slate-800">{organization}</strong>
                        </p>
                        <p>
                          <span className="text-slate-500">Contact:</span>{' '}
                          <strong className="text-slate-800">
                            {contactPerson} ({contactEmail})
                          </strong>
                        </p>
                        <p>
                          <span className="text-slate-500">Phone:</span>{' '}
                          <strong className="text-slate-800">{contactPhone || 'N/A'}</strong>
                        </p>
                      </div>

                      {/* Right design card */}
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                        <h3 className="font-bold text-sm text-[#172033] pb-2 border-b border-slate-200">
                          Design & Quantities
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Colors:</span>
                          <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: primaryColor }} />
                          <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: secondaryColor }} />
                          <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: accentColor }} />
                        </div>
                        <p>
                          <span className="text-slate-500">Collar / Cut:</span>{' '}
                          <strong className="text-slate-800">{jerseyStyle}</strong>
                        </p>
                        <p>
                          <span className="text-slate-500">Player & Number:</span>{' '}
                          <strong className="text-slate-800">#{jerseyNumber} {playerName}</strong>
                        </p>
                        <p>
                          <span className="text-slate-500">Total Quantity:</span>{' '}
                          <strong className="text-slate-800 font-heading font-black text-sm text-[#2677FF]">
                            {totalQuantity} Units
                          </strong>
                        </p>
                        <p>
                          <span className="text-slate-500">Size Breakdown:</span>{' '}
                          <span className="font-mono text-slate-700">
                            {Object.entries(sizes)
                              .filter(([_, q]) => q > 0)
                              .map(([s, q]) => `${s}:${q}`)
                              .join(', ')}
                          </span>
                        </p>
                        {desiredDeliveryDate && (
                          <p>
                            <span className="text-slate-500">Target Delivery:</span>{' '}
                            <strong className="text-slate-800">{desiredDeliveryDate}</strong>
                          </p>
                        )}
                        {logoUrl && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-slate-500">Attached Crest:</span>
                            <img src={logoUrl} alt="crest" className="w-6 h-6 object-contain rounded border bg-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    {!isAuthenticated && (
                      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-[#2677FF] shrink-0" />
                          <span>Please sign in or create an account to submit your team kit request.</span>
                        </div>
                        <Link
                          to="/login"
                          className="px-4 py-2 bg-[#2677FF] text-white font-bold rounded-xl whitespace-nowrap"
                        >
                          Sign In to Submit
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Controls */}
                <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 7 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-2.5 rounded-xl bg-[#2677FF] hover:bg-[#1b64e0] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={submitting || !isAuthenticated}
                      onClick={handleSubmitRequest}
                      className="px-8 py-3 rounded-xl bg-[#0B1730] hover:bg-[#172033] text-white text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Transmitting to Workshop...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Team Kit Request</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MY SUBMITTED REQUESTS */}
      {/* ============================================================== */}
      {activeTab === 'my-requests' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-heading font-black text-[#172033]">
                Your Team Kit Requests ({myRequests.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor status updates, inspect tailored quotations, and chat with the workshop.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('studio')}
              className="px-4 py-2 rounded-xl bg-[#2677FF] text-white text-xs font-bold hover:bg-[#1b64e0] flex items-center gap-1.5"
            >
              <span>+ New Kit Request</span>
            </button>
          </div>

          {!isAuthenticated ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
              <p>Please log in to view your team's submitted customization requests.</p>
              <Link to="/login" className="inline-block mt-3 px-5 py-2 bg-[#2677FF] text-white font-bold rounded-xl">
                Log In
              </Link>
            </div>
          ) : loadingRequests ? (
            <div className="py-12 bg-white rounded-3xl border border-slate-200">
              <Spinner fullPage={false} label="Retrieving custom squad requests..." />
            </div>
          ) : myRequests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 space-y-3">
              <p>No customized kit requests found for your account.</p>
              <button
                onClick={() => setActiveTab('studio')}
                className="px-6 py-2.5 bg-[#2677FF] text-white font-bold rounded-xl"
              >
                Start Your First Team Kit
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((req) => {
                const canCancel = ['Submitted', 'Under Review'].includes(req.status);

                return (
                  <div
                    key={req._id}
                    className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-black text-sm text-[#172033]">
                            {req.teamInfo?.teamName}
                          </span>
                          <span className="font-mono text-xs text-slate-400">
                            #{req.requestReference}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              req.status === 'Completed' || req.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : req.status === 'In Production'
                                ? 'bg-blue-50 text-[#2677FF] border border-blue-200'
                                : req.status === 'Quotation Prepared'
                                ? 'bg-purple-50 text-[#8157F5] border border-purple-200'
                                : req.status === 'Cancelled' || req.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {req.sport} • {req.kitType} • {req.totalQuantity} items • Submitted on{' '}
                          {formatDate(req.createdAt)}
                        </p>
                      </div>

                      {/* Quotation Badge if available */}
                      {req.quotation?.estimatedPriceInPaise ? (
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Quoted Estimate</p>
                          <p className="font-heading font-black text-base text-emerald-600">
                            {formatPrice(req.quotation.estimatedPriceInPaise / 100)}
                          </p>
                          {req.quotation.pricePerUnitInPaise && (
                            <p className="text-[10px] text-slate-500">
                              ₹{req.quotation.pricePerUnitInPaise / 100} / unit
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-left sm:text-right text-xs text-slate-400 italic">
                          Quotation Under Review
                        </div>
                      )}
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl">
                      <div>
                        <p className="text-slate-400 text-[11px] font-bold">Collar & Colors</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{req.design?.jerseyStyle}</p>
                        <div className="flex gap-1 mt-1">
                          <span className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: req.design?.primaryColor }} />
                          <span className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: req.design?.secondaryColor }} />
                          <span className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: req.design?.accentColor }} />
                        </div>
                      </div>

                      <div>
                        <p className="text-slate-400 text-[11px] font-bold">Size Breakdown</p>
                        <p className="font-mono text-slate-700 mt-0.5">
                          {req.sizeBreakdown
                            ? Object.entries(req.sizeBreakdown)
                                .filter(([_, q]) => q > 0)
                                .map(([s, q]) => `${s}:${q}`)
                                .join(' | ')
                            : 'Standard'}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400 text-[11px] font-bold">Workshop Message</p>
                        <p className="text-slate-700 mt-0.5 italic">
                          {req.quotation?.notes || req.adminNotes || 'Reviewing design crest with digital vectorization.'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-1">
                      {canCancel && (
                        <button
                          onClick={() => handleCancelRequest(req._id)}
                          disabled={cancellingId === req._id}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                        >
                          {cancellingId === req._id ? 'Cancelling...' : 'Cancel Request'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
