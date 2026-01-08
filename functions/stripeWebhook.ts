import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    console.log('Webhook event received:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.user_id;
      const subscriptionType = session.metadata.subscription_type;

      console.log('Payment completed for user:', userId, 'Type:', subscriptionType);

      await base44.asServiceRole.entities.User.update(userId, {
        subscription_type: subscriptionType,
        subscription_start: new Date().toISOString(),
      });

      console.log('User subscription updated successfully');
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      console.log('Subscription cancelled for customer:', customerId);

      const users = await base44.asServiceRole.entities.User.filter({
        stripe_customer_id: customerId,
      });

      if (users.length > 0) {
        await base44.asServiceRole.entities.User.update(users[0].id, {
          subscription_type: null,
        });
        console.log('User subscription removed');
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});