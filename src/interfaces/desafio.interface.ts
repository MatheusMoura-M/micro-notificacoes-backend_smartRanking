import { DesafioStatus } from '../desafio-status.enum';

interface iJogador {
  _id: string;
}

export interface iDesafio {
  dataHoraDesafio: Date;
  status: DesafioStatus;
  dataHoraSolicitacao: Date;
  dataHoraResposta?: Date;
  solicitante: string;
  categoria: string;
  partida?: string;
  jogadores: iJogador[];
}
