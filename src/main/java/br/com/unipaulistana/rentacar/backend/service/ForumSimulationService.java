package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.domain.*;
import br.com.unipaulistana.rentacar.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ForumSimulationService {

    private final ForumBotRepository botRepository;
    private final ForumTopicRepository topicRepository;
    private final ForumCommentRepository commentRepository;

    private final Random random = new Random();

    private static final List<String> CATEGORIES = List.of(
            "Suporte", "Duvidas sobre Veiculos", "Experiencias com Locadoras", "Dicas e Mecanica", "Off-Topic", "Anuncios"
    );

    private static final List<String> TOPIC_TITLES = List.of(
            "Qual a melhor locadora para viagem longa?",
            "Duvida sobre seguro de carros de luxo",
            "Como funciona a devolucao em outra cidade?",
            "Problemas com o ar condicionado do Onix",
            "Alguem ja alugou SUV na Localiza?",
            "Dicas para economizar no aluguel mensal",
            "Cobraram taxa de lavagem indevida!",
            "Qual o consumo real do Renegade?",
            "Vale a pena pegar o seguro completo?",
            "Aluguel de carro eletrico vale a pena?",
            "O que verificar na hora de retirar o veiculo?",
            "Melhor carro para viajar com a familia",
            "Fui multado com carro alugado, e agora?",
            "Como contestar uma avaria no carro?",
            "Dica de roteiro para o final de semana",
            "Alguem recomenda a Movida de Guarulhos?",
            "Carro ferveu na estrada, o que fazer?",
            "Diferenca entre grupo B e C",
            "Posso atravessar a fronteira com carro alugado?",
            "Pneus carecas no carro da locadora",
            "Melhor epoca para alugar com desconto",
            "Cupons de desconto para dezembro",
            "Vale a pena assinar carro em vez de comprar?",
            "Minha experiencia com a Unidas foi pessima",
            "Qual o limite do cartao de credito exigido?",
            "Aluguel sem cartao de credito e possivel?",
            "Como funciona o pedagio automatico nas locadoras?",
            "Carros automaticos vs manuais na estrada",
            "Qual a cadeirinha ideal para criancas no carro alugado?",
            "Reembolso de combustivel não caiu",
            "Bati o carro alugado, qual o procedimento?",
            "Alguem sabe se o HB20 1.0 aguenta subida?",
            "Demora no atendimento do aeroporto de Congonhas",
            "Onde encontrar as melhores promocoes de aluguel?",
            "Como funciona a coparticipacao do seguro?",
            "Aluguel de vans para viagem em grupo",
            "Dicas para dirigir na chuva com seguranca",
            "Carro entregue sujo, posso reclamar?",
            "Vantagens do programa de fidelidade da locadora",
            "Qual locadora tem a frota mais nova?",
            "Problema com o rastreador do veiculo",
            "E possivel adicionar condutor extra de graca?",
            "Aluguel para motorista de aplicativo vale a pena?",
            "Qual a politica de cancelamento das locadoras?",
            "Duvida sobre caucao bloqueado no cartao",
            "Como funciona o upgrade de categoria?",
            "Alugar no aeroporto e mais caro?",
            "Experiencia alugando carro no exterior",
            "Vale a pena abastecer na locadora na devolucao?",
            "Como evitar dor de cabeca no aluguel de carros"
    );

    private static final List<String> TOPIC_CONTENTS = List.of(
            "Ola pessoal, estou planejando uma viagem longa e gostaria de saber as recomendacoes de voces. Ja tive boas experiencias no passado, mas queria algo mais economico dessa vez.",
            "Boa tarde. Fui retirar meu carro hoje e tive um problema com o cartao de credito. Alguem sabe dizer se eles aceitam cartao de terceiros caso o titular esteja junto?",
            "Estou com um carro alugado e o ar condicionado parou de gelar do nada. Liguei na assistencia e pediram para ir ate a loja mais proxima. Mais alguem passou por isso?",
            "Gostaria de compartilhar uma dica muito boa. Sempre que alugarem, tirem fotos e gravem um video de todo o carro antes de sair da loja. Isso me salvou de uma cobranca injusta recentemente.",
            "Pessoal, vale a pena pagar aquele seguro mais caro que cobre tudo? Normalmente eu pego so o basico, mas vou viajar para um lugar com muita estrada de terra e estou na duvida.",
            "Alguem ja usou o servico de carro por assinatura? Estou fazendo as contas e parece que compensa mais do que comprar um zero km, considerando seguro e IPVA. O que acham?",
            "Tive uma pessima experiencia na devolucao. O atendente cismou que um risco no para-choque foi feito por mim, sendo que ja estava la. Sorte que eu tinha a foto do checklist inicial.",
            "Estou querendo alugar um carro eletrico para testar no final de semana. Sabem dizer se a autonomia e boa para ir ate o litoral e voltar sem precisar carregar no meio do caminho?",
            "Fui multado por excesso de velocidade com o carro da locadora. Eles ja me repassaram a multa e cobraram uma taxa administrativa absurda. E normal esse valor da taxa?",
            "Queria saber a opiniao de voces sobre qual carro popular anda mais e consome menos. Estou em duvida entre o Onix e o HB20 para rodar bastante em rodovia. Qual recomendam?",
            "Sempre alugo carro para trabalhar e acho que as locadoras deveriam ter um plano melhor para clientes frequentes. Os pontos demoram muito para acumular e os descontos sao baixos.",
            "Uma dica para quem vai alugar no aeroporto: as vezes compensa pegar um Uber ate uma agencia de rua, o valor da diaria costuma ser bem menor do que nas lojas do aeroporto.",
            "Alguem sabe como funciona a questao do pedagio automatico? Eles cobram os valores certinhos ou tem alguma taxa extra por usar a tag da locadora? Estou na duvida se levo a minha.",
            "Boa noite. Gostaria de saber se e possivel alugar um carro e devolver em outro estado. Sei que cobram taxa de retorno, mas costuma ser muito cara? Vale a pena?",
            "Estou com um problema na reserva. Fiz pelo site e quando cheguei na loja nao tinha a categoria que eu escolhi. Queriam me dar um carro inferior e nao aceitei. O que devo fazer?",
            "Para viagens com a familia, a Spin ainda e a melhor opcao nas locadoras ou tem algum outro carro de 7 lugares que seja melhor e com preco parecido? Preciso de espaco.",
            "Como funciona a assistencia 24 horas? O pneu furou no meio da estrada de noite, e eu nao tinha as ferramentas no porta-malas. Demorou mais de tres horas para o guincho chegar.",
            "Duvida rapida: se eu devolver o carro antes da data prevista, eles devolvem o dinheiro dos dias que nao usei ou fica como credito para uma proxima vez?",
            "Acho um absurdo o valor que cobram no litro de combustivel quando voce devolve o carro sem encher o tanque. Paguei quase o dobro do preco do posto da esquina. Fiquem espertos!",
            "Galera, comprei um pacote promocional e consegui um SUV pelo preco de carro basico. Fiquem de olho nas redes sociais das locadoras, de vez em quando aparecem umas ofertas muito boas."
    );

    private static final List<String> POSITIVE_COMMENTS = List.of(
            "Excelente dica! Vou testar no proximo role.",
            "Nossa, me ajudou muito! Eu estava com essa mesma duvida ha dias.",
            "Concordo plenamente. Ja fiz isso e deu super certo.",
            "Muito bom o post, bem detalhado e explicativo. Obrigado por compartilhar.",
            "Sempre bom ver esse tipo de conteudo por aqui. Parabens pela iniciativa.",
            "Top demais! Com certeza vou seguir esses passos da proxima vez.",
            "Verdade, eu passei por isso e essa e a melhor forma de resolver.",
            "Otima recomendacao! Ja usei esse servico e achei sensacional.",
            "Caramba, nao sabia disso. Vai facilitar muito minha vida agora.",
            "Mandou muito bem! E exatamente isso que a gente precisa saber."
    );

    private static final List<String> NEGATIVE_COMMENTS = List.of(
            "Pessimo atendimento na unidade de BH, nao recomendo para ninguem.",
            "Isso e golpe, fuja dessa locadora o mais rapido possivel!",
            "Tive um problema parecido e nunca resolveram. Procon neles!",
            "Nao concordo. Comigo foi totalmente diferente e passei muita raiva.",
            "Acho um absurdo eles cobrarem essas taxas extras escondidas no contrato.",
            "Muito ruim. O carro veio sujo e com cheiro de cigarro. Decepcionante.",
            "Puro marketing enganoso. Na hora H inventam um monte de desculpas.",
            "Nao caio mais nessa. A dor de cabeca que eu tive nao compensa a economia.",
            "Achei a qualidade do servico bem inferior ao que era no passado.",
            "Eles estao cada vez piores. Falta respeito com o consumidor."
    );

    private static final List<String> NEUTRAL_COMMENTS = List.of(
            "Alguem sabe se a politica de cancelamento e flexivel?",
            "Quanto custa em media a diaria nessa categoria nos finais de semana?",
            "Eu costumo alugar sempre com a mesma empresa, mas estou avaliando outras.",
            "Depende muito da epoca do ano. Na alta temporada tudo fica mais caro.",
            "Interessante o ponto de vista, mas acho que varia de agencia para agencia.",
            "Queria saber mais detalhes sobre como funciona esse processo.",
            "Alguem tem ideia de qual o prazo para o estorno do caucao no cartao?",
            "Eu fico na duvida se compensa mais pegar seguro total ou de terceiros.",
            "Normalmente eles pedem caucao de mil reais, mas pode variar conforme a categoria.",
            "Vou acompanhar o topico, tambem tenho interesse nesse assunto."
    );

    private static final List<String> SOLUTION_COMMENTS = List.of(
            "Resolvi o problema calibrando os pneus com 32 libras.",
            "A solucao e trocar o filtro de ar a cada 10 mil km. Melhorou muito o desempenho.",
            "Para resolver a cobranca indevida, mandei um email para a ouvidoria com as fotos e estornaram.",
            "Consegui o upgrade de categoria ligando direto no SAC antes de ir retirar o carro.",
            "O macete para nao pagar a taxa de lavagem e devolver pelo menos batido uma agua e aspirado.",
            "Aperte os parafusos da placa, geralmente e isso que faz barulho no porta-malas em rua de terra.",
            "Para cancelar sem multa, e so avisar com 48 horas de antecedencia pelo aplicativo.",
            "O problema do ar condicionado e cronico nesse modelo. Peca para trocar de carro imediatamente.",
            "Use um aditivo de combustivel de boa qualidade que o motor para de falhar na subida.",
            "Reclame no ReclameAqui, eles costumam responder e resolver em menos de dois dias por la."
    );

    private static final List<String> SLANG_COMMENTS = List.of(
            "Mano, esse role ficou top demais! Seloco.",
            "Peguei a grana e fui direto na melhor locadora da cidade, vapo!",
            "Os caras sao muito enrolados, slc. Fiquei la uma cota esperando.",
            "Papo reto, nunca mais alugo nessa firma ai. Mo b.o.",
            "Carrao brabo, andou muito na estrada. Curti demais.",
            "Achei meio paia o carro que me deram, tava capengando.",
            "E o seguinte, o bagulho e louco. Tem que ler o contrato direito.",
            "Tmj! Valeu pela visao, irmao. Vai ajudar geral.",
            "Zica demais esse esquema! Da pra economizar uma grana forte.",
            "Na moral, os caras meteram o louco na cobranca dessa taxa ai."
    );

    @Transactional
    @Scheduled(fixedDelay = 35000, initialDelay = 20000)
    public void simulateNewTopic() {
        try {
            int delay = random.nextInt(25000);
            Thread.sleep(delay);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        List<ForumBot> bots = botRepository.findAll();
        if (bots.isEmpty()) return;

        ForumBot author = bots.get(random.nextInt(bots.size()));
        String title = TOPIC_TITLES.get(random.nextInt(TOPIC_TITLES.size()));
        String content = TOPIC_CONTENTS.get(random.nextInt(TOPIC_CONTENTS.size()));
        String category = CATEGORIES.get(random.nextInt(CATEGORIES.size()));

        ForumTopic topic = ForumTopic.builder()
                .title(title)
                .content(content)
                .category(category)
                .authorBot(author)
                .isPinned(false)
                .isSolved(false)
                .viewsCount(random.nextInt(1951) + 50)
                .likesCount(random.nextInt(51))
                .repliesCount(0)
                .participantsCount(1)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        topicRepository.save(topic);

        author.setPostCount(author.getPostCount() + 1);
        botRepository.save(author);

        log.info("Simulated new topic: '{}' by bot {}", title, author.getName());
    }

    @Transactional
    @Scheduled(fixedDelay = 20000, initialDelay = 10000)
    public void simulateCommentAndReply() {
        List<ForumTopic> topics = topicRepository.findAll();
        List<ForumBot> bots = botRepository.findAll();

        if (topics.isEmpty() || bots.isEmpty()) return;

        ForumTopic topic = topics.get(random.nextInt(topics.size()));
        
        List<ForumBot> availableBots = new ArrayList<>(bots);
        if (topic.getAuthorBot() != null) {
            availableBots.removeIf(b -> b.getId().equals(topic.getAuthorBot().getId()));
        }
        
        if (availableBots.isEmpty()) return;

        ForumBot commentAuthor = availableBots.get(random.nextInt(availableBots.size()));
        
        List<List<String>> commentBanks = List.of(POSITIVE_COMMENTS, NEGATIVE_COMMENTS, NEUTRAL_COMMENTS, SOLUTION_COMMENTS, SLANG_COMMENTS);
        List<String> chosenBank = commentBanks.get(random.nextInt(commentBanks.size()));
        String content = chosenBank.get(random.nextInt(chosenBank.size()));

        ForumComment comment = ForumComment.builder()
                .topic(topic)
                .authorBot(commentAuthor)
                .content(content)
                .createdAt(LocalDateTime.now())
                .build();

        ForumComment savedComment = commentRepository.save(comment);

        topic.setRepliesCount(topic.getRepliesCount() + 1);
        topic.setUpdatedAt(LocalDateTime.now());
        
        commentAuthor.setCommentCount(commentAuthor.getCommentCount() + 1);
        botRepository.save(commentAuthor);

        if (random.nextInt(100) < 25) {
            List<ForumBot> replyBots = new ArrayList<>(bots);
            replyBots.removeIf(b -> b.getId().equals(commentAuthor.getId()));
            if (!replyBots.isEmpty()) {
                ForumBot replyAuthor = replyBots.get(random.nextInt(replyBots.size()));
                List<String> replyBank = commentBanks.get(random.nextInt(commentBanks.size()));
                String replyContent = replyBank.get(random.nextInt(replyBank.size()));

                ForumComment reply = ForumComment.builder()
                        .topic(topic)
                        .authorBot(replyAuthor)
                        .content(replyContent)
                        .parentCommentId(savedComment.getId())
                        .createdAt(LocalDateTime.now())
                        .build();

                commentRepository.save(reply);
                topic.setRepliesCount(topic.getRepliesCount() + 1);
                
                replyAuthor.setCommentCount(replyAuthor.getCommentCount() + 1);
                botRepository.save(replyAuthor);
                
                log.info("Simulated reply by bot {} to comment in topic {}", replyAuthor.getName(), topic.getId());
            }
        }

        long pCount = commentRepository.findByTopicOrderByCreatedAtAsc(topic).stream()
            .map(c -> c.getAuthorUser() != null ? c.getAuthorUser().getId() + "_u" : c.getAuthorBot().getId() + "_b")
            .distinct().count();
            
        long totalP = pCount;
        if (topic.getAuthorUser() != null || topic.getAuthorBot() != null) {
            totalP = Math.max(1, pCount);
        }
        topic.setParticipantsCount((int) totalP);

        topicRepository.save(topic);

        log.info("Simulated comment by bot {} in topic {}", commentAuthor.getName(), topic.getId());
    }

    @Transactional
    @Scheduled(fixedRate = 8000, initialDelay = 5000)
    public void simulateViewsAndLikes() {
        List<ForumTopic> topics = topicRepository.findAll();
        if (topics.isEmpty()) return;

        ForumTopic topic = topics.get(random.nextInt(topics.size()));

        boolean updated = false;
        if (random.nextInt(100) < 70) {
            topic.setViewsCount(topic.getViewsCount() + random.nextInt(5) + 1);
            updated = true;
        }

        if (random.nextInt(100) < 30) {
            topic.setLikesCount(topic.getLikesCount() + 1);
            updated = true;
        }

        if (updated) {
            topic.setUpdatedAt(LocalDateTime.now());
            topicRepository.save(topic);
        }
    }
}
