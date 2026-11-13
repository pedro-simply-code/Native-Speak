/** Static copy for terms / privacy CMS defaults and fallbacks. */
import { SITE } from "@/cms-seed-content/site";

export type LegalSectionBlock = {
  title: string;
  body: string;
};

export const TERMS_LAST_UPDATED = "October 2026";

export const TERMS_SECTIONS: LegalSectionBlock[] = [
  {
    title: "1. About these terms",
    body: `These terms apply to the use of this website, operated by ${SITE.name}. By browsing the site or sending an enquiry you accept them. Project work is governed by a separate written proposal or agreement, which takes precedence over these terms.`,
  },
  {
    title: "2. Website content",
    body: "Case studies, service descriptions and other content are provided for information. They describe past work and capabilities but are not a guarantee of a particular result. Any timelines, scope or pricing for your project are only valid when confirmed in writing in a proposal.",
  },
  {
    title: "3. Intellectual property",
    body: `The design, text, code and images on this website belong to ${SITE.name} or are used with permission. You may not copy or republish them without written consent. Work delivered to clients is licensed or assigned according to the project agreement.`,
  },
  {
    title: "4. Acceptable use",
    body: "Do not attempt to disrupt the site, gain unauthorised access to it, scrape it at scale or use the contact form to send spam, unlawful content or malicious code. Access may be restricted if these rules are broken.",
  },
  {
    title: "5. Third-party links",
    body: "The site links to external services and client websites. We are not responsible for their content, availability or privacy practices.",
  },
  {
    title: "6. Availability and liability",
    body: `The website is provided "as is". We aim to keep it available and accurate but do not guarantee uninterrupted access or that every detail is free of errors. To the extent permitted by law, ${SITE.name} is not liable for indirect or consequential loss arising from use of this website.`,
  },
  {
    title: "7. Changes and contact",
    body: `We may update these terms from time to time; the current version is always on this page. Questions can be sent to ${SITE.email}.`,
  },
];

export const PRIVACY_LAST_UPDATED = "October 2026";

export const PRIVACY_SECTIONS: LegalSectionBlock[] = [
  {
    title: "1. Who we are",
    body: `${SITE.name} is a web development agency working remotely from Guatemala and the United States. For any privacy question you can contact us at ${SITE.email}.`,
  },
  {
    title: "2. Information we collect",
    body: "We only collect what you choose to send us. When you use the contact form we receive your name, email address, company (optional), the service you selected and your message. Our servers may also record standard technical information such as the time of the request for security and spam prevention.",
  },
  {
    title: "3. How we use it",
    body: "Your information is used to reply to your enquiry, prepare a proposal and, if we work together, to deliver the project. We do not sell your data, rent it or use it for advertising.",
  },
  {
    title: "4. Cookies and analytics",
    body: "This website does not set advertising or analytics cookies. If you sign in to the client area we use a strictly necessary authentication cookie to keep you signed in. No consent banner is required because no tracking cookies are used.",
  },
  {
    title: "5. Service providers",
    body: "We use third-party providers for hosting and for delivering email. They process data on our behalf and only for those purposes. Contact form messages are transmitted to our inbox through our email provider.",
  },
  {
    title: "6. Retention",
    body: "Enquiries are kept for as long as needed to respond and to maintain a record of the conversation. You can ask us to delete your enquiry at any time.",
  },
  {
    title: "7. Your rights",
    body: `You can ask us what personal data we hold about you, request a correction or ask us to delete it. Email ${SITE.email} and we will respond within a reasonable period.`,
  },
  {
    title: "8. Changes",
    body: "If this policy changes, the updated version will be published on this page with a new date. Material changes affecting existing enquiries will be communicated where we have a way to reach you.",
  },
];
