import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Phone, Send } from 'lucide-react';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const ContactPage: React.FC = () => {
  const form = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (data: any) => {
    console.log(data);
    toast.success('Your message has been sent successfully! We will get back to you soon.');
    form.reset();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Get in Touch</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Have a question about our designs, need a custom digitizing quote, or experiencing technical issues? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-8 lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 mx-auto rounded-full flex items-center justify-center mb-6">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Email Us</h3>
              <p className="text-slate-500 mb-4">Our friendly team is here to help.</p>
              <a href="mailto:support@adhiemb.com" className="text-indigo-600 font-medium hover:underline">support@adhiemb.com</a>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 mx-auto rounded-full flex items-center justify-center mb-6">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Call Us</h3>
              <p className="text-slate-500 mb-4">Mon-Fri from 9am to 6pm IST.</p>
              <a href="tel:+919876543210" className="text-indigo-600 font-medium hover:underline">+91 98765 43210</a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Send us a Message</h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Your Name" name="name" register={form.register} error={form.formState.errors.name?.message as string} placeholder="John Doe" />
                <FormField label="Email Address" name="email" type="email" register={form.register} error={form.formState.errors.email?.message as string} placeholder="john@example.com" />
              </div>
              <FormField label="Subject" name="subject" register={form.register} error={form.formState.errors.subject?.message as string} placeholder="How can we help?" />
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                <textarea
                  {...form.register('message')}
                  rows={5}
                  className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none p-3 border"
                  placeholder="Tell us more about your query..."
                />
                {form.formState.errors.message && (
                  <p className="text-sm text-red-500">{form.formState.errors.message.message as string}</p>
                )}
              </div>

              <Button type="submit" size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                <Send className="w-4 h-4" /> Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
