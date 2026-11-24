import { NextResponse } from "next/server";
import { extractTextFromPdfBuffer } from "../../../../lib/pdfExtractor";
import { generateQuizFromText } from "../../../../lib/quizGenerator";
import { getAuthenticatedUser, createNotification } from "../../../../lib/notifications";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  let requestedFileName = "document";

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      if (user) {
        await createNotification({
          userId: user.id,
          title: "Eșec la generarea quiz-ului din PDF",
          message: "Nu a fost trimis niciun fișier pentru procesare.",
          type: "error",
          link: "/quizzes/create",
        });
      }

      return NextResponse.json(
        { error: "Nu a fost trimis niciun fișier." },
        { status: 400 }
      );
    }

    requestedFileName = file.name;

    // Numele fișierului fără extensie ca titlu implicit
    const fileName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    const inferredTitle = fileName.charAt(0).toUpperCase() + fileName.slice(1);

    // Citim bufferul fișierului
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      extractedText = extractTextFromPdfBuffer(buffer);
    } else {
      // Dacă este text/markdown
      extractedText = buffer.toString("utf-8");
    }

    // Generăm întrebările din conținutul extras
    const questions = generateQuizFromText(extractedText, inferredTitle);

    // Notificare automată: Generarea cu succes a unui quiz din PDF
    if (user) {
      await createNotification({
        userId: user.id,
        title: "Quiz generat din PDF",
        message: `Au fost generate cu succes ${questions.length} întrebări din documentul «${file.name}».`,
        type: "success",
        link: "/quizzes/create",
      });
    }

    return NextResponse.json({
      success: true,
      title: inferredTitle,
      textSnippet: extractedText.length > 200 ? extractedText.substring(0, 200) + "..." : extractedText,
      questions,
    });
  } catch (err) {
    console.error("[generate-from-pdf]", err);

    // Notificare automată: Eșecul generării unui quiz din PDF
    if (user) {
      await createNotification({
        userId: user.id,
        title: "Eșec la generarea quiz-ului din PDF",
        message: `A apărut o eroare la procesarea fișierului PDF «${requestedFileName}». Verifică dacă documentul conține text lizibil.`,
        type: "error",
        link: "/quizzes/create",
      });
    }

    return NextResponse.json(
      { error: "A apărut o eroare la procesarea fișierului PDF." },
      { status: 500 }
    );
  }
}
