/**
 * Diagnosis Result Page
 * Display detailed diagnosis results with image and treatment information
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { Save, MessageCircle, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import diagnosisService from '../services/diagnosisService';
import { API_BASE_URL } from '../config/api';

const DiagnosisResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDiagnosis();
    }
  }, [id]);

  const loadDiagnosis = async () => {
    try {
      setLoading(true);
      const data = await diagnosisService.getDiagnosisById(id);
      setDiagnosis(data);
    } catch (error) {
      console.error('Error loading diagnosis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConsultExpert = () => {
    navigate(`/expert/${id}`);
  };

  const handleSave = () => {
    alert('Kết quả đã được lưu!');
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSeverityBadge = (severity) => {
    const severityMap = {
      high: { color: 'bg-red-100 text-red-700', label: 'Cao' },
      medium: { color: 'bg-yellow-100 text-yellow-700', label: 'Trung bình' },
      low: { color: 'bg-green-100 text-green-700', label: 'Thấp' },
    };
    const config = severityMap[severity?.toLowerCase()] || severityMap.medium;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout title="Kết quả Chẩn đoán">
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!diagnosis) {
    return (
      <Layout title="Kết quả Chẩn đoán">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Không tìm thấy kết quả chẩn đoán</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Kết quả Chẩn đoán">
      <div className="h-full p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Actions */}
          <div className="mb-6 flex justify-end space-x-4">
            <button onClick={handleSave} className="btn-outline flex items-center space-x-2">
              <Save size={18} />
              <span>Lưu kết quả</span>
            </button>
            <button onClick={handleConsultExpert} className="btn-primary flex items-center space-x-2">
              <MessageCircle size={18} />
              <span>Tư vấn Chuyên gia</span>
            </button>
          </div>

          {/* Main Content - Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Image */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Hình ảnh đã tải lên</h3>
              {diagnosis.image_path ? (
                <img
                  src={`${API_BASE_URL}${diagnosis.image_path}`}
                  alt="Crop disease"
                  className="w-full rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">Không có hình ảnh</p>
                </div>
              )}
              {diagnosis.province && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Vị trí:</span> {diagnosis.province}
                    {diagnosis.district && `, ${diagnosis.district}`}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Ngày:</span>{' '}
                    {new Date(diagnosis.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Results */}
            <div className="space-y-6">
              {/* Disease Detected */}
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm text-gray-600 mb-2">Bệnh phát hiện</h3>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {diagnosis.disease_detected || 'Chưa xác định'}
                    </h2>
                  </div>
                  <CheckCircle2 className="text-primary-600" size={32} />
                </div>
                
                {/* Confidence */}
                {diagnosis.confidence && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">Độ tin cậy</span>
                      <span className="text-sm font-bold text-gray-900">
                        {Math.round(diagnosis.confidence)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${getConfidenceColor(
                          diagnosis.confidence
                        )}`}
                        style={{ width: `${diagnosis.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Severity */}
                {diagnosis.severity && (
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-600 mr-2">Mức độ:</span>
                    {getSeverityBadge(diagnosis.severity)}
                  </div>
                )}
              </div>

              {/* AI Reasoning */}
              {diagnosis.ai_reasoning && (
                <div className="card">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Phân tích của AI</h3>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <p className="whitespace-pre-wrap">{diagnosis.ai_reasoning}</p>
                  </div>
                </div>
              )}

              {/* Treatment */}
              {diagnosis.treatment && (
                <div className="card">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Phác đồ điều trị</h3>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    {typeof diagnosis.treatment === 'string' ? (
                      <div className="space-y-2">
                        {diagnosis.treatment.split('\n').map((line, index) => (
                          line.trim() && (
                            <div key={index} className="flex items-start space-x-2">
                              <span className="text-primary-600 font-bold">•</span>
                              <p className="flex-1">{line.trim()}</p>
                            </div>
                          )
                        ))}
                      </div>
                    ) : (
                      <p>{diagnosis.treatment}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Expert Review Status */}
              {diagnosis.expert_reviewed && (
                <div className="card border-2 border-primary-300 bg-primary-50">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="text-primary-600 flex-shrink-0" size={24} />
                    <div className="flex-1">
                      <h4 className="font-bold text-primary-900">Đã được Chuyên gia xác nhận</h4>
                      {diagnosis.expert_comment && (
                        <p className="text-sm text-primary-700 mt-2">
                          {diagnosis.expert_comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DiagnosisResult;
