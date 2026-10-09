"use client";

import { useState, useEffect } from 'react';

interface ImageCaptchaProps {
  onVerify: (isVerified: boolean) => void;
}

type ImageType = 'bus' | 'car' | 'zebra' | 'tree' | 'mountain' | 'bicycle';

interface ImageItem {
  id: number;
  type: ImageType;
  selected: boolean;
}

export default function ImageCaptcha({ onVerify }: ImageCaptchaProps) {
  const [challengeType, setChallengeType] = useState<ImageType>('bus');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const imageTypes: ImageType[] = ['bus', 'car', 'zebra', 'tree', 'mountain', 'bicycle'];
  const challengeTexts: Record<ImageType, string> = {
    bus: 'Select all images with a bus',
    car: 'Select all images with a car',
    zebra: 'Select all images with a zebra',
    tree: 'Select all images with a tree',
    mountain: 'Select all images with a mountain',
    bicycle: 'Select all images with a bicycle',
  };

  const generateChallenge = () => {
    // Randomly select challenge type
    const randomType = imageTypes[Math.floor(Math.random() * imageTypes.length)];
    setChallengeType(randomType);
    setError('');
    setIsVerified(false);
    onVerify(false);

    // Generate 9 images with 3-5 correct answers
    const correctCount = Math.floor(Math.random() * 3) + 3; // 3-5 correct images
    const newImages: ImageItem[] = [];
    const correctIndices = new Set<number>();

    // Randomly select positions for correct images
    while (correctIndices.size < correctCount) {
      correctIndices.add(Math.floor(Math.random() * 9));
    }

    // Create image array
    for (let i = 0; i < 9; i++) {
      if (correctIndices.has(i)) {
        newImages.push({ id: i, type: randomType, selected: false });
      } else {
        // Random incorrect type
        const incorrectTypes = imageTypes.filter(t => t !== randomType);
        const randomIncorrectType = incorrectTypes[Math.floor(Math.random() * incorrectTypes.length)];
        newImages.push({ id: i, type: randomIncorrectType, selected: false });
      }
    }

    // Shuffle images
    for (let i = newImages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newImages[i], newImages[j]] = [newImages[j], newImages[i]];
    }

    setImages(newImages);
    setAttempts(0);
  };

  useEffect(() => {
    generateChallenge();
  }, []);

  const toggleImage = (id: number) => {
    if (isVerified) return;
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, selected: !img.selected } : img
    ));
    setError('');
  };

  const handleVerify = () => {
    const correctImages = images.filter(img => img.type === challengeType);
    const selectedImages = images.filter(img => img.selected);
    const correctSelected = selectedImages.filter(img => img.type === challengeType);
    const incorrectSelected = selectedImages.filter(img => img.type !== challengeType);

    // Check if all correct images are selected and no incorrect images are selected
    if (correctSelected.length === correctImages.length && incorrectSelected.length === 0) {
      setIsVerified(true);
      setError('');
      onVerify(true);
    } else {
      setAttempts(prev => prev + 1);
      setError('Please select all correct images. Try again.');
      // Reset selection after wrong attempt
      setTimeout(() => {
        setImages(prev => prev.map(img => ({ ...img, selected: false })));
        if (attempts >= 2) {
          generateChallenge();
        }
      }, 1000);
    }
  };

  const getImageIcon = (type: ImageType) => {
    const icons: Record<ImageType, string> = {
      bus: 'fa-bus',
      car: 'fa-car',
      zebra: 'fa-horse',
      tree: 'fa-tree',
      mountain: 'fa-mountain',
      bicycle: 'fa-bicycle',
    };
    return icons[type];
  };

  const getImageColor = (type: ImageType) => {
    const colors: Record<ImageType, string> = {
      bus: 'bg-blue-500',
      car: 'bg-red-500',
      zebra: 'bg-black',
      tree: 'bg-green-500',
      mountain: 'bg-gray-500',
      bicycle: 'bg-yellow-500',
    };
    return colors[type];
  };

  return (
    <div className="w-full max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-1">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-pathik-primary/10 flex items-center justify-center">
            <i className="fas fa-shield-alt text-pathik-primary text-lg sm:text-xl"></i>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-pathik-text-dark">Verify you're human</h3>
            <p className="text-xs sm:text-sm text-pathik-text-light">Complete the security check</p>
          </div>
        </div>

        <div className="bg-pathik-primary/5 border-2 border-pathik-primary/20 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
          <p className="text-sm sm:text-base font-semibold text-pathik-text-dark mb-1">
            {challengeTexts[challengeType]}
          </p>
          <p className="text-xs text-pathik-text-light">
            Select all matching images. You may need to solve multiple challenges.
          </p>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 max-w-[280px] sm:max-w-none mx-auto">
        {images.map((image) => (
          <div
            key={image.id}
            onClick={() => toggleImage(image.id)}
            className={`relative aspect-square rounded-lg border-2 cursor-pointer transition-all duration-200 overflow-hidden group ${image.selected
              ? 'border-pathik-primary bg-pathik-primary/10 shadow-lg scale-95'
              : 'border-pathik-border hover:border-pathik-primary/50 hover:shadow-md'
              } ${isVerified && image.type === challengeType ? 'ring-2 ring-green-500' : ''}`}
          >
            {/* Image Placeholder with Icon */}
            <div className={`w-full h-full flex items-center justify-center ${getImageColor(image.type)} text-white text-2xl sm:text-3xl`}>
              <i className={`fas ${getImageIcon(image.type)}`}></i>
            </div>

            {/* Selection Checkmark */}
            {image.selected && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-pathik-primary rounded-full flex items-center justify-center text-white text-xs animate-[scaleIn_0.2s_ease-out]">
                <i className="fas fa-check"></i>
              </div>
            )}

            {/* Hover Overlay */}
            {!image.selected && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200"></div>
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-[fadeIn_0.3s_ease-out]">
          <i className="fas fa-exclamation-circle text-red-500"></i>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {isVerified && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 animate-[fadeIn_0.3s_ease-out]">
          <i className="fas fa-check-circle text-green-500"></i>
          <p className="text-sm text-green-700 font-semibold">Verification successful!</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
        <button
          type="button"
          onClick={generateChallenge}
          className="px-3 py-2 sm:px-4 sm:py-2 border-2 border-pathik-border rounded-lg text-pathik-text-medium hover:border-pathik-primary hover:text-pathik-primary transition-colors duration-300 flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isVerified}
        >
          <i className="fas fa-refresh"></i>
          <span>New Challenge</span>
        </button>

        {!isVerified ? (
          <button
            type="button"
            onClick={handleVerify}
            className="flex-1 px-4 py-2 sm:px-6 sm:py-2 bg-pathik-primary text-white rounded-lg hover:bg-pathik-primary-dark transition-colors duration-300 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={images.filter(img => img.selected).length === 0}
          >
            <i className="fas fa-check"></i>
            <span>Verify</span>
          </button>
        ) : (
          <div className="flex-1 px-4 py-2 sm:px-6 sm:py-2 bg-green-500 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-semibold">
            <i className="fas fa-check-circle"></i>
            <span>Verified</span>
          </div>
        )}
      </div>
    </div>
  );
}