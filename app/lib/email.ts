import nodemailer from "nodemailer";

export interface OrderEmailData {
  id: string;
  guestName?: string | null;
  guestEmail?: string | null;
  address: string | any;
  subtotal?: number;
  shippingCost?: number;
  taxAmount?: number;
  total: number;
  items: any[];
  createdAt: Date | string;
}

/**
 * Envoie un courriel de confirmation et de facture officielle au client.
 */
export async function sendCustomerInvoiceEmail(order: OrderEmailData) {
  const recipientEmail = order.guestEmail;
  if (!recipientEmail) {
    console.log("⚠️ Aucun courriel client fourni pour l'envoi de la facture.");
    return;
  }

  let addressObj: any = {};
  try {
    addressObj = typeof order.address === "string" ? JSON.parse(order.address) : order.address;
  } catch {}

  const shortId = order.id.slice(-8).toUpperCase();
  const hostUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const formattedDate = new Date(order.createdAt).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const itemsHtml = order.items
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #1a202c;">
        ${item.product?.name || item.name || "Produit VEGEDERM"}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #edf2f7; text-align: center; color: #4a5568;">
        x${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: bold; color: #1a202c;">
        ${((item.unitPrice || item.price) * item.quantity).toFixed(2)} $ CAD
      </td>
    </tr>`
    )
    .join("");

  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Facture VEGEDERM #${shortId}</title>
  </head>
  <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7fafc; margin: 0; padding: 20px; color: #2d3748;">
    <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      
      <!-- Header -->
      <div style="background-color: #064e3b; padding: 32px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-family: Georgia, serif; letter-spacing: 1px; color: #ffffff;">VEGEDERM BIO COSMECEUTIQUES</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px;">Confirmation & Facture d'Achat</p>
      </div>

      <!-- Main Body -->
      <div style="padding: 32px 24px;">
        <p style="font-size: 15px; margin-top: 0;">Bonjour <strong>${order.guestName || "Cher client"}</strong>,</p>
        <p style="font-size: 14px; color: #4a5568; line-height: 1.6;">
          Nous vous remercions chaleureusement pour votre commande chez <strong>VEGEDERM BIO COSMECEUTIQUES</strong>. Votre transaction a été validée avec succès.
        </p>

        <!-- Order Summary Box -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 24px 0;">
          <table style="width: 100%; font-size: 13px;">
            <tr>
              <td style="color: #718096; padding-bottom: 6px;">N° de Commande / Facture :</td>
              <td style="text-align: right; font-weight: bold; font-family: monospace; color: #064e3b; font-size: 14px; padding-bottom: 6px;">#${shortId}</td>
            </tr>
            <tr>
              <td style="color: #718096; padding-bottom: 6px;">Date de transaction :</td>
              <td style="text-align: right; font-weight: bold; color: #2d3748; padding-bottom: 6px;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="color: #718096;">ID Transaction Unique :</td>
              <td style="text-align: right; font-family: monospace; font-size: 11px; color: #718096;">${order.id}</td>
            </tr>
          </table>
        </div>

        <!-- Address Box -->
        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 13px; text-transform: uppercase; color: #718096; margin-bottom: 8px; letter-spacing: 0.5px;">Adresse de livraison (Canada) :</h4>
          <p style="font-size: 13px; background-color: #fff; border: 1px solid #edf2f7; padding: 12px 16px; border-radius: 10px; margin: 0; line-height: 1.5;">
            <strong>${order.guestName || "Client"}</strong><br>
            ${addressObj.street || ""}<br>
            ${addressObj.city || ""}, ${addressObj.province || ""} ${addressObj.postalCode || ""}<br>
            🇨🇦 Canada
          </p>
        </div>

        <!-- Items Table -->
        <h4 style="font-size: 13px; text-transform: uppercase; color: #718096; margin-bottom: 12px; letter-spacing: 0.5px;">Détail de vos articles :</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #edf2f7; color: #4a5568; text-align: left; font-size: 12px; text-transform: uppercase;">
              <th style="padding: 10px 12px; border-radius: 8px 0 0 8px;">Article</th>
              <th style="padding: 10px 12px; text-align: center;">Quantité</th>
              <th style="padding: 10px 12px; text-align: right; border-radius: 0 8px 8px 0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Totals Calculation -->
        <div style="width: 100%; max-width: 280px; margin-left: auto; font-size: 13px; line-height: 1.8;">
          ${
            order.subtotal
              ? `<div style="display: flex; justify-content: space-between; color: #718096;">
                  <span>Sous-total :</span>
                  <span style="font-weight: bold; color: #2d3748;">${order.subtotal.toFixed(2)} $ CAD</span>
                </div>`
              : ""
          }
          <div style="display: flex; justify-content: space-between; color: #718096;">
            <span>Livraison (Canada) :</span>
            <span style="font-weight: bold; color: #2d3748;">${(order.shippingCost ?? 13.0).toFixed(2)} $ CAD</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #064e3b; border-top: 2px solid #064e3b; padding-top: 8px; margin-top: 6px;">
            <span>TOTAL FACTURÉ :</span>
            <span>${order.total.toFixed(2)} $ CAD</span>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid #edf2f7; margin: 32px 0 20px 0;">

        <p style="font-size: 12px; color: #a0aec0; text-align: center; line-height: 1.5; margin: 0;">
          Conservez ce courriel comme preuve d'achat et facture officielle.<br>
          Pour toute question concernant votre commande <strong>#${shortId}</strong>, contactez notre support à 
          <a href="mailto:support@vegedermbiocosmeceutiques.com" style="color: #059669; text-decoration: underline;">contact@vegedermbiocosmeceutiques.com</a>.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #718096; border-top: 1px solid #edf2f7;">
        © ${new Date().getFullYear()} VEGEDERM BIO COSMECEUTIQUES — Tous droits réservés.
      </div>
    </div>
  </body>
  </html>
  `;

  console.log(`
=================================================================
📄 FACTURE ENVOYÉE AU CLIENT — VEGEDERM BIO COSMECEUTIQUES
=================================================================
Destinataire : ${recipientEmail}
Facture N° : #${shortId} (ID: ${order.id})
Total : ${order.total.toFixed(2)} $ CAD
=================================================================
`);

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: Boolean(process.env.SMTP_SECURE),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: '"VEGEDERM BIO COSMECEUTIQUES" <facturation@vegedermbiocosmeceutiques.com>',
        to: recipientEmail,
        subject: `📄 Votre Facture & Confirmation de Commande #${shortId} — VEGEDERM`,
        html: emailHtml,
      });
    } catch (err) {
      console.error("Échec de l'envoi de la facture par SMTP:", err);
    }
  }
}

export async function sendAdminOrderNotification(order: OrderEmailData) {
  let addressObj: any = {};
  try {
    addressObj = typeof order.address === "string" ? JSON.parse(order.address) : order.address;
  } catch {}

  const adminEmail = process.env.ADMIN_EMAIL || "midogiova@gmail.com";
  const hostUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  console.log(`
=================================================================
📧 NOUVELLE COMMANDE REÇUE — VEGEDERM BIO COSMECEUTIQUES
=================================================================
Commande N° : #${order.id.slice(-8).toUpperCase()} (ID: ${order.id})
Client : ${order.guestName || "Client Invité"} (${order.guestEmail || "Non renseigné"})
Adresse de Livraison (Canada) : ${addressObj.street || ""}, ${addressObj.city || ""}, ${addressObj.province || ""} ${addressObj.postalCode || ""} 🇨🇦 Canada
Total de la commande : ${order.total.toFixed(2)} $ CAD

Articles commandés :
${order.items
  .map(
    (i: any) =>
      `- ${i.product?.name || i.name || i.productId || "Produit"} x${i.quantity} (${((i.unitPrice || i.price) * i.quantity).toFixed(2)} $ CAD)`
  )
  .join("\n")}

Lien Panneau Admin : ${hostUrl}/admin/commandes/${order.id}
=================================================================
`);

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: Boolean(process.env.SMTP_SECURE),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: '"VEGEDERM BOTANICALS" <noreply@vegedermbiocosmeceutiques.com>',
        to: adminEmail,
        subject: `🚨 NOUVELLE COMMANDE #${order.id.slice(-8).toUpperCase()} — ${order.total.toFixed(2)} $ CAD`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="color: #10b565;">VEGEDERM BIO COSMECEUTIQUES</h2>
            <h3>Nouvelle commande reçue !</h3>
            <p><strong>N° Commande :</strong> #${order.id.slice(-8).toUpperCase()}</p>
            <p><strong>Client :</strong> ${order.guestName || "Invité"} (${order.guestEmail})</p>
            <p><strong>Total :</strong> ${order.total.toFixed(2)} $ CAD</p>
            <p><strong>Adresse (Canada) :</strong> ${addressObj.street || ""}, ${addressObj.city || ""}, ${addressObj.province || ""} ${addressObj.postalCode || ""} 🇨🇦</p>
            <a href="${hostUrl}/admin/commandes/${order.id}" style="background: #10b565; color: white; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 12px;">
              Voir dans le Panneau Admin →
            </a>
          </div>
        `,
      });
    } catch (err) {
      console.error("Failed to send SMTP email notification:", err);
    }
  }
}
