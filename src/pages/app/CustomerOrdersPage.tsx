import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Upload,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  CheckCircle2,
  Printer,
  FileText,
  MapPin,
  Clock,
  User,
  Phone,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import {
  Button,
  Card,
  Badge,
  Table,
  Input,
  Select,
  Checkbox,
  Drawer,
  Pagination,
  TableSkeleton,
} from '../../components/ui';

export interface OrderRecord extends Record<string, unknown> {
  id: string;
  orderId: string;
  awbNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryPincode: string;
  deliveryCity: string;

  courierName: string;
  courierBg: string;
  serviceType: 'Surface' | 'Air' | 'Express' | 'Cargo';
  mode: 'B2C' | 'B2B';

  originCity: string;
  originPincode: string;
  warehouseName: string;

  deadWeightKg: number;
  volumetricWeightKg: number;
  chargeableWeightKg: number;
  dimensionsCm: string;

  baseFreight: number;
  fuelSurcharge: number;
  docketCharge: number;
  codCharge: number;
  fmCharge: number;
  gstAmount: number;
  totalAmount: number;

  paymentType: 'Prepaid' | 'COD';
  codAmount: number;
  shipmentType: 'Forward' | 'Reverse';

  status: 'Pending' | 'Booked' | 'Pickup Scheduled' | 'Picked Up' | 'In Transit' | 'OFD' | 'Delivered' | 'RTO' | 'NDR' | 'Cancelled';
  createdDate: string;

  timeline: Array<{
    title: string;
    description: string;
    timestamp: string;
    completed: boolean;
    active?: boolean;
    isError?: boolean;
  }>;
}

export const DEMO_ORDERS_DATA: OrderRecord[] = [];

export const CustomerOrdersPage: React.FC = () => {
  const navigate = useNavigate();

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [courierFilter, setCourierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [shipmentTypeFilter, setShipmentTypeFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);

  // Table Selection & Pagination State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');

  // Side Drawer State for Order Details
  const [selectedDrawerOrder, setSelectedDrawerOrder] = useState<OrderRecord | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Trigger brief shimmer loading on data refresh / filter updates
  const handleRefreshData = () => {
    setIsLoadingData(true);
    setTimeout(() => setIsLoadingData(false), 350);
  };

  // Copy AWB Helper
  const handleCopyAwb = (awb: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(awb);
    setCopiedAwb(awb);
    setTimeout(() => setCopiedAwb(null), 2000);
  };

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (dateRange !== 'all') count++;
    if (courierFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (warehouseFilter !== 'all') count++;
    if (paymentFilter !== 'all') count++;
    if (shipmentTypeFilter !== 'all') count++;
    if (modeFilter !== 'all') count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [dateRange, courierFilter, statusFilter, warehouseFilter, paymentFilter, shipmentTypeFilter, modeFilter, searchQuery]);

  // Reset All Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setDateRange('all');
    setCourierFilter('all');
    setStatusFilter('all');
    setWarehouseFilter('all');
    setPaymentFilter('all');
    setShipmentTypeFilter('all');
    setModeFilter('all');
    setCurrentPage(1);
  };

  // Filtered & Sorted Orders
  const filteredOrders = useMemo(() => {
    let list = DEMO_ORDERS_DATA.filter((item) => {
      // Global Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          item.orderId.toLowerCase().includes(q) ||
          item.awbNumber.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.customerPhone.includes(q) ||
          item.deliveryCity.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Courier Partner
      if (courierFilter !== 'all' && !item.courierName.toLowerCase().includes(courierFilter.toLowerCase())) {
        return false;
      }

      // Order Status
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      // Warehouse
      if (warehouseFilter !== 'all' && item.warehouseName !== warehouseFilter) {
        return false;
      }

      // Payment Type
      if (paymentFilter !== 'all' && item.paymentType !== paymentFilter) {
        return false;
      }

      // Shipment Type
      if (shipmentTypeFilter !== 'all' && item.shipmentType !== shipmentTypeFilter) {
        return false;
      }

      // Mode
      if (modeFilter !== 'all' && item.mode !== modeFilter) {
        return false;
      }

      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'date') return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      if (sortBy === 'amount') return b.totalAmount - a.totalAmount;
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

    return list;
  }, [searchQuery, dateRange, courierFilter, statusFilter, warehouseFilter, paymentFilter, shipmentTypeFilter, modeFilter, sortBy]);

  // Paginated Data
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;

  // Bulk Selection Handlers
  const isAllSelected = paginatedOrders.length > 0 && paginatedOrders.every((o) => selectedIds.includes(o.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedOrders.map((o) => o.id));
    }
  };

  const toggleSelectRow = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Helper function for status badges
  const getStatusBadgeVariant = (status: OrderRecord['status']) => {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'In Transit':
      case 'Picked Up':
      case 'Pickup Scheduled':
        return 'info';
      case 'OFD':
      case 'NDR':
        return 'warning';
      case 'RTO':
        return 'danger';
      case 'Booked':
        return 'brand';
      case 'Pending':
      case 'Cancelled':
      default:
        return 'neutral';
    }
  };

  const breadcrumbs = [
    { label: 'Merchant Portal', path: '/app' },
    { label: 'Orders Center', path: '/app/orders' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* 1. TOP ACTION BAR & HEADER */}
      <PageHeader
        title="Orders Management Center"
        description="Centralized operations hub to search, filter, track, print labels, and manage shipments."
        breadcrumbs={breadcrumbs}
        style={{ marginBottom: '0px' }}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={14} className={isLoadingData ? 'animate-spin' : ''} />}
              onClick={handleRefreshData}
            >
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={14} />}
              onClick={() => alert('Exporting orders CSV file...')}
            >
              Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileSpreadsheet size={14} />}
              onClick={() => alert('Downloading Order Import Excel Template...')}
            >
              Template
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload size={14} />}
              onClick={() => navigate('/app/orders/bulk-upload')}
            >
              Bulk Upload
            </Button>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => navigate('/app/orders/create')}
              style={{ backgroundColor: '#0284c7', borderColor: '#0284c7', fontWeight: '700' }}
            >
              + Create Shipment
            </Button>
          </div>
        }
      />

      {/* 2. COLLAPSIBLE SMART FILTER SECTION */}
      <Card style={{ padding: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Global Search & Collapse Toggle Bar */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
              <Input
                placeholder="Search by AWB, Order ID, Customer Name, Mobile Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '34px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>

            {/* Collapse Toggle & Clear Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleResetFilters} style={{ color: '#ef4444', fontSize: '12px' }}>
                  Clear Filters ({activeFilterCount})
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                leftIcon={<Filter size={14} />}
                onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
                style={{ fontSize: '12px' }}
              >
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}{' '}
                {isFiltersCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </Button>
            </div>
          </div>

          {/* Advanced Filter Grid (Collapsible) */}
          {!isFiltersCollapsed && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
              {/* Date Range */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Date Range</label>
                <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  options={[
                    { label: 'All Dates', value: 'all' },
                    { label: 'Today', value: 'today' },
                    { label: 'Yesterday', value: 'yesterday' },
                    { label: 'Last 7 Days', value: '7d' },
                    { label: 'Last 30 Days', value: '30d' },
                  ]}
                />
              </div>

              {/* Courier Partner */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Courier Partner</label>
                <Select
                  value={courierFilter}
                  onChange={(e) => setCourierFilter(e.target.value)}
                  options={[
                    { label: 'All Couriers', value: 'all' },
                    { label: 'Delhivery', value: 'Delhivery' },
                    { label: 'Blue Dart', value: 'Blue Dart' },
                    { label: 'Gati Freight', value: 'Gati' },
                    { label: 'Xpressbees', value: 'Xpressbees' },
                    { label: 'TCI Express', value: 'TCI' },
                  ]}
                />
              </div>

              {/* Order Status */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Order Status</label>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { label: 'All Statuses', value: 'all' },
                    { label: 'Pending', value: 'Pending' },
                    { label: 'Booked', value: 'Booked' },
                    { label: 'Pickup Scheduled', value: 'Pickup Scheduled' },
                    { label: 'Picked Up', value: 'Picked Up' },
                    { label: 'In Transit', value: 'In Transit' },
                    { label: 'Out For Delivery (OFD)', value: 'OFD' },
                    { label: 'Delivered', value: 'Delivered' },
                    { label: 'NDR Exception', value: 'NDR' },
                    { label: 'RTO Returned', value: 'RTO' },
                    { label: 'Cancelled', value: 'Cancelled' },
                  ]}
                />
              </div>

              {/* Warehouse */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Warehouse</label>
                <Select
                  value={warehouseFilter}
                  onChange={(e) => setWarehouseFilter(e.target.value)}
                  options={[
                    { label: 'All Warehouses', value: 'all' },
                    { label: 'Delhi Primary Warehouse', value: 'Delhi Primary Warehouse' },
                    { label: 'Bengaluru Fulfillment Center', value: 'Bengaluru Fulfillment Center' },
                    { label: 'Himachal Warehouse Hub', value: 'Himachal Warehouse Hub' },
                  ]}
                />
              </div>

              {/* Payment Type */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Payment Type</label>
                <Select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  options={[
                    { label: 'All Payments', value: 'all' },
                    { label: 'Prepaid', value: 'Prepaid' },
                    { label: 'COD (Cash on Delivery)', value: 'COD' },
                  ]}
                />
              </div>

              {/* Shipment Type */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Shipment Type</label>
                <Select
                  value={shipmentTypeFilter}
                  onChange={(e) => setShipmentTypeFilter(e.target.value)}
                  options={[
                    { label: 'All Types', value: 'all' },
                    { label: 'Forward', value: 'Forward' },
                    { label: 'Reverse Return', value: 'Reverse' },
                  ]}
                />
              </div>

              {/* Mode (B2B / B2C) */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Mode (B2B/B2C)</label>
                <Select
                  value={modeFilter}
                  onChange={(e) => setModeFilter(e.target.value)}
                  options={[
                    { label: 'All Modes', value: 'all' },
                    { label: 'B2C Express', value: 'B2C' },
                    { label: 'B2B Freight', value: 'B2B' },
                  ]}
                />
              </div>
            </div>
          )}

        </div>
      </Card>

      {/* 3. FLOATING BULK ACTIONS BAR (Visible when checkboxes selected) */}
      {selectedIds.length > 0 && (
        <div style={{ backgroundColor: '#0284c7', color: '#ffffff', padding: '12px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(2,132,199,0.2)' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{selectedIds.length} Order(s) Selected</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button variant="outline" size="sm" style={{ backgroundColor: '#ffffff', color: '#0284c7', borderColor: '#ffffff', fontSize: '11px', fontWeight: '700' }} onClick={() => alert(`Bulk Printing Shipping Labels for ${selectedIds.length} orders...`)}>
              <Printer size={13} style={{ marginRight: '4px' }} /> Bulk Print Labels
            </Button>

            <Button variant="outline" size="sm" style={{ backgroundColor: '#ffffff', color: '#0284c7', borderColor: '#ffffff', fontSize: '11px', fontWeight: '700' }} onClick={() => alert(`Creating Bulk Manifest for ${selectedIds.length} orders...`)}>
              <FileText size={13} style={{ marginRight: '4px' }} /> Bulk Manifest
            </Button>

            <Button variant="outline" size="sm" style={{ backgroundColor: '#ffffff', color: '#0284c7', borderColor: '#ffffff', fontSize: '11px', fontWeight: '700' }} onClick={() => alert(`Exporting ${selectedIds.length} selected orders to CSV...`)}>
              <Download size={13} style={{ marginRight: '4px' }} /> Bulk Export
            </Button>

            <Button variant="ghost" size="sm" style={{ color: '#ffffff', fontSize: '11px' }} onClick={() => setSelectedIds([])}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* 4. ORDERS DATA TABLE & EMPTY STATE */}
      <Card style={{ padding: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        {isLoadingData ? (
          <TableSkeleton rows={7} cols={8} />
        ) : filteredOrders.length === 0 ? (
          /* EMPTY STATE */
          <div style={{ padding: '48px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={28} style={{ color: '#64748b' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              No Shipments Found
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, maxWidth: '400px' }}>
              No orders match your filter criteria or search parameters. Try adjusting your search query or reset filters.
            </p>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus size={16} />}
              onClick={() => navigate('/app/orders/create')}
              style={{ marginTop: '8px', backgroundColor: '#0284c7', borderColor: '#0284c7' }}
            >
              Create First Shipment
            </Button>
          </div>
        ) : (
          <div>
            {/* Table Sort Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '12px', color: '#64748b' }}>
              <span>Showing <strong>{paginatedOrders.length}</strong> of <strong>{filteredOrders.length}</strong> orders</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Sort By:</span>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  options={[
                    { label: 'Created Date (Newest)', value: 'date' },
                    { label: 'Amount (Highest)', value: 'amount' },
                    { label: 'Status', value: 'status' },
                  ]}
                  style={{ width: '170px', padding: '2px 6px', fontSize: '12px' }}
                />
              </div>
            </div>

            {/* Enterprise Orders Table */}
            <Table<OrderRecord>
              keyExtractor={(r) => r.id}
              columns={[
                {
                  key: 'checkbox',
                  header: (
                    <Checkbox
                      id="select-all-orders"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                    />
                  ),
                  render: (r) => (
                    <Checkbox
                      id={`select-order-${r.id}`}
                      checked={selectedIds.includes(r.id)}
                      onChange={(e) => toggleSelectRow(r.id, e)}
                    />
                  ),
                },
                {
                  key: 'orderId',
                  header: 'Order ID',
                  render: (r) => (
                    <div onClick={() => setSelectedDrawerOrder(r)} style={{ cursor: 'pointer' }}>
                      <strong style={{ color: '#0284c7', fontSize: '13px' }}>{r.orderId}</strong>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>{r.createdDate}</div>
                    </div>
                  ),
                },
                {
                  key: 'awbNumber',
                  header: 'AWB Number',
                  render: (r) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0f172a', fontSize: '12px' }}>{r.awbNumber}</span>
                      <button
                        onClick={(e) => handleCopyAwb(r.awbNumber, e)}
                        title="Copy AWB Number"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: copiedAwb === r.awbNumber ? '#16a34a' : '#94a3b8' }}
                      >
                        {copiedAwb === r.awbNumber ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  ),
                },
                {
                  key: 'customerName',
                  header: 'Customer Name',
                  render: (r) => (
                    <div>
                      <strong style={{ color: '#1e293b', fontSize: '12px', display: 'block' }}>{r.customerName}</strong>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>{r.customerPhone}</span>
                    </div>
                  ),
                },
                {
                  key: 'courierName',
                  header: 'Courier Partner',
                  render: (r) => (
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', backgroundColor: r.courierBg, color: '#ffffff' }}>
                        {r.courierName}
                      </span>
                    </div>
                  ),
                },
                {
                  key: 'serviceType',
                  header: 'Service Type',
                  render: (r) => (
                    <Badge variant={r.mode === 'B2B' ? 'warning' : 'info'}>
                      {r.mode} - {r.serviceType}
                    </Badge>
                  ),
                },
                {
                  key: 'origin',
                  header: 'Origin',
                  render: (r) => <span style={{ fontSize: '11px', color: '#475569' }}>{r.originCity} ({r.originPincode})</span>,
                },
                {
                  key: 'destination',
                  header: 'Destination',
                  render: (r) => <span style={{ fontSize: '11px', color: '#475569' }}>{r.deliveryCity} ({r.deliveryPincode})</span>,
                },
                {
                  key: 'weight',
                  header: 'Weight',
                  render: (r) => <span style={{ fontSize: '11px', fontWeight: '600', color: '#334155' }}>{r.chargeableWeightKg} KG</span>,
                },
                {
                  key: 'amount',
                  header: 'Amount',
                  align: 'right',
                  render: (r) => <strong style={{ color: '#0f172a', fontSize: '12px' }}>₹ {r.totalAmount.toFixed(2)}</strong>,
                },
                {
                  key: 'status',
                  header: 'Current Status',
                  render: (r) => <Badge variant={getStatusBadgeVariant(r.status)}>{r.status}</Badge>,
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (r) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/app/shipment-control-center/${r.id}`)}
                        style={{ fontSize: '11px', padding: '4px 8px', color: '#0284c7', borderColor: '#0284c7', fontWeight: '700' }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Track Shipment"
                        onClick={() => navigate('/app/tracking')}
                        style={{ padding: '4px', color: '#0284c7' }}
                      >
                        <Truck size={14} />
                      </Button>
                    </div>
                  ),
                },
              ]}
              data={paginatedOrders}
            />

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                <span>Show per page:</span>
                <Select
                  value={pageSize.toString()}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: '25', label: '25 orders' },
                    { value: '50', label: '50 orders' },
                    { value: '100', label: '100 orders' },
                  ]}
                  style={{ width: '110px', padding: '2px 6px' }}
                />
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          </div>
        )}
      </Card>

      {/* 5. ORDER DETAILS SIDE DRAWER */}
      <Drawer
        isOpen={!!selectedDrawerOrder}
        onClose={() => setSelectedDrawerOrder(null)}
        title="Order Details & Operational Tracking"
        position="right"
      >
        {selectedDrawerOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '12px' }}>
            
            {/* Order Header Summary */}
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '16px', color: '#0284c7' }}>{selectedDrawerOrder.orderId}</strong>
                <Badge variant={getStatusBadgeVariant(selectedDrawerOrder.status)}>{selectedDrawerOrder.status}</Badge>
              </div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px', fontFamily: 'monospace' }}>
                AWB: <strong>{selectedDrawerOrder.awbNumber}</strong>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                Created: {selectedDrawerOrder.createdDate}
              </div>
            </div>

            {/* Customer Details */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontWeight: '700', color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} style={{ color: '#0284c7' }} /> Customer Details
              </div>
              <div style={{ color: '#0f172a', fontWeight: '700' }}>{selectedDrawerOrder.customerName}</div>
              <div style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={12} /> {selectedDrawerOrder.customerPhone}
              </div>
              <div style={{ color: '#64748b' }}>{selectedDrawerOrder.customerEmail}</div>
              <div style={{ color: '#334155', marginTop: '4px', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                <MapPin size={12} style={{ flexShrink: 0, marginTop: '2px', color: '#dc2626' }} />
                <span>{selectedDrawerOrder.deliveryAddress}, {selectedDrawerOrder.deliveryCity} - <strong>{selectedDrawerOrder.deliveryPincode}</strong></span>
              </div>
            </div>

            {/* Courier & Weight Details */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontWeight: '700', color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={14} style={{ color: '#0284c7' }} /> Courier & Weight Specs
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Courier Partner:</span>
                <strong style={{ color: '#0f172a' }}>{selectedDrawerOrder.courierName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Service Type:</span>
                <span>{selectedDrawerOrder.mode} - {selectedDrawerOrder.serviceType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Dead Weight:</span>
                <span>{selectedDrawerOrder.deadWeightKg} KG</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Volumetric Weight:</span>
                <span>{selectedDrawerOrder.volumetricWeightKg} KG</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7', fontWeight: '700', borderTop: '1px dashed #e2e8f0', paddingTop: '4px' }}>
                <span>Chargeable Weight:</span>
                <span>{selectedDrawerOrder.chargeableWeightKg} KG</span>
              </div>
            </div>

            {/* Charge Breakdown */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontWeight: '700', color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                Charge Breakdown
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Base Freight:</span>
                <span>₹ {selectedDrawerOrder.baseFreight.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Fuel Surcharge:</span>
                <span>₹ {selectedDrawerOrder.fuelSurcharge.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Docket & FM Charges:</span>
                <span>₹ {(selectedDrawerOrder.docketCharge + selectedDrawerOrder.fmCharge).toFixed(2)}</span>
              </div>
              {selectedDrawerOrder.codCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>COD Fee:</span>
                  <span>₹ {selectedDrawerOrder.codCharge.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>GST (18%):</span>
                <span>₹ {selectedDrawerOrder.gstAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '4px', fontWeight: '800', marginTop: '2px' }}>
                <span style={{ color: '#0f172a' }}>Total Amount:</span>
                <span style={{ color: '#0284c7' }}>₹ {selectedDrawerOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Vertical Tracking Timeline */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontWeight: '700', color: '#334155', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} style={{ color: '#16a34a' }} /> Tracking Timeline
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '20px' }}>
                {/* Vertical Line */}
                <div style={{ position: 'absolute', left: '6px', top: '6px', bottom: '6px', width: '2px', backgroundColor: '#cbd5e1' }} />

                {selectedDrawerOrder.timeline.map((step, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    {/* Node Dot */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-20px',
                        top: '2px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: step.isError ? '#dc2626' : step.active ? '#16a34a' : step.completed ? '#0284c7' : '#cbd5e1',
                        border: '2px solid #ffffff',
                        boxShadow: '0 0 0 2px ' + (step.isError ? '#fecaca' : step.active ? '#bbf7d0' : step.completed ? '#bae6fd' : '#e2e8f0'),
                      }}
                    />

                    <div>
                      <div style={{ fontWeight: '700', color: step.isError ? '#dc2626' : step.active ? '#16a34a' : '#0f172a', fontSize: '12px' }}>
                        {step.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>
                        {step.description}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                        {step.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Buttons inside Drawer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedDrawerOrder(null);
                  navigate(`/app/orders/${selectedDrawerOrder.id}`);
                }}
                style={{ backgroundColor: '#0284c7', borderColor: '#0284c7', gridColumn: 'span 2' }}
              >
                Open Full Order Master Page →
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => alert(`Downloading label for AWB ${selectedDrawerOrder.awbNumber}...`)}
              >
                <Printer size={13} style={{ marginRight: '4px' }} /> Download Label
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => alert(`Downloading invoice for Order ${selectedDrawerOrder.orderId}...`)}
              >
                <FileText size={13} style={{ marginRight: '4px' }} /> Download Invoice
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => alert(`Downloading POD for AWB ${selectedDrawerOrder.awbNumber}...`)}
              >
                <ShieldCheck size={13} style={{ marginRight: '4px' }} /> Download POD
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDrawerOrder(null);
                  navigate('/app/tracking');
                }}
              >
                <Truck size={13} style={{ marginRight: '4px' }} /> Track Shipment
              </Button>
            </div>

          </div>
        )}
      </Drawer>

    </div>
  );
};
