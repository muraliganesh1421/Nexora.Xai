/**
 * Nexora.Xai Mock Utilities
 * Reference sample leads strictly matching LeadItem interface.
 */

import { LeadItem } from '@/types/nexora';

export const SAMPLE_DEMO_LEADS: LeadItem[] = [
  {
    id: 'DEMO-001',
    businessName: 'Royal Spice Coastal Kitchen',
    category: 'Restaurant',
    city: 'Rajahmundry',
    address: 'Main Road, Danavaipeta, Rajahmundry',
    phone: '+91 883 245 1102',
    email: 'contact@royalspice-demo.com',
    website: 'https://royalspice-demo.com',
    mapsUrl: 'https://maps.google.com/?q=Rajahmundry',
    rating: 4.4,
    reviewCount: 382,
    score: 88,
    scoreTier: 'High',
    scoreReason:
      'High volume of inquiries, active customer reviews, missing automated table booking and WhatsApp ordering integration.',
    status: 'New',
    outreachStatus: 'Ready for Review',
    approvalStatus: 'Pending',
    hasPhone: true,
    hasEmail: true,
    hasWebsite: true,
    whatsappConsent: false,
    doNotContact: false,
    proposedSubject: 'Quick question regarding table reservations at Royal Spice',
    proposedMessage:
      'Hi team Royal Spice, noticed your strong local reviews in Rajahmundry. We built an automated AI WhatsApp ordering & booking flow for high-volume restaurants that recaptures missed calls. Would you be open to seeing a 2-minute demo?',
    updatedAt: '2026-10-02 12:00:00',
  },
  {
    id: 'DEMO-002',
    businessName: 'Apex Physio & Ortho Care',
    category: 'Clinic',
    city: 'Rajahmundry',
    address: 'Near Government Hospital, Rajahmundry',
    phone: '+91 883 247 9931',
    email: 'info@apexphysio-demo.in',
    website: '',
    mapsUrl: 'https://maps.google.com/?q=Rajahmundry',
    rating: 4.8,
    reviewCount: 145,
    score: 82,
    scoreTier: 'High',
    scoreReason:
      'High clinic rating with no direct website or automated appointment booking. Ideal candidate for patient triage assistant.',
    status: 'New',
    outreachStatus: 'Ready for Review',
    approvalStatus: 'Pending',
    hasPhone: true,
    hasEmail: true,
    hasWebsite: false,
    whatsappConsent: false,
    doNotContact: false,
    proposedSubject: 'Automating patient appointment booking for Apex Physio',
    proposedMessage:
      'Hello Dr. Rao and team, I came across Apex Physio while researching top healthcare practices in Rajahmundry. We help clinics streamline patient appointments over WhatsApp so your reception staff saves 2+ hours daily. Happy to share how it works if interested.',
    updatedAt: '2026-10-02 11:30:00',
  },
];
