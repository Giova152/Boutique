import nodemailer from "nodemailer";
import { generateInvoicePDFBuffer } from "@/app/lib/pdf";

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

export interface AdminInvitationEmailData {
  name: string;
  email: string;
  password?: string;
  role: string;
}

/**
 * Envoie un courriel avec un code de confirmation à 6 chiffres pour valider un nouveau compte acheteur.
 */
export async function sendVerificationCodeEmail(data: { name: string; email: string; code: string }) {
  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Code de confirmation — VEGEDERM</title>
  </head>
  <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
    <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
      
      <!-- Header -->
      <div style="background-color: #064e3b; padding: 28px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-family: Georgia, serif; color: #ffffff;">VEGEDERM BIO COSMECEUTIQUES</h1>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #a7f3d0; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px;">Validation de votre Compte Acheteur</p>
      </div>

      <!-- Content -->
      <div style="padding: 28px 24px; text-align: center;">
        <p style="font-size: 15px; margin-top: 0; text-align: left;">Bonjour <strong>${data.name}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; text-align: left;">
          Pour finaliser la création de votre compte client et valider votre adresse courriel chez <strong>VEGEDERM BIO COSMECEUTIQUES</strong>, voici votre code de vérification :
        </p>

        <!-- Code Box -->
        <div style="background-color: #ecfdf5; border: 2px dashed #059669; border-radius: 16px; padding: 20px; margin: 24px 0; text-align: center;">
          <span style="font-size: 32px; font-weight: 800; font-family: monospace; letter-spacing: 6px; color: #065f46;">
            ${data.code}
          </span>
          <p style="font-size: 11px; color: #047857; margin: 8px 0 0 0; font-weight: bold;">Ce code expire dans 15 minutes.</p>
        </div>

        <p style="font-size: 12px; color: #94a3b8; text-align: left; line-height: 1.5;">
          Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message en toute sécurité.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
        © ${new Date().getFullYear()} VEGEDERM BIO COSMECEUTIQUES — Soins Bio & Naturels
      </div>
    </div>
  </body>
  </html>
  `;

  console.log(`
=================================================================
🔑 CODE DE VÉRIFICATION COMPTE CLIENT
=================================================================
Destinataire : ${data.email} (${data.name})
CODE : ${data.code}
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
        from: '"VEGEDERM CLIENT" <bienvenue@vegedermbiocosmeceutiques.com>',
        to: data.email,
        subject: `🔑 ${data.code} est votre code de confirmation — VEGEDERM`,
        html: emailHtml,
      });
    } catch (err) {
      console.error("Échec de l'envoi du code par SMTP:", err);
    }
  }
}

/**
 * Envoie un courriel personnalisé d'invitation avec les accès lors de la création d'un administrateur.
 */
export async function sendAdminInvitationEmail(adminData: AdminInvitationEmailData) {
  const hostUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const loginUrl = `${hostUrl}/admin/connexion`;

  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Accès Administrateur — VEGEDERM</title>
  </head>
  <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
      
      <!-- Header -->
      <div style="background-color: #0f172a; padding: 32px 24px; text-align: center; color: #ffffff;">
        <div style="width: 48px; height: 48px; background: #059669; border-radius: 12px; font-size: 22px; font-weight: bold; line-height: 48px; margin: 0 auto 12px auto; color: white;">V</div>
        <h1 style="margin: 0; font-size: 22px; font-family: Georgia, serif; color: #ffffff;">VEGEDERM BIO COSMECEUTIQUES</h1>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #10b981; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px;">Accès au Panneau d'Administration</p>
      </div>

      <!-- Content -->
      <div style="padding: 32px 24px;">
        <p style="font-size: 15px; margin-top: 0; font-weight: bold;">Bonjour ${adminData.name},</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          Un compte d'administration avec le rôle <strong>${adminData.role === "superadmin" ? "Super Administrateur" : "Administrateur Standard"}</strong> a été créé pour vous sur la plateforme de gestion VEGEDERM.
        </p>

        <!-- Access Box -->
        <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 14px; padding: 20px; margin: 24px 0;">
          <h4 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px;">Vos identifiants de connexion :</h4>
          <table style="width: 100%; font-size: 13px;">
            <tr>
              <td style="color: #64748b; padding-bottom: 8px;">Identifiant / Email :</td>
              <td style="text-align: right; font-weight: bold; font-family: monospace; color: #0f172a;">${adminData.email}</td>
            </tr>
            ${
              adminData.password
                ? `<tr>
                    <td style="color: #64748b; padding-bottom: 8px;">Mot de passe temporaire :</td>
                    <td style="text-align: right; font-weight: bold; font-family: monospace; color: #059669; font-size: 14px;">${adminData.password}</td>
                  </tr>`
                : ""
            }
            <tr>
              <td style="color: #64748b;">Rôle attribué :</td>
              <td style="text-align: right; font-weight: bold; color: #0f172a; text-transform: capitalize;">${adminData.role}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
          🔒 Pour des raisons de sécurité, vous pouvez vous connecter directement via le lien ci-dessous.
        </p>

        <!-- Login Button -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="${loginUrl}" style="background-color: #059669; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2);">
            Accéder au Panneau Admin →
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px 0;">

        <p style="font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5; margin: 0;">
          Si vous n'êtes pas l'auteur de cette demande ou si vous avez des questions, veuillez contacter l'administrateur principal.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
        © ${new Date().getFullYear()} VEGEDERM BIO COSMECEUTIQUES — Sécurité Administration
      </div>
    </div>
  </body>
  </html>
  `;

  console.log(`
=================================================================
✉️ COURRIEL D'INVITATION ADMIN ENVOYÉ
=================================================================
Destinataire : ${adminData.email} (${adminData.name})
Rôle : ${adminData.role}
Mot de Passe : ${adminData.password || "[Masqué / inchangé]"}
Lien d'accès : ${loginUrl}
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
        from: '"VEGEDERM ADMIN" <admin@vegedermbiocosmeceutiques.com>',
        to: adminData.email,
        subject: `🔐 Vos accès Administrateur VEGEDERM — Bienvenue ${adminData.name}`,
        html: emailHtml,
      });
    } catch (err) {
      console.error("Échec de l'envoi de l'invitation admin par SMTP:", err);
    }
  }
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

  let pdfBuffer: Buffer | null = null;
  try {
    pdfBuffer = await generateInvoicePDFBuffer(order);
  } catch (err) {
    console.error("Échec de génération de la facture PDF:", err);
  }

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
        attachments: pdfBuffer
          ? [
              {
                filename: `facture-VEGEDERM-${shortId}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ]
          : [],
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

/**
 * Alerte l'administrateur lorsqu'une commande a été annulée par un client.
 */
export async function sendAdminOrderCancellationEmail(order: OrderEmailData) {
  const shortId = order.id.slice(-8).toUpperCase();
  const adminEmail = process.env.ADMIN_EMAIL || "midogiova@gmail.com";
  const hostUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  console.log(`
=================================================================
⚠️ ALERTE ADMIN : COMMANDE ANNULÉE — VEGEDERM
=================================================================
Commande N° : #${shortId} (ID: ${order.id})
Client : ${order.guestName || "Client Invité"} (${order.guestEmail || "Non renseigné"})
Montant Annulé : ${order.total.toFixed(2)} $ CAD
Statut Stock : Remis en stock automatiquement
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
        from: '"VEGEDERM ALERTE" <alertes@vegedermbiocosmeceutiques.com>',
        to: adminEmail,
        subject: `⚠️ ALERTE : Commande #${shortId} Annulée (${order.total.toFixed(2)} $ CAD)`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="color: #e11d48;">VEGEDERM BIO COSMECEUTIQUES</h2>
            <h3 style="color: #9f1239;">Alerte : Commande Annulée</h3>
            <p>La commande <strong>#${shortId}</strong> a été annulée par le client dans la période de rétractation de 30 minutes.</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 16px 0;" />
            <p><strong>Client :</strong> ${order.guestName || "Invité"} (${order.guestEmail})</p>
            <p><strong>Montant Annulé :</strong> ${order.total.toFixed(2)} $ CAD</p>
            <p><strong>Impact Stock :</strong> Les articles ont été automatiquement remis en stock.</p>
            <a href="${hostUrl}/admin/commandes/${order.id}" style="background: #e11d48; color: white; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 12px;">
              Voir dans le Panneau Admin →
            </a>
          </div>
        `,
      });
    } catch (err) {
      console.error("Échec d'envoi du mail d'annulation admin par SMTP:", err);
    }
  }
}

/**
 * Envoie une confirmation d'annulation de commande au client.
 */
export async function sendCustomerOrderCancellationEmail(order: OrderEmailData) {
  const recipientEmail = order.guestEmail;
  if (!recipientEmail) return;

  const shortId = order.id.slice(-8).toUpperCase();

  console.log(`
=================================================================
❌ CONFIRMATION D'ANNULATION CLIENT — VEGEDERM
=================================================================
Destinataire : ${recipientEmail}
Commande N° : #${shortId}
Montant : ${order.total.toFixed(2)} $ CAD
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
        from: '"VEGEDERM BIO COSMECEUTIQUES" <service@vegedermbiocosmeceutiques.com>',
        to: recipientEmail,
        subject: `❌ Annulation confirmée — Commande #${shortId} VEGEDERM`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
            <h2 style="color: #059669;">VEGEDERM BIO COSMECEUTIQUES</h2>
            <h3>Votre commande a bien été annulée</h3>
            <p>Bonjour ${order.guestName || ""},</p>
            <p>Nous vous confirmons que votre commande <strong>#${shortId}</strong> d'un montant de <strong>${order.total.toFixed(2)} $ CAD</strong> a été annulée sans aucun frais.</p>
            <p style="color: #64748b; font-size: 13px;">Si vous avez des questions ou souhaitez passer une nouvelle commande, toute notre équipe reste à votre entière disposition.</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8;">© ${new Date().getFullYear()} VEGEDERM BIO COSMECEUTIQUES</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Échec d'envoi du mail d'annulation client par SMTP:", err);
    }
  }
}

