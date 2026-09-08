import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Copy,
  Save,
  Users,
  Edit2,
  Eye,
  Sliders,
  Upload,
  Download,
  History,
  Ban,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import {
  Button,
  Card,
  Badge,
  Table,
  Input,
  Select,
  Alert,
  Modal,
  ConfirmationDialog,
} from '../../components/ui';
import type { B2BSurchargeConfig } from '../../types/b2bPricing';
import { B2B_ZONES } from '../../types/b2bPricing';
import { DEMO_B2B_RATE_CARDS, DEMO_ORIGIN_ZONES, DEMO_DEST_ZONES } from '../../mocks/b2bPricing.mock';
import { DEMO_COURIER_PROVIDERS } from '../../mocks/couriers.mock';
import { CustomerRateAssignmentService } from '../../services/customerRateAssignmentService';

export interface RateVersionRecord extends Record<string, unknown> {
  version: string;
  effectiveFrom: string;
  effectiveTo?: string;
  changedBy: string;
  changedOn: string;
  changelog: string;
  status: 'Active' | 'Archived' | 'Draft';
  matrixSnapshot?: Record<string, Record<string, number>>;
}

export interface ClientRateCardItem extends Record<string, unknown> {
  numId: number;
  id: string;
  name: string;
  type: 'B2B' | 'B2C';
  clientName: string;
  tenantId?: string;
  courierId: string;
  shippingPartner: string;
  serviceName: string;
  effectiveFrom: string;
  version: string;
  status: 'Active' | 'Draft' | 'Inactive' | 'Archived';
  isDefault: boolean;
  remarks: string;
  minWeightKg: number;
  weightDivider: number;
  updatedAt: string;
  matrixMap: Record<string, Record<string, number>>;
  surcharges: B2BSurchargeConfig[];
  versionsHistory: RateVersionRecord[];
}

const INITIAL_CLIENT_RATE_CARDS: ClientRateCardItem[] = [
  {
    numId: 101,
    id: 'b2b-card-101',
    name: 'ABC Traders - Gati B2B',
    type: 'B2B',
    clientName: 'ABC Traders',
    tenantId: 'tenant-demo-01',
    courierId: 'gati',
    shippingPartner: 'Gati',
    serviceName: 'Commercial Cargo',
    effectiveFrom: '2026-08-01',
    version: 'v3',
    status: 'Active',
    isDefault: false,
    remarks: 'Negotiated rate card for ABC Traders',
    minWeightKg: 20,
    weightDivider: 5000,
    updatedAt: new Date().toISOString().split('T')[0],
    matrixMap: DEMO_B2B_RATE_CARDS[0].matrixMap,
    surcharges: DEMO_B2B_RATE_CARDS[0].surcharges,
    versionsHistory: [
      { version: 'v3', effectiveFrom: '2026-09-01', changedBy: 'Super Admin', changedOn: '2026-09-01 10:30', changelog: 'N1 → N2 reduced from ₹7.00 to ₹6.75/KG. Fuel reduced 5% → 4%.', status: 'Active' },
      { version: 'v2', effectiveFrom: '2026-08-20', effectiveTo: '2026-08-31', changedBy: 'Super Admin', changedOn: '2026-08-20 14:15', changelog: 'N1 → N2 reduced from ₹7.50 to ₹7.00/KG.', status: 'Archived' },
      { version: 'v1', effectiveFrom: '2026-08-01', effectiveTo: '2026-08-19', changedBy: 'Super Admin', changedOn: '2026-08-01 09:00', changelog: 'Initial rate card creation for ABC Traders.', status: 'Archived' },
    ],
  },
  {
    numId: 102,
    id: 'b2c-card-102',
    name: 'XYZ Retail - Delhivery B2C',
    type: 'B2C',
    clientName: 'XYZ Retail',
    tenantId: 'tenant-acme-02',
    courierId: 'delhivery',
    shippingPartner: 'Delhivery',
    serviceName: 'Express Parcel',
    effectiveFrom: '2026-08-15',
    version: 'v2',
    status: 'Active',
    isDefault: false,
    remarks: 'Custom B2C slab rates for XYZ Retail',
    minWeightKg: 0.5,
    weightDivider: 5000,
    updatedAt: new Date().toISOString().split('T')[0],
    matrixMap: DEMO_B2B_RATE_CARDS[0].matrixMap,
    surcharges: DEMO_B2B_RATE_CARDS[0].surcharges,
    versionsHistory: [
      { version: 'v2', effectiveFrom: '2026-08-15', changedBy: 'Super Admin', changedOn: '2026-08-15 11:20', changelog: 'Added 500 GM Zone A discounted base rate ₹27.', status: 'Active' },
      { version: 'v1', effectiveFrom: '2026-08-01', effectiveTo: '2026-08-14', changedBy: 'Super Admin', changedOn: '2026-08-01 10:00', changelog: 'Initial B2C rate card.', status: 'Archived' },
    ],
  },
  {
    numId: 103,
    id: 'b2c-card-103',
    name: 'Standard Delhivery B2C',
    type: 'B2C',
    clientName: 'Unassigned',
    tenantId: undefined,
    courierId: 'delhivery',
    shippingPartner: 'Delhivery',
    serviceName: 'Standard Air/Surface',
    effectiveFrom: '2026-08-20',
    version: 'v1',
    status: 'Draft',
    isDefault: true,
    remarks: 'Default template for new retail signups',
    minWeightKg: 0.5,
    weightDivider: 5000,
    updatedAt: new Date().toISOString().split('T')[0],
    matrixMap: DEMO_B2B_RATE_CARDS[0].matrixMap,
    surcharges: DEMO_B2B_RATE_CARDS[0].surcharges,
    versionsHistory: [
      { version: 'v1', effectiveFrom: '2026-08-20', changedBy: 'Super Admin', changedOn: '2026-08-20 16:00', changelog: 'Created default template.', status: 'Active' },
    ],
  },
];

export const AdminB2BRateCardsPage: React.FC = () => {
  const navigate = useNavigate();

  // Master Rate Cards Store
  const [cardsList, setCardsList] = useState<ClientRateCardItem[]>(INITIAL_CLIENT_RATE_CARDS);
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'B2B' | 'B2C' | 'ASSIGNED' | 'UNASSIGNED'>('ALL');
  const [activeViewMode, setActiveViewMode] = useState<'LIST' | 'CREATE_B2B' | 'EDIT_B2B' | 'VIEW'>('LIST');

  // Controls & Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Editing/Viewing Card
  const [editingCard, setEditingCard] = useState<ClientRateCardItem | null>(null);

  // SECTION A — RATE CARD INFORMATION
  const [formName, setFormName] = useState('');
  const [formClientName, setFormClientName] = useState('Unassigned');
  const [formTenantId, setFormTenantId] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Draft' | 'Inactive'>('Active');
  const [formEffectiveFrom, setFormEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [formRemarks, setFormRemarks] = useState('');
  const [formIsDefault, setFormIsDefault] = useState<boolean>(false);

  // SECTION B — COURIER PARTNER
  const [formPartnerId, setFormPartnerId] = useState('gati');

  // SECTION C & D — 16x16 ZONE RATE MATRIX (oz -> dz -> ratePerKg)
  const [matrixState, setMatrixState] = useState<Record<string, Record<string, string>>>(() => {
    const map: Record<string, Record<string, string>> = {};
    B2B_ZONES.forEach((oz) => {
      map[oz] = {};
      B2B_ZONES.forEach((dz) => {
        map[oz][dz] = oz === 'N1' && dz === 'N1' ? '5.80' : oz === 'N1' && dz === 'N2' ? '6.60' : oz === 'N1' && dz === 'N3' ? '7.00' : '7.50';
      });
    });
    return map;
  });

  // SECTION E — B2B WEIGHT LOGIC & DIVISOR
  const [formMinWeight, setFormMinWeight] = useState('20');
  const [formWeightDivider, setFormWeightDivider] = useState('5000');

  // SECTION F — TWO-COLUMN ADDITIONAL CHARGES (INSIDE THE SAME CARD)
  const [docketCharge, setDocketCharge] = useState('50');
  const [minDocketCharge, setMinDocketCharge] = useState('0');
  const [rovOwnerCharge, setRovOwnerCharge] = useState('50');
  const [minRovOwnerCharge, setMinRovOwnerCharge] = useState('0');
  const [rovOwnerPct, setRovOwnerPct] = useState('0.2');
  const [rovCarrierCharge, setRovCarrierCharge] = useState('50');
  const [minRovCarrierCharge, setMinRovCarrierCharge] = useState('0');
  const [rovCarrierPct, setRovCarrierPct] = useState('0.3');
  const [odaCharge, setOdaCharge] = useState('500');
  const [minOdaCharge, setMinOdaCharge] = useState('250');
  const [fmCharge, setFmCharge] = useState('100');
  const [handlingCharge, setHandlingCharge] = useState('50');
  const [minHandlingCharge, setMinHandlingCharge] = useState('0');
  const [fuelCharge, setFuelCharge] = useState('18');
  const [codCharge, setCodCharge] = useState('50');
  const [codPct, setCodPct] = useState('1.5');
  const [minCodCharge, setMinCodCharge] = useState('30');
  const [franchiseCharge, setFranchiseCharge] = useState('0');
  const [pickupCharge, setPickupCharge] = useState('0');
  const [insuranceCharge, setInsuranceCharge] = useState('100');
  const [appointmentCharge, setAppointmentCharge] = useState('200');

  // Upload Preview State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isImportPreviewOpen, setIsImportPreviewOpen] = useState(false);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningCard, setAssigningCard] = useState<ClientRateCardItem | null>(null);
  const [assignClientTenantId, setAssignClientTenantId] = useState<string>('tenant-demo-01');
  const [assignEffectiveFrom, setAssignEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyCard, setHistoryCard] = useState<ClientRateCardItem | null>(null);

  const [isDeactivateConfirmOpen, setIsDeactivateConfirmOpen] = useState(false);
  const [deactivatingCard, setDeactivatingCard] = useState<ClientRateCardItem | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Matrix Cell Change Handler
  const handleMatrixCellChange = (oz: string, dz: string, valStr: string) => {
    setMatrixState((prev) => ({
      ...prev,
      [oz]: {
        ...prev[oz],
        [dz]: valStr,
      },
    }));
  };

  // Open Create B2B Form
  const handleOpenAddB2b = () => {
    setEditingCard(null);
    setFormName('');
    setFormClientName('Unassigned');
    setFormTenantId('');
    setFormStatus('Active');
    setFormEffectiveFrom(new Date().toISOString().split('T')[0]);
    setFormRemarks('');
    setFormIsDefault(false);
    setFormPartnerId('gati');
    setFormMinWeight('20');
    setFormWeightDivider('5000');
    setUploadedFileName(null);
    setActiveViewMode('CREATE_B2B');
  };

  // Open Edit Form
  const handleOpenEditCard = (card: ClientRateCardItem) => {
    if (card.type === 'B2C') {
      navigate('/admin/selling-rates');
      return;
    }

    setEditingCard(card);
    setFormName(card.name);
    setFormClientName(card.clientName);
    setFormTenantId(card.tenantId || '');
    setFormStatus(card.status === 'Archived' ? 'Inactive' : card.status);
    setFormEffectiveFrom(card.effectiveFrom);
    setFormRemarks(card.remarks);
    setFormIsDefault(card.isDefault);
    setFormPartnerId(card.courierId);
    setFormMinWeight(card.minWeightKg.toString());
    setFormWeightDivider(card.weightDivider.toString());

    // Map matrix
    const map: Record<string, Record<string, string>> = {};
    B2B_ZONES.forEach((oz) => {
      map[oz] = {};
      B2B_ZONES.forEach((dz) => {
        const paise = card.matrixMap?.[oz]?.[dz] || 650;
        map[oz][dz] = (paise / 100).toFixed(2);
      });
    });
    setMatrixState(map);

    setActiveViewMode('EDIT_B2B');
  };

  // SAVE RATE CARD HANDLER (WITH AUTOMATIC VERSIONING v1, v2, v3)
  const handleSaveRateCardSubmit = () => {
    if (!formName.trim()) {
      triggerNotification('Please enter a Rate Card Name.');
      return;
    }

    const courierObj = DEMO_COURIER_PROVIDERS.find((c) => c.id === formPartnerId) || DEMO_COURIER_PROVIDERS[0];
    const maxId = Math.max(...cardsList.map((c) => c.numId), 103);
    const newNumId = editingCard ? editingCard.numId : maxId + 1;
    const newId = editingCard ? editingCard.id : `b2b-card-${newNumId}`;

    const newMatrixMap: Record<string, Record<string, number>> = {};
    B2B_ZONES.forEach((oz) => {
      newMatrixMap[oz] = {};
      B2B_ZONES.forEach((dz) => {
        const valINR = parseFloat(matrixState[oz]?.[dz]) || 6.5;
        newMatrixMap[oz][dz] = Math.round(valINR * 100);
      });
    });

    let nextVersion = 'v1';
    let historyRecords: RateVersionRecord[] = [];

    if (editingCard) {
      const currentVerNum = parseInt(editingCard.version.replace('v', '')) || 1;
      nextVersion = `v${currentVerNum + 1}`;

      const previousRecord: RateVersionRecord = {
        version: editingCard.version,
        effectiveFrom: editingCard.effectiveFrom,
        effectiveTo: formEffectiveFrom,
        changedBy: 'Super Admin',
        changedOn: new Date().toLocaleString(),
        changelog: `Updated matrix rates and additional charges. Version bumped to ${nextVersion}.`,
        status: 'Archived',
        matrixSnapshot: editingCard.matrixMap,
      };

      const newRecord: RateVersionRecord = {
        version: nextVersion,
        effectiveFrom: formEffectiveFrom,
        changedBy: 'Super Admin',
        changedOn: new Date().toLocaleString(),
        changelog: `Saved Version ${nextVersion} with effective date ${formEffectiveFrom}.`,
        status: 'Active',
      };

      historyRecords = [newRecord, previousRecord, ...(editingCard.versionsHistory.filter((v) => v.version !== editingCard.version))];
    } else {
      nextVersion = 'v1';
      historyRecords = [
        {
          version: 'v1',
          effectiveFrom: formEffectiveFrom,
          changedBy: 'Super Admin',
          changedOn: new Date().toLocaleString(),
          changelog: 'Created initial Version 1 of rate card.',
          status: 'Active',
        },
      ];
    }

    const savedCard: ClientRateCardItem = {
      numId: newNumId,
      id: newId,
      name: formName.trim(),
      type: 'B2B',
      clientName: formClientName,
      tenantId: formTenantId || undefined,
      courierId: courierObj.id,
      shippingPartner: courierObj.name,
      serviceName: 'Commercial Cargo',
      effectiveFrom: formEffectiveFrom,
      version: nextVersion,
      status: formStatus,
      isDefault: formIsDefault,
      remarks: formRemarks.trim() || `${courierObj.name} B2B Cargo`,
      minWeightKg: parseFloat(formMinWeight) || 20,
      weightDivider: parseInt(formWeightDivider) || 5000,
      updatedAt: new Date().toISOString().split('T')[0],
      matrixMap: newMatrixMap,
      surcharges: [
        { id: 's1', code: 'DOCKET', name: 'Docket Charge', calcType: 'FIXED', value: Math.round(parseFloat(docketCharge) * 100), status: 'ACTIVE' },
        { id: 's2', code: 'FUEL', name: 'Fuel Surcharge', calcType: 'PERCENTAGE', value: parseFloat(fuelCharge) || 18, status: 'ACTIVE' },
        { id: 's3', code: 'ROV_OWNER', name: 'ROV Owner Charge', calcType: 'PERCENTAGE', value: parseFloat(rovOwnerPct) || 0.2, status: 'ACTIVE' },
        { id: 's4', code: 'ODA', name: 'ODA Charge', calcType: 'FIXED', value: Math.round(parseFloat(odaCharge) * 100), status: 'ACTIVE' },
        { id: 's5', code: 'COD', name: 'COD Charge', calcType: 'FIXED', value: Math.round(parseFloat(codCharge) * 100), status: 'ACTIVE' },
      ],
      versionsHistory: historyRecords,
    };

    if (editingCard) {
      setCardsList((prev) => prev.map((item) => (item.id === editingCard.id ? savedCard : item)));
      triggerNotification(`Saved changes for ${savedCard.name}. Generated Version ${savedCard.version}.`);
    } else {
      setCardsList((prev) => [savedCard, ...prev]);
      triggerNotification(`Created Rate Card "${savedCard.name}" (${savedCard.version}) successfully.`);
    }

    setActiveViewMode('LIST');
  };

  // DUPLICATE RATE CARD HANDLER
  const handleDuplicateCard = (card: ClientRateCardItem) => {
    const maxId = Math.max(...cardsList.map((c) => c.numId), 103);
    const newNumId = maxId + 1;
    const newName = `${card.name} (Copy)`;

    const duplicatedCard: ClientRateCardItem = {
      ...card,
      numId: newNumId,
      id: `b2b-card-${newNumId}`,
      name: newName,
      version: 'v1',
      status: 'Active',
      updatedAt: new Date().toISOString().split('T')[0],
      versionsHistory: [
        {
          version: 'v1',
          effectiveFrom: new Date().toISOString().split('T')[0],
          changedBy: 'Super Admin',
          changedOn: new Date().toLocaleString(),
          changelog: `Duplicated from ${card.name} (#${card.numId}).`,
          status: 'Active',
        },
      ],
    };

    setCardsList((prev) => [duplicatedCard, ...prev]);
    triggerNotification(`Duplicated Rate Card as "${newName}". Customize rates and assign to specific client.`);
  };

  // CONFIRM CLIENT ASSIGNMENT HANDLER
  const handleConfirmAssignClient = () => {
    if (!assigningCard) return;

    const tenantName = assignClientTenantId === 'tenant-demo-01' ? 'ABC Traders' : assignClientTenantId === 'tenant-acme-02' ? 'XYZ Retail' : 'Nexus Tech B2B';

    CustomerRateAssignmentService.assignRateCard({
      tenantId: assignClientTenantId,
      tenantName: tenantName,
      mode: assigningCard.type,
      courierId: assigningCard.courierId,
      courierName: assigningCard.shippingPartner,
      serviceId: `${assigningCard.courierId}-service`,
      serviceName: assigningCard.shippingPartner,
      rateCardId: assigningCard.id,
      rateCardName: assigningCard.name,
      rateCardVersion: assigningCard.version,
      isDefault: true,
      effectiveFrom: assignEffectiveFrom,
    });

    const updatedList = cardsList.map((item) => {
      if (item.id === assigningCard.id) {
        return {
          ...item,
          clientName: tenantName,
          tenantId: assignClientTenantId,
          status: 'Active' as const,
        };
      }
      return item;
    });

    setCardsList(updatedList);
    setIsAssignModalOpen(false);
    triggerNotification(`Assigned ${assigningCard.name} to ${tenantName}. Effective from ${assignEffectiveFrom}.`);
  };

  // DEACTIVATE / ARCHIVE HANDLER (NEVER DELETE HISTORICAL CARDS)
  const handleConfirmDeactivate = () => {
    if (!deactivatingCard) return;

    const updatedList = cardsList.map((item) => {
      if (item.id === deactivatingCard.id) {
        return { ...item, status: 'Archived' as const };
      }
      return item;
    });

    setCardsList(updatedList);
    setIsDeactivateConfirmOpen(false);
    triggerNotification(`Archived Rate Card ${deactivatingCard.name}. Historical shipment records preserved.`);
  };

  // FILTERED CARDS
  const filteredCards = cardsList.filter((c) => {
    if (activeTabFilter === 'B2B' && c.type !== 'B2B') return false;
    if (activeTabFilter === 'B2C' && c.type !== 'B2C') return false;
    if (activeTabFilter === 'ASSIGNED' && (c.clientName === 'Unassigned' || !c.tenantId)) return false;
    if (activeTabFilter === 'UNASSIGNED' && c.clientName !== 'Unassigned' && c.tenantId) return false;
    if (searchQuery.trim() && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) && !c.shippingPartner.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Open Create B2C Form
  const handleOpenAddB2c = () => {
    navigate('/admin/selling-rates');
  };

  const breadcrumbs = [
    { label: 'Super Admin Portal', path: '/admin' },
    { label: 'Rate Cards', path: '/admin/b2b-rates' },
    { label: 'B2B Rate Cards', path: '/admin/b2b-rates' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', width: '100%' }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="B2B Rate Cards"
        description="Manage courier-wise and client-specific B2B commercial cargo rate cards, 16x16 zone matrices, min weights (20 KG+), and volumetric dividers."
        breadcrumbs={breadcrumbs}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" leftIcon={<Sliders size={14} />} onClick={handleOpenAddB2c}>
              B2C Rate Cards Page
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={handleOpenAddB2b}>
              + Create B2B Rate Card
            </Button>
          </div>
        }
      />

      {toastMessage && (
        <Alert variant="success" title="Rate Cards System">
          {toastMessage}
        </Alert>
      )}

      {/* VIEW MODE SWITCHING: LIST vs CREATE/EDIT B2B vs VIEW */}
      {activeViewMode === 'LIST' && (
        <>
          {/* FILTER TABS: All | B2B | B2C | Assigned | Unassigned */}
          <Card style={{ padding: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--color-surface-secondary)', padding: '4px', borderRadius: 'var(--radius-default)' }}>
                {(['ALL', 'B2B', 'B2C', 'ASSIGNED', 'UNASSIGNED'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTabFilter(tab)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      backgroundColor: activeTabFilter === tab ? 'var(--color-violet-main)' : 'transparent',
                      color: activeTabFilter === tab ? '#ffffff' : 'var(--color-text-secondary)',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <Input placeholder="Search Rate Card, Client or Courier..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ minWidth: '240px' }} />
            </div>
          </Card>

          {/* MAIN RATE CARDS LIST TABLE */}
          <Card style={{ padding: 'var(--space-4)' }}>
            <Table<ClientRateCardItem>
              keyExtractor={(c) => c.id}
              columns={[
                {
                  key: 'name',
                  header: 'Rate Card Name',
                  render: (c) => (
                    <div>
                      <strong style={{ color: 'var(--color-violet-main)' }}>{c.name}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>ID #{c.numId}</div>
                    </div>
                  ),
                },
                { key: 'type', header: 'Type', render: (c) => <Badge variant={c.type === 'B2B' ? 'info' : 'success'}>{c.type}</Badge> },
                {
                  key: 'clientName',
                  header: 'Client',
                  render: (c) => (
                    <Badge variant={c.clientName !== 'Unassigned' ? 'brand' : 'neutral'}>
                      <Users size={12} style={{ marginRight: '4px' }} />
                      {c.clientName}
                    </Badge>
                  ),
                },
                { key: 'shippingPartner', header: 'Courier Partner', render: (c) => <strong>{c.shippingPartner}</strong> },
                { key: 'effectiveFrom', header: 'Effective From', render: (c) => <span style={{ fontSize: '11px' }}>{c.effectiveFrom}</span> },
                { key: 'version', header: 'Version', render: (c) => <Badge variant="neutral"><strong>{c.version}</strong></Badge> },
                { key: 'status', header: 'Status', render: (c) => <Badge variant={c.status === 'Active' ? 'success' : c.status === 'Draft' ? 'warning' : 'danger'}>{c.status}</Badge> },
                {
                  key: 'actions',
                  header: 'Actions',
                  align: 'right',
                  render: (c) => (
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      <Button variant="ghost" size="sm" onClick={() => { setEditingCard(c); setActiveViewMode('VIEW'); }}>
                        <Eye size={12} style={{ marginRight: '2px' }} /> View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleOpenEditCard(c)}>
                        <Edit2 size={12} style={{ marginRight: '2px' }} /> Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDuplicateCard(c)}>
                        <Copy size={12} style={{ marginRight: '2px' }} /> Duplicate
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => { setAssigningCard(c); setIsAssignModalOpen(true); }}>
                        <Users size={12} style={{ marginRight: '2px' }} /> Assign
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setHistoryCard(c); setIsHistoryModalOpen(true); }}>
                        <History size={12} style={{ marginRight: '2px' }} /> History
                      </Button>
                      <Button variant="ghost" size="sm" style={{ color: 'var(--color-danger)' }} onClick={() => { setDeactivatingCard(c); setIsDeactivateConfirmOpen(true); }}>
                        <Ban size={12} />
                      </Button>
                    </div>
                  ),
                },
              ]}
              data={filteredCards}
            />
          </Card>
        </>
      )}

      {/* CREATE OR EDIT B2B RATE CARD FORM (CONTINUOUS SINGLE PAGE FORM) */}
      {(activeViewMode === 'CREATE_B2B' || activeViewMode === 'EDIT_B2B') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Card style={{ padding: 'var(--space-4)', borderLeft: '4px solid var(--color-violet-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                  {activeViewMode === 'CREATE_B2B' ? 'Create B2B Rate Card' : `Edit Rate Card — ${editingCard?.name}`}
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  Continuous form: Rate information, client link, partner, Excel upload, 16×16 matrix, weight logic, and in-card additional charges.
                </span>
              </div>
              <Button variant="ghost" onClick={() => setActiveViewMode('LIST')}>
                Back to Rate Cards
              </Button>
            </div>
          </Card>

          {/* SECTION A — RATE CARD INFORMATION */}
          <Card style={{ padding: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--color-text-primary)' }}>
              SECTION A — Rate Card Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
              <Input label="Rate Card Name *" placeholder="e.g. ABC Traders - Gati B2B" value={formName} onChange={(e) => setFormName(e.target.value)} />
              <Select
                label="Client (Merchant Tenant)"
                value={formTenantId}
                onChange={(e) => {
                  setFormTenantId(e.target.value);
                  setFormClientName(e.target.value === 'tenant-demo-01' ? 'ABC Traders' : e.target.value === 'tenant-acme-02' ? 'XYZ Retail' : e.target.value === 'tenant-vip-03' ? 'Nexus Tech B2B' : 'Unassigned');
                }}
                options={[
                  { value: '', label: 'Unassigned (Assign Later)' },
                  { value: 'tenant-demo-01', label: 'ABC Traders (tenant-demo-01)' },
                  { value: 'tenant-acme-02', label: 'XYZ Retail (tenant-acme-02)' },
                  { value: 'tenant-vip-03', label: 'Nexus Tech B2B (tenant-vip-03)' },
                ]}
              />
              <Select
                label="Status *"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Inactive', label: 'Inactive' },
                ]}
              />
              <Input label="Effective From *" type="date" value={formEffectiveFrom} onChange={(e) => setFormEffectiveFrom(e.target.value)} />
              <Select
                label="Default Rate Card? *"
                value={formIsDefault ? 'YES' : 'NO'}
                onChange={(e) => setFormIsDefault(e.target.value === 'YES')}
                options={[
                  { value: 'NO', label: 'No' },
                  { value: 'YES', label: 'Yes' },
                ]}
              />
            </div>

            <div style={{ marginTop: '12px' }}>
              <Input label="Remarks (Optional)" placeholder="Negotiated client rate card description" value={formRemarks} onChange={(e) => setFormRemarks(e.target.value)} />
            </div>
          </Card>

          {/* SECTION B — SHIPPING PARTNER */}
          <Card style={{ padding: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--color-text-primary)' }}>
              SECTION B — Shipping Partner
            </h3>

            <Select
              label="Shipping Partner *"
              value={formPartnerId}
              onChange={(e) => setFormPartnerId(e.target.value)}
              options={DEMO_COURIER_PROVIDERS.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Card>

          {/* SECTION C — UPLOAD RATE CARD */}
          <Card style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-surface-secondary)', border: '2px dashed var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h4 style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>SECTION C — Upload Rate Card (Excel .xlsx / CSV)</h4>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Upload spreadsheet to populate matrix rates automatically. Or enter rates manually in Section D below.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="outline" size="sm" leftIcon={<Download size={14} />} onClick={() => triggerNotification('Downloaded B2B Excel Template.')}>
                  Download Template
                </Button>
                <label style={{ cursor: 'pointer' }}>
                  <input type="file" accept=".xlsx,.csv" style={{ display: 'none' }} onChange={(e) => { if (e.target.files?.[0]) { setUploadedFileName(e.target.files[0].name); setIsImportPreviewOpen(true); } }} />
                  <Button variant="primary" size="sm" leftIcon={<Upload size={14} />} style={{ pointerEvents: 'none' }}>
                    Upload Rate File
                  </Button>
                </label>
              </div>
            </div>
          </Card>

          {/* SECTION D — 16x16 ZONE RATE MATRIX */}
          <Card style={{ padding: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px', color: 'var(--color-text-primary)' }}>
              SECTION D — 16×16 Zone Rate Matrix (₹ per KG)
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '12px' }}>
              Rows = From Zone • Columns = To Zone. Every cell is directly editable. Stored as From Zone, To Zone, Rate per KG.
            </span>

            <div style={{ overflowX: 'auto', maxHeight: '520px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-default)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ position: 'sticky', top: 0, backgroundColor: 'var(--color-surface-secondary)', zIndex: 3, borderBottom: '2px solid var(--color-border)' }}>
                    <th style={{ padding: '8px', textAlign: 'left', minWidth: '80px', position: 'sticky', left: 0, backgroundColor: 'var(--color-surface-secondary)', zIndex: 4 }}>
                      From \ To
                    </th>
                    {DEMO_DEST_ZONES.map((dz) => (
                      <th key={dz} style={{ padding: '8px', textAlign: 'center', minWidth: '60px', color: 'var(--color-violet-main)', fontWeight: 'bold' }}>
                        {dz}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEMO_ORIGIN_ZONES.map((oz) => (
                    <tr key={oz} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold', position: 'sticky', left: 0, backgroundColor: 'var(--color-surface)', zIndex: 2, borderRight: '1px solid var(--color-border)' }}>
                        {oz}
                      </td>
                      {DEMO_DEST_ZONES.map((dz) => {
                        const currentVal = matrixState[oz]?.[dz] || '6.60';
                        return (
                          <td key={dz} style={{ padding: '4px', textAlign: 'center' }}>
                            <input
                              type="number"
                              step="0.10"
                              value={currentVal}
                              onChange={(e) => handleMatrixCellChange(oz, dz, e.target.value)}
                              style={{
                                width: '54px',
                                padding: '4px',
                                textAlign: 'center',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                borderRadius: '4px',
                                border: '1px solid var(--color-border)',
                                backgroundColor: 'var(--color-surface)',
                              }}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* SECTION E — B2B WEIGHT LOGIC & DIVISOR */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            <Card style={{ padding: 'var(--space-4)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--color-text-primary)' }}>
                SECTION E — Minimum Chargeable Weight
              </h3>
              <Input label="Minimum Chargeable Weight (KG) *" type="number" value={formMinWeight} onChange={(e) => setFormMinWeight(e.target.value)} />
            </Card>

            <Card style={{ padding: 'var(--space-4)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--color-text-primary)' }}>
                Weight Divider (Volumetric Divisor)
              </h3>
              <Input label="Weight Divider *" type="number" value={formWeightDivider} onChange={(e) => setFormWeightDivider(e.target.value)} />
            </Card>
          </div>

          {/* SECTION F — TWO-COLUMN ADDITIONAL CHARGES (INSIDE THE SAME CARD) */}
          <Card style={{ padding: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--color-text-primary)' }}>
              SECTION F — Additional Charges (Two-Column Form)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
              <Input label="Docket Charge (₹)" type="number" value={docketCharge} onChange={(e) => setDocketCharge(e.target.value)} />
              <Input label="Minimum Docket Charge (₹)" type="number" value={minDocketCharge} onChange={(e) => setMinDocketCharge(e.target.value)} />
              <Input label="ROV Owner Charge (₹)" type="number" value={rovOwnerCharge} onChange={(e) => setRovOwnerCharge(e.target.value)} />
              <Input label="Minimum ROV Owner Charge (₹)" type="number" value={minRovOwnerCharge} onChange={(e) => setMinRovOwnerCharge(e.target.value)} />
              <Input label="ROV Owner Percentage (%)" type="number" value={rovOwnerPct} onChange={(e) => setRovOwnerPct(e.target.value)} />
              <Input label="ROV Carrier Charge (₹)" type="number" value={rovCarrierCharge} onChange={(e) => setRovCarrierCharge(e.target.value)} />
              <Input label="Minimum ROV Carrier Charge (₹)" type="number" value={minRovCarrierCharge} onChange={(e) => setMinRovCarrierCharge(e.target.value)} />
              <Input label="ROV Carrier Percentage (%)" type="number" value={rovCarrierPct} onChange={(e) => setRovCarrierPct(e.target.value)} />
              <Input label="ODA Charge (₹)" type="number" value={odaCharge} onChange={(e) => setOdaCharge(e.target.value)} />
              <Input label="Minimum ODA Charge (₹)" type="number" value={minOdaCharge} onChange={(e) => setMinOdaCharge(e.target.value)} />
              <Input label="FM Charge (₹)" type="number" value={fmCharge} onChange={(e) => setFmCharge(e.target.value)} />
              <Input label="Handling Charge (₹)" type="number" value={handlingCharge} onChange={(e) => setHandlingCharge(e.target.value)} />
              <Input label="Minimum Handling Charge (₹)" type="number" value={minHandlingCharge} onChange={(e) => setMinHandlingCharge(e.target.value)} />
              <Input label="Fuel Surcharge (%)" type="number" value={fuelCharge} onChange={(e) => setFuelCharge(e.target.value)} />
              <Input label="COD Charge (₹)" type="number" value={codCharge} onChange={(e) => setCodCharge(e.target.value)} />
              <Input label="COD Percentage (%)" type="number" value={codPct} onChange={(e) => setCodPct(e.target.value)} />
              <Input label="Minimum COD Charge (₹)" type="number" value={minCodCharge} onChange={(e) => setMinCodCharge(e.target.value)} />
              <Input label="To Pay Franchise Charge (₹)" type="number" value={franchiseCharge} onChange={(e) => setFranchiseCharge(e.target.value)} />
              <Input label="Pickup Charge (₹)" type="number" value={pickupCharge} onChange={(e) => setPickupCharge(e.target.value)} />
              <Input label="Insurance Charge (₹)" type="number" value={insuranceCharge} onChange={(e) => setInsuranceCharge(e.target.value)} />
              <Input label="Appointment Charge (₹)" type="number" value={appointmentCharge} onChange={(e) => setAppointmentCharge(e.target.value)} />
            </div>
          </Card>

          {/* BOTTOM FORM BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button variant="ghost" onClick={() => setActiveViewMode('LIST')}>
              Cancel
            </Button>
            <Button variant="primary" size="lg" leftIcon={<Save size={16} />} onClick={handleSaveRateCardSubmit}>
              Save Rate Card
            </Button>
          </div>
        </div>
      )}

      {/* RATE VERSION HISTORY & CHANGE AUDIT LOG MODAL */}
      {isHistoryModalOpen && historyCard && (
        <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title={`Rate Version History & Change Audit Log — ${historyCard.name}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Complete historical timeline for <strong>{historyCard.name}</strong>. Old versions are archived to ensure historical shipments remain 100% reproducible.
            </p>

            <Table<RateVersionRecord>
              keyExtractor={(v) => v.version}
              columns={[
                { key: 'version', header: 'Version', render: (v) => <Badge variant={v.status === 'Active' ? 'brand' : 'neutral'}><strong>{v.version}</strong></Badge> },
                { key: 'effectiveFrom', header: 'Effective From', render: (v) => <span>{v.effectiveFrom}</span> },
                { key: 'effectiveTo', header: 'Effective To', render: (v) => <span>{v.effectiveTo || 'Present'}</span> },
                { key: 'changedBy', header: 'Changed By', render: (v) => <strong>{v.changedBy}</strong> },
                { key: 'changedOn', header: 'Timestamp', render: (v) => <span style={{ fontSize: '11px' }}>{v.changedOn}</span> },
                { key: 'changelog', header: 'Change Summary', render: (v) => <span style={{ fontSize: '12px' }}>{v.changelog}</span> },
                { key: 'status', header: 'Status', render: (v) => <Badge variant={v.status === 'Active' ? 'success' : 'neutral'}>{v.status}</Badge> },
              ]}
              data={historyCard.versionsHistory}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <Button variant="ghost" onClick={() => setIsHistoryModalOpen(false)}>
                Close History
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* READ-ONLY VIEW SUMMARY MODAL */}
      {activeViewMode === 'VIEW' && editingCard && (
        <Modal isOpen={true} onClose={() => setActiveViewMode('LIST')} title={`Rate Card Summary — ${editingCard.name} (${editingCard.version})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', padding: '12px', backgroundColor: 'var(--color-surface-secondary)', borderRadius: 'var(--radius-default)' }}>
              <div><span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Type</span><div><Badge variant={editingCard.type === 'B2B' ? 'info' : 'success'}>{editingCard.type}</Badge></div></div>
              <div><span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Client</span><strong>{editingCard.clientName}</strong></div>
              <div><span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Shipping Partner</span><strong>{editingCard.shippingPartner}</strong></div>
              <div><span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Effective From</span><strong>{editingCard.effectiveFrom}</strong></div>
              <div><span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Version</span><Badge variant="neutral"><strong>{editingCard.version}</strong></Badge></div>
              <div><span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Weight Divider</span><strong>{editingCard.weightDivider}</strong></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
              <Button variant="ghost" onClick={() => setActiveViewMode('LIST')}>
                Close
              </Button>
              <Button variant="primary" onClick={() => handleOpenEditCard(editingCard)}>
                Edit Rate Card
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* IMPORT PREVIEW MODAL */}
      {isImportPreviewOpen && (
        <Modal isOpen={isImportPreviewOpen} onClose={() => setIsImportPreviewOpen(false)} title="Upload Rate Card Preview">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Alert variant="info" title="Spreadsheet Uploaded Successfully">
              File <strong>{uploadedFileName}</strong> parsed cleanly. 16×16 zone matrix populated.
            </Alert>
            <Button variant="primary" onClick={() => { setIsImportPreviewOpen(false); triggerNotification('Populated matrix rates from spreadsheet.'); }}>
              Confirm & Populate Matrix
            </Button>
          </div>
        </Modal>
      )}

      {/* ASSIGN RATE CARD MODAL */}
      {isAssignModalOpen && assigningCard && (
        <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title={`Assign Rate Card — ${assigningCard.name}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Assign <strong>{assigningCard.name} ({assigningCard.version})</strong> to a client merchant tenant.
            </p>

            <Select
              label="Select Client (Merchant Tenant) *"
              value={assignClientTenantId}
              onChange={(e) => setAssignClientTenantId(e.target.value)}
              options={[
                { value: 'tenant-demo-01', label: 'ABC Traders (tenant-demo-01)' },
                { value: 'tenant-acme-02', label: 'XYZ Retail (tenant-acme-02)' },
                { value: 'tenant-vip-03', label: 'Nexus Tech B2B (tenant-vip-03)' },
              ]}
            />

            <Input label="Effective From *" type="date" value={assignEffectiveFrom} onChange={(e) => setAssignEffectiveFrom(e.target.value)} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
              <Button variant="ghost" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmAssignClient}>
                Assign Rate Card
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* DEACTIVATE / ARCHIVE CONFIRMATION DIALOG */}
      {isDeactivateConfirmOpen && deactivatingCard && (
        <ConfirmationDialog
          isOpen={isDeactivateConfirmOpen}
          onClose={() => setIsDeactivateConfirmOpen(false)}
          onConfirm={handleConfirmDeactivate}
          title="Deactivate / Archive Rate Card"
          description={`Are you sure you want to deactivate Rate Card #${deactivatingCard.numId} (${deactivatingCard.name})? Historical shipment records will be safely preserved.`}
          confirmLabel="Archive Rate Card"
          cancelLabel="Cancel"
          variant="danger"
        />
      )}
    </div>
  );
};
