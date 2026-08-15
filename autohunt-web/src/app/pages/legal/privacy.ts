import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="privacy-document">
      <!-- Doc Header -->
      <header class="doc-header">
        <div class="doc-meta">
          <span class="meta-tag">Documento Oficial</span>
          <span class="meta-date">Última atualização: 14 de Agosto de 2026</span>
        </div>
        <h1 class="doc-title">Política de Privacidade Global — Nexdrive</h1>
        <p class="doc-subtitle">
          Este documento estabelece as diretrizes e regras para o tratamento de dados pessoais coletados ou processados no âmbito da plataforma de locação e mobilidade <strong>Nexdrive</strong>, em estrita conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).
        </p>
        <div class="consent-notice">
          <strong>Aviso de Consentimento:</strong> Ao acessar nosso site, cadastrar-se na plataforma ou realizar reservas de veículos, você declara ter lido e concordado expressamente com os termos constantes nesta Política de Privacidade.
        </div>
      </header>

      <hr class="divider" />

      <!-- Section 1: Glossário -->
      <section class="doc-section">
        <h2>1. Glossário e Definições</h2>
        <p>Para fins de interpretação desta Política de Privacidade, devem ser consideradas as seguintes definições:</p>
        <ul class="styled-list">
          <li><strong>Nexdrive:</strong> Plataforma digital de reservas, aluguel de veículos e mobilidade urbana gerida pela Nexdrive Mobilidade S.A.</li>
          <li><strong>Usuário:</strong> Qualquer pessoa física que acesse a plataforma, utilize nossos serviços ou realize cadastros e reservas de veículos.</li>
          <li><strong>Conta:</strong> Registro individualizado e protegido por credenciais criado pelo Usuário para acessar áreas restritas do sistema.</li>
          <li><strong>Credenciais:</strong> Conjunto de dados de autenticação (e-mail, senha e tokens de acesso) de uso exclusivo do Usuário.</li>
          <li><strong>Dados Pessoais:</strong> Informações relacionadas a pessoa natural identificada ou identificável (ex.: nome, CPF, CNH, e-mail, telefone, endereço IP).</li>
          <li><strong>Dados Anonimizados:</strong> Dados estatísticos ou agregados que não permitem a identificação direta ou indireta de um indivíduo.</li>
          <li><strong>Cookies:</strong> Pequenos arquivos de dados gravados no dispositivo do Usuário para personalizar a experiência de navegação.</li>
          <li><strong>Encarregado de Dados (DPO):</strong> Profissional indicado pela Nexdrive responsável por atuar como canal de comunicação entre os Usuários, a empresa e a Autoridade Nacional de Proteção de Dados (ANPD).</li>
        </ul>
      </section>

      <!-- Section 2: Coleta de Dados -->
      <section class="doc-section">
        <h2>2. Coleta de Dados Pessoais</h2>
        <p>A Nexdrive coleta Dados Pessoais estritamente necessários para a prestação e aprimoramento dos seus serviços de aluguel de veículos:</p>
        
        <h3>2.1. Dados Fornecidos Voluntariamente pelo Usuário</h3>
        <ul class="styled-list">
          <li><strong>Dados Cadastrais:</strong> Nome completo, e-mail, telefone de contato, CPF, data de nascimento e endereço residencial.</li>
          <li><strong>Validação de Condutor:</strong> Número da Carteira Nacional de Habilitação (CNH), foto/documento de comprovação e categoria da habilitação para verificação de elegibilidade do motorista.</li>
          <li><strong>Dados Financeiros:</strong> Informações de cartão de crédito ou métodos de pagamento para processamento das reservas.</li>
        </ul>

        <h3>2.2. Dados Coletados de Forma Automatizada</h3>
        <ul class="styled-list">
          <li><strong>Logs de Acesso e Dispositivo:</strong> Endereço IP, data e hora de acesso, tipo de navegador, sistema operacional e identificadores do dispositivo.</li>
          <li><strong>Histórico de Navegação e Frotas:</strong> Veículos visualizados, termos pesquisados, histórico de pesquisas por cidade e dados de geolocalização aproximada para sugestão da frota disponível mais próxima.</li>
          <li><strong>Cookies Essenciais e Analíticos:</strong> Utilizados para manter a sessão ativa, guardar preferências de idioma/moeda e medir métricas de uso da plataforma.</li>
        </ul>
      </section>

      <!-- Section 3: Uso dos Dados -->
      <section class="doc-section">
        <h2>3. Finalidade e Uso dos Dados</h2>
        <p>Os dados coletados pela Nexdrive são utilizados para as seguintes finalidades legítimas:</p>
        <ol class="numbered-list">
          <li><strong>Autenticação e Gestão de Contas:</strong> Identificar e autenticar o Usuário no acesso à sua Conta e área restrita.</li>
          <li><strong>Execução do Contrato de Locação:</strong> Processar reservas, emissão de contratos de aluguel, confirmações de retirada e devolução de veículos.</li>
          <li><strong>Prevenção a Fraudes e Segurança da Frota:</strong> Validar a autenticidade dos documentos (CNH/CPF) e proteger a frota veicular contra acessos indevidos ou uso inconsistente.</li>
          <li><strong>Atendimento e Suporte 24h:</strong> Responder a solicitações, suporte emergencial durante a locação e canal de atendimento.</li>
          <li><strong>Comunicações Transacionais:</strong> Enviar confirmações de reserva, lembretes de retirada, alertas de segurança de login e alteração de senha.</li>
          <li><strong>Cumprimento de Obrigações Legais:</strong> Atender requisições judiciais, regulatórias e fiscais exigidas pelas autoridades competentes.</li>
        </ol>
      </section>

      <!-- Section 4: Armazenamento e Direitos LGPD -->
      <section class="doc-section">
        <h2>4. Armazenamento, Segurança e Direitos do Titular (LGPD)</h2>
        
        <h3>4.1. Medidas de Segurança</h3>
        <p>
          Os Dados Pessoais dos Usuários são armazenados em ambiente seguro e controlado, utilizando criptografia SSL/TLS de 256 bits, mecanismos de controle de acesso via tokens JWT e monitoramento preventivo contra vulnerabilidades.
        </p>

        <h3>4.2. Direitos do Titular dos Dados</h3>
        <p>Nos termos do artigo 18 da Lei Geral de Proteção de Dados (LGPD), o Usuário possui o direito de solicitar a qualquer momento:</p>
        <ul class="styled-list">
          <li>Confirmação da existência de tratamento dos seus Dados Pessoais.</li>
          <li>Acesso aos dados e correção de dados incompletos, inexatos ou desatualizados.</li>
          <li>Eliminação ou anonimização de dados desnecessários ou tratados em desconformidade.</li>
          <li>Portabilidade dos dados a outro fornecedor de serviço, mediante requisição expressa.</li>
          <li>Revogação do consentimento concedido anteriormente.</li>
        </ul>

        <div class="dpo-card">
          <div class="dpo-header">Canal de Contato do Encarregado de Dados (DPO)</div>
          <p>Para exercer seus direitos de titular ou esclarecer dúvidas sobre a privacidade dos seus dados na Nexdrive, entre em contato com nosso DPO através do e-mail oficial:</p>
          <a href="mailto:dpo@nexdrive.com.br" class="dpo-email">dpo&#64;nexdrive.com.br</a>
        </div>
      </section>

      <!-- Section 5: Disposições Gerais -->
      <section class="doc-section">
        <h2>5. Disposições Gerais e Atualizações</h2>
        <p>
          A Nexdrive reserva-se o direito de atualizar esta Política de Privacidade a qualquer momento para refletir melhorias no produto ou alterações legislativas. Quaisquer modificações relevantes serão notificadas através dos canais da plataforma ou por e-mail cadastrado.
        </p>
        <p>
          Caso qualquer disposição deste documento seja considerada inválida por autoridade competente, as demais seções permanecerão em pleno vigor e efeito.
        </p>
      </section>

      <!-- Section 6: Lei Aplicável e Jurisdição -->
      <section class="doc-section">
        <h2>6. Lei Aplicável e Foro</h2>
        <p>
          Esta Política de Privacidade é regida e interpretada de acordo com as leis da República Federativa do Brasil, em especial a Lei nº 13.709/2018 (LGPD). Fica eleito o Foro da Comarca de São Paulo/SP para dirimir quaisquer litígios ou controvérsias oriundas deste documento.
        </p>
      </section>
    </article>
  `,
  styles: [`
    .privacy-document {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: var(--text-primary, #1E293B);
      line-height: 1.7;
    }

    .doc-header {
      margin-bottom: 24px;
    }

    .doc-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .meta-tag {
      background: var(--accent-light, #E0F2FE);
      color: var(--accent, #0369A1);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .meta-date {
      font-size: 13px;
      color: var(--text-secondary, #64748B);
      font-weight: 500;
    }

    .doc-title {
      font-family: 'Outfit', sans-serif;
      font-size: 28px;
      font-weight: 800;
      color: var(--text-primary, #0F172A);
      margin: 0 0 12px 0;
      letter-spacing: -0.5px;
    }

    .doc-subtitle {
      font-size: 15px;
      color: var(--text-secondary, #475569);
      margin-bottom: 16px;
    }

    .consent-notice {
      background: var(--surface-secondary, #F8FAFC);
      border-left: 4px solid var(--accent, #0284C7);
      padding: 14px 18px;
      border-radius: 0 8px 8px 0;
      font-size: 13.5px;
      color: var(--text-primary, #334155);
    }

    .divider {
      border: none;
      border-top: 1px solid var(--border, #E2E8F0);
      margin: 32px 0;
    }

    .doc-section {
      margin-bottom: 40px;

      h2 {
        font-family: 'Outfit', sans-serif;
        font-size: 20px;
        font-weight: 700;
        color: var(--text-primary, #0F172A);
        margin: 0 0 16px 0;
        border-bottom: 1px solid var(--border-light, #F1F5F9);
        padding-bottom: 8px;
      }

      h3 {
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary, #1E293B);
        margin: 20px 0 10px 0;
      }

      p {
        font-size: 14.5px;
        color: var(--text-primary, #334155);
        margin-bottom: 14px;
      }
    }

    .styled-list, .numbered-list {
      padding-left: 20px;
      margin-bottom: 16px;

      li {
        font-size: 14px;
        color: var(--text-primary, #334155);
        margin-bottom: 8px;
        strong {
          color: var(--text-primary, #0F172A);
        }
      }
    }

    .dpo-card {
      background: var(--accent-light, #F0F9FF);
      border: 1px solid var(--accent, #BAE6FD);
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }

    .dpo-header {
      font-weight: 700;
      font-size: 14px;
      color: var(--accent, #0369A1);
      margin-bottom: 8px;
    }

    .dpo-email {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 600;
      color: var(--accent, #0284C7);
      text-decoration: none;
      background: var(--surface, #FFFFFF);
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid var(--accent, #7DD3FC);
      margin-top: 6px;

      &:hover {
        background: var(--accent-light, #E0F2FE);
      }
    }
  `]
})
export class PrivacyComponent implements OnInit {
  ngOnInit() {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
}
