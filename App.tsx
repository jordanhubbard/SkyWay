
import React, { useState } from 'react';
import Layout from './components/Layout';
import CategoryTabs from './components/CategoryTabs';
import ImageEditModal from './components/ImageEditModal';
import { AirportData, AirportImages, CategoryType, Flight } from './types';
import { fetchAirportData, generateAirportImages, fetchFlightData } from './services/geminiService';

const App: React.FC = () => {
  const [icaoInput, setIcaoInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImagesLoading, setIsImagesLoading] = useState(false);
  const [isFlightsLoading, setIsFlightsLoading] = useState(false);
  const [data, setData] = useState<AirportData | null>(null);
  const [images, setImages] = useState<AirportImages | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryType>(CategoryType.FLIGHTS);
  const [flightFilter, setFlightFilter] = useState<'all' | 'arrival' | 'departure'>('all');
  const [editingImage, setEditingImage] = useState<{ url: string; key: keyof AirportImages } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!icaoInput || icaoInput.length < 3) return;

    setIsLoading(true);
    setIsImagesLoading(true);
    setIsFlightsLoading(true);
    
    setData(null);
    setImages(null);
    setFlights([]);
    setActiveCategory(CategoryType.FLIGHTS);
    
    try {
      // 1. Fetch Airport Metadata First
      const airportData = await fetchAirportData(icaoInput.toUpperCase());
      setData(airportData);
      setIsLoading(false); // Text data is ready

      // 2. Fetch Images in parallel
      generateAirportImages(icaoInput.toUpperCase(), airportData.name)
        .then(imgRes => {
          setImages(imgRes);
          setIsImagesLoading(false);
        })
        .catch(() => setIsImagesLoading(false));

      // 3. Fetch Flights in parallel
      fetchFlightData(icaoInput.toUpperCase())
        .then(flightRes => {
          setFlights(flightRes);
          setIsFlightsLoading(false);
        })
        .catch(() => setIsFlightsLoading(false));

    } catch (error) {
      console.error("Search error:", error);
      alert("Error fetching airport details. Please check the code and try again.");
      setIsLoading(false);
      setIsImagesLoading(false);
      setIsFlightsLoading(false);
    }
  };

  const handleCategorySelect = async (category: CategoryType) => {
    setActiveCategory(category);
  };

  const handleImageUpdate = (newUrl: string) => {
    if (editingImage && images) {
      setImages({
        ...images,
        [editingImage.key]: newUrl
      });
    }
    setEditingImage(null);
  };

  const filteredFlights = flights.filter(f => flightFilter === 'all' || f.type === flightFilter);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Search Hero */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12 border border-slate-100 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight text-slate-900">
            SkyWay <span className="text-blue-600">Airport</span> Explorer
          </h1>
          <p className="text-slate-500 mb-8 max-w-2xl mx-auto">
            Real-time flight tracking, airfield services, and AI-powered visual discovery for pilots and travelers.
          </p>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="text"
              value={icaoInput}
              onChange={(e) => setIcaoInput(e.target.value.toUpperCase())}
              placeholder="Enter ICAO (e.g. KLAX)"
              className="flex-grow px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-lg font-bold uppercase tracking-widest transition-all"
              maxLength={4}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <i className="fas fa-circle-notch animate-spin text-xl"></i>
              ) : (
                <>
                  <i className="fas fa-search"></i>
                  <span>Explore</span>
                </>
              )}
            </button>
          </form>
        </div>

        {isLoading && !data && (
          <div className="space-y-8 animate-pulse">
            <div className="h-64 bg-slate-100 rounded-3xl"></div>
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-12 w-24 bg-slate-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        )}

        {data && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-grow">
                <div className="flex items-baseline space-x-3 mb-2">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-widest">{data.icao}</span>
                  <h2 className="text-3xl font-bold text-slate-900">{data.name}</h2>
                </div>
                <p className="text-slate-500 mb-4 font-medium"><i className="fas fa-map-marker-alt mr-2 text-blue-500"></i>{data.location}</p>
              </div>
            </div>

            {/* Main Visuals - Resilient to loading */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { key: 'main' as const, label: 'Main View', url: images?.main },
                { key: 'fbo' as const, label: 'FBO/Facilities', url: images?.fbo },
                { key: 'aerial' as const, label: 'Aerial View', url: images?.aerial }
              ].map((img) => (
                <div key={img.key} className="group relative rounded-2xl overflow-hidden shadow-md border border-slate-200 aspect-video bg-slate-50 flex items-center justify-center">
                  {img.url ? (
                    <>
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <p className="text-white font-semibold mb-2">{img.label}</p>
                        <button 
                          onClick={() => setEditingImage({ url: img.url!, key: img.key })}
                          className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 border border-white/30"
                        >
                          <i className="fas fa-wand-magic-sparkles"></i>
                          <span>Enhance with AI</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      {isImagesLoading ? (
                        <>
                          <i className="fas fa-circle-notch animate-spin text-2xl mb-2"></i>
                          <span className="text-xs font-medium">Generating View...</span>
                        </>
                      ) : (
                        <i className="fas fa-image text-4xl opacity-20"></i>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Service Tabs */}
            <CategoryTabs activeCategory={activeCategory} onSelect={handleCategorySelect} />

            {/* Details Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
              <div className="p-8">
                {activeCategory === CategoryType.FLIGHTS && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <i className="fas fa-clock text-blue-600"></i>
                        Live Flight Board
                      </h3>
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        {(['all', 'arrival', 'departure'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => setFlightFilter(type)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                              flightFilter === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            {type}s
                          </button>
                        ))}
                      </div>
                    </div>

                    {isFlightsLoading ? (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <i className="fas fa-circle-notch animate-spin text-3xl mb-4"></i>
                        <p>Syncing live flight data...</p>
                      </div>
                    ) : filteredFlights.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                              <th className="pb-4 px-4">Flight</th>
                              <th className="pb-4 px-4">Origin/Dest</th>
                              <th className="pb-4 px-4">Time (Sch/Est)</th>
                              <th className="pb-4 px-4">Status</th>
                              <th className="pb-4 px-4">Type</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {filteredFlights.map((f, i) => (
                              <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                <td className="py-4 px-4">
                                  <div className="font-bold text-slate-900">{f.flightNumber}</div>
                                  <div className="text-xs text-slate-500 font-medium">{f.airline}</div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="text-sm font-semibold text-slate-700">
                                    {f.type === 'arrival' ? f.origin : f.destination}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="text-sm font-bold text-slate-800">{f.scheduledTime}</div>
                                  <div className="text-xs text-slate-400">{f.estimatedTime || '--:--'}</div>
                                </td>
                                <td className="py-4 px-4">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                    f.status.toLowerCase().includes('delayed') ? 'bg-red-100 text-red-600' : 
                                    f.status.toLowerCase().includes('landed') ? 'bg-blue-100 text-blue-600' :
                                    'bg-green-100 text-green-600'
                                  }`}>
                                    {f.status}
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  <i className={`fas ${f.type === 'arrival' ? 'fa-plane-arrival text-indigo-400' : 'fa-plane-departure text-emerald-400'} text-sm`}></i>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-20 text-slate-400">
                        <i className="fas fa-plane-slash text-4xl mb-4 opacity-20"></i>
                        <p>No live flight data found for this period.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeCategory === CategoryType.SERVICES && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-slate-800">Airport Overview & Services</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                        <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                          <i className="fas fa-building-user text-sm"></i>
                          FBO & Ground Services
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{data.fboInfo || "Comprehensive ground handling data is being retrieved."}</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                        <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                          <i className="fas fa-road text-sm"></i>
                          Runways & Field Data
                        </h4>
                        <ul className="space-y-2">
                          {data.runways.map((r, i) => (
                            <li key={i} className="flex items-center space-x-2 text-sm text-slate-600">
                              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 prose prose-sm max-w-none">
                      <h4 className="font-bold text-slate-800 mb-2">Detailed Summary</h4>
                      <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {data.summary}
                      </div>
                    </div>
                  </div>
                )}

                {activeCategory === CategoryType.GAS && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <i className="fas fa-gas-pump text-blue-600"></i>
                      Fuel & Technical Services
                    </h3>
                    <p className="text-slate-600 leading-relaxed">{data.fuelServices}</p>
                  </div>
                )}

                {activeCategory === CategoryType.RESTAURANTS && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <i className="fas fa-utensils text-orange-600"></i>
                      On-Field Dining & Nearby Eateries
                    </h3>
                    <p className="text-slate-600 leading-relaxed">{data.restaurants}</p>
                  </div>
                )}

                {activeCategory === CategoryType.RENTALS && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <i className="fas fa-car text-green-600"></i>
                      Local Transportation & Rentals
                    </h3>
                    <p className="text-slate-600 leading-relaxed">{data.rentals}</p>
                  </div>
                )}

                {activeCategory === CategoryType.REVIEWS && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <i className="fas fa-star text-yellow-500"></i>
                      The Pilot's Log: Feedback
                    </h3>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic text-slate-600 leading-relaxed">
                      "{data.reviews}"
                    </div>
                  </div>
                )}
              </div>
              
              {/* Grounding Sources */}
              {data.groundingSources.length > 0 && (
                <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex flex-wrap items-center gap-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-Time Data Sources</span>
                  <div className="flex flex-wrap gap-2">
                    {data.groundingSources.map((source, i) => (
                      <a 
                        key={i} 
                        href={source.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all inline-flex items-center space-x-1.5 shadow-sm"
                      >
                        <i className="fas fa-link text-[10px] opacity-40"></i>
                        <span>{source.web.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!data && !isLoading && (
          <div className="text-center py-20">
            <div className="relative inline-block mb-6">
              <i className="fas fa-earth-americas text-8xl text-slate-100"></i>
              <i className="fas fa-plane text-4xl text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-400 mb-2">Ready for departure?</h3>
            <p className="text-slate-500 max-w-xs mx-auto">Search for any ICAO code to pull up live traffic, services, and satellite imagery.</p>
          </div>
        )}

        {/* Modal for editing */}
        {editingImage && (
          <ImageEditModal 
            imageUrl={editingImage.url} 
            onClose={() => setEditingImage(null)} 
            onSave={handleImageUpdate} 
          />
        )}
      </div>
    </Layout>
  );
};

export default App;
