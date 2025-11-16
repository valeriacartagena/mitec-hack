import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
// import { analyzeSite, rankSites } from './services/api';  // Uncomment when backend is ready

const REGION_SITE_COORDS = {
  Monterey: [
    { id: 1, name: 'Monterey Bay North', lat: 36.8, lon: -121.9, score: 94 },
    { id: 2, name: 'Carmel Bay', lat: 36.5, lon: -121.95, score: 91 },
    { id: 3, name: 'Point Lobos', lat: 36.52, lon: -121.95, score: 89 },
    { id: 4, name: 'Big Sur Coast', lat: 36.3, lon: -121.85, score: 87 },
    { id: 5, name: 'Monterey Canyon Edge', lat: 36.75, lon: -122.0, score: 90 },
    { id: 6, name: 'Moss Landing', lat: 36.81, lon: -121.78, score: 88 },
    { id: 7, name: 'Pacific Grove Shore', lat: 36.62, lon: -121.92, score: 86 },
    { id: 8, name: 'Elkhorn Slough', lat: 36.82, lon: -121.75, score: 84 },
    { id: 9, name: 'Lovers Point', lat: 36.63, lon: -121.91, score: 85 },
    { id: 10, name: 'Point Pinos', lat: 36.64, lon: -121.93, score: 83 },
  ],
  Miami: [
    { id: 1, name: 'Biscayne Bay', lat: 25.75, lon: -80.15, score: 92 },
    { id: 2, name: 'Key Largo North', lat: 25.1, lon: -80.4, score: 88 },
    { id: 3, name: 'Miami Beach Offshore', lat: 25.8, lon: -80.1, score: 90 },
    { id: 4, name: 'Key Biscayne', lat: 25.69, lon: -80.16, score: 87 },
    { id: 5, name: 'Haulover Park', lat: 25.9, lon: -80.12, score: 85 },
    { id: 6, name: 'Virginia Key', lat: 25.73, lon: -80.17, score: 84 },
    { id: 7, name: 'Fisher Island', lat: 25.76, lon: -80.14, score: 86 },
    { id: 8, name: 'Key West Approach', lat: 24.55, lon: -81.8, score: 82 },
    { id: 9, name: 'Marathon Key', lat: 24.72, lon: -81.09, score: 83 },
    { id: 10, name: 'Islamorada Coast', lat: 24.92, lon: -80.62, score: 81 },
  ],
  Brazil: [
    { id: 1, name: 'Fernando de Noronha', lat: -3.85, lon: -32.4, score: 93 },
    { id: 2, name: 'Abrolhos Bank', lat: -18.0, lon: -38.7, score: 90 },
    { id: 3, name: 'Recife Coast', lat: -8.05, lon: -34.87, score: 88 },
    { id: 4, name: 'Salvador Bay', lat: -12.97, lon: -38.52, score: 86 },
    { id: 5, name: 'Buzios Peninsula', lat: -22.75, lon: -41.88, score: 85 },
    { id: 6, name: 'Ilha Grande', lat: -23.14, lon: -44.23, score: 84 },
    { id: 7, name: 'Paraty Coast', lat: -23.22, lon: -44.72, score: 83 },
    { id: 8, name: 'Ubatuba Bay', lat: -23.43, lon: -45.08, score: 82 },
    { id: 9, name: 'Ilhabela', lat: -23.78, lon: -45.35, score: 81 },
    { id: 10, name: 'Santos Offshore', lat: -23.96, lon: -46.33, score: 80 },
  ],
};

const getSuitabilityColor = (score = 75) => {
  if (score >= 90) return '#16a34a';
  if (score >= 80) return '#facc15';
  return '#ef4444';
};

const getMarkerRadius = (score = 75) => {
  const base = 6;
  const scaled = Math.max(0, score - 70) * 0.15;
  return base + scaled;
};

const MapViewUpdater = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (!center || Number.isNaN(center[0]) || Number.isNaN(center[1])) {
      return;
    }
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
};

const OceanCarbonAI = () => {
  const [selectedRegion, setSelectedRegion] = useState('Monterey');
  const [selectedProjectType, setSelectedProjectType] = useState('Ocean Alkalinity Enhancement');
  const [activeTab, setActiveTab] = useState('Visualizations');
  const [selectedSites, setSelectedSites] = useState(['Serie 1', 'Serie 2', 'Serie 3']);
  const [showSiteDropdown, setShowSiteDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  
  // NEW STATE FOR SPHINX AI INTEGRATION
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [numSites, setNumSites] = useState(10);
  
  // CHAT STATE
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Ask me anything about ocean carbon removal sites! I can help you understand the data, compare sites, or explain why certain locations are optimal for your project.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // SPHINX AI ANALYSIS FUNCTION
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Define sites to analyze based on selected region
      const sitesToAnalyze = REGION_SITE_COORDS[selectedRegion] || REGION_SITE_COORDS['Monterey'];
      
      console.log(`🚀 Starting Sphinx AI analysis for ${sitesToAnalyze.length} sites...`);
      console.log(`📍 Region: ${selectedRegion}`);
      console.log(`🔬 Project Type: ${selectedProjectType}`);
      
      // TODO: Uncomment when backend is ready
      // const rankedSites = await rankSites(sitesToAnalyze, selectedProjectType);
      
      // MOCK DATA FOR NOW - Replace with real Sphinx AI results
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      const mockResults = sitesToAnalyze.map((site, idx) => {
        // Generate realistic-looking scores based on project type
        const baseScore = 95 - (idx * 3) - Math.random() * 5;
        const score = Math.max(70, Math.min(100, Math.round(baseScore)));
        
        return {
          ...site,
          rank: idx + 1,
          score: score,
          analysis: {
            strengths: [
              'High productivity indicators',
              'Optimal temperature range',
              'Protected from storms',
              'Good water circulation'
            ].slice(0, 2 + Math.floor(Math.random() * 2)),
            concerns: idx > 5 ? ['Moderate wave exposure'] : []
          }
        };
      });
      
      console.log('✅ Analysis complete!', mockResults);
      setAnalysisResults(mockResults);
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      alert('Analysis failed. Please check console for details.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // CHAT WITH CLAUDE API
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);
    
    try {
      // Build context from current state
      const context = {
        region: selectedRegion,
        projectType: selectedProjectType,
        analysisResults: analysisResults?.slice(0, 5), // Top 5 sites for context
        currentMetrics: getMetricsForProjectType(selectedProjectType)
      };
      
      // Call backend chat endpoint
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage],
          context: context
        })
      });
      
      if (!response.ok) {
        throw new Error('Chat request failed');
      }
      
      const data = await response.json();
      const assistantMessage = { role: 'assistant', content: data.message };
      
      setChatMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('❌ Chat error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please make sure the backend is running and try again.' 
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Sample data for visualizations grounded in real ocean metrics
  const radarData = [
    { parameter: 'Alkalinity Buffer (0-10)', Monterey: 9.2, Miami: 7.1, Brazil: 8.7 },
    { parameter: 'Upwelling Intensity', Monterey: 8.8, Miami: 6.4, Brazil: 8.1 },
    { parameter: 'Nutrient Availability', Monterey: 8.5, Miami: 6.9, Brazil: 7.8 },
    { parameter: 'Storm Protection', Monterey: 7.9, Miami: 6.3, Brazil: 8.4 },
    { parameter: 'Logistics Access', Monterey: 8.3, Miami: 8.9, Brazil: 7.2 },
    { parameter: 'Monitoring Readiness', Monterey: 8.6, Miami: 7.8, Brazil: 7.5 },
  ];

  const areaData = [
    { name: '2024 Q1', Monterey: 42, Miami: 34, Brazil: 27 },
    { name: '2024 Q2', Monterey: 48, Miami: 36, Brazil: 30 },
    { name: '2024 Q3', Monterey: 55, Miami: 40, Brazil: 33 },
    { name: '2024 Q4', Monterey: 63, Miami: 44, Brazil: 37 },
    { name: '2025 Q1', Monterey: 71, Miami: 47, Brazil: 41 },
  ];

  const lineData = [
    { name: 'Jan', Monterey: 18, Miami: 22, Brazil: 16 },
    { name: 'Feb', Monterey: 24, Miami: 21, Brazil: 19 },
    { name: 'Mar', Monterey: 28, Miami: 23, Brazil: 22 },
    { name: 'Apr', Monterey: 33, Miami: 25, Brazil: 27 },
    { name: 'May', Monterey: 37, Miami: 27, Brazil: 31 },
  ];

  const donutData = [
    { name: 'Monterey Bay Shelf', value: 42 },
    { name: 'Florida Reef Tract', value: 33 },
    { name: 'Santos Basin Shelf', value: 25 },
  ];

  const barData = [
    { name: 'Winter', value: 34 },
    { name: 'Early Spring', value: 46 },
    { name: 'Late Spring', value: 58 },
    { name: 'Summer', value: 62 },
    { name: 'Autumn', value: 39 },
  ];

  const comparisonData = [
    { name: 'Carbon Potential', Monterey: 95, Miami: 82, Brazil: 88 },
    { name: 'Deployment Readiness', Monterey: 88, Miami: 74, Brazil: 69 },
    { name: 'Ecological Co-benefits', Monterey: 91, Miami: 79, Brazil: 85 },
    { name: 'Monitoring Confidence', Monterey: 86, Miami: 70, Brazil: 73 },
    { name: 'Regulatory Alignment', Monterey: 79, Miami: 68, Brazil: 72 },
  ];

  const COLORS = ['#06b6d4', '#22d3ee', '#67e8f9'];
  const regionOptions = Object.keys(REGION_SITE_COORDS);
  const regionDisplayNames = {
    Monterey: 'Monterey Bay Shelf',
    Miami: 'Florida Reef Tract',
    Brazil: 'Santos Basin Shelf'
  };
  
  const ChatPanel = ({ containerClass = '', bodyHeightClass = 'h-56' }) => (
    <div className={`bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl shadow-2xl flex flex-col ${containerClass}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          AI Assistant
        </h3>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-600">Online</span>
        </div>
      </div>
      
      <div className={`bg-white rounded-xl p-4 mb-3 overflow-y-auto ${bodyHeightClass}`}>
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block max-w-[85%] px-4 py-2 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-cyan-500 text-white rounded-br-none' 
                : 'bg-slate-100 text-slate-800 rounded-bl-none'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isChatLoading && (
          <div className="text-left mb-3">
            <div className="inline-block bg-slate-100 px-4 py-2 rounded-lg rounded-bl-none">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask about ocean sites..."
          disabled={isChatLoading}
          className="flex-1 px-4 py-3 rounded-xl border-2 border-orange-300 focus:outline-none focus:border-orange-400 text-slate-700 disabled:opacity-50"
        />
        <button 
          onClick={handleSendMessage}
          disabled={isChatLoading || !chatInput.trim()}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
  
  const projectTypes = [
    'Ocean Alkalinity Enhancement',
    'Direct Ocean Capture',
    'Kelp Cultivation',
    'Seagrass Restoration',
    'Mangrove Restoration',
    'Microalgae Fertilization'
  ];

  // Project-specific metrics based on McKinsey Ocean CDR report
  const getMetricsForProjectType = (projectType) => {
    const metricsMap = {
      'Ocean Alkalinity Enhancement': [
        { metric: 'Alkalinity Potential', value: '2.8 meq/L', range: '2-4 meq/L', status: 'High', description: 'Capacity to neutralize ocean acidity' },
        { metric: 'pH Level', value: '8.1', range: '7.9-8.3', status: 'Optimal', description: 'Current ocean acidity (lower = more acidic)' },
        { metric: 'Carbonate Saturation', value: '3.2 Ω', range: '>2.5 Ω', status: 'Good', description: 'Ability to form stable bicarbonates' },
        { metric: 'Water Circulation', value: 'High', range: 'Moderate-High', status: 'Excellent', description: 'Current strength for mixing alkaline materials' },
        { metric: 'Distance to Mineral Source', value: '85 km', range: '<150 km', status: 'Good', description: 'Proximity to silicate/alkaline minerals' },
        { metric: 'CO₂ Uptake Efficiency', value: '92%', range: '>80%', status: 'Excellent', description: 'Rate of atmospheric CO₂ absorption' },
      ],
      'Direct Ocean Capture': [
        { metric: 'Dissolved CO₂ Concentration', value: '2.2 mmol/kg', range: '2-3 mmol/kg', status: 'High', description: 'Amount of CO₂ dissolved in seawater' },
        { metric: 'Water Temperature', value: '14.2°C', range: '10-20°C', status: 'Optimal', description: 'Temperature affects CO₂ solubility' },
        { metric: 'Salinity', value: '34.5 ppt', range: '33-37 ppt', status: 'Good', description: 'Salt content affects extraction efficiency' },
        { metric: 'Water Intake Volume', value: 'Very High', range: 'High-Very High', status: 'Excellent', description: 'Available seawater flow rate' },
        { metric: 'Energy Infrastructure', value: 'Available', range: 'Nearby', status: 'Good', description: 'Access to renewable energy sources' },
        { metric: 'Geological Storage Access', value: '45 km', range: '<100 km', status: 'Excellent', description: 'Distance to CO₂ storage sites' },
      ],
      'Kelp Cultivation': [
        { metric: 'Water Temperature', value: '12.8°C', range: '8-18°C', status: 'Optimal', description: 'Cold water ideal for kelp growth' },
        { metric: 'Nitrate Concentration', value: '18 μM', range: '10-25 μM', status: 'High', description: 'Essential nutrient for kelp growth' },
        { metric: 'Wave Exposure', value: '7/10', range: 'Moderate-High', status: 'Good', description: 'Wave energy for nutrient mixing' },
        { metric: 'Light Penetration', value: '85%', range: '>70%', status: 'Excellent', description: 'Water clarity for photosynthesis' },
        { metric: 'Depth Profile', value: '15-35m', range: '10-50m', status: 'Ideal', description: 'Optimal depth range for kelp farming' },
        { metric: 'Upwelling Frequency', value: '14 events/yr', range: '12-18/yr', status: 'High', description: 'Nutrient-rich deep water events' },
      ],
      'Seagrass Restoration': [
        { metric: 'Water Depth', value: '3.5m avg', range: '1-8m', status: 'Ideal', description: 'Shallow water for light penetration' },
        { metric: 'Light Availability', value: '92%', range: '>80%', status: 'Excellent', description: 'Critical for seagrass photosynthesis' },
        { metric: 'Wave Exposure', value: '2/10', range: 'Low-Moderate', status: 'Optimal', description: 'Sheltered conditions needed' },
        { metric: 'Sediment Stability', value: 'High', range: 'Medium-High', status: 'Excellent', description: 'Stable substrate for root systems' },
        { metric: 'Water Temperature', value: '18.5°C', range: '15-25°C', status: 'Good', description: 'Warm shallow water preferred' },
        { metric: 'Salinity', value: '33 ppt', range: '25-40 ppt', status: 'Good', description: 'Seagrass tolerates variable salinity' },
      ],
      'Mangrove Restoration': [
        { metric: 'Tidal Range', value: '2.1m', range: '1.5-3m', status: 'Optimal', description: 'Tidal variation for mangrove zones' },
        { metric: 'Sediment Accumulation', value: 'High', range: 'Moderate-High', status: 'Excellent', description: 'Sediment for root establishment' },
        { metric: 'Salinity Tolerance', value: '28 ppt', range: '0-35 ppt', status: 'Good', description: 'Brackish to saline conditions' },
        { metric: 'Wave Protection', value: 'Very High', range: 'High', status: 'Excellent', description: 'Sheltered coastal areas needed' },
        { metric: 'Freshwater Input', value: '15 km', range: '<25 km', status: 'Good', description: 'Distance to river/stream input' },
        { metric: 'Storm Protection Value', value: '95%', range: '>80%', status: 'Excellent', description: 'Co-benefit: coastal flood protection' },
      ],
      'Microalgae Fertilization': [
        { metric: 'Iron Concentration', value: 'Low', range: 'Deficient', status: 'Optimal', description: 'Low iron = high fertilization potential' },
        { metric: 'Nitrate Levels', value: 'Low-Moderate', range: 'Variable', status: 'Good', description: 'Baseline nutrient availability' },
        { metric: 'Chlorophyll-a', value: '0.3 mg/m³', range: '<0.5 mg/m³', status: 'Good', description: 'Low = room for phytoplankton growth' },
        { metric: 'Water Depth', value: '1,200m', range: '>1,000m', status: 'Excellent', description: 'Deep water for biomass sinking' },
        { metric: 'Ocean Currents', value: 'Moderate', range: 'Low-Moderate', status: 'Good', description: 'Limits nutrient dispersal' },
        { metric: 'Oxygen Concentration', value: 'Low at depth', range: '<2 mg/L at 1km', status: 'Ideal', description: 'Anoxic conditions preserve carbon' },
      ],
    };
    
    return metricsMap[projectType] || metricsMap['Ocean Alkalinity Enhancement'];
  };

  const oceanChemistryMetrics = getMetricsForProjectType(selectedProjectType);

  // AI explanations based on project type from McKinsey report
  const getAIReasoningForProject = (projectType) => {
    const reasoningMap = {
      'Ocean Alkalinity Enhancement': [
        { title: 'High Alkalinity Efficiency', text: 'This site has exceptional capacity to neutralize CO₂ and convert it to stable bicarbonates with 92% uptake efficiency' },
        { title: 'Optimal Water Chemistry', text: 'pH levels and carbonate saturation are ideal for mineral dissolution and CO₂ conversion processes' },
        { title: 'Strong Ocean Circulation', text: 'High current velocity ensures effective mixing and distribution of alkaline materials throughout the water column' },
        { title: 'Low Environmental Risk', text: 'Moderate alkalinity enhancement poses minimal disruption to local marine ecosystems per McKinsey analysis' },
      ],
      'Direct Ocean Capture': [
        { title: 'High Dissolved CO₂', text: 'Elevated concentration of dissolved CO₂ (2.2 mmol/kg) makes electrochemical extraction highly efficient' },
        { title: 'Optimal Temperature Range', text: 'Water temperature of 14.2°C maximizes CO₂ solubility and extraction efficiency' },
        { title: 'Infrastructure Proximity', text: 'Close access to renewable energy and geological storage sites (45km) minimizes operational costs' },
        { title: 'Scalable Water Intake', text: 'Very high water flow availability enables gigaton-scale CO₂ removal capacity' },
      ],
      'Kelp Cultivation': [
        { title: 'Cold-Water Kelp Paradise', text: 'Water temperature of 12.8°C is in the sweet spot for rapid kelp growth and high biomass production' },
        { title: 'Nutrient-Rich Waters', text: 'High nitrate concentration (18 μM) and frequent upwelling events (14/year) provide continuous nutrient supply' },
        { title: 'Optimal Wave Energy', text: 'Moderate-high wave exposure provides nutrient mixing without damaging kelp structures' },
        { title: 'Excellent Water Clarity', text: '85% light penetration enables efficient photosynthesis and CO₂ uptake by kelp forests' },
      ],
      'Seagrass Restoration': [
        { title: 'Shallow Protected Waters', text: 'Average depth of 3.5m with 92% light availability creates ideal photosynthetic conditions' },
        { title: 'Low Wave Exposure', text: 'Sheltered location (2/10 wave index) protects delicate seagrass from storm damage' },
        { title: 'Stable Sediments', text: 'High sediment stability ensures successful root establishment and long-term carbon burial' },
        { title: 'Climate Co-Benefits', text: 'Seagrass meadows provide habitat for fish, improve water quality, and stabilize coastlines' },
      ],
      'Mangrove Restoration': [
        { title: 'Optimal Tidal Conditions', text: 'Tidal range of 2.1m creates distinct mangrove zones for maximum species diversity and carbon storage' },
        { title: 'High Sediment Accumulation', text: 'Active sediment deposition supports root development and long-term carbon burial in soil' },
        { title: 'Excellent Storm Protection', text: 'This site provides 95% coastal flood protection value - a critical climate adaptation co-benefit' },
        { title: 'Freshwater Accessibility', text: 'Proximity to freshwater input (15km) supports brackish conditions optimal for mangrove growth' },
      ],
      'Microalgae Fertilization': [
        { title: 'Iron-Deficient Waters', text: 'Low baseline iron concentration indicates high potential for phytoplankton bloom after fertilization' },
        { title: 'Deep Water Column', text: '1,200m depth ensures sinking biomass reaches anoxic zones for permanent carbon sequestration' },
        { title: 'Low Background Productivity', text: 'Chlorophyll-a of 0.3 mg/m³ shows room for significant productivity increase via nutrient addition' },
        { title: 'Stable Anoxic Storage', text: 'Low oxygen at depth (<2 mg/L at 1km) prevents decomposition and ensures carbon permanence' },
      ],
    };
    
    return reasoningMap[projectType] || reasoningMap['Ocean Alkalinity Enhancement'];
  };

  const sourcesList = [
    { name: 'NOAA Ocean Data', type: 'Temperature & Salinity', updated: '2024-11-10', url: 'https://www.ncei.noaa.gov/products/climate-data-records' },
    { name: 'NASA Ocean Color', type: 'Chlorophyll & Productivity', updated: '2024-11-12', url: 'https://oceancolor.gsfc.nasa.gov/' },
    { name: 'AlphaEarth Embeddings', type: 'Multi-spectral Analysis', updated: '2024-11-14', url: 'https://alphaearth.ai/' },
    { name: 'GEBCO Bathymetry', type: 'Depth & Topography', updated: '2024-10-15', url: 'https://www.gebco.net/' },
    { name: 'NOAA Storm Database', type: 'Historical Storm Events', updated: '2024-11-08', url: 'https://www.ncdc.noaa.gov/stormevents/' },
  ];

  const mapSites = useMemo(() => {
    const baseSites = analysisResults && analysisResults.length > 0
      ? analysisResults
      : REGION_SITE_COORDS[selectedRegion] || REGION_SITE_COORDS['Monterey'];

    return baseSites.map((site, idx) => ({
      ...site,
      score: site.score ?? Math.max(72, 92 - idx * 3),
    }));
  }, [analysisResults, selectedRegion]);

  const mapCenter = useMemo(() => {
    if (!mapSites.length) {
      return [0, 0];
    }
    const avgLat = mapSites.reduce((sum, site) => sum + site.lat, 0) / mapSites.length;
    const avgLon = mapSites.reduce((sum, site) => sum + site.lon, 0) / mapSites.length;
    return [avgLat, avgLon];
  }, [mapSites]);

  const mapZoom = useMemo(() => {
    if (mapSites.length <= 1) {
      return 8;
    }
    const latitudes = mapSites.map(site => site.lat);
    const longitudes = mapSites.map(site => site.lon);
    const latRange = Math.max(...latitudes) - Math.min(...latitudes);
    const lonRange = Math.max(...longitudes) - Math.min(...longitudes);
    const maxRange = Math.max(latRange, lonRange);

    if (maxRange < 0.5) return 11;
    if (maxRange < 2) return 8;
    if (maxRange < 6) return 6;
    return 4;
  }, [mapSites]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-slate-800">OceanCarbon AI</h1>
          <p className="text-sm text-slate-600 mt-1">Satellite Intelligence for Ocean Carbon Removal</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Control Panel */}
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          {/* Region Selector */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowSiteDropdown(!showSiteDropdown);
                setShowProjectDropdown(false);
              }}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-3 rounded-lg flex items-center gap-3 min-w-[200px] transition-colors"
            >
              <span className="font-medium">{selectedRegion}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showSiteDropdown && (
              <div className="absolute top-full mt-2 bg-white border-2 border-slate-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                {regionOptions.map(site => (
                  <button
                    key={site}
                    onClick={() => {
                      setSelectedRegion(site);
                      setShowSiteDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-3 hover:bg-cyan-50 text-slate-800 border-b border-slate-100 last:border-b-0 transition-colors"
                  >
                    {site}
                  </button>
                ))}
                <div className="px-4 py-2 text-slate-500 text-sm">etc</div>
              </div>
            )}
          </div>

          {/* Project Type Selector */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowProjectDropdown(!showProjectDropdown);
                setShowSiteDropdown(false);
              }}
              className="bg-teal-100 hover:bg-teal-200 text-teal-900 px-6 py-3 rounded-lg flex items-center gap-3 min-w-[280px] transition-colors border-2 border-teal-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span className="font-medium text-sm">{selectedProjectType}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showProjectDropdown && (
              <div className="absolute top-full mt-2 bg-white border-2 border-teal-200 rounded-lg shadow-lg z-10 min-w-[280px]">
                {projectTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedProjectType(type);
                      setShowProjectDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-3 hover:bg-teal-50 text-slate-800 border-b border-slate-100 last:border-b-0 transition-colors text-sm"
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Run Analysis Button */}
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="inline-block animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full" />
                Analyzing with Sphinx AI...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Run AI Analysis
              </>
            )}
          </button>

          {/* Number of Sites Slider */}
          <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
            <span className="text-slate-700 font-medium text-sm">Sites:</span>
            <input 
              type="range" 
              min="10" 
              max="20" 
              value={numSites}
              onChange={(e) => setNumSites(e.target.value)}
              className="w-32"
            />
            <span className="text-slate-700 font-bold text-sm">{numSites}</span>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            {['Visualizations', 'Ocean chemistry', 'Sources', 'Comparison'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-cyan-400 text-white'
                    : 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-6">
          {/* Visualizations Section */}
          {activeTab === 'Visualizations' && (
            <div className="grid grid-cols-3 gap-6">
              {/* Radar Chart */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-center mb-2">
                  {regionOptions.map((region, i) => (
                    <div key={region} className="flex items-center mr-4">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      ></div>
                      <span className="text-sm text-slate-600">
                        {regionDisplayNames[region] || region}
                      </span>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis dataKey="parameter" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} />
                    {regionOptions.map((region, i) => (
                      <Radar
                        key={region}
                        name={regionDisplayNames[region] || region}
                        dataKey={region}
                        stroke={COLORS[i % COLORS.length]}
                        fill={COLORS[i % COLORS.length]}
                        fillOpacity={0.3}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Area Chart */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-center mb-2">
                  {regionOptions.map((region, i) => (
                    <div key={region} className="flex items-center mr-4">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      ></div>
                      <span className="text-sm text-slate-600">
                        {regionDisplayNames[region] || region}
                      </span>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={areaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip />
                    {regionOptions.map((region, i) => (
                      <Area
                        key={region}
                        type="monotone"
                        dataKey={region}
                        stackId="1"
                        stroke={COLORS[i % COLORS.length]}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Line Chart */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-center mb-2">
                  {regionOptions.map((region, i) => (
                    <div key={region} className="flex items-center mr-4">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      ></div>
                      <span className="text-sm text-slate-600">
                        {regionDisplayNames[region] || region}
                      </span>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip />
                    {regionOptions.map((region, i) => (
                      <Line
                        key={region}
                        type="monotone"
                        dataKey={region}
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth={2}
                        dot={{ fill: COLORS[i % COLORS.length], r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Ocean Chemistry Tab */}
          {activeTab === 'Ocean chemistry' && (
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Oceanographic Metrics - {selectedRegion}</h2>
                <div className="mt-2 inline-block bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-semibold">
                  Optimized for: {selectedProjectType}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {oceanChemistryMetrics.map((item, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-700">{item.metric}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        item.status === 'Optimal' || item.status === 'Excellent' || item.status === 'Ideal' ? 'bg-green-100 text-green-700' :
                        item.status === 'High' || item.status === 'Good' ? 'bg-cyan-100 text-cyan-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-cyan-600 mb-1">{item.value}</div>
                    <div className="text-sm text-slate-500 mb-2">Range: {item.range}</div>
                    <div className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded">{item.description}</div>
                  </div>
                ))}
              </div>

              {/* AI Explanation */}
              <div className="mt-8 bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-cyan-400 rounded-lg p-6">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/>
                  </svg>
                  AI Analysis - Why this site ranks high for {selectedProjectType}:
                </h3>
                <ul className="space-y-2 text-slate-700">
                  {getAIReasoningForProject(selectedProjectType).map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-600 font-bold">•</span>
                      <span><strong>{reason.title}:</strong> {reason.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Sources Tab */}
          {activeTab === 'Sources' && (
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Data Sources</h2>
              <div className="space-y-4">
                {sourcesList.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-slate-200 rounded-lg p-5 hover:shadow-lg hover:border-cyan-400 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-800 text-lg">{source.name}</h3>
                          <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        <p className="text-slate-600">{source.type}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 mb-1">Last Updated</div>
                        <div className="text-sm font-medium text-cyan-600">{source.updated}</div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h3 className="font-bold text-amber-900 mb-2">About Our Data</h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  OceanCarbon AI combines satellite observations, oceanographic databases, and AI embeddings to translate raw environmental data into actionable insights for ocean carbon removal projects. All metrics shown are derived from peer-reviewed data sources and validated against known successful deployment sites.
                </p>
              </div>
            </div>
          )}

          {/* Comparison Tab */}
          {activeTab === 'Comparison' && (
            <div className="space-y-6">
              {/* Comparison Chart */}
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Site Comparison</h2>
                <div className="flex justify-center mb-4">
                  {regionOptions.map((site, i) => (
                    <div key={site} className="flex items-center mr-6">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      ></div>
                      <span className="font-medium text-slate-700">
                        {regionDisplayNames[site] || site}
                      </span>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
                    <YAxis tick={{ fill: '#64748b' }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="Brazil" stackId="1" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.8} />
                    <Area type="monotone" dataKey="Miami" stackId="1" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.8} />
                    <Area type="monotone" dataKey="Monterey" stackId="1" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.8} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Additional Comparison Visualizations */}
              <div className="grid grid-cols-2 gap-6">
                {/* Donut Chart */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Overall Suitability Score</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {donutData.map((entry, idx) => (
                      <div key={idx} className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx] }}></div>
                        <span className="text-sm text-slate-600">{entry.name}: {entry.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Seasonal Productivity</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
                      <YAxis tick={{ fill: '#64748b' }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* SPHINX AI ANALYSIS RESULTS */}
          {analysisResults && (
            <div className="bg-white rounded-xl shadow-md p-8 mt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  🎯 AI Analysis Results - Top {analysisResults.length} Sites
                </h2>
                <button
                  onClick={() => {
                    // Export to CSV
                    const csv = [
                      ['Rank', 'Site Name', 'Latitude', 'Longitude', 'Score', 'Project Type'],
                      ...analysisResults.map((site) => [
                        site.rank,
                        site.name,
                        site.lat,
                        site.lon,
                        site.score,
                        selectedProjectType
                      ])
                    ].map(row => row.join(',')).join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ocean-sites-${selectedRegion}-${Date.now()}.csv`;
                    a.click();
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-cyan-50 to-blue-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Rank</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Location</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Coordinates</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Suitability Score</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Key Strengths</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisResults.slice(0, 10).map((site, idx) => (
                      <tr key={site.id || idx} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                            idx === 0 ? 'bg-yellow-500' :
                            idx === 1 ? 'bg-gray-400' :
                            idx === 2 ? 'bg-orange-600' :
                            'bg-cyan-500'
                          }`}>
                            {idx + 1}
                          </div>
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-800">{site.name}</td>
                        <td className="px-4 py-4 text-sm text-slate-600 font-mono">
                          {site.lat.toFixed(3)}, {site.lon.toFixed(3)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-200 rounded-full h-3 max-w-[120px]">
                              <div 
                                className={`h-3 rounded-full transition-all ${
                                  site.score >= 90 ? 'bg-green-500' :
                                  site.score >= 80 ? 'bg-cyan-500' :
                                  'bg-yellow-500'
                                }`}
                                style={{ width: `${site.score}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-800 min-w-[3ch]">{site.score}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {site.analysis?.strengths?.slice(0, 2).join(', ') || 'Analyzing...'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Analysis Summary */}
              <div className="mt-6 bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-cyan-500 rounded-lg p-6">
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/>
                  </svg>
                  Sphinx AI Strategic Recommendation:
                </h3>
                <p className="text-slate-700">
                  Based on the analysis of {analysisResults.length} sites in {selectedRegion} for {selectedProjectType}, 
                  <strong> {analysisResults[0]?.name}</strong> ranks highest with a score of <strong>{analysisResults[0]?.score}/100</strong>. 
                  This site offers optimal conditions for deployment with minimal environmental risks. 
                  We recommend prioritizing the top 3 sites for field surveys and pilot deployment.
                </p>
              </div>
            </div>
          )}

          {/* Map Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden relative" style={{ height: '500px' }}>
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={false}
              className="w-full h-full"
              style={{ height: '100%', width: '100%' }}
              preferCanvas
            >
              <MapViewUpdater center={mapCenter} zoom={mapZoom} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {mapSites.map((site, idx) => {
                const color = getSuitabilityColor(site.score);
                return (
                  <CircleMarker
                    key={`${site.name}-${idx}`}
                    center={[site.lat, site.lon]}
                    radius={getMarkerRadius(site.score)}
                    pathOptions={{
                      color,
                      fillColor: color,
                      weight: 2,
                      opacity: 0.9,
                      fillOpacity: 0.6,
                    }}
                  >
                    <LeafletTooltip direction="top" offset={[0, -2]} opacity={1} sticky>
                      <div className="text-sm">
                        <p className="font-semibold text-slate-800">
                          {site.rank ? `#${site.rank} ${site.name}` : site.name}
                        </p>
                        <p className="text-slate-600">
                          Score: {site.score ? `${site.score}/100` : 'Pending'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {site.lat.toFixed(2)}, {site.lon.toFixed(2)}
                        </p>
                        {site.analysis?.strengths?.length ? (
                          <p className="text-xs text-slate-500 mt-1">
                            {site.analysis.strengths.slice(0, 2).join(', ')}
                          </p>
                        ) : null}
                      </div>
                    </LeafletTooltip>
                  </CircleMarker>
                );
              })}
            </MapContainer>

            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-xl shadow-lg p-4 w-64 space-y-3">
              <div>
                <p className="text-xs uppercase text-slate-500 tracking-wide">Region focus</p>
                <p className="font-semibold text-slate-800">{selectedRegion}</p>
                <p className="text-xs text-slate-500">{mapSites.length} candidate sites</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#16a34a]"></span>
                  <span className="text-sm text-slate-600">High suitability (90+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#facc15]"></span>
                  <span className="text-sm text-slate-600">Medium (80-89)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
                  <span className="text-sm text-slate-600">Monitor (&lt;80)</span>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-3">
                {analysisResults?.length ? (
                  <>
                    <p className="text-xs uppercase text-slate-500 tracking-wide">Top-ranked site</p>
                    <p className="font-semibold text-slate-800">{analysisResults[0]?.name}</p>
                    <p className="text-xs text-slate-500">Score {analysisResults[0]?.score}/100</p>
                  </>
                ) : (
                  <p className="text-xs text-slate-500">
                    Run the AI analysis to refresh suitability scores from the latest model output.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
      {/* Global Chat Interface */}
      <div className="fixed top-6 right-6 w-96 z-50 pointer-events-auto">
        <ChatPanel containerClass="p-6 max-h-[80vh]" bodyHeightClass="max-h-[48vh]" />
      </div>
    </div>
  );
};

export default OceanCarbonAI;