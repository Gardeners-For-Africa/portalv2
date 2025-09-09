/**
 * Bank information structure for Nigerian banks
 */
export interface Bank {
  /** The name of the bank */
  name: string;
  /** The bank code (used for transfers and identification) */
  code: string;
  /** USSD template for transactions (null if not available) */
  ussdTemplate: string | null;
  /** Base USSD code for the bank (null if not available) */
  baseUssdCode: string | null;
  /** USSD template for transfers (null if not available) */
  transferUssdTemplate: string | null;
}

/**
 * Array of banks (type alias for better readability)
 */
export type Banks = Bank[];

/**
 * Bank search filters
 */
export interface BankSearchFilters {
  /** Search by bank name (case-insensitive) */
  name?: string;
  /** Search by bank code */
  code?: string;
  /** Filter banks that have USSD support */
  hasUssd?: boolean;
}

/**
 * Bank search result with pagination
 */
export interface BankSearchResult {
  /** Array of matching banks */
  banks: Bank[];
  /** Total number of matching banks */
  total: number;
  /** Current page number */
  page: number;
  /** Number of banks per page */
  limit: number;
  /** Total number of pages */
  totalPages: number;
}
