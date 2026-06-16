import { Html, Container, Row, Column, Img } from 'react-email';
import { Tailwind } from '@react-email/tailwind';

const SafeTailwind = Tailwind as any;

export function AuthEmailLayout({ children }: { children: React.ReactNode }) {
  return (
    <Html>
      <SafeTailwind>
        {/* Header */}
        <Container className="bg-yellow-500">
          <Row>
            <Column>
              <div className="flex items-center gap-x-3 p-3">
                <Img
                  src="https://res.cloudinary.com/cserver/image/upload/v1694358251/cserver/krusty_krab/uploads/android-chrome-192x192_v5qsxg.png"
                  width="50"
                  height="50"
                />
                <span className="font-bold text-lg">Krusty Krab</span>
              </div>
            </Column>
          </Row>
        </Container>

        {/* Body */}
        <Container className="px-4 pt-6 py-12 border-l-4 border-l-yellow-500 border-r-4 border-r-rose-800 min--full">
          <Row>
            <Column>{children}</Column>
          </Row>
        </Container>

        {/* Footer */}
        <Container className="bg-rose-800">
          <Row>
            <Column>
              <div className="flex justify-center items-center gap-x-3 p-3">
                <Img
                  src="https://res.cloudinary.com/cserver/image/upload/v1694358251/cserver/krusty_krab/uploads/android-chrome-192x192_v5qsxg.png"
                  width="50"
                  height="50"
                />
                <span className="font-bold text-lg text-white">
                  Krusty Krab
                </span>
              </div>
            </Column>
          </Row>
        </Container>
      </SafeTailwind>
    </Html>
  );
}
