// server/src/routes/updateRoutes/salesOrders.ts
// Sales Orders PATCH — partial updates, safe coercions, computed fields

import { Request, Response, Express } from 'express';
import { db } from '../../db/db';
import { salesOrders } from '../../db/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { InferInsertModel } from 'drizzle-orm';

type SalesOrderInsert = InferInsertModel<typeof salesOrders>;

// ---------- helpers (mirrored from POST) ----------
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

// --- Zod schema for PATCH (all fields optional) ---
const salesOrderPatchSchema = z.object({
  userId: z.coerce.number().int().optional().nullable(),
  dealerId: z.string().max(255).optional().nullable().or(z.literal('')),
  dvrId: z.string().max(255).optional().nullable().or(z.literal('')),
  pjpId: z.string().max(255).optional().nullable().or(z.literal('')),
  orderDate: z.union([z.string(), z.date()]).optional(),
  orderPartyName: z.string().min(1).optional(),
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
}).strict();


export default function setupSalesOrdersPatchRoutes(app: Express) {
  
  app.patch('/api/sales-orders/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // 1. Validate the incoming data
      const input = salesOrderPatchSchema.parse(req.body);

      if (Object.keys(input).length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update' });
      }

      // 2. Check if the order exists
      const [existing] = await db.select().from(salesOrders).where(eq(salesOrders.id, id)).limit(1);

      if (!existing) {
        return res.status(404).json({ success: false, error: `Sales Order with ID '${id}' not found.` });
      }

      // 3. Build the patch object, converting types
      const patch: any = {};
      
      // Relations
      if (input.userId !== undefined) patch.userId = input.userId;
      if (input.dealerId !== undefined) patch.dealerId = nullIfEmpty(input.dealerId);
      if (input.dvrId !== undefined) patch.dvrId = nullIfEmpty(input.dvrId);
      if (input.pjpId !== undefined) patch.pjpId = nullIfEmpty(input.pjpId);

      // Core
      if (input.orderDate !== undefined) patch.orderDate = toYYYYMMDD(input.orderDate);
      if (input.orderPartyName !== undefined) patch.orderPartyName = input.orderPartyName;

      // Party
      if (input.partyPhoneNo !== undefined) patch.partyPhoneNo = nullIfEmpty(input.partyPhoneNo);
      if (input.partyArea !== undefined) patch.partyArea = nullIfEmpty(input.partyArea);
      if (input.partyRegion !== undefined) patch.partyRegion = nullIfEmpty(input.partyRegion);
      if (input.partyAddress !== undefined) patch.partyAddress = nullIfEmpty(input.partyAddress);

      // Delivery
      if (input.deliveryDate !== undefined) patch.deliveryDate = toYYYYMMDD(input.deliveryDate);
      if (input.deliveryArea !== undefined) patch.deliveryArea = nullIfEmpty(input.deliveryArea);
      if (input.deliveryRegion !== undefined) patch.deliveryRegion = nullIfEmpty(input.deliveryRegion);
      if (input.deliveryAddress !== undefined) patch.deliveryAddress = nullIfEmpty(input.deliveryAddress);
      if (input.deliveryLocPincode !== undefined) patch.deliveryLocPincode = nullIfEmpty(input.deliveryLocPincode);
      
      // Payment
      if (input.paymentMode !== undefined) patch.paymentMode = nullIfEmpty(input.paymentMode);
      if (input.paymentTerms !== undefined) patch.paymentTerms = nullIfEmpty(input.paymentTerms);
      if (input.paymentAmount !== undefined) patch.paymentAmount = toDecimalString(input.paymentAmount);
      if (input.receivedPayment !== undefined) patch.receivedPayment = toDecimalString(input.receivedPayment);
      if (input.receivedPaymentDate !== undefined) patch.receivedPaymentDate = toYYYYMMDD(input.receivedPaymentDate);
      
      // Qty & unit
      if (input.orderQty !== undefined) patch.orderQty = toDecimalString(input.orderQty);
      if (input.orderUnit !== undefined) patch.orderUnit = nullIfEmpty(input.orderUnit);

      // Pricing & discount
      if (input.itemPrice !== undefined) patch.itemPrice = toDecimalString(input.itemPrice);
      if (input.discountPercentage !== undefined) patch.discountPercentage = toDecimalString(input.discountPercentage);
      
      // Product
      if (input.itemType !== undefined) patch.itemType = nullIfEmpty(input.itemType);
      if (input.itemGrade !== undefined) patch.itemGrade = nullIfEmpty(input.itemGrade);

      // --- Computed Logic ---
      
      // Re-compute itemPriceAfterDiscount if relevant fields are present
      const p = input.itemPrice !== undefined ? patch.itemPrice : existing.itemPrice;
      const d = input.discountPercentage !== undefined ? patch.discountPercentage : existing.discountPercentage;
      if (input.itemPriceAfterDiscount !== undefined) {
        patch.itemPriceAfterDiscount = toDecimalString(input.itemPriceAfterDiscount);
      } else if (input.itemPrice !== undefined || input.discountPercentage !== undefined) {
        if (p != null && d != null) {
          patch.itemPriceAfterDiscount = String(Number(p) * (1 - Number(d) / 100));
        }
      }

      // Re-compute pendingPayment if relevant fields are present
      const pa = input.paymentAmount !== undefined ? patch.paymentAmount : existing.paymentAmount;
      const rp = input.receivedPayment !== undefined ? patch.receivedPayment : existing.receivedPayment;
      if (input.pendingPayment !== undefined) {
        patch.pendingPayment = toDecimalString(input.pendingPayment);
      } else if (input.paymentAmount !== undefined || input.receivedPayment !== undefined) {
        if (pa != null && rp != null) {
          patch.pendingPayment = String(Number(pa) - Number(rp));
        }
      }
      // --- End Computed Logic ---

      patch.updatedAt = new Date(); // Always touch updatedAt

      // 4. Perform the update
      const [updated] = await db
        .update(salesOrders)
        .set(patch)
        .where(eq(salesOrders.id, id))
        .returning();

      res.json({
        success: true,
        message: 'Sales Order updated successfully',
        data: updated,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
      }
      
      console.error('Update Sales Order error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update sales order',
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });

  console.log('✅ Sales Orders PATCH endpoint setup complete');
}