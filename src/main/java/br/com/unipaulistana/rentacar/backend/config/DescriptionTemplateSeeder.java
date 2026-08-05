package br.com.unipaulistana.rentacar.backend.config;

import br.com.unipaulistana.rentacar.backend.domain.DescriptionBlockType;
import br.com.unipaulistana.rentacar.backend.domain.DescriptionTemplate;
import br.com.unipaulistana.rentacar.backend.repository.DescriptionTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DescriptionTemplateSeeder implements CommandLineRunner {

    private final DescriptionTemplateRepository repository;

    @Override
    @Transactional
    public void run(String... args) {
        if (repository.count() == 0) {
            repository.saveAll(List.of(
                // INTRO (5)
                createTemplate(DescriptionBlockType.INTRO, "Conheça este incrível {brand} {model} {year}, uma excelente opção na categoria {category}.", null, null, null, null, null, null, 1),
                createTemplate(DescriptionBlockType.INTRO, "Apresentamos o {brand} {model}, um veículo espetacular do ano {year}.", null, null, null, null, null, null, 1),
                createTemplate(DescriptionBlockType.INTRO, "Procurando um {category} de respeito? O {brand} {model} {year} está pronto para te surpreender.", null, null, null, null, null, null, 2),
                createTemplate(DescriptionBlockType.INTRO, "Chegou o momento de dirigir um {brand} {model} zero km!", null, null, null, true, null, null, 3),
                createTemplate(DescriptionBlockType.INTRO, "Para quem busca economia na categoria {category}, o {brand} {model} {year} é a escolha perfeita.", null, null, null, null, null, null, 1),

                // CONDITION (5)
                createTemplate(DescriptionBlockType.CONDITION, "O carro encontra-se em estado de zero, brilhando na cor {color}.", null, null, null, true, null, null, 2),
                createTemplate(DescriptionBlockType.CONDITION, "Na cor {color}, este modelo possui {mileage}, comprovando seu excelente estado de conservação.", null, null, null, false, null, 50000L, 2),
                createTemplate(DescriptionBlockType.CONDITION, "Veículo na cor {color}, super bem conservado e com {mileage} rodados.", null, null, null, false, null, null, 1),
                createTemplate(DescriptionBlockType.CONDITION, "Impecável, com cheirinho de novo e {mileage}, pronto para a sua garagem.", null, null, null, false, null, 10000L, 3),
                createTemplate(DescriptionBlockType.CONDITION, "Sua belíssima pintura {color} chama a atenção por onde passa, estado impecável de conservação.", null, null, null, null, null, null, 1),

                // PERFORMANCE (5)
                createTemplate(DescriptionBlockType.PERFORMANCE, "Com câmbio {transmission} e motorização {fuelType}, ele oferece uma performance suave e econômica.", null, null, null, null, null, null, 1),
                createTemplate(DescriptionBlockType.PERFORMANCE, "O câmbio {transmission} garante o máximo de esportividade nas trocas de marcha.", null, "MANUAL", null, null, null, null, 2),
                createTemplate(DescriptionBlockType.PERFORMANCE, "Graças ao câmbio {transmission}, você terá extremo conforto no trânsito urbano.", null, "AUTOMATIC", null, null, null, null, 2),
                createTemplate(DescriptionBlockType.PERFORMANCE, "Movido a {fuelType}, o motor entrega potência e eficiência impecáveis.", null, null, null, null, null, null, 1),
                createTemplate(DescriptionBlockType.PERFORMANCE, "Com motor eficiente a {fuelType} e câmbio {transmission}, a dirigibilidade é o ponto forte deste carro.", null, null, null, null, null, null, 1),

                // COMFORT (5)
                createTemplate(DescriptionBlockType.COMFORT, "Acomodando confortavelmente até {seats} pessoas, é perfeito para você e sua família.", null, null, null, null, null, null, 1),
                createTemplate(DescriptionBlockType.COMFORT, "O espaço interno impressiona, com {doors} portas que facilitam o acesso para os {seats} ocupantes.", null, null, null, null, null, null, 1),
                createTemplate(DescriptionBlockType.COMFORT, "O acabamento refinado e os {seats} lugares garantem uma viagem luxuosa e tranquila.", "SUV", null, null, null, null, null, 2),
                createTemplate(DescriptionBlockType.COMFORT, "Seus {seats} lugares são envolventes e as {doors} portas proporcionam praticidade total para o dia a dia.", null, null, null, null, null, null, 1),
                createTemplate(DescriptionBlockType.COMFORT, "Muito espaço e comodidade para {seats} passageiros em qualquer tipo de trajeto.", null, null, null, null, null, null, 1),

                // SAFETY (5)
                createTemplate(DescriptionBlockType.SAFETY, "Itens de segurança de série mantêm todos a bordo protegidos a todo momento.", null, null, null, null, null, null, 1),
                createTemplate(DescriptionBlockType.SAFETY, "Conta com estrutura reforçada e freios de alta performance para maior tranquilidade.", null, null, null, null, null, null, 1),
                createTemplate(DescriptionBlockType.SAFETY, "Com tecnologias avançadas, proporciona uma direção segura e confiável na categoria {category}.", null, null, null, null, null, null, 1),
                createTemplate(DescriptionBlockType.SAFETY, "Dirigir este {brand} é sinônimo de segurança, estabilidade e confiança nas estradas.", null, null, null, null, null, null, 1),
                createTemplate(DescriptionBlockType.SAFETY, "Totalmente revisado e preparado para oferecer o mais alto nível de segurança para você.", null, null, null, null, null, null, 1),

                // OUTRO (5)
                createTemplate(DescriptionBlockType.OUTRO, "Disponível para locação por apenas {pricePerDay}, e você pode retirá-lo em {city} - {state}.", null, null, null, null, null, null, 1),
                createTemplate(DescriptionBlockType.OUTRO, "Aproveite esta oportunidade por {pricePerDay} e venha nos visitar em {city}.", null, null, null, null, null, null, 1),
                createTemplate(DescriptionBlockType.OUTRO, "Sua próxima viagem começa aqui em {city} - {state}. Reserve agora por {pricePerDay}!", null, null, null, null, null, null, 1),
                createTemplate(DescriptionBlockType.OUTRO, "Oferecemos as melhores condições em {city} - {state}. O valor da diária é de apenas {pricePerDay}.", null, null, null, null, null, null, 1),
                createTemplate(DescriptionBlockType.OUTRO, "Garanta já o seu {brand} {model} por {pricePerDay}. Retirada fácil na região de {city} / {state}.", null, null, null, null, null, null, 2)
            ));
        }
    }

    private DescriptionTemplate createTemplate(DescriptionBlockType blockType, String text, String category, String transmission, String fuelType, Boolean isNew, Integer minYear, Long maxMileage, int priority) {
        return DescriptionTemplate.builder()
                .blockType(blockType)
                .templateText(text)
                .categoryFilter(category)
                .transmissionFilter(transmission)
                .fuelTypeFilter(fuelType)
                .isNewFilter(isNew)
                .minYear(minYear)
                .maxMileage(maxMileage)
                .priority(priority)
                .build();
    }
}
