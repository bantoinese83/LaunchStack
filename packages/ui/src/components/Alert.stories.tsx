import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';

const meta = {
  title: 'UI/Alert',
  component: Alert,
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ErrorState: Story = {
  args: {
    variant: 'error',
    children: 'Something went wrong',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Invite sent',
  },
};
