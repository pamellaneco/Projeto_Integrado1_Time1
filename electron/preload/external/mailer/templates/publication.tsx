import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
  Text
} from "@react-email/components";

type IScalePublicationEmailProps = {
  monthName: string;
  year: number;
};

export const ScalePublicationEmail = ({ monthName, year }: IScalePublicationEmailProps) => (
  <Html>
    <Head>
      <title>Escala de Trabalho Publicada</title>
    </Head>
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: {
              primary: "#0B1D32"
            }
          }
        }
      }}
    >
      <Body className="bg-gray-50 font-sans">
        <Preview>Escala de trabalho de {monthName}/{year.toString()} publicada</Preview>
        <Container className="mx-auto my-0 max-w-[600px] p-0">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="px-8 py-10">
              <Heading className="mb-4 text-center text-2xl font-bold text-gray-900">
                Escala de Trabalho Publicada
              </Heading>

              <Text className="mb-6 text-center text-base text-gray-600">
                A escala de trabalho referente ao mês de <strong>{monthName} de {year}</strong> foi publicada e está disponível em anexo.
              </Text>

              <div className="my-6 border-t border-gray-200"></div>

              <div className="mb-6 rounded-lg bg-blue-800/5 p-4">
                <Text className="mb-2 text-sm font-medium text-blue-800">Informações Importantes:</Text>
                <ul className="ml-5 list-disc space-y-1 text-sm text-blue-800">
                  <li>Confira atentamente seus horários e dias de trabalho</li>
                  <li>Em caso de dúvidas ou conflitos, entre em contato com a gestão</li>
                  <li>Mantenha esta escala para sua consulta pessoal</li>
                  <li>O arquivo está anexado a este e-mail</li>
                </ul>
              </div>

              <Text className="text-center text-xs text-gray-400">
                Esta é uma mensagem automática, por favor não responda este e-mail.
              </Text>
            </div>

            <div className="bg-gray-50 px-8 py-6 text-center">
              <Text className="text-xs text-gray-500">
                Serviço Autônomo de Água e Esgoto - SAAE
              </Text>
            </div>
          </div>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

ScalePublicationEmail.PreviewProps = {
  monthName: "Janeiro",
  year: 2025
};
