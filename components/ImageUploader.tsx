import React, { useState, useRef, useEffect } from 'react';

interface ImageUploaderProps {
  onImageUpload: (base64: string, mimeType: string, dataUrl: string) => void;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, disabled }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (disabled) return;

      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const resultString = reader.result as string;
              const base64String = resultString.split(',')[1];
              if (base64String) {
                setPreview(resultString);
                onImageUpload(base64String, file.type, resultString);
              }
            };
            reader.readAsDataURL(file);
            event.preventDefault();
            break; 
          }
        }
      }
    };
    
    if (!disabled) {
        window.addEventListener('paste', handlePaste);
    }
    
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [disabled, onImageUpload]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultString = reader.result as string;
        const base64String = resultString.split(',')[1];
        if (base64String) {
          setPreview(resultString);
          onImageUpload(base64String, file.type, resultString);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };
  
  const getHelperText = () => {
    if(disabled) return 'GRÁFICO CARGADO.';
    return 'PEGAR IMAGEN (CTRL+V) O HACER CLIC';
  }

  return (
    <>
      <div 
        className={`w-full h-64 rounded-lg flex items-center justify-center border-2 relative transition-all duration-300
          ${disabled ? 'cursor-not-allowed opacity-60 border-cyan/30' : 'cursor-pointer border-cyan/50 border-dashed hover:border-cyan hover:bg-cyan/10'}
        `}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) handleClick(); }}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain" />
        ) : (
          <div className="text-center text-cyan/70">
            <p className="font-bold tracking-wider">{getHelperText()}</p>
            <p className="text-xs mt-1">(Captura de pantalla)</p>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        disabled={disabled}
      />
    </>
  );
};

export default ImageUploader;