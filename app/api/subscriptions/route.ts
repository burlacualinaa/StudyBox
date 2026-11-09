import { NextResponse } from "next/server";
import {
  getAllSubscriptions,
  addSubscription,
} from "../../../lib/subscriptionAccessor";

// INDEX - afișarea tuturor abonamentelor
export async function GET() {
  try {
    const subscriptions = await getAllSubscriptions();

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Eroare la citirea abonamentelor:", error);

    return NextResponse.json(
      { error: "Nu s-au putut încărca abonamentele." },
      { status: 500 }
    );
  }
}

// CREATE - salvarea unui abonament nou
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const userId = Number(body.userId);
    const plan = String(body.plan ?? "").trim();
    const price = Number(body.price);
    const startDate = new Date(body.startDate);
    const endDate = body.endDate
      ? new Date(body.endDate)
      : null;

    if (
      !Number.isInteger(userId) ||
      userId <= 0 ||
      !["Basic", "Premium", "Pro"].includes(plan) ||
      !Number.isFinite(price) ||
      price < 0 ||
      Number.isNaN(startDate.getTime()) ||
      (endDate !== null &&
        (Number.isNaN(endDate.getTime()) ||
          endDate < startDate))
    ) {
      return NextResponse.json(
        { error: "Datele abonamentului nu sunt valide." },
        { status: 400 }
      );
    }

    const subscription = await addSubscription({
      userId,
      plan,
      price,
      startDate,
      endDate,
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error("Eroare la crearea abonamentului:", error);

    return NextResponse.json(
      { error: "Abonamentul nu a putut fi salvat." },
      { status: 500 }
    );
  }
}