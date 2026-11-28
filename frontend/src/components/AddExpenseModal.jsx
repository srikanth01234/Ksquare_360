import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdropVariants, modalContentVariants } from '../utils/animations';
import {
  X,
  FileSpreadsheet,
  Layers,
  Building2,
  Calendar,
  ShoppingCart,
  User,
  Users,
  CreditCard,
  CheckCircle2,
  Circle,
  FileEdit,
  Plus,
  ChevronDown,
  Banknote,
  Send,
  Upload,
  Image as ImageIcon,
  Hash,
  Trash2,
  Package,
  Truck,
  Calculator,
  Coins,
  Zap,
  ShieldCheck,
  Wallet,
  Info,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { CONSTRUCTION_MATERIALS, LABOUR_WORKER_TYPES } from '../constants/constructionData';
import { siteApi, labourApi } from '../services/api';
import { useDropdowns } from '../context/DropdownContext';

// Material type classification helpers
const isSteelMaterial = (name) => name === 'Steel';
const isRingMaterial = (name) => name === 'Rings';
const isSandMaterial = (name) => ['M-Sand', 'P-Sand', 'River Sand'].includes(name);
const isBlueMetalMaterial = (name) =>
  ['20 mm Blue Metal', '40 mm Blue Metal', '20mm Blue Metal', '40mm Blue Metal'].includes(name);
const isBrickOrBlockMaterial = (name) =>
  [
    'Chamber Bricks',
    'Fly Ash Bricks',
    'Solid Block – 6 Inch',
    'Solid Block – 4 Inch',
    'Chengal Brick (Red Brick)',
    'Cement Brick',
    'AAC Block',
  ].includes(name);

const STEEL_TYPES = ['32 mm', '25 mm', '20 mm', '16 mm', '12 mm', '10 mm', '8 mm', '6 mm'];

// Standard Unit Weight Chart for TMT Steel Bars (kg/m)
// Civil Engineering Formula: W = (D² × L) / 162.2 (D in mm, L in meters)
// 1 foot = 0.3048 meters
const STEEL_UNIT_WEIGHTS = {
  '6 mm': 0.222,
  '8 mm': 0.395,
  '10 mm': 0.617,
  '12 mm': 0.888,
  '16 mm': 1.580,
  '20 mm': 2.470,
  '25 mm': 3.850,
  '32 mm': 6.313,
};

const calculateSteelWeight = (steelType, lengthFt) => {
  const len = parseFloat(lengthFt);
  if (!len || isNaN(len) || len <= 0) return '';
  const unitWeight =
    STEEL_UNIT_WEIGHTS[steelType] ||
    (parseFloat(steelType) ? Math.pow(parseFloat(steelType), 2) / 162.2 : 0);
  if (!unitWeight) return '';
  const lengthMeters = len * 0.3048;
  const weight = lengthMeters * unitWeight;
  return (Math.round(weight * 100) / 100).toFixed(2);
};
const RING_TYPES = ['8 mm', '6 mm'];
const BRICK_BLOCK_TYPES = [
  'Chamber Bricks',
  'Fly Ash Bricks',
  'Solid Block – 6 Inch',
  'Solid Block – 4 Inch',
  'Chengal Brick (Red Brick)',
  'Cement Brick',
  'AAC Block',
];

const noSpinnerClass =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

const blockNegativeKeys = (e) => {
  if (['-', '+', 'e', 'E'].includes(e.key)) {
    e.preventDefault();
  }
};

const sanitizeNonNegative = (val) => {
  if (val === '') return '';
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num) || num < 0) return '0';
  return cleaned;
};

const createDefaultRow = (materialName) => {
  const id = Date.now() + Math.random();
  if (isSteelMaterial(materialName)) {
    return { id, steelType: '12 mm', length: '', weight: '', rate: '', amount: '' };
  }
  if (isRingMaterial(materialName)) {
    return { id, ringType: '8 mm', quantity: '', weight: '', rate: '', amount: '' };
  }
  if (isSandMaterial(materialName)) {
    return { id, sandType: materialName || 'M-Sand', quantity: '', rate: '', amount: '' };
  }
  if (isBlueMetalMaterial(materialName)) {
    return { id, materialType: materialName || '20 mm Blue Metal', quantity: '', rate: '', amount: '' };
  }
  if (isBrickOrBlockMaterial(materialName)) {
    return { id, materialType: materialName || 'Chamber Bricks', quantity: '', rate: '', amount: '' };
  }
  return {
    id,
    material: materialName || 'Cement',
    quantity: materialName === 'Cement' ? '50' : '',
    unit: materialName === 'Cement' ? 'Bags' : 'Bags',
    rate: materialName === 'Cement' ? '420' : '',
    amount: materialName === 'Cement' ? '21000' : '',
  };
};

export default function AddExpenseModal({
  isOpen,
  onClose,
  onAddExpense,
  lockedSite = null,
}) {
  const { getOptions } = useDropdowns();
  const vehicleTypeOptions = getOptions('expenses.vehicleTypes', [
    'Tata Ace / Mini Truck',
    'Pickup / Bolero Truck',
    'Tipper / Dumper',
    'Tractor',
    '6-Wheeler Lorry',
    '10-Wheeler Lorry',
    'Auto / 3-Wheeler',
    'Other Vehicle',
  ]);
  const rentalEquipmentOptions = getOptions('expenses.rentalEquipment', [
    'JCB / Excavator',
    'Concrete Mixer Machine',
    'Generator (DG Set)',
    'Tractor',
    'Crane',
    'Scaffolding',
    'Tipper / Dumper',
    'Earth Compactor / Roller',
    'Concrete Vibrator / Needle',
    'Other Machinery',
  ]);
  const rentalUnitOptions = getOptions('expenses.rentalUnits', [
    'Hours',
    'Days',
    'Shifts',
    'Trips',
    'Months',
  ]);
  const fileInputRef = useRef(null);
  const [sitesList, setSitesList] = useState([]);
  const [labourList, setLabourList] = useState([]);
  const saving = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const submissionKey = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      submissionKey.current = null;
      setSaveError('');
    }
  }, [isOpen]);
  const [paymentError, setPaymentError] = useState('');
  const [mainTab, setMainTab] = useState('Expenses'); // 'Expenses' | 'Additional Work'
  const [formData, setFormData] = useState({
    category: 'Materials',
    materialName: 'Cement',
    site: lockedSite || '',
    siteId: '',
    date: new Date().toISOString().split('T')[0],
    description: 'Cement - 50 Bags Purchase',
    supplier: '',
    invoiceNo: '',
    quantity: '50',
    unit: 'Bags',
    rate: '420',
    // Labour specific fields
    labourEntryMode: 'EXISTING', // 'EXISTING' | 'NEW'
    isGroupLabour: false,
    selectedLabourId: '',
    manualLabourName: '',
    labourType: 'Mason',
    labourContractor: 'Direct Labour',
    labourWorkersCount: '1',
    labourDailyWage: '800',
    labourDays: '1',
    labourOtRate: '100',
    labourOtHours: '0',
    labourExtraAmount: '0',
    // Rental specific fields
    rentalEquipment: 'JCB / Excavator',
    rentalVendor: '',
    rentalDuration: '1',
    rentalUnit: 'Days',
    rentalRate: '3000',
    // Additional Work specific fields & metering
    additionalWorkTitle: 'Compound Wall Extension',
    additionalWorkContractor: '',
    additionalWorkQty: '100',
    additionalWorkUnit: 'Sq.Ft',
    additionalWorkRate: '85',
    additionalWorkClientApproved: true,
    addlPricingMode: 'breakdown', // 'breakdown' | 'metering'
    addlLabourRole: 'Mason',
    addlLabourCount: '2',
    addlLabourWage: '1000',
    addlLabourDays: '2',
    addlMachineryType: 'None',
    addlMachineryDuration: '0',
    addlMachineryUnit: 'Days',
    addlMachineryRate: '0',
    // Lump sum or direct amount override
    customAmount: '',
    // Additional vehicle & tips for Materials
    vehicleType: 'Tata Ace / Mini Truck',
    rentalAmount: '',
    tipsAmount: '',
    billingAmount: '', // Empty by default and editable
    partialPaidAmount: '',
    paymentMethod: 'Cash', // 'Cash' | 'UPI' | ''
    paymentStatus: 'Paid',
    transactionId: '',
    notes: '',
  });

  // Handle category switching with clean contextual defaults
  const handleCategoryChange = (newCat) => {
    let nextDesc = '';
    let nextSupplier = '';
    let nextQty = '1';
    let nextUnit = 'Days';
    let nextRate = '1000';

    if (newCat === 'Materials') {
      nextDesc = `${formData.materialName || 'Cement'} - 50 Bags Purchase`;
      nextQty = '50';
      nextUnit = 'Bags';
      nextRate = '420';
    } else if (newCat === 'Labour') {
      const role = formData.labourType || 'Mason';
      const count = formData.labourWorkersCount || '4';
      nextDesc = `${role} Daily Wages (${count} Workers)`;
      nextSupplier = formData.labourContractor || 'Direct Labour';
      nextQty = count;
      nextUnit = 'Workers';
      nextRate = formData.labourDailyWage || '1000';
    } else if (newCat === 'Rental') {
      const equip = formData.rentalEquipment || 'JCB / Excavator';
      const dur = formData.rentalDuration || '1';
      const unit = formData.rentalUnit || 'Days';
      nextDesc = `${equip} Rental (${dur} ${unit})`;
      nextSupplier = formData.rentalVendor || '';
      nextQty = dur;
      nextUnit = unit;
      nextRate = formData.rentalRate || '3000';
    } else if (newCat === 'Additional Work') {
      const title = formData.additionalWorkTitle || 'Compound Wall Extension';
      const q = formData.additionalWorkQty || '100';
      const u = formData.additionalWorkUnit || 'Sq.Ft';
      const r = formData.additionalWorkRate || '85';
      nextDesc = `Additional Work: ${title} (${q} ${u})`;
      nextSupplier = formData.additionalWorkContractor || '';
      nextQty = q;
      nextUnit = u;
      nextRate = r;
    } else {
      nextDesc = 'Miscellaneous Site Expense';
      nextSupplier = '';
      nextQty = '1';
      nextUnit = 'Item';
      nextRate = '';
    }

    setFormData((prev) => ({
      ...prev,
      category: newCat,
      description: nextDesc,
      supplier: nextSupplier,
      quantity: nextQty,
      unit: nextUnit,
      rate: nextRate,
      customAmount: '',
      rentalAmount: newCat === 'Materials' ? prev.rentalAmount : '',
      tipsAmount: newCat === 'Materials' ? prev.tipsAmount : '',
    }));
  };

  // Load live sites and labour directory from database
  useEffect(() => {
    if (isOpen) {
      setPaymentError('');
      siteApi.getAll().then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setSitesList(list);
        if (!lockedSite && list.length > 0) {
          setFormData((prev) => ({
            ...prev,
            site: prev.site || `${list[0].name} (${list[0].code})`,
            siteId: prev.siteId || list[0]._id,
          }));
        }
      }).catch((err) => {
        console.warn('Could not fetch sites for expense modal:', err.message);
        setSitesList([]);
      });

      labourApi.getAll().then((res) => {
        const workers = (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []).filter(
          (w) => w.status !== 'Inactive' && w.engagementType !== 'Labour Contract'
        );
        setLabourList(workers);
        if (workers.length > 0) {
          const first = workers[0];
          setFormData((prev) => {
            if (prev.selectedLabourId && prev.selectedLabourId !== '__MANUAL__') return prev;
            return {
              ...prev,
              labourEntryMode: 'EXISTING',
              selectedLabourId: first._id || first.id,
              manualLabourName: first.name,
              labourType: first.workerType || prev.labourType,
              labourWorkersCount: '1',
              labourDays: '1',
              labourDailyWage: String(first.dailyWage ?? 800),
              labourOtRate: String(first.overtimeRate ?? 100),
              labourOtHours: '0',
              labourExtraAmount: '0',
              supplier: first.name,
              labourContractor: first.name,
            };
          });
        } else {
          setFormData((prev) => ({ ...prev, labourEntryMode: 'NEW', selectedLabourId: '__MANUAL__' }));
        }
      }).catch((err) => {
        console.warn('Could not fetch labour records for expense modal:', err.message);
        setLabourList([]);
      });
    }
  }, [isOpen, lockedSite]);

  // Sync locked site if provided
  useEffect(() => {
    if (lockedSite) {
      setFormData((prev) => ({ ...prev, site: lockedSite }));
    }
  }, [lockedSite, isOpen]);

  // Dynamic Material Details Table rows
  const [materialItems, setMaterialItems] = useState([
    { id: 1, material: 'Cement', quantity: '50', unit: 'Bags', rate: '420', amount: '21000' },
  ]);

  // Dynamic Additional Work Materials Table rows
  const [addlMaterialItems, setAddlMaterialItems] = useState([
    { id: 1, material: 'Cement', quantity: '10', unit: 'Bags', amount: '4200' },
  ]);

  const handleAddAddlMaterial = () => {
    setAddlMaterialItems((prev) => [
      ...prev,
      { id: Date.now(), material: 'M-Sand', quantity: '1', unit: 'Load', amount: '3500' },
    ]);
  };

  const handleRemoveAddlMaterial = (id) => {
    setAddlMaterialItems((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddlMaterialChange = (id, field, value) => {
    setAddlMaterialItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [totalAmount, setTotalAmount] = useState(21000);

  // Labour OT & Extra calculations
  const labourBaseSalary = useMemo(() => {
    const count = parseFloat(formData.labourWorkersCount) || 1;
    const wage = parseFloat(formData.labourDailyWage) || 0;
    const days = parseFloat(formData.labourDays) || 1;
    return count * wage * days;
  }, [formData.labourWorkersCount, formData.labourDailyWage, formData.labourDays]);

  const labourOtAmount = useMemo(() => {
    const otRate = parseFloat(formData.labourOtRate) || 0;
    const otHours = parseFloat(formData.labourOtHours) || 0;
    return otRate * otHours;
  }, [formData.labourOtRate, formData.labourOtHours]);

  const labourExtraNum = parseFloat(formData.labourExtraAmount) || 0;

  // Overall Expense Calculations (Calculated Amount)
  const computedAmount = useMemo(() => {
    if (formData.category === 'Materials') {
      return materialItems.reduce(
        (sum, it) => sum + (parseFloat(it.amount) || 0),
        0
      );
    }
    if (formData.category === 'Labour') {
      if (formData.customAmount) return parseFloat(formData.customAmount) || 0;
      return labourBaseSalary + labourOtAmount + labourExtraNum;
    }
    if (formData.category === 'Rental') {
      if (formData.customAmount) return parseFloat(formData.customAmount) || 0;
      const dur = parseFloat(formData.rentalDuration) || 1;
      const rate = parseFloat(formData.rentalRate) || 0;
      return dur * rate;
    }
    return parseFloat(formData.customAmount) || 0;
  }, [
    formData.category,
    formData.customAmount,
    labourBaseSalary,
    labourOtAmount,
    labourExtraNum,
    formData.rentalDuration,
    formData.rentalRate,
    materialItems,
  ]);

  const materialCost = formData.category === 'Materials' ? computedAmount : 0;
  const vehicleRental = formData.category === 'Materials' ? (parseFloat(formData.rentalAmount) || 0) : 0;
  const tips = formData.category === 'Materials' ? (parseFloat(formData.tipsAmount) || 0) : 0;
  const totalExpenseAmount = computedAmount + vehicleRental + tips;

  // Billing Amount overrides Calculated Amount as the Final Actual Expense Amount
  const parsedBillingAmount = formData.billingAmount !== '' ? parseFloat(formData.billingAmount) : NaN;
  const finalExpenseAmount =
    !isNaN(parsedBillingAmount) && parsedBillingAmount > 0 ? parsedBillingAmount : totalExpenseAmount;

  const parsedPartialPaid = formData.partialPaidAmount !== '' ? parseFloat(formData.partialPaidAmount) : 0;
  const remainingOutstanding =
    formData.paymentStatus === 'Partial'
      ? Math.max(0, finalExpenseAmount - (isNaN(parsedPartialPaid) ? 0 : parsedPartialPaid))
      : formData.paymentStatus === 'Pending'
      ? finalExpenseAmount
      : 0;

  useEffect(() => {
    setTotalAmount(totalExpenseAmount);
  }, [totalExpenseAmount]);

  // Synchronize Material Items with Purchase Details (Quantity & Rate)
  useEffect(() => {
    if (formData.category !== 'Materials') {
      return;
    }

    // Sum of amounts from all rows
    const sumAmount = materialItems.reduce(
      (acc, item) => acc + (parseFloat(item.amount) || 0),
      0
    );

    // Sum of quantities / weight based on material type
    let totalQty = 0;
    let targetUnit = formData.unit;

    if (isSteelMaterial(formData.materialName)) {
      totalQty = materialItems.reduce(
        (acc, item) => acc + (parseFloat(item.weight) || 0),
        0
      );
      targetUnit = 'Kg';
    } else if (isRingMaterial(formData.materialName)) {
      totalQty = materialItems.reduce(
        (acc, item) => acc + (parseFloat(item.quantity) || 0),
        0
      );
      targetUnit = 'Pieces';
    } else if (isSandMaterial(formData.materialName)) {
      totalQty = materialItems.reduce(
        (acc, item) => acc + (parseFloat(item.quantity) || 0),
        0
      );
      targetUnit = 'Tons';
    } else if (isBlueMetalMaterial(formData.materialName)) {
      totalQty = materialItems.reduce(
        (acc, item) => acc + (parseFloat(item.quantity) || 0),
        0
      );
      targetUnit = 'Tons';
    } else if (isBrickOrBlockMaterial(formData.materialName)) {
      totalQty = materialItems.reduce(
        (acc, item) => acc + (parseFloat(item.quantity) || 0),
        0
      );
      targetUnit = 'Pieces';
    } else {
      totalQty = materialItems.reduce(
        (acc, item) => acc + (parseFloat(item.quantity) || 0),
        0
      );
      targetUnit = materialItems[0]?.unit || 'Bags';
    }

    setFormData((prev) => {
      const nextQty = totalQty > 0 ? String(totalQty) : prev.quantity;
      const nextRate =
        totalQty > 0 && sumAmount > 0
          ? (sumAmount / totalQty).toFixed(2)
          : prev.rate;

      if (
        prev.quantity === nextQty &&
        prev.unit === targetUnit &&
        prev.rate === nextRate
      ) {
        return prev;
      }
      return {
        ...prev,
        quantity: nextQty,
        unit: targetUnit,
        rate: nextRate,
      };
    });
  }, [materialItems, formData.category, formData.materialName]);

  const handleMaterialChange = (selectedMat) => {
    const newRow = createDefaultRow(selectedMat);
    setMaterialItems([newRow]);

    let newUnit = 'Bags';
    if (isSteelMaterial(selectedMat)) newUnit = 'Kg';
    else if (isRingMaterial(selectedMat)) newUnit = 'Pieces';
    else if (isSandMaterial(selectedMat)) newUnit = 'Tons';
    else if (isBlueMetalMaterial(selectedMat)) newUnit = 'Tons';
    else if (isBrickOrBlockMaterial(selectedMat)) newUnit = 'Pieces';

    setFormData((prev) => ({
      ...prev,
      materialName: selectedMat,
      unit: newUnit,
      description: `${selectedMat} Purchase`,
    }));
  };

  const handleAddRow = () => {
    setMaterialItems([
      ...materialItems,
      createDefaultRow(formData.materialName),
    ]);
  };

  const handleRemoveRow = (rowId) => {
    if (materialItems.length === 1) {
      // Keep at least one row, just reset fields
      setMaterialItems([createDefaultRow(formData.materialName)]);
    } else {
      setMaterialItems(materialItems.filter((item) => item.id !== rowId));
    }
  };

  const handleRowChange = (rowId, field, value) => {
    setMaterialItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== rowId) return item;
        const updated = { ...item, [field]: value };

        // Auto-calculate Steel weight when length or steelType changes
        if (isSteelMaterial(formData.materialName)) {
          if (field === 'length' || field === 'steelType') {
            const currentType = field === 'steelType' ? value : (item.steelType || '12 mm');
            const currentLen = field === 'length' ? value : item.length;
            if (currentLen && parseFloat(currentLen) > 0) {
              const calcWeight = calculateSteelWeight(currentType, currentLen);
              updated.weight = calcWeight;
              const rowRate = parseFloat(updated.rate) || parseFloat(formData.rate) || 0;
              if (rowRate > 0 && calcWeight) {
                updated.amount = String(Math.round(parseFloat(calcWeight) * rowRate));
              }
            } else if (!currentLen) {
              updated.weight = '';
            }
          } else if (field === 'weight' || field === 'rate') {
            const w = parseFloat(field === 'weight' ? value : updated.weight) || 0;
            const r = parseFloat(field === 'rate' ? value : updated.rate) || 0;
            if (w > 0 && r > 0) {
              updated.amount = String(Math.round(w * r));
            }
          }
        } else {
          // Non-steel materials: auto-calculate Amount = Quantity * Price per Unit
          if (field === 'quantity' || field === 'rate') {
            const q = parseFloat(field === 'quantity' ? value : updated.quantity) || 0;
            const r = parseFloat(field === 'rate' ? value : updated.rate) || 0;
            if (q > 0 && r > 0) {
              updated.amount = String(Math.round(q * r));
            }
          }
        }

        return updated;
      })
    );
  };

  const handleLabourTabSwitch = (mode) => {
    if (mode === 'EXISTING') {
      const first = labourList[0];
      if (first) {
        setFormData((prev) => ({
          ...prev,
          labourEntryMode: 'EXISTING',
          isGroupLabour: false,
          selectedLabourId: first._id || first.id,
          manualLabourName: first.name,
          labourType: first.workerType || 'Mason',
          labourWorkersCount: '1',
          labourDays: '1',
          labourDailyWage: String(first.dailyWage ?? 800),
          labourOtRate: String(first.overtimeRate ?? 100),
          labourOtHours: '0',
          labourExtraAmount: '0',
          supplier: first.name,
          labourContractor: first.name,
          description: `${first.name} - ${first.workerType || 'Labour'} Wages`,
        }));
      } else {
        setFormData((prev) => ({ ...prev, labourEntryMode: 'EXISTING', isGroupLabour: false }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        labourEntryMode: 'NEW',
        selectedLabourId: '__MANUAL__',
        manualLabourName: '',
        labourWorkersCount: '1',
        labourDays: '1',
        labourDailyWage: '800',
        labourOtRate: '100',
        labourOtHours: '0',
        labourExtraAmount: '0',
        supplier: 'Direct Labour',
        description: `${prev.labourType || 'Mason'} Daily Wages`,
      }));
    }
  };

  const handleSelectLabourer = (selectedId) => {
    const worker = labourList.find((w) => (w._id || w.id) === selectedId);
    if (worker) {
      setFormData((prev) => ({
        ...prev,
        labourEntryMode: 'EXISTING',
        isGroupLabour: false,
        selectedLabourId: selectedId,
        manualLabourName: worker.name,
        labourType: worker.workerType || prev.labourType,
        labourWorkersCount: '1',
        labourDays: '1',
        labourDailyWage: String(worker.dailyWage ?? 800),
        labourOtRate: String(worker.overtimeRate ?? 100),
        labourOtHours: '0',
        labourExtraAmount: '0',
        supplier: worker.name,
        labourContractor: worker.name,
        description: `${worker.name} - ${worker.workerType || 'Labour'} Wages`,
      }));
    }
  };

  const handlePaymentStatusChange = (newStatus) => {
    setPaymentError('');
    setFormData((prev) => ({
      ...prev,
      paymentStatus: newStatus,
      paymentMethod: newStatus === 'Pending' ? '' : (prev.paymentMethod || 'Cash'),
      partialPaidAmount: newStatus === 'Partial' ? prev.partialPaidAmount : '',
    }));
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setScreenshotName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotPreview(null);
    setScreenshotName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving.current) return;
    setSaveError('');
    setPaymentError('');
    if (!formData.description) return;

    if (mainTab === 'Expenses' && formData.category === 'Rental') {
      const rRate = parseFloat(formData.rentalRate);
      if (isNaN(rRate) || rRate <= 0) {
        setPaymentError('Rental rate must be greater than 0 (decimals like 0.1 or 0.2 are allowed).');
        return;
      }
    }

    // Validate Payment Status & Partial Payment
    if (formData.paymentStatus !== 'Pending' && !formData.paymentMethod) {
      setPaymentError('Please select a payment method (Cash or UPI).');
      return;
    }

    let finalPaid = finalExpenseAmount;
    let finalPending = 0;
    if (formData.paymentStatus === 'Pending') {
      finalPaid = 0;
      finalPending = finalExpenseAmount;
    } else if (formData.paymentStatus === 'Partial') {
      const pAmt = parseFloat(formData.partialPaidAmount);
      if (isNaN(pAmt) || pAmt <= 0) {
        setPaymentError('Enter a valid partial payment amount greater than ₹0.');
        return;
      }
      if (pAmt >= finalExpenseAmount) {
        setPaymentError(
          `Partial payment must be less than total billing amount (₹${finalExpenseAmount.toLocaleString('en-IN')}). Select "Paid" for full payment.`
        );
        return;
      }
      finalPaid = pAmt;
      finalPending = Math.max(0, finalExpenseAmount - pAmt);
    }

    let siteId = formData.siteId;
    let siteName = 'Site';
    let siteCode = '';

    const matched = sitesList.find(
      (s) => `${s.name} (${s.code})` === formData.site || s._id === formData.site || s.name === formData.site
    );
    if (matched) {
      siteId = matched._id;
      siteName = matched.name;
      siteCode = matched.code;
    } else if (formData.site) {
      const siteParts = formData.site.split(' (');
      siteName = siteParts[0] || 'Site';
      siteCode = siteParts[1] ? siteParts[1].replace(')', '') : '';
    }

    const formattedAmount = `₹${finalExpenseAmount.toLocaleString('en-IN')}`;

    const isAdditional = mainTab === 'Additional Work';
    const finalCategory = isAdditional ? 'Additional Work' : formData.category;
    const finalExpenseType = isAdditional ? 'ADDITIONAL_WORK' : 'NORMAL';
    const finalBillable = isAdditional ? Boolean(formData.additionalWorkClientApproved) : false;

    const labourNameResolved =
      formData.category === 'Labour'
        ? (formData.selectedLabourId !== '__MANUAL__'
            ? (labourList.find((w) => (w._id || w.id) === formData.selectedLabourId)?.name || formData.supplier)
            : (formData.manualLabourName || formData.supplier))
        : null;

    const newExpense = {
      id: Date.now().toString(),
      siteId: siteId,
      siteName: siteName,
      siteCode: siteCode,
      date: formData.date,
      category: finalCategory,
      subCategory: formData.category,
      expenseType: finalExpenseType,
      isAdditionalWork: isAdditional,
      billableToClient: finalBillable,
      materialName: formData.category === 'Materials' ? formData.materialName : null,
      description: formData.description || (formData.materialName ? `${formData.materialName} Purchase` : 'Site Expense'),
      supplier: labourNameResolved || formData.supplier || '-',
      supplierName: labourNameResolved || formData.supplier || '-',
      invoiceNo: formData.invoiceNo || '-',
      quantity:
        formData.category === 'Labour'
          ? parseFloat(formData.labourWorkersCount) || 1
          : formData.category === 'Rental'
          ? parseFloat(formData.rentalDuration) || 1
          : parseFloat(formData.quantity) || 1,
      unit:
        formData.category === 'Labour'
          ? 'Workers'
          : formData.category === 'Rental'
          ? formData.rentalUnit || 'Days'
          : formData.unit || 'Bags',
      rate:
        formData.category === 'Labour'
          ? parseFloat(formData.labourDailyWage) || 0
          : formData.category === 'Rental'
          ? parseFloat(formData.rentalRate) || 0
          : parseFloat(formData.rate) || 0,
      amount: finalExpenseAmount,
      calculatedAmount: totalExpenseAmount,
      billingAmount: !isNaN(parsedBillingAmount) && parsedBillingAmount > 0 ? parsedBillingAmount : null,
      formattedAmount,
      materialCost,
      vehicleType: formData.category === 'Materials' ? formData.vehicleType : null,
      rentalAmount: vehicleRental,
      tipsAmount: tips,
      totalExpenseAmount: finalExpenseAmount,
      labourDetails:
        formData.category === 'Labour'
          ? {
              labourId: formData.selectedLabourId !== '__MANUAL__' ? formData.selectedLabourId : null,
              labourName: labourNameResolved || '',
              workerType: formData.labourType,
              dailyWage: parseFloat(formData.labourDailyWage) || 0,
              otRate: parseFloat(formData.labourOtRate) || 0,
              otHours: parseFloat(formData.labourOtHours) || 0,
              otAmount: labourOtAmount,
              extraAmount: labourExtraNum,
            }
          : null,
      paymentStatus: formData.paymentStatus,
      paidAmount: finalPaid,
      pendingAmount: finalPending,
      paymentMethod: formData.paymentStatus === 'Pending' ? '' : formData.paymentMethod,
      transactionId: formData.transactionId ? formData.transactionId.trim() : null,
      paymentScreenshot: screenshotPreview || null,
      notes: formData.notes || '',
      materialItems: isAdditional
        ? addlMaterialItems.map((m) => {
            const qty = parseFloat(m.quantity) || 1;
            const amt = parseFloat(m.amount) || 0;
            return {
              materialName: m.material || 'Material',
              quantity: qty,
              unit: m.unit || 'Units',
              rate: qty > 0 ? Math.round((amt / qty) * 100) / 100 : amt,
              amount: amt,
            };
          })
        : formData.category === 'Materials'
        ? materialItems.map((row) => {
            const qty = parseFloat(row.quantity) || parseFloat(row.weight) || parseFloat(row.length) || 1;
            const amt = parseFloat(row.amount) || 0;
            const rt = parseFloat(row.rate) || (qty > 0 ? Math.round((amt / qty) * 100) / 100 : 0);
            const fallbackUnit =
              isSteelMaterial(formData.materialName) || isRingMaterial(formData.materialName)
                ? 'Kg'
                : formData.unit || 'Units';
            return {
              ...row,
              materialName:
                row.materialName ||
                row.material ||
                row.materialType ||
                row.steelType ||
                row.ringType ||
                row.sandType ||
                formData.materialName ||
                'Material',
              quantity: qty,
              unit: row.unit || fallbackUnit,
              rate: rt,
              amount: amt,
            };
          })
        : [],
      items: isAdditional
        ? addlMaterialItems.map((m) => {
            const qty = parseFloat(m.quantity) || 1;
            const amt = parseFloat(m.amount) || 0;
            return {
              materialName: m.material || 'Material',
              quantity: qty,
              unit: m.unit || 'Units',
              rate: qty > 0 ? Math.round((amt / qty) * 100) / 100 : amt,
              amount: amt,
            };
          })
        : formData.category === 'Materials'
        ? materialItems.map((row) => {
            const qty = parseFloat(row.quantity) || parseFloat(row.weight) || parseFloat(row.length) || 1;
            const amt = parseFloat(row.amount) || 0;
            const rt = parseFloat(row.rate) || (qty > 0 ? Math.round((amt / qty) * 100) / 100 : 0);
            const fallbackUnit =
              isSteelMaterial(formData.materialName) || isRingMaterial(formData.materialName)
                ? 'Kg'
                : formData.unit || 'Units';
            return {
              materialName:
                row.materialName ||
                row.material ||
                row.materialType ||
                row.steelType ||
                row.ringType ||
                row.sandType ||
                formData.materialName ||
                'Material',
              quantity: qty,
              unit: row.unit || fallbackUnit,
              rate: rt,
              amount: amt,
            };
          })
        : [],
    };

    saving.current = true;
    setIsSaving(true);
    try {
      submissionKey.current ||= globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      await onAddExpense({ ...newExpense, submissionKey: submissionKey.current });
      onClose();
    } catch (error) {
      setSaveError(error.message || 'Could not save this record.');
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
        >
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden"
          >
            {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center shadow-xs shrink-0">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Add Expense</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Record a new expense for a construction site.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Top 2 Primary Tabs: Expenses (Normal Contract) vs Additional Work (Client Extra) */}
        <div className="grid grid-cols-2 p-2.5 bg-slate-100/90 border-b border-slate-200/90 gap-2.5">
          {/* Tab 1: Expenses */}
          <button
            type="button"
            onClick={() => setMainTab('Expenses')}
            className={`flex items-center justify-center gap-3 py-3 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              mainTab === 'Expenses'
                ? 'bg-white text-emerald-900 shadow-sm border border-emerald-300 ring-2 ring-emerald-500/15'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                mainTab === 'Expenses'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                  : 'bg-slate-200/80 text-slate-500'
              }`}
            >
              <Wallet size={16} />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-[13px] leading-tight flex items-center gap-1.5">
                <span>Expenses</span>
                {mainTab === 'Expenses' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                Normal Contract Expenses
              </div>
            </div>
          </button>

          {/* Tab 2: Additional Work Expenses */}
          <button
            type="button"
            onClick={() => setMainTab('Additional Work')}
            className={`flex items-center justify-center gap-3 py-3 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              mainTab === 'Additional Work'
                ? 'bg-white text-purple-950 shadow-sm border border-purple-300 ring-2 ring-purple-500/15'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                mainTab === 'Additional Work'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs'
                  : 'bg-slate-200/80 text-slate-500'
              }`}
            >
              <Zap size={16} />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-[13px] leading-tight flex items-center gap-1.5">
                <span>Additional Work</span>
                {mainTab === 'Additional Work' && (
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                )}
              </div>
              <div className="text-[10px] text-purple-700 font-semibold mt-0.5">
                Additional Work Expenses
              </div>
            </div>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="px-7 py-5 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Top Notice Banner: Normal Contract vs Additional Work */}
          {mainTab === 'Expenses' ? (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-950">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <span className="font-black text-emerald-900">Normal Contract Expenses:</span>{' '}
                  <span className="text-slate-600 font-medium">For all regular construction expenses covered under the original contract/budget.</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                Contract Budget
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl bg-purple-50/90 border border-purple-200 text-xs gap-3">
              <div className="flex items-center gap-2.5 text-purple-950">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 shadow-2xs">
                  <Zap size={16} />
                </div>
                <div>
                  <span className="font-black text-purple-900">Additional Work Expenses:</span>{' '}
                  <span className="text-slate-600 font-medium">Extra construction work requested by the client beyond the original contract.</span>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-900 bg-white border border-purple-300 px-3.5 py-1.5 rounded-xl shrink-0 shadow-2xs hover:bg-purple-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.additionalWorkClientApproved}
                  onChange={(e) => setFormData({ ...formData, additionalWorkClientApproved: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Billable to Client (Approved Extra)</span>
              </label>
            </div>
          )}

              {/* Section 1: Expense Details */}
              <div className="space-y-3">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                  mainTab === 'Additional Work'
                    ? 'bg-purple-50 border border-purple-300 text-purple-800'
                    : 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                }`}>
                  <Layers size={13} />
                  <span>{mainTab === 'Additional Work' ? 'Additional Expense Details' : 'Expense Details'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Category Dropdown (Materials, Labour, Rental, Other Expenses) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Expense Category <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      <select
                        value={formData.category === 'Additional Work' ? 'Materials' : formData.category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full appearance-none pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                      >
                        <option value="Materials">Materials</option>
                        <option value="Labour">Labour</option>
                        <option value="Rental">Rental</option>
                        <option value="Other">Other Expenses</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

              {/* Construction Site (Locked when accessed from Site Detail Page) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Construction Site <span className="text-rose-500">*</span>
                </label>
                {lockedSite ? (
                  <div className="flex items-center gap-2 pl-3.5 pr-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 shadow-2xs">
                    <Building2 size={14} className={mainTab === 'Additional Work' ? 'text-purple-600 shrink-0' : 'text-emerald-600 shrink-0'} />
                    <span className="truncate">{lockedSite}</span>
                    <span className={`ml-auto text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      mainTab === 'Additional Work'
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      Locked
                    </span>
                  </div>
                ) : (
                  <div className="relative">
                    <Building2
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                    />
                    <select
                      value={formData.site}
                      onChange={(e) => {
                        const val = e.target.value;
                        const match = sitesList.find((s) => s._id === val || `${s.name} (${s.code})` === val);
                        setFormData({
                          ...formData,
                          site: match ? `${match.name} (${match.code})` : val,
                          siteId: match ? match._id : '',
                        });
                      }}
                      className="w-full appearance-none pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                    >
                      {Array.isArray(sitesList) && sitesList.length > 0 ? (
                        sitesList.map((s) => (
                          <option key={s._id || s.id} value={`${s.name} (${s.code})`}>
                            {s.name} ({s.code})
                          </option>
                        ))
                      ) : (
                        <option value="">No sites available (Create a site first)</option>
                      )}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                    />
                  </div>
                )}
              </div>

              {/* Expense Date */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Expense Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Description & Item Quick Select */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {formData.category === 'Materials' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Construction Material <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.materialName || 'Cement'}
                      onChange={(e) => handleMaterialChange(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                    >
                      {CONSTRUCTION_MATERIALS.map((mat) => (
                        <option key={mat} value={mat}>
                          {mat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              )}

              {formData.category === 'Labour' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Labour / Worker Role <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.labourType || 'Mason'}
                      onChange={(e) => {
                        const role = e.target.value;
                        setFormData({
                          ...formData,
                          labourType: role,
                          description: `${role} Daily Wages`,
                        });
                      }}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer"
                    >
                      {LABOUR_WORKER_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              )}

              <div className={formData.category === 'Materials' || formData.category === 'Labour' ? '' : 'sm:col-span-2'}>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={1}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Cement - 50 Bags"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Material Details Table (Only shown for Materials category) */}
          {formData.category === 'Materials' && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
                  <Package size={13} />
                  <span>
                    {isSteelMaterial(formData.materialName)
                      ? 'Steel Specifications & Rod Breakdown'
                      : isRingMaterial(formData.materialName)
                      ? 'Steel Ring Breakdown'
                      : isSandMaterial(formData.materialName)
                      ? `${formData.materialName} Breakdown`
                      : isBlueMetalMaterial(formData.materialName)
                      ? `${formData.materialName} Breakdown`
                      : isBrickOrBlockMaterial(formData.materialName)
                      ? 'Brick & Block Quantity Breakdown'
                      : 'Material Breakdown'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <Plus size={13} />
                  <span>Add Item</span>
                </button>
              </div>

              {/* Table Container */}
              <div className="rounded-2xl border border-slate-300 bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                        {isSteelMaterial(formData.materialName) && (
                          <>
                            <th className="py-3 px-3 w-36">Steel Type</th>
                            <th className="py-3 px-3">Length (ft)</th>
                            <th className="py-3 px-3">Weight (kg)</th>
                            <th className="py-3 px-3">Amount (₹)</th>
                            <th className="py-3 px-2 w-12 text-center">Action</th>
                          </>
                        )}

                        {isRingMaterial(formData.materialName) && (
                          <>
                            <th className="py-3 px-3 w-36">Ring Type</th>
                            <th className="py-3 px-3">Quantity (Pcs)</th>
                            <th className="py-3 px-3">Weight (kg)</th>
                            <th className="py-3 px-3">Amount (₹)</th>
                            <th className="py-3 px-2 w-12 text-center">Action</th>
                          </>
                        )}

                        {isSandMaterial(formData.materialName) && (
                          <>
                            <th className="py-3 px-3 w-40">Sand Type</th>
                            <th className="py-3 px-3">Quantity (Tons)</th>
                            <th className="py-3 px-3">Price / Ton (₹)</th>
                            <th className="py-3 px-3">Calculated (₹)</th>
                            <th className="py-3 px-2 w-12 text-center">Action</th>
                          </>
                        )}

                        {isBlueMetalMaterial(formData.materialName) && (
                          <>
                            <th className="py-3 px-3 w-44">Material Type</th>
                            <th className="py-3 px-3">Quantity (Tons)</th>
                            <th className="py-3 px-3">Price / Ton (₹)</th>
                            <th className="py-3 px-3">Calculated (₹)</th>
                            <th className="py-3 px-2 w-12 text-center">Action</th>
                          </>
                        )}

                        {isBrickOrBlockMaterial(formData.materialName) && (
                          <>
                            <th className="py-3 px-3 w-44">Material Type</th>
                            <th className="py-3 px-3">Quantity (Nos)</th>
                            <th className="py-3 px-3">Price / Unit (₹)</th>
                            <th className="py-3 px-3">Calculated (₹)</th>
                            <th className="py-3 px-2 w-12 text-center">Action</th>
                          </>
                        )}

                        {!isSteelMaterial(formData.materialName) &&
                          !isRingMaterial(formData.materialName) &&
                          !isSandMaterial(formData.materialName) &&
                          !isBlueMetalMaterial(formData.materialName) &&
                          !isBrickOrBlockMaterial(formData.materialName) && (
                            <>
                              <th className="py-3 px-3 w-40">Material</th>
                              <th className="py-3 px-3">Quantity</th>
                              <th className="py-3 px-3 w-24">Unit</th>
                              <th className="py-3 px-3">Price / Unit (₹)</th>
                              <th className="py-3 px-3">Calculated (₹)</th>
                              <th className="py-3 px-2 w-12 text-center">Action</th>
                            </>
                          )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {materialItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* STEEL ROW */}
                          {isSteelMaterial(formData.materialName) && (
                            <>
                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <select
                                    value={item.steelType || '12 mm'}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'steelType', e.target.value)
                                    }
                                    className="w-full appearance-none px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 pr-7 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                                  >
                                    {STEEL_TYPES.map((st) => (
                                      <option key={st} value={st}>
                                        {st}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown
                                    size={12}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Rod length (ft)"
                                  value={item.length || ''}
                                  onChange={(e) =>
                                    handleRowChange(item.id, 'length', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Weight (kg)"
                                  value={item.weight || ''}
                                  onChange={(e) =>
                                    handleRowChange(item.id, 'weight', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-emerald-50/50 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                  title="Auto-calculated from Length (ft). You can also edit manually."
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder="Amount"
                                    value={item.amount || ''}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'amount', e.target.value)
                                    }
                                    className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(item.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </>
                          )}

                          {/* RINGS ROW */}
                          {isRingMaterial(formData.materialName) && (
                            <>
                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <select
                                    value={item.ringType || '8 mm'}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'ringType', e.target.value)
                                    }
                                    className="w-full appearance-none px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 pr-7 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                                  >
                                    {RING_TYPES.map((rt) => (
                                      <option key={rt} value={rt}>
                                        {rt}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown
                                    size={12}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Quantity (Pcs)"
                                  value={item.quantity || ''}
                                  onChange={(e) =>
                                    handleRowChange(item.id, 'quantity', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Weight (kg)"
                                  value={item.weight || ''}
                                  onChange={(e) =>
                                    handleRowChange(item.id, 'weight', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder="Amount"
                                    value={item.amount || ''}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'amount', e.target.value)
                                    }
                                    className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(item.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </>
                          )}

                          {/* SAND ROW */}
                          {isSandMaterial(formData.materialName) && (
                            <>
                              <td className="py-2.5 px-3">
                                <span className="font-bold text-slate-900 px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg block truncate">
                                  {item.sandType || formData.materialName}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Quantity (Tons)"
                                  value={item.quantity || ''}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onChange={(e) =>
                                    handleRowChange(item.id, 'quantity', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Price / Ton"
                                  value={item.rate || ''}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onChange={(e) =>
                                    handleRowChange(item.id, 'rate', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder="Amount"
                                    value={item.amount || ''}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'amount', e.target.value)
                                    }
                                    className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(item.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </>
                          )}

                          {/* BLUE METAL ROW */}
                          {isBlueMetalMaterial(formData.materialName) && (
                            <>
                              <td className="py-2.5 px-3">
                                <span className="font-bold text-slate-900 px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg block truncate">
                                  {item.materialType || formData.materialName}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Quantity (Tons)"
                                  value={item.quantity || ''}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onChange={(e) =>
                                    handleRowChange(item.id, 'quantity', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Price / Ton"
                                  value={item.rate || ''}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onChange={(e) =>
                                    handleRowChange(item.id, 'rate', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder="Amount"
                                    value={item.amount || ''}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'amount', e.target.value)
                                    }
                                    className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(item.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </>
                          )}

                          {/* BRICKS & BLOCKS ROW */}
                          {isBrickOrBlockMaterial(formData.materialName) && (
                            <>
                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <select
                                    value={item.materialType || formData.materialName}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'materialType', e.target.value)
                                    }
                                    className="w-full appearance-none px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 pr-7 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                                  >
                                    {BRICK_BLOCK_TYPES.map((bt) => (
                                      <option key={bt} value={bt}>
                                        {bt}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown
                                    size={12}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Qty (Nos)"
                                  value={item.quantity || ''}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onChange={(e) =>
                                    handleRowChange(item.id, 'quantity', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Price / Unit"
                                  value={item.rate || ''}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onChange={(e) =>
                                    handleRowChange(item.id, 'rate', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder="Amount"
                                    value={item.amount || ''}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'amount', e.target.value)
                                    }
                                    className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(item.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </>
                          )}

                          {/* OTHER / GENERAL ROW */}
                          {!isSteelMaterial(formData.materialName) &&
                            !isRingMaterial(formData.materialName) &&
                            !isSandMaterial(formData.materialName) &&
                            !isBlueMetalMaterial(formData.materialName) &&
                            !isBrickOrBlockMaterial(formData.materialName) && (
                              <>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="text"
                                    placeholder="Material"
                                    value={item.material || formData.materialName}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'material', e.target.value)
                                    }
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                  />
                                </td>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder="Quantity"
                                    value={item.quantity || ''}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'quantity', e.target.value)
                                    }
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                  />
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="relative">
                                    <select
                                      value={item.unit || 'Bags'}
                                      onChange={(e) =>
                                        handleRowChange(item.id, 'unit', e.target.value)
                                      }
                                      className="w-full appearance-none px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 pr-7 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                                    >
                                      <option value="Bags">Bags</option>
                                      <option value="Loads">Loads</option>
                                      <option value="Tons">Tons</option>
                                      <option value="Kg">Kg</option>
                                      <option value="Pieces">Pieces</option>
                                      <option value="Cu. ft">Cu. ft</option>
                                      <option value="Liters">Liters</option>
                                      <option value="Boxes">Boxes</option>
                                    </select>
                                    <ChevronDown
                                      size={12}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                                    />
                                  </div>
                                </td>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder="Price / Unit"
                                    value={item.rate || ''}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'rate', e.target.value)
                                    }
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                  />
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                      ₹
                                    </span>
                                    <input
                                      type="number"
                                      step="any"
                                      placeholder="Amount"
                                      value={item.amount || ''}
                                      onWheel={(e) => e.currentTarget.blur()}
                                      onChange={(e) =>
                                        handleRowChange(item.id, 'amount', e.target.value)
                                      }
                                      className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                    />
                                  </div>
                                </td>
                                <td className="py-2.5 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRow(item.id)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Delete item"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </>
                            )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer with Summary */}
                <div className="px-4 py-3 bg-slate-100/90 border-t border-slate-300 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-slate-700 font-semibold">
                      Total Items entered: <strong className="text-slate-900 font-extrabold">{materialItems.length}</strong>
                    </span>
                    {isSteelMaterial(formData.materialName) && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300">
                        <span>Total Steel Weight:</span>
                        <strong className="font-black">
                          {materialItems
                            .reduce((sum, it) => sum + (parseFloat(it.weight) || 0), 0)
                            .toFixed(2)}{' '}
                          Kg
                        </strong>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700 font-bold">Table Total:</span>
                    <span className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-xs">
                      ₹{' '}
                      {materialItems
                        .reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0)
                        .toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Civil Engineering Formula Callout for Steel */}
              {isSteelMaterial(formData.materialName) && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-slate-600">
                  <Info size={14} className="text-emerald-600 shrink-0" />
                  <span>
                    <strong>Auto-Calculation Formula:</strong> Weight is auto-calculated using civil engineering standard{' '}
                    <code className="px-1.5 py-0.5 bg-white rounded border border-emerald-300 font-mono font-bold text-emerald-800">
                      W = (D² × L) / 162.2
                    </code>{' '}
                    (e.g., 12 mm × 40 ft = <strong>10.83 kg</strong>, 16 mm × 40 ft = <strong>19.28 kg</strong>).
                  </span>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              SECTION 2: DYNAMIC DETAILS BY CATEGORY
              ========================================================================= */}

          {/* 1. MATERIALS: Purchase & Supplier Details + Transportation */}
          {formData.category === 'Materials' && (
            <>
              {/* Purchase Details */}
              <div className="space-y-3 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-extrabold">
                  <ShoppingCart size={13} />
                  <span>Purchase & Supplier Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Supplier / Vendor
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="e.g. Sri Cement Traders"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Invoice / Bill No. <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <FileSpreadsheet size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="e.g. INV-1042 / Cash Memo"
                        value={formData.invoiceNo || ''}
                        onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Transportation Expenses for Materials */}
              <div className="space-y-3 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-extrabold">
                  <Truck size={13} />
                  <span>Transportation & Vehicle Rental (Optional)</span>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 shadow-xs space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Vehicle Type
                      </label>
                      <div className="relative">
                        <select
                          value={formData.vehicleType}
                          onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                          className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer shadow-2xs"
                        >
                          {vehicleTypeOptions.map((vt) => (
                            <option key={vt} value={vt}>
                              {vt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Rental Amount (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">₹</span>
                        <input
                          type="number"
                          step="any"
                          placeholder="0.00"
                          value={formData.rentalAmount}
                          onChange={(e) => setFormData({ ...formData, rentalAmount: e.target.value })}
                          className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <div className="max-w-sm">
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Driver Tips (₹) <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">₹</span>
                        <input
                          type="number"
                          step="any"
                          placeholder="0.00"
                          value={formData.tipsAmount}
                          onChange={(e) => setFormData({ ...formData, tipsAmount: e.target.value })}
                          className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 2. LABOUR: Dedicated Labour Deployment & Daily Wages Section */}
          {formData.category === 'Labour' && (
            <div className="space-y-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-300 text-blue-800 text-xs font-extrabold">
                <User size={13} />
                <span>Labour Deployment & Daily Wages</span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 shadow-xs space-y-4">
                {/* Two Selection Tabs: Existing Labour vs + New Labour */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleLabourTabSwitch('EXISTING')}
                    className={`py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      formData.labourEntryMode === 'EXISTING'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-white/70'
                    }`}
                  >
                    Existing Labour
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLabourTabSwitch('NEW')}
                    className={`py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      formData.labourEntryMode === 'NEW'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-white/70'
                    }`}
                  >
                    + New Labour
                  </button>
                </div>

                {/* Tab 1: Existing Labour Selection */}
                {formData.labourEntryMode === 'EXISTING' ? (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-900">
                        Select Labour <span className="text-rose-500">*</span>
                      </label>
                      {formData.labourType && (
                        <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Role: {formData.labourType}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <select
                        value={formData.selectedLabourId}
                        onChange={(e) => handleSelectLabourer(e.target.value)}
                        className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-950 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer"
                      >
                        {labourList.length === 0 ? (
                          <option value="">No registered labourers found</option>
                        ) : (
                          labourList.map((w) => (
                            <option key={w._id || w.id} value={w._id || w.id}>
                              {w.name} ({w.workerType} · ₹{Number(w.dailyWage || 0).toLocaleString('en-IN')}/day)
                            </option>
                          ))
                        )}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                    </div>
                    <p className="text-[11px] font-semibold text-blue-700 mt-1.5 flex items-center gap-1">
                      <Lock size={11} />
                      <span>Salary and OT rate synced from Labour module</span>
                    </p>
                  </div>
                ) : (
                  /* Tab 2: + New Labour (One-time manual entry) */
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1.5">
                          Labour Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Murugan"
                          value={formData.manualLabourName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({
                              ...formData,
                              manualLabourName: val,
                              supplier: val || 'Direct Labour',
                              description: val
                                ? `${val} - ${formData.labourType || 'Labour'} Wages`
                                : `${formData.labourType || 'Mason'} Daily Wages`,
                            });
                          }}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1.5">
                          Worker Role <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={formData.labourType || 'Mason'}
                            onChange={(e) => {
                              const role = e.target.value;
                              setFormData({
                                ...formData,
                                labourType: role,
                                description: formData.manualLabourName
                                  ? `${formData.manualLabourName} - ${role} Wages`
                                  : `${role} Daily Wages`,
                              });
                            }}
                            className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-950 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer"
                          >
                            {LABOUR_WORKER_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Group / Contractor Toggle (Only shown when applicable) */}
                    <div className="pt-1">
                      <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.isGroupLabour}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData({
                              ...formData,
                              isGroupLabour: checked,
                              labourWorkersCount: checked ? formData.labourWorkersCount || '2' : '1',
                            });
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Group / Contractor-based labour (multiple workers)</span>
                      </label>
                    </div>

                    {formData.isGroupLabour && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1.5">
                            Contractor / Team Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Raja Contractor Team"
                            value={formData.labourContractor}
                            onChange={(e) =>
                              setFormData({ ...formData, labourContractor: e.target.value, supplier: e.target.value })
                            }
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1.5">
                            No. of Workers <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={formData.labourWorkersCount}
                            onKeyDown={blockNegativeKeys}
                            onWheel={(e) => e.currentTarget.blur()}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                labourWorkersCount: sanitizeNonNegative(e.target.value) || '1',
                              })
                            }
                            className={`w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${noSpinnerClass}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Group 1: Daily Wages */}
                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-2.5">
                  <div className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                    Daily Wages
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-900">
                          Daily Salary (₹) <span className="text-rose-500">*</span>
                        </label>
                        {formData.labourEntryMode === 'EXISTING' && (
                          <span className="text-[10px] font-bold text-blue-700 flex items-center gap-0.5">
                            <Lock size={9} /> Read-only
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-600">₹</span>
                        <input
                          type="number"
                          min="1"
                          readOnly={formData.labourEntryMode === 'EXISTING'}
                          value={formData.labourDailyWage}
                          onKeyDown={blockNegativeKeys}
                          onWheel={(e) => e.currentTarget.blur()}
                          onChange={(e) => {
                            const val = sanitizeNonNegative(e.target.value);
                            setFormData({ ...formData, labourDailyWage: val, rate: val });
                          }}
                          className={`w-full pl-8 pr-3.5 py-2.5 border rounded-xl text-xs font-extrabold focus:outline-none shadow-2xs ${noSpinnerClass} ${
                            formData.labourEntryMode === 'EXISTING'
                              ? 'bg-slate-100 border-slate-300 text-slate-700 cursor-not-allowed'
                              : 'bg-white border-slate-300 text-slate-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1.5">
                        Working Days <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        placeholder="1"
                        value={formData.labourDays}
                        onKeyDown={blockNegativeKeys}
                        onWheel={(e) => e.currentTarget.blur()}
                        onChange={(e) =>
                          setFormData({ ...formData, labourDays: sanitizeNonNegative(e.target.value) })
                        }
                        className={`w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-extrabold text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs ${noSpinnerClass}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Group 2: Overtime & Additional Expenses */}
                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-2.5">
                  <div className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                    Overtime & Additional Expenses
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-900">OT Rate / Hr (₹)</label>
                        {formData.labourEntryMode === 'EXISTING' && (
                          <Lock size={10} className="text-blue-600" />
                        )}
                      </div>
                      <input
                        type="number"
                        min="0"
                        readOnly={formData.labourEntryMode === 'EXISTING'}
                        value={formData.labourOtRate}
                        onKeyDown={blockNegativeKeys}
                        onWheel={(e) => e.currentTarget.blur()}
                        onChange={(e) =>
                          setFormData({ ...formData, labourOtRate: sanitizeNonNegative(e.target.value) })
                        }
                        className={`w-full px-3 py-2.5 border rounded-xl text-xs font-extrabold focus:outline-none ${noSpinnerClass} ${
                          formData.labourEntryMode === 'EXISTING'
                            ? 'bg-slate-100 border-slate-300 text-slate-700 cursor-not-allowed'
                            : 'bg-white border-slate-300 text-slate-950 focus:ring-2 focus:ring-blue-500/20'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1.5">OT Hours</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="0"
                        value={formData.labourOtHours}
                        onKeyDown={blockNegativeKeys}
                        onWheel={(e) => e.currentTarget.blur()}
                        onChange={(e) =>
                          setFormData({ ...formData, labourOtHours: sanitizeNonNegative(e.target.value) })
                        }
                        className={`w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-extrabold text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${noSpinnerClass}`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1.5">Extra Amount (₹)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.labourExtraAmount}
                        onKeyDown={blockNegativeKeys}
                        onWheel={(e) => e.currentTarget.blur()}
                        onChange={(e) =>
                          setFormData({ ...formData, labourExtraAmount: sanitizeNonNegative(e.target.value) })
                        }
                        className={`w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-extrabold text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${noSpinnerClass}`}
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Tea, snacks, coffee, etc.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1.5">OT Amount</label>
                      <div className="px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-black text-blue-900">
                        ₹ {labourOtAmount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clear Summary Breakdown */}
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-700 font-semibold">
                    <span>Daily wages</span>
                    <span className="font-bold text-slate-900">₹ {labourBaseSalary.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-700 font-semibold">
                    <span>Overtime</span>
                    <span className="font-bold text-slate-900">₹ {labourOtAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-700 font-semibold">
                    <span>Extra expenses</span>
                    <span className="font-bold text-slate-900">₹ {labourExtraNum.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-blue-200 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-950">Total Labour Expense</span>
                    <span className="text-base font-black text-blue-950">
                      ₹ {(labourBaseSalary + labourOtAmount + labourExtraNum).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. RENTAL: Machinery & Equipment Rental Section */}
          {formData.category === 'Rental' && (
            <div className="space-y-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-extrabold">
                <Truck size={13} />
                <span>Machinery & Equipment Rental</span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Machinery Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Equipment / Vehicle <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.rentalEquipment || 'JCB / Excavator'}
                        onChange={(e) => {
                          const eq = e.target.value;
                          const dur = formData.rentalDuration || '1';
                          const u = formData.rentalUnit || 'Days';
                          setFormData({
                            ...formData,
                            rentalEquipment: eq,
                            description: `${eq} Rental (${dur} ${u})`,
                          });
                        }}
                        className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 pr-8 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 shadow-2xs cursor-pointer"
                      >
                        {rentalEquipmentOptions.map((eq) => (
                          <option key={eq} value={eq}>
                            {eq}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Vendor / Owner Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Vendor / Owner Name
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="e.g. Kovai Earthmovers"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value, rentalVendor: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Duration */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Usage / Duration <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="1"
                      value={formData.rentalDuration}
                      onChange={(e) => {
                        const dur = e.target.value;
                        const eq = formData.rentalEquipment || 'JCB / Excavator';
                        const u = formData.rentalUnit || 'Days';
                        setFormData({
                          ...formData,
                          rentalDuration: dur,
                          quantity: dur,
                          description: `${eq} Rental (${dur} ${u})`,
                        });
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 shadow-2xs"
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Unit <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.rentalUnit}
                        onChange={(e) => {
                          const u = e.target.value;
                          const eq = formData.rentalEquipment || 'JCB / Excavator';
                          const dur = formData.rentalDuration || '1';
                          setFormData({
                            ...formData,
                            rentalUnit: u,
                            unit: u,
                            description: `${eq} Rental (${dur} ${u})`,
                          });
                        }}
                        className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 pr-8 shadow-2xs cursor-pointer"
                      >
                        {rentalUnitOptions.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Rate per Unit */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Rate per {formData.rentalUnit || 'Day'} (₹) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">₹</span>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        required
                        placeholder="3000"
                        value={formData.rentalRate}
                        onWheel={(e) => e.target.blur()}
                        onKeyDown={(e) => {
                          if (['-', '+', 'e', 'E'].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val !== '' && Number(val) < 0) return;
                          setFormData({ ...formData, rentalRate: val, rate: val });
                        }}
                        className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 shadow-2xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. OTHER MISCELLANEOUS EXPENSES (Inside Expenses Tab) */}
          {mainTab === 'Expenses' && formData.category === 'Other' && (
            <div className="space-y-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-800 text-xs font-extrabold">
                <FileEdit size={13} />
                <span>Miscellaneous Expense Details</span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Paid To / Vendor
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="e.g. Service Provider / Vendor"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-600 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Total Expense Amount (₹) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">₹</span>
                      <input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={formData.customAmount}
                        onChange={(e) => setFormData({ ...formData, customAmount: e.target.value })}
                        className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-600 shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Expense Calculation */}
          <div className="space-y-3 pt-2">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
              mainTab === 'Additional Work'
                ? 'bg-purple-50 border border-purple-300 text-purple-800'
                : 'bg-emerald-50 border border-emerald-300 text-emerald-800'
            }`}>
              <Calculator size={13} />
              <span>{mainTab === 'Additional Work' ? 'Additional Work Calculation' : 'Expense Calculation'}</span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 shadow-xs space-y-4">
              <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Expense Summary
              </div>

              {/* Dynamic Summary Items based on Category */}
              <div className="space-y-2.5 text-xs">
                {formData.category === 'Materials' && (
                  <>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-bold">Material Cost</span>
                      <span className="font-extrabold text-slate-900">
                        ₹ {(Number(materialCost) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-bold">Vehicle Rental</span>
                      <span className="font-extrabold text-slate-900">
                        ₹ {(Number(vehicleRental) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-bold">Tips</span>
                      <span className="font-extrabold text-slate-900">
                        ₹ {(Number(tips) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </>
                )}

                {formData.category === 'Labour' && (
                  <>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-bold">Labour Role & Headcount</span>
                      <span className="font-extrabold text-slate-900">
                        {formData.labourType || 'Mason'} ({formData.labourWorkersCount || 1} Workers × {formData.labourDays || 1} Days)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-bold">Daily Wage Rate</span>
                      <span className="font-extrabold text-slate-900">
                        ₹ {(parseFloat(formData.labourDailyWage) || 0).toLocaleString('en-IN')} / worker
                      </span>
                    </div>
                  </>
                )}

                {formData.category === 'Rental' && (
                  <>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-bold">Machinery / Equipment</span>
                      <span className="font-extrabold text-slate-900">
                        {formData.rentalEquipment || 'Equipment'} ({formData.rentalDuration || 1} {formData.rentalUnit || 'Days'})
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-bold">Rental Rate</span>
                      <span className="font-extrabold text-slate-900">
                        ₹ {(parseFloat(formData.rentalRate) || 0).toLocaleString('en-IN')} per {formData.rentalUnit || 'Day'}
                      </span>
                    </div>
                  </>
                )}

                {(formData.category === 'Additional Work' || formData.category === 'Other') && (
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-bold">Category</span>
                    <span className="font-extrabold text-slate-900">
                      {formData.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Calculated Amount (For Calculation Reference & Verification) */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Calculated Amount (Reference)
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">
                    {mainTab === 'Additional Work'
                      ? (formData.addlPricingMode === 'metering'
                          ? `Metered Area: ${formData.additionalWorkQty || 1} ${formData.additionalWorkUnit || 'Sq.Ft'} × ₹${formData.additionalWorkRate || 0}`
                          : 'Calculated from Breakdown')
                      : formData.category === 'Materials'
                      ? 'Material Cost + Vehicle Rental + Tips'
                      : formData.category === 'Labour'
                      ? 'Salary + OT Amount + Extra Amount'
                      : formData.category === 'Rental'
                      ? 'Equipment Rate × Duration'
                      : 'Calculated Expense Amount'}
                  </div>
                </div>
                <span className="text-base font-black text-slate-800 tracking-tight">
                  ₹ {(Number(totalExpenseAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Actual Billing Information */}
              <div className="pt-1 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Billing Amount (Manual Entry)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">₹</span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      placeholder="Enter actual bill amount (e.g. 5800)..."
                      value={formData.billingAmount}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) => setFormData({ ...formData, billingAmount: e.target.value })}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    Leave empty to use Calculated Amount, or enter the actual bill amount to record it as the Final Expense Amount.
                  </p>
                </div>

                {/* Final Actual Expense Amount Highlight */}
                <div className={`flex items-center justify-between px-4 py-3.5 rounded-xl border-2 ${
                  mainTab === 'Additional Work'
                    ? 'bg-purple-50 border-purple-300'
                    : 'bg-emerald-50 border-emerald-300'
                }`}>
                  <div>
                    <div className={`text-xs font-black ${mainTab === 'Additional Work' ? 'text-purple-950' : 'text-emerald-950'}`}>
                      Final Expense Amount (Recorded)
                    </div>
                    <div className={`text-[11px] font-semibold ${mainTab === 'Additional Work' ? 'text-purple-800' : 'text-emerald-800'}`}>
                      {!isNaN(parsedBillingAmount) && parsedBillingAmount > 0
                        ? 'Using manually entered Billing Amount'
                        : 'Using Calculated Amount'}
                    </div>
                  </div>
                  <span className={`text-xl font-black tracking-tight ${mainTab === 'Additional Work' ? 'text-purple-950' : 'text-emerald-950'}`}>
                    ₹ {(Number(finalExpenseAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Information */}
          <div className="space-y-3 pt-2">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
              mainTab === 'Additional Work'
                ? 'bg-purple-50 border border-purple-300 text-purple-800'
                : 'bg-emerald-50 border border-emerald-300 text-emerald-800'
            }`}>
              <CreditCard size={13} />
              <span>Payment Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Status Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Payment Status <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <CheckCircle2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => handlePaymentStatusChange(e.target.value)}
                    className="w-full appearance-none pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Payment Method Radio Selection (Disabled when Pending) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Payment Method {formData.paymentStatus !== 'Pending' && <span className="text-rose-500">*</span>}
                  </label>
                  {formData.paymentStatus === 'Pending' && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Disabled (Pending)
                    </span>
                  )}
                </div>
                <div className={`flex items-center gap-3 ${formData.paymentStatus === 'Pending' ? 'opacity-45 pointer-events-none select-none' : ''}`}>
                  {/* Cash Option */}
                  <button
                    type="button"
                    disabled={formData.paymentStatus === 'Pending'}
                    onClick={() => setFormData({ ...formData, paymentMethod: 'Cash' })}
                    className={`flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                      formData.paymentStatus !== 'Pending' && formData.paymentMethod === 'Cash'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold'
                        : 'border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-medium'
                    }`}
                  >
                    {formData.paymentStatus !== 'Pending' && formData.paymentMethod === 'Cash' ? (
                      <CheckCircle2 size={16} className="text-emerald-600 fill-emerald-600 text-white shrink-0" />
                    ) : (
                      <Circle size={16} className="text-slate-400 shrink-0" />
                    )}
                    <Banknote size={15} />
                    <span className="text-xs font-bold">Cash</span>
                  </button>

                  {/* UPI Option */}
                  <button
                    type="button"
                    disabled={formData.paymentStatus === 'Pending'}
                    onClick={() => setFormData({ ...formData, paymentMethod: 'UPI' })}
                    className={`flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                      formData.paymentStatus !== 'Pending' && formData.paymentMethod === 'UPI'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold'
                        : 'border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-medium'
                    }`}
                  >
                    {formData.paymentStatus !== 'Pending' && formData.paymentMethod === 'UPI' ? (
                      <CheckCircle2 size={16} className="text-emerald-600 fill-emerald-600 text-white shrink-0" />
                    ) : (
                      <Circle size={16} className="text-slate-400 shrink-0" />
                    )}
                    <Send size={14} className="rotate-45" />
                    <span className="text-xs font-bold">UPI</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Partial Payment Breakdown */}
            {formData.paymentStatus === 'Partial' && (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
                  <div>
                    <div className="text-[11px] font-bold text-slate-600 mb-1">Total Billing Amount</div>
                    <div className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-900">
                      ₹ {finalExpenseAmount.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Amount Paid Now (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      max={finalExpenseAmount > 1 ? finalExpenseAmount - 1 : undefined}
                      placeholder="e.g. 3000"
                      value={formData.partialPaidAmount}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) => {
                        setPaymentError('');
                        setFormData({ ...formData, partialPaidAmount: e.target.value });
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-blue-300 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-amber-800 mb-1">Outstanding Amount</div>
                    <div className="px-3.5 py-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs font-black text-amber-900">
                      ₹ {remainingOutstanding.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Transaction ID & Payment Screenshot (Both Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Transaction ID Text Field */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Transaction ID <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. UPI / Ref / TXN-2026110199"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-1">UPI reference or bank transaction number</p>
              </div>

              {/* Payment Screenshot Image Upload Field */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Payment Screenshot <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="hidden"
                  id="payment-screenshot-input"
                />

                {!screenshotPreview ? (
                  <label
                    htmlFor="payment-screenshot-input"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl text-xs cursor-pointer transition-colors group shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <Upload size={14} />
                    </div>
                    <div className="flex-1 truncate">
                      <div className="font-bold text-slate-800 group-hover:text-emerald-700">Upload screenshot</div>
                      <div className="text-[11px] text-slate-500 truncate">PNG, JPG or receipt photo</div>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-emerald-50/70 border border-emerald-300 rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={screenshotPreview}
                        alt="Screenshot Preview"
                        className="w-10 h-10 object-cover rounded-lg border border-emerald-300 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{screenshotName || 'Screenshot uploaded'}</div>
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-bold">
                          <CheckCircle2 size={12} />
                          <span>Ready</span>
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notes (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Notes (Optional)
              </label>
              <div className="relative">
                <FileEdit size={14} className="absolute left-3 top-3 text-slate-500" />
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional notes here..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            {saveError && <p role="alert" className="text-xs font-semibold text-rose-700">{saveError}</p>}
            <button
              type="submit"
              disabled={isSaving}
              className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                mainTab === 'Additional Work'
                  ? 'bg-purple-700 hover:bg-purple-800 shadow-purple-700/20'
                  : 'bg-[#008744] hover:bg-[#00743a] shadow-emerald-700/20'
              }`}
            >
              <Plus size={15} />
              <span>{mainTab === 'Additional Work' ? 'Add Additional Work Expense' : 'Add Expense'}</span>
            </button>
          </div>
        </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
