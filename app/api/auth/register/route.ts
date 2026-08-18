import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { sendVerificationCodeEmail } from "@/app/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, name, email, password, code } = body;

    if (!email) {
      return NextResponse.json({ error: "L'adresse courriel est requise." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ÉTAPE 1 : GÉNÉRATION ET ENVOI DU CODE DE CONFIRMATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (action === "send-code") {
      if (!name) {
        return NextResponse.json({ error: "Veuillez fournir votre nom complet." }, { status: 400 });
      }

      // 1. SÉCURITÉ : Vérifier si l'adresse est réservée à l'administration
      const existingAdmin = await prisma.admin.findUnique({
        where: { email: cleanEmail },
      });

      if (existingAdmin) {
        return NextResponse.json(
          { error: "🛑 Cette adresse courriel est réservée au personnel d'administration. Elle ne peut pas être utilisée pour créer un compte acheteur." },
          { status: 400 }
        );
      }

      // 2. Vérifier si l'adresse est déjà un compte acheteur existant
      const existingCustomer = await prisma.customer.findUnique({
        where: { email: cleanEmail },
      });

      if (existingCustomer) {
        return NextResponse.json(
          { error: "Cette adresse courriel est déjà enregistrée pour un compte acheteur. Veuillez vous connecter." },
          { status: 400 }
        );
      }

      // Générer un code à 6 chiffres
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = (Date.now() + 15 * 60 * 1000).toString(); // Valide 15 minutes

      // Stocker le code et son expiration dans StoreSettings
      await prisma.storeSettings.upsert({
        where: { key: `vcode_${cleanEmail}` },
        update: { value: generatedCode },
        create: { key: `vcode_${cleanEmail}`, value: generatedCode },
      });

      await prisma.storeSettings.upsert({
        where: { key: `vexpires_${cleanEmail}` },
        update: { value: expiresAt },
        create: { key: `vexpires_${cleanEmail}`, value: expiresAt },
      });

      // Envoi du courriel
      await sendVerificationCodeEmail({
        name: name.trim(),
        email: cleanEmail,
        code: generatedCode,
      });

      return NextResponse.json({
        success: true,
        message: `Un code de confirmation à 6 chiffres a été envoyé à ${cleanEmail}. Veuillez vérifier votre boîte mail.`,
      });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ÉTAPE 2 : VÉRIFICATION DU CODE ET CRÉATION DU COMPTE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (action === "verify-and-register") {
      if (!name || !password || !code) {
        return NextResponse.json(
          { error: "Veuillez remplir tous les champs obligatoires ainsi que le code de confirmation." },
          { status: 400 }
        );
      }

      // SÉCURITÉ : Bloquer si c'est une adresse administrateur
      const existingAdmin = await prisma.admin.findUnique({
        where: { email: cleanEmail },
      });
      if (existingAdmin) {
        return NextResponse.json(
          { error: "🛑 Cette adresse courriel est réservée à l'administration." },
          { status: 400 }
        );
      }

      // Récupérer le code stocké
      const storedCodeSetting = await prisma.storeSettings.findUnique({
        where: { key: `vcode_${cleanEmail}` },
      });
      const storedExpiresSetting = await prisma.storeSettings.findUnique({
        where: { key: `vexpires_${cleanEmail}` },
      });

      if (!storedCodeSetting || !storedExpiresSetting) {
        return NextResponse.json(
          { error: "Aucun code trouvé pour ce courriel. Veuillez cliquer sur 'Recevoir mon code'." },
          { status: 400 }
        );
      }

      const expiresTime = parseInt(storedExpiresSetting.value, 10);
      if (Date.now() > expiresTime) {
        return NextResponse.json(
          { error: "Le code de confirmation a expiré. Veuillez en demander un nouveau." },
          { status: 400 }
        );
      }

      if (storedCodeSetting.value.trim() !== code.trim()) {
        return NextResponse.json(
          { error: "Code de confirmation incorrect. Veuillez réessayer." },
          { status: 400 }
        );
      }

      // Vérification finale si le compte existe déjà entre-temps
      const existingCustomer = await prisma.customer.findUnique({
        where: { email: cleanEmail },
      });
      if (existingCustomer) {
        return NextResponse.json(
          { error: "Ce compte existe déjà. Connectez-vous." },
          { status: 400 }
        );
      }

      // Création du compte dans la table Customer
      const passwordHash = await bcrypt.hash(password, 10);
      const newCustomer = await prisma.customer.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          passwordHash,
        },
      });

      // Nettoyage des clés temporaires de code de vérification
      await prisma.storeSettings.deleteMany({
        where: {
          key: { in: [`vcode_${cleanEmail}`, `vexpires_${cleanEmail}`] },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Félicitations ! Votre compte a été validé et créé avec succès. Vous pouvez maintenant vous connecter.",
        customer: {
          id: newCustomer.id,
          name: newCustomer.name,
          email: newCustomer.email,
        },
      });
    }

    return NextResponse.json({ error: "Action non valide" }, { status: 400 });
  } catch (error: any) {
    console.error("Erreur Inscription Client:", error);
    return NextResponse.json(
      { error: error.message || "Erreur de création de compte" },
      { status: 500 }
    );
  }
}
