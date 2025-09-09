import { Test, TestingModule } from "@nestjs/testing";
import { MonnifyService } from "@scwar/nestjs-monnify";
import * as fs from "fs";
import * as path from "path";
import { PaymentsService } from "./payments.service";

// Mock fs module
jest.mock("fs");
jest.mock("path");

describe("PaymentsService", () => {
  let service: PaymentsService;
  let monnifyService: MonnifyService;

  const mockBanks = [
    {
      name: "Access bank",
      code: "044",
      ussdTemplate: "*901*Amount*AccountNumber#",
      baseUssdCode: "*901#",
      transferUssdTemplate: "*901*AccountNumber#",
    },
    {
      name: "9 PAYMENT SOLUTIONS BANK",
      code: "120001",
      ussdTemplate: null,
      baseUssdCode: null,
      transferUssdTemplate: null,
    },
    {
      name: "ZENITH BANK",
      code: "057",
      ussdTemplate: "*966*Amount*AccountNumber#",
      baseUssdCode: "*966#",
      transferUssdTemplate: "*966*AccountNumber#",
    },
  ];

  beforeEach(async () => {
    const mockMonnifyService = {
      invoices: {
        createInvoice: jest.fn(),
        getInvoiceDetails: jest.fn(),
      },
      subAccounts: {
        createSubAccount: jest.fn(),
        deactivateSubAccount: jest.fn(),
      },
      transactions: {
        verifyTransaction: jest.fn(),
        getTransactionStatus: jest.fn(),
        refundTransaction: jest.fn(),
      },
    };

    // Mock fs.readFileSync
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockBanks));
    (path.join as jest.Mock).mockReturnValue("/path/to/banks.json");

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: MonnifyService,
          useValue: mockMonnifyService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    monnifyService = module.get<MonnifyService>(MonnifyService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getBanks", () => {
    it("should return all banks sorted by name", async () => {
      const result = await service.getBanks();

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe("9 PAYMENT SOLUTIONS BANK");
      expect(result[1].name).toBe("Access bank");
      expect(result[2].name).toBe("ZENITH BANK");
      expect(fs.readFileSync).toHaveBeenCalledWith("/path/to/banks.json", "utf8");
    });
  });

  describe("searchBanks", () => {
    it("should return all banks when no filters applied", async () => {
      const result = await service.searchBanks();

      expect(result.banks).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it("should filter banks by name", async () => {
      const result = await service.searchBanks({ name: "Access" });

      expect(result.banks).toHaveLength(1);
      expect(result.banks[0].name).toBe("Access bank");
      expect(result.total).toBe(1);
    });

    it("should filter banks by code", async () => {
      const result = await service.searchBanks({ code: "044" });

      expect(result.banks).toHaveLength(1);
      expect(result.banks[0].code).toBe("044");
      expect(result.total).toBe(1);
    });

    it("should filter banks with USSD support", async () => {
      const result = await service.searchBanks({ hasUssd: true });

      expect(result.banks).toHaveLength(2);
      expect(
        result.banks.every(
          (bank) =>
            bank.ussdTemplate !== null ||
            bank.baseUssdCode !== null ||
            bank.transferUssdTemplate !== null,
        ),
      ).toBe(true);
    });

    it("should handle pagination correctly", async () => {
      const result = await service.searchBanks({}, 1, 2);

      expect(result.banks).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.totalPages).toBe(2);
    });

    it("should return empty results when no banks match filters", async () => {
      const result = await service.searchBanks({ name: "NonExistentBank" });

      expect(result.banks).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe("getBankByCode", () => {
    it("should return bank when found by code", async () => {
      const result = await service.getBankByCode("044");

      expect(result).toBeDefined();
      expect(result?.name).toBe("Access bank");
      expect(result?.code).toBe("044");
    });

    it("should return null when bank not found", async () => {
      const result = await service.getBankByCode("999");

      expect(result).toBeNull();
    });
  });

  describe("getBanksWithUssd", () => {
    it("should return only banks with USSD support", async () => {
      const result = await service.getBanksWithUssd();

      expect(result).toHaveLength(2);
      expect(
        result.every(
          (bank) =>
            bank.ussdTemplate !== null ||
            bank.baseUssdCode !== null ||
            bank.transferUssdTemplate !== null,
        ),
      ).toBe(true);
    });
  });

  describe("Monnify integration methods", () => {
    it("should call monnify service for invoice generation", async () => {
      const mockInvoice = { amount: 1000, customerEmail: "test@example.com" };
      const mockResponse = { invoiceReference: "INV123", paymentUrl: "https://example.com/pay" };

      (monnifyService.invoices.createInvoice as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.generateInvoice(mockInvoice as any);

      expect(monnifyService.invoices.createInvoice).toHaveBeenCalledWith(mockInvoice);
      expect(result).toBe(mockResponse);
    });

    it("should call monnify service for transaction verification", async () => {
      const mockVerification = { transactionReference: "TXN123" };
      const mockResponse = { status: "SUCCESS", amount: 1000 };

      (monnifyService.transactions.verifyTransaction as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.verifyTransaction(mockVerification as any);

      expect(monnifyService.transactions.verifyTransaction).toHaveBeenCalledWith(mockVerification);
      expect(result).toBe(mockResponse);
    });
  });
});
