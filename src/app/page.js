'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  ChartBarIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { fetchCSVData, parseCSV } from '@/utils/csvParser';

// Data state variables

export default function Dashboard() {
  const [selectedSeverity, setSelectedSeverity] = useState('All Severity');
  const [selectedType, setSelectedType] = useState('All Types');
  const [timelineSeverityFilter, setTimelineSeverityFilter] = useState('Critical');
  const [timelineTypeFilter, setTimelineTypeFilter] = useState('All Types');
  
  // Data state variables
  const [attackData, setAttackData] = useState([]);
  const [attackTypesData, setAttackTypesData] = useState([]);
  const [protocolData, setProtocolData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [liveAttackFeed, setLiveAttackFeed] = useState([]);
  const [simHoneypotUltraDetailed, setSimHoneypotUltraDetailed] = useState([]);
  const [attackTimelineData, setAttackTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract unique attack types from CSV data
  const availableAttackTypes = useMemo(() => {
    const timelineData = attackTimelineData.length > 0 ? attackTimelineData : simHoneypotUltraDetailed.filter(row => row.label === 'attack');
    const attackTypesSet = new Set();
    
    timelineData.forEach(attack => {
      const attackType = attack.attack_type || attack.event_type;
      if (attackType && attackType.trim() !== '') {
        attackTypesSet.add(attackType);
      }
    });
    
    return Array.from(attackTypesSet).sort();
  }, [attackTimelineData, simHoneypotUltraDetailed]);

  // Load CSV data function
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all CSV files in parallel
      const [
        attackDataResult,
        attackTypesResult,
        protocolResult,
        countryResult,
        historicalResult,
        liveFeedResult,
        simHoneypotUltraDetailedResult,
        attackTimelineResult
      ] = await Promise.all([
        fetchCSVData('attack_data.csv'),
        fetchCSVData('attack_types.csv'),
        fetchCSVData('protocol_data.csv'),
        fetchCSVData('country_data.csv'),
        fetchCSVData('historical_data.csv'),
        fetchCSVData('live_attack_feed.csv'),
        fetchCSVData('sim_honeypot_ultra_detailed.csv'),
        fetchCSVData('attack_timeline_data.csv')
      ]);

      console.log('Loaded data:', {
        attackData: attackDataResult,
        attackTypes: attackTypesResult,
        protocol: protocolResult,
        country: countryResult,
        historical: historicalResult,
        liveFeed: liveFeedResult,
        simHoneypotUltraDetailed: simHoneypotUltraDetailedResult,
        attackTimeline: attackTimelineResult
      });

      setAttackData(attackDataResult);
      setAttackTypesData(attackTypesResult);
      setProtocolData(protocolResult);
      setCountryData(countryResult);
      setHistoricalData(historicalResult);
      setLiveAttackFeed(liveFeedResult);
      setSimHoneypotUltraDetailed(simHoneypotUltraDetailedResult);
      setAttackTimelineData(attackTimelineResult);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load CSV data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Export all CSV files concatenated into a single download
  const exportAllCSV = async () => {
    const files = [
      'attack_data.csv',
      'attack_data_24h_per_minute.csv',
      'attack_types.csv',
      'protocol_data.csv',
      'country_data.csv',
      'historical_data.csv',
      'live_attack_feed.csv',
      'sim_honeypot_2000fields.csv',
      'sim_honeypot_ultra_detailed.csv',
      'simulated_honeypot_events.csv',
      'simulated_honeypot_events_detailed.csv'
    ];

    try {
      // Fetch all files in parallel
      const responses = await Promise.all(files.map((f) => fetch(`/${f}`)));
      const texts = await Promise.all(responses.map(async (res, i) => {
        if (!res.ok) return `-- ${files[i]} NOT FOUND OR ERROR ${res.status}\n`;
        const txt = await res.text();
        return `-- FILE: ${files[i]}\n${txt.trim()}\n\n`;
      }));

      const combined = texts.join('\n');

      // Trigger download in browser
      const blob = new Blob([combined], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const now = new Date();
      const ts = now.toISOString().replace(/[:.]/g, '-');
      a.download = `attack_data_export_${ts}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting CSVs:', err);
      alert('Failed to export CSV files. See console for details.');
    }
  };

  // Handle uploaded CSV for Attack Timeline
  const handleUploadCSV = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      // parseCSV returns array of objects using first row as headers
      const parsed = parseCSV(text);

      // Map parsed rows to expected attackData format: { time, critical, high, medium }
      const mapped = parsed.map((r) => ({
        time: r.time || r.timestamp || r.Time || r.Timestamp || r.date || r.Date,
        critical: r.critical ? Number(r.critical) : (r.Critical ? Number(r.Critical) : null),
        high: r.high ? Number(r.high) : (r.High ? Number(r.High) : null),
        medium: r.medium ? Number(r.medium) : (r.Medium ? Number(r.Medium) : null),
      }));

      setAttackData(mapped);
    } catch (err) {
      console.error('Failed to parse uploaded CSV:', err);
      alert('Failed to parse uploaded CSV. Check console for details.');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-600';
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getProtocolColor = (protocol) => {
    switch (protocol) {
      case 'TCP': return 'bg-blue-600';
      case 'HTTP': return 'bg-purple-600';
      case 'UDP': return 'bg-teal-600';
      case 'DNS': return 'bg-pink-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Blocked': return 'bg-green-600';
      case 'Active': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  // Apply filters to historical data
  const filteredHistoricalData = historicalData.filter((row) => {
    // Normalize values for safe comparison
    const rowSeverity = (row.severity || '').toString().trim().toLowerCase();
    const rowType = (row.attackType || '').toString().trim().toLowerCase();

    const severityFilterActive = selectedSeverity && selectedSeverity !== 'All Severity';
    const typeFilterActive = selectedType && selectedType !== 'All Types';

    const severityMatches = !severityFilterActive || (rowSeverity === selectedSeverity.toLowerCase());
    const typeMatches = !typeFilterActive || (rowType === selectedType.toLowerCase());

    return severityMatches && typeMatches;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading attack data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Analyst Dashboard</h1>
              <p className="text-gray-400">Centralize intelligence for effective monitoring and response.</p>
            </div>
          </div>
            <div className="flex space-x-3">
            <button 
              onClick={loadData}
              className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg transition-colors"
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>Refresh Data</span>
            </button>
            <button
              onClick={async () => await exportAllCSV()}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-red-600 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Total Attacks</p>
                <p className="text-3xl font-bold">375</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-red-200" />
            </div>
          </div>
          
          <div className="bg-teal-600 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Blocked Attacks</p>
                <p className="text-3xl font-bold">198</p>
              </div>
              <ShieldCheckIcon className="w-8 h-8 text-teal-200" />
            </div>
          </div>
          
          <div className="bg-yellow-600 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Active Threats</p>
                <p className="text-3xl font-bold">276</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-yellow-200" />
            </div>
          </div>
          
          <div className="bg-purple-600 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Critical Level</p>
                <p className="text-3xl font-bold">66</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Attack Timeline */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Attack Timeline (24 Hours)</h3>
            <p className="text-gray-400 text-sm mb-4">Temporal distribution of attacks by severity</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attackData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }} 
                  />
                  <Line type="monotone" dataKey="critical" stroke="#EF4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="high" stroke="#F59E0B" strokeWidth={2} />
                  <Line type="monotone" dataKey="medium" stroke="#14B8A6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live Attack Feed */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Live Attack Feed</h3>
            <p className="text-gray-400 text-sm mb-4">Real-time threat monitoring</p>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {liveAttackFeed.map((attack, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />
                      <span className="font-medium text-sm">{attack.type}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(attack.severity)}`}>
                      {attack.severity}
                    </span>
                  </div>
                  <div className="text-xs text-gray-300 space-y-1">
                    <p>Source: {attack.source}</p>
                    <p>Country: {attack.country}</p>
                    <p>Protocol: {attack.protocol}</p>
                    <p>Packets: {attack.packets}</p>
                    <p>Time: {attack.timestamp}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attack.status)}`}>
                        {attack.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analysis Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Attack Types */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Attack Types</h3>
            <p className="text-gray-400 text-sm mb-4">Distribution by attack vector</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attackTypesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }} 
                  />
                  <Bar dataKey="value" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Protocol Distribution */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Protocol Distribution</h3>
            <p className="text-gray-400 text-sm mb-4">Attacks by network protocol</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={protocolData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {protocolData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {protocolData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span>{item.name}</span>
                  </div>
                  <span>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Source Countries */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Source Countries</h3>
            <p className="text-gray-400 text-sm mb-4">Top attack source locations</p>
            <div className="h-48">
              {Array.isArray(countryData) && countryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {/* country_data.csv provides objects like { country: 'FR', value: 55 } */}
                  <BarChart data={countryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9CA3AF" />
                    <YAxis dataKey="country" type="category" stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }} 
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No country data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Capture Attacker Behavior */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Capture Attacker Behavior</h3>
              <p className="text-gray-400 text-sm">Reconstruct attack paths with visual timelines.</p>
            </div>
            <div className="flex items-center space-x-3">
              <FunnelIcon className="w-4 h-4 text-gray-400" />
              <select 
                value={timelineSeverityFilter}
                onChange={(e) => setTimelineSeverityFilter(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select 
                value={timelineTypeFilter}
                onChange={(e) => setTimelineTypeFilter(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All Types">All Types</option>
                {availableAttackTypes.map((attackType) => (
                  <option key={attackType} value={attackType}>
                    {attackType}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Attack Path Timeline */}
          <div className="space-y-4">
            {(() => {
              const timelineData = attackTimelineData.length > 0 ? attackTimelineData : simHoneypotUltraDetailed.filter(row => row.label === 'attack');
              const filteredData = timelineData.filter(attack => {
                const severity = attack.severity || (attack.label === 'attack' ? 'High' : 'Low');
                const attackType = attack.attack_type || attack.event_type || '';
                const severityMatches = severity === timelineSeverityFilter;
                const typeMatches = timelineTypeFilter === 'All Types' || attackType === timelineTypeFilter;
                return severityMatches && typeMatches;
              });
              
              if (filteredData.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-400">
                    <p>
                      No {timelineSeverityFilter} severity 
                      {timelineTypeFilter !== 'All Types' && ` ${timelineTypeFilter}`} 
                      {' '}attacks available for timeline reconstruction
                    </p>
                  </div>
                );
              }
              
              return filteredData.slice(0, 5).map((attack, index, array) => {
                const attackTime = attack.timestamp ? new Date(attack.timestamp) : new Date();
                const severity = attack.severity || (attack.label === 'attack' ? 'High' : 'Low');
                return (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          severity === 'Critical' ? 'bg-red-600' :
                          severity === 'High' ? 'bg-red-500' :
                          severity === 'Medium' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`}></div>
                        {index < array.length - 1 && <div className="w-0.5 h-full bg-gray-600 mt-2 min-h-[60px]"></div>}
                      </div>
                      
                      {/* Attack details */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-white">
                              {attack.attack_type || attack.event_type || 'Attack Event'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(severity)}`}>
                              {severity}
                            </span>
                            {attack.event_sequence && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-600 text-gray-300">
                                Sequence: {attack.event_sequence}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {attackTime.toLocaleString()}
                          </span>
                        </div>
                        
                        {/* Attack path visualization */}
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-gray-400">Source:</span>
                            <span className="text-blue-400 font-mono">{attack.source_ip || attack.src_ip || 'N/A'}</span>
                            <span className="text-gray-500">→</span>
                            <span className="text-gray-400">Target:</span>
                            <span className="text-red-400 font-mono">{attack.destination_ip || attack.dst_ip || 'N/A'}</span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <div className="flex items-center space-x-1">
                              <span>Protocol:</span>
                              <span className={`px-2 py-0.5 rounded text-white ${getProtocolColor(attack.protocol)}`}>
                                {attack.protocol || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span>Country:</span>
                              <span>{attack.country || attack.src_country || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span>Bytes:</span>
                              <span>{attack.bytes ? attack.bytes.toLocaleString() : 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span>Packets:</span>
                              <span>{attack.packets || attack.pkts || 'N/A'}</span>
                            </div>
                            {attack.duration_ms && (
                              <div className="flex items-center space-x-1">
                                <span>Duration:</span>
                                <span>{attack.duration_ms}ms</span>
                              </div>
                            )}
                          </div>
                          {attack.status && (
                            <div className="mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attack.status)}`}>
                                {attack.status}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Historical Attack Data Table */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Historical Attack Data</h3>
              <p className="text-gray-400 text-sm">Detailed attack logs and analysis</p>
            </div>
            <div className="flex items-center space-x-3">
              <FunnelIcon className="w-4 h-4 text-gray-400" />
              <select 
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All Severity">All Severity</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All Types">All Types</option>
                <option value="SYN Flood">SYN Flood</option>
                <option value="HTTP Flood">HTTP Flood</option>
                <option value="UDP Flood">UDP Flood</option>
                <option value="DNS Amplification">DNS Amplification</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Source IP</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Country</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Attack Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Protocol</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Severity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Packets</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistoricalData.length === 0 ? (
                  <tr className="border-b border-gray-700">
                    <td colSpan={9} className="py-6 px-4 text-center text-gray-400">No historical records match the selected filters.</td>
                  </tr>
                ) : (
                  filteredHistoricalData.map((row, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-3 px-4 text-sm">{row.timestamp}</td>
                      <td className="py-3 px-4 text-sm">
                        <a href="#" className="text-blue-400 hover:text-blue-300">
                          {row.sourceIP}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-sm">{row.country}</td>
                      <td className="py-3 px-4 text-sm">{row.attackType}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getProtocolColor(row.protocol)}`}>
                          {row.protocol}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getSeverityColor(row.severity)}`}>
                          {row.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{row.packets}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <button className="text-gray-400 hover:text-white">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
       
      </div>
    </div>
  );
}