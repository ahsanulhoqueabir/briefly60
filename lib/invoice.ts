import { SUBSCRIPTION_PLANS } from "@/lib/subscription-constants";
import { UserSubscriptionStatus } from "@/types/subscription.types";

export async function generateInvoicePDF(
  subscription_status: UserSubscriptionStatus,
) {
  if (!subscription_status?.subscription) {
    throw new Error("No subscription data available");
  }

  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();

  // Brand colors (converted from oklch to RGB approximations)
  const primaryColor: [number, number, number] = [33, 128, 141]; // #21808d (Teal)
  const secondaryColor: [number, number, number] = [238, 64, 35]; // #ee4023 (Orange-Red)
  const lightGray: [number, number, number] = [248, 250, 252];
  const darkGray: [number, number, number] = [51, 65, 85];

  const invoiceId = `INV-${Date.now().toString().slice(-8)}`;
  const planObj = SUBSCRIPTION_PLANS.find(
    (p) => p.id === subscription_status.subscription?.plan,
  );
  const planName =
    planObj?.name_en ||
    planObj?.name ||
    subscription_status.subscription?.plan ||
    "Subscription";
  const price = planObj?.price ?? 0;
  const startDate = subscription_status.subscription?.start_date
    ? (subscription_status.subscription.start_date instanceof Date
        ? subscription_status.subscription.start_date
        : new Date(subscription_status.subscription.start_date)
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
  const endDate = subscription_status.subscription?.end_date
    ? (subscription_status.subscription.end_date instanceof Date
        ? subscription_status.subscription.end_date
        : new Date(subscription_status.subscription.end_date)
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";
  const issueDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Header with brand colors
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 45, "F");

  // Add logo image
  try {
    // Note: In production, you should convert logo.png to base64 and embed it
    // For now, we'll use a fallback text logo if image fails
    const logoPath =
      typeof window !== "undefined" ? "/logo.png" : "public/logo.png";
    const logoImg = new Image();
    logoImg.src = logoPath;
    await new Promise<void>((resolve, reject) => {
      logoImg.onload = () => {
        doc.addImage(logoImg, "PNG", 20, 12, 60, 30);
        resolve();
      };
      logoImg.onerror = () => reject(new Error("Logo failed to load"));
      // Timeout after 2 seconds
      setTimeout(() => reject(new Error("Logo load timeout")), 2000);
    });
  } catch {
    // Fallback to text logo if image fails
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Briefly", 20, 25);
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.roundedRect(58, 15, 16, 10, 2, 2, "F");
    doc.setFontSize(18);
    doc.text("60", 60, 23);
  }

  // Invoice details in header
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Invoice #: ${invoiceId}`, 150, 25);
  doc.text(`Date: ${issueDate}`, 150, 32);

  // Company info section
  let yPos = 55;
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Briefly60", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Your trusted news companion", 20, yPos + 5);
  doc.text("www.briefly60.com", 20, yPos + 10);

  // Bill To section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("BILL TO", 20, yPos + 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Valued Subscriber", 20, yPos + 26);

  // Subscription details table
  yPos = 95;
  autoTable(doc, {
    startY: yPos,
    head: [["Description", "Duration", "Amount"]],
    body: [
      [
        `${planName} Plan\nSubscription Period`,
        `${startDate}\nto\n${endDate}`,
        `${price} Taka`,
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: darkGray,
      cellPadding: 8,
    },
    columnStyles: {
      0: { cellWidth: 80, halign: "left" },
      1: { cellWidth: 60, halign: "center" },
      2: { cellWidth: 40, halign: "right", fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
  });

  // Total section with colored background
  const docWithAutoTable = doc as typeof doc & {
    lastAutoTable?: { finalY: number };
  };
  const finalY = docWithAutoTable.lastAutoTable?.finalY || yPos + 30;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(130, finalY + 5, 60, 12, "F");
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total Amount:", 135, finalY + 13);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(14);
  doc.text(`${price} Taka`, 182, finalY + 13, { align: "right" });

  // Additional info table
  autoTable(doc, {
    startY: finalY + 25,
    head: [["Subscription Details"]],
    body: [
      ["Payment Method: SSLCommerz"],
      [
        `Days Remaining: ${subscription_status.subscription?.days_remaining ?? 0} days`,
      ],
      ["Payment Status: Confirmed"],
    ],
    theme: "plain",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
      halign: "left",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: darkGray,
      cellPadding: 4,
    },
    margin: { left: 20, right: 20 },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, pageHeight - 25, 210, 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for subscribing to Briefly60!", 105, pageHeight - 15, {
    align: "center",
  });
  doc.setFontSize(8);
  doc.text(
    "For support, contact us at support@briefly60.com",
    105,
    pageHeight - 9,
    { align: "center" },
  );

  // Save the PDF
  doc.save(`Briefly60_Invoice_${invoiceId}.pdf`);
}
