import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";

interface PasswordResetEmailProps {
  user_email: string;
  reset_url: string;
  site_url: string;
}

export const PasswordResetEmail = ({
  user_email,
  reset_url,
  site_url,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your PrepFox password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src={`${site_url}/logo.png`}
            width="120"
            height="40"
            alt="PrepFox"
            style={logo}
          />
        </Section>
        
        <Section style={content}>
          <Heading style={h1}>Reset Your Password</Heading>
          <Text style={text}>
            Hello,
          </Text>
          <Text style={text}>
            We received a request to reset the password for your PrepFox account ({user_email}). 
            If you didn't make this request, you can safely ignore this email.
          </Text>
          <Text style={text}>
            To reset your password, click the button below:
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={reset_url}>
              Reset Password
            </Button>
          </Section>
          
          <Text style={text}>
            Or copy and paste this link in your browser:
          </Text>
          <Link href={reset_url} style={link}>
            {reset_url}
          </Link>
          
          <Text style={smallText}>
            This password reset link will expire in 24 hours for security reasons.
          </Text>
        </Section>
        
        <Section style={footer}>
          <Text style={footerText}>
            This email was sent from PrepFox. If you have any questions, please contact our support team.
          </Text>
          <Text style={footerText}>
            © 2024 PrepFox. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default PasswordResetEmail;

// Styles
const main = {
  backgroundColor: "#ffffff",
  fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const header = {
  borderBottom: "1px solid #eaeaea",
  paddingBottom: "20px",
  marginBottom: "32px",
};

const logo = {
  margin: "0 auto",
  display: "block",
};

const content = {
  padding: "0 20px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "30px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const smallText = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "16px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#007ee6",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const link = {
  color: "#007ee6",
  fontSize: "14px",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};

const footer = {
  borderTop: "1px solid #eaeaea",
  paddingTop: "20px",
  marginTop: "32px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#666",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "8px 0",
};