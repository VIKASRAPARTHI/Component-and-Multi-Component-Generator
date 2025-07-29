import { useRef } from 'react';
import useUIStore from '@/store/uiStore';

export default function ImageUpload({ onUpload, disabled, children, className }) {
  const fileInputRef = useRef(null);
  const { addNotification } = useUIStore();

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        addNotification({
          type: 'error',
          title: 'Invalid File',
          message: `${file.name} is not an image file`
        });
        return false;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        addNotification({
          type: 'error',
          title: 'File Too Large',
          message: `${file.name} is larger than 5MB`
        });
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Convert files to base64 URLs for preview
    const processFiles = async () => {
      const processedImages = await Promise.all(
        validFiles.map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                url: e.target.result,
                alt: file.name,
                size: file.size,
                type: file.type
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      onUpload(processedImages);
    };

    processFiles();

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={className}
        title="Upload images"
      >
        {children}
      </button>
    </>
  );
}
