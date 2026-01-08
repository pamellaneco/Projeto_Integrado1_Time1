import { ComponentPropsWithoutRef, FC, useState } from "react";
import { generateScaleDocx } from "./docx-generator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale"
import { ScaleShift } from "../Scales";
import { publishScale } from "../../ipc-bridge/scale";
import ConfirmationModal from "../modal/ConfirmationModal";
import { render } from "@react-email/components";
import { ScalePublicationEmail } from "../../../electron/preload/external/mailer/templates/publication";

type PublishScaleButtonProps = ComponentPropsWithoutRef<"button"> & {
  scaleDate: Date;
  shifts: ScaleShift[];
}

export const PublishScaleButton: FC<PublishScaleButtonProps> = ({
  scaleDate,
  shifts,
  ...props
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublishClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmPublish = async () => {
    setIsPublishing(true);

    try {
      const monthName = format(scaleDate, "MMMM", { locale: ptBR });
      const year = scaleDate.getFullYear();

      // Render email HTML in renderer process
      const emailHtml = await render(
        <ScalePublicationEmail monthName={monthName} year={year} />
      );

      const result = await publishScale({
        scaleDate: scaleDate.toISOString(),
        shifts,
        monthName,
        year,
        emailHtml
      });

      setIsPublishing(false);
      setShowConfirmModal(false);

      if (result.error) {
        alert(`Erro ao publicar escala: ${result.error}`);
      } else {
        alert(`Escala publicada com sucesso! ${result.emailsSent} e-mails enviados.`);
      }
    } catch (error) {
      setIsPublishing(false);
      setShowConfirmModal(false);
      console.error("Erro ao publicar escala:", error);
      alert("Erro ao publicar escala. Verifique o console para mais detalhes.");
    }
  };

  const handleCloseModal = () => {
    if (!isPublishing) {
      setShowConfirmModal(false);
    }
  };

  return (
    <>
      <button
        className="btn-action primary"
        onClick={handlePublishClick}
        disabled={isPublishing}
        {...props}
      >
        {isPublishing ? "PUBLICANDO..." : "PUBLICAR"}
      </button>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmPublish}
        title="Confirmar Publicação"
        message={isPublishing
          ? "Enviando e-mails para todos os funcionários ativos...\n\nPor favor, não feche esta janela."
          : "A escala será enviada por e-mail para todos os funcionários ativos.\n\nEsta ação não pode ser desfeita. Deseja continuar?"
        }
        confirmText={isPublishing ? "AGUARDE..." : "SIM, PUBLICAR"}
        cancelText="CANCELAR"
        disableClose={isPublishing}
      />
    </>
  );
}