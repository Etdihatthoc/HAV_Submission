/**
* Bản đồ dịch bệnh
 * Interactive map with heatmap overlay for disease tracking
 */

import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Filter, AlertTriangle, Flag, X } from 'lucide-react';
import epidemicService from '../services/epidemicService';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Vietnam Islands Data - Hoang Sa & Truong Sa
const VIETNAM_ISLANDS = [
  {
    name: 'Quần đảo Hoàng Sa',
    nameEn: 'Paracel Islands',
    position: [16.5, 112.0],
    admin: 'Thành phố Đà Nẵng',
    description: 'Thuộc chủ quyền Việt Nam, do Trung Quốc chiếm đóng trái phép từ 1974'
  },
  {
    name: 'Quần đảo Trường Sa',
    nameEn: 'Spratly Islands', 
    position: [8.6433, 111.9167],
    admin: 'Tỉnh Khánh Hòa',
    description: 'Thuộc chủ quyền Việt Nam, Việt Nam đang quản lý 21 đảo và bãi đá'
  }
];

// Custom marker icons by severity
const createSeverityIcon = (severity) => {
  const colors = {
    high: '#dc2626',    // red-600
    medium: '#ca8a04',  // yellow-600
    low: '#16a34a',     // green-600
    default: '#6b7280'  // gray-500
  };
  const color = colors[severity?.toLowerCase()] || colors.default;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// Vietnam sovereignty marker icon (red flag)
const createVietnamIslandIcon = () => {
  return L.divIcon({
    className: 'vietnam-island-marker',
    html: `<div style="
      position: relative;
      width: 32px;
      height: 32px;
    ">
      <div style="
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid #fbbf24;
        box-shadow: 0 3px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="color: #fbbf24; font-size: 14px;">★</span>
      </div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const EpidemicMap = () => {
  const [alerts, setAlerts] = useState([]);
  const [filters, setFilters] = useState({
    province: '',
    disease: '',
    days: 30,
  });
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(true); // Filter panel visibility

  // Close filter on mobile by default
  useEffect(() => {
    if (window.innerWidth < 768) {
      setFilterOpen(false);
    }
  }, []);

  useEffect(() => {
    loadMapData();
  }, [filters]);

  const loadMapData = async () => {
    try {
      setLoading(true);
      const data = await epidemicService.getAlerts(filters);
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error loading map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Layout title="Bản đồ dịch bệnh">
      <div className="h-full flex relative">
        {/* Mobile Filter Overlay */}
        {filterOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setFilterOpen(false)}
          />
        )}

        {/* Filter Panel - Responsive */}
        <div className={`
          w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto
          fixed md:relative inset-y-0 left-0 z-50
          transition-transform duration-300 ease-in-out
          ${filterOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="text-primary-600" size={24} />
              <h3 className="text-lg font-bold text-gray-900">Bộ lọc</h3>
            </div>

            {/* Close button - visible only on mobile */}
            <button
              onClick={() => setFilterOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-700 p-1"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Province Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tỉnh/Thành phố
              </label>
              <select
                value={filters.province}
                onChange={(e) => setFilters({ ...filters, province: e.target.value })}
                className="input-field"
              >
                <option value="">Tất cả</option>
                <option value="An Giang">An Giang</option>
                <option value="Bạc Liêu">Bạc Liêu</option>
                <option value="Bến Tre">Bến Tre</option>
                <option value="Cà Mau">Cà Mau</option>
                <option value="Cần Thơ">Cần Thơ</option>
                <option value="Hậu Giang">Hậu Giang</option>
                <option value="Kiên Giang">Kiên Giang</option>
                <option value="Long An">Long An</option>
                <option value="Sóc Trăng">Sóc Trăng</option>
                <option value="Tiền Giang">Tiền Giang</option>
                <option value="Trà Vinh">Trà Vinh</option>
                <option value="Vĩnh Long">Vĩnh Long</option>
                <option value="Tây Ninh">Tây Ninh</option>
                <option value="Bình Phước">Bình Phước</option>
                <option value="Bình Dương">Bình Dương</option>
                <option value="Lâm Đồng">Lâm Đồng</option>
                <option value="Đắk Lắk">Đắk Lắk</option>
              </select>
            </div>

            {/* Disease Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại bệnh
              </label>
              <select
                value={filters.disease}
                onChange={(e) => setFilters({ ...filters, disease: e.target.value })}
                className="input-field"
              >
                <option value="">Tất cả</option>
                <option value="Đạo ôn lúa">Đạo ôn lúa</option>
                <option value="Bạc lá lúa">Bạc lá lúa</option>
                <option value="Khô vằn lúa">Khô vằn lúa</option>
                <option value="Rầy nâu">Rầy nâu</option>
                <option value="Sâu đục thân">Sâu đục thân</option>
                <option value="Vàng lá chín sớm">Vàng lá chín sớm</option>
                <option value="Thán thư">Thán thư</option>
                <option value="Rỉ sắt">Rỉ sắt</option>
              </select>
            </div>

            {/* Days Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian (ngày)
              </label>
              <input
                type="number"
                value={filters.days}
                onChange={(e) => setFilters({ ...filters, days: parseInt(e.target.value) })}
                className="input-field"
                min="1"
                max="90"
              />
            </div>

            <button
              onClick={loadMapData}
              className="w-full btn-primary"
            >
              Áp dụng
            </button>
          </div>

          {/* Alerts List */}
          <div className="mt-8">
            <h4 className="font-bold text-gray-900 mb-4">
              Cảnh báo ({alerts.length})
            </h4>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold text-sm text-gray-900">{alert.disease_name}</h5>
                    <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{alert.province}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.case_count} ca bệnh</p>
                </div>
              ))}
              {alerts.length === 0 && !loading && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Không có cảnh báo
                </p>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-bold text-sm text-gray-900 mb-3">Chú thích</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Nguy hiểm cao</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Nguy hiểm trung bình</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Nguy hiểm thấp</span>
              </div>
            </div>
            
            {/* Vietnam Sovereignty Section */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-bold text-sm text-red-700 mb-2 flex items-center">
                <span className="mr-1">🇻🇳</span> Chủ quyền Việt Nam
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-yellow-400 text-[8px]">★</span>
                  </div>
                  <span className="text-gray-700">Quần đảo Việt Nam</span>
                </div>
                <p className="text-[10px] text-gray-500 pl-6">
                  Hoàng Sa & Trường Sa thuộc chủ quyền Việt Nam
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {/* Toggle Filter Button - Mobile only, floating */}
          {!filterOpen && (
            <button
              onClick={() => setFilterOpen(true)}
              className="md:hidden fixed top-4 left-4 z-30 bg-white shadow-lg rounded-lg p-3 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Filter className="text-primary-600" size={20} />
            </button>
          )}

          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          )}
          <MapContainer
            center={[14.0583, 108.2772]}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
          >
            {/* CartoDB Positron - neutral, clean tiles */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            
            {/* Vietnam Sovereignty Markers - Hoang Sa & Truong Sa */}
            {VIETNAM_ISLANDS.map((island, index) => (
              <Marker
                key={`island-${index}`}
                position={island.position}
                icon={createVietnamIslandIcon()}
              >
                <Popup>
                  <div className="p-3 min-w-[250px]">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">🇻🇳</span>
                      <div>
                        <h3 className="font-bold text-red-700">{island.name}</h3>
                        <p className="text-xs text-gray-500 italic">{island.nameEn}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-gray-700 border-t pt-2">
                      <p><strong>Quản lý hành chính:</strong> {island.admin}</p>
                      <p className="text-red-600 font-medium mt-2">{island.description}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t text-center">
                      <span className="text-xs font-bold text-red-700">CHỦ QUYỀN VIỆT NAM</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Severity circles for affected areas */}
            {alerts.map((alert, index) => {
              const lat = alert.center_lat || alert.center_latitude;
              const lon = alert.center_lon || alert.center_longitude;
              if (!lat || !lon) return null;
              
              const radiusMeters = (alert.radius_km || 5) * 1000;
              const severityColors = {
                high: { color: '#dc2626', fillColor: '#fecaca' },
                medium: { color: '#ca8a04', fillColor: '#fef08a' },
                low: { color: '#16a34a', fillColor: '#bbf7d0' }
              };
              const colors = severityColors[alert.severity?.toLowerCase()] || { color: '#6b7280', fillColor: '#e5e7eb' };
              
              return (
                <Circle
                  key={`circle-${index}`}
                  center={[lat, lon]}
                  radius={radiusMeters}
                  pathOptions={{
                    color: colors.color,
                    fillColor: colors.fillColor,
                    fillOpacity: 0.4,
                    weight: 2
                  }}
                />
              );
            })}
            {/* Markers for alert centers */}
            {alerts.map((alert, index) => {
              const lat = alert.center_lat || alert.center_latitude;
              const lon = alert.center_lon || alert.center_longitude;
              if (!lat || !lon) return null;
              
              return (
                <Marker
                  key={`marker-${index}`}
                  position={[lat, lon]}
                  icon={createSeverityIcon(alert.severity)}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="text-red-500" size={16} />
                        <h3 className="font-bold text-sm">{alert.disease_name}</h3>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p><strong>Khu vực:</strong> {alert.district ? `${alert.district}, ` : ''}{alert.province}</p>
                        <p><strong>Số ca:</strong> {alert.case_count} ca bệnh</p>
                        <p><strong>Bán kính:</strong> {alert.radius_km || 5} km</p>
                        <p><strong>Mức độ:</strong> <span className={`font-medium ${
                          alert.severity === 'high' ? 'text-red-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`}>{alert.severity === 'high' ? 'Nguy hiểm' : alert.severity === 'medium' ? 'Trung bình' : 'Thấp'}</span></p>
                        {alert.alert_message && <p className="mt-2 italic">{alert.alert_message}</p>}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </Layout>
  );
};

export default EpidemicMap;
