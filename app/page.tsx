import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export default function RootPage() {
  // This will automatically trigger a redirect when the user hits "/"
  redirect('/product-analogue');
}

