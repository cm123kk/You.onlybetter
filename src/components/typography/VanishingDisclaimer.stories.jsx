import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { DocumentTitle, PageContainer, SectionTitle } from '../storybookDocumentation';
import { VanishingDisclaimer } from './VanishingDisclaimer.jsx';

export default {
  title: 'Component/1. Typography/VanishingDisclaimer',
  component: VanishingDisclaimer,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## VanishingDisclaimer

"읽으려 하면 사라지는" 역설을 구현한 면책조항 텍스트.
평소엔 fine-print로 흐릿하게 보이다가 hover 시 페이드아웃되고,
키보드 focus 시에는 다시 완전히 보여 법적 고지를 최소 보장한다.

### 용도
- 약관/면책조항 등 fine-print 고지
- 의도적으로 시선을 회피하는 클리니컬 데이터
- 접근성을 지키면서 시각적 위계를 낮추는 텍스트
        `,
      },
    },
  },
  argTypes: {
    children: {
      control: { type: 'text' },
      description: '면책 전문 (text 미지정 시 사용)',
    },
    text: {
      control: { type: 'text' },
      description: '면책 전문 (children 대체용)',
    },
    hasFadeOnHover: {
      control: { type: 'boolean' },
      description: 'hover 시 사라짐 여부',
    },
    baseOpacity: {
      control: { type: 'number', min: 0, max: 1, step: 0.1 },
      description: '평소 흐릿함 정도 (0~1)',
    },
    sx: {
      control: { type: 'object' },
      description: '추가 스타일 오버라이드',
    },
  },
};

const disclaimerText =
  'Results vary. Irreversible. What has been transferred won\'t come back. There\'s no going back.';

/** 기본 사용 */
export const Default = {
  args: {
    text: disclaimerText,
    hasFadeOnHover: true,
    baseOpacity: 0.5,
  },
};

/** 문서 및 데모 */
export const Documentation = {
  render: () => (
    <>
      <DocumentTitle
        title="VanishingDisclaimer"
        status="Available"
        note="Fine-print disclaimer that fades on hover, stays visible on focus"
        brandName="Typography"
        systemName="Starter Kit"
        version="1.0"
      />
      <PageContainer>
        <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
          VanishingDisclaimer
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
          평소엔 흐릿한 fine-print로 보이다가 hover 시 사라지고, 키보드 focus 시
          다시 나타나는 역설적 면책조항 컴포넌트입니다.
        </Typography>

        <SectionTitle title="Props" description="VanishingDisclaimer 컴포넌트의 Props 목록입니다." />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600 } }>Prop</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Type</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Default</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={ { fontFamily: 'monospace' } }>children</TableCell>
                <TableCell>node</TableCell>
                <TableCell>-</TableCell>
                <TableCell>면책 전문 (text 미지정 시 사용)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={ { fontFamily: 'monospace' } }>text</TableCell>
                <TableCell>string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>면책 전문 (children 대체용)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={ { fontFamily: 'monospace' } }>hasFadeOnHover</TableCell>
                <TableCell>boolean</TableCell>
                <TableCell>true</TableCell>
                <TableCell>hover 시 사라짐 여부</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={ { fontFamily: 'monospace' } }>baseOpacity</TableCell>
                <TableCell>number</TableCell>
                <TableCell>0.5</TableCell>
                <TableCell>평소 흐릿함 정도 (0~1)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={ { fontFamily: 'monospace' } }>sx</TableCell>
                <TableCell>object</TableCell>
                <TableCell>-</TableCell>
                <TableCell>추가 스타일 오버라이드</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <SectionTitle title="Basic Usage" description="마우스를 올리면 사라지고, Tab 키로 focus하면 다시 보입니다." />
        <Box sx={ { p: 3, border: '1px solid', borderColor: 'divider' } }>
          <VanishingDisclaimer text={ disclaimerText } />
        </Box>

        <SectionTitle title="Base Opacity" description="baseOpacity로 평소 흐릿함 정도를 조절합니다." />
        <Stack spacing={ 4 }>
          <Box sx={ { p: 3, border: '1px solid', borderColor: 'divider' } }>
            <Typography variant="caption" sx={ { mb: 1, display: 'block', color: 'text.secondary' } }>
              baseOpacity=0.3
            </Typography>
            <VanishingDisclaimer text={ disclaimerText } baseOpacity={ 0.3 } />
          </Box>
          <Box sx={ { p: 3, border: '1px solid', borderColor: 'divider' } }>
            <Typography variant="caption" sx={ { mb: 1, display: 'block', color: 'text.secondary' } }>
              baseOpacity=0.5 (기본값)
            </Typography>
            <VanishingDisclaimer text={ disclaimerText } baseOpacity={ 0.5 } />
          </Box>
          <Box sx={ { p: 3, border: '1px solid', borderColor: 'divider' } }>
            <Typography variant="caption" sx={ { mb: 1, display: 'block', color: 'text.secondary' } }>
              baseOpacity=0.7
            </Typography>
            <VanishingDisclaimer text={ disclaimerText } baseOpacity={ 0.7 } />
          </Box>
        </Stack>

        <SectionTitle title="Fade Disabled" description="hasFadeOnHover=false면 hover 시에도 사라지지 않습니다." />
        <Box sx={ { p: 3, border: '1px solid', borderColor: 'divider' } }>
          <VanishingDisclaimer text={ disclaimerText } hasFadeOnHover={ false } />
        </Box>

        <SectionTitle title="Usage Example" description="코드 사용 예시입니다." />
        <Box
          component="pre"
          sx={ {
            backgroundColor: 'grey.100',
            p: 3,
            fontSize: 13,
            fontFamily: 'monospace',
            overflow: 'auto',
            lineHeight: 1.6,
          } }
        >
          {`// 기본 사용 (hover 시 사라짐, focus 시 복귀)
<VanishingDisclaimer text="Results vary. Irreversible." />

// 평소 더 흐릿하게
<VanishingDisclaimer
  text="There's no going back."
  baseOpacity={0.3}
/>

// 페이드 비활성화
<VanishingDisclaimer hasFadeOnHover={false}>
  Effects are permanent.
</VanishingDisclaimer>`}
        </Box>
      </PageContainer>
    </>
  ),
};
