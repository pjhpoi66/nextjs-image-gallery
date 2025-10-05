"use client";

import { Image as ImageType } from '@prisma/client';

type Props = {
  image: ImageType;
  onClose: () => void;
};

export default function ImagePreviewModal({ image, onClose }: Props) {
  return (
      <div
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
          onClick={onClose}
      >
        <div
            className="relative max-w-4xl max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image
        >
          <img src={image.filepath} alt={image.filename} className="max-w-full max-h-full object-contain" />
          <button
              onClick={onClose}
              className="absolute -top-4 -right-4 bg-white text-black w-10 h-10 rounded-full text-2xl"
          >
            &times;
          </button>
        </div>
      </div>
  );
}
