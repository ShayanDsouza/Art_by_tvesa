// Default legal copy shown until an admin overrides it via the Legal editor
// (stored in Firestore at siteContent/legal). Content mirrors the artist's
// previously published Shopify policies. Admins can edit these at /admin/legal.

export const LEGAL_CONFIG = {
  privacy: {
    title: 'Privacy Policy',
    desc: 'How Art by Tvesa collects, uses, and protects your personal information.',
  },
  terms: {
    title: 'Terms of Service',
    desc: 'Terms and conditions governing your use of the Art by Tvesa website, including orders and intellectual property.',
  },
  refunds: {
    title: 'Refunds & Returns',
    desc: 'Art by Tvesa refund and returns policy — all sales final except for damaged, defective, or incorrect items.',
  },
}

export const LEGAL_KEYS = ['privacy', 'terms', 'refunds']

export const DEFAULT_LEGAL = {
  privacy: `
<p><em>Last updated: July 17, 2026</em></p>
<p>Art by Tvesa operates this website, including all related information, content, features, tools, products and services, in order to provide you, the customer, with a curated experience (the "Services"). This Privacy Policy describes how we collect, use, and disclose your personal information when you visit, use, or make a purchase or other transaction using the Services or otherwise communicate with us.</p>
<p>Please read this Privacy Policy carefully. By using and accessing any of the Services, you acknowledge that you have read this Privacy Policy and understand the collection, use, and disclosure of your information as described here.</p>
<h2>Personal Information We Collect or Process</h2>
<p>Depending on how you interact with the Services, we may collect or process the following categories of personal information:</p>
<ul>
<li><strong>Contact details</strong> including your name, billing address, shipping address, phone number, and email address.</li>
<li><strong>Account information</strong> including your preferences and settings.</li>
<li><strong>Transaction information</strong> including the items you view or purchase and your past transactions.</li>
<li><strong>Communications with us</strong> including the information you include when you contact us.</li>
<li><strong>Device information</strong> including your device, browser, IP address, and other unique identifiers.</li>
<li><strong>Usage information</strong> including how and when you interact with or navigate the Services.</li>
</ul>
<h2>How We Use Your Personal Information</h2>
<ul>
<li><strong>Provide, tailor, and improve the Services</strong>, including to process transactions, fulfil orders, arrange shipping, and create a customised experience for you.</li>
<li><strong>Marketing and advertising</strong>, such as to send you communications you have opted into.</li>
<li><strong>Security and fraud prevention</strong>, to authenticate you and secure the Services.</li>
<li><strong>Communicating with you</strong> to provide customer support and be responsive to you.</li>
<li><strong>Legal reasons</strong>, to comply with applicable law or respond to valid legal process.</li>
</ul>
<h2>How We Disclose Personal Information</h2>
<p>In certain circumstances we may disclose your personal information to vendors and service providers who perform services on our behalf (for example, payment processing, cloud storage, fulfilment and shipping), when you direct or consent to it, or in connection with a business transaction or to comply with legal obligations.</p>
<h2>Your Rights and Choices</h2>
<p>Depending on where you live, you may have rights to access, delete, correct, or receive a copy of the personal information we hold about you. You may exercise any of these rights by contacting us using the details below. You may opt out of promotional emails at any time using the unsubscribe link in our emails.</p>
<h2>Security and Retention</h2>
<p>No security measures are perfect or impenetrable, and we cannot guarantee "perfect security." How long we retain your personal information depends on whether we need it to provide the Services, comply with legal obligations, resolve disputes, or enforce our policies.</p>
<h2>Children's Data</h2>
<p>The Services are not intended to be used by children, and we do not knowingly collect personal information about children under the age of majority in your jurisdiction.</p>
<h2>Changes to This Privacy Policy</h2>
<p>We may update this Privacy Policy from time to time to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will post the revised policy on this website and update the "Last updated" date.</p>
<h2>Contact</h2>
<p>Should you have any questions about our privacy practices or this Privacy Policy, or if you would like to exercise any of your rights, please email us at <a href="mailto:artbytvesa@gmail.com">artbytvesa@gmail.com</a> or call +91 99897 75605.</p>
`.trim(),

  terms: `
<p>By accessing or using the Art by Tvesa website and Services, you agree to be bound by these Terms of Service. Please read them carefully.</p>
<h2>1. Account &amp; Access</h2>
<p>You must be of legal age and provide accurate information. You are responsible for keeping your account details secure.</p>
<h2>2. Products</h2>
<p>Colours and appearance may differ from what is shown on your screen. Product descriptions are subject to change without notice.</p>
<h2>3. Orders</h2>
<p>Art by Tvesa reserves the right to accept or decline your order for any reason at its discretion.</p>
<h2>4. Pricing</h2>
<p>Prices are subject to change and exclude taxes and shipping unless stated otherwise.</p>
<h2>5. Shipping</h2>
<p>Delivery times are estimates only. We are not liable for delays outside of our control.</p>
<h2>6. Intellectual Property</h2>
<p>All content, including artwork and images, is protected and provided for personal, non-commercial use only. All artwork © Tvesa Medh. Reproduction rights are retained by the artist.</p>
<h2>7. Third-Party Tools &amp; Links</h2>
<p>We provide no warranty for third-party tools or links, and are not responsible for content on external sites.</p>
<h2>8. Disclaimer of Warranties</h2>
<p>The Services are provided "as is" and "as available" without warranties of any kind, whether express or implied.</p>
<h2>9. Limitation of Liability</h2>
<p>To the fullest extent permitted by law, Art by Tvesa is not liable for any indirect, incidental, consequential, or punitive damages.</p>
<h2>10. Termination</h2>
<p>We may suspend or terminate access to the Services at our discretion, without notice, for conduct that violates these Terms.</p>
<h2>11. Contact</h2>
<p>Questions about these Terms may be sent to <a href="mailto:artbytvesa@gmail.com">artbytvesa@gmail.com</a> or +91 99897 75605.</p>
`.trim(),

  refunds: `
<p><em>Effective date: May 10, 2026</em></p>
<h2>All Sales Final</h2>
<p>All purchases made through Art by Tvesa are considered final sale. No refunds, returns, exchanges, or cancellations apply to original artworks, limited or open edition prints, commissioned works, custom orders, or framed items.</p>
<h2>Exceptions for Damage</h2>
<p>Replacements or refunds are available only if items arrive physically damaged, incorrect, or with a verified manufacturing defect. Claims must be filed within 48 hours of delivery with photographic evidence.</p>
<h2>Shipping Liability</h2>
<p>We are not responsible for shipping delays, lost packages, customs delays, incorrect addresses provided by the customer, or failed delivery attempts.</p>
<h2>International Purchases</h2>
<p>Customers are responsible for customs duties, import taxes, VAT, and related charges. Shipments refused due to unpaid duties will result in the customer being responsible for all return costs and fees.</p>
<h2>Colour &amp; Appearance</h2>
<p>Minor colour variations between screens and physical items, natural textures in hand-painted pieces, and slight print crop variations are not considered defects.</p>
<h2>Original Artwork &amp; Commissions</h2>
<p>All originals are non-returnable, non-refundable, one-of-a-kind pieces, and the artist retains all copyright and reproduction rights. All commission payments and deposits are non-refundable.</p>
<h2>Contact</h2>
<p>For damage or order issues, email <a href="mailto:artbytvesa@gmail.com">artbytvesa@gmail.com</a> within 48 hours of delivery.</p>
`.trim(),
}
