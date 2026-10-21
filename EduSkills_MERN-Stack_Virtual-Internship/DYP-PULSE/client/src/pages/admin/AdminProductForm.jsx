import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Package,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { get, post, put } from '../../services/api';
import Spinner from '../../components/ui/Spinner';

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Available categories from DB
  const [availableCategories, setAvailableCategories] = useState([]);

  // Form State
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('PLAY');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [sport, setSport] = useState('');
  const [brand, setBrand] = useState('DYPULSE');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stock, setStock] = useState('25');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Structured Variants
  const [variants, setVariants] = useState([
    { sku: '', size: 'M', color: 'Standard', stock: 15, priceOverride: '' },
    { sku: '', size: 'L', color: 'Standard', stock: 10, priceOverride: '' }
  ]);

  // Fetch categories on load
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await get('/categories');
        const cats = res?.data?.categories || res?.categories || [];
        setAvailableCategories(cats);
        if (!category && cats.length > 0) {
          const match = cats.find((c) => c.department === department);
          if (match) setCategory(match._id);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, [department]);

  useEffect(() => {
    if (!isEditMode) return;

    let isMounted = true;
    async function fetchProductForEdit() {
      setLoading(true);
      try {
        const res = await get(`/products/${id}`);
        const p = res?.data?.product || res?.product || res;
        if (isMounted && p) {
          setName(p.name || '');
          setDepartment(p.department?.toUpperCase() || 'PLAY');
          setCategory(p.category?._id || p.category || '');
          setSubcategory(p.subcategory || '');
          setSport(p.sport || '');
          setBrand(p.brand || 'DYPULSE');
          setPrice(String(p.price || (p.priceInPaise ? p.priceInPaise / 100 : '')));
          setCompareAtPrice(
            p.compareAtPrice
              ? String(p.compareAtPrice)
              : p.compareAtPriceInPaise
              ? String(p.compareAtPriceInPaise / 100)
              : ''
          );
          setStock(String(typeof p.stock === 'number' ? p.stock : 25));
          setDescription(p.description || '');

          const firstImg =
            p.images && p.images[0]
              ? typeof p.images[0] === 'string'
                ? p.images[0]
                : p.images[0].url
              : p.image || '';
          setImageUrl(firstImg);

          if (p.variants && p.variants.length > 0) {
            setVariants(
              p.variants.map((v) => ({
                sku: v.sku || '',
                size: v.size || '',
                color: v.color || '',
                stock: typeof v.stock === 'number' ? v.stock : 10,
                priceOverride: v.priceOverride
                  ? String(v.priceOverride)
                  : v.priceOverrideInPaise
                  ? String(v.priceOverrideInPaise / 100)
                  : ''
              }))
            );
          }

          if (p.tags && p.tags.length > 0) {
            setTagsStr(p.tags.join(', '));
          }
          setIsFeatured(!!p.isFeatured);
          setIsActive(p.isActive !== undefined ? p.isActive : true);
        }
      } catch (err) {
        toast.error('Could not load product details for editing.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProductForEdit();
    return () => {
      isMounted = false;
    };
  }, [id, isEditMode]);

  // Image Upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, WEBP, GIF).');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('alt', name || file.name);

    setUploadingImage(true);
    try {
      const res = await post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const uploadedImg = res?.data?.image;
      if (uploadedImg?.url) {
        setImageUrl(uploadedImg.url);
        toast.success('Product image uploaded successfully! 📸');
      }
    } catch (err) {
      toast.error(err.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Variant helpers
  const handleAddVariant = () => {
    const baseCode = (name ? name.slice(0, 3) : 'DYP').toUpperCase().replace(/[^A-Z]/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setVariants([
      ...variants,
      {
        sku: `${baseCode}-VAR-${randomSuffix}`,
        size: 'M',
        color: 'Standard',
        stock: 10,
        priceOverride: ''
      }
    ]);
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleRemoveVariant = (index) => {
    if (variants.length <= 1) {
      toast.error('A product must contain at least one variant.');
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !category || !price || !description.trim()) {
      toast.error('Please complete all required fields (Name, Category, Price, Description).');
      return;
    }

    setSubmitting(true);

    try {
      const tagsArray = tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const imagesArray = imageUrl.trim()
        ? [{ url: imageUrl.trim(), alt: name.trim() }]
        : [
            {
              url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
              alt: name.trim()
            }
          ];

      // Format variants
      const formattedVariants = variants.map((v, i) => {
        const fallbackSku = `${name.slice(0, 3).toUpperCase()}-${v.size || 'STD'}-${i + 1}`;
        return {
          sku: (v.sku || fallbackSku).toUpperCase().trim(),
          size: v.size?.trim() || '',
          color: v.color?.trim() || '',
          stock: Math.max(0, parseInt(v.stock, 10) || 0),
          priceOverride: v.priceOverride ? Number(v.priceOverride) : undefined
        };
      });

      const totalVariantStock = formattedVariants.reduce((sum, v) => sum + v.stock, 0);

      const payload = {
        name: name.trim(),
        department: department.toUpperCase(),
        category,
        subcategory: subcategory.trim() || undefined,
        sport: department === 'PLAY' && sport.trim() ? sport.trim().toLowerCase() : undefined,
        brand: brand.trim(),
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
        stock: totalVariantStock || Number(stock) || 0,
        description: description.trim(),
        images: imagesArray,
        variants: formattedVariants,
        tags: tagsArray,
        isFeatured,
        isActive
      };

      if (isEditMode) {
        await put(`/products/${id}`, payload);
        toast.success('Product updated successfully! ⚡');
      } else {
        await post('/products', payload);
        toast.success('Product added to DYPULSE catalog! ⚡');
      }

      navigate('/admin/products');
    } catch (err) {
      console.error('Save product error:', err);
      toast.error(err.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner fullPage label="Loading product blueprint..." />;
  }

  const deptCategories = availableCategories.filter(
    (c) => c.department === department
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#172033] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
        <span className="text-xs font-semibold text-slate-400">
          {isEditMode ? 'Editing Mode' : 'New Catalog Listing'}
        </span>
      </div>

      {/* Main Form Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2677FF] flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-black text-[#172033]">
              {isEditMode ? `Edit Product: ${name || 'Item'}` : 'Add New Product to Catalog'}
            </h1>
            <p className="text-xs text-[#667085] mt-0.5">
              Configure product variants, category references, image assets, and stock levels.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Section 1: Department & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Department *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDepartment('PLAY')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    department === 'PLAY'
                      ? 'border-[#2677FF] bg-blue-50 text-[#2677FF] ring-2 ring-blue-100'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>DYPULSE PLAY</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDepartment('CAMPUS')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    department === 'CAMPUS'
                      ? 'border-[#F044A5] bg-pink-50 text-[#F044A5] ring-2 ring-pink-100'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>DYPULSE CAMPUS</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#172033] focus:outline-none focus:border-[#2677FF]"
              >
                <option value="">Select Category...</option>
                {deptCategories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Name, Brand, Sport */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SS Ton English Willow Bat, Oversized Hoodie"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2677FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Brand *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. DYPULSE, SG, Puma"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2677FF]"
              />
            </div>
          </div>

          {department === 'PLAY' && (
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Sport Classification (Optional)
              </label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2677FF]"
              >
                <option value="">General Athletics</option>
                <option value="cricket">Cricket</option>
                <option value="football">Football</option>
                <option value="basketball">Basketball</option>
                <option value="badminton">Badminton</option>
                <option value="running">Running</option>
                <option value="fitness">Fitness & Gym</option>
              </select>
            </div>
          )}

          {/* Section 3: Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                placeholder="e.g. 999"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#172033] focus:outline-none focus:border-[#2677FF]"
              />
              <p className="text-[10px] text-slate-400 mt-1">Authoritatively stored in integer paise.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Compare At / Original Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 1499 (for discount strikethrough)"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2677FF]"
              />
            </div>
          </div>

          {/* Section 4: Image & Upload */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#172033]">
              Product Image Asset
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {imageUrl ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 space-y-2 w-full">
                <input
                  type="url"
                  placeholder="Paste Image URL or upload below..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2677FF]"
                />

                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image (Cloudinary / Local)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Variants & Inventory */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-heading font-black text-[#172033]">
                  Product Variants & SKU Inventory ({variants.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Maintain variant-level stock and unique SKU identifiers.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-[#2677FF] hover:bg-blue-100 text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </button>
            </div>

            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl grid grid-cols-1 sm:grid-cols-5 gap-2 items-center"
                >
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">
                      SKU Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DYP-HD-M"
                      value={v.sku}
                      onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-[#172033]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">
                      Size
                    </label>
                    <input
                      type="text"
                      placeholder="M, L, 750ml, etc."
                      value={v.size}
                      onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-[#172033]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">
                      Color / Style
                    </label>
                    <input
                      type="text"
                      placeholder="Navy, White, etc."
                      value={v.color}
                      onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-[#172033]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">
                      Stock Count *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={v.stock}
                      onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#172033]"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-3 sm:pt-0">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">
                        Price Override (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Optional"
                        value={v.priceOverride}
                        onChange={(e) => handleVariantChange(idx, 'priceOverride', e.target.value)}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-[#172033]"
                      />
                    </div>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg mt-3 transition-colors"
                        title="Delete Variant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Description */}
          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1">
              Description *
            </label>
            <textarea
              rows="4"
              required
              placeholder="Detailed specs, fabric composition, tournament certifications..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2677FF]"
            />
          </div>

          {/* Section 7: Tags & Badges */}
          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1">
              Search Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. cricket, english willow, tournament, varsity"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2677FF]"
            />
          </div>

          {/* Flags */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-slate-300 text-[#2677FF] focus:ring-[#2677FF]"
              />
              <span className="text-xs font-semibold text-slate-700">
                Mark as Featured Product (Highlights on Homepage)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-300 text-[#2677FF] focus:ring-[#2677FF]"
              />
              <span className="text-xs font-semibold text-slate-700">
                Active in Public Catalog
              </span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Link
              to="/admin/products"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2677FF] hover:bg-[#1b64e0] text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Publish Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
