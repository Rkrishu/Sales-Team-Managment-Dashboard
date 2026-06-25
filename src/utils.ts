/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Helper to calculate connected rate
export function calculateConnectedRate(connected: number, made: number): number {
  if (!made) return 0;
  return Number(((connected / made) * 100).toFixed(1));
}

// Helper to calculate conversion rate
export function calculateConversionRate(converted: number, connected: number): number {
  if (!connected) return 0;
  return Number(((converted / connected) * 100).toFixed(1));
}

// Format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

// Get rating based on target achieved percentage
export interface PerformanceRating {
  rating: 'Above Target' | 'Near Target' | 'Below Target';
  color: string;
  bg: string;
  text: string;
}

export function getPerformanceRating(achievedPercent: number): PerformanceRating {
  if (achievedPercent >= 95) {
    return {
      rating: 'Above Target',
      color: 'bg-emerald-500',
      bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
      text: 'text-emerald-600 dark:text-emerald-400'
    };
  } else if (achievedPercent >= 75) {
    return {
      rating: 'Near Target',
      color: 'bg-amber-500',
      bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
      text: 'text-amber-600 dark:text-amber-400'
    };
  } else {
    return {
      rating: 'Below Target',
      color: 'bg-rose-500',
      bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400',
      text: 'text-rose-600 dark:text-rose-400'
    };
  }
}

// Standard helper to download generated data as CSV
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = 
    "data:text/csv;charset=utf-8," + 
    [headers.join(","), ...rows.map(e => e.map(val => {
      // Escape commas and quotes
      const strVal = String(val).replace(/"/g, '""');
      return strVal.includes(',') ? `"${strVal}"` : strVal;
    }).join(","))].join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper to trigger a simple printable HTML mockup designed for reports PDF generation
export function printReport(title: string, headers: string[], rows: (string | number)[][], summary?: Record<string, string | number>) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Popup blocker prevented report generation. Please allow popups for this dashboard.");
    return;
  }

  const tableHeaders = headers.map(h => `<th style="border:1px solid #ddd; padding:8px; text-align:left; background-color:#f2f2f2;">${h}</th>`).join('');
  const tableRows = rows.map(r => `<tr>${r.map(cell => `<td style="border:1px solid #ddd; padding:8px;">${cell}</td>`).join('')}</tr>`).join('');
  
  let summaryHtml = '';
  if (summary) {
    summaryHtml = `
      <div style="margin-top:24px; padding:16px; border:1px solid #ddd; background-color:#fafafa; border-radius:4px; max-width:400px;">
        <h3 style="margin-top:0;">Report Summary</h3>
        <table style="width:100%; border-collapse:collapse;">
          ${Object.entries(summary).map(([k, v]) => `
            <tr>
              <td style="padding:4px 0; font-weight:bold;">${k}:</td>
              <td style="padding:4px 0; text-align:right;">${v}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Inter', sans-serif; color: #333; margin: 40px; }
          h1 { margin-bottom: 8px; font-weight: 600; font-size: 24px; }
          .timestamp { font-size: 12px; color: #666; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="timestamp">Generated on: ${new Date().toLocaleString()} | Sales Team Manager</div>
        <table>
          <thead><tr>${tableHeaders}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
        ${summaryHtml}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
