import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  Star,
  Eye,
  EyeOff,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import { del, patch } from '../../services/api';
import useProducts from '../../hooks/useProducts';
import { formatPrice } from '../../utils/formatters';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [deletingId, setDeletingId] = useState(null);
  const [togglingStatusId, setTogglingStatusId] = useState(null);
  const [togglingFeaturedId, setTogglingFeaturedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const { products, loading, refetch } = useProducts({ limit: 100 });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchDept =
        selectedDept === 'ALL' || p.department?.toUpperCase() === selectedDept;

      const isItemActive = p.isActive !== false;
      const matchStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'ACTIVE' && isItemActive) ||
        (selectedStatus === 'INACTIVE' && !isItemActive) ||
        (selectedStatus === 'FEATURED' && p.isFeatured);

      const matchSearch =
        !searchTerm ||
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof p.category === 'string' && p.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.category?.name && p.category.name.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchDept && matchStatus && matchSearch;
    });
  }, [products, selectedDept, selectedStatus, searchTerm]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

  const handleToggleStatus = async (productId, currentActive) => {
    setTogglingStatusId(productId);
    try {
      await patch(`/products/${productId}/status`, { isActive: !currentActive });
      toast.success(`Product ${!currentActive ? 'activated' : 'deactivated'}.`);
      if (refetch) refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle product status.');
    } finally {
      setTogglingStatusId(null);
    }
  };

  const handleToggleFeatured = async (productId, currentFeatured) => {
    setTogglingFeaturedId(productId);
    try {
      await patch(`/products/${productId}/featured`, { isFeatured: !currentFeatured });
      toast.success(`Product ${!currentFeatured ? 'marked as featured' : 'removed from featured'}.`);
      if (refetch) refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle featured status.');
    } finally {
      setTogglingFeaturedId(null);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}" from the catalog?`)) {
      return;
    }

    setDeletingId(productId);
    try {
      await del(`/products/${productId}`);
      toast.success(`"${productName}" was removed from the catalog.`);
      if (refetch) refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#172033]">
            Products Catalog ({filteredProducts.length})
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Manage varsity sports gear, campus apparel, stock levels, and product availability.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2677FF] hover:bg-[#1b64e0] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by product name, brand, or category..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2677FF]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {['ALL', 'PLAY', 'CAMPUS'].map((dept) => (
              <button
                key={dept}
                onClick={() => {
                  setSelectedDept(dept);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedDept === dept
                    ? 'bg-white text-[#0B1730] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {dept === 'ALL' ? 'All Gear' : dept}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {[
              { id: 'ALL', label: 'All Status' },
              { id: 'ACTIVE', label: 'Active' },
              { id: 'INACTIVE', label: 'Inactive' },
              { id: 'FEATURED', label: '★ Featured' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setSelectedStatus(st.id);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  selectedStatus === st.id
                    ? 'bg-white text-[#0B1730] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16">
            <Spinner fullPage={false} label="Loading catalog products..." />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No products match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Inventory</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedProducts.map((p) => {
                  const id = p._id || p.id;
                  const isPlay = p.department?.toUpperCase() === 'PLAY';
                  const img =
                    (p.images && p.images[0]
                      ? typeof p.images[0] === 'string'
                        ? p.images[0]
                        : p.images[0].url
                      : null) ||
                    p.image ||
                    'https://placehold.co/100x100/0B1730/FFFFFF?text=D';

                  const stock = typeof p.stock === 'number' ? p.stock : 10;
                  const isLow = stock > 0 && stock <= 5;
                  const isOut = stock === 0;
                  const isActive = p.isActive !== false;
                  const isFeatured = Boolean(p.isFeatured);

                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                          />
                          <div>
                            <p className="font-heading font-bold text-xs text-[#172033] line-clamp-1 flex items-center gap-1.5">
                              {p.name}
                              {isFeatured && (
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" title="Featured Product" />
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {p.brand} {p.variants?.length ? `• ${p.variants.length} SKUs` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant={isPlay ? 'play' : 'campus'} size="sm">
                          {isPlay ? 'PLAY' : 'CAMPUS'}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {p.category?.name || (typeof p.category === 'string' ? p.category : '-')}
                      </td>

                      <td className="py-3 px-4 font-bold text-[#172033]">
                        {formatPrice(p.price)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isOut
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : isLow
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          }`}
                        >
                          {isOut ? 'Sold Out' : isLow ? `Low (${stock})` : `${stock} Units`}
                        </span>
                      </td>

                      {/* Status Toggle Badge */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(id, isActive)}
                          disabled={togglingStatusId === id}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                          title={isActive ? 'Click to deactivate' : 'Click to activate'}
                        >
                          {isActive ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3" />}
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Feature toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(id, isFeatured)}
                            disabled={togglingFeaturedId === id}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isFeatured
                                ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                                : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                            }`}
                            title={isFeatured ? 'Unfeature product' : 'Mark as Featured product'}
                          >
                            <Star className={`w-4 h-4 ${isFeatured ? 'fill-amber-400' : ''}`} />
                          </button>

                          <Link
                            to={`/admin/products/${id}/edit`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#2677FF] hover:bg-blue-50 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDelete(id, p.name)}
                            disabled={deletingId === id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <span>
              Showing Page {currentPage} of {totalPages} ({filteredProducts.length} products)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-bold disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-bold disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
