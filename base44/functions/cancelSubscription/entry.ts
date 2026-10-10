import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      console.error('Unauthorized: No user found');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User subscription_type:', user.subscription_type);

    if (!user.subscription_type || user.subscription_type !== 'monthly') {
      console.error('Not a monthly subscriber:', user.email, 'Type:', user.subscription_type);
      return Response.json({ error: 'Only monthly subscriptions can be cancelled. Lifetime subscriptions do not require cancellation.' }, { status: 400 });
    }

    // Find the subscription by customer email
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (!customers.data.length) {
      console.error('No Stripe customer found for:', user.email);
      return Response.json({ error: 'No subscription found' }, { status: 404 });
    }

    const customer = customers.data[0];

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    if (!subscriptions.data.length) {
      console.error('No active subscription found for customer:', customer.id);
      return Response.json({ error: 'No active subscription found' }, { status: 404 });
    }

    const subscription = subscriptions.data[0];

    // Cancel at period end (not immediately)
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    // Update user entity with cancellation date
    await base44.auth.updateMe({
      subscription_cancel_at: updatedSubscription.current_period_end,
    });

    console.log('Subscription cancelled for:', user.email, 'Sub ID:', subscription.id, 'Ends at:', updatedSubscription.current_period_end);

    return Response.json({
      success: true,
      message: 'Subscription will cancel at the end of the billing period',
      cancel_at: updatedSubscription.current_period_end,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});