"use client";

import React, { useState } from 'react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "How can I book a cheap flight in Nigeria?",
    answer: "You can book a cheap flight in Nigeria by searching for flights online and comparing prices from different airlines using travel websites like Alphaa.Africa Travels & Tours to compare prices and find the best deals. Once you’ve found the cheapest flight, book it online. Double-check all of the information before confirming your booking. Pay for the flight using a credit card or other secure payment method. As soon as your payment clears, you’ll get a confirmation email containing your flight details. Keep this email in a safe place. Print out your ticket or boarding pass and bring it with you to the airport."
  },
  {
    id: 2,
    question: "Which site is best for flight booking?",
    answer: "The best site for domestic and international flight booking depends on your needs, budget, and preferences. The most popular flight booking site to use is without a doubt, Alphaa.Africa Travels & Tours. We are available 24/7 to provide travellers with convenient access to local and international flights, competitive fares, hotel reservations, tour packages, airport transfers and visa assistance, making us a one-stop travel solution for your journey."
  },
  {
    id: 3,
    question: "Can I use my NIN to book a flight?",
    answer: "Yes, you can use your NIN to book a domestic flight. However, some airlines may require additional identification documents like your international passport especially for international trips to verify your identity. Check with the airline you are traveling with for more information."
  },
  {
    id: 4,
    question: "What is the cheapest day to buy plane tickets?",
    answer: "There isn't a specific \"cheapest day\" to buy plane tickets. The best way to get the most affordable prices is to book well in advance especially during the week and regularly check the Alphaa.Africa Travels & Tours site for deals."
  },
  {
    id: 5,
    question: "How much is a ticket from Nigeria to the USA?",
    answer: "The cost of a ticket from Nigeria to the USA depends on various factors, including the type of ticket, time of year, airline, and trip length. Therefore, there is no single answer to this question."
  },
  {
    id: 6,
    question: "Where and how can I get the cheapest flights?",
    answer: "Alphaa.Africa Travels & Tours is the best place to find the cheapest flights. Visit our platform or speak with our seasoned travel agents who are always ready to help you find the best available flight deals based on your destination, budget and travel dates."
  },
  {
    id: 7,
    question: "Which local flight is best in Nigeria?",
    answer: "The best local flight in Nigeria depends on your destination, travel dates, preferred airline, budget and other travel preferences. Alphaa.Africa Travels & Tours gives you access to available domestic flight options and helps you choose the most suitable flight for your journey. You can book a flight with Alphaa.Africa Travels & Tours to access some of the best deals in the country."
  },
  {
    id: 8,
    question: "Can I book a flight within Nigeria without a passport?",
    answer: "Yes, you can book a flight within Nigeria without a passport, provided you have other valid forms of identification such as a driver's license, National ID card, or Voter's card. Booking without any valid identification is not possible."
  },
  {
    id: 9,
    question: "How much is a flight from Lagos to Abuja?",
    answer: "The cost of a ticket from Lagos to Abuja depends on the type of ticket, time of year, airline, and other factors. Typically, the price ranges from N80,000 to N150,000 for a one-way flight. For the latest available fares, check Alphaa.Africa Travels & Tours for current flight options."
  },
  {
    id: 10,
    question: "Can I travel to Abuja without a passport?",
    answer: "Yes, you can travel to Abuja without a passport as long as you provide other valid forms of identification such as a driver's license, National ID card, or Voter's card. Booking without any valid identification is not possible."
  }
];

export default function FAQSection() {
  const [openIds, setOpenIds] = useState<number[]>([1, 6]);

  const toggleFAQ = (id: number) => {
    setOpenIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const whatsappUrl = "https://api.whatsapp.com/send?phone=2347066851051&text=Hello%20Alphaa.Africa%2C%0AI%27d%20like%20to%20inquire%20about%20Fly%20Now%20Pay%20Later%20flexible%20payment%20options";

  const col1Data = faqData.slice(0, 5);
  const col2Data = faqData.slice(5, 10);

  const renderFAQColumn = (items: FAQItem[]) => (
    <div className="space-y-4">
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id} className="transition-all duration-300">
            {/* Header / Trigger */}
            <button
              onClick={() => toggleFAQ(item.id)}
              className={`w-full text-left flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 cursor-pointer border-none outline-none ${
                isOpen
                  ? 'bg-[#4f1758] text-white shadow-lg ring-1 ring-[#4f1758]/20'
                  : 'bg-[#f4f4f7] text-slate-800 hover:bg-[#e9e9f0]'
              }`}
            >
              <span className={`font-bold text-sm sm:text-base pr-4 leading-snug ${isOpen ? 'text-white' : 'text-slate-800'}`}>
                {item.question}
              </span>
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                  isOpen ? 'bg-white text-slate-900' : 'bg-[#4f1758] text-white'
                }`}
              >
                <svg
                  className={`w-4 h-4 fill-current transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                >
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                </svg>
              </span>
            </button>

            {/* Content Body */}
            {isOpen && (
              <div className="mt-1 bg-white border border-slate-100 rounded-b-2xl p-5 text-slate-600 text-xs sm:text-sm leading-relaxed shadow-sm transition-all duration-300">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-16">

      {/* Title & Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-[#ff6736] bg-[#ff6736]/10 px-4 py-1.5 rounded-full inline-block">
          Help &amp; Information
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
          Frequently Asked Questions
        </h2>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
          Everything you need to know about booking domestic &amp; international flights, payments, and travel guidelines with Alphaa.Africa.
        </p>
      </div>

      {/* 2-Column Accordion Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {renderFAQColumn(col1Data)}
        {renderFAQColumn(col2Data)}
      </div>

      {/* Fly Now, Pay Later Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0f0f1a] via-[#2a0e35] to-[#4f1758] text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-purple-900/40">
        
        {/* Subtle background overlay shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff6736]/10 rounded-full filter blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#4f1758]/30 rounded-full filter blur-2xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Text and Copy Content (Span 7) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#ff6736] animate-pulse"></span>
              <span className="text-[10px] font-black tracking-widest uppercase text-white">Flexible Installments</span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight font-heading">
              Fly Now, Pay Later with Alphaa.Africa&apos;s Flexible Payment Options!
            </h3>

            <div className="space-y-3.5 text-slate-200 text-xs sm:text-sm leading-relaxed font-normal">
              <p>
                Make your travel dreams a reality without immediate financial strain. With Alphaa.Africa&apos;s flexible payment options, you can secure your flight or vacation package today and pay in convenient installments, where applicable.
              </p>
              <p>
                This flexible payment solution allows you to manage your travel budget effectively, ensuring you never miss out on incredible deals or your preferred travel dates.
              </p>
              <p>
                Whether you&apos;re booking flights, hotels, or complete packages, Alphaa.Africa Travels &amp; Tours provides hassle-free payment plans designed to make travel more accessible for everyone.
              </p>
              <p className="font-semibold text-white pt-1">
                Book your next adventure now and experience the freedom of flexible payments with Alphaa.Africa Travels &amp; Tours.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 bg-[#1ebd56] hover:bg-[#19a34a] text-white font-black text-xs sm:text-sm uppercase tracking-wider px-8 py-4 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 border border-white/20 group"
              >
                <svg className="w-5 h-5 fill-current text-white transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>Book on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Authentic Traveler Image (Span 5) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 max-w-md w-full group">
              <img
                src="/travelers_banner_hero.jpg"
                alt="Happy African Travelers with Passports and Luggage"
                className="w-full h-auto object-cover object-center max-h-[420px] transform transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a]/60 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
