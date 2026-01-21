/**
* Trang chủ
 * Overview with stats, quick actions, and recent activities
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { 
  MessageSquare, 
  Map, 
  UserCheck, 
  History,
  TrendingUp, 
  AlertTriangle, 
  Users,
  Leaf,
  ArrowRight,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';

const TrangChu = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDiagnoses: 245,
    successRate: 94,
    activeAlerts: 12,
    expertsOnline: 3,
  });
  
  const [recentActivities] = useState([
    { id: 1, type: 'diagnosis', title: 'Chẩn đoán bệnh đạo ôn', status: 'success', time: '5 phút trước', crop: 'Lúa' },
    { id: 2, type: 'chat', title: 'Tư vấn phòng trừ sâu bệnh', status: 'success', time: '15 phút trước', crop: 'Rau màu' },
    { id: 3, type: 'expert', title: 'Kết nối chuyên gia', status: 'pending', time: '1 giờ trước', crop: 'Cà phê' },
    { id: 4, type: 'diagnosis', title: 'Phân tích bệnh vàng lá', status: 'success', time: '2 giờ trước', crop: 'Lúa' },
    { id: 5, type: 'alert', title: 'Cảnh báo dịch rầy nâu', status: 'warning', time: '3 giờ trước', crop: 'Lúa' },
  ]);

  const quickActions = [
    { 
      title: 'Chat với AI', 
      description: 'Hỏi đáp nhanh về bệnh cây trồng',
      icon: MessageSquare, 
      path: '/chat',
      color: 'bg-primary-500',
      hoverColor: 'hover:bg-primary-600'
    },
    { 
      title: 'Bản đồ dịch bệnh', 
      description: 'Xem cảnh báo theo khu vực',
      icon: Map, 
      path: '/map',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    { 
      title: 'Chuyên gia', 
      description: 'Kết nối tư vấn trực tiếp',
      icon: UserCheck, 
      path: '/expert',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
    { 
      title: 'Lịch sử', 
      description: 'Xem lại các chẩn đoán',
      icon: History, 
      path: '/history',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600'
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="text-green-500" size={18} />;
      case 'pending': return <Clock className="text-yellow-500" size={18} />;
      case 'warning': return <AlertTriangle className="text-red-500" size={18} />;
      default: return <Activity className="text-gray-500" size={18} />;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'diagnosis': return <Leaf className="text-primary-500" size={20} />;
      case 'chat': return <MessageSquare className="text-blue-500" size={20} />;
      case 'expert': return <UserCheck className="text-purple-500" size={20} />;
      case 'alert': return <AlertTriangle className="text-red-500" size={20} />;
      default: return <Activity className="text-gray-500" size={20} />;
    }
  };

  return (
    <Layout title="Trang chủ">
      <div 
        className="min-h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/background.png)' }}
      >
        <div className="min-h-full bg-gradient-to-br from-black/50 to-black/30 p-4 md:p-8">
          {/* Welcome Header */}
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                Xin chào! 👋
              </h1>
              <p className="text-base md:text-xl text-white/80">
                Chào mừng bạn đến với Bạn của nhà nông
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white/95 backdrop-blur rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Tổng chẩn đoán</p>
                    <p className="text-xl md:text-3xl font-bold text-gray-900">{stats.totalDiagnoses}</p>
                    <p className="text-green-600 text-xs md:text-sm mt-1 hidden md:flex items-center">
                      <TrendingUp size={14} className="mr-1" /> +12% tuần này
                    </p>
                  </div>
                  <div className="bg-primary-100 p-2 md:p-4 rounded-xl md:rounded-2xl">
                    <Leaf className="text-primary-600" size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Độ chính xác</p>
                    <p className="text-xl md:text-3xl font-bold text-gray-900">{stats.successRate}%</p>
                    <p className="text-blue-600 text-xs md:text-sm mt-1 hidden md:flex items-center">
                      <Zap size={14} className="mr-1" /> AI nâng cao
                    </p>
                  </div>
                  <div className="bg-blue-100 p-2 md:p-4 rounded-xl md:rounded-2xl">
                    <CheckCircle className="text-blue-600" size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Cảnh báo</p>
                    <p className="text-xl md:text-3xl font-bold text-gray-900">{stats.activeAlerts}</p>
                    <p className="text-red-600 text-xs md:text-sm mt-1 hidden md:flex items-center">
                      <AlertTriangle size={14} className="mr-1" /> Cần chú ý
                    </p>
                  </div>
                  <div className="bg-red-100 p-2 md:p-4 rounded-xl md:rounded-2xl">
                    <AlertTriangle className="text-red-600" size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">Chuyên gia</p>
                    <p className="text-xl md:text-3xl font-bold text-gray-900">{stats.expertsOnline}</p>
                    <p className="text-purple-600 text-xs md:text-sm mt-1 hidden md:flex items-center">
                      <Users size={14} className="mr-1" /> Sẵn sàng
                    </p>
                  </div>
                  <div className="bg-purple-100 p-2 md:p-4 rounded-xl md:rounded-2xl">
                    <Users className="text-purple-600" size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-2xl font-bold text-white mb-3 md:mb-4">Truy cập nhanh</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(action.path)}
                    className={`${action.color} ${action.hoverColor} text-white rounded-xl md:rounded-2xl p-4 md:p-6 text-left transition-all hover:-translate-y-1 hover:shadow-xl group`}
                  >
                    <div className="bg-white/20 w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-4">
                      <action.icon size={20} />
                    </div>
                    <h3 className="text-sm md:text-lg font-bold mb-0.5 md:mb-1">{action.title}</h3>
                    <p className="text-white/80 text-xs md:text-sm hidden md:block mb-3">{action.description}</p>
                    <div className="hidden md:flex items-center text-sm font-medium">
                      Truy cập <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white/95 backdrop-blur rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Hoạt động gần đây</h2>
                <button 
                  onClick={() => navigate('/history')}
                  className="text-primary-600 hover:text-primary-700 font-medium text-xs md:text-sm flex items-center"
                >
                  Xem tất cả <ArrowRight size={14} className="ml-1" />
                </button>
              </div>

              <div className="space-y-3 md:space-y-4">
                {recentActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className="bg-white p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm md:text-base truncate max-w-[150px] md:max-w-none">{activity.title}</p>
                        <p className="text-xs md:text-sm text-gray-500">
                          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 mr-2">
                            {activity.crop}
                          </span>
                          {activity.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(activity.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrangChu;
