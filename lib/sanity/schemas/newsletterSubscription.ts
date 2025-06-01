import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'newsletterSubscription',
  title: 'Newsletter Subscription',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) =>
        Rule.required().email().error('A valid email address is required.'),
    }),
    defineField({
      name: 'subscribedAt',
      title: 'Subscribed At',
      type: 'datetime',
      options: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
      },
      readOnly: true,
    }),
  ],
  initialValue: () => ({
    subscribedAt: new Date().toISOString(),
  }),
  preview: {
    select: {
      title: 'email',
      subtitle: 'subscribedAt',
    },
  },
}); 