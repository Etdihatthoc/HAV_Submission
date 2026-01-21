/**
* Chat với chuyên gia
 * 3-column layout: Expert list | Chat window | Case context
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { Send, Image as ImageIcon, Mic, User, Circle } from 'lucide-react';
import expertService from '../services/expertService';
import chatService from '../services/chatService';
import diagnosisService from '../services/diagnosisService';
import { API_BASE_URL } from '../config/api';

const ExpertChat = () => {
  const { diagnosisId } = useParams();
  const [experts, setExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatContext, setChatContext] = useState(null);

  useEffect(() => {
    loadExperts();

    // Load context from Chat page
    const contextData = sessionStorage.getItem('expert_context');
    if (contextData) {
      try {
        const parsed = JSON.parse(contextData);
        setChatContext(parsed);
        // Clear after loading to prevent reuse
        sessionStorage.removeItem('expert_context');
      } catch (error) {
        console.error('Error parsing context:', error);
      }
    }

    if (diagnosisId) {
      loadDiagnosisContext();
    }
  }, [diagnosisId]);

  const loadExperts = async () => {
    try {
      // For demo, use mock experts since we need auth token
      setExperts([
        { id: 1, name: 'Dr. Nguyễn Văn A', specialty: 'Bệnh lúa', online: true },
        { id: 2, name: 'Dr. Trần Thị B', specialty: 'Dịch hại', online: true },
        { id: 3, name: 'Dr. Lê Văn C', specialty: 'Bệnh cây trồng', online: false },
      ]);
    } catch (error) {
      console.error('Error loading experts:', error);
    }
  };

  const loadDiagnosisContext = async () => {
    try {
      const data = await diagnosisService.getDiagnosisById(diagnosisId);
      setDiagnosis(data);
    } catch (error) {
      console.error('Error loading diagnosis:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      role: 'user',
      message: newMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate expert response
    setTimeout(() => {
      const expertMessage = {
        role: 'expert',
        message: 'Cảm ơn bạn đã gửi câu hỏi. Tôi đang xem xét ca bệnh và sẽ phản hồi sớm.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, expertMessage]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Layout title="Tư vấn Chuyên gia">
      <div className="h-full flex">
        {/* Left: Expert List */}
        <div className="w-72 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">Chuyên gia khả dụng</h3>
            <p className="text-sm text-gray-600 mt-1">{experts.filter(e => e.online).length} đang trực tuyến</p>
          </div>

          <div className="p-4 space-y-2">
            {experts.map((expert) => (
              <button
                key={expert.id}
                onClick={() => setSelectedExpert(expert)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedExpert?.id === expert.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary-600 rounded-full p-2 text-white">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{expert.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{expert.specialty}</p>
                    </div>
                  </div>
                  <Circle
                    size={12}
                    className={expert.online ? 'text-green-500 fill-green-500' : 'text-gray-300 fill-gray-300'}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Middle: Chat Window */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 rounded-full p-2 text-white">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  {selectedExpert?.name || 'Chọn chuyên gia'}
                </h3>
                {selectedExpert && (
                  <p className="text-sm text-gray-600">{selectedExpert.specialty}</p>
                )}
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <p className="text-lg font-medium">Bắt đầu cuộc trò chuyện</p>
                  <p className="text-sm mt-2">Gửi tin nhắn để tư vấn với chuyên gia</p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message-bubble flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-lg rounded-lg px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-primary-100' : 'text-gray-500'}`}>
                      {msg.timestamp.toLocaleTimeString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-end space-x-3">
              <div className="flex space-x-2">
                <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <ImageIcon size={20} />
                </button>
                <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Mic size={20} />
                </button>
              </div>

              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="flex-1 resize-none input-field min-h-[44px] max-h-32"
                rows={1}
                disabled={!selectedExpert}
              />

              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !selectedExpert}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Case Context */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">Thông tin ca bệnh</h3>
          </div>

          <div className="p-4 space-y-4">
            {/* Context from Chat */}
            {chatContext && (
              <>
                {/* User Question */}
                {chatContext.userQuestion && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-700 mb-2">Câu hỏi của người dùng</h4>
                    <p className="text-sm text-gray-900">{chatContext.userQuestion}</p>
                  </div>
                )}

                {/* AI Response */}
                {chatContext.message && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Phản hồi của AI</h4>
                    <p className="text-sm text-gray-900">{chatContext.message}</p>
                  </div>
                )}

                {/* Confidence */}
                {chatContext.confidence && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Độ tin cậy</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${chatContext.confidence >= 70 ? 'bg-green-600' : 'bg-orange-600'}`}
                          style={{ width: `${chatContext.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{chatContext.confidence}%</span>
                    </div>
                  </div>
                )}

                {/* Image */}
                {chatContext.image && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Hình ảnh</h4>
                    <img
                      src={chatContext.image}
                      alt="Case"
                      className="w-full rounded-lg shadow-md"
                    />
                  </div>
                )}
              </>
            )}

            {diagnosis ? (
              <>
                {/* Image */}
                {diagnosis.image_path && (
                  <div>
                    <img
                      src={`${API_BASE_URL}${diagnosis.image_path}`}
                      alt="Case"
                      className="w-full rounded-lg shadow-md"
                    />
                  </div>
                )}

                {/* Disease Info */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Bệnh phát hiện</h4>
                  <p className="text-lg font-bold text-gray-900">{diagnosis.disease_detected || 'Chưa xác định'}</p>
                </div>

                {/* Confidence */}
                {diagnosis.confidence && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Độ tin cậy</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 bg-primary-600 rounded-full"
                          style={{ width: `${diagnosis.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{Math.round(diagnosis.confidence)}%</span>
                    </div>
                  </div>
                )}

                {/* Location */}
                {diagnosis.province && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Vị trí</h4>
                    <p className="text-sm text-gray-900">
                      {diagnosis.province}
                      {diagnosis.district && `, ${diagnosis.district}`}
                    </p>
                  </div>
                )}

                {/* Date */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Ngày chẩn đoán</h4>
                  <p className="text-sm text-gray-900">
                    {new Date(diagnosis.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                {/* AI Reasoning */}
                {diagnosis.ai_reasoning && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Phân tích AI</h4>
                    <p className="text-xs text-gray-700 line-clamp-4">{diagnosis.ai_reasoning}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p className="text-sm">Không có thông tin ca bệnh</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExpertChat;
