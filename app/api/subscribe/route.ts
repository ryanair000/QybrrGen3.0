import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity/client'; // Adjust path as needed

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    if (!client) {
      console.error('Sanity client is not initialized.');
      return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
    }

    // Check if email already exists to prevent duplicates
    const existingSubscriber = await client.fetch(
      `*[_type == "newsletterSubscription" && email == $email][0]`,
      { email }
    );

    if (existingSubscriber) {
      return NextResponse.json({ message: 'Email already subscribed.' }, { status: 409 }); // 409 Conflict
    }

    const subscriptionData = {
      _type: 'newsletterSubscription',
      email: email,
      subscribedAt: new Date().toISOString(),
    };

    await client.create(subscriptionData);

    return NextResponse.json({ message: 'Successfully subscribed!' }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('Subscription API error:', error);
    // Check if the error is a Sanity error and provide more specific feedback if possible
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
        // Potentially log more details from error.message or error.stack for server-side debugging
        // For client-facing error, keep it generic or map to user-friendly messages
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
} 