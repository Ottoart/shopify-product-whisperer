import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-primary mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: July 15, 2025</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              PrepFox ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our ecommerce management platform and related services.
            </p>
            <p>
              PrepFox is an integrated ecommerce hub that connects to various marketplaces including Amazon, Shopify, eBay, Walmart, and others to help you manage your online business operations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-semibold">Personal Information</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account registration details (name, email, company information)</li>
              <li>Contact information and billing details</li>
              <li>Profile information and preferences</li>
            </ul>

            <h4 className="font-semibold">Marketplace Data</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Product listings, inventory, and pricing information</li>
              <li>Order and transaction data from connected marketplaces</li>
              <li>Customer information necessary for order fulfillment (names, addresses, shipping details)</li>
              <li>Financial data including sales reports and payment information</li>
              <li>Marketing and analytics data from marketplace platforms</li>
            </ul>

            <h4 className="font-semibold">Technical Information</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Device information, IP addresses, and browser details</li>
              <li>Usage patterns and application interaction data</li>
              <li>Log files and performance metrics</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-semibold">Core Services</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Synchronize and manage your product listings across marketplaces</li>
              <li>Process orders and manage inventory</li>
              <li>Generate shipping labels and track shipments</li>
              <li>Provide repricing and optimization recommendations</li>
              <li>Generate financial reports and analytics</li>
            </ul>

            <h4 className="font-semibold">Communication</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Send service-related notifications and updates</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Share important platform changes or security alerts</li>
            </ul>

            <h4 className="font-semibold">Improvement and Analytics</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Analyze usage patterns to improve our services</li>
              <li>Develop new features and optimize existing functionality</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Amazon Marketplace Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              As an Amazon Selling Partner API (SP-API) application, we handle Amazon marketplace data with special care:
            </p>

            <h4 className="font-semibold">Amazon Information Usage</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Product listing management and optimization</li>
              <li>Order processing and fulfillment coordination</li>
              <li>Inventory tracking and management</li>
              <li>Financial reporting and tax compliance</li>
              <li>Customer communication in accordance with Amazon policies</li>
            </ul>

            <h4 className="font-semibold">Personally Identifiable Information (PII)</h4>
            <p>
              We access Amazon customer PII solely for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accurate shipping label generation</li>
              <li>Order fulfillment and delivery</li>
              <li>Customer service and support communications</li>
              <li>Tax invoice generation when required</li>
            </ul>

            <h4 className="font-semibold">Data Retention</h4>
            <p>
              Amazon customer PII is retained for more than 180 days after order shipment to comply with tax regulations, warranty obligations, and business record requirements. All Amazon data is handled in strict accordance with Amazon's Data Protection Policy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Data Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-semibold">No Third-Party Sharing</h4>
            <p>
              We do not share your information with outside parties except as described below:
            </p>

            <h4 className="font-semibold">Authorized Disclosures</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>To marketplace platforms as necessary for service functionality</li>
              <li>To shipping carriers for label generation and tracking</li>
              <li>To comply with legal obligations or court orders</li>
              <li>To protect our rights, property, or safety</li>
              <li>With your explicit consent</li>
            </ul>

            <h4 className="font-semibold">Service Providers</h4>
            <p>
              We may use trusted service providers who assist with hosting, analytics, and customer support. These providers are contractually bound to protect your data and may not use it for their own purposes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-semibold">Security Measures</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>AES-256 encryption for data at rest and in transit</li>
              <li>Cloud-based VPC with firewall rules and security groups</li>
              <li>Role-based access controls and least privilege principles</li>
              <li>Multi-factor authentication for administrative access</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Automated backup systems with encryption</li>
            </ul>

            <h4 className="font-semibold">Incident Response</h4>
            <p>
              We maintain a comprehensive incident response plan that includes monitoring, detection, containment, and notification procedures. Security incidents involving Amazon Information are reported to security@amazon.com within 24 hours.
            </p>

            <h4 className="font-semibold">Employee Access</h4>
            <p>
              Access to your data is restricted to authorized personnel based on job functions. All employees undergo security training and are bound by confidentiality agreements.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Data Storage and International Transfers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Your data is stored in secure cloud infrastructure located in North America. If you are located outside of North America, please be aware that your information may be transferred to and processed in countries that may have different data protection laws.
            </p>
            <p>
              We ensure that any international data transfers comply with applicable privacy laws and include appropriate safeguards.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Your Rights and Choices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-semibold">Access and Control</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and update your account information</li>
              <li>Export your data in common formats</li>
              <li>Request deletion of your personal information (subject to legal obligations)</li>
              <li>Opt out of non-essential communications</li>
              <li>Disconnect marketplace integrations</li>
            </ul>

            <h4 className="font-semibold">Data Portability</h4>
            <p>
              You can export your product listings, order data, and other information from your PrepFox account at any time through our export tools.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Cookies and Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintain your login session</li>
              <li>Remember your preferences and settings</li>
              <li>Analyze platform usage and performance</li>
              <li>Provide personalized features</li>
            </ul>
            <p>
              You can control cookie settings through your browser, but disabling certain cookies may affect platform functionality.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              PrepFox is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you believe we have collected information from a child under 18, please contact us immediately.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We may update this Privacy Policy periodically to reflect changes in our practices or applicable laws. We will notify you of material changes by:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Posting the updated policy on our platform</li>
              <li>Sending email notifications for significant changes</li>
              <li>Displaying in-app notifications</li>
            </ul>
            <p>
              Continued use of PrepFox after policy changes constitutes acceptance of the updated terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>12. Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p><strong>PrepFox Support</strong></p>
              <p>Email: privacy@123prepfox.com</p>
              <p>Website: https://123prepfox.com</p>
              <p>Address: [Your Business Address]</p>
            </div>
            <p>
              For security-related inquiries or to report security incidents involving marketplace data, contact us immediately at security@123prepfox.com.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>13. Compliance and Certifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              PrepFox is committed to maintaining compliance with applicable privacy and data protection regulations, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Amazon Selling Partner API Data Protection Policy</li>
              <li>Canadian Personal Information Protection and Electronic Documents Act (PIPEDA)</li>
              <li>California Consumer Privacy Act (CCPA) where applicable</li>
              <li>General Data Protection Regulation (GDPR) for EU users</li>
            </ul>
            <p>
              We regularly review and update our practices to ensure ongoing compliance with evolving privacy standards.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;