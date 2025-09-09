import { Injectable } from "@nestjs/common";
import {
  CreateInvoiceRequest,
  CreateSubAccountRequest,
  DeactivateSubAccountRequest,
  MonnifyService,
  RefundTransactionRequest,
  TransactionVerificationRequest,
} from "@scwar/nestjs-monnify";
import * as fs from "fs";
import * as path from "path";
import { Bank, BankSearchFilters, BankSearchResult, Banks } from "./payments.types";

@Injectable()
export class PaymentsService {
  constructor(private readonly monnifyService: MonnifyService) {}

  /**
   * Generate a new invoice
   * @param invoice - The invoice to generate
   * @returns The generated invoice response
   */
  async generateInvoice(invoice: CreateInvoiceRequest) {
    return await this.monnifyService.invoices.createInvoice(invoice);
  }

  /**
   * Get an invoice by its reference
   * @param reference - The reference of the invoice
   * @returns The invoice response
   */
  async getInvoiceByReference(reference: string) {
    return await this.monnifyService.invoices.getInvoiceDetails(reference);
  }

  /**
   * Create a subaccount for a merchant
   * @param payload - The details of the merchant
   * @returns The subaccount response
   */
  async createSubAccount(payload: CreateSubAccountRequest) {
    return await this.monnifyService.subAccounts.createSubAccount(payload);
  }

  /**
   * Deactivate a subaccount for a merchant
   * @param payload - The details of the merchant
   * @returns The subaccount response
   */
  async deactivateSubAccount(payload: DeactivateSubAccountRequest) {
    return await this.monnifyService.subAccounts.deactivateSubAccount(payload);
  }

  /**
   * Verify a payment
   * @param payload - The details of the payment
   * @returns The payment response
   */
  async verifyTransaction(payload: TransactionVerificationRequest) {
    return await this.monnifyService.transactions.verifyTransaction(payload);
  }

  /**
   * Get a transaction by its reference
   * @param reference - The reference of the transaction
   * @returns The transaction response
   */
  async getTransactionStatus(reference: string) {
    return await this.monnifyService.transactions.getTransactionStatus(reference);
  }

  /**
   * Refund a payment
   * @param payload - The details of the payment
   * @returns The payment response
   */
  async refundTransaction(payload: RefundTransactionRequest) {
    return await this.monnifyService.transactions.refundTransaction(payload);
  }

  /**
   * Get all banks
   * @returns The banks sorted by name
   */
  async getBanks(): Promise<Banks> {
    // read banks.json file
    const banks: Banks = JSON.parse(fs.readFileSync(path.join(__dirname, "banks.json"), "utf8"));
    // sort banks by name
    banks.sort((a: Bank, b: Bank) => a.name.localeCompare(b.name));
    return banks;
  }

  /**
   * Search banks with filters and pagination
   * @param filters - Search filters
   * @param page - Page number (default: 1)
   * @param limit - Number of banks per page (default: 20)
   * @returns Paginated bank search results
   */
  async searchBanks(
    filters: BankSearchFilters = {},
    page: number = 1,
    limit: number = 20,
  ): Promise<BankSearchResult> {
    const allBanks = await this.getBanks();
    let filteredBanks = [...allBanks];

    // Apply filters
    if (filters.name) {
      const searchName = filters.name.toLowerCase();
      filteredBanks = filteredBanks.filter((bank) => bank.name.toLowerCase().includes(searchName));
    }

    if (filters.code) {
      filteredBanks = filteredBanks.filter((bank) => bank.code === filters.code);
    }

    if (filters.hasUssd) {
      filteredBanks = filteredBanks.filter(
        (bank) =>
          bank.ussdTemplate !== null ||
          bank.baseUssdCode !== null ||
          bank.transferUssdTemplate !== null,
      );
    }

    // Calculate pagination
    const total = filteredBanks.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const banks = filteredBanks.slice(startIndex, endIndex);

    return {
      banks,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get a bank by its code
   * @param code - The bank code
   * @returns The bank or null if not found
   */
  async getBankByCode(code: string): Promise<Bank | null> {
    const banks = await this.getBanks();
    return banks.find((bank) => bank.code === code) || null;
  }

  /**
   * Get banks that support USSD transactions
   * @returns Banks with USSD support
   */
  async getBanksWithUssd(): Promise<Banks> {
    const banks = await this.getBanks();
    return banks.filter(
      (bank) =>
        bank.ussdTemplate !== null ||
        bank.baseUssdCode !== null ||
        bank.transferUssdTemplate !== null,
    );
  }
}
