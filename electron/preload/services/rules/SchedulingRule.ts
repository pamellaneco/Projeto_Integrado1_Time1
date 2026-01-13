import { ScaleRepository } from "../../repositories/scale";

export type RuleContext = {
  employee: { id: string; name: string; restrictions: string[] };
  date: string;
  scaleType: string;
  scaleId: string;
  repository: ScaleRepository;
  db: any;
};

export interface SchedulingRule {
  validate(context: RuleContext): string | null;
}