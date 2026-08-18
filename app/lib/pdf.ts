import PDFDocument from "pdfkit";

export function generateInvoicePDFBuffer(order: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // 1. En-tête / Bannière principale VEGEDERM
      doc.rect(0, 0, 595.28, 85).fill("#064e3b");
      doc
        .fillColor("#ffffff")
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("VEGEDERM BIO COSMECEUTIQUES", 40, 24, { align: "center" });
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#a7f3d0")
        .text("FACTURE OFFICIELLE D'ACHAT & CONFIRMATION — CANADA 🇨🇦", 40, 50, { align: "center" });

      // 2. Méta-données de la commande
      doc.y = 110;
      const shortId = order.id ? order.id.slice(-8).toUpperCase() : "VEGEDERM";
      const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString("fr-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      doc.fillColor("#0f172a").fontSize(11).font("Helvetica-Bold").text(`N° de Facture : #${shortId}`);
      doc.fontSize(9).font("Helvetica").fillColor("#64748b").text(`Date de transaction : ${dateStr}`);
      doc.text(`ID Transaction Unique : ${order.id}`);

      doc.moveDown(1.2);

      // Adresse de livraison
      let addressObj: any = {};
      try {
        addressObj = typeof order.address === "string" ? JSON.parse(order.address) : order.address || {};
      } catch {}

      doc.fillColor("#064e3b").fontSize(11).font("Helvetica-Bold").text("Adresse de livraison (Canada) :");
      doc.fontSize(9.5).font("Helvetica").fillColor("#1e293b").text(`Client : ${order.guestName || "Client VEGEDERM"}`);
      if (order.guestEmail) doc.text(`Courriel : ${order.guestEmail}`);
      doc.text(`Adresse : ${addressObj.street || ""}${addressObj.apartment ? " (" + addressObj.apartment + ")" : ""}`);
      doc.text(`Ville / Province : ${addressObj.city || ""}, ${addressObj.province || ""} ${addressObj.postalCode || ""}`);
      doc.text(`Pays : Canada 🇨🇦`);

      doc.moveDown(1.5);

      // En-tête Tableau des articles
      const tableTop = doc.y;
      doc.rect(40, tableTop, 515, 22).fill("#f1f5f9");
      doc.fillColor("#0f172a").fontSize(9.5).font("Helvetica-Bold");
      doc.text("Description de l'article", 50, tableTop + 6);
      doc.text("Qté", 330, tableTop + 6, { width: 40, align: "center" });
      doc.text("Prix unitaire", 380, tableTop + 6, { width: 75, align: "right" });
      doc.text("Total CAD", 465, tableTop + 6, { width: 80, align: "right" });

      let currentY = tableTop + 28;
      doc.font("Helvetica").fontSize(9).fillColor("#334155");

      const items = order.items || [];
      items.forEach((item: any) => {
        const name = item.product?.name || item.name || "Produit Vegederm";
        const qty = item.quantity || 1;
        const price = parseFloat(item.unitPrice || item.price || 0);
        const lineTotal = price * qty;

        doc.text(name, 50, currentY, { width: 270 });
        doc.text(String(qty), 330, currentY, { width: 40, align: "center" });
        doc.text(`${price.toFixed(2)} $`, 380, currentY, { width: 75, align: "right" });
        doc.text(`${lineTotal.toFixed(2)} $`, 465, currentY, { width: 80, align: "right" });

        currentY += 18;
      });

      doc.moveTo(40, currentY).lineTo(555, currentY).stroke("#cbd5e1");
      currentY += 12;

      // Totaux financiers
      const subtotal = order.subtotal || 0;
      const shippingCost = order.shippingCost ?? 0;
      const taxAmount = order.taxAmount || 0;
      const total = order.total || 0;

      doc.font("Helvetica").fontSize(9.5).fillColor("#475569");
      if (subtotal > 0) {
        doc.text(`Sous-total : ${subtotal.toFixed(2)} $ CAD`, 330, currentY, { align: "right", width: 215 });
        currentY += 15;
      }
      doc.text(`Expédition Canada : ${shippingCost === 0 ? "Gratuite" : shippingCost.toFixed(2) + " $ CAD"}`, 330, currentY, { align: "right", width: 215 });
      currentY += 15;
      doc.text(`Taxes (TPS/TVQ Canada) : ${taxAmount.toFixed(2)} $ CAD`, 330, currentY, { align: "right", width: 215 });
      currentY += 18;

      doc.rect(320, currentY, 235, 30).fill("#064e3b");
      doc.fillColor("#ffffff").fontSize(11).font("Helvetica-Bold").text(`TOTAL FACTURÉ & RÉGLÉ : ${total.toFixed(2)} $ CAD`, 325, currentY + 9, { align: "center", width: 225 });

      // Pied de page
      doc.fillColor("#94a3b8").fontSize(8).font("Helvetica").text("VEGEDERM BIO COSMECEUTIQUES — Maison canadienne de soins botaniques & pommades d'exception.", 40, 780, { align: "center" });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}
