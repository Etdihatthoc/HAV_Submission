import { useState } from 'react';
import Layout from '../components/Layout/Layout';
import {
  Upload, Image as ImageIcon, Calendar, MapPin,
  Leaf, CheckCircle, X, Sprout
} from 'lucide-react';

const CropUpdate = () => {
  const [formData, setFormData] = useState({
    cropType: '',
    location: '',
    plantedDate: '',
    currentStage: '',
    notes: '',
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Crop types
  const cropTypes = [
    'Lúa', 'Cà phê', 'Tiêu', 'Cao su', 'Rau màu',
    'Cây ăn trái', 'Hoa màu', 'Khác'
  ];

  // Growth stages
  const growthStages = [
    'Gieo hạt / Ươm mạ',
    'Cấy / Trồng',
    'Sinh trưởng',
    'Phát triển',
    'Ra hoa',
    'Đậu quả',
    'Thu hoạch'
  ];

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (selectedImages.length + files.length > 5) {
      alert('Bạn chỉ có thể tải lên tối đa 5 ảnh');
      return;
    }
    const imageUrls = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setSelectedImages(prev => [...prev, ...imageUrls]);
  };

  // Remove image
  const removeImage = (index) => {
    setSelectedImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      // Revoke URL to free memory
      URL.revokeObjectURL(prev[index].preview);
      return newImages;
    });
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    setUploading(true);

    // Simulate upload (demo only)
    setTimeout(() => {
      setUploading(false);
      setUploadSuccess(true);

      // Reset form after 2s
      setTimeout(() => {
        setFormData({
          cropType: '',
          location: '',
          plantedDate: '',
          currentStage: '',
          notes: '',
        });
        // Cleanup image previews
        selectedImages.forEach(img => URL.revokeObjectURL(img.preview));
        setSelectedImages([]);
        setUploadSuccess(false);
      }, 2000);
    }, 1500);
  };

  return (
    <Layout title="Cập nhật quá trình trồng cây">
      <div
        className="min-h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/background.png)' }}
      >
        <div className="min-h-full bg-gradient-to-br from-black/50 to-black/30 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center text-white mb-6">
              <div className="inline-flex items-center justify-center bg-primary-600 rounded-full p-4 mb-4">
                <Sprout size={32} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Cập nhật quá trình trồng cây
              </h1>
              <p className="text-white/80">
                Ghi lại tiến trình trồng trọt để AI hiểu rõ hơn về cây của bạn
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Crop Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Leaf className="inline mr-2" size={16} />
                    Loại cây trồng
                  </label>
                  <select
                    value={formData.cropType}
                    onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">-- Chọn loại cây --</option>
                    {cropTypes.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline mr-2" size={16} />
                    Vị trí trồng
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="VD: Cần Thơ, huyện Phong Điền"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Planted Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline mr-2" size={16} />
                    Ngày gieo/trồng
                  </label>
                  <input
                    type="date"
                    value={formData.plantedDate}
                    onChange={(e) => setFormData({...formData, plantedDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Current Stage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giai đoạn hiện tại
                  </label>
                  <select
                    value={formData.currentStage}
                    onChange={(e) => setFormData({...formData, currentStage: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">-- Chọn giai đoạn --</option>
                    {growthStages.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="VD: Đã bón phân lần 1, cây phát triển tốt..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ImageIcon className="inline mr-2" size={16} />
                    Hình ảnh cây trồng
                  </label>

                  {/* Upload Button */}
                  <label className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 hover:bg-primary-50 transition-colors">
                      <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-sm text-gray-600">
                        Click để chọn ảnh hoặc kéo thả vào đây
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Tối đa 5 ảnh, mỗi ảnh &lt; 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>

                  {/* Image Previews */}
                  {selectedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {selectedImages.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={img.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Đang tải lên...
                    </>
                  ) : uploadSuccess ? (
                    <>
                      <CheckCircle size={20} />
                      Tải lên thành công!
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Cập nhật tiến trình
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Lưu ý:</strong> Thông tin bạn cung cấp sẽ giúp AI hiểu rõ hơn về
                lịch sử và tình trạng cây trồng của bạn, từ đó đưa ra tư vấn chính xác hơn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CropUpdate;
