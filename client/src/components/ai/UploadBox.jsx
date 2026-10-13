import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, AlertCircle, FileCheck } from 'lucide-react';
import { Button } from '../common/Button';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const UploadBox = ({ onImageSelected, selectedFile, onClear, isAnalyzing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndHandleFile = (file) => {
    setValidationError(null);

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setValidationError('Định dạng file không hợp lệ. Vui lòng chọn ảnh định dạng JPEG, PNG hoặc WebP.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError('Dung lượng ảnh vượt quá 10MB. Vui lòng chọn file nhỏ hơn.');
      return;
    }

    // Generate local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onImageSelected(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAnalyzing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isAnalyzing) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndHandleFile(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndHandleFile(files[0]);
    }
  };

  const handleClearImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear();
  };

  return (
    <div className="space-y-4 w-full">
      {/* Upload Zone */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-brand-500 bg-brand-50/50 scale-[1.01]'
              : 'border-gray-200 hover:border-brand-400 bg-white hover:bg-gray-50/50'
          }`}
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 shadow-xs">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="text-base font-bold text-gray-900 mb-1">
            Kéo thả ảnh địa danh vào đây hoặc bấm để chọn ảnh
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4 leading-relaxed">
            Hỗ trợ định dạng JPEG, PNG, WebP. Dung lượng tối đa 10MB cho mỗi bức ảnh.
          </p>

          <Button variant="outline" size="sm" type="button" className="pointer-events-none">
            <ImageIcon className="w-4 h-4 mr-1.5" />
            Chọn ảnh từ thiết bị
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      ) : (
        /* Image Preview Box */
        <div className="relative rounded-3xl overflow-hidden bg-gray-900 border border-gray-100 shadow-md">
          <div className="relative h-72 sm:h-96 w-full flex items-center justify-center bg-black/80">
            <img
              src={previewUrl}
              alt="Uploaded landmark"
              className="max-h-full max-w-full object-contain"
            />

            {/* Scanning Laser Line when analyzing */}
            {isAnalyzing && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_15px_#38bdf8] animate-pulse" />
              </div>
            )}

            {/* Clear Button */}
            {!isAnalyzing && (
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-md focus:outline-none"
                title="Chọn ảnh khác"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* File info overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-2xl">
              <span className="truncate max-w-[200px] sm:max-w-xs flex items-center gap-1.5 font-medium">
                <FileCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {selectedFile.name}
              </span>
              <span className="text-gray-300">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Client validation error notice */}
      {validationError && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};
