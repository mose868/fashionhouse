import React from 'react';

const ImageDebugger = ({ product }) => {
  const firstImage = product.images?.[0];
  
  return (
    <div className="bg-yellow-100 p-4 rounded-lg mb-4">
      <h3 className="font-bold text-yellow-800 mb-2">Image Debug Info for: {product.name}</h3>
      <div className="text-sm text-yellow-700 space-y-1">
        <p><strong>Images array:</strong> {JSON.stringify(product.images)}</p>
        <p><strong>First image:</strong> {JSON.stringify(firstImage)}</p>
        <p><strong>Image URL:</strong> {firstImage?.url || firstImage || 'No URL'}</p>
        <p><strong>Image type:</strong> {typeof firstImage}</p>
        <p><strong>Has video:</strong> {product.videoUrl ? 'Yes' : 'No'}</p>
        <p><strong>Video URL:</strong> {product.videoUrl || 'No video'}</p>
      </div>
      
      {firstImage?.url && (
        <div className="mt-4">
          <p className="text-sm font-bold text-yellow-800 mb-2">Testing Image Load:</p>
          <img 
            src={firstImage.url} 
            alt="Debug test"
            className="w-32 h-32 object-cover border-2 border-yellow-500"
            onLoad={() => console.log('✅ Image loaded successfully:', firstImage.url)}
            onError={(e) => {
              console.error('❌ Image failed to load:', firstImage.url);
              e.target.style.borderColor = 'red';
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageDebugger;
