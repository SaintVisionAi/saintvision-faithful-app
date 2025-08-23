// HACP.AI Stripe Payment Configuration

export const STRIPE_CONFIG = {
  publishableKey: "pk_live_51RAfTZFZsXxBWnjQS7I98SC6Bq6PUWb8GsOB6K061FNStjfMgn2khsrSrrqDuZZrkA6vi3rOK5FthNAInW1Bhx4L00aAznwNJv",
  
  // Buy Button IDs for embedded payments
  buyButtons: {
    pro: "buy_btn_1Ryb5MFZsXxBWnjQnan8yT7g",
    unlimited: "buy_btn_1Ryb7gFZsXxBWnjQ6BGjWNMJ",
    enterprise: "buy_btn_1Ryb7zFZsXxBWnjQY59sPTpK",
    whiteLabel: "buy_btn_1Ryb3DFZsXxBWnjQp3mibWHZ",
  },
  
  // Direct Stripe Checkout Links
  checkoutLinks: {
    pro: "https://buy.stripe.com/14AbJ1ci8fLb4qocPa4Vy04",
    whiteLabel: "https://buy.stripe.com/7sY5kDdmc2Ype0YdTe4Vy03",
    unlimited: "https://buy.stripe.com/bJefZh0zqdD3aOMdTe4Vy05",
    enterprise: "https://buy.stripe.com/4gM9ATaa0buVaOM7uQ4Vy06",
  },
  
  // Plan Configuration
  plans: {
    pro: {
      name: "Pro Plan",
      description: "Professional AI features with enhanced capabilities and priority support",
      price: "$49/month",
      features: ["5 AI Agents", "100 Conversations/month", "Priority Support", "Advanced Analytics"]
    },
    unlimited: {
      name: "Unlimited Plan", 
      description: "Unlimited access to all HACP™ features and capabilities",
      price: "$199/month",
      features: ["50 AI Agents", "Unlimited Conversations", "24/7 Support", "Custom Integrations"]
    },
    enterprise: {
      name: "Enterprise Plan",
      description: "Full enterprise solution with dedicated support and custom deployment",
      price: "Custom Pricing",
      features: ["100 AI Agents", "Unlimited Everything", "Dedicated Support", "On-Premise Options"]
    },
    whiteLabel: {
      name: "White Label Plan",
      description: "Complete white-label solution for resellers and partners",
      price: "$999/month",
      features: ["500 AI Agents", "Full Customization", "Partner Support", "Revenue Sharing"]
    }
  }
}

export type PlanKey = keyof typeof STRIPE_CONFIG.plans