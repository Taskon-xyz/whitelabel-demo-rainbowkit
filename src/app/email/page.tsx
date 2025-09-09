import type { Metadata } from 'next';
import EmailClient from './email-client';

export const metadata: Metadata = {
  title: 'Email Demo - TaskOn Embed',
  description: 'Email-based authentication demo with TaskOn Embed SDK',
};

export default function EmailPage() {
  return <EmailClient />;
}