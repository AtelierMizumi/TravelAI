import React, { useState } from 'react';
import { Camera, Sparkles, RefreshCw, AlertCircle, HelpCircle, Compass, ArrowRight, CheckCircle2 } from 'lucide-react';
import { aiService } from '../services/aiService';
import { locationService } from '../services/locationService';
import { UploadBox } from '../components/ai/UploadBox';
import { LandmarkCard } from '../components/ai/LandmarkCard';
import { SuggestedServices } from '../components/ai/SuggestedServices';
import { Button } from '../components/common/Button';
import { Toast } from '../components/common/Toast';
import { Skeleton } from '../components/ui/Skeleton';
import { Link } from 'react-router-dom';

export const RecognizePage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [matchedLocation, setMatchedLocation] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleImageSelected = async (file) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setRecognitionResult(null);
    setMatchedLocation(null);
    setIsAnalyzing(true);

    try {
      // 1. Call AI Vision service
      const result = await aiService.recognizeLandmark(file);
      setRecognitionResult(result);

      // 2. If landmark recognized, query database for rich catalog metadata
      if (result.landmark_name && result.confidence >= 0.5) {
        try {
          const locData = await locationService.getLocations({
            keyword: result.landmark_name,
            size: 1,
          });
          if (locData && locData.content && locData.content.length > 0) {
            setMatchedLocation(locData.content[0]);
          }
        } catch {
          // Location matching is an enrichment, do not fail recognition if db query fails
        }
      }
    } catch (err) {
      setErrorMessage(
        err?.detail || 'Không thể nhận diện hình ảnh lúc này. Vui lòng thử lại sau.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setRecognitionResult(null);
    setMatchedLocation(null);
    setErrorMessage(null);
    setIsAnalyzing(false);
  };

  // Quick Demo Samples for instant testing
  const handleQuickDemo = async (sampleName) => {
    // Generate a minimal dummy File representing the sample
    const dummyBlob = new Blob(['sample-content'], { type: 'image/jpeg' });
    const dummyFile = new File([dummyBlob], `${sampleName.toLowerCase().replace(/\s+/g, '-')}.jpg`, {
      type: 'image/jpeg',
    });
    handleImageSelected(dummyFile);
  };

  const isSuccess = Boolean(
    recognitionResult && recognitionResult.landmark_name && recognitionResult.confidence >= 0.5
  );

  const isUnknown = Boolean(
    recognitionResult && (!recognitionResult.landmark_name || recognitionResult.confidence < 0.5)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Title & Subtitle */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>AI Vision Microservice • Google Cloud Vision SDK</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          Nhận diện danh lam thắng cảnh AI
        </h1>
        <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
          Tải ảnh chụp bất kỳ danh lam thắng cảnh nào của Việt Nam. Hệ thống AI sẽ phân tích hình ảnh và tự động nhận diện địa danh kèm gợi ý du lịch thông minh.
        </p>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <Toast
          type="error"
          title="Lỗi nhận diện ảnh"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {/* Upload Box Area */}
      <div className="max-w-3xl mx-auto">
        <UploadBox
          selectedFile={selectedFile}
          onImageSelected={handleImageSelected}
          onClear={handleClear}
          isAnalyzing={isAnalyzing}
        />

        {/* Quick Testing Samples */}
        {!selectedFile && (
          <div className="mt-4 text-center">
            <span className="text-xs text-gray-400 mr-2">Thử nghiệm nhanh với địa danh mẫu:</span>
            <div className="inline-flex flex-wrap gap-2 mt-2 sm:mt-0">
              {['Vịnh Hạ Long', 'Phố Cổ Hội An', 'Tràng An'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => handleQuickDemo(sample)}
                  className="px-3 py-1 rounded-full bg-gray-100 hover:bg-brand-50 hover:text-brand-600 text-gray-600 text-xs font-medium transition-colors border border-gray-200"
                >
                  ⚡ {sample}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Analyzing Progress State */}
      {isAnalyzing && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 p-8 text-center space-y-4 shadow-xs">
          <div className="inline-flex p-3 rounded-2xl bg-brand-50 text-brand-600 animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            Đang phân tích và xử lý thị giác máy tính...
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Hệ thống đang tiền xử lý ảnh, chuẩn hóa tỷ lệ và đối chiếu dữ liệu cùng Google Cloud Vision API.
          </p>

          <div className="max-w-md mx-auto space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>
        </div>
      )}

      {/* Successful Recognition View */}
      {isSuccess && (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              Nhận diện thành công
            </div>
            <Button variant="outline" size="sm" onClick={handleClear}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Quét hình ảnh khác
            </Button>
          </div>

          {/* AI Result Card */}
          <LandmarkCard
            result={recognitionResult}
            matchedLocation={matchedLocation}
          />

          {/* Smart Recommended Tours & Accommodations */}
          <SuggestedServices
            landmarkName={recognitionResult.landmark_name}
            location={matchedLocation}
          />
        </div>
      )}

      {/* Unknown Landmark / Fallback State */}
      {isUnknown && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 p-8 sm:p-10 text-center space-y-5 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <HelpCircle className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Chưa nhận diện được danh lam thắng cảnh cụ thể
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
              {recognitionResult.description ||
                'Góc chụp hoặc điều kiện ánh sáng có thể làm giảm độ tin cậy. Bạn có thể thử chụp lại góc nhìn rộng hơn hoặc tìm kiếm trong danh mục.'}
            </p>
          </div>

          {/* Fallback Keywords */}
          {recognitionResult.matched_keywords && recognitionResult.matched_keywords.length > 0 && (
            <div className="p-4 rounded-2xl bg-gray-50 text-xs text-gray-600 space-y-2">
              <span className="font-semibold text-gray-700">Các nhãn thị giác nhận dạng được:</span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {recognitionResult.matched_keywords.map((kw, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-gray-200">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button variant="primary" size="md" onClick={handleClear}>
              Thử lại với bức ảnh khác
            </Button>
            <Link to="/places">
              <Button variant="outline" size="md">
                <Compass className="w-4 h-4 mr-2" />
                Duyệt kho danh lam thắng cảnh
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
