import { RequestConsideration } from './RequestConsideration.jsx';

export default {
  title: 'Template/Request Consideration',
  component: RequestConsideration,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onSubmit: {
      action: 'submitted',
      description: '제출 시 호출되는 콜백 (email) => void',
    },
    isTilted: {
      control: 'boolean',
      description: '대칭 붕괴용 미세 기울임 적용 여부',
    },
    sx: {
      control: 'object',
      description: '추가 스타일 (MUI sx)',
    },
  },
};

export const Default = {
  args: {
    isTilted: false,
  },
};

export const Tilted = {
  args: {
    isTilted: true,
  },
};
