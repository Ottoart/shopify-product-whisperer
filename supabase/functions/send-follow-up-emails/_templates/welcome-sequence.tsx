import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Img,
  Hr,
  Button,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface WelcomeSequenceEmailProps {
  customerName: string
  customerEmail: string
  company: string
  emailNumber: number // 1, 2, or 3 for sequence
}

export const WelcomeSequenceEmail = ({
  customerName,
  customerEmail,
  company,
  emailNumber,
}: WelcomeSequenceEmailProps) => {
  const getEmailContent = () => {
    switch (emailNumber) {
      case 1:
        return {
          subject: "Welcome to PrepFox! Here's what happens next",
          preview: "Your fulfillment transformation journey starts here",
          title: "Welcome to the PrepFox Family! 🎉",
          content: (
            <>
              <Text style={text}>
                Hi {customerName},
              </Text>
              
              <Text style={text}>
                Welcome to PrepFox! We're thrilled that {company} has joined thousands of brands who trust us with their fulfillment operations.
              </Text>

              <Section style={highlightBox}>
                <Heading style={h2}>What You Can Expect:</Heading>
                
                <Text style={bulletPoint}>
                  🚀 <strong>Day 1-3:</strong> Account setup and integration planning
                </Text>
                
                <Text style={bulletPoint}>
                  📦 <strong>Week 1:</strong> First inventory received and processed
                </Text>
                
                <Text style={bulletPoint}>
                  📊 <strong>Week 2:</strong> Full operations live with real-time analytics
                </Text>
                
                <Text style={bulletPoint}>
                  💰 <strong>Month 1:</strong> Cost savings and efficiency improvements visible
                </Text>
              </Section>

              <Text style={text}>
                Tomorrow, you'll receive our "Getting Started Guide" with step-by-step instructions for your first shipment.
              </Text>
            </>
          ),
          cta: "Access Your Dashboard",
          ctaUrl: "https://rtaomiqsnctigleqjojt.supabase.co/dashboard"
        };
      
      case 2:
        return {
          subject: "Your PrepFox Getting Started Guide",
          preview: "Everything you need for your first shipment",
          title: "Ready for Your First Shipment? 📦",
          content: (
            <>
              <Text style={text}>
                Hi {customerName},
              </Text>
              
              <Text style={text}>
                Ready to send your first inventory to PrepFox? Here's everything {company} needs to know.
              </Text>

              <Section style={highlightBox}>
                <Heading style={h2}>Pre-Shipment Checklist:</Heading>
                
                <Text style={bulletPoint}>
                  ✅ <strong>Inventory List:</strong> Upload your SKU manifest in your dashboard
                </Text>
                
                <Text style={bulletPoint}>
                  ✅ <strong>Shipping Labels:</strong> Use our provided warehouse address
                </Text>
                
                <Text style={bulletPoint}>
                  ✅ <strong>Prep Requirements:</strong> Review our packaging guidelines
                </Text>
                
                <Text style={bulletPoint}>
                  ✅ <strong>Notification:</strong> Schedule arrival with 48hr notice
                </Text>
              </Section>

              <Text style={text}>
                Pro tip: Most clients see 20-30% cost savings within the first month. Your dedicated specialist will monitor your performance and suggest optimizations.
              </Text>
            </>
          ),
          cta: "Upload Inventory List",
          ctaUrl: "https://rtaomiqsnctigleqjojt.supabase.co/send-inventory"
        };
      
      case 3:
        return {
          subject: "Maximizing Your PrepFox Experience",
          preview: "Advanced features and optimization tips",
          title: "Unlock Advanced Features 🔓",
          content: (
            <>
              <Text style={text}>
                Hi {customerName},
              </Text>
              
              <Text style={text}>
                Now that {company} is set up with PrepFox, let's explore some advanced features that can take your operations to the next level.
              </Text>

              <Section style={highlightBox}>
                <Heading style={h2}>Advanced Features to Explore:</Heading>
                
                <Text style={bulletPoint}>
                  🤖 <strong>AI Optimization:</strong> Automated inventory placement and routing
                </Text>
                
                <Text style={bulletPoint}>
                  📊 <strong>Analytics Dashboard:</strong> Real-time performance metrics and insights
                </Text>
                
                <Text style={bulletPoint}>
                  🔄 <strong>Auto-Reorder:</strong> Smart inventory replenishment triggers
                </Text>
                
                <Text style={bulletPoint}>
                  🌍 <strong>Global Expansion:</strong> International fulfillment capabilities
                </Text>
              </Section>

              <Text style={text}>
                Questions? Your fulfillment specialist is always available for a quick strategy call to discuss how these features can benefit your specific business model.
              </Text>
            </>
          ),
          cta: "Schedule Strategy Call",
          ctaUrl: "https://calendly.com/prepfox-specialist"
        };
      
      default:
        return {
          subject: "Welcome to PrepFox",
          preview: "Getting started with your fulfillment solution",
          title: "Welcome to PrepFox!",
          content: <Text style={text}>Welcome to PrepFox fulfillment services!</Text>,
          cta: "Get Started",
          ctaUrl: "https://rtaomiqsnctigleqjojt.supabase.co"
        };
    }
  };

  const emailContent = getEmailContent();

  return (
    <Html>
      <Head />
      <Preview>{emailContent.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://rtaomiqsnctigleqjojt.supabase.co/storage/v1/object/public/assets/prepfox-logo.png"
              width="120"
              height="40"
              alt="PrepFox"
              style={logo}
            />
          </Section>

          <Section style={content}>
            <Heading style={h1}>{emailContent.title}</Heading>
            
            {emailContent.content}

            <Section style={buttonContainer}>
              <Button
                href={emailContent.ctaUrl}
                style={primaryButton}
              >
                {emailContent.cta}
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={text}>
              Need help? Our support team is available 24/7 at{' '}
              <Link href="mailto:support@prepfox.com" style={link}>
                support@prepfox.com
              </Link>
            </Text>

            <Text style={footer}>
              Best regards,<br />
              The PrepFox Team<br />
              Your Complete E-commerce Fulfillment Solution
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeSequenceEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
}

const header = {
  padding: '32px 20px',
  backgroundColor: '#ffffff',
  borderRadius: '8px 8px 0 0',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const content = {
  padding: '32px 40px',
  backgroundColor: '#ffffff',
  borderRadius: '0 0 8px 8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
}

const h1 = {
  color: '#1a202c',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#2d3748',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0 0 16px',
}

const text = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const highlightBox = {
  backgroundColor: '#edf2f7',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #e2e8f0',
}

const bulletPoint = {
  color: '#2d3748',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 12px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const primaryButton = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1',
  padding: '16px 32px',
  textDecoration: 'none',
  textAlign: 'center' as const,
}

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
}

const hr = {
  border: 'none',
  borderTop: '1px solid #e2e8f0',
  margin: '32px 0',
}

const footer = {
  color: '#718096',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '16px 0 0 0',
  textAlign: 'center' as const,
}