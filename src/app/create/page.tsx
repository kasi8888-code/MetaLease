'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { 
  Upload, 
  Loader2, 
  CheckCircle, 
  X, 
  Palette, 
  DollarSign, 
  Clock,
  Zap,
  Plus
} from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useCreateNFT, useListNFT } from '@/hooks/useBlockchainData';

type TabType = 'create' | 'sell' | 'rent';

export default function CreateNFT() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    collection: '',
    attributes: [{ trait_type: '', value: '' }],
  });
  const [rentalData, setRentalData] = useState({
    hourlyRate: '',
    dailyRate: '',
    minHours: '1',
    maxHours: '168',
  });
  const [createdTokenId, setCreatedTokenId] = useState<number | null>(null);

  const { createNFT, uploadState } = useCreateNFT();
  const { listNFT, isPending: isListing } = useListNFT();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const addAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { trait_type: '', value: '' }],
    }));
  };

  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !imageFile) {
      toast.error('Please fill in all required fields and upload an image');
      return;
    }

    try {
      const tokenId = await createNFT(
        imageFile,
        formData.name,
        formData.description,
        formData.attributes.filter(attr => attr.trait_type && attr.value)
      );
      
      if (tokenId !== undefined) {
        setCreatedTokenId(tokenId);
        toast.success('🎉 NFT created successfully!');
        setActiveTab('sell');
      }
    } catch (error) {
      console.error('Error creating NFT:', error);
      toast.error('Failed to create NFT. Please try again.');
    }
  };

  const handleListForRent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createdTokenId) {
      toast.error('Please create an NFT first');
      return;
    }

    if (!rentalData.hourlyRate || !rentalData.dailyRate) {
      toast.error('Please set both hourly and daily rates');
      return;
    }

    try {
      await listNFT(
        createdTokenId,
        rentalData.hourlyRate,
        rentalData.dailyRate,
        parseInt(rentalData.minHours),
        parseInt(rentalData.maxHours)
      );
      
      toast.success('NFT listed for rent successfully!');
      
      // Reset form
      setRentalData({
        hourlyRate: '',
        dailyRate: '',
        minHours: '1',
        maxHours: '168',
      });
    } catch (error) {
      console.error('Error listing NFT:', error);
      toast.error('Failed to list NFT for rent. Please try again.');
    }
  };

  const isCreating = uploadState.stage !== 'idle' && uploadState.stage !== 'complete';

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Navbar />
      
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center rounded-full bg-white/80 px-6 py-2 text-sm font-semibold text-purple-600 shadow-lg backdrop-blur mb-6">
            <Palette className="mr-2 h-4 w-4" />
            Create & Monetize Your Digital Assets
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            <span className="text-gray-900">Create NFTs &</span>
            <span className="block text-gradient">Earn Passive Income</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mint your digital assets, list them for rent, and start earning from day one. Our platform makes it easy to monetize your creativity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/80 backdrop-blur rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
        >
          {/* Tab Navigation */}
          <div className="border-b border-gray-200/60">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 px-8 py-6 text-lg font-semibold transition-all duration-300 relative ${
                  activeTab === 'create'
                    ? 'text-blue-600 bg-blue-50/80'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className={`p-2 rounded-xl ${
                    activeTab === 'create' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    <Palette className="h-5 w-5" />
                  </div>
                  <span>Create NFT</span>
                </div>
                {activeTab === 'create' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('sell')}
                className={`flex-1 px-8 py-6 text-lg font-semibold transition-all duration-300 relative ${
                  activeTab === 'sell'
                    ? 'text-purple-600 bg-purple-50/80'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className={`p-2 rounded-xl ${
                    activeTab === 'sell' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <span>Sell NFT</span>
                </div>
                {activeTab === 'sell' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('rent')}
                disabled={!createdTokenId}
                className={`flex-1 px-8 py-6 text-lg font-semibold transition-all duration-300 relative ${
                  activeTab === 'rent'
                    ? 'text-green-600 bg-green-50/80'
                    : createdTokenId 
                      ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                      : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className={`p-2 rounded-xl ${
                    activeTab === 'rent' 
                      ? 'bg-green-500 text-white' 
                      : createdTokenId 
                        ? 'bg-gray-200 text-gray-500'
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Clock className="h-5 w-5" />
                  </div>
                  <span>List for Rent</span>
                </div>
                {activeTab === 'rent' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'create' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12"
              >
                {/* Image Upload Section */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    Upload Artwork *
                  </label>
                  <div
                    {...getRootProps()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 group ${
                      isDragActive
                        ? 'border-blue-400 bg-blue-50/50'
                        : uploadedImage
                        ? 'border-green-400 bg-green-50/50'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    
                    {uploadedImage ? (
                      <div className="space-y-4">
                        <div className="relative mx-auto w-48 h-48 rounded-2xl overflow-hidden shadow-lg">
                          <Image
                            src={uploadedImage}
                            alt="Uploaded NFT"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-green-600 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Image uploaded successfully!
                          </p>
                          <p className="text-sm text-gray-500">
                            Click or drag to replace
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg">
                          <Upload className="h-10 w-10 text-white" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-gray-900">
                            {isDragActive ? 'Drop your image here' : 'Upload your NFT artwork'}
                          </p>
                          <p className="text-sm text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                          <button className="px-6 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors">
                            Choose File
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Section */}
                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        NFT Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-lg"
                        placeholder="Enter NFT name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Collection (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.collection}
                        onChange={(e) => setFormData(prev => ({ ...prev, collection: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-lg"
                        placeholder="Collection name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Description *
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-lg resize-none"
                      placeholder="Describe your NFT..."
                    />
                  </div>

                  {/* Attributes */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-semibold text-gray-900">
                        Attributes (Optional)
                      </label>
                      <button
                        type="button"
                        onClick={addAttribute}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Attribute
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.attributes.map((attr, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center space-x-3"
                        >
                          <input
                            type="text"
                            value={attr.trait_type}
                            onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                            placeholder="Trait type (e.g., Color)"
                          />
                          <input
                            type="text"
                            value={attr.value}
                            onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                            placeholder="Value (e.g., Blue)"
                          />
                          {formData.attributes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAttribute(index)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={!isConnected || isCreating}
                    whileHover={{ scale: isConnected ? 1.02 : 1 }}
                    whileTap={{ scale: isConnected ? 0.98 : 1 }}
                    className={`w-full py-4 px-8 rounded-2xl text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                      !isConnected
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isCreating
                        ? 'bg-blue-400 text-white cursor-not-allowed'
                        : 'bg-gradient-primary text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Creating NFT...</span>
                      </>
                    ) : !isConnected ? (
                      <span>Connect Wallet to Create NFT</span>
                    ) : (
                      <>
                        <Palette className="h-5 w-5" />
                        <span>Create NFT</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Sell Tab */}
            {activeTab === 'sell' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-2xl shadow-lg mb-6">
                  <DollarSign className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Sell NFT Feature
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Direct sales functionality coming soon. For now, you can list your NFTs for rent to earn passive income.
                </p>
                {createdTokenId ? (
                  <button
                    onClick={() => setActiveTab('rent')}
                    className="inline-flex items-center px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    List for Rent Instead
                    <Zap className="h-5 w-5 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('create')}
                    className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Create NFT First
                    <Palette className="h-5 w-5 ml-2" />
                  </button>
                )}
              </motion.div>
            )}

            {/* Rent Tab */}
            {activeTab === 'rent' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {createdTokenId ? (
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg mb-4">
                        <Clock className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        List NFT for Rent
                      </h3>
                      <p className="text-gray-600">
                        Set your rental rates and start earning passive income from your NFT.
                      </p>
                    </div>

                    <form onSubmit={handleListForRent} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Hourly Rate (ETH) *
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            value={rentalData.hourlyRate}
                            onChange={(e) => setRentalData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-lg"
                            placeholder="0.001"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Daily Rate (ETH) *
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            value={rentalData.dailyRate}
                            onChange={(e) => setRentalData(prev => ({ ...prev, dailyRate: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-lg"
                            placeholder="0.02"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Minimum Hours
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={rentalData.minHours}
                            onChange={(e) => setRentalData(prev => ({ ...prev, minHours: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-lg"
                            placeholder="1"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Maximum Hours
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={rentalData.maxHours}
                            onChange={(e) => setRentalData(prev => ({ ...prev, maxHours: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-lg"
                            placeholder="168"
                          />
                        </div>
                      </div>

                      <motion.button
                        type="submit"
                        disabled={isListing}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-4 px-8 rounded-2xl text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                          isListing
                            ? 'bg-green-400 text-white cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {isListing ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Listing NFT...</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-5 w-5" />
                            <span>List for Rent</span>
                          </>
                        )}
                      </motion.button>
                    </form>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl mb-6">
                      <Clock className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Create an NFT First
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      You need to create an NFT before you can list it for rent. Go back to the Create tab to get started.
                    </p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="inline-flex items-center px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      Create NFT
                      <Palette className="h-5 w-5 ml-2" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}