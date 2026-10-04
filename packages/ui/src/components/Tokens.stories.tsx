import type { Meta, StoryObj } from '@storybook/react';

const tokens = [
  ['accent', '#da3750'],
  ['ink', '#141313'],
  ['muted', '#6b6764'],
  ['paper', '#f3f4f1'],
  ['surface', '#ffffff'],
  ['line', '#e4e2dc'],
  ['shell', '#141313'],
  ['chalk', '#2e4a62'],
  ['danger', '#b42318'],
  ['success', '#027a48'],
];

function TokenSwatches() {
  return (
    <div style={{ display: 'grid', gap: 12, width: 420 }}>
      {tokens.map(([name, value]) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              background: value,
              border: '1px solid #e4e2dc',
            }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{name}</div>
            <div style={{ color: '#6b6764', fontFamily: 'monospace', fontSize: 12 }}>{value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const meta = {
  title: 'Foundations/Tokens',
  component: TokenSwatches,
} satisfies Meta<typeof TokenSwatches>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Palette: Story = {};
