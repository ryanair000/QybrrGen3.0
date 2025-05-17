import { NextResponse } from 'next/server';
// import { client } from '@/lib/sanity/client'; // Sanity client no longer used here for now
import mailchimp from '@mailchimp/mailchimp_marketing';
import { Resend } from 'resend'; // Import Resend

// Initialize Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// User-provided verified Resend 'From' email address
const RESEND_FROM_EMAIL = 'support@qybrrlabs.blog';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    // // Sanity: Check if email already exists (optional - Mailchimp handles duplicates too)
    // const existingSubscriberSanity = await client.fetch(
    //   `*[_type == "newsletterSubscription" && email == $email][0]`,
    //   { email }
    // );

    // if (existingSubscriberSanity) {
    //   return NextResponse.json({ message: 'Email already subscribed (Sanity).' }, { status: 409 });
    // }

    let mailchimpSuccess = false;

    try {
      await mailchimp.lists.addListMember(process.env.MAILCHIMP_AUDIENCE_ID!, {
        email_address: email,
        status: 'subscribed', // Changed from 'pending' to 'subscribed' for single opt-in
      });
      mailchimpSuccess = true;
      // console.log('Mailchimp subscription successful (single opt-in)');

    } catch (error: any) {
      console.error('Mailchimp API error:', error.response?.body || error.message || error);
      
      // Check for specific Mailchimp error for already subscribed or pending
      // Mailchimp's API might return different error structures.
      // Common indicators for an existing member (either subscribed, unsubscribed, or pending):
      // - error.response.body.title === 'Member Exists'
      // - error.response.body.detail might contain "is already a list member" or similar.
      // - error.status === 400 (Bad Request) can also indicate an existing member if the title/detail matches.
      if (error.response && error.response.body && 
          (error.response.body.title === 'Member Exists' || 
           (typeof error.response.body.detail === 'string' && error.response.body.detail.toLowerCase().includes('already a list member')) ||
           (error.status === 400 && typeof error.response.body.detail === 'string' && error.response.body.detail.toLowerCase().includes('is already subscribed'))
          )
         ) {
        return NextResponse.json({ message: 'This email is already subscribed.' }, { status: 409 }); // Updated message
      }
      
      // General Mailchimp or other error
      const errorMessage = error.response?.body?.detail || error.message || 'Mailchimp processing failed.';
      return NextResponse.json({ message: errorMessage }, { status: 500 });
    }

    // If Mailchimp processing was successful, try to send a welcome email via Resend
    if (mailchimpSuccess) {
      try {
        await resend.emails.send({
          from: RESEND_FROM_EMAIL,
          to: email,
          subject: 'Welcome to the QybrrLabs Newsletter– Your AI Edge Starts Here!',
          html: `
<div>
  <p>Hi,</p>
  <p>The future of AI isn't just coming—it's already here, and you're now part of the inner circle. 🌐✨</p>
  <p>As a subscriber, you'll get:</p>
  <ul>
    <li>Exclusive access to cutting-edge AI insights (before anyone else).</li>
    <li>Pro tips to supercharge your SaaS strategy with automation.</li>
    <li>Behind-the-scenes peeks at QybrrLabs' latest breakthroughs.</li>
  </ul>
  <p>No fluff, just high-impact intelligence to keep you ahead. Ready to dive in?</p>
  <p>
    <a href="#YOUR_LATEST_REPORT_URL_HERE" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Read Our Latest AI Report
    </a>
  </p>
  <p>"The best way to predict the future is to build it." — Let's build smarter, together.</p>
  <p>– The QybrrLabs Team</p>
</div>
`,
        });
        // console.log('Resend welcome email sent successfully.');
      } catch (resendError: any) {
        console.error('Resend API error:', resendError.message || resendError);
        // Do not fail the whole request if Resend fails
      }
      // Return success message for direct subscription
      return NextResponse.json({ message: 'Successfully subscribed! Welcome aboard.' }, { status: 200 }); // Updated message
    }

    // // Sanity: Create subscription (optional, if you want to store in Sanity as well)
    // const subscriptionData = {
    //   _type: 'newsletterSubscription',
    //   email: email,
    //   subscribedAt: new Date().toISOString(),
    // }; 

    // try {
    //   if (!client) {
    //     console.error('Sanity client is not initialized for secondary save.');
    //     // Don't fail the whole request if Sanity write fails, Mailchimp is primary
    //   } else {
    //      await client.create(subscriptionData);
    //   }
    // } catch (sanityError) {
    //   console.error('Failed to save subscription to Sanity after Mailchimp success:', sanityError);
    //   // Don't fail the whole request
    // }

    // Fallback if mailchimpSuccess was somehow not true and no error was thrown by Mailchimp (unlikely)
    return NextResponse.json({ message: 'Subscription processing issue.' }, { status: 500 });

  } catch (error) { // Outer catch for request parsing or other unexpected errors
    console.error('General subscription API error (outer catch):', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 