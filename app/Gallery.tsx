'use client';

import React from 'react';

const Gallery = () => {
  // Sample image data (use actual image paths or dynamic URLs)
  const images = [
    '/images/photo1.png',
    '/images/photo2.png',
    '/images/photo3.png',
    '/images/photo4.png',
    '/images/photo5.png',
    '/images/photo6.png',
  ];

  return (
    <div className="min-h-screen bg-purple-900 flex items-center justify-center p-4">
      <div className="grid grid-cols-2 gap-4 bg-purple-900 p-4 rounded-2xl">
        {images.map((src, index) => (
          <div
            key={index}
            className="bg-gray-100 p-2 rounded-xl shadow-md w-36 h-36 flex items-center justify-center"
          >
            <img
              src={src}
              alt={`Gallery item ${index + 1}`}
              className="object-contain w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
