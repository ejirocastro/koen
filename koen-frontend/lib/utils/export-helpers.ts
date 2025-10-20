/**
 * Export utilities for converting data to CSV and downloading files
 */

import { microKusdToKusd, satoshisToSbtc, bpsToPercentage, blocksToDays } from './format-helpers';

/**
 * Loan data structure with health info
 */
interface LoanWithHealth {
  loanId: number;
  lender: string;
  borrower: string;
  amount: number;
  apr: number;
  collateral: number;
  collateralRatio: number;
  duration: number;
  startBlock: number;
  endBlock: number;
  status: string;
  repaidAmount: number;
  isAtRisk: boolean;
}

/**
 * Converts an array of loans to CSV format
 * @param loans - Array of loans with health info
 * @param role - User's role ('lender' or 'borrower')
 * @returns CSV string
 */
export function loansToCSV(loans: LoanWithHealth[], role: 'lender' | 'borrower'): string {
  // CSV Headers
  const headers = [
    'Loan ID',
    'Role',
    'Counterparty',
    'Amount (kUSD)',
    'APR (%)',
    'Collateral (sBTC)',
    'Collateral Ratio (%)',
    'Duration (days)',
    'Start Block',
    'End Block',
    'Status',
    'Repaid Amount (kUSD)',
    'At Risk',
  ];

  // Convert loans to CSV rows
  const rows = loans.map((loan) => {
    const counterparty = role === 'lender' ? loan.borrower : loan.lender;
    const roleLabel = role === 'lender' ? 'Lender' : 'Borrower';

    return [
      loan.loanId.toString(),
      roleLabel,
      counterparty,
      `$${microKusdToKusd(loan.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      bpsToPercentage(loan.apr).toFixed(2),
      satoshisToSbtc(loan.collateral).toFixed(8),
      loan.collateralRatio.toString(),
      blocksToDays(loan.duration).toString(),
      loan.startBlock.toString(),
      loan.endBlock.toString(),
      loan.status,
      `$${microKusdToKusd(loan.repaidAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      loan.isAtRisk ? 'Yes' : 'No',
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Triggers a browser download of a CSV file
 * @param csvContent - The CSV string content
 * @param filename - The filename for the download
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Create a Blob from the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create a temporary download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL
  URL.revokeObjectURL(url);
}

/**
 * Exports loans to a CSV file and triggers download
 * @param loans - Array of loans with health info
 * @param role - User's role ('lender' or 'borrower')
 */
export function exportLoansToCSV(loans: LoanWithHealth[], role: 'lender' | 'borrower'): void {
  if (!loans || loans.length === 0) {
    throw new Error('No loans to export');
  }

  // Generate CSV content
  const csvContent = loansToCSV(loans, role);

  // Generate filename with current date
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const filename = `koen-loans-${role}-${date}.csv`;

  // Trigger download
  downloadCSV(csvContent, filename);
}
