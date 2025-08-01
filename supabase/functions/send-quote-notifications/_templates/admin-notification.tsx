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

interface AdminNotificationEmailProps {
  customerName: string
  customerEmail: string
  company: string
  serviceType: string
  monthlyVolume?: string
  timeline?: string
  painPoints?: string
  additionalServices: string[]
  message?: string
  quoteRequestId: string
}

export const AdminNotificationEmail = ({
  customerName,
  customerEmail,
  company,
  serviceType,
  monthlyVolume,
  timeline,
  painPoints,
  additionalServices,
  message,
  quoteRequestId,
}: AdminNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>New quote request from {company} - {serviceType}</Preview>
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
          <Heading style={h1}>🚨 New Quote Request!</Heading>
          
          <Text style={text}>
            A new quote request has been submitted and needs immediate attention.
          </Text>

          <Section style={quoteDetails}>
            <Heading style={h2}>Customer Information</Heading>
            
            <Text style={detailItem}>
              <strong>Name:</strong> {customerName}
            </Text>
            <Text style={detailItem}>
              <strong>Email:</strong> {customerEmail}
            </Text>
            <Text style={detailItem}>
              <strong>Company:</strong> {company}
            </Text>
            <Text style={detailItem}>
              <strong>Service Requested:</strong> {serviceType}
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
            
            {additionalServices.length > 0 && (
              <Text style={detailItem}>
                <strong>Additional Services:</strong> {additionalServices.join(', ')}
              </Text>
            )}
            
            <Text style={detailItem}>
              <strong>Quote ID:</strong> #{quoteRequestId.slice(-8).toUpperCase()}
            </Text>
          </Section>

          {painPoints && (
            <Section style={quoteDetails}>
              <Heading style={h2}>Current Challenges</Heading>
              <Text style={text}>{painPoints}</Text>
            </Section>
          )}

          {message && (
            <Section style={quoteDetails}>
              <Heading style={h2}>Additional Details</Heading>
              <Text style={text}>{message}</Text>
            </Section>
          )}

          <Section style={urgencyBanner}>
            <Text style={urgencyText}>
              ⏰ <strong>Action Required:</strong> Customer expects response within 24 hours
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button
              href={`https://rtaomiqsnctigleqjojt.supabase.co/admin/quotes/${quoteRequestId}`}
              style={button}
            >
              View & Respond to Quote
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={customerContact}>
            <Heading style={h2}>Quick Contact</Heading>
            <Text style={text}>
              <Link href={`mailto:${customerEmail}`} style={link}>
                📧 Email {customerName}
              </Link>
            </Text>
            <Text style={text}>
              <Link href={`mailto:${customerEmail}?subject=Re: PrepFox Quote Request #${quoteRequestId.slice(-8).toUpperCase()}`} style={link}>
                📝 Reply with Template
              </Link>
            </Text>
          </Section>

          <Text style={footer}>
            PrepFox Admin Portal - Quote Management System
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default AdminNotificationEmail

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
  color: '#dc2626',
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
  margin: '0 0 12px',
}

const text = {
  color: '#4a5568',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 12px',
}

const quoteDetails = {
  backgroundColor: '#f7fafc',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
  border: '1px solid #e2e8f0',
}

const detailItem = {
  color: '#2d3748',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 8px',
}

const urgencyBanner = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  border: '1px solid #fecaca',
}

const urgencyText = {
  color: '#dc2626',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
  textAlign: 'center' as const,
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#dc2626',
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

const customerContact = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
  border: '1px solid #bae6fd',
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