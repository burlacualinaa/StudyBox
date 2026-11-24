export type GeneratedQuestion = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

// Domenii recunoscute din text pentru întrebări adaptate
type SubjectDomain = "literature" | "history" | "biology" | "physics_chem" | "geography" | "tech" | "general";

export function generateQuizFromText(rawText: string, title?: string): GeneratedQuestion[] {
  const cleanText = preprocessText(rawText);
  const domain = detectDomain(cleanText, title || "");
  const extractedFacts = extractKeyFacts(cleanText);

  const questions: GeneratedQuestion[] = [];
  const usedConcepts = new Set<string>();

  // 1. Întrebări generate din definițiile și conceptele clare extrase din document
  for (const fact of extractedFacts) {
    if (questions.length >= 6) break;

    const key = fact.concept.toLowerCase();
    if (usedConcepts.has(key)) continue;
    usedConcepts.add(key);

    const q = buildConceptualQuestion(fact, domain, cleanText);
    if (q) {
      questions.push({
        ...q,
        id: questions.length + 1,
      });
    }
  }

  // 2. Dacă avem un text specific unui domeniu (ex. Literatură, Istorie), adăugăm întrebări relevante
  if (questions.length < 5) {
    const domainQuestions = generateDomainSpecificQuestions(cleanText, domain, title || "");
    for (const dq of domainQuestions) {
      if (questions.length >= 6) break;
      const key = dq.question.toLowerCase();
      if (!usedConcepts.has(key)) {
        usedConcepts.add(key);
        questions.push({
          ...dq,
          id: questions.length + 1,
        });
      }
    }
  }

  // 3. Fallback garantat: dacă textul a fost prea scurt sau scanat
  if (questions.length < 3) {
    const fallbackQ = generateCuratedFallbackQuestions(title || "Lecție / Curs", domain);
    for (const fq of fallbackQ) {
      if (questions.length >= 5) break;
      questions.push({
        ...fq,
        id: questions.length + 1,
      });
    }
  }

  return questions;
}

// ─── 1. Preprocesare și Curățare text ──────────────────────────────────────────
function preprocessText(text: string): string {
  return text
    // Elimină numere de pagină izolate sau antete tipice
    .replace(/\b(?:Pagina|Page|Capitolul|Cap\.)\s+\d+\b/gi, "")
    .replace(/https?:\/\/[^\s]+/g, "")
    .replace(/[•▪\-_*~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── 2. Detecție domeniu din text ─────────────────────────────────────────────
function detectDomain(text: string, title: string): SubjectDomain {
  const combined = (title + " " + text).toLowerCase();

  const literatureKeywords = ["roman", "autor", "personaj", "operă", "poezie", "nuvelă", "rebreanu", "sadoveanu", "creangă", "eminescu", "călinescu", "conflict", "narator", "literar", "proză", "versuri", "ion"];
  const historyKeywords = ["război", "bătălie", "domnie", "rege", "tratat", "imperiu", "revoluție", "secol", "anul 1", "anul 2", "constituție", "armată", "unire", "istorie", "pace", "conducător"];
  const biologyKeywords = ["celulă", "organism", "mitocondrie", "adn", "fotosinteză", "sistem", "enzimă", "membrană", "respirație", "proteină", "țesut", "biologie", "bacterie", "inimă", "creier"];
  const physicsKeywords = ["energie", "masă", "forță", "viteză", "reacție", "acid", "moleculă", "atom", "curent", "tensiune", "temperatură", "presiune", "fizică", "chimie", "densitate"];
  const geographyKeywords = ["relief", "climat", "climă", "râu", "continent", "populație", "capitală", "munți", "câmpie", "geografie", "ocean", "regiune"];

  const countMatches = (keywords: string[]) => keywords.reduce((acc, k) => acc + (combined.includes(k) ? 1 : 0), 0);

  const litCount = countMatches(literatureKeywords);
  const histCount = countMatches(historyKeywords);
  const bioCount = countMatches(biologyKeywords);
  const physCount = countMatches(physicsKeywords);
  const geoCount = countMatches(geographyKeywords);

  const max = Math.max(litCount, histCount, bioCount, physCount, geoCount);
  if (max < 2) return "general";
  if (max === litCount) return "literature";
  if (max === histCount) return "history";
  if (max === bioCount) return "biology";
  if (max === physCount) return "physics_chem";
  if (max === geoCount) return "geography";
  return "general";
}

// ─── 3. Extragere fapte clare și propoziții logice ────────────────────────────
type ExtractedFact = {
  concept: string;
  relation: "definition" | "role" | "feature" | "temporal";
  detail: string;
  fullSentence: string;
};

function extractKeyFacts(text: string): ExtractedFact[] {
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 35 && s.length <= 220);

  const facts: ExtractedFact[] = [];

  // Tipare de definiție: "[Termen] este/reprezintă [Explicație]"
  const defPattern = /\b([A-ZĂÎÂȘȚ][a-zăîâșțA-ZĂÎÂȘȚ\s\-]{2,30})\s+(este|reprezintă|se definește ca|se numește)\s+([^,.;]+(?:,\s*[^,.;]+){0,2})/i;
  // Tipare de rol/funcție: "[Termen] are rolul de / are ca scop / contribuie la"
  const rolePattern = /\b([A-ZĂÎÂȘȚ][a-zăîâșțA-ZĂÎÂȘȚ\s\-]{2,30})\s+(are rolul de a|are ca scop|asigură|permite|servește la|are funcția de)\s+([^,.;]+)/i;
  // Tipare de caracteristică: "[Termen] se caracterizează prin / cuprinde / include"
  const featurePattern = /\b([A-ZĂÎÂȘȚ][a-zăîâșțA-ZĂÎÂȘȚ\s\-]{2,30})\s+(se caracterizează prin|se distinge prin|cuprinde|include|se remarcă prin)\s+([^,.;]+)/i;

  for (const sentence of sentences) {
    let match = sentence.match(defPattern);
    if (match) {
      const concept = cleanConcept(match[1]);
      const detail = cleanDetail(match[3]);
      if (isValidFact(concept, detail)) {
        facts.push({ concept, relation: "definition", detail, fullSentence: sentence });
        continue;
      }
    }

    match = sentence.match(rolePattern);
    if (match) {
      const concept = cleanConcept(match[1]);
      const detail = cleanDetail(match[3]);
      if (isValidFact(concept, detail)) {
        facts.push({ concept, relation: "role", detail, fullSentence: sentence });
        continue;
      }
    }

    match = sentence.match(featurePattern);
    if (match) {
      const concept = cleanConcept(match[1]);
      const detail = cleanDetail(match[3]);
      if (isValidFact(concept, detail)) {
        facts.push({ concept, relation: "feature", detail, fullSentence: sentence });
        continue;
      }
    }
  }

  return facts;
}

function cleanConcept(raw: string): string {
  return raw.replace(/^(în|pe|la|prin|pentru|de|din|cu)\s+/i, "").trim();
}

function cleanDetail(raw: string): string {
  return raw.replace(/^[a-zăîâșț\s]{1,3}\s+/i, "").trim().replace(/[.]$/, "");
}

function isValidFact(concept: string, detail: string): boolean {
  if (concept.length < 3 || concept.length > 35) return false;
  if (detail.length < 12 || detail.length > 90) return false;
  // Evităm concepte care sunt doar pronume sau cuvinte introductive
  const stopWords = ["acesta", "aceasta", "acestea", "acestia", "el", "ea", "care", "unul", "fiecare", "faptul", "totul"];
  if (stopWords.includes(concept.toLowerCase())) return false;
  return true;
}

// ─── 4. Generare întrebare conceptuală formulată natural ──────────────────────
function buildConceptualQuestion(
  fact: ExtractedFact,
  domain: SubjectDomain,
  fullText: string
): Omit<GeneratedQuestion, "id"> | null {
  const { concept, relation, detail, fullSentence } = fact;

  // Asigurăm că răspunsul corect este o frază clară și completă
  const correctAnswer = capitalize(detail);

  let questionText = "";
  if (relation === "definition") {
    questionText = `Conform materialului, cum se definește corect noțiunea de "${concept}"?`;
  } else if (relation === "role") {
    questionText = `Care este rolul principal îndeplinit de "${concept}" în contextul studiat?`;
  } else if (relation === "feature") {
    questionText = `Care este una dintre principalele trăsături caracteristice ale noțiunii de "${concept}"?`;
  } else {
    questionText = `Ce aspect esențial este asociat cu "${concept}" în lecție?`;
  }

  const distractors = createIntelligentDistractors(correctAnswer, domain);
  const options = shuffle([correctAnswer, ...distractors]);

  return {
    question: questionText,
    options,
    correctIndex: options.indexOf(correctAnswer),
    explanation: `Explicație din curs: "${fullSentence}"`,
  };
}

// ─── 5. Variante greșite inteligente (Distractori plauzibili) ──────────────────
function createIntelligentDistractors(correct: string, domain: SubjectDomain): string[] {
  const lower = correct.toLowerCase();

  // Distractori inteligenți pentru Literatură
  if (domain === "literature") {
    const litOptions = [
      "O tehnică secundară de caracterizare episodică fără rol în conflictul central",
      "O convenție narativă utilizată exclusiv în literatura clasică a secolului al XIX-lea",
      "O perspectivă subiectivă a unui narator neimplicat afectiv în acțiune",
      "Un element pur decorativ care nu influențează dinamica personajelor",
      "O etapă incipientă a intrigii fără corespondență în deznodământ",
    ];
    return pickDistractors(litOptions, lower);
  }

  // Distractori pentru Istorie
  if (domain === "history") {
    const histOptions = [
      "O măsură provizorie adoptată fără consensul forțelor politice majore",
      "O reformă inițiată abia în perioada postbelică pe fondul crizelor economice",
      "O inițiativă diplomatică respinsă de tratatele internaționale semnate ulterior",
      "O mișcare de rezistență locală care nu a obținut recunoaștere la nivel statal",
      "O consecință directă a conflictelor diplomatice din secolul precedent",
    ];
    return pickDistractors(histOptions, lower);
  }

  // Distractori pentru Biologie / Științe
  if (domain === "biology" || domain === "physics_chem") {
    const sciOptions = [
      "Un proces pasiv care se desfășoară fără consum energetic la nivel celular",
      "O reacție intermediară cu efect inhibitor asupra mecanismelor de sinteză",
      "O componentă structurală temporară eliminată în fazele inițiale de dezvoltare",
      "O adaptare funcțională observată exclusiv în condiții extreme de mediu",
      "Un mecanism compensator ce intervine doar la scăderea concentrației optime",
    ];
    return pickDistractors(sciOptions, lower);
  }

  // Distractori generali, logici și bine formulați gramatical
  const generalOptions = [
    "O abordare alternativă utilizată doar în cazuri speciale sau excepții",
    "Un stadiu tranzitoriu care precede stabilirea concluziei definitive",
    "Un factor extern cu impact redus asupra desfășurării fenomenului principal",
    "O premisă teoretică ce a fost revizuită în capitolele aplicative ulterioare",
    "O metodă complementară ce nu influențează structura fundamentală a temei",
  ];
  return pickDistractors(generalOptions, lower);
}

function pickDistractors(pool: string[], correctLower: string): string[] {
  const filtered = pool.filter((d) => d.toLowerCase() !== correctLower);
  const shuffled = shuffle(filtered);
  return shuffled.slice(0, 3);
}

// ─── 6. Întrebări specifice de domeniu dacă sunt recunoscute opere/subiecte ─────
function generateDomainSpecificQuestions(
  text: string,
  domain: SubjectDomain,
  title: string
): Omit<GeneratedQuestion, "id">[] {
  const lower = (text + " " + title).toLowerCase();
  const list: Omit<GeneratedQuestion, "id">[] = [];

  // Caz specific literatură: Ion de Liviu Rebreanu
  if (lower.includes("ion") || lower.includes("rebreanu")) {
    list.push({
      question: "Care este conflictul central care declanșează drama personajului Ion în roman?",
      options: [
        "Dilema dintre pasiunea devorantă pentru pământ și dragostea sinceră pentru Florica",
        "Neînțelegerile politice cu autoritățile administrative din satul Pripas",
        "Rivalitatea intelectuală cu învățătorul Zaharia Herdelea",
        "Dorința exclusivă de a pleca din mediul rural către oraș",
      ],
      correctIndex: 0,
      explanation: "Destinul lui Ion este sfâșiat între 'Glasul pământului' (obsesia averii) și 'Glasul iubirii' (atracția pentru Florica).",
    });
    list.push({
      question: "Cum este concepută structura compozițională a romanului realist 'Ion'?",
      options: [
        "O structură circulară, simetrică, deschisă și închisă de imaginea drumului spre satul Pripas",
        "O structură episodică fragmentară, bazată pe tehnica jurnalului intim",
        "O succesiune de scrisori și monologuri interioare fără cronologie fixă",
        "O formă de teatru narativizat împărțită pe acte simbolice",
      ],
      correctIndex: 0,
      explanation: "Romanul începe și se termină cu descrierea drumului ce duce spre și iese din satul Pripas, simbol al destinului.",
    });
    list.push({
      question: "Ce rol are personajul Ana în planul strategic al lui Ion?",
      options: [
        "Este mijlocul prin care Ion îl constrânge pe Vasile Baciu să-i cedeze întreaga avere în pământuri",
        "Este adevărata sa iubire din copilărie pentru care luptă împotriva familiei",
        "Reprezintă sprijinul moral care îl convinge să renunțe la lăcomie",
        "Este confidenta care mediază conflictul dintre Ion și George Bulbuc",
      ],
      correctIndex: 0,
      explanation: "Ion o seduce pe Ana doar pentru statut și pământuri, relația lor ducând la destinul tragic al fetei.",
    });
  }

  // Caz specific istorie: Unirea sau Primul Război Mondial
  if (lower.includes("unire") || lower.includes("1918") || lower.includes("război")) {
    list.push({
      question: "Care a fost principalul obiectiv strategic urmărit în documentele epocii analizate?",
      options: [
        "Afirmarea suveranității naționale și consolidarea integrității teritoriale a statului",
        "Renunțarea la tratatele internaționale pentru o politică de izolare completă",
        "Subordonarea intereselor economice interne intereselor marilor imperii vecine",
        "Amânarea reformelor constituționale până la depășirea tensiunilor externe",
      ],
      correctIndex: 0,
      explanation: "Toate tratatele și marile adunări din această perioadă au urmărit recunoașterea independenței și unificarea teritorială.",
    });
  }

  return list;
}

// ─── 7. Întrebări generale de înaltă ținută pentru orice curs ─────────────────
function generateCuratedFallbackQuestions(title: string, domain: SubjectDomain): Omit<GeneratedQuestion, "id">[] {
  return [
    {
      question: `Care este concluzia de bază pe care un elev/student trebuie să o rețină din tema "${title}"?`,
      options: [
        "Înțelegerea noțiunilor fundamentale și aplicarea lor logică în rezolvarea de probleme",
        "Memorarea exclusivă a datelor brute fără realizarea de conexiuni de cauzalitate",
        "Omiterea noțiunilor introductive și concentrarea doar pe excepții rare",
        "Tratarea superficială a definițiilor și a termenilor specifici",
      ],
      correctIndex: 0,
      explanation: "Studiul eficient se bazează pe înțelegerea conceptuală profundă, nu pe memorare mecanică.",
    },
    {
      question: "Cum se recomandă sintetizarea ideilor principale dintr-un material stufos de studiu?",
      options: [
        "Prin identificarea cuvintelor-cheie, structurarea pe idei principale și autoevaluare prin quiz-uri",
        "Prin rescrierea integrală a textului fără nicio selecție a informației",
        "Prin ignorarea exemplelor practice oferite de profesor",
        "Prin parcurgerea textului o singură dată în grabă chiar înainte de examen",
      ],
      correctIndex: 0,
      explanation: "Metoda recapitulării active prin scheme și teste grilă oferă cea mai mare rată de promovare.",
    },
    {
      question: "Ce rol are verificarea noțiunilor prin întrebări aplicate după parcurgerea materialului?",
      options: [
        "Fixează conceptele în memoria de lungă durată și semnalează capitolele ce necesită recapitulare",
        "Nu oferă niciun beneficiu suplimentar față de simpla lectură a textului",
        "Creează confuzie între termenii apropiați semantic",
        "Înlocuiește complet necesitatea parcurgerii teoriei",
      ],
      correctIndex: 0,
      explanation: "Autoevaluarea continuă ajută la depistarea lacunelor înainte de examenele oficiale.",
    },
  ];
}

// ─── Utilitare ────────────────────────────────────────────────────────────────
function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
