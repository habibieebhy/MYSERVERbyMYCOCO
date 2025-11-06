//  server/src/routes/dataSync/dealers.ts 
import { Request, Response, Express } from 'express';
import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { db } from '../../db/db';
import { dealers } from '../../db/schema';

// --- IMPORTANT ---
// This assumes your central schema file is at this path
// and exports 'dealerBaseSchema' and 'toDateOnlyString'.
import {
  dealerInputSchema,
  toDateOnlyString,
} from '../formSubmissionRoutes/addDealer';

// 1. Define the schema for the INCOMING BULK ARRAY
// It's an array of partial dealer objects...
const bulkDealerSyncSchema = z.array(
  dealerInputSchema
    .omit({ radius: true }) // 1. Remove 'radius' field, it's not in the DB
    .extend({ // 2. Override fields for this specific route
      gstinNo: z // 3. Make 'gstinNo' required (it's optional in dealerInputSchema)
        .string()
        .min(1, { message: 'gstinNo is required for bulk sync' }),
    })
);

// Helper type
type BulkDealerInput = z.infer<typeof bulkDealerSyncSchema>;

/**
 * Sets up the bulk dealer sync endpoint.
 */
export default function setupDealerSyncRoutes(app: Express) {
  
  app.post('/api/sync/dealers-bulk', async (req: Request, res: Response) => {
    try {
      // 2. Validate the entire incoming array
      // This will now use your smart coercion (e.g., "" -> null)
      const dealersToSync: BulkDealerInput = bulkDealerSyncSchema.parse(
        req.body
      );

      if (dealersToSync.length === 0) {
        return res
          .status(400)
          .json({ success: false, error: 'No dealers provided in the array.' });
      }

      console.log(
        `[Data Sync] Starting bulk upsert for ${dealersToSync.length} dealers...`
      );

      // 3. Map data for Drizzle (using logic from your POST route)
      const valuesToInsert = dealersToSync.map((d) => ({
        ...d,
        // Convert dates to 'YYYY-MM-DD' strings
        dateOfBirth: toDateOnlyString(d.dateOfBirth),
        anniversaryDate: toDateOnlyString(d.anniversaryDate),
        declarationDate: toDateOnlyString(d.declarationDate),

        // Convert numeric/decimal types to string for Drizzle
        latitude: d.latitude != null ? String(d.latitude) : null,
        longitude: d.longitude != null ? String(d.longitude) : null,
        totalPotential: String(d.totalPotential),
        bestPotential: String(d.bestPotential),
        salesGrowthPercentage: d.salesGrowthPercentage
          ? String(d.salesGrowthPercentage)
          : null,
        monthlySaleMT: d.monthlySaleMT ? String(d.monthlySaleMT) : null,
        projectedMonthlySalesBestCementMT: d.projectedMonthlySalesBestCementMT
          ? String(d.projectedMonthlySalesBestCementMT)
          : null,
      }));

      // 4. The Bulk "Upsert" Query (PostgreSQL)
      const result = await db
        .insert(dealers)
        .values(valuesToInsert)
        .onConflictDoUpdate({ // this is the UPSERT command in drizzle
          // The column with the UNIQUE constraint
          target: dealers.gstinNo,

          // The fields to update if a conflict happens
          set: {
            // --- List ALL fields you want to update from the Tally file ---
            userId: sql.raw(`excluded."user_id"`),
            type: sql.raw(`excluded."type"`),
            parentDealerId: sql.raw(`excluded."parent_dealer_id"`),
            name: sql.raw(`excluded."name"`),
            region: sql.raw(`excluded."region"`),
            area: sql.raw(`excluded."area"`),
            phoneNo: sql.raw(`excluded."phone_no"`),
            address: sql.raw(`excluded."address"`),
            pinCode: sql.raw(`excluded."pinCode"`),
            latitude: sql.raw(`excluded."latitude"`),
            longitude: sql.raw(`excluded."longitude"`),
            dateOfBirth: sql.raw(`excluded."dateOfBirth"`),
            anniversaryDate: sql.raw(`excluded."anniversaryDate"`),
            totalPotential: sql.raw(`excluded."total_potential"`),
            bestPotential: sql.raw(`excluded."best_potential"`),
            brandSelling: sql.raw(`excluded."brand_selling"`),
            feedbacks: sql.raw(`excluded."feedbacks"`),
            remarks: sql.raw(`excluded."remarks"`),
            dealerDevelopmentStatus: sql.raw(
              `excluded."dealerdevelopmentstatus"`
            ),
            dealerDevelopmentObstacle: sql.raw(
              `excluded."dealerdevelopmentobstacle"`
            ),
            verificationStatus: sql.raw(`excluded."verification_status"`),
            whatsappNo: sql.raw(`excluded."whatsapp_no"`),
            emailId: sql.raw(`excluded."email_id"`),
            businessType: sql.raw(`excluded."business_type"`),
            panNo: sql.raw(`excluded."pan_no"`),
            tradeLicNo: sql.raw(`excluded."trade_lic_no"`),
            aadharNo: sql.raw(`excluded."aadhar_no"`),
            godownSizeSqFt: sql.raw(`excluded."godown_size_sqft"`),
            godownCapacityMTBags: sql.raw(
              `excluded."godown_capacity_mt_bags"`
            ),
            godownAddressLine: sql.raw(`excluded."godown_address_line"`),
            godownLandMark: sql.raw(`excluded."godown_landmark"`),
            godownDistrict: sql.raw(`excluded."godown_district"`),
            godownArea: sql.raw(`excluded."godown_area"`),
            godownRegion: sql.raw(`excluded."godown_region"`),
            godownPinCode: sql.raw(`excluded."godown_pincode"`),
            residentialAddressLine: sql.raw(
              `excluded."residential_address_line"`
            ),
            residentialLandMark: sql.raw(`excluded."residential_landmark"`),
            residentialDistrict: sql.raw(`excluded."residential_district"`),
            residentialArea: sql.raw(`excluded."residential_area"`),
            residentialRegion: sql.raw(`excluded."residential_region"`),
            residentialPinCode: sql.raw(`excluded."residential_pincode"`),
            bankAccountName: sql.raw(`excluded."bank_account_name"`),
            bankName: sql.raw(`excluded."bank_name"`),
            bankBranchAddress: sql.raw(`excluded."bank_branch_address"`),
            bankAccountNumber: sql.raw(`excluded."bank_account_number"`),
            bankIfscCode: sql.raw(`excluded."bank_ifsc_code"`),
            brandName: sql.raw(`excluded."brand_name"`),
            monthlySaleMT: sql.raw(`excluded."monthly_sale_mt"`),
            noOfDealers: sql.raw(`excluded."no_of_dealers"`),
            areaCovered: sql.raw(`excluded."area_covered"`),
            projectedMonthlySalesBestCementMT: sql.raw(
              `excluded."projected_monthly_sales_best_cement_mt"`
            ),
            noOfEmployeesInSales: sql.raw(`excluded."no_of_employees_in_sales"`),
            declarationName: sql.raw(`excluded."declaration_name"`),
            declarationPlace: sql.raw(`excluded."declaration_place"`),
            declarationDate: sql.raw(`excluded."declaration_date"`),
            salesGrowthPercentage: sql.raw(
              `excluded."sales_growth_percentage"`
            ),
            nameOfFirm: sql.raw(`excluded."nameOfFirm"`),
            underSalesPromoterName: sql.raw(
              `excluded."underSalesPromoterName"`
            ),
            noOfPJP: sql.raw(`excluded."no_of_pjp"`),
            
            // --- ALWAYS update the timestamp ---
            updatedAt: new Date(),
          },
        })
        .returning({
          id: dealers.id,
          gstinNo: dealers.gstinNo,
          name: dealers.name,
        });

      res.status(200).json({
        success: true,
        message: `Bulk sync complete. ${result.length} dealers processed (updated or inserted).`,
        data: result,
      });

    } catch (error) {
      // 5. Handle Errors (matching your POST route's style)
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message,
            code: i.code,
          })) 
        });
      }
      
      console.error('[Data Sync] Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to sync dealers',
        details: (error as Error)?.message ?? 'Unknown error',
      });
    }
  });

  console.log('✅ Dealer Bulk Sync POST endpoint setup complete.');
}