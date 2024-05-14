import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { iDesafio } from './interfaces/desafio.interface';
import { Jogador } from './interfaces/jogador.interface';
import { ClientProxySmartRanking } from './proxyrmq/client-proxy';
import HTML_NOTIFICACAO_ADVERSARIO from './static/html-notificacao-adversario';

@Injectable()
export class AppService {
  constructor(
    private clientProxySmartRanking: ClientProxySmartRanking,
    private readonly mailService: MailerService,
  ) {}

  private readonly logger = new Logger(AppService.name);

  private clientAdminBackend =
    this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

  async enviarEmailParaAdversario(desafio: iDesafio): Promise<void> {
    try {
      /*
        Identificar o ID do adversario
      */

      let idAdversario = '';

      desafio.jogadores.map((jogador) => {
        if (jogador._id != desafio.solicitante) {
          idAdversario = jogador._id;
        }
      });

      //Consultar as informações adicionais dos jogadores

      const adversario: Jogador = await lastValueFrom(
        this.clientAdminBackend.send('consultar-jogadores', idAdversario),
      );

      const solicitante: Jogador = await lastValueFrom(
        this.clientAdminBackend.send(
          'consultar-jogadores',
          desafio.solicitante,
        ),
      );

      let markup = '';

      markup = HTML_NOTIFICACAO_ADVERSARIO;
      markup = markup.replace(/#NOME_ADVERSARIO/g, adversario.nome);
      markup = markup.replace(/#NOME_SOLICITANTE/g, solicitante.nome);

      this.mailService
        .sendMail({
          to: adversario.email,
          from: `"SMART RANKING" <api.smartranking@gmail.com>`,
          subject: 'Notificação de Desafio',
          html: markup,
        })
        .then((success) => {
          this.logger.log(success);
        })
        .catch((err) => {
          this.logger.error('Err: ', err);
        });
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
