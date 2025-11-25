import React from 'react';
import { Tent } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
      <div className="h-full flex flex-col items-center justify-center bg-forest-900 text-white relative overflow-hidden">
        <div
            className="absolute inset-0 opacity-20 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2000&auto=format&fit=crop')" }}
        />
        <div className="z-10 text-center p-8 max-w-2xl animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm shadow-2xl">
              <Tent size={64} className="text-forest-300" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 tracking-tight">Matwart App</h1>
          <p className="text-xl text-forest-100 mb-12 leading-relaxed">
            State of the art Ausleihe Tool <br/>
            für die Pfadiabteilung Güetli
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
                href="/browse"
                className="px-8 py-4 bg-forest-500 hover:bg-forest-400 text-white rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-xl inline-block"
            >
              Material Durchstöbern
            </Link>
            <Link
                href="/admin"
                className="px-8 py-4 bg-stone-800 hover:bg-stone-700 text-white rounded-lg font-bold text-lg transition-all shadow-xl border border-stone-700 inline-block"
            >
              Administrator Ansicht
            </Link>
          </div>
        </div>
        <div className="absolute bottom-4 text-forest-400 text-sm">
          Güetli -- Alle Rechte Vorbehalten
        </div>
      </div>
  );
}