SCHEMAS

Company

Table: companies

Fields:
  - id: serial (int) (PK)
  - companyName: string(255) (not null)
  - officeAddress: text (string) (not null)
  - isHeadOffice: boolean (not null) (default true)
  - phoneNumber: string(50) (not null)
  - region: text (string)
  - area: text (string)
  - adminUserId: string(255) (not null) (unique)
  - createdAt: timestamp (default now)
  - updatedAt: timestamp (default now)
  - workosOrganizationId: string(255) (unique)

AuthSession

Table: auth_sessions

Fields:
  - sessionId: uuid (PK) (default random)
  - masonId: uuid (not null) → masonPcSide.id
  - sessionToken: text (string) (not null) (unique)
  - createdAt: timestamp (not null) (default now)
  - expiresAt: timestamp

User

Table: users

Fields:
  - id: serial (int) (PK)
  - workosUserId: string(255) (unique)
  - companyId: int (not null) → companies.id
  - email: string(255) (not null)
  - firstName: string(255)
  - lastName: string(255)
  - role: string(255) (not null)
  - createdAt: timestamp (default now)
  - updatedAt: timestamp (default now)
  - phoneNumber: string(50)
  - inviteToken: string(255) (unique)
  - status: string(50) (not null) (default "active")
  - region: string(255)
  - area: string(255)
  - salesmanLoginId: string(255) (unique)
  - hashedPassword: text (string)
  - isTechnicalRole: boolean (default false)
  - techLoginId: string(255) (unique)
  - techHashedPassword: text (string)
  - reportsToId: int → users.id
  - noOfPJP: int
  - siteId: uuid → technicalSites.id

TsoMeeting

Table: tso_meetings

Fields:
  - id: string(255) (PK) (default fn)
  - type: string(100) (not null)
  - date: date (not null)
  - location: string(500) (not null)
  - budgetAllocated: numeric(12, 2)
  - participantsCount: int
  - createdByUserId: int (not null) → users.id
  - siteId: uuid → technicalSites.id
  - createdAt: timestamp (not null) (default now)
  - updatedAt: timestamp (default now)

PermanentJourneyPlan

Table: permanent_journey_plans

Fields:
  - id: string(255) (PK) (default random_uuid)
  - userId: int (not null) → users.id
  - createdById: int (not null) → users.id
  - dealerId: string(255) → dealers.id
  - planDate: date (not null)
  - areaToBeVisited: string(500) (not null)
  - description: string(500)
  - status: string(50) (not null)
  - verificationStatus: string(50)
  - additionalVisitRemarks: string(500)
  - bulkOpId: string(50)
  - idempotencyKey: string(120)
  - siteId: uuid → technicalSites.id
  - createdAt: timestamp (not null) (default now)
  - updatedAt: timestamp (not null) (default now)

DailyVisitReport

Table: daily_visit_reports

Fields:
  - id: string(255) (PK) (default random_uuid)
  - userId: int (not null) → users.id
  - dealerId: string(255) → dealers.id
  - subDealerId: string(255) → dealers.id
  - reportDate: date (not null)
  - dealerType: string(50) (not null)
  - location: string(500) (not null)
  - latitude: numeric(10, 7) (not null)
  - longitude: numeric(10, 7) (not null)
  - visitType: string(50) (not null)
  - dealerTotalPotential: numeric(10, 2) (not null)
  - dealerBestPotential: numeric(10, 2) (not null)
  - brandSelling: text[] (not null)
  - contactPerson: string(255)
  - contactPersonPhoneNo: string(20)
  - todayOrderMt: numeric(10, 2) (not null)
  - todayCollectionRupees: numeric(10, 2) (not null)
  - overdueAmount: numeric(12, 2)
  - feedbacks: string(500) (not null)
  - solutionBySalesperson: string(500)
  - anyRemarks: string(500)
  - checkInTime: timestamp (not null)
  - checkOutTime: timestamp
  - timeSpentinLoc: string(255)
  - inTimeImageUrl: string(500)
  - outTimeImageUrl: string(500)
  - pjpId: string(255) → permanentJourneyPlans.id
  - createdAt: timestamp (not null) (default now)
  - updatedAt: timestamp (not null) (default now)

TechnicalVisitReport

Table: technical_visit_reports

Fields:
  - id: string(255) (PK) (default random_uuid)
  - userId: int (not null) → users.id
  - reportDate: date (not null)
  - visitType: string(50) (not null)
  - siteNameConcernedPerson: string(255) (not null)
  - phoneNo: string(20) (not null)
  - emailId: string(255)
  - clientsRemarks: string(500) (not null)
  - salespersonRemarks: string(500) (not null)
  - checkInTime: timestamp (not null)
  - checkOutTime: timestamp
  - inTimeImageUrl: string(500)
  - outTimeImageUrl: string(500)
  - siteVisitBrandInUse: text[] (not null)
  - siteVisitStage: text (string)
  - conversionFromBrand: text (string)
  - conversionQuantityValue: numeric(10, 2)
  - conversionQuantityUnit: string(20)
  - associatedPartyName: text (string)
  - influencerType: text[] (not null)
  - serviceType: text (string)
  - qualityComplaint: text (string)
  - promotionalActivity: text (string)
  - channelPartnerVisit: text (string)
  - siteVisitType: string(50)
  - dhalaiVerificationCode: string(50)
  - isVerificationStatus: string(50)
  - meetingId: string(255) → tsoMeetings.id
  - pjpId: string(255) → permanentJourneyPlans.id
  - timeSpentinLoc: string(255)
  - purposeOfVisit: string(500)
  - sitePhotoUrl: string(500)
  - firstVisitTime: timestamp
  - lastVisitTime: timestamp
  - firstVisitDay: string(255)
  - lastVisitDay: string(255)
  - siteVisitsCount: int
  - otherVisitsCount: int
  - totalVisitsCount: int
  - region: string(100)
  - area: string(100)
  - latitude: numeric(9, 6)
  - longitude: numeric(9, 6)
  - masonId: uuid → masonPcSide.id
  - siteId: uuid → technicalSites.id
  - createdAt: timestamp (not null) (default now)
  - updatedAt: timestamp (not null) (default now)

Dealer

Table: dealers

Fields:
  - id: string(255) (PK) (default fn)
  - userId: int → users.id
  - type: string(50) (not null)
  - parentDealerId: string(255) → dealers.id
  - name: string(255) (not null)
  - region: string(100) (not null)
  - area: string(255) (not null)
  - phoneNo: string(20) (not null)
  - address: string(500) (not null)
  - pinCode: string(20)
  - latitude: numeric(10, 7)
  - longitude: numeric(10, 7)
  - dateOfBirth: date
  - anniversaryDate: date
  - totalPotential: numeric(10, 2) (not null)
  - bestPotential: numeric(10, 2) (not null)
  - brandSelling: text[] (not null)
  - feedbacks: string(500) (not null)
  - remarks: string(500)
  - dealerDevelopmentStatus: string(255)
  - dealerDevelopmentObstacle: string(255)
  - salesGrowthPercentage: numeric(5, 2)
  - noOfPJP: int
  - verificationStatus: string(50) (not null) (default "PENDING")
  - whatsappNo: string(20)
  - emailId: string(255)
  - businessType: string(100)
  - nameOfFirm: string(500)
  - underSalesPromoterName: string(200)
  - gstinNo: string(20) (unique)
  - panNo: string(20)
  - tradeLicNo: string(150)
  - aadharNo: string(20)
  - godownSizeSqFt: int
  - godownCapacityMTBags: string(255)
  - godownAddressLine: string(500)
  - godownLandMark: string(255)
  - godownDistrict: string(100)
  - godownArea: string(255)
  - godownRegion: string(100)
  - godownPinCode: string(20)
  - residentialAddressLine: string(500)
  - residentialLandMark: string(255)
  - residentialDistrict: string(100)
  - residentialArea: string(255)
  - residentialRegion: string(100)
  - residentialPinCode: string(20)
  - bankAccountName: string(255)
  - bankName: string(255)
  - bankBranchAddress: string(500)
  - bankAccountNumber: string(50)
  - bankIfscCode: string(50)
  - brandName: string(255)
  - monthlySaleMT: numeric(10, 2)
  - noOfDealers: int
  - areaCovered: string(255)
  - projectedMonthlySalesBestCementMT: numeric(10, 2)
  - noOfEmployeesInSales: int
  - declarationName: string(255)
  - declarationPlace: string(100)
  - declarationDate: date
  - tradeLicencePicUrl: string(500)
  - shopPicUrl: string(500)
  - dealerPicUrl: string(500)
  - blankChequePicUrl: string(500)
  - partnershipDeedPicUrl: string(500)
  - siteId: uuid → technicalSites.id
  - createdAt: timestamp (not null) (default now)
  - updatedAt: timestamp (not null) (default now)

SalesmanAttendance

Table: salesman_attendance

Fields:
  - id: string(255) (PK) (default fn)
  - userId: int (not null) → users.id
  - attendanceDate: date (not null)
  - locationName: string(500) (not null)
  - inTimeTimestamp: timestamp (not null)
  - outTimeTimestamp: timestamp
  - inTimeImageCaptured: boolean (not null)
  - outTimeImageCaptured: boolean (not null)
  - inTimeImageUrl: string(500)
  - outTimeImageUrl: string(500)
  - inTimeLatitude: numeric(10, 7) (not null)
  - inTimeLongitude: numeric(10, 7) (not null)
  - inTimeAccuracy: numeric(10, 2)
  - inTimeSpeed: numeric(10, 2)
  - inTimeHeading: numeric(10, 2)
  - inTimeAltitude: numeric(10, 2)
  - outTimeLatitude: numeric(10, 7)
  - outTimeLongitude: numeric(10, 7)
  - outTimeAccuracy: numeric(10, 2)
  - outTimeSpeed: numeric(10, 2)
  - outTimeHeading: numeric(10, 2)
  - outTimeAltitude: numeric(10, 2)
  - createdAt: timestamp (not null) (default now)
  - updatedAt: timestamp (not null) (default now)

SalesmanLeaveApplication

Table: salesman_leave_applications

Fields:
  - id: string(255) (PK) (default random_uuid)
  - userId: int (not null) → users.id
  - leaveType: string(100) (not null)
  - startDate: date (not null)
  - endDate: date (not null)
  - reason: string(500) (not null)
  - status: string(50) (not null)
  - adminRemarks: string(500)
  - createdAt: timestamp (not null) (default now)
  - updatedAt: timestamp (not null) (default now)

CompetitionReport

Table: competition_reports

Fields:
  - id: string(255) (PK) (default fn)
  - userId: int (not null) → users.id
  - reportDate: date (not null)
  - brandName: string(255) (not null)
  - billing: string(100) (not null)
  - nod: string(100) (not null)
  - retail: string(100) (not null)
  - schemesYesNo: string(10) (not null)
  - avgSchemeCost: numeric(10, 2) (not null)
  - remarks: string(500)
  - createdAt: timestamp (not null) (default now)
  - updatedAt: timestamp (not null) (default now)

GeoTracking

Table: geo_tracking

Fields:
  - id: string(255) (PK) (default random_uuid)
  - userId: int (not null) → users.id
  - latitude: numeric(10, 7) (not null)
  - longitude: numeric(10, 7) (not null)
  - recordedAt: timestamp (not null) (default now)
  - accuracy: numeric(10, 2)
  - speed: numeric(10, 2)
  - heading: numeric(10, 2)
  - altitude: numeric(10, 2)
  - locationType: string(50)
  - activityType: string(50)
  - appState: string(50)
  - batteryLevel: numeric(5, 2)
  - isCharging: boolean
  - networkStatus: string(50)
  - ipAddress: string(45)
  - siteName: string(255)
  - checkInTime: timestamp
  - checkOutTime: timestamp
  - totalDistanceTravelled: numeric(10, 3)
  - journeyId: string(255)
  - isActive: boolean (not null) (default true)
  - destLat: numeric(10, 7)
  - destLng: numeric(10, 7)
  - siteId: uuid → technicalSites.id
  - createdAt: timestamp (not null) (default now)
  - updatedAt: timestamp (not null) (default now)

DailyTask

Table: daily_tasks

Fields:
  - id: string(255) (PK) (default random_uuid)
  - userId: int (not null) → users.id
  - assignedByUserId: int (not null) → users.id
  - taskDate: date (not null)
  - visitType: string(50) (not null)
  - relatedDealerId: string(255) → dealers.id
  - siteName: string(255)
  - description: string(500)
  - status: string(50) (not null) (default "Assigned")
  - pjpId: string(255) → permanentJourneyPlans.id
  - siteId: uuid → technicalSites.id
  - createdAt: timestamp (not null) (default now)
  - updatedAt: timestamp (not null) (default now)

DealerReportsAndScore

Table: dealer_reports_and_scores

Fields:
  - id: string(255) (PK) (default fn)
  - dealerId: string(255) (not null) (unique) → dealers.id
  - dealerScore: numeric(10, 2) (not null)
  - trustWorthinessScore: numeric(10, 2) (not null)
  - creditWorthinessScore: numeric(10, 2) (not null)
  - orderHistoryScore: numeric(10, 2) (not null)
  - visitFrequencyScore: numeric(10, 2) (not null)
  - lastUpdatedDate: timestamp (not null)
  - createdAt: timestamp (not null) (default now)
  - updatedAt: timestamp (not null) (default now)

Rating

Table: ratings

Fields:
  - id: serial (int) (PK)
  - userId: int (not null) → users.id
  - area: text (string) (not null)
  - region: text (string) (not null)
  - rating: int (not null)

Brand

Table: brands

Fields:
  - id: serial (int) (PK)
  - name: string(255) (not null) (unique)

DealerBrandMapping

Table: dealer_brand_mapping

Fields:
  - id: string(255) (PK) (default fn)
  - dealerId: string(255) (not null) → dealers.id
  - brandId: int (not null) → brands.id
  - capacityMT: numeric(12, 2) (not null)
  - bestCapacityMT: numeric(12, 2)
  - brandGrowthCapacityPercent: numeric(5, 2)
  - userId: int → users.id

Reward

Table: rewards

Fields:
  - id: serial (int) (PK)
  - categoryId: int → rewardCategories.id
  - itemName: string(255) (not null) (unique)
  - pointCost: int (not null)
  - totalAvailableQuantity: int (not null)
  - stock: int (not null) (default 0)
  - isActive: boolean (not null) (default true)
  - meta: jsonb
  - createdAt: timestamp (not null) (default now)
  - updatedAt: timestamp (default now)

GiftAllocationLog

Table: gift_allocation_logs

Fields:
  - id: string(255) (PK) (default fn)
  - giftId: int (not null) → rewards.id
  - userId: int (not null) → users.id
  - transactionType: string(50) (not null)
  - quantity: int (not null)
  - sourceUserId: int → users.id
  - destinationUserId: int → users.id
  - technicalVisitReportId: string(255) → technicalVisitReports.id
  - dealerVisitReportId: string(255) → dailyVisitReports.id
  - createdAt: timestamp (not null) (default now)

SalesOrder

Table: sales_orders

Fields:
  - id: string(255) (PK) (default fn)
  - userId: int → users.id
  - dealerId: string(255) → dealers.id
  - dvrId: string(255) → dailyVisitReports.id
  - pjpId: string(255) → permanentJourneyPlans.id
  - orderDate: date (not null)
  - orderPartyName: string(255) (not null)
  - partyPhoneNo: string(20)
  - partyArea: string(255)
  - partyRegion: string(255)
  - partyAddress: string(500)
  - deliveryDate: date
  - deliveryArea: string(255)
  - deliveryRegion: string(255)
  - deliveryAddress: string(500)
  - deliveryLocPincode: string(10)
  - paymentMode: string(50)
s - paymentTerms: string(500)
  - paymentAmount: numeric(12, 2)
  - receivedPayment: numeric(12, 2)
  - receivedPaymentDate: date
  - pendingPayment: numeric(12, 2)
  - orderQty: numeric(12, 3)
  - orderUnit: string(20)
  - itemPrice: numeric(12, 2)
  - discountPercentage: numeric(5, 2)
  - itemPriceAfterDiscount: numeric(12, 2)
  - itemType: string(20)
  - itemGrade: string(10)
  - status: string(50) (not null) (default "Pending")
  - createdAt: timestamp (not null) (default now)
  - updatedAt: timestamp (not null) (default now)

TallyRaw

Table: tally_raw

Fields:
s - id: uuid (PK) (default random)
  - collectionName: text (string) (not null)
  - rawData: jsonb (not null)
  - syncedAt: timestamp (not null) (default now)

Mason

Table: mason_pc_side

Fields:
  - id: uuid (PK) (default random)
  - name: string(100) (not null)
  - phoneNumber: text (string) (not null)
  - kycDocumentName: string(100)
  - kycDocumentIdNum: string(150)
  - kycStatus: string(50) (default "none")
  - pointsBalance: int (not null) (default 0)
  - firebaseUid: string(128) (unique)
  - bagsLifted: int
  - isReferred: boolean
  - referredByUser: text (string)
  - referredToUser: text (string)
  - dealerId: string(255) → dealers.id
  - siteId: uuid → technicalSites.id
  - userId: int → users.id

OtpVerification

Table: otp_verifications

Fields:
s - id: uuid (PK) (default random)
  - otpCode: string(10) (not null)
  - expiresAt: timestamp (not null)
  - masonId: uuid (not null) → masonPcSide.id

SchemeOffer

Table: schemes_offers

Fields:
  - id: uuid (PK) (default random)
  - name: string(200) (not null)
  - description: text (string)
  - startDate: timestamp
  - endDate: timestamp

MasonOnScheme

Table: mason_on_scheme

Fields:
  - masonId: uuid (not null) (PK) → masonPcSide.id
  - schemeId: uuid (not null) (PK) → schemesOffers.id
  - enrolledAt: timestamp (default now)
  - siteId: uuid → technicalSites.id
  - status: string(255)

MasonOnMeeting

Table: masons_on_meetings

Fields:
  - masonId: uuid (not null) (PK) → masonPcSide.id
  - meetingId: string(255) (not null) (PK) → tsoMeetings.id
  - attendedAt: timestamp (not null) (default now)

RewardCategory

Table: reward_categories

Fields:
  - id: serial (int) (PK)
  - name: string(120) (not null) (unique)

KycSubmission

Table: kyc_submissions

Fields:
  - id: uuid (PK) (default random)
  - masonId: uuid (not null) → masonPcSide.id
  - aadhaarNumber: string(20)
  - panNumber: string(20)
  - voterIdNumber: string(20)
  - documents: jsonb
  - status: string(20) (not null) (default "pending")
  - remark: text (string)
  - createdAt: timestamp (not null) (default now)
  - updatedAt: timestamp (not null) (default now)

TsoAssignment

Table: tso_assignments

Fields:
  - tsoId: int (not null) (PK) → users.id
  - masonId: uuid (not null) (PK) → masonPcSide.id
  - createdAt: timestamp (not null) (default now)

BagLift

Table: bag_lifts

Fields:
  - id: uuid (PK) (default random)
  - masonId: uuid (not null) → masonPcSide.id
  - dealerId: string(255) → dealers.id
  - purchaseDate: timestamp (not null)
  - bagCount: int (not null)
  - pointsCredited: int (not null)
  - status: string(20) (not null) (default "pending")
  - imageUrl: text (string)
  - approvedBy: int → users.id
  - approvedAt: timestamp
  - createdAt: timestamp (not null) (default now)

PointsLedger

Table: points_ledger

Fields:
  - id: uuid (PK) (default random)
  - masonId: uuid (not null) → masonPcSide.id
  - sourceType: string(32) (not null)
  - sourceId: uuid (unique)
  - points: int (not null)
  - memo: text (string)
  - createdAt: timestamp (not null) (default now)

RewardRedemption

Table: reward_redemptions

Fields:
  - id: uuid (PK) (default random)
  - masonId: uuid (not null) → masonPcSide.id
  - rewardId: int (not null) → rewards.id
  - quantity: int (not null) (default 1)
  - status: string(20) (not null) (default "placed")
  - pointsDebited: int (not null)
  - deliveryName: string(160)
  - deliveryPhone: string(20)
  - deliveryAddress: text (string)
  - createdAt: timestamp (not null) (default now)
  - updatedAt: timestamp (not null) (default now)

TechnicalSite

Table: technical_sites

Fields:
  - id: uuid (PK) (default random_uuid)
  - siteName: string(255) (not null)
  - concernedPerson: string(255) (not null)
  - phoneNo: string(20) (not null)
  - address: text (string)
  - latitude: numeric(10, 7)
  - longitude: numeric(10, 7)
  - siteType: string(50)
  - area: string(100)
  - region: string(100)
  - keyPersonName: string(255)
  - keyPersonPhoneNum: string(20)
  - stageOfConstruction: string(100)
  - constructionStartDate: date
  - constructionEndDate: date
  - convertedSite: boolean (default false)
  - firstVistDate: date
  - lastVisitDate: date
  - needFollowUp: boolean (default false)
  - relatedDealerID: string(255) → dealers.id
  - relatedMasonpcID: uuid → masonPcSide.id
  - createdAt: timestamp (not null) (default now)
  - updatedAt: timestamp (not null) (default now)