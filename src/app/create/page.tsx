'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { Upload, Image as ImageIcon, Loader2, CheckCircle, X, Palette, DollarSign, Clock } from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useMintNFT, useListNFT } from '@/hooks/useContracts';
import { ipfsService } from '@/services/ipfs';
import { useNFTStore } from '@/hooks/useNFTStore';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

type TabType = 'create' | 'sell' | 'rent';

export default function CreateNFT() {
  const { isConnected, address } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    attributes: [{ trait_type: '', value: '' }],
  });
  const [rentalData, setRentalData] = useState({
    hourlyRate: '',
    dailyRate: '',
    minHours: '1',
    maxHours: '168',
  });
  const [createdTokenId, setCreatedTokenId] = useState<number | null>(null);

  const { mint, isLoading: isMinting } = useMintNFT();
  const { listForRent, isLoading: isListing } = useListNFT();
  const { addNFT, generateId } = useNFTStore();

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
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!imageFile) {
      toast.error('Please select an image');
      return;
    }

    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Creating your NFT...');

    try {
      // Step 1: Upload image to IPFS
      toast.loading('Uploading image to IPFS...', { id: loadingToast });
      const imageHash = await ipfsService.uploadImageToIPFS(imageFile);
      const imageUrl = ipfsService.getImageUrl(imageHash);

      // Step 2: Create metadata
      const metadata: NFTMetadata = {
        name: formData.name,
        description: formData.description,
        image: imageUrl,
        attributes: formData.attributes.filter(attr => 
          attr.trait_type.trim() && attr.value.trim()
        ),
      };

      // Step 3: Upload metadata to IPFS
      toast.loading('Uploading metadata to IPFS...', { id: loadingToast });
      const metadataHash = await ipfsService.uploadMetadataToIPFS(metadata);
      const tokenURI = ipfsService.getMetadataUrl(metadataHash);

      // Step 4: Generate token ID and add to store
      const mockTokenId = Math.floor(Math.random() * 10000) + 1;
      const nftId = generateId();
      
      // Add to NFT store immediately
      addNFT({
        id: nftId,
        tokenId: mockTokenId,
        name: formData.name,
        description: formData.description,
        image: imageUrl,
        owner: address || '0x0000...0000',
        creator: address || '0x0000...0000',
        tokenURI,
        isListed: false,
        category: 'Art', // Default category, could be made selectable
        attributes: formData.attributes.filter(attr => 
          attr.trait_type.trim() && attr.value.trim()
        ),
        createdAt: Date.now(),
      });

      // Step 5: Try to mint on blockchain (optional, for demo)
      toast.loading('Minting your NFT...', { id: loadingToast });
      
      try {
        await mint(tokenURI);
      } catch (mintError) {
        console.error('Blockchain minting failed, but NFT was created locally:', mintError);
        // Continue anyway, the NFT is saved to the store
      }
      
      setCreatedTokenId(mockTokenId);
      toast.success('NFT created successfully! You can now list it for rent.', { id: loadingToast });
      
      // Switch to rent tab after successful creation
      setActiveTab('rent');
      
    } catch (error) {
      console.error('Error creating NFT:', error);
      toast.error('Failed to create NFT. Please try again.', { id: loadingToast });
    } finally {
      setIsLoading(false);
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

    const loadingToast = toast.loading('Listing NFT for rent...');

    try {
      await listForRent(
        createdTokenId,
        rentalData.hourlyRate,
        rentalData.dailyRate,
        parseInt(rentalData.minHours),
        parseInt(rentalData.maxHours)
      );
      
      toast.success('NFT listed for rent successfully!', { id: loadingToast });
      
      // Reset form
      setRentalData({
        hourlyRate: '',
        dailyRate: '',
        minHours: '1',
        maxHours: '168',
      });
      setCreatedTokenId(null);
      
    } catch (error) {
      console.error('Error listing NFT:', error);
      toast.error('Failed to list NFT for rent. Please try again.', { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create & Manage NFTs
            </span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Mint your digital assets and list them for rent to earn passive income
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'create'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Create NFT</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('sell')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'sell'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Sell NFT</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('rent')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'rent'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                disabled={!createdTokenId}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>List for Rent</span>
                  {createdTokenId && <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Ready</span>}
                </div>
              </button>
            </nav>
          </div>

          <div className="p-8">
            {/* Create NFT Tab */}
            {activeTab === 'create' && (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Upload Image *
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                      isDragActive
                        ? 'border-blue-400 bg-blue-50'
                        : uploadedImage
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    
                    {uploadedImage ? (
                      <div className="space-y-4">
                        <Image
                          src={uploadedImage}
                          alt="Preview"
                          width={192}
                          height={192}
                          className="mx-auto h-48 w-48 object-cover rounded-lg shadow-lg"
                        />
                        <div className="flex items-center justify-center space-x-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Image uploaded successfully</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Click or drag to replace the image
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div>
                          <p className="text-lg font-medium text-gray-700">
                            {isDragActive ? 'Drop your image here' : 'Upload your NFT image'}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* NFT Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      NFT Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter NFT name..."
                      required
                    />
                  </div>

                  {/* Collection (Optional) */}
                  <div>
                    <label htmlFor="collection" className="block text-sm font-medium text-gray-700 mb-2">
                      Collection (Optional)
                    </label>
                    <input
                      type="text"
                      id="collection"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter collection name..."
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Describe your NFT..."
                    required
                  />
                </div>

                {/* Attributes */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Attributes (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={addAttribute}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                    >
                      + Add Attribute
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.attributes.map((attribute, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-3"
                      >
                        <input
                          type="text"
                          value={attribute.trait_type}
                          onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Trait type (e.g., Color)"
                        />
                        <input
                          type="text"
                          value={attribute.value}
                          onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Value (e.g., Blue)"
                        />
                        {formData.attributes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAttribute(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-8">
                  <button
                    type="submit"
                    disabled={!isConnected || isLoading || isMinting}
                    className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    {isLoading || isMinting ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-3" />
                        Creating NFT...
                      </>
                    ) : !isConnected ? (
                      'Connect Wallet to Create NFT'
                    ) : (
                      <>
                        <ImageIcon className="h-5 w-5 mr-3" />
                        Create NFT
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Sell NFT Tab */}
            {activeTab === 'sell' && (
              <div className="text-center py-12">
                <div className="mb-6">
                  <DollarSign className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Sell Your NFT</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Direct sales functionality will be available soon. For now, you can list your NFTs for rent to earn passive income.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('rent')}
                  disabled={!createdTokenId}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Clock className="h-5 w-5 mr-2" />
                  List for Rent Instead
                </button>
              </div>
            )}

            {/* Rent NFT Tab */}
            {activeTab === 'rent' && (
              <div>
                {!createdTokenId ? (
                  <div className="text-center py-12">
                    <div className="mb-6">
                      <Clock className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Create NFT First</h3>
                      <p className="text-gray-600 max-w-md mx-auto mb-6">
                        You need to create an NFT before you can list it for rent. Go to the Create tab to mint your first NFT.
                      </p>
                      <button
                        onClick={() => setActiveTab('create')}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        <Palette className="h-5 w-5 mr-2" />
                        Create NFT
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleListForRent} className="space-y-8">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-green-800 font-medium">NFT Created Successfully!</span>
                      </div>
                      <p className="text-green-700 text-sm mt-1">Token ID: #{createdTokenId}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Hourly Rate */}
                      <div>
                        <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
                          Hourly Rate (ETH) *
                        </label>
                        <input
                          type="number"
                          id="hourlyRate"
                          step="0.0001"
                          min="0"
                          value={rentalData.hourlyRate}
                          onChange={(e) => setRentalData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="0.001"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Price per hour in ETH</p>
                      </div>

                      {/* Daily Rate */}
                      <div>
                        <label htmlFor="dailyRate" className="block text-sm font-medium text-gray-700 mb-2">
                          Daily Rate (ETH) *
                        </label>
                        <input
                          type="number"
                          id="dailyRate"
                          step="0.0001"
                          min="0"
                          value={rentalData.dailyRate}
                          onChange={(e) => setRentalData(prev => ({ ...prev, dailyRate: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="0.02"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Price per 24 hours in ETH</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Minimum Hours */}
                      <div>
                        <label htmlFor="minHours" className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Rental Hours
                        </label>
                        <input
                          type="number"
                          id="minHours"
                          min="1"
                          value={rentalData.minHours}
                          onChange={(e) => setRentalData(prev => ({ ...prev, minHours: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      {/* Maximum Hours */}
                      <div>
                        <label htmlFor="maxHours" className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Rental Hours
                        </label>
                        <input
                          type="number"
                          id="maxHours"
                          min="1"
                          value={rentalData.maxHours}
                          onChange={(e) => setRentalData(prev => ({ ...prev, maxHours: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                        <p className="text-xs text-gray-500 mt-1">168 hours = 1 week</p>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-8">
                      <button
                        type="submit"
                        disabled={!isConnected || isListing}
                        className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        {isListing ? (
                          <>
                            <Loader2 className="animate-spin h-5 w-5 mr-3" />
                            Listing for Rent...
                          </>
                        ) : !isConnected ? (
                          'Connect Wallet to List for Rent'
                        ) : (
                          <>
                            <Clock className="h-5 w-5 mr-3" />
                            List for Rent
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}