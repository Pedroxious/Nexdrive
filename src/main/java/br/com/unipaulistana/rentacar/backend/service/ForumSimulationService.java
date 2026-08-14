package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.domain.*;
import br.com.unipaulistana.rentacar.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class ForumSimulationService {

    private final ForumBotRepository botRepository;
    private final ForumTopicRepository topicRepository;
    private final ForumCommentRepository commentRepository;

    private final Random random = new Random();

    private final List<String> sampleComments = List.of(
            "Excelente explicacao! Consegui resolver exatamente essa duvida.",
            "Muito boa a dica. Recomendo a todos da comunidade!",
            "Obrigado por compartilhar! Ja salvei para consultar mais tarde.",
            "Alguem mais testou essa opcao? Aqui no meu caso funcionou perfeitamente.",
            "Otima recomendacao para quem utiliza a frota com frequencia.",
            "Comentario super util! Parabens pela iniciativa.",
            "Testei hoje cedo e confirmou tudo o que foi dito na postagem."
    );

    @Scheduled(fixedRate = 25000)
    @Transactional
    public void simulateCommunityActivity() {
        List<ForumBot> bots = botRepository.findAll();
        List<ForumTopic> topics = topicRepository.findAll();

        if (bots.isEmpty() || topics.isEmpty()) return;

        ForumBot randomBot = bots.get(random.nextInt(bots.size()));
        ForumTopic randomTopic = topics.get(random.nextInt(topics.size()));

        int actionType = random.nextInt(10);

        if (actionType < 5) {
            // Action 1: Bot leaves a comment
            String commentText = sampleComments.get(random.nextInt(sampleComments.size()));
            ForumComment comment = ForumComment.builder()
                    .topic(randomTopic)
                    .authorBot(randomBot)
                    .content(commentText)
                    .createdAt(LocalDateTime.now())
                    .build();
            commentRepository.save(comment);

            randomTopic.setRepliesCount(randomTopic.getRepliesCount() + 1);
            randomTopic.setUpdatedAt(LocalDateTime.now());
            topicRepository.save(randomTopic);
            log.info("[FORUM BOT] Bot {} commented on topic '{}'", randomBot.getName(), randomTopic.getTitle());

        } else if (actionType < 8) {
            // Action 2: Bot likes the topic
            randomTopic.setLikesCount(randomTopic.getLikesCount() + 1);
            randomTopic.setUpdatedAt(LocalDateTime.now());
            topicRepository.save(randomTopic);
            log.info("[FORUM BOT] Bot {} liked topic '{}'", randomBot.getName(), randomTopic.getTitle());

        } else {
            // Action 3: Bot views the topic
            randomTopic.setViewsCount(randomTopic.getViewsCount() + random.nextInt(3) + 1);
            topicRepository.save(randomTopic);
            log.info("[FORUM BOT] Bot {} viewed topic '{}'", randomBot.getName(), randomTopic.getTitle());
        }
    }
}
