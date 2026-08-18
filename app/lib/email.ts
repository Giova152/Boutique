import nodemailer from "nodemailer";

export async function sendAdminOrderNotification(order: {
  id: string;
  guestName?: string | null;
  guestEmail?: string | null;
  address: string;
  total: number;
  items: any[];
  createdAt: Date | string;
}) {
  let addressObj: any = {};
  try {
    addressObj = typeof order.address === "string" ? JSON.parse(order.address) : order.address;
  } catch {}

  const adminEmail = process.env.ADMIN_EMAIL || "admin@vegedermbiocosmeceutiques.com";

  const hostUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  console.log(`
=================================================================
📧 NOUVELLE COMMANDE REÇUE — VEGEDERM BIO COSMECEUTIQUES
=================================================================
Commande N° : #${order.id.slice(-8)} (ID: ${order.id})
Client : ${order.guestName || "Client Invité"} (${order.guestEmail || "Non renseigné"})
Adresse de Livraison (Canada) : ${addressObj.street || ""}, ${addressObj.city || ""}, ${addressObj.province || ""} ${addressObj.postalCode || ""} 🇨🇦 Canada
Total de la commande : ${order.total.toFixed(2)} $ CAD

Articles commandés :
${order.items
  .map(
    (i: any) =>
      `- ${i.product?.name || i.productId || "Produit"} x${i.quantity} (${(i.unitPrice * i.quantity).toFixed(2)} $ CAD)`
  )
  .join("\n")}

Lien Panneau Admin : ${hostUrl}/admin/commandes/${order.id}
=================================================================
`);

  // Send real email if SMTP is configured
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
        subject: `🚨 NOUVELLE COMMANDE #${order.id.slice(-8)} — ${order.total.toFixed(2)} $ CAD`,
        html: `
          <div font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="color: #10b565;">VEGEDERM BIO COSMECEUTIQUES</h2>
            <h3>Nouvelle commande reçue !</h3>
            <p><strong>N° Commande :</strong> #${order.id.slice(-8)}</p>
            <p><strong>Client :</strong> ${order.guestName} (${order.guestEmail})</p>
            <p><strong>Total :</strong> ${order.total.toFixed(2)} $ CAD</p>
            <p><strong>Adresse (Canada) :</strong> ${addressObj.street}, ${addressObj.city}, ${addressObj.province} ${addressObj.postalCode} 🇨🇦</p>
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
