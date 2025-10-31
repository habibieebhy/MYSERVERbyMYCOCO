// server/src/routes/postRoutes/salesOrders.ts
// --- UPDATED to include 'status' ---

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { salesOrders } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { InferInsertModel } from 'drizzle-orm';

type SalesOrderInsert = InferInsertModel<typeof salesOrders>;

// ---------- helpers (Copied from your file) ----------
const toYYYYMMDD = (v: unknown): string | null => {
  if (v == null || v === '') return null;
  if (typeof v === 'string') {
    const d = new Date(v);
    if (Number.isNaN(+d)) return v; 
    return d.toISOString().slice(0, 10);
  }
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return null;
};
const toDecimalString = (v: unknown): string | null => {
  if (v == null || v === '') return null;
  const n = typeof v === 'string' ? Number(v) : (v as number);
  if (!Number.isFinite(n)) return String(v);
  return String(n);
};
const nullIfEmpty = (v: unknown): string | null =>
  v == null || (typeof v === 'string' && v.trim() === '') ? null : String(v);

// ---------- input schema UPDATED ----------
const salesOrderInputSchema = z.object({
  // Relations
  userId: z.coerce.number().int().optional().nullable(),
  dealerId: z.string().max(255).optional().nullable().or(z.literal('')),
  dvrId: z.string().max(255).optional().nullable().or(z.literal('')),
  pjpId: z.string().max(255).optional().nullable().or(z.literal('')),

  // Business
  orderDate: z.union([z.string(), z.date()]),
  orderPartyName: z.string().min(1, 'orderPartyName is required'),

  // ... (all other fields) ...
  partyPhoneNo: z.string().optional().nullable().or(z.literal('')),
  partyArea: z.string().optional().nullable().or(z.literal('')),
  partyRegion: z.string().optional().nullable().or(z.literal('')),
  partyAddress: z.string().optional().nullable().or(z.literal('')),
  deliveryDate: z.union([z.string(), z.date()]).optional().nullable(),
  deliveryArea: z.string().optional().nullable().or(z.literal('')),
  deliveryRegion: z.string().optional().nullable().or(z.literal('')),
  deliveryAddress: z.string().optional().nullable().or(z.literal('')),
  deliveryLocPincode: z.string().optional().nullable().or(z.literal('')),
  paymentMode: z.string().optional().nullable().or(z.literal('')),
  paymentTerms: z.string().optional().nullable().or(z.literal('')),
  paymentAmount: z.union([z.string(), z.number()]).optional().nullable(),
  receivedPayment: z.union([z.string(), z.number()]).optional().nullable(),
  receivedPaymentDate: z.union([z.string(), z.date()]).optional().nullable(),
  pendingPayment: z.union([z.string(), z.number()]).optional().nullable(),
  orderQty: z.union([z.string(), z.number()]).optional().nullable(),
  orderUnit: z.string().max(20).optional().nullable().or(z.literal('')),
  itemPrice: z.union([z.string(), z.number()]).optional().nullable(),
  discountPercentage: z.union([z.string(), z.number()]).optional().nullable(),
  itemPriceAfterDiscount: z.union([z.string(), z.number()]).optional().nullable(),
  itemType: z.string().max(20).optional().nullable().or(z.literal('')),
  itemGrade: z.string().max(10).optional().nullable().or(z.literal('')),

  // --- ✅ FIX ---
  status: z.string().max(50).optional().default('Pending'), // Added status
  // --- END FIX ---
});

// ... (rest of the file) ...

function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: typeof salesOrders,
  tableName: string,
}) {
  const { endpoint, table, tableName } = config;

  app.post(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      const input = salesOrderInputSchema.parse(req.body);

      // Normalize IDs
      const dealerId = input.dealerId === '' ? null : input.dealerId ?? null;
      const dvrId = input.dvrId === '' ? null : input.dvrId ?? null;
      const pjpId = input.pjpId === '' ? null : input.pjpId ?? null;

      // Dates
      const orderDate = toYYYYMMDD(input.orderDate);
      if (!orderDate) {
        return res.status(400).json({ success: false, error: 'orderDate is invalid' });
      }
      const deliveryDate = toYYYYMMDD(input.deliveryDate ?? null);
      const receivedPaymentDate = toYYYYMMDD(input.receivedPaymentDate ?? null);

      // Numerics
      const paymentAmountStr = toDecimalString(input.paymentAmount);
      const receivedPaymentStr = toDecimalString(input.receivedPayment);
      let pendingPaymentStr = toDecimalString(input.pendingPayment);
      const orderQtyStr = toDecimalString(input.orderQty);
      const itemPriceStr = toDecimalString(input.itemPrice);
      const discountPctStr = toDecimalString(input.discountPercentage);
      let itemPriceAfterDiscountStr = toDecimalString(input.itemPriceAfterDiscount);

      // Computed fields
      if (pendingPaymentStr == null && paymentAmountStr != null && receivedPaymentStr != null) {
        const pa = Number(paymentAmountStr);
        const rp = Number(receivedPaymentStr);
        if (Number.isFinite(pa) && Number.isFinite(rp)) {
          pendingPaymentStr = String(pa - rp);
        }
      }
      if (itemPriceAfterDiscountStr == null && itemPriceStr != null && discountPctStr != null) {
        const p = Number(itemPriceStr);
        const d = Number(discountPctStr);
        if (Number.isFinite(p) && Number.isFinite(d)) {
          itemPriceAfterDiscountStr = String(p * (1 - d / 100));
        }
      }

      const insertData: SalesOrderInsert = {
        id: randomUUID(),
        userId: input.userId ?? null,
        dealerId,
        dvrId,
        pjpId,
        orderDate,
        orderPartyName: input.orderPartyName,
        partyPhoneNo: nullIfEmpty(input.partyPhoneNo),
        partyArea: nullIfEmpty(input.partyArea),
        partyRegion: nullIfEmpty(input.partyRegion),
        partyAddress: nullIfEmpty(input.partyAddress),
        deliveryDate,
        deliveryArea: nullIfEmpty(input.deliveryArea),
        deliveryRegion: nullIfEmpty(input.deliveryRegion),
        deliveryAddress: nullIfEmpty(input.deliveryAddress),
        deliveryLocPincode: nullIfEmpty(input.deliveryLocPincode),
        paymentMode: nullIfEmpty(input.paymentMode),
        paymentTerms: nullIfEmpty(input.paymentTerms),
        paymentAmount: paymentAmountStr,
        receivedPayment: receivedPaymentStr,
        receivedPaymentDate,
        pendingPayment: pendingPaymentStr,
        orderQty: orderQtyStr,
        orderUnit: nullIfEmpty(input.orderUnit),
        itemPrice: itemPriceStr,
        discountPercentage: discountPctStr,
        itemPriceAfterDiscount: itemPriceAfterDiscountStr,
        itemType: nullIfEmpty(input.itemType),
        itemGrade: nullIfEmpty(input.itemGrade),
        
        // --- ✅ FIX ---
        status: input.status, // Add status to insert
        // --- END FIX ---
        
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [row] = await db.insert(table).values(insertData).returning();

      return res.status(201).json({
        success: true,
        message: `${tableName} created successfully`,
        data: row,
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues?.map(i => ({
            field: i.path.join('.'),
            message: i.message,
            code: i.code,
          })) ?? [],
        });
      }
      return res.status(500).json({
        success: false,
        error: `Failed to create ${tableName}`,
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });
}

export default function setupSalesOrdersPostRoutes(app: Express) {
  createAutoCRUD(app, {
    endpoint: 'sales-orders',
    table: salesOrders,
    tableName: 'Sales Order',
  });
  console.log('✅ Sales Orders POST endpoint (with status) ready');
}