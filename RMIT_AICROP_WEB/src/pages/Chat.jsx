/**
 * Chat Page
 * AI Chat interface for crop diagnosis - Responsive
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { Send, Image as ImageIcon, Mic, X, Sparkles, Leaf, UserCheck, AlertTriangle, MapPin, Thermometer, Coins, Square, Play, MessageSquare, Stethoscope } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import chatService from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';
import { useCredits } from '../contexts/CreditsContext';
import '../styles/markdown.css';

// Fake location/weather data for demo
const DEMO_CONTEXT = {
  location: {
    latitude: 10.0452,
    longitude: 105.7469,
    province: 'Cần Thơ',
    district: 'Ninh Kiều',
  },
  weather: {
    temperature: 32,
    humidity: 78,
    conditions: 'Nắng nhẹ, có mây',
  },
  soil: 'Đất phù sa',
};

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { credits, deductCredits, hasSufficientCredits } = useCredits();

  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showExpertSuggestion, setShowExpertSuggestion] = useState(false);
  const [contextInfo, setContextInfo] = useState(DEMO_CONTEXT);
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [selectedMessageForExpert, setSelectedMessageForExpert] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [chatMode, setChatMode] = useState('chatbot'); // 'chatbot' or 'diagnosis'

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  // Auto scroll to bottom when new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
    // Reset input to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Detect supported audio MIME type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/mp4',
      ];

      const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: supportedMimeType,
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Use actual MIME type from MediaRecorder
        const mimeType = mediaRecorder.mimeType || supportedMimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        // Clear interval
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Update recording time
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.');
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Cancel recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setAudioBlob(null);
    setRecordingTime(0);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  // Clear audio recording
  const clearAudio = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  // Format recording time
  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Parse confidence from AI response
  const parseConfidence = (responseText) => {
    // Look for confidence patterns like "độ tin cậy: 65%", "confidence: 70%", etc.
    const patterns = [
      /độ tin cậy[:\s]+(\d+)%/i,
      /confidence[:\s]+(\d+)%/i,
      /tin cậy[:\s]+(\d+)%/i,
      /\[(\d+)%\]/,
    ];
    
    for (const pattern of patterns) {
      const match = responseText.match(pattern);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    
    // Default to 80% if no confidence found
    return 80;
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!message.trim() && !selectedImage && !audioBlob) return;

    // Save current values before clearing
    const currentMessage = message;
    const currentImage = selectedImage;
    const currentImagePreview = imagePreview;
    const currentAudioBlob = audioBlob;

    // Clear inputs IMMEDIATELY for smooth UX
    setMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    setAudioBlob(null);
    setShowExpertSuggestion(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setIsLoading(true);

    // Add user message to chat
    const userMessage = {
      role: 'user',
      message: currentMessage || (currentImage ? 'Đã gửi hình ảnh' : 'Đã gửi audio'),
      image: currentImagePreview,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, userMessage]);

    try {
      // Use authenticated user ID or fallback
      const farmerId = user?.id || user?.phone || 'web_user_001';
      
      // Send to API with location and weather context
      const response = await chatService.sendMessage({
        mode: chatMode, // NEW: chatbot or diagnosis mode
        message: currentMessage || (currentImage ? 'Hãy phân tích hình ảnh này' : 'Hãy phân tích audio này'),
        image: currentImage,
        audio: currentAudioBlob,
        farmerId: farmerId,
        location: contextInfo.location,
        weather: contextInfo.weather,
      });

      const aiResponse = response.message || response.ai_response || 'Không có phản hồi';
      const confidence = response.confidence || parseConfidence(aiResponse);
      const needsExpert = response.needs_expert || confidence < 70;

      // Add AI response to chat
      const aiMessage = {
        role: 'assistant',
        message: aiResponse,
        timestamp: new Date(),
        confidence: confidence,
        needsExpert: needsExpert,
      };
      setChatHistory(prev => [...prev, aiMessage]);

      // Show expert suggestion if low confidence
      if (needsExpert) {
        setShowExpertSuggestion(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        message: '❌ Có lỗi xảy ra. Vui lòng thử lại.',
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle ask expert
  const handleAskExpert = (messageIndex) => {
    setSelectedMessageForExpert(messageIndex);
    setShowExpertModal(true);
  };

  // Confirm expert consultation
  const confirmExpertConsultation = () => {
    const EXPERT_COST = 25;

    // Check credits
    if (!hasSufficientCredits(EXPERT_COST)) {
      alert(`Không đủ xu! Bạn cần ${EXPERT_COST} xu để tư vấn chuyên gia. Số dư hiện tại: ${credits} xu`);
      setShowExpertModal(false);
      return;
    }

    // Deduct credits (optimistic update)
    deductCredits(EXPERT_COST);

    // Navigate to expert chat với context
    const selectedMessage = selectedMessageForExpert !== null
      ? chatHistory[selectedMessageForExpert]
      : null;

    // Store context in sessionStorage for ExpertChat page
    if (selectedMessage) {
      sessionStorage.setItem('expert_context', JSON.stringify({
        message: selectedMessage.message,
        image: selectedMessage.image,
        confidence: selectedMessage.confidence,
        timestamp: selectedMessage.timestamp,
        userQuestion: chatHistory[selectedMessageForExpert - 1]?.message || '',
      }));
    }

    setShowExpertModal(false);
    navigate('/expert');
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick suggestion chips
  const suggestions = [
    '🔍 Chẩn đoán cho tôi!',
    'Lá cây có đốm vàng là bệnh gì?',
    'Cách phòng trừ sâu đục thân',
    'Cây lúa bị vàng lá nguyên nhân',
  ];

  return (
    <Layout title="Chat AI">
      {/* Full page with background */}
      <div 
        className="min-h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/background.png)' }}
      >
        <div className="min-h-full bg-black/40 p-3 md:p-8">
          {/* Header */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center text-white mb-4 md:mb-6">
              <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full px-4 md:px-6 py-2 mb-3 md:mb-4">
                <Sparkles className="text-yellow-300 mr-2" size={18} />
                <span className="font-medium text-sm md:text-base">Powered by AI</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold mb-2">💬 Chat với AI</h1>
              <p className="text-sm md:text-lg text-white/80">Hỏi đáp, chẩn đoán bệnh cây trồng với trí tuệ nhân tạo</p>
              
              {/* Context Info Bar */}
              <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-3 md:mt-4 text-xs md:text-sm">
                <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                  <MapPin size={14} className="mr-1" />
                  <span>{contextInfo.location.province}</span>
                </div>
                <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                  <Thermometer size={14} className="mr-1" />
                  <span>{contextInfo.weather.temperature}°C | {contextInfo.weather.humidity}%</span>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center justify-center gap-2 md:gap-3 mt-4 md:mt-6 mb-4">
                <button
                  onClick={() => setChatMode('chatbot')}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg md:rounded-xl transition-all text-sm md:text-base ${
                    chatMode === 'chatbot'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare size={16} className="md:w-5 md:h-5" />
                  <span className="font-medium">Tư vấn thông thường</span>
                </button>

                <button
                  onClick={() => setChatMode('diagnosis')}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg md:rounded-xl transition-all text-sm md:text-base ${
                    chatMode === 'diagnosis'
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Stethoscope size={16} className="md:w-5 md:h-5" />
                  <span className="font-medium">Chẩn đoán bệnh</span>
                </button>
              </div>
            </div>

            {/* Chat Container */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl overflow-hidden">
              {/* Chat History - Responsive height */}
              <div className="h-[calc(100vh-380px)] md:h-[450px] min-h-[300px] overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 bg-gradient-to-b from-gray-50 to-white">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 px-4">
                    <div className="bg-primary-100 p-4 md:p-6 rounded-full mb-4">
                      <Leaf className="text-primary-600" size={36} />
                    </div>
                    <p className="text-lg md:text-xl font-semibold text-gray-700 mb-2">Xin chào! 👋</p>
                    <p className="text-center text-sm md:text-base max-w-md mb-4 md:mb-6">
                      Tôi là trợ lý AI chuyên về nông nghiệp. Hãy hỏi tôi về bệnh cây trồng, cách chăm sóc, hoặc gửi ảnh để được chẩn đoán.
                    </p>
                    
                    {/* Quick Suggestions */}
                    <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setMessage(suggestion)}
                          className="px-3 md:px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-xs md:text-sm hover:bg-primary-100 transition-colors border border-primary-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {chatHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={`message-bubble flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] md:max-w-[70%] rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-3 ${
                            msg.role === 'user'
                              ? 'bg-primary-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                          }`}
                        >
                          {msg.image && (
                            <img
                              src={msg.image}
                              alt="Uploaded"
                              className="rounded-lg mb-2 max-w-full"
                            />
                          )}
                          {msg.role === 'assistant' ? (
                            <div className="markdown-content">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.message}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap text-sm md:text-base">{msg.message}</p>
                          )}
                          
                          {/* Confidence indicator for AI messages */}
                          {msg.role === 'assistant' && msg.confidence && (
                            <div className={`mt-2 text-xs flex items-center gap-1 ${
                              msg.confidence >= 70 ? 'text-green-600' : 'text-orange-500'
                            }`}>
                              <span>Độ tin cậy: {msg.confidence}%</span>
                            </div>
                          )}

                          {/* Ask Expert Button for AI messages */}
                          {msg.role === 'assistant' && (
                            <button
                              onClick={() => handleAskExpert(index)}
                              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-xs font-medium transition-colors border border-orange-200"
                            >
                              <UserCheck size={14} />
                              Hỏi chuyên gia
                            </button>
                          )}

                          <p className={`text-xs mt-1 md:mt-2 ${msg.role === 'user' ? 'text-primary-100' : 'text-gray-400'}`}>
                            {msg.timestamp.toLocaleTimeString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Expert Suggestion Button */}
                    {showExpertSuggestion && !isLoading && (
                      <div className="flex justify-center my-3 md:my-4">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg md:rounded-xl p-3 md:p-4 max-w-md mx-2">
                          <div className="flex items-start gap-2 md:gap-3">
                            <AlertTriangle className="text-orange-500 flex-shrink-0 mt-0.5" size={18} />
                            <div>
                              <p className="text-xs md:text-sm text-orange-800 mb-2 md:mb-3">
                                Độ tin cậy thấp! Bạn có muốn hỏi ý kiến chuyên gia nông nghiệp?
                              </p>
                              <button
                                onClick={() => handleAskExpert(chatHistory.length - 1)}
                                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors"
                              >
                                <UserCheck size={16} />
                                Hỏi chuyên gia
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={chatEndRef} />
                  </>
                )}
                
                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recording Indicator Bar */}
              {isRecording && (
                <div className="px-4 md:px-6 py-2 bg-red-50 border-t border-red-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-700 font-medium text-sm">Đang ghi âm...</span>
                      <span className="text-red-600 text-sm">{formatRecordingTime(recordingTime)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Preview */}
              {audioBlob && !isRecording && (
                <div className="px-4 md:px-6 py-2 md:py-3 bg-blue-50 border-t border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Play className="text-blue-600" size={16} />
                      <span className="text-blue-700 text-sm">Audio đã ghi ({formatRecordingTime(recordingTime)})</span>
                    </div>
                    <button
                      onClick={clearAudio}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="px-4 md:px-6 py-2 md:py-3 bg-gray-100 border-t border-gray-200">
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="h-16 md:h-20 rounded-lg" />
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="px-3 md:px-6 py-3 md:py-4 bg-white border-t border-gray-200">
                <div className="flex items-end space-x-2 md:space-x-3">
                  {/* Attachment Buttons */}
                  <div className="flex space-x-1">
                    <label className="cursor-pointer p-2 md:p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg md:rounded-xl transition-colors">
                      <ImageIcon size={20} />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                    {/* Dynamic Recording Controls */}
                    {!isRecording && !audioBlob && (
                      <button
                        onClick={startRecording}
                        className="p-2 md:p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg md:rounded-xl transition-colors"
                        title="Bắt đầu ghi âm"
                      >
                        <Mic size={20} />
                      </button>
                    )}
                    
                    {isRecording && (
                      <div className="flex space-x-1">
                        <button
                          onClick={stopRecording}
                          className="p-2 md:p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg md:rounded-xl transition-colors"
                          title="Dừng ghi âm"
                        >
                          <Square size={20} />
                        </button>
                        <button
                          onClick={cancelRecording}
                          className="p-2 md:p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg md:rounded-xl transition-colors"
                          title="Hủy ghi âm"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    )}
                    
                    {audioBlob && !isRecording && (
                      <button
                        onClick={clearAudio}
                        className="p-2 md:p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg md:rounded-xl transition-colors"
                        title="Xóa audio"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>

                  {/* Text Input */}
                  <div className="flex-1 relative">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Nhập câu hỏi..."
                      className="w-full resize-none border border-gray-300 rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[40px] md:min-h-[48px] max-h-24 md:max-h-32 text-sm md:text-base"
                      rows={1}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || (!message.trim() && !selectedImage && !audioBlob)}
                    className="bg-primary-600 hover:bg-primary-700 text-white p-2 md:p-3 rounded-lg md:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expert Consultation Confirmation Modal */}
      {showExpertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <UserCheck className="text-orange-600" size={32} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Tư vấn chuyên gia
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-6">
                Bạn sẽ được kết nối với chuyên gia nông nghiệp để nhận tư vấn chuyên sâu về vấn đề của bạn.
              </p>

              {/* Cost Info */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Chi phí:</span>
                  <div className="flex items-center gap-1 text-orange-600 font-bold text-lg">
                    <Coins size={20} />
                    <span>25 xu</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Số dư hiện tại:</span>
                  <span className={`font-semibold ${credits >= 25 ? 'text-green-600' : 'text-red-600'}`}>
                    {credits} xu
                  </span>
                </div>
              </div>

              {/* Warning if insufficient */}
              {credits < 25 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-700 text-sm">
                    ⚠️ Không đủ xu! Bạn cần thêm {25 - credits} xu.
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExpertModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmExpertConsultation}
                  disabled={credits < 25}
                  className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <UserCheck size={18} />
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Chat;
