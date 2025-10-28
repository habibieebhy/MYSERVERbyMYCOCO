// server/src/routes/postRoutes/salesOrders.ts
// Sales Orders POST endpoint aligned to new sales_orders schema

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { salesOrders } from '../../db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { InferInsertModel } from 'drizzle-orm';

type SalesOrderInsert = InferInsertModel<typeof salesOrders>;

// ---------- helpers ----------
const toYYYYMMDD = (v: unknown): string | null => {
  if (v == null || v === '') return null;
  if (typeof v === 'string') {
    // assume already date-like; normalize to YYYY-MM-DD if includes time
    const d = new Date(v);
    if (Number.isNaN(+d)) return v; // let DB complain if totally invalid
    return d.toISOString().slice(0, 10);
  }
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return null;
};

// NUMERIC(…) columns in Postgres via Drizzle are safest as strings.
// We accept number|string|null in payload and store string|null.
const toDecimalString = (v: unknown): string | null => {
  if (v == null || v === '') return null;
  const n = typeof v === 'string' ? Number(v) : (v as number);
  if (!Number.isFinite(n)) return String(v); // if it's already a numeric-like string, pass through
  return String(n);
};

const nullIfEmpty = (v: unknown): string | null =>
  v == null || (typeof v === 'string' && v.trim() === '') ? null : String(v);

// ---------- input schema (lenient/coercing) ----------
const salesOrderInputSchema = z.object({
  // Relations
  userId: z.coerce.number().int().optional().nullable(),
  dealerId: z.string().max(255).optional().nullable().or(z.literal('')),
  dvrId: z.string().max(255).optional().nullable().or(z.literal('')),
  pjpId: z.string().max(255).optional().nullable().or(z.literal('')),

  // Business
  orderDate: z.union([z.string(), z.date()]),
  orderPartyName: z.string().min(1, 'orderPartyName is required'),

  // Party details
  partyPhoneNo: z.string().optional().nullable().or(z.literal('')),
  partyArea: z.string().optional().nullable().or(z.literal('')),
  partyRegion: z.string().optional().nullable().or(z.literal('')),
  partyAddress: z.string().optional().nullable().or(z.literal('')),

  // Delivery
  deliveryDate: z.union([z.string(), z.date()]).optional().nullable(),
  deliveryArea: z.string().optional().nullable().or(z.literal('')),
  deliveryRegion: z.string().optional().nullable().or(z.literal('')),
  deliveryAddress: z.string().optional().nullable().or(z.literal('')),
  deliveryLocPincode: z.string().optional().nullable().or(z.literal('')),

  // Payment (numbers or strings)
  paymentMode: z.string().optional().nullable().or(z.literal('')),
  paymentTerms: z.string().optional().nullable().or(z.literal('')),
  paymentAmount: z.union([z.string(), z.number()]).optional().nullable(),
  receivedPayment: z.union([z.string(), z.number()]).optional().nullable(),
  receivedPaymentDate: z.union([z.string(), z.date()]).optional().nullable(),
  pendingPayment: z.union([z.string(), z.number()]).optional().nullable(),

  // Qty & unit
  orderQty: z.union([z.string(), z.number()]).optional().nullable(),
  orderUnit: z.string().max(20).optional().nullable().or(z.literal('')), // "MT" | "BAGS"

  // Pricing & discounts
  itemPrice: z.union([z.string(), z.number()]).optional().nullable(),
  discountPercentage: z.union([z.string(), z.number()]).optional().nullable(),
  itemPriceAfterDiscount: z.union([z.string(), z.number()]).optional().nullable(),

  // Product classification
  itemType: z.string().max(20).optional().nullable().or(z.literal('')), // "PPC" | "OPC"
  itemGrade: z.string().max(10).optional().nullable().or(z.literal('')),  // "33" | "43" | "53"
});

// ---------- route factory ----------
function createAutoCRUD(app: Express, config: {
  endpoint: string,
  table: typeof salesOrders,
  tableName: string,
  autoFields?: Record<string, () => any>
}) {
  const { endpoint, table, tableName, autoFields = {} } = config;

  app.post(`/api/${endpoint}`, async (req: Request, res: Response) => {
    try {
      // Run auto fields
      const executedAutoFields: Record<string, any> = {};
      for (const [k, fn] of Object.entries(autoFields)) executedAutoFields[k] = fn();

      // Validate/coerce
      const input = salesOrderInputSchema.parse(req.body);

      // Normalize IDs (empty string -> null)
      const dealerId = input.dealerId === '' ? null : input.dealerId ?? null;
      const dvrId = input.dvrId === '' ? null : input.dvrId ?? null;
      const pjpId = input.pjpId === '' ? null : input.pjpId ?? null;

      // Dates -> YYYY-MM-DD
      const orderDate = toYYYYMMDD(input.orderDate);
      if (!orderDate) {
        return res.status(400).json({ success: false, error: 'orderDate is invalid' });
      }
      const deliveryDate = toYYYYMMDD(input.deliveryDate ?? null);
      const receivedPaymentDate = toYYYYMMDD(input.receivedPaymentDate ?? null);

      // Numerics -> string for NUMERIC columns
      const paymentAmountStr = toDecimalString(input.paymentAmount);
      const receivedPaymentStr = toDecimalString(input.receivedPayment);
      let pendingPaymentStr = toDecimalString(input.pendingPayment);

      const orderQtyStr = toDecimalString(input.orderQty);
      const itemPriceStr = toDecimalString(input.itemPrice);
      const discountPctStr = toDecimalString(input.discountPercentage);
      let itemPriceAfterDiscountStr = toDecimalString(input.itemPriceAfterDiscount);

      // Compute pendingPayment if not provided
      if (pendingPaymentStr == null && paymentAmountStr != null && receivedPaymentStr != null) {
        const pa = Number(paymentAmountStr);
        const rp = Number(receivedPaymentStr);
        if (Number.isFinite(pa) && Number.isFinite(rp)) {
          pendingPaymentStr = String(pa - rp);
        }
      }

      // Compute itemPriceAfterDiscount if not provided and both inputs are present
      if (itemPriceAfterDiscountStr == null && itemPriceStr != null && discountPctStr != null) {
        const p = Number(itemPriceStr);
        const d = Number(discountPctStr);
        if (Number.isFinite(p) && Number.isFinite(d)) {
          itemPriceAfterDiscountStr = String(p * (1 - d / 100));
        }
      }

      // Build final insert
      const generatedId = randomUUID();
      const now = new Date();

      const insertData: SalesOrderInsert = {
        id: generatedId,

        // FKs
        userId: input.userId ?? null,
        dealerId,
        dvrId,
        pjpId,

        // Core
        orderDate,
        orderPartyName: input.orderPartyName,

        // Party
        partyPhoneNo: nullIfEmpty(input.partyPhoneNo),
        partyArea: nullIfEmpty(input.partyArea),
        partyRegion: nullIfEmpty(input.partyRegion),
        partyAddress: nullIfEmpty(input.partyAddress),

        // Delivery
        deliveryDate,
        deliveryArea: nullIfEmpty(input.deliveryArea),
        deliveryRegion: nullIfEmpty(input.deliveryRegion),
        deliveryAddress: nullIfEmpty(input.deliveryAddress),
        deliveryLocPincode: nullIfEmpty(input.deliveryLocPincode),

        // Payment
        paymentMode: nullIfEmpty(input.paymentMode),
        paymentTerms: nullIfEmpty(input.paymentTerms),
        paymentAmount: paymentAmountStr,
        receivedPayment: receivedPaymentStr,
        receivedPaymentDate,
        pendingPayment: pendingPaymentStr,

        // Qty & unit
        orderQty: orderQtyStr,
        orderUnit: nullIfEmpty(input.orderUnit),

        // Pricing & discount
        itemPrice: itemPriceStr,
        discountPercentage: discountPctStr,
        itemPriceAfterDiscount: itemPriceAfterDiscountStr,

        // Product
        itemType: nullIfEmpty(input.itemType),
        itemGrade: nullIfEmpty(input.itemGrade),

        createdAt: now as any,
        updatedAt: now as any,
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
    autoFields: {
      createdAt: () => new Date(),
      updatedAt: () => new Date(),
    },
  });
  console.log('✅ Sales Orders POST endpoint aligned to new schema');
}
