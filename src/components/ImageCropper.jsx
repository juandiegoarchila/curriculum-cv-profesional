import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check } from 'lucide-react';

// Helper: Centrar el crop inicial
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect || 1, // fallback to square
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

const ImageCropper = ({ imageSrc, onCancel, onCropComplete }) => {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const [aspect, setAspect] = useState(1); // Default to Square for profile

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    } else {
        // Init full width crop if no aspect
        const { width, height } = e.currentTarget;
        setCrop({ unit: '%', width: 90, x: 5, y: 5, height: 90 });
    }
  }

  const getCroppedImg = async (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Si no se movió el crop, usar defaults
    const finalCrop = crop || { x: 0, y: 0, width: image.width, height: image.height };

    canvas.width = finalCrop.width * scaleX;
    canvas.height = finalCrop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(
      image,
      finalCrop.x * scaleX,
      finalCrop.y * scaleY,
      finalCrop.width * scaleX,
      finalCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(URL.createObjectURL(blob));
      }, 'image/jpeg');
    });
  };

  const toBase64 = (blobUrl) => 
    fetch(blobUrl)
      .then(res => res.blob())
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }));

  const handleSave = async () => {
    if (completedCrop && imgRef.current) {
        try {
            const blobUrl = await getCroppedImg(imgRef.current, completedCrop);
            const base64 = await toBase64(blobUrl);
            onCropComplete(base64);
        } catch (e) {
            console.error(e);
        }
    } else if (imgRef.current) {
         // Fallback if no crop was touched but image loaded, auto-crop or full
         // But usually completedCrop is set on load or interaction.
         try {
             // force a crop of what is selected
             const finalCrop = crop || {unit: '%', width: 100, height: 100, x: 0, y:0};
             // convert percent to px if needed, but getCroppedImg handles px values from the library
             // react-image-crop returns px in completedCrop.
             // If completedCrop is null, maybe user didn't touch it.
             // We can generate it manually for full image or current selection
             onCropComplete(imageSrc);
         } catch(e) {
             console.error(e)
         };
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 touch-none">
      <div className="bg-black w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[100vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black z-20">
             <h3 className="font-bold text-white">Recortar Foto</h3>
             <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full text-slate-400">
                 <X size={24} />
             </button>
        </div>
        
        {/* Editor Area */}
        <div className="flex-grow bg-slate-900 overflow-auto flex items-center justify-center relative min-h-[50vh] touch-pan-x touch-pan-y p-4">
           {Boolean(imageSrc) && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              className="max-h-[70vh]"
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imageSrc}
                onLoad={onImageLoad}
                style={{ maxHeight: '70vh', maxWidth: '100%', objectFit: 'contain' }}
              />
            </ReactCrop>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 bg-slate-900 border-t border-white/10 z-20 pb-8 sm:pb-6">
            <p className="text-center text-xs text-slate-400 mb-4">
                Arrastra las esquinas del cuadro azul para recortar
            </p>
            <div className="mb-6 flex gap-4 justify-center">
                <button 
                    onClick={() => { setAspect(1); if(imgRef.current) setCrop(centerAspectCrop(imgRef.current.width, imgRef.current.height, 1)); }}
                    className={`text-xs font-bold px-4 py-2 rounded-full border transition-all ${aspect === 1 ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-400 border-slate-700 hover:border-slate-500'}`}
                >
                    Cuadrado
                </button>
                <button 
                    onClick={() => { setAspect(undefined); }}
                    className={`text-xs font-bold px-4 py-2 rounded-full border transition-all ${!aspect ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-400 border-slate-700 hover:border-slate-500'}`}
                >
                    Libre (Rectangular)
                </button>
            </div>

            <div className="flex gap-3">
                <button 
                    onClick={onCancel}
                    className="flex-1 py-3.5 text-slate-300 font-bold bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleSave}
                    className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2"
                >
                    <Check size={20} /> Guardar
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
