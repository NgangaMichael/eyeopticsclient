import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportInvoiceToExcel = async (sale) => {
  if (!sale) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`Invoice_${sale.id}`);

  // Ensure grid lines are visible but elegant
  worksheet.views = [{ showGridLines: true }];

  // Define strict color palette tokens matching the web application
  const colors = {
    indigoPrimary: '4F46E5',  // Indigo-600
    slateDark: '0F172A',      // Slate-900
    slateMedium: '475569',    // Slate-600
    slateLight: '94A3B8',     // Slate-400
    bgLight: 'F8FAFC',        // Slate-50
    emeraldPaid: '059669',    // Emerald-600
    roseDiscount: 'E11D48',   // Rose-600
    borderLight: 'E2E8F0'     // Slate-200
  };

  // Set column widths explicitly to prevent clipping and ugly overflows
  worksheet.columns = [
    { key: 'desc', width: 42 },
    { key: 'price', width: 16 },
    { key: 'qty', width: 12 },
    { key: 'subtotal', width: 20 }
  ];

  // 1. Top Decorative Brand Accent Bar
  worksheet.mergeCells('A1:D1');
  worksheet.getRow(1).height = 12;
  worksheet.getCell('A1').fill = {
    type: 'pattern', pattern: 'solid', fgColor: { argb: colors.indigoPrimary }
  };

  // 2. Invoice Header Section
  worksheet.getRow(3).height = 28;
  worksheet.getCell('A3').value = 'EYE OPTICS';
  worksheet.getCell('A3').font = { name: 'Arial', size: 18, bold: true, color: { argb: colors.slateDark } };

  worksheet.getCell('D3').value = 'INVOICE';
  worksheet.getCell('D3').font = { name: 'Arial', size: 24, bold: true, color: { argb: 'F1F5F9' } }; // Sleek light gray font
  worksheet.getCell('D3').alignment = { horizontal: 'right', vertical: 'bottom' };

  worksheet.getRow(4).height = 16;
  worksheet.getCell('A4').value = 'VISION CARE EXCELLENCE';
  worksheet.getCell('A4').font = { name: 'Arial', size: 9, bold: true, color: { argb: colors.indigoPrimary } };

  worksheet.getCell('D4').value = `Ref: #S-${sale.id.toString().padStart(4, '0')}`;
  worksheet.getCell('D4').font = { name: 'Arial', size: 11, bold: true, color: { argb: colors.indigoPrimary } };
  worksheet.getCell('D4').alignment = { horizontal: 'right' };

  worksheet.getRow(5).height = 16;
  worksheet.getCell('D5').value = `Date: ${new Date(sale.createdAt).toLocaleDateString('en-GB')}`;
  worksheet.getCell('D5').font = { name: 'Arial', size: 10, color: { argb: colors.slateMedium } };
  worksheet.getCell('D5').alignment = { horizontal: 'right' };

  // 3. Customer Block & Payment Info Section
  worksheet.getRow(7).height = 16;
  worksheet.getCell('A7').value = 'BILL TO:';
  worksheet.getCell('A7').font = { name: 'Arial', size: 9, bold: true, color: { argb: colors.indigoPrimary } };

  worksheet.getCell('D7').value = 'PAYMENT INFO';
  worksheet.getCell('D7').font = { name: 'Arial', size: 9, bold: true, color: { argb: colors.slateLight } };
  worksheet.getCell('D7').alignment = { horizontal: 'right' };

  // Format Bill To Name / Info Box
  worksheet.getRow(8).height = 20;
  const customerName = sale.customer 
    ? sale.customer.name 
    : `${sale.patient?.firstName || ''} ${sale.patient?.lastName || ''}`.trim() || "Walk-in Customer";
  worksheet.getCell('A8').value = customerName;
  worksheet.getCell('A8').font = { name: 'Arial', size: 13, bold: true, color: { argb: colors.slateDark } };

  worksheet.getCell('D8').value = 'Status: Paid in Full';
  worksheet.getCell('D8').font = { name: 'Arial', size: 11, bold: true, color: { argb: colors.emeraldPaid } };
  worksheet.getCell('D8').alignment = { horizontal: 'right' };

  worksheet.getRow(9).height = 16;
  worksheet.getCell('A9').value = `📞  ${sale.customer?.phone || sale.patient?.phone || 'N/A'}`;
  worksheet.getCell('D9').value = 'Method: Cash / Mobile Money';
  worksheet.getCell('D9').font = { name: 'Arial', size: 10, color: { argb: colors.slateMedium } };
  worksheet.getCell('D9').alignment = { horizontal: 'right' };

  worksheet.getRow(10).height = 16;
  worksheet.getCell('A10').value = `✉️  ${sale.customer?.email || sale.patient?.email || 'N/A'}`;

  worksheet.getRow(11).height = 16;
  worksheet.getCell('A11').value = `📍  ${sale.customer?.address || sale.patient?.address || 'Nairobi, Kenya'}`;

  // Style the address lines
  ['A9', 'A10', 'A11'].forEach(cellRef => {
    worksheet.getCell(cellRef).font = { name: 'Arial', size: 10, color: { argb: colors.slateMedium } };
  });

  // Apply visual styling mimicking modern card blocks to Bill To Section
  for (let r = 7; r <= 11; r++) {
    for (let c = 1; c <= 2; c++) {
      worksheet.getCell(r, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.bgLight } };
    }
  }

  // 4. Line Items Table Headers
  const tableHeaderRow = 14;
  worksheet.getRow(tableHeaderRow).height = 24;
  worksheet.getRow(tableHeaderRow).values = ['Description', 'Unit Price', 'Qty', 'Subtotal'];
  
  const headerBorders = { bottom: { style: 'medium', color: { argb: colors.indigoPrimary } } };
  
  ['A', 'B', 'C', 'D'].forEach(col => {
    const cell = worksheet.getCell(`${col}${tableHeaderRow}`);
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: colors.slateMedium } };
    cell.border = headerBorders;
    if (col === 'B' || col === 'C') cell.alignment = { horizontal: 'center', vertical: 'middle' };
    if (col === 'D') cell.alignment = { horizontal: 'right', vertical: 'middle' };
    if (col === 'A') cell.alignment = { horizontal: 'left', vertical: 'middle' };
  });

  // 5. Populate Items with Clean UI Styling
  let currentRow = 15;
  const thinBorder = { style: 'thin', color: { argb: colors.borderLight } };

  sale.saleitem?.forEach((item, index) => {
    worksheet.getRow(currentRow).height = 32; // Taller padding matching UI table rows
    
    // Concatenate Product Name + Metadata cleanly
    const itemDescription = `${item.stock?.name || 'Product'}\n[${item.stock?.code || ''} | ${item.stock?.type || ''}]`;
    
    worksheet.getRow(currentRow).values = [
      itemDescription,
      Number(item.price),
      Number(item.quantity),
      { formula: `B${currentRow}*C${currentRow}` }
    ];

    // Format individual cells inside active record rows
    const cellA = worksheet.getCell(`A${currentRow}`);
    cellA.alignment = { wrapText: true, vertical: 'middle', horizontal: 'left' };
    cellA.font = { name: 'Arial', size: 10, bold: true, color: { argb: colors.slateDark } };

    const cellB = worksheet.getCell(`B${currentRow}`);
    cellB.numberFormat = '#,##0';
    cellB.alignment = { horizontal: 'center', vertical: 'middle' };
    cellB.font = { name: 'Arial', size: 10, color: { argb: colors.slateMedium } };

    const cellC = worksheet.getCell(`C${currentRow}`);
    cellC.numberFormat = '0.0';
    cellC.alignment = { horizontal: 'center', vertical: 'middle' };
    cellC.font = { name: 'Arial', size: 10, color: { argb: colors.slateMedium } };

    const cellD = worksheet.getCell(`D${currentRow}`);
    cellD.numberFormat = '#,##0';
    cellD.alignment = { horizontal: 'right', vertical: 'middle' };
    cellD.font = { name: 'Arial', size: 11, bold: true, color: { argb: colors.slateDark } };

    // Apply soft alternating background colors (Zebra Striping)
    const rowBg = index % 2 === 0 ? 'FFFFFF' : colors.bgLight;

    ['A', 'B', 'C', 'D'].forEach(col => {
      const cell = worksheet.getCell(`${col}${currentRow}`);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      cell.border = { bottom: thinBorder };
    });

    currentRow++;
  });

  // 6. Financial Summary Box Section
  const startItemsRow = 15;
  const endItemsRow = currentRow - 1;
  currentRow += 1;

  // Set explicit background block colors for Financial summary cards
  const applySummaryStyles = (row, label, formulaOrValue, isBold, textColor, isSize = 11) => {
    worksheet.getRow(row).height = 22;
    worksheet.getCell(`C${row}`).value = label;
    worksheet.getCell(`C${row}`).font = { name: 'Arial', size: 9, bold: true, color: { argb: colors.slateMedium } };
    worksheet.getCell(`C${row}`).alignment = { horizontal: 'left', vertical: 'middle' };

    const valCell = worksheet.getCell(`D${row}`);
    valCell.value = formulaOrValue;
    valCell.font = { name: 'Arial', size: isSize, bold: isBold, color: { argb: textColor } };
    valCell.numberFormat = 'Ksh #,##0';
    valCell.alignment = { horizontal: 'right', vertical: 'middle' };

    for (let col = 3; col <= 4; col++) {
      worksheet.getCell(row, col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.bgLight } };
    }
  };

  // Gross Total Row
  applySummaryStyles(currentRow, 'GROSS TOTAL', { formula: `SUM(D${startItemsRow}:D${endItemsRow})` }, true, colors.slateMedium);
  
  // Discount Row
  currentRow++;
  applySummaryStyles(currentRow, 'DISCOUNT', Number(sale.discount || 0), true, colors.roseDiscount);

  // Divider Line inside Summary Box
  worksheet.getCell(`C${currentRow}`).border = { bottom: { style: 'thin', color: { argb: colors.borderLight } } };
  worksheet.getCell(`D${currentRow}`).border = { bottom: { style: 'thin', color: { argb: colors.borderLight } } };

  // Net Total Row
  currentRow++;
  applySummaryStyles(currentRow, 'NET TOTAL', { formula: `D${currentRow-2}-D${currentRow-1}` }, true, colors.slateDark, 15);

  // 7. eTIMS Fiscal Block (Renders if available)
  if (sale.etimsReceipt || sale.etimsAmount) {
    currentRow += 2;
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    worksheet.getRow(currentRow).height = 18;
    worksheet.getCell(`A${currentRow}`).value = 'FISCAL DATA';
    worksheet.getCell(`A${currentRow}`).font = { name: 'Arial', size: 9, bold: true, color: { argb: colors.emeraldPaid } };
    worksheet.getCell(`A${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6F4EA' } };

    currentRow++;
    worksheet.getRow(currentRow).height = 20;
    worksheet.getCell(`A${currentRow}`).value = `eTIMS Receipt: ${sale.etimsReceipt || 'Pending'}`;
    worksheet.getCell(`A${currentRow}`).font = { name: 'Courier New', size: 10, bold: true, color: { argb: colors.slateDark } };
    
    worksheet.getCell(`D${currentRow}`).value = `Reported Amt: Ksh ${Number(sale.etimsAmount || 0).toLocaleString()}`;
    worksheet.getCell(`D${currentRow}`).font = { name: 'Arial', size: 10, bold: true, color: { argb: colors.slateDark } };
    worksheet.getCell(`D${currentRow}`).alignment = { horizontal: 'right' };
    
    for(let c=1; c<=4; c++) {
      worksheet.getCell(currentRow, c).border = {
        top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder
      };
    }
  }

  // 8. Bottom Terms & Signature Notice Row
  currentRow += 3;
  worksheet.getRow(currentRow).height = 16;
  worksheet.getCell(`A${currentRow}`).value = 'Notice: Lenses once processed cannot be returned or exchanged.';
  worksheet.getCell(`A${currentRow}`).font = { name: 'Arial', size: 8, italic: true, color: { argb: colors.slateLight } };

  worksheet.getCell(`D${currentRow}`).value = 'Authorized Official Signature';
  worksheet.getCell(`D${currentRow}`).font = { name: 'Arial', size: 10, bold: true, color: { argb: colors.slateDark } };
  worksheet.getCell(`D${currentRow}`).alignment = { horizontal: 'right' };

  currentRow++;
  worksheet.getCell(`D${currentRow}`).border = { bottom: { style: 'thin', color: { argb: colors.slateLight } } };

  currentRow++;
  worksheet.getRow(currentRow).height = 16;
  worksheet.getCell(`D${currentRow}`).value = 'Eye Optics & Contact Lens Center';
  worksheet.getCell(`D${currentRow}`).font = { name: 'Arial', size: 9, italic: true, color: { argb: colors.slateMedium } };
  worksheet.getCell(`D${currentRow}`).alignment = { horizontal: 'right' };

  // Trigger File Download Buffer
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Invoice_#INV-${sale.id.toString().padStart(4, '0')}.xlsx`);
};