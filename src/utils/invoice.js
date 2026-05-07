export function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function generateInvoiceHTML(order) {
  const orderDate = order.date ? new Date(order.date).toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : new Date().toLocaleDateString('fr-CA');

  const itemsHTML = order.items?.map(item => `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">${parseFloat(item.price).toFixed(2)} $</td>
      <td style="text-align: right;">${(parseFloat(item.price) * item.quantity).toFixed(2)} $</td>
    </tr>
  `).join('') || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Facture ${escapeHtml(order.id)} - VEGEDERM</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 14px; color: #333; padding: 40px; }
        .invoice-header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #1d4e38; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: bold; color: #1d4e38; }
        .invoice-info { text-align: right; }
        .invoice-number { font-size: 20px; font-weight: bold; }
        .invoice-date { color: #666; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 16px; font-weight: bold; color: #1d4e38; margin-bottom: 10px; text-transform: uppercase; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .info-block p { margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #f8f5f0; padding: 12px; text-align: left; border-bottom: 2px solid #1d4e38; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .totals { margin-top: 30px; text-align: right; }
        .totals table { width: 300px; margin-left: auto; }
        .totals td { padding: 8px 0; }
        .totals .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #1d4e38; }
        .footer { margin-top: 60px; text-align: center; color: #666; font-size: 12px; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status.en-cours { background: #fff3cd; color: #856404; }
        .status.confirmée { background: #d4edda; color: #155724; }
        .status.expéditée { background: #cce5ff; color: #004085; }
        .status.livrée { background: #d1e7dd; color: #0f5132; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div>
          <div class="logo">VEGEDERM</div>
          <p>Cosmétiques Naturels & Bio</p>
          <p>zoumcosmo@gmail.com</p>
        </div>
        <div class="invoice-info">
          <div class="invoice-number">FACTURE</div>
          <div class="invoice-number">#${escapeHtml(order.id)}</div>
          <div class="invoice-date">Date: ${orderDate}</div>
          <span class="status ${order.status}">${escapeHtml(order.status?.toUpperCase() || 'EN COURS')}</span>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-block">
          <div class="section-title">Client</div>
          <p><strong>${escapeHtml(order.customer?.firstName || '')} ${escapeHtml(order.customer?.lastName || '')}</strong></p>
          <p>${escapeHtml(order.customer?.email || '')}</p>
          <p>${escapeHtml(order.customer?.phone || '')}</p>
        </div>
        <div class="info-block">
          <div class="section-title">Adresse de livraison</div>
          <p>${escapeHtml(order.customer?.address || '')}</p>
          <p>${escapeHtml(order.customer?.city || '')}, ${escapeHtml(order.customer?.province || '')}</p>
          <p>${escapeHtml(order.customer?.postalCode || '')}</p>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Articles commandés</div>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th style="text-align: center;">Quantité</th>
              <th style="text-align: right;">Prix unitaire</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
      </div>

      <div class="totals">
        <table>
          <tr>
            <td>Sous-total:</td>
            <td style="text-align: right;">${parseFloat(order.subtotal || 0).toFixed(2)} $</td>
          </tr>
          ${order.discount > 0 ? `
          <tr style="color: green;">
            <td>Réduction:</td>
            <td style="text-align: right;">-${parseFloat(order.discount).toFixed(2)} $</td>
          </tr>
          ` : ''}
          <tr>
            <td>Livraison:</td>
            <td style="text-align: right;">${parseFloat(order.shipping || 0).toFixed(2)} $</td>
          </tr>
          <tr class="total-row">
            <td>TOTAL:</td>
            <td style="text-align: right;">${parseFloat(order.total).toFixed(2)} $</td>
          </tr>
        </table>
      </div>

      <div class="footer">
        <p>VEGEDERM - Cosmétiques Naturels & Bio au Canada</p>
        <p>Merci pour votre confiance!</p>
        <p style="margin-top: 20px;">Questions? Contactez-nous à zoumcosmo@gmail.com</p>
      </div>
    </body>
    </html>
  `;
}

export function downloadInvoice(order) {
  const html = generateInvoiceHTML(order);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printInvoice(order) {
  const html = generateInvoiceHTML(order);
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
}