import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const OceanCarbonAI = () => {
  const [selectedRegion, setSelectedRegion] = useState('Monterey coast');
  const [selectedProjectType, setSelectedProjectType] = useState('Ocean Alkalinity Enhancement');
  const [activeTab, setActiveTab] = useState('Visualizations');
  const [selectedSites, setSelectedSites] = useState(['Serie 1', 'Serie 2', 'Serie 3']);
  const [showSiteDropdown, setShowSiteDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  // Sample data for visualizations
  const radarData = [
    { elemento: 'Elemento 1', 'Serie 1': 8, 'Serie 2': 6, 'Serie 3': 7 },
    { elemento: 'Elemento 2', 'Serie 1': 7, 'Serie 2': 8, 'Serie 3': 6 },
    { elemento: 'Elemento 3', 'Serie 1': 6, 'Serie 2': 7, 'Serie 3': 9 },
    { elemento: 'Elemento 4', 'Serie 1': 9, 'Serie 2': 6, 'Serie 3': 8 },
    { elemento: 'Elemento 5', 'Serie 1': 7, 'Serie 2': 9, 'Serie 3': 7 },
  ];

  const areaData = [
    { name: 'Elemento 1', 'Serie 1': 30, 'Serie 2': 20, 'Serie 3': 15 },
    { name: 'Elemento 2', 'Serie 1': 35, 'Serie 2': 25, 'Serie 3': 20 },
    { name: 'Elemento 3', 'Serie 1': 45, 'Serie 2': 30, 'Serie 3': 25 },
    { name: 'Elemento 4', 'Serie 1': 60, 'Serie 2': 40, 'Serie 3': 30 },
    { name: 'Elemento 5', 'Serie 1': 80, 'Serie 2': 50, 'Serie 3': 40 },
  ];

  const lineData = [
    { name: 'Elemento 1', 'Serie 1': 15, 'Serie 2': 12, 'Serie 3': 18 },
    { name: 'Elemento 2', 'Serie 1': 28, 'Serie 2': 20, 'Serie 3': 15 },
    { name: 'Elemento 3', 'Serie 1': 22, 'Serie 2': 25, 'Serie 3': 30 },
    { name: 'Elemento 4', 'Serie 1': 35, 'Serie 2': 18, 'Serie 3': 38 },
    { name: 'Elemento 5', 'Serie 1': 42, 'Serie 2': 32, 'Serie 3': 50 },
  ];

  const donutData = [
    { name: 'Serie 1', value: 35 },
    { name: 'Serie 2', value: 30 },
    { name: 'Serie 3', value: 35 },
  ];

  const barData = [
    { name: 'Jan', value: 45 },
    { name: 'Feb', value: 38 },
    { name: 'Mar', value: 52 },
    { name: 'Apr', value: 48 },
    { name: 'May', value: 42 },
  ];

  const comparisonData = [
    { name: 'Elemento 1', Monterey: 30, Miami: 25, Brazil: 20 },
    { name: 'Elemento 2', Monterey: 40, Miami: 35, Brazil: 30 },
    { name: 'Elemento 3', Monterey: 55, Miami: 45, Brazil: 40 },
    { name: 'Elemento 4', Monterey: 75, Miami: 60, Brazil: 55 },
    { name: 'Elemento 5', Monterey: 95, Miami: 80, Brazil: 75 },
  ];

  const COLORS = ['#06b6d4', '#22d3ee', '#67e8f9'];
  const sites = ['Monterey', 'Miami', 'Brazil'];
  
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
    { name: 'NOAA Ocean Data', type: 'Temperature & Salinity', updated: '2024-11-10' },
    { name: 'NASA Ocean Color', type: 'Chlorophyll & Productivity', updated: '2024-11-12' },
    { name: 'AlphaEarth Embeddings', type: 'Multi-spectral Analysis', updated: '2024-11-14' },
    { name: 'GEBCO Bathymetry', type: 'Depth & Topography', updated: '2024-10-15' },
    { name: 'NOAA Storm Database', type: 'Historical Storm Events', updated: '2024-11-08' },
  ];

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
                {sites.map(site => (
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
                  {COLORS.map((color, i) => (
                    <div key={i} className="flex items-center mr-4">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></div>
                      <span className="text-sm text-slate-600">Serie {i + 1}</span>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis dataKey="elemento" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Radar name="Serie 1" dataKey="Serie 1" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.3} />
                    <Radar name="Serie 2" dataKey="Serie 2" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.3} />
                    <Radar name="Serie 3" dataKey="Serie 3" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Area Chart */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-center mb-2">
                  {COLORS.map((color, i) => (
                    <div key={i} className="flex items-center mr-4">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></div>
                      <span className="text-sm text-slate-600">Serie {i + 1}</span>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={areaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="Serie 3" stackId="1" stroke={COLORS[2]} fill={COLORS[2]} />
                    <Area type="monotone" dataKey="Serie 2" stackId="1" stroke={COLORS[1]} fill={COLORS[1]} />
                    <Area type="monotone" dataKey="Serie 1" stackId="1" stroke={COLORS[0]} fill={COLORS[0]} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Line Chart */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-center mb-2">
                  {COLORS.map((color, i) => (
                    <div key={i} className="flex items-center mr-4">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></div>
                      <span className="text-sm text-slate-600">Serie {i + 1}</span>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="Serie 1" stroke={COLORS[0]} strokeWidth={2} dot={{ fill: COLORS[0], r: 4 }} />
                    <Line type="monotone" dataKey="Serie 2" stroke={COLORS[1]} strokeWidth={2} dot={{ fill: COLORS[1], r: 4 }} />
                    <Line type="monotone" dataKey="Serie 3" stroke={COLORS[2]} strokeWidth={2} dot={{ fill: COLORS[2], r: 4 }} />
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
                  <div key={idx} className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-all hover:border-cyan-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg mb-1">{source.name}</h3>
                        <p className="text-slate-600">{source.type}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 mb-1">Last Updated</div>
                        <div className="text-sm font-medium text-cyan-600">{source.updated}</div>
                      </div>
                    </div>
                  </div>
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
                  {sites.map((site, i) => (
                    <div key={i} className="flex items-center mr-6">
                      <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: COLORS[i] }}></div>
                      <span className="font-medium text-slate-700">{site}</span>
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

          {/* Map Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden" style={{ height: '500px' }}>
            <div className="w-full h-full bg-gradient-to-br from-blue-100 via-teal-50 to-green-100 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="text-2xl font-bold text-slate-700 mb-2">Interactive Map</h3>
                  <p className="text-slate-600 max-w-md">
                    This area will display your satellite map with heatmap overlay showing site suitability scores.
                    Top-ranked sites will appear as numbered markers.
                  </p>
                  <div className="mt-6 flex gap-4 justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <span className="text-sm text-slate-600">Low Suitability</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                      <span className="text-sm text-slate-600">Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <span className="text-sm text-slate-600">High Suitability</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="fixed bottom-6 right-6 w-96">
          <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl shadow-2xl p-6">
            <div className="bg-white rounded-xl p-4 mb-3 max-h-48 overflow-y-auto">
              <p className="text-sm text-slate-600 italic">Ask me anything about ocean carbon removal sites...</p>
            </div>
            <input
              type="text"
              placeholder="Type smth here..."
              className="w-full px-4 py-3 rounded-xl border-2 border-orange-300 focus:outline-none focus:border-orange-400 text-slate-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OceanCarbonAI;