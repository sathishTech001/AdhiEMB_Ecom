import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'What are embroidery design files?',
    answer: 'Embroidery design files are digitized patterns that embroidery machines read to stitch out a specific design. They contain instructions for needle movements, thread colors, and stitch types.'
  },
  {
    question: 'What file formats are supported?',
    answer: 'We support all major machine formats including .DST, .PES, .EXP, .HUS, .JEF, .VIP, and .VP3. When you purchase a design, you will receive a ZIP file containing multiple formats.'
  },
  {
    question: 'How do I download after purchase?',
    answer: 'Immediately after successful payment, you will be redirected to a download page. You will also receive an email with the download link, and the files will be forever available in your account under "My Purchases".'
  },
  {
    question: 'Can I use designs commercially?',
    answer: 'Yes! All designs purchased on AdhiEMB come with a commercial license. You can stitch them onto physical items and sell those items. However, you cannot resell, share, or distribute the digital files themselves.'
  },
  {
    question: 'What is your refund policy?',
    answer: 'Due to the digital nature of our products, we generally do not offer refunds once files have been downloaded. However, if a file is defective or does not stitch correctly, please contact our support team within 14 days.'
  },
  {
    question: 'How can I sell my designs?',
    answer: 'You can apply to become a vendor by creating an account and navigating to the "Become a Seller" page. Our team reviews portfolios to ensure high quality standards before approving new vendors.'
  }
];

export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Find answers to common questions about our embroidery designs, licenses, and platform.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-200"
            >
              <button
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-lg text-slate-900 dark:text-white">{faq.question}</span>
                <ChevronDown 
                  className={cn("w-5 h-5 text-indigo-500 transition-transform duration-300", openIndex === index ? "rotate-180" : "")} 
                />
              </button>
              
              <div 
                className={cn(
                  "px-6 overflow-hidden transition-all duration-300 ease-in-out",
                  openIndex === index ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
