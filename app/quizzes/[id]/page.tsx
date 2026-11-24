import { PrismaClient } from "../../generated/prisma/client";
import { notFound } from "next/navigation";
import QuizPlayer, { Question } from "./QuizPlayer";

export const instant = false;
const prisma = new PrismaClient();

function getQuestionsForQuiz(title: string, customQuestions: unknown): Question[] {
  if (Array.isArray(customQuestions) && customQuestions.length > 0) {
    return customQuestions as Question[];
  }

  const lowerTitle = title.toLowerCase();

  // Test dedicat pentru "Romanul Ion" / "Ion" / Literatură română
  if (lowerTitle.includes("ion") || lowerTitle.includes("roman") || lowerTitle.includes("rebreanu")) {
    return [
      {
        id: 1,
        question: "Cine este autorul romanului realist obiectiv 'Ion'?",
        options: ["Liviu Rebreanu", "Mihail Sadoveanu", "Camil Petrescu", "George Călinescu"],
        correctIndex: 0,
        explanation: "Liviu Rebreanu a publicat romanul 'Ion' în anul 1920, fiind considerat primul mare roman realist modern din literatura română.",
      },
      {
        id: 2,
        question: "În ce sat din Ardeal este plasată acțiunea principală a romanului?",
        options: ["Satul Măgura", "Satul Pripas", "Satul Valea Mare", "Satul Amara"],
        correctIndex: 1,
        explanation: "Satul Pripas este spațiul rural reprezentativ descris detaliat de Rebreanu încă de la începutul operei.",
      },
      {
        id: 3,
        question: "Care sunt cele două mari 'glasuri' interioare care conduc destinul personajului Ion?",
        options: [
          "Glasul datoriei și glasul mândriei",
          "Glasul pământului și glasul iubirii",
          "Glasul credinței și glasul averii",
          "Glasul răzbunării și glasul dreptății",
        ],
        correctIndex: 1,
        explanation: "Cele două părți ale romanului ('Glasul pământului' și 'Glasul iubirii') reflectă cele două obsesii majore ale personajului.",
      },
      {
        id: 4,
        question: "De ce se căsătorește Ion cu Ana, fiica lui Vasile Baciu?",
        options: [
          "Din dragoste profundă și sinceră",
          "Pentru a obține pământurile și averea familiei",
          "Din ordinul învățătorului Herdelea",
          "Pentru a scăpa de serviciul militar",
        ],
        correctIndex: 1,
        explanation: "Ion o seduce și o ia de soție pe Ana pentru a-l constrânge pe Vasile Baciu să-i cedeze toate pământurile.",
      },
      {
        id: 5,
        question: "Pe cine iubea cu adevărat personajul Ion Pop al Glanetașului?",
        options: ["Pe Ana", "Pe Florica", "Pe Laura Herdelea", "Pe Ghighi"],
        correctIndex: 1,
        explanation: "Florica era fata frumoasă, dar săracă, pe care Ion o iubea cu adevărat, dragoste la care revine fatal după obținerea averii.",
      },
    ];
  }

  // Întrebări interactive pentru alte materii / quiz-uri generale
  return [
    {
      id: 1,
      question: `Care este conceptul esențial abordat în tema "${title}"?`,
      options: [
        "Înțelegerea principiilor fundamentale și a terminologiei de bază",
        "Memorarea mecanică fără aplicare practică",
        "Omiterea noțiunilor teoretice",
        "Studiul superficial al noțiunilor",
      ],
      correctIndex: 0,
      explanation: "Studiul aprofundat începe întotdeauna prin însușirea conceptelor și a termenilor esențiali.",
    },
    {
      id: 2,
      question: "Care este cea mai eficientă metodă de consolidare a cunoștințelor dintr-o materie?",
      options: [
        "Rezolvarea de quiz-uri și teste practice aplicate",
        "Citirea pasivă a textului o singură dată",
        "Lăsarea recapitulării pentru ziua dinaintea examenului",
        "Ignorarea întrebărilor la care ai ezitat",
      ],
      correctIndex: 0,
      explanation: "Testarea activă (active recall) prin quiz-uri îmbunătățește retenția cunoștințelor pe termen lung cu peste 70%.",
    },
    {
      id: 3,
      question: "Cum te ajută organizarea materiei în sinteze structurate?",
      options: [
        "Permite identificarea rapidă a conexiunilor logice între idei",
        "Nu oferă niciun beneficiu practic",
        "Îngreunează înțelegerea conceptelor cheie",
        "Înlocuiește complet necesitatea de a exersa",
      ],
      correctIndex: 0,
      explanation: "Structurarea logică a materiei ajută creierul să stocheze informația eficient în memoria de lungă durată.",
    },
  ];
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quizId = Number(id);

  if (!Number.isInteger(quizId) || quizId <= 0) {
    notFound();
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { user: true },
  });

  if (!quiz) {
    notFound();
  }

  const questions = getQuestionsForQuiz(quiz.title, quiz.questions);

  const quizData = {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    authorName: quiz.user?.name ?? "Utilizator",
    createdAt: quiz.createdAt.toISOString(),
    questions,
  };

  return <QuizPlayer quiz={quizData} />;
}
