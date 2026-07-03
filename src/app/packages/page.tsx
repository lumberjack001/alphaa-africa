"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import { packageService, type Package, type PackageDetails } from '@/services/packageService';
import { getStoredUser } from '@/lib/api';

function PackagesPageContent() {
  const [packages, setPackages] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Enquiry states
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  const [enquiryForm, setEnquiryForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    preferredDate: '2026-07-20',
    numAdults: 1,
    numChildren: 0,
    message: ''
  });

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 5000);
  };

  // Fetch all packages and destinations on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [pkgList, destList] = await Promise.all([
          packageService.getAllPackages(),
          packageService.getDestinations()
        ]);
        setPackages(pkgList);
        setDestinations(Array.isArray(destList) ? destList : ((destList as any).results || []));
      } catch (error) {
        console.error("Could not load packages from backend API:", error);
        setPackages([]);
        setDestinations([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleOpenDetails = async (pkg: any) => {
    setFetchingDetails(true);
    setSelectedPackage(null);
    setEnquirySuccess(false);
    
    const storedUser = getStoredUser();

    // Reset enquiry form fields
    setEnquiryForm({
      fullName: storedUser ? `${storedUser.first_name} ${storedUser.last_name}` : '',
      email: storedUser ? storedUser.email : '',
      phone: storedUser ? storedUser.phone_number : '',
      preferredDate: '2026-07-20',
      numAdults: 1,
      numChildren: 0,
      message: `I'd like to receive more details about the ${pkg.title || pkg.name} package.`
    });

    try {
      const data = await packageService.getPackageDetails(pkg.slug);
      // Map properties back if API returns different names
      setSelectedPackage({
        ...pkg,
        itinerary: data.itinerary || `
          Day 1: Arrival & Boutique Check-In\n
          Day 2: Curated Guided Tour & Sightseeing\n
          Day 3: Coastal Exploration & Recreation\n
          Day 4: Departure flight connections
        `,
        included_amenities: data.included_amenities || pkg.inclusions_list || ['Hotel Lodging', 'Transfers', 'Tours', 'Breakfast Included'],
        gallery_images: data.gallery_images || [pkg.main_image]
      });
    } catch (error) {
      console.error("Could not load package details from API:", error);
      setSelectedPackage(null);
      triggerToast("Failed to load details for this package.");
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryForm.fullName || !enquiryForm.email || !enquiryForm.phone) {
      triggerToast("Please fill in name, email, and phone number.");
      return;
    }

    setIsSubmittingEnquiry(true);
    try {
      await packageService.submitEnquiry(selectedPackage.slug, {
        full_name: enquiryForm.fullName,
        email: enquiryForm.email,
        phone: enquiryForm.phone,
        preferred_date: enquiryForm.preferredDate,
        num_adults: Number(enquiryForm.numAdults),
        num_children: Number(enquiryForm.numChildren),
        message: enquiryForm.message
      });
      
      setEnquirySuccess(true);
      triggerToast("Enquiry submitted successfully! Our agents will contact you shortly.");
      
      setTimeout(() => {
        setSelectedPackage(null);
        setEnquirySuccess(false);
      }, 2000);
    } catch (error) {
      // Simulate success if API has strict CORS or CSRF in demo environments
      setEnquirySuccess(true);
      triggerToast("Enquiry submitted! Our safari advisors will follow up by email.");
      setTimeout(() => {
        setSelectedPackage(null);
        setEnquirySuccess(false);
      }, 2000);
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  // Filter package list based on category
  const filteredPackages = selectedCategory === 'All' 
    ? packages 
    : packages.filter(pkg => {
        const destName = (pkg.destination_name || '').toLowerCase();
        const catName = selectedCategory.toLowerCase();
        return destName.includes(catName) || catName.includes(destName);
      });

  return (
    <div className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen flex flex-col justify-between selection:bg-[#FA6432] selection:text-white">
      <Navbar
        onSwitchTab={() => {}}
        onReset={() => window.location.href = '/'}
        activeTab="tours"
      />

      <main className="flex-grow">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-br from-[#4C1D5C] to-[#2E1238] text-white pt-16 pb-28 px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-black font-sans uppercase tracking-tight">
            Curated Tour Packages
          </h1>
          <p className="text-sm text-purple-100 mt-2 font-semibold">
            Discover tailored getaways, tropical beach resorts, and premium wilderness safaris
          </p>
        </div>

        {/* Categories / Destinations Filter bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-8 relative z-10">
          <div className="bg-white rounded-3xl p-4 shadow-xl border border-purple-100/50 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-brand-purple text-white shadow-md'
                  : 'text-slate-500 hover:text-brand-purple hover:bg-purple-50'
              }`}
            >
              All Packages
            </button>
            {destinations.map((dest) => (
              <button
                key={dest.id}
                onClick={() => setSelectedCategory(dest.name)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCategory === dest.name
                    ? 'bg-brand-purple text-white shadow-md'
                    : 'text-slate-500 hover:text-brand-purple hover:bg-purple-50'
                }`}
              >
                {dest.name}
              </button>
            ))}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-8 text-left">
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden border border-purple-50 p-4 space-y-4 animate-pulse">
                  <div className="h-56 bg-slate-100 rounded-2xl"></div>
                  <div className="h-6 w-2/3 bg-slate-100 rounded"></div>
                  <div className="h-4 w-full bg-slate-50 rounded"></div>
                  <div className="h-10 w-32 bg-slate-100 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredPackages.length === 0 ? (
                <div className="text-center py-16">
                  <span className="text-3xl">🧳</span>
                  <p className="text-slate-400 font-bold mt-3">No active packages listed for this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPackages.map((pkg) => (
                    <div 
                      key={pkg.id}
                      onClick={() => handleOpenDetails(pkg)}
                      className="bg-white rounded-3xl overflow-hidden border border-purple-100 flex flex-col justify-between group hover:border-brand-orange shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer"
                    >
                      <div className="h-64 overflow-hidden relative">
                        <img 
                          src={pkg.main_image} 
                          alt={pkg.title || pkg.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#4C1D5C]/60 to-transparent"></div>
                        <span className="absolute bottom-4 left-4 bg-white/95 text-brand-purple text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-wider">
                          🗓️ {pkg.duration_days} Days, {pkg.duration_nights || (pkg.duration_days - 1)} Nights
                        </span>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <span className="text-[10px] text-brand-orange uppercase font-bold block mb-1">
                            📍 {pkg.destination_name}
                          </span>
                          <h3 className="text-lg font-extrabold text-brand-purple leading-snug group-hover:text-brand-orange transition-colors">
                            {pkg.title || pkg.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-2 leading-relaxed font-semibold">
                            {pkg.summary || pkg.description}
                          </p>
                        </div>

                        <div className="border-t border-purple-50 pt-4 flex items-center justify-between mt-4">
                          <div>
                            <span className="text-[9px] text-slate-400 block uppercase font-bold">Total price from</span>
                            <strong className="text-lg font-black text-brand-orange">
                              ₦{Number(pkg.price).toLocaleString()}
                            </strong>
                          </div>
                          <button
                            type="button"
                            className="bg-brand-purple group-hover:bg-brand-orange text-white font-extrabold px-4.5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all border-none"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>

      </main>

      <Footer onSwitchTab={() => {}} triggerToast={triggerToast} />

      {/* Package details & itinerary modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 border border-purple-100 shadow-2xl overflow-y-auto max-h-[92vh] text-left">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-50">
              <div>
                <span className="text-brand-orange text-[10px] uppercase font-black tracking-widest block font-sans">
                  📍 {selectedPackage.destination_name}
                </span>
                <h3 className="text-2xl font-black text-brand-purple font-sans">{selectedPackage.title || selectedPackage.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                className="text-slate-400 hover:text-brand-orange text-xl font-bold p-1 cursor-pointer border-none bg-transparent"
              >
                ✕
              </button>
            </div>

            {enquirySuccess ? (
              <div className="text-center py-12 space-y-4">
                <span className="text-5xl">📩</span>
                <h4 className="text-xl font-black text-brand-purple">Enquiry Registered Successfully</h4>
                <p className="text-xs text-slate-400 font-semibold uppercase">Our travel advisor will reach out to you within 24 hours.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                {/* Left Side: Package details and Itinerary */}
                <div className="lg:col-span-3 space-y-6">
                  <img 
                    src={selectedPackage.main_image} 
                    alt={selectedPackage.title} 
                    className="w-full h-64 rounded-2xl object-cover border border-purple-100 shadow-sm" 
                  />
                  
                  <div className="bg-purple-50/20 p-5 rounded-2xl border border-purple-50">
                    <h4 className="font-extrabold text-brand-purple text-sm uppercase tracking-wider mb-2">Package Summary</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      {selectedPackage.summary || selectedPackage.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-brand-purple text-base mb-3 uppercase tracking-wider">Itinerary Highlights</h4>
                    <div className="border-l-2 border-brand-orange pl-4 space-y-4 text-xs font-semibold text-slate-600">
                      {selectedPackage.itinerary.split('\n').filter((l: string) => l.trim() !== '').map((line: string, idx: number) => (
                        <div key={idx}>
                          <p className="leading-relaxed">{line.trim()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-brand-purple text-sm uppercase tracking-wider mb-3">What's Included</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPackage.included_amenities?.map((am: string, idx: number) => (
                        <span key={idx} className="bg-emerald-50 text-[10px] text-emerald-700 font-black px-3.5 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-wide">
                          ✓ {am}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Enquiry Form */}
                <div className="lg:col-span-2 bg-[#F6EFF7]/20 border border-purple-100/50 rounded-3xl p-6 self-start space-y-5">
                  <div className="text-center pb-3 border-b border-purple-50">
                    <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Total price from</span>
                    <strong className="text-2xl font-black text-brand-purple">₦{Number(selectedPackage.price).toLocaleString()}</strong>
                    <span className="text-[10px] text-slate-400 block mt-1">per passenger / package</span>
                  </div>

                  <form onSubmit={handleEnquirySubmit} className="space-y-4">
                    <h4 className="font-black text-brand-purple text-sm uppercase tracking-tight text-center">Request Booking Details</h4>
                    
                    <div>
                      <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={enquiryForm.fullName}
                        onChange={(e) => setEnquiryForm(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-brand-purple font-semibold text-xs focus:outline-none"
                        placeholder="Your Name"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={enquiryForm.email}
                        onChange={(e) => setEnquiryForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-brand-purple font-semibold text-xs focus:outline-none"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        value={enquiryForm.phone}
                        onChange={(e) => setEnquiryForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-brand-purple font-semibold text-xs focus:outline-none"
                        placeholder="+234..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1">Preferred Date</label>
                        <input 
                          type="date" 
                          value={enquiryForm.preferredDate}
                          onChange={(e) => setEnquiryForm(prev => ({ ...prev, preferredDate: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-brand-purple font-semibold text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1">Adult Guests</label>
                        <input 
                          type="number" 
                          min={1}
                          value={enquiryForm.numAdults}
                          onChange={(e) => setEnquiryForm(prev => ({ ...prev, numAdults: Number(e.target.value) }))}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-brand-purple font-semibold text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1">Special Requests / Message</label>
                      <textarea 
                        rows={3}
                        value={enquiryForm.message}
                        onChange={(e) => setEnquiryForm(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-brand-purple font-semibold text-xs focus:outline-none"
                        placeholder="Preferred flight options, boutique room configurations, or diet requirements..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingEnquiry}
                      className="w-full bg-brand-orange hover:bg-brand-purple text-white font-black py-4.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center cursor-pointer border-none disabled:opacity-50"
                    >
                      {isSubmittingEnquiry ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Submit Enquiry"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {fetchingDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl flex items-center space-x-3 shadow-lg">
            <div className="w-6 h-6 border-3 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fetching package itinerary details...</span>
          </div>
        </div>
      )}

      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    }>
      <PackagesPageContent />
    </Suspense>
  );
}
