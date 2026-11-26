import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Radio,
  Sun,
  ShieldAlert,
  Compass,
  Camera,
  Layers,
  MapPin,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Zap,
  Globe2,
  Activity,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { observatoryApi } from '../services/api/observatoryApi';
import type {
  SpaceWeatherEvent,
  RadLabDosimetry,
  MarsRoverPhoto,
  MarsTrekSite,
} from '../types/observatory';
import { SpaceWeatherObservatory3D } from '../components/three/SpaceWeatherObservatory3D';

type ObservatoryTab = 'DONKI' | 'RADLAB' | 'ROVER_PHOTOS' | 'MARS_TREK';

export const ObservatoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ObservatoryTab>('DONKI');
  const [spaceWeather, setSpaceWeather] = useState<SpaceWeatherEvent[]>([]);
  const [dosimetry, setDosimetry] = useState<RadLabDosimetry[]>([]);
  const [roverPhotos, setRoverPhotos] = useState<MarsRoverPhoto[]>([]);
  const [trekSites, setTrekSites] = useState<MarsTrekSite[]>([]);
  const [selectedSite, setSelectedSite] = useState<MarsTrekSite | null>(null);
  const [selectedRover, setSelectedRover] = useState<string>('Perseverance');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sw, dos, photos, sites] = await Promise.all([
        observatoryApi.getSpaceWeatherAlerts(),
        observatoryApi.getRadiationDosimetry(),
        observatoryApi.getMarsRoverPhotos(selectedRover),
        observatoryApi.getMarsTrekSites(),
      ]);
      setSpaceWeather(sw);
      setDosimetry(dos);
      setRoverPhotos(photos);
      setTrekSites(sites);
      if (sites.length > 0) {
        setSelectedSite(sites[0]);
      }
    } catch (err) {
      console.error('Failed to load Observatory telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedRover]);

  return (
    <div className="min-h-screen bg-[#050914] text-white p-4 md:p-8 space-y-6 select-none">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-900/30">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Link to="/academy" className="hover:text-white transition-colors">
              Academy
            </Link>
            <span>/</span>
            <span className="text-white font-semibold">NASA Space Weather & Science Observatory</span>
          </div>
          <h1 className="text-xl md:text-3xl font-bold font-mono text-white tracking-wide mt-1">
            Planetary Telemetry & Space Weather Observatory
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/practical-training"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all"
          >
            <span>PRACTICAL TRAINING LAB</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0b162b] via-[#070e1c] to-[#0a1829] border border-cyan-800/40 p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 font-mono text-xs font-bold uppercase">
              NASA OPEN DATA REPOSITORY
            </span>
            <span className="text-xs font-mono text-slate-400">DONKI • RadLab • Mars Trek • Mars Rovers</span>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Real scientific feeds and empirical datasets compiled directly from NASA Goddard Space Weather (DONKI),
            NASA Open Science Data Repository (RadLab Radiation Dosimetry), NASA Mars Trek (OGC WMTS Tiles),
            and NASA Mars Rover raw image pipelines.
          </p>
        </div>
      </div>

      {/* 3D Space Weather & Heliosphere Observatory Simulator */}
      <div className="space-y-2">
        <SpaceWeatherObservatory3D />
      </div>

      {/* 4 Data Stream Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveTab('DONKI')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs whitespace-nowrap transition-all ${
            activeTab === 'DONKI'
              ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/30'
              : 'bg-[#09172a] text-slate-400 hover:text-white'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>1. NASA DONKI Space Weather</span>
        </button>

        <button
          onClick={() => setActiveTab('RADLAB')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs whitespace-nowrap transition-all ${
            activeTab === 'RADLAB'
              ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/30'
              : 'bg-[#09172a] text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>2. NASA RadLab Radiation Dosimetry</span>
        </button>

        <button
          onClick={() => setActiveTab('ROVER_PHOTOS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs whitespace-nowrap transition-all ${
            activeTab === 'ROVER_PHOTOS'
              ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/30'
              : 'bg-[#09172a] text-slate-400 hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>3. NASA Mars Rover Photo Explorer</span>
        </button>

        <button
          onClick={() => setActiveTab('MARS_TREK')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs whitespace-nowrap transition-all ${
            activeTab === 'MARS_TREK'
              ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/30'
              : 'bg-[#09172a] text-slate-400 hover:text-white'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          <span>4. NASA Mars Trek Planetary GIS</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-24 text-center font-mono text-slate-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
          <p>Connecting to NASA Open Data Stream...</p>
        </div>
      ) : (
        <div>
          {/* TAB 1: NASA DONKI SPACE WEATHER */}
          {activeTab === 'DONKI' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Solar Flares, CMEs & Geomagnetic Storm Telemetry
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    NASA GSFC Community Coordinated Modeling Center (CCMC) Live Space Weather Database.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spaceWeather.map((evt) => (
                  <div
                    key={evt.eventId}
                    className="bg-[#09172a] border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            evt.alertSeverity === 'CRITICAL'
                              ? 'bg-red-950 text-red-400 border border-red-700 animate-pulse'
                              : evt.alertSeverity === 'WARNING'
                              ? 'bg-amber-950 text-amber-400 border border-amber-700'
                              : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                          }`}
                        >
                          {evt.eventType} // {evt.alertSeverity}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{evt.sourceLocation}</span>
                      </div>

                      <h4 className="text-base font-bold text-white font-mono">{evt.intensity}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{evt.estimatedEarthImpact}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs font-mono">
                      <div className="text-amber-400 text-[11px]">
                        <strong>Operational Action:</strong> {evt.operationalMitigation}
                      </div>
                      <div className="flex justify-between text-slate-500 text-[10px]">
                        <span>Event ID: {evt.eventId}</span>
                        <span>Plasma Speed: {evt.speedKmPerSec > 0 ? `${evt.speedKmPerSec} km/s` : 'Speed of Light'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: NASA RADLAB RADIATION DOSIMETRY */}
          {activeTab === 'RADLAB' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
                    International Space Station (ISS) Radiation Dosimetry Sensors
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    NASA Open Science Data Repository (OSDR) RadLab Programmatic Telemetry.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dosimetry.map((item) => (
                  <div
                    key={item.measurementId}
                    className={`p-4 rounded-xl border transition-all ${
                      item.isSouthAtlanticAnomaly
                        ? 'bg-red-950/40 border-red-600'
                        : 'bg-[#09172a] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">{item.spacecraft}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          item.isSouthAtlanticAnomaly
                            ? 'bg-red-900 text-red-200 animate-pulse'
                            : 'bg-emerald-950 text-emerald-300'
                        }`}
                      >
                        {item.isSouthAtlanticAnomaly ? 'SAA RADIATION SPIKE' : 'INTER-ORBITAL'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-1.5">{item.detectorName}</h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{item.moduleName}</p>

                    <div className="mt-4 space-y-2">
                      <div className="bg-[#0b192e] p-2 rounded border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 block">Absorbed Dose Rate:</span>
                        <span className="text-lg font-bold font-mono text-white">
                          {item.absorbedDoseRateMicroGyPerDay}{' '}
                          <span className="text-xs font-normal text-slate-400">μGy/day</span>
                        </span>
                      </div>

                      <div className="bg-[#0b192e] p-2 rounded border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 block">Dose Equivalent Rate:</span>
                        <span className="text-lg font-bold font-mono text-cyan-400">
                          {item.doseEquivalentRateMicroSvPerDay}{' '}
                          <span className="text-xs font-normal text-slate-400">μSv/day</span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-[10px] font-mono text-slate-500">
                      Shielding: {item.shieldingDepthGramsCm2}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: NASA MARS ROVER PHOTOS */}
          {activeTab === 'ROVER_PHOTOS' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Raw Planetary Exploration Imagery
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Streamed from NASA Mars Science Laboratory & Mars 2020 Raw Pipelines.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-[#09172a] p-1.5 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setSelectedRover('Perseverance')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      selectedRover === 'Perseverance'
                        ? 'bg-cyan-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Perseverance (Jezero Crater)
                  </button>
                  <button
                    onClick={() => setSelectedRover('Curiosity')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      selectedRover === 'Curiosity'
                        ? 'bg-cyan-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Curiosity (Gale Crater)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {roverPhotos.map((photo) => (
                  <div
                    key={photo.photoId}
                    className="bg-[#09172a] border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between"
                  >
                    <div className="relative aspect-video bg-[#040810] overflow-hidden">
                      <img
                        src={photo.imageUrl}
                        alt={photo.geologicalTarget}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // Fallback placeholder if NASA external image fails to load
                          (e.target as any).src =
                            'https://images-assets.nasa.gov/image/PIA24424/PIA24424~orig.jpg';
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-black/75 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300">
                        Sol {photo.sol} // {photo.cameraName}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="text-sm font-bold text-white font-mono">{photo.geologicalTarget}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{photo.instrumentDescription}</p>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Earth Date: {photo.earthDate} • Rover: {photo.roverName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: NASA MARS TREK GIS */}
          {activeTab === 'MARS_TREK' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-3">
                <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
                  NASA Mars Trek Landing Sites & Basemaps
                </h3>
                <div className="space-y-2">
                  {trekSites.map((site) => (
                    <button
                      key={site.siteId}
                      onClick={() => setSelectedSite(site)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                        selectedSite?.siteId === site.siteId
                          ? 'bg-[#0d223f] border-cyan-500 shadow-md shadow-cyan-950/50'
                          : 'bg-[#09172a] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{site.name}</span>
                        <MapPin className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
                        <span>Lat: {site.latitude.toFixed(2)}° | Lon: {site.longitude.toFixed(2)}°</span>
                        <span className="text-amber-400 font-bold">{site.elevationMeters}m</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedSite && (
                <div className="lg:col-span-2 bg-[#09172a] border border-slate-800 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <h2 className="text-xl font-bold font-mono text-white">{selectedSite.name}</h2>
                      <span className="text-xs font-mono text-cyan-400">
                        Basemap: {selectedSite.basemapLayer}
                      </span>
                    </div>

                    <a
                      href={selectedSite.elevationProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500 text-cyan-300 text-xs font-mono transition-all"
                    >
                      <span>Open NASA Mars Trek GIS</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {selectedSite.geologicalSignificance}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#0b192e] p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Latitude</span>
                      <span className="text-base font-bold font-mono text-white">{selectedSite.latitude}°</span>
                    </div>
                    <div className="bg-[#0b192e] p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Longitude</span>
                      <span className="text-base font-bold font-mono text-white">{selectedSite.longitude}°</span>
                    </div>
                    <div className="bg-[#0b192e] p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Elevation</span>
                      <span className="text-base font-bold font-mono text-amber-400">
                        {selectedSite.elevationMeters} m
                      </span>
                    </div>
                    <div className="bg-[#0b192e] p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">OGC Service</span>
                      <span className="text-base font-bold font-mono text-emerald-400">WMTS 1.0.0</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#081220] border border-cyan-900/40 text-xs font-mono text-cyan-300 space-y-1">
                    <strong>WMTS Raster Endpoint:</strong>
                    <code className="block bg-[#050914] p-2 rounded text-slate-300 text-[11px] overflow-x-auto">
                      https://trek.nasa.gov/tiles/Mars/EQ/{selectedSite.basemapLayer}/1.0.0/default/default028mm/&#123;z&#125;/&#123;y&#125;/&#123;x&#125;.jpg
                    </code>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
