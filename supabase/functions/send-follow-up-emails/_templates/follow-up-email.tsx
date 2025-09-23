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

interface FollowUpEmailProps {
  customerName: string
  customerEmail: string
  company: string
  serviceType: string
  quoteRequestId: string
  daysWaiting: number
  specialistName: string
  specialistEmail: string
}

export const FollowUpEmail = ({
  customerName,
  customerEmail,
  company,
  serviceType,
  quoteRequestId,
  daysWaiting,
  specialistName,
  specialistEmail,
}: FollowUpEmailProps) => (
  <Html>
    <Head />
    <Preview>Following up on your {serviceType} quote request</Preview>
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
          <Heading style={h1}>Still interested in optimizing {company}'s fulfillment? 🤔</Heading>
          
          <Text style={text}>
            Hi {customerName},
          </Text>
          
          <Text style={text}>
            It's been {daysWaiting} days since you requested a quote for our <strong>{serviceType}</strong> services, and I wanted to personally follow up.
          </Text>

          <Text style={text}>
            I'm {specialistName}, your dedicated fulfillment specialist, and I've been working on a custom proposal specifically tailored for {company}'s needs.
          </Text>

          <Section style={valueProps}>
            <Heading style={h2}>Here's what we've prepared for you:</Heading>
            
            <Text style={bulletPoint}>
              💰 <strong>Cost Analysis:</strong> Detailed breakdown showing potential savings vs. current solution
            </Text>
            
            <Text style={bulletPoint}>
              📊 <strong>ROI Projections:</strong> 12-month financial impact assessment
            </Text>
            
            <Text style={bulletPoint}>
              🚀 <strong>Implementation Plan:</strong> Step-by-step timeline to get you started
            </Text>
            
            <Text style={bulletPoint}>
              🎯 <strong>Custom Solutions:</strong> Tailored recommendations based on your specific challenges
            </Text>
          </Section>

          <Section style={urgencySection}>
            <Text style={urgencyText}>
              ⚡ <strong>Limited Time:</strong> Current pricing valid for next 7 days only
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button
              href={`mailto:${specialistEmail}?subject=Re: PrepFox Quote #${quoteRequestId.slice(-8).toUpperCase()}`}
              style={primaryButton}
            >
              Schedule My Strategy Call
            </Button>
            
            <Button
              href={`https://rtaomiqsnctigleqjojt.supabase.co/fulfillment/quote-status?id=${quoteRequestId}`}
              style={secondaryButton}
            >
              View Quote Status
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={testimonialSection}>
            <Text style={testimonialText}>
              <em>"PrepFox helped us reduce fulfillment costs by 40% while improving delivery times. The transition was seamless and their team was incredibly supportive."</em>
            </Text>
            <Text style={testimonialAuthor}>
              - Sarah Chen, VP Operations at GrowthBrand Co.
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            If you have any questions or would prefer to discuss this over a quick call, I'm available at your convenience.
          </Text>

          <Text style={text}>
            Best regards,<br />
            {specialistName}<br />
            Fulfillment Specialist<br />
            <Link href={`mailto:${specialistEmail}`} style={link}>{specialistEmail}</Link><br />
            Direct: (555) 123-4567
          </Text>

          <Text style={footer}>
            P.S. Many of our clients see immediate improvements within the first month. Let's discuss how we can help {company} achieve similar results.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default FollowUpEmail

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
  fontSize: '26px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 24px',
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

const valueProps = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #bae6fd',
}

const bulletPoint = {
  color: '#1e40af',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 12px',
}

const urgencySection = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  border: '1px solid #fbbf24',
  textAlign: 'center' as const,
}

const urgencyText = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
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
  margin: '0 8px 16px 8px',
}

const secondaryButton = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  color: '#475569',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: '500',
  lineHeight: '1',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  border: '1px solid #e2e8f0',
  margin: '0 8px',
}

const testimonialSection = {
  backgroundColor: '#f7fafc',
  borderLeft: '4px solid #3b82f6',
  padding: '20px',
  margin: '24px 0',
}

const testimonialText = {
  color: '#4a5568',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 8px',
  fontStyle: 'italic',
}

const testimonialAuthor = {
  color: '#718096',
  fontSize: '13px',
  margin: '0',
  fontWeight: '500',
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
  fontStyle: 'italic',
}