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
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ConfirmationEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  user_email: string
  user_name?: string
}

export const ConfirmationEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  user_email,
  user_name,
}: ConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to PrepFox - Confirm your email to get started</Preview>
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
          <Heading style={h1}>Welcome to PrepFox! 🚀</Heading>
          
          <Text style={text}>
            Hi {user_name || 'there'},
          </Text>
          
          <Text style={text}>
            Thank you for signing up for PrepFox! We're excited to help you streamline your e-commerce operations with our comprehensive fulfillment and shipping solutions.
          </Text>

          <Text style={text}>
            To get started, please confirm your email address by clicking the button below:
          </Text>

          <Section style={buttonContainer}>
            <Link
              href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
              style={button}
            >
              Confirm Email Address
            </Link>
          </Section>

          <Text style={text}>
            Or copy and paste this link into your browser:
          </Text>
          
          <Text style={linkText}>
            {`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
          </Text>

          <Hr style={hr} />

          <Text style={text}>
            Once confirmed, you'll have access to:
          </Text>
          
          <Text style={featureList}>
            • 📦 Advanced inventory management
            <br />
            • 🚚 Multi-carrier shipping solutions
            <br />
            • 📊 Real-time analytics and reporting
            <br />
            • 🔄 Seamless marketplace integrations
            <br />
            • 🤖 AI-powered optimization tools
          </Text>

          <Text style={text}>
            If you didn't create an account with PrepFox, you can safely ignore this email.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Need help? Contact our support team at{' '}
            <Link href="mailto:support@prepfox.com" style={link}>
              support@prepfox.com
            </Link>
          </Text>
          
          <Text style={footer}>
            PrepFox - Your Complete E-commerce Fulfillment Solution
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ConfirmationEmail

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

const text = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const featureList = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '1.8',
  margin: '16px 0',
  paddingLeft: '20px',
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

const linkText = {
  color: '#718096',
  fontSize: '14px',
  lineHeight: '1.5',
  wordBreak: 'break-all' as const,
  backgroundColor: '#f7fafc',
  padding: '12px',
  borderRadius: '4px',
  fontFamily: 'monospace',
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