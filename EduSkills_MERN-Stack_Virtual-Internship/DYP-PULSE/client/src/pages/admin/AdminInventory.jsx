import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  Check,
  Save,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Layers,
  History,
  SlidersHorizontal,
  X,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { get, post, patch } from '../../services/api';
import useProducts from '../../hooks/useProducts';
import { formatPrice, formatDate } from '../../utils/formatters';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

export default function AdminInventory() {
  const { products, loading, refetch } = useProducts({ limit: 100 });
  const [stockChanges, setStockChanges] = useState({});
  const [variantStockChanges, setVariantStockChanges] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [expandedProducts, setExpandedProducts] = useState(new Set());

  // Authorized Adjustment Modal
  const [adjustModalItem, setAdjustModalItem] = useState(null);
  const [adjustMode, setAdjustMode] = useState('delta'); // 'delta' | 'absolute'
  const [adjustDelta, setAdjustDelta] = useState(0);
  const [adjustAbsolute, setAdjustAbsolute] = useState(0);
  const [adjustReason, setAdjustReason] = useState('Stock replenishment');
  const [customReason, setCustomReason] = useState('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  // Audit Logs Modal
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPagination, setLogsPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });

  const toggleExpand = (id) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStockInput = (id, val) => {
    setStockChanges((prev) => ({ ...prev, [id]: val }));
  };

  const handleVariantStockInput = (variantKey, val) => {
    setVariantStockChanges((prev) => ({ ...prev, [variantKey]: val }));
  };

  const handleSaveStock = async (product) => {
    const id = product._id || product.id;
    const newStock = parseInt(stockChanges[id], 10);

    if (isNaN(newStock) || newStock < 0) {
      toast.error('Please enter a valid non-negative stock quantity.');
      return;
    }

    setSavingId(id);
    try {
      await patch(`/products/${id}/inventory`, {
        stock: newStock,
        reason: 'Inline table stock update'
      });
      toast.success(`Inventory for "${product.name}" updated to ${newStock} units.`);
      if (refetch) refetch();
      setStockChanges((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      toast.error(err.message || 'Failed to update inventory.');
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveVariantStock = async (product, variant) => {
    const productId = product._id || product.id;
    const variantKey = `${productId}_${variant._id}`;
    const newStock = parseInt(variantStockChanges[variantKey], 10);

    if (isNaN(newStock) || newStock < 0) {
      toast.error('Please enter a valid non-negative variant stock quantity.');
      return;
    }

    setSavingId(variantKey);
    try {
      await patch(`/products/${productId}/inventory`, {
        variantId: variant._id,
        sku: variant.sku,
        stock: newStock,
        reason: 'Inline table variant stock update'
      });
      toast.success(`Stock for SKU "${variant.sku}" updated to ${newStock} units.`);
      if (refetch) refetch();
      setVariantStockChanges((prev) => {
        const copy = { ...prev };
        delete copy[variantKey];
        return copy;
      });
    } catch (err) {
      toast.error(err.message || 'Failed to update variant stock.');
    } finally {
      setSavingId(null);
    }
  };

  const openAdjustModal = (product, variant = null) => {
    const currentStock = variant
      ? typeof variant.stock === 'number'
        ? variant.stock
        : 0
      : typeof product.stock === 'number'
      ? product.stock
      : 0;

    setAdjustModalItem({
      product,
      variant,
      currentStock
    });
    setAdjustMode('delta');
    setAdjustDelta(10);
    setAdjustAbsolute(currentStock + 10);
    setAdjustReason('Stock replenishment');
    setCustomReason('');
  };

  const handleSubmitAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustModalItem) return;

    const { product, variant, currentStock } = adjustModalItem;
    const effectiveReason =
      adjustReason === 'Other' ? customReason.trim() || 'Manual adjustment' : adjustReason;

    let computedStock = currentStock;
    const payload = {
      productId: product._id || product.id,
      sku: variant ? variant.sku : undefined,
      variantId: variant ? variant._id : undefined,
      reason: effectiveReason
    };

    if (adjustMode === 'delta') {
      const delta = parseInt(adjustDelta, 10);
      if (isNaN(delta)) {
        toast.error('Please enter an integer quantity change.');
        return;
      }
      computedStock = currentStock + delta;
      payload.changeQuantity = delta;
    } else {
      const absolute = parseInt(adjustAbsolute, 10);
      if (isNaN(absolute) || absolute < 0) {
        toast.error('Please enter a non-negative integer stock value.');
        return;
      }
      computedStock = absolute;
      payload.newStock = absolute;
    }

    if (computedStock < 0) {
      toast.error(`Adjustment would lead to negative stock (${computedStock}). Stock cannot be negative.`);
      return;
    }

    setAdjustSubmitting(true);
    try {
      await post('/inventory/adjust', payload);
      toast.success(
        `Inventory for ${variant ? `SKU ${variant.sku}` : product.name} adjusted to ${computedStock} units.`
      );
      if (refetch) refetch();
      setAdjustModalItem(null);
    } catch (err) {
      toast.error(err.message || 'Failed to record stock adjustment.');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const fetchAuditLogs = async (page = 1) => {
    setLogsLoading(true);
    try {
      const res = await get(`/inventory/logs?page=${page}&limit=15`);
      const data = res?.data || res;
      setLogs(data?.logs || []);
      if (data?.pagination) {
        setLogsPagination(data.pagination);
      }
    } catch (err) {
      console.warn('Failed to fetch inventory logs:', err);
      toast.error('Could not load inventory audit logs.');
    } finally {
      setLogsLoading(false);
    }
  };

  const openAuditLogsModal = () => {
    setShowLogsModal(true);
    fetchAuditLogs(1);
  };

  // Sort: sold out & low stock items first
  const sortedProducts = [...products].sort((a, b) => {
    const stockA = typeof a.stock === 'number' ? a.stock : 10;
    const stockB = typeof b.stock === 'number' ? b.stock : 10;
    return stockA - stockB;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#172033]">
              Inventory Stock Audit
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200">
              Audit Enabled
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Monitor real-time warehouse counts, SKU variants, low stock threshold (≤ 5 units), and log all adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={openAuditLogsModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-[#2677FF] hover:bg-blue-100 transition-colors shadow-xs"
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail History</span>
          </button>

          <button
            onClick={() => refetch && refetch()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Stock Data</span>
          </button>
        </div>
      </div>

      {/* Products Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16">
            <Spinner fullPage={false} label="Auditing campus stock levels..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product Name & Category</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock Health</th>
                  <th className="py-3.5 px-4">Total Units</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedProducts.map((p) => {
                  const id = p._id || p.id;
                  const isPlay = p.department?.toUpperCase() === 'PLAY';
                  const currentStock = typeof p.stock === 'number' ? p.stock : 10;
                  const draftStock = stockChanges[id] !== undefined ? stockChanges[id] : currentStock;
                  const isModified = stockChanges[id] !== undefined && Number(stockChanges[id]) !== currentStock;

                  const isOut = currentStock === 0;
                  const isLow = currentStock > 0 && currentStock <= 5;
                  const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;
                  const isExpanded = expandedProducts.has(id);

                  return (
                    <React.Fragment key={id}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {hasVariants && (
                              <button
                                type="button"
                                onClick={() => toggleExpand(id)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                                title="Toggle Variant Breakdown"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-[#2677FF]" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            <div>
                              <p className="font-heading font-bold text-xs text-[#172033] flex items-center gap-1.5">
                                {p.name}
                                {hasVariants && (
                                  <span className="text-[10px] font-normal text-slate-400">
                                    ({p.variants.length} SKUs)
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-400">{p.category?.name || (typeof p.category === 'string' ? p.category : '-')}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant={isPlay ? 'play' : 'campus'} size="sm">
                            {isPlay ? 'PLAY' : 'CAMPUS'}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-[#172033]">
                          {formatPrice(p.price)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isOut
                                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                : isLow
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            }`}
                          >
                            {isOut && <AlertTriangle className="w-3 h-3" />}
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock (≤5)' : 'Healthy In Stock'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-[#172033]">
                          {currentStock}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openAdjustModal(p)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                              title="Authorized Stock Adjustment"
                            >
                              <SlidersHorizontal className="w-3 h-3" />
                              <span>Adjust</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                value={draftStock}
                                onChange={(e) => handleStockInput(id, e.target.value)}
                                className="w-16 p-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-center text-[#172033] focus:outline-none focus:border-[#2677FF]"
                              />
                              {isModified && (
                                <button
                                  type="button"
                                  onClick={() => handleSaveStock(p)}
                                  disabled={savingId === id}
                                  className="p-1 rounded bg-[#2677FF] text-white hover:bg-[#1b64e0] transition-colors"
                                  title="Save Stock Level"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Variant Breakdown Drawer */}
                      {hasVariants && isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-slate-100">
                          <td colSpan={6} className="p-4 pl-12">
                            <div className="space-y-2">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-[#2677FF]" />
                                Variant SKU Stock Breakdown & Adjustments
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                {p.variants.map((v) => {
                                  const variantKey = `${id}_${v._id}`;
                                  const currentVarStock = typeof v.stock === 'number' ? v.stock : 0;
                                  const draftVarStock =
                                    variantStockChanges[variantKey] !== undefined
                                      ? variantStockChanges[variantKey]
                                      : currentVarStock;
                                  const isVarModified =
                                    variantStockChanges[variantKey] !== undefined &&
                                    Number(variantStockChanges[variantKey]) !== currentVarStock;

                                  const isVarLow = currentVarStock <= 5;
                                  const isVarOut = currentVarStock === 0;

                                  return (
                                    <div
                                      key={v._id || v.sku}
                                      className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-xs"
                                    >
                                      <div>
                                        <p className="font-mono text-xs font-bold text-[#172033]">
                                          {v.sku}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                          {v.size && `Size: ${v.size}`}
                                          {v.size && v.color && ' • '}
                                          {v.color && `Color: ${v.color}`}
                                        </p>
                                        <span
                                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block uppercase ${
                                            isVarOut
                                              ? 'bg-rose-100 text-rose-800'
                                              : isVarLow
                                              ? 'bg-amber-100 text-amber-800'
                                              : 'bg-emerald-100 text-emerald-800'
                                          }`}
                                        >
                                          {currentVarStock} in stock
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => openAdjustModal(p, v)}
                                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                                          title="Adjust SKU Stock with reason"
                                        >
                                          <SlidersHorizontal className="w-3 h-3" />
                                        </button>

                                        <input
                                          type="number"
                                          min="0"
                                          value={draftVarStock}
                                          onChange={(e) =>
                                            handleVariantStockInput(variantKey, e.target.value)
                                          }
                                          className="w-14 p-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-bold text-center text-[#172033] focus:outline-none focus:border-[#2677FF]"
                                        />
                                        {isVarModified && (
                                          <button
                                            type="button"
                                            onClick={() => handleSaveVariantStock(p, v)}
                                            disabled={savingId === variantKey}
                                            className="p-1 rounded bg-[#2677FF] text-white hover:bg-[#1b64e0]"
                                            title="Save Variant Stock"
                                          >
                                            <Save className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Authorized Stock Adjustment Modal */}
      {adjustModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2677FF] flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-[#172033]">
                    Authorized Stock Adjustment
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Logged with timestamp, previous stock & authorized admin ID.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAdjustModalItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Item Snapshot */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-[#172033]">{adjustModalItem.product.name}</p>
                <p className="text-[11px] text-slate-500">
                  {adjustModalItem.variant
                    ? `SKU: ${adjustModalItem.variant.sku} • Size: ${adjustModalItem.variant.size || 'N/A'}`
                    : 'Base Product Inventory'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Stock</span>
                <span className="font-heading font-black text-sm text-[#172033]">
                  {adjustModalItem.currentStock} Units
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitAdjustment} className="space-y-4 text-xs">
              {/* Mode Toggle */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Adjustment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustMode('delta')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      adjustMode === 'delta'
                        ? 'border-[#2677FF] bg-blue-50 text-[#2677FF]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Quantity Delta (+ / -)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustMode('absolute')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      adjustMode === 'absolute'
                        ? 'border-[#2677FF] bg-blue-50 text-[#2677FF]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Absolute New Level
                  </button>
                </div>
              </div>

              {/* Input Field */}
              {adjustMode === 'delta' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Units to Add / Deduct (use negative to reduce)
                  </label>
                  <input
                    type="number"
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(e.target.value)}
                    placeholder="e.g. 15 or -5"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#172033] focus:outline-none focus:border-[#2677FF]"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Resulting stock will be: <strong className="text-slate-900">{adjustModalItem.currentStock + (parseInt(adjustDelta, 10) || 0)} units</strong>
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    New Authoritative Stock Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={adjustAbsolute}
                    onChange={(e) => setAdjustAbsolute(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#172033] focus:outline-none focus:border-[#2677FF]"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Change delta: <strong className="text-slate-900">{(parseInt(adjustAbsolute, 10) || 0) - adjustModalItem.currentStock} units</strong>
                  </p>
                </div>
              )}

              {/* Reason Dropdown */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Adjustment Reason</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-[#172033] focus:outline-none focus:border-[#2677FF]"
                >
                  <option value="Stock replenishment">Stock replenishment (Varsity shipment received)</option>
                  <option value="Physical audit correction">Physical audit recount / correction</option>
                  <option value="Damaged inventory write-off">Damaged / defective gear write-off</option>
                  <option value="Customer return / restock">Student return / restock</option>
                  <option value="Hostel tournament reservation">Hostel tournament event allocation</option>
                  <option value="Other">Other custom reason</option>
                </select>
              </div>

              {adjustReason === 'Other' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specify Reason</label>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Provide detailed explanation for audit log..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#172033] focus:outline-none focus:border-[#2677FF]"
                    required
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustModalItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#2677FF] hover:bg-[#1b64e0] text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {adjustSubmitting ? 'Recording Adjustment...' : 'Confirm & Log Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Audit Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2677FF] flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-[#172033]">
                    Persistent Inventory Audit Trail
                  </h3>
                  <p className="text-xs text-slate-400">
                    Immutable log of authorized manual adjustments, order sales reservations & cancellation returns.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLogsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {logsLoading ? (
              <div className="py-20">
                <Spinner fullPage={false} label="Loading historical adjustment audit trail..." />
              </div>
            ) : logs.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700">No inventory adjustments recorded yet.</p>
                <p className="text-slate-400 mt-1">Adjustments made via the audit modal will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-3.5">Timestamp</th>
                      <th className="py-3 px-3.5">Product & SKU</th>
                      <th className="py-3 px-3.5">Previous</th>
                      <th className="py-3 px-3.5">Change</th>
                      <th className="py-3 px-3.5">New Stock</th>
                      <th className="py-3 px-3.5">Reason</th>
                      <th className="py-3 px-3.5">Adjusted By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => {
                      const isPositive = log.changeQuantity > 0;
                      return (
                        <tr key={log._id} className="hover:bg-slate-50">
                          <td className="py-3 px-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                            {formatDate(log.createdAt)}
                          </td>
                          <td className="py-3 px-3.5">
                            <p className="font-bold text-[#172033] line-clamp-1">{log.productName}</p>
                            {log.variantSku && (
                              <p className="font-mono text-[10px] text-[#2677FF]">{log.variantSku}</p>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-slate-600 font-medium">
                            {log.previousStock}
                          </td>
                          <td className="py-3 px-3.5 font-bold">
                            <span
                              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] ${
                                isPositive
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {isPositive ? (
                                <ArrowUpRight className="w-3 h-3" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3" />
                              )}
                              {isPositive ? `+${log.changeQuantity}` : log.changeQuantity}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 font-bold text-slate-900">
                            {log.newStock}
                          </td>
                          <td className="py-3 px-3.5 text-slate-600 max-w-xs truncate">
                            {log.reason}
                          </td>
                          <td className="py-3 px-3.5 text-slate-500 text-[11px] whitespace-nowrap">
                            {log.adjustedBy?.firstName
                              ? `${log.adjustedBy.firstName} ${log.adjustedBy.lastName || ''}`
                              : 'System Admin'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {logsPagination.pages > 1 && (
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <span>
                  Page {logsPagination.page} of {logsPagination.pages} ({logsPagination.total} logs)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchAuditLogs(logsPagination.page - 1)}
                    disabled={!logsPagination.hasPrevPage}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchAuditLogs(logsPagination.page + 1)}
                    disabled={!logsPagination.hasNextPage}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLogsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                Close Audit Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
