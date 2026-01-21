/**
* Lịch sử
 * View chat and diagnosis history
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { 
  Search, 
  Filter, 
  Calendar,
  Leaf,
  MessageSquare,
  UserCheck,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Image as ImageIcon,
  FileText,
  Trash2,
  Eye
} from 'lucide-react';

const History = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data - replace with API call
  const [historyItems] = useState([
    {
      id: 1,
      type: 'diagnosis',
      title: 'Bệnh đạo ôn trên lúa',
      description: 'Phát hiện bệnh đạo ôn cấp độ trung bình, khuyến nghị phun thuốc Tricyclazole',
      date: '2026-01-16',
      time: '14:30',
      status: 'completed',
      confidence: 92,
      crop: 'Lúa',
      hasImage: true,
    },
    {
      id: 2,
      type: 'chat',
      title: 'Cách phòng trừ sâu đục thân',
      description: 'Tư vấn về biện pháp phòng trừ sâu đục thân tổng hợp IPM',
      date: '2026-01-16',
      time: '10:15',
      status: 'completed',
      messageCount: 8,
      crop: 'Lúa',
      hasImage: false,
    },
    {
      id: 3,
      type: 'expert',
      title: 'Tư vấn với TS. Nguyễn Văn A',
      description: 'Thảo luận về tình trạng vàng lá trên cây cà phê',
      date: '2026-01-15',
      time: '16:45',
      status: 'completed',
      duration: '25 phút',
      crop: 'Cà phê',
      hasImage: true,
    },
    {
      id: 4,
      type: 'diagnosis',
      title: 'Bệnh thán thư trên ớt',
      description: 'Chẩn đoán bệnh thán thư giai đoạn đầu, cần xử lý sớm',
      date: '2026-01-15',
      time: '09:20',
      status: 'pending',
      confidence: 87,
      crop: 'Ớt',
      hasImage: true,
    },
    {
      id: 5,
      type: 'chat',
      title: 'Thời điểm bón phân cho lúa',
      description: 'Hướng dẫn chi tiết về kỹ thuật bón phân theo giai đoạn sinh trưởng',
      date: '2026-01-14',
      time: '11:00',
      status: 'completed',
      messageCount: 12,
      crop: 'Lúa',
      hasImage: false,
    },
    {
      id: 6,
      type: 'diagnosis',
      title: 'Rệp sáp hại cà phê',
      description: 'Phát hiện rệp sáp mức độ nhẹ, khuyến nghị sử dụng thiên địch',
      date: '2026-01-13',
      time: '15:30',
      status: 'completed',
      confidence: 95,
      crop: 'Cà phê',
      hasImage: true,
    },
  ]);

  const tabs = [
    { id: 'all', label: 'Tất cả', count: historyItems.length },
    { id: 'diagnosis', label: 'Chẩn đoán', count: historyItems.filter(i => i.type === 'diagnosis').length },
    { id: 'chat', label: 'Chat AI', count: historyItems.filter(i => i.type === 'chat').length },
    { id: 'expert', label: 'Chuyên gia', count: historyItems.filter(i => i.type === 'expert').length },
  ];

  const filteredItems = historyItems.filter(item => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !selectedDate || item.date === selectedDate;
    return matchesTab && matchesSearch && matchesDate;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'diagnosis': return <Leaf className="text-primary-500" size={20} />;
      case 'chat': return <MessageSquare className="text-blue-500" size={20} />;
      case 'expert': return <UserCheck className="text-purple-500" size={20} />;
      default: return <FileText className="text-gray-500" size={20} />;
    }
  };

  const getTypeBadge = (type) => {
    const badges = {
      diagnosis: { bg: 'bg-primary-100', text: 'text-primary-700', label: 'Chẩn đoán' },
      chat: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Chat AI' },
      expert: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Chuyên gia' },
    };
    const badge = badges[type] || { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Khác' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return (
        <span className="flex items-center text-green-600 text-sm">
          <CheckCircle size={14} className="mr-1" /> Hoàn thành
        </span>
      );
    } else if (status === 'pending') {
      return (
        <span className="flex items-center text-yellow-600 text-sm">
          <Clock size={14} className="mr-1" /> Đang xử lý
        </span>
      );
    }
    return null;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Hôm nay';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Hôm qua';
    }
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Group items by date
  const groupedItems = filteredItems.reduce((groups, item) => {
    const date = item.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {});

  return (
    <Layout title="Lịch sử">
      <div 
        className="min-h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/background.png)' }}
      >
        <div className="min-h-full bg-gradient-to-br from-black/50 to-black/30 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">📋 Lịch sử hoạt động</h1>
              <p className="text-white/80">Xem lại các chẩn đoán, cuộc trò chuyện và tư vấn chuyên gia</p>
            </div>

            {/* Filters Bar */}
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-4 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, mô tả..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Date Filter */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Clear Filters */}
                {(searchQuery || selectedDate) && (
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedDate(''); }}
                    className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex space-x-2 mt-4 overflow-x-auto pb-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* History List */}
            <div className="space-y-6">
              {Object.keys(groupedItems).length === 0 ? (
                <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-12 text-center">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-gray-400" size={40} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy kết quả</h3>
                  <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
              ) : (
                Object.entries(groupedItems).map(([date, items]) => (
                  <div key={date}>
                    {/* Date Header */}
                    <div className="flex items-center mb-4">
                      <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-full">
                        <span className="text-sm font-semibold text-gray-700">{formatDate(date)}</span>
                      </div>
                      <div className="flex-1 h-px bg-white/30 ml-4"></div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white/95 backdrop-blur rounded-xl shadow-lg p-5 hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer group"
                          onClick={() => {
                            if (item.type === 'diagnosis') {
                              navigate(`/result/${item.id}`);
                            } else if (item.type === 'chat') {
                              navigate('/chat');
                            } else if (item.type === 'expert') {
                              navigate('/expert');
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              {/* Icon */}
                              <div className="bg-gray-50 p-3 rounded-xl group-hover:bg-primary-50 transition-colors">
                                {getTypeIcon(item.type)}
                              </div>

                              {/* Content */}
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-1">
                                  {getTypeBadge(item.type)}
                                  <span className="text-sm text-gray-500">{item.time}</span>
                                  {item.hasImage && (
                                    <span className="flex items-center text-gray-400 text-sm">
                                      <ImageIcon size={14} className="mr-1" /> Có ảnh
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                                <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>

                                {/* Meta info */}
                                <div className="flex items-center space-x-4 mt-3">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                    <Leaf size={12} className="mr-1" /> {item.crop}
                                  </span>
                                  {item.confidence && (
                                    <span className="text-sm text-gray-500">
                                      Độ tin cậy: <span className="font-semibold text-primary-600">{item.confidence}%</span>
                                    </span>
                                  )}
                                  {item.messageCount && (
                                    <span className="text-sm text-gray-500">
                                      {item.messageCount} tin nhắn
                                    </span>
                                  )}
                                  {item.duration && (
                                    <span className="text-sm text-gray-500">
                                      Thời lượng: {item.duration}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right Side */}
                            <div className="flex flex-col items-end space-y-2">
                              {getStatusBadge(item.status)}
                              <ChevronRight className="text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" size={20} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default History;
