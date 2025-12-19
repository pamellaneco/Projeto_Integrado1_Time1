import { ComponentPropsWithoutRef, FC } from "react";
import { saveAs } from "file-saver";
import { generateScaleDocx } from "./docx-generator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale"
import { ScaleShift } from "../Scales";

type DownloadScaleButtonProps = ComponentPropsWithoutRef<"button"> & {
  scaleDate: Date;
  shifts: ScaleShift[];
}

export const DownloadScaleButton: FC<DownloadScaleButtonProps> = ({
  scaleDate,
  shifts,
  ...props
}) => {
  const handleDownload = async () => {
    const { blob } = await generateScaleDocx(scaleDate, shifts);

    const monthStr = format(scaleDate, "MMM-yyyy", { locale: ptBR });
    saveAs(blob, `Escala-SAAE-${monthStr}.docx`);
  }

  return (
    <button
      className="btn-action primary"
      onClick={handleDownload}
      // disabled={!!scaleIds.ETA || !!scaleIds.PLANTAO_TARDE || !ableToCreate}
      {...props}
    >
      BAIXAR
    </button>
  );
}