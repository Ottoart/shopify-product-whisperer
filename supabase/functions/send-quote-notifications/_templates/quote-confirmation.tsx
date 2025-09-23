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

interface QuoteConfirmationEmailProps {
  customerName: string
  customerEmail: string
  serviceType: string
  estimatedSavings: string
  company: string
  monthlyVolume?: string
  timeline?: string
  quoteRequestId: string
}

export const QuoteConfirmationEmail = ({
  customerName,
  customerEmail,
  serviceType,
  estimatedSavings,
  company,
  monthlyVolume,
  timeline,
  quoteRequestId,
}: QuoteConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Thank you for your quote request - We'll respond within 24 hours</Preview>
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
          <Heading style={h1}>Thank You for Your Quote Request! 📋</Heading>
          
          <Text style={text}>
            Hi {customerName},
          </Text>
          
          <Text style={text}>
            Thank you for requesting a quote for our <strong>{serviceType}</strong> services. We're excited to help {company} optimize their fulfillment operations!
          </Text>

          <Section style={quoteDetails}>
            <Heading style={h2}>Your Quote Request Details</Heading>
            
            <Text style={detailItem}>
              <strong>Service:</strong> {serviceType}
            </Text>
            <Text style={detailItem}>
              <strong>Company:</strong> {company}
            </Text>
            {monthlyVolume && (
              <Text style={detailItem}>
                <strong>Monthly Volume:</strong> {monthlyVolume}
              </Text>
            )}
            {timeline && (
              <Text style={detailItem}>
                <strong>Timeline:</strong> {timeline}
              </Text>
            )}
            <Text style={detailItem}>
              <strong>Estimated Savings:</strong> {estimatedSavings}
            </Text>
            <Text style={detailItem}>
              <strong>Quote ID:</strong> #{quoteRequestId.slice(-8).toUpperCase()}
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={nextSteps}>
            <Heading style={h2}>What Happens Next?</Heading>
            
            <Text style={stepText}>
              🕐 <strong>Within 1 hour:</strong> We'll confirm receipt and assign a fulfillment specialist
            </Text>
            
            <Text style={stepText}>
              📊 <strong>Within 24 hours:</strong> You'll receive a detailed custom proposal with pricing
            </Text>
            
            <Text style={stepText}>
              📞 <strong>Within 48 hours:</strong> Your specialist will schedule a strategy call to discuss your specific needs
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button
              href={`https://rtaomiqsnctigleqjojt.supabase.co/fulfillment/quote-success?id=${quoteRequestId}`}
              style={button}
            >
              View Quote Status
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            In the meantime, feel free to explore our fulfillment services or reach out if you have any immediate questions.
          </Text>

          <Text style={footer}>
            Questions? Reply to this email or contact us at{' '}
            <Link href="mailto:quotes@prepfox.com" style={link}>
              quotes@prepfox.com
            </Link>
          </Text>
          
          <Text style={footer}>
            PrepFox - Your Complete E-commerce Fulfillment Solution
            <br />
            Optimizing supply chains for growing brands worldwide
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default QuoteConfirmationEmail

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
  fontSize: '20px',
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

const quoteDetails = {
  backgroundColor: '#f7fafc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #e2e8f0',
}

const detailItem = {
  color: '#2d3748',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 8px',
}

const nextSteps = {
  margin: '24px 0',
}

const stepText = {
  color: '#4a5568',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 12px',
  paddingLeft: '8px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
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
  margin: '8px 0',
  textAlign: 'center' as const,
}