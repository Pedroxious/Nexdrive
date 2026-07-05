package br.com.unipaulistana.rentacar.backend.config;

import br.com.unipaulistana.rentacar.backend.domain.*;
import br.com.unipaulistana.rentacar.backend.repository.UserRepository;
import br.com.unipaulistana.rentacar.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

        @org.springframework.beans.factory.annotation.Value("${application.security.seed.admin-password}")
        private String adminPassword;

        @org.springframework.beans.factory.annotation.Value("${application.security.seed.user-password}")
        private String userPassword;

        private final VehicleRepository vehicleRepository;
        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final EntityManager entityManager;

        @Override
        @Transactional
        @SuppressWarnings("null")
        public void run(ApplicationArguments args) {
                // Ensure profile_image_url column is of type TEXT to store base64 images
                try {
                        entityManager.createNativeQuery("ALTER TABLE users ALTER COLUMN profile_image_url TYPE TEXT").executeUpdate();
                } catch (Exception e) {
                        // Ignore if this fails (e.g. in test h2 environment)
                }

                // Seed or Update Users
                userRepository.findByEmail("admin@nexdrive.com").ifPresentOrElse(
                                user -> {
                                        user.setPassword(passwordEncoder.encode(adminPassword));
                                        userRepository.save(user);
                                },
                                () -> userRepository.save(User.builder()
                                                .fullName("Admin Nexdrive")
                                                .email("admin@nexdrive.com")
                                                .password(passwordEncoder.encode(adminPassword))
                                                .role(UserRole.ADMIN)
                                                .build()));

                userRepository.findByEmail("pedro@nexdrive.com").ifPresentOrElse(
                                user -> {
                                        user.setPassword(passwordEncoder.encode(userPassword));
                                        userRepository.save(user);
                                },
                                () -> userRepository.save(User.builder()
                                                .fullName("Pedro Azevedo")
                                                .email("pedro@nexdrive.com")
                                                .password(passwordEncoder.encode(userPassword))
                                                .role(UserRole.USER)
                                                .build()));

                // Seed 100 Vehicles (only if no vehicles exist yet)
                if (vehicleRepository.count() == 0) {
                        seedVehicles();
                }

        }

        private void seedVehicles() {
                List<Vehicle> vehicles = new ArrayList<>();

                // ===== ECONOMY (25 vehicles) =====
                vehicles.add(v("Chevrolet", "Onix 1.0 Turbo", 2024, VehicleCategory.ECONOMY, "White",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 5000L, 120.0, VehicleBadge.BEST_SELLER,
                                "São Paulo", "SP", "https://i.imgur.com/GdxPQuD.png",
                                "Compacto mais vendido do Brasil, ideal para cidade com excelente economia.",
                                "https://i.imgur.com/Exuo827.png", "https://i.imgur.com/c0ICGOT.png",
                                "https://i.imgur.com/mQliwmW.png",
                                "https://i.imgur.com/qeSI7Yx.png"));
                vehicles.add(v("Hyundai", "HB20 1.0 Turbo", 2024, VehicleCategory.ECONOMY, "Silver",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 4500L, 115.0, VehicleBadge.HOT_DEAL,
                                "Rio de Janeiro", "RJ", "https://i.imgur.com/8XWbBZn.png",
                                "Design moderno e tecnologia de ponta com motor turbo eficiente.",
                                "https://i.imgur.com/2iOuIke.png", "https://i.imgur.com/RNyujJ0.png",
                                "https://i.imgur.com/huh9Sx6.png", "https://i.imgur.com/7tu2iOh.png"));
                vehicles.add(v("Fiat", "Argo 1.3 Drive", 2024, VehicleCategory.ECONOMY, "Gray",
                                FuelType.FLEX, Transmission.MANUAL, 5, 8000L, 105.0, null, "Campinas", "SP",
                                "https://i.imgur.com/XBO735z.png",
                                "Hatch compacto com boa dirigibilidade e custo acessível.",
                                "https://i.imgur.com/MSOv5c7.png", "https://i.imgur.com/f2q7jIR.png",
                                "https://i.imgur.com/VVDPCrH.png", "https://i.imgur.com/xwUBdAx.png"));
                vehicles.add(v("Volkswagen", "Polo 1.0 TSI", 2024, VehicleCategory.ECONOMY, "Gray",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 3000L, 130.0, VehicleBadge.NEW_RELEASE,
                                "Curitiba", "PR", "https://i.imgur.com/8tDX6bB.png",
                                "Motor TSI turbo com performance e economia impressionantes.",
                                "https://i.imgur.com/ezyW91b.png", "https://i.imgur.com/VPa5AOe.png",
                                "https://i.imgur.com/ljf5diC.png", "https://i.imgur.com/69Uzezg.png"));
                vehicles.add(v("Fiat", "Mobi 1.0 Drive", 2023, VehicleCategory.ECONOMY, "White",
                                FuelType.FLEX, Transmission.MANUAL, 5, 12000L, 89.0, null, "Belo Horizonte", "MG",
                                "https://i.imgur.com/xfDKWyk.jpeg",
                                "O carro mais acessível do Brasil, perfeito para o dia a dia.",
                                "https://i.imgur.com/IlWttwz.jpeg", "https://i.imgur.com/6CYqnFa.jpeg",
                                "https://i.imgur.com/sgTTTJf.jpeg", "https://i.imgur.com/Ci7znsW.jpeg"));
                vehicles.add(v("Renault", "Kwid 1.0 Zen", 2023, VehicleCategory.ECONOMY, "White",
                                FuelType.FLEX, Transmission.MANUAL, 5, 10000L, 85.0, null, "Salvador", "BA",
                                "https://i.imgur.com/jw4rs6W.png",
                                "SUV compacto com visual aventureiro e baixo consumo.",
                                "https://i.imgur.com/yXbFIMc.png", "https://i.imgur.com/PmucpQs.png",
                                "https://i.imgur.com/WqX9jSu.png", "https://i.imgur.com/udzkOsO.png"));
                vehicles.add(v("Volkswagen", "Gol 1.0 MPI", 2023, VehicleCategory.ECONOMY, "Silver",
                                FuelType.FLEX, Transmission.MANUAL, 5, 15000L, 100.0, null, "Porto Alegre", "RS",
                                "https://i.imgur.com/8d6FEyQ.jpeg",
                                "Lendário hatch brasileiro, confiável e econômico.",
                                "https://i.imgur.com/7lTiSJh.jpeg", "https://i.imgur.com/eJiEimy.jpeg",
                                "https://i.imgur.com/s0TVZKy.jpeg", "https://i.imgur.com/n1zdwov.jpeg"));
                vehicles.add(v("Chevrolet", "Prisma 1.4 LTZ", 2022, VehicleCategory.ECONOMY, "Gray",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 25000L, 95.0, null, "Goiânia", "GO",
                                "https://i.imgur.com/hA2lrMU.jpeg",
                                "Sedã compacto com bom espaço interno e porta-malas generoso.",
                                "https://i.imgur.com/6UMK45q.jpeg", "https://i.imgur.com/ZhTPwSr.jpeg",
                                "https://i.imgur.com/ewUs1SU.jpeg", "https://i.imgur.com/5oLnjUZ.jpeg"));
                vehicles.add(v("Fiat", "Uno 1.0 Fire", 2021, VehicleCategory.ECONOMY, "White",
                                FuelType.FLEX, Transmission.MANUAL, 5, 35000L, 75.0, null, "Manaus", "AM",
                                "https://i.imgur.com/wU8igjd.jpeg",
                                "Clássico brasileiro, manutenção barata e peças fáceis de encontrar.",
                                "https://i.imgur.com/rJdfXmu.jpeg", "https://i.imgur.com/DejybNY.jpeg",
                                "https://i.imgur.com/LYsfgmM.jpeg", "https://i.imgur.com/ciBNEBM.jpeg"));
                vehicles.add(v("Fiat", "Palio 1.0 Attractive", 2020, VehicleCategory.ECONOMY, "Gray",
                                FuelType.FLEX, Transmission.MANUAL, 5, 42000L, 70.0, null, "Fortaleza", "CE",
                                "https://i.imgur.com/M27WlFa.png",
                                "Popular brasileiro com baixo custo de manutenção.",
                                "https://i.imgur.com/jgFSjgS.png", "https://i.imgur.com/dnYQz7x.png",
                                "https://i.imgur.com/jn99iCi.png", "https://i.imgur.com/mjimDH4.png"));
                vehicles.add(v("Chevrolet", "Celta 1.0 Spirit", 2019, VehicleCategory.ECONOMY, "White",
                                FuelType.FLEX, Transmission.MANUAL, 5, 55000L, 65.0, null, "Recife", "PE",
                                "https://i.imgur.com/CjKgHwj.png",
                                "Econômico e resistente, ideal para primeiro carro.",
                                "https://i.imgur.com/sC3D6G4.png", "https://i.imgur.com/hwLEpaZ.png",
                                "https://i.imgur.com/z228lrF.png", "https://i.imgur.com/pbDvZwH.png"));
                vehicles.add(v("Ford", "Ka 1.0 SE", 2022, VehicleCategory.ECONOMY, "White",
                                FuelType.FLEX, Transmission.MANUAL, 5, 20000L, 80.0, null, "Natal", "RN",
                                "https://i.imgur.com/IHUhgvk.png",
                                "Compacto ágil com bom desempenho urbano.",
                                "https://i.imgur.com/HMCNtWs.png", "https://i.imgur.com/qW71hJb.png",
                                "https://i.imgur.com/hIDQFTz.png", "https://i.imgur.com/iueUaRk.png"));
                vehicles.add(v("Renault", "Sandero 1.0 Zen", 2023, VehicleCategory.ECONOMY, "White",
                                FuelType.FLEX, Transmission.MANUAL, 5, 18000L, 92.0, null, "Cuiabá", "MT",
                                "https://i.imgur.com/IV1pC7x.png",
                                "Hatch espaçoso com ótimo custo-benefício.",
                                "https://i.imgur.com/mRPAjtE.png", "https://i.imgur.com/mwJFpaB.png",
                                "https://i.imgur.com/P6eeqG5.png", "https://i.imgur.com/fNApdsr.png"));
                vehicles.add(v("Peugeot", "208 Griffe", 2024, VehicleCategory.ECONOMY, "Blue",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 2500L, 130.0, VehicleBadge.NEW_RELEASE,
                                "Porto Real", "RJ", "https://i.imgur.com/2F3hgbb.png",
                                "Design europeu premium com acabamento diferenciado.",
                                "https://i.imgur.com/Q7u8amt.png", "https://i.imgur.com/KS8eB7B.png",
                                "https://i.imgur.com/4KrxLzW.png", "https://i.imgur.com/RGySrXf.png"));
                vehicles.add(v("Citroën", "C3 Feel Pack", 2024, VehicleCategory.ECONOMY, "Gray",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 4000L, 110.0, null, "Porto Real", "RJ",
                                "https://i.imgur.com/ZJ9ric9.jpeg",
                                "Visual moderno com teto bicolor e multimídia de 10 polegadas.",
                                "https://i.imgur.com/UG5MKgY.jpeg", "https://i.imgur.com/8oLdwvQ.jpeg",
                                "https://i.imgur.com/OOQDjZR.jpeg", "https://i.imgur.com/jiavyaj.jpeg"));
                vehicles.add(v("Toyota", "Etios 1.3 X", 2022, VehicleCategory.ECONOMY, "White",
                                FuelType.FLEX, Transmission.MANUAL, 5, 28000L, 88.0, null, "Sorocaba", "SP",
                                "https://i.imgur.com/LFf5cnZ.png",
                                "Confiabilidade Toyota com baixo consumo e manutenção.",
                                "https://i.imgur.com/6339wxM.png", "https://i.imgur.com/cxvdTSz.png",
                                "https://i.imgur.com/rhvHdp4.png", "https://i.imgur.com/X7FetF4.png"));
                vehicles.add(v("Chevrolet", "Classic 1.0 LS", 2020, VehicleCategory.ECONOMY, "Gray",
                                FuelType.FLEX, Transmission.MANUAL, 5, 60000L, 60.0, null, "Belém", "PA",
                                "https://i.imgur.com/pW4vhYT.png",
                                "Sedan popular, amplo porta-malas e boa revenda.",
                                "https://i.imgur.com/IyO2dBM.png", "https://i.imgur.com/l0Bkuz8.png",
                                "https://i.imgur.com/hA85m2K.png", "https://i.imgur.com/pdGEwnN.png"));
                vehicles.add(v("Volkswagen", "Fox 1.6 Connect", 2021, VehicleCategory.ECONOMY, "Black",
                                FuelType.FLEX, Transmission.MANUAL, 5, 32000L, 82.0, null, "Campo Grande", "MS",
                                "https://i.imgur.com/favNFjt.png",
                                "Hatch divertido de dirigir com porta-malas surpreendente.",
                                "https://i.imgur.com/B4lTqSP.png", "https://i.imgur.com/gmz3hrh.png",
                                "https://i.imgur.com/rW8mo2X.png", "https://i.imgur.com/CZGO7CK.png"));
                vehicles.add(v("Nissan", "March 1.0 S", 2022, VehicleCategory.ECONOMY, "Gray",
                                FuelType.FLEX, Transmission.MANUAL, 5, 22000L, 78.0, null, "Resende", "RJ",
                                "https://i.imgur.com/z5leEEY.png",
                                "Compacto japonês com ar-condicionado e direção elétrica.",
                                "https://i.imgur.com/vfGU2Nd.png", "https://i.imgur.com/CbAbvwV.png",
                                "https://i.imgur.com/XI3zD1x.png", "https://i.imgur.com/MgbYGm5.png"));
                vehicles.add(v("Hyundai", "HB20 1.0 Sense", 2022, VehicleCategory.ECONOMY, "Gray",
                                FuelType.FLEX, Transmission.MANUAL, 5, 19000L, 90.0, null, "João Pessoa", "PB",
                                "https://i.imgur.com/v2kaE8N.png",
                                "Entrada da linha HB20 com excelente acabamento.",
                                "https://i.imgur.com/1dMWQqY.png", "https://i.imgur.com/ijx41n8.png",
                                "https://i.imgur.com/ZHySZBe.png", "https://i.imgur.com/IbTUoqZ.png"));

                // ===== COMPACT / SEDAN (15 vehicles) =====
                vehicles.add(v("Fiat", "Cronos 1.3 Precision", 2024, VehicleCategory.COMPACT, "Red",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 4000L, 145.0, VehicleBadge.BEST_SELLER,
                                "Brasília", "DF",
                                "https://i.imgur.com/5RLdity.png",
                                "Sedã líder de vendas com acabamento premium e câmbio CVT.",
                                "https://i.imgur.com/K5hsghK.png", "https://i.imgur.com/RDRRx86.png",
                                "https://i.imgur.com/vhUKVxK.png", "https://i.imgur.com/acx4laA.png"));
                vehicles.add(v("Honda", "City Hatchback", 2024, VehicleCategory.COMPACT, "Pearl White",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 2500L, 175.0, VehicleBadge.NEW_RELEASE,
                                "Recife", "PE",
                                "https://i.imgur.com/iUX1g35.png",
                                "Hatch premium Honda com motor 1.5 i-VTEC e câmbio CVT.",
                                "https://i.imgur.com/3wTHWK0.png", "https://i.imgur.com/8CZRJae.png",
                                "https://i.imgur.com/ni8BRE5.png", "https://i.imgur.com/fiB8Mvn.png"));
                vehicles.add(v("Toyota", "Yaris Sedan XS", 2024, VehicleCategory.COMPACT, "White",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 3000L, 165.0, null, "Fortaleza", "CE",
                                "https://i.imgur.com/mkY2886.png",
                                "Sedan compacto Toyota com 7 airbags e câmbio CVT.",
                                "https://i.imgur.com/q74Dmx9.png", "https://i.imgur.com/aYM4VwF.png",
                                "https://i.imgur.com/JSdZusH.png", "https://i.imgur.com/KyZ0VFp.png"));
                vehicles.add(v("Volkswagen", "Virtus Exclusive", 2024, VehicleCategory.COMPACT, "Gray",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 500L, 155.0, null, "São Paulo", "SP",
                                "https://i.imgur.com/UmjT0RD.png",
                                "Sedan premium com motor 1.0 TSI turbo e interior sofisticado.",
                                "https://i.imgur.com/3cBYe1I.png", "https://i.imgur.com/FD6Bxbv.png",
                                "https://i.imgur.com/FNb5kb2.png", "https://i.imgur.com/gj6iRch.png"));
                vehicles.add(v("Nissan", "Versa Exclusive", 2024, VehicleCategory.COMPACT, "Pearl White",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 3000L, 140.0, null, "Resende", "RJ",
                                "https://i.imgur.com/WQvAS2A.png",
                                "Sedan com melhor espaço interno da categoria.",
                                "https://i.imgur.com/TB4ZxBw.png", "https://i.imgur.com/tY3JiQR.png",
                                "https://i.imgur.com/1Hn4Rlc.png", "https://i.imgur.com/iWchXnS.png"));
                vehicles.add(v("Honda", "Civic Touring", 2024, VehicleCategory.COMPACT, "White",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 1500L, 220.0, VehicleBadge.NEW_RELEASE,
                                "São Paulo", "SP",
                                "https://i.imgur.com/J7uMAH3.png",
                                "Sedan premium com motor 1.5 turbo e acabamento luxuoso.",
                                "https://i.imgur.com/VnobGI8.png", "https://i.imgur.com/aLtfxuC.png",
                                "https://i.imgur.com/Ra9Z4S7.png", "https://i.imgur.com/bFrka2l.png"));
                vehicles.add(v("Toyota", "Corolla Altis Hybrid", 2024, VehicleCategory.COMPACT, "White",
                                FuelType.HYBRID, Transmission.AUTOMATIC, 5, 2000L, 245.0, VehicleBadge.HOT_DEAL,
                                "Indaiatuba", "SP",
                                "https://i.imgur.com/RXuOHqR.png",
                                "Sedan híbrido com tecnologia Full Hybrid e consumo excepcional.",
                                "https://i.imgur.com/nSr4BAg.png", "https://i.imgur.com/YhpKmiB.png",
                                "https://i.imgur.com/49ViYaP.png", "https://i.imgur.com/EhCuaoE.jpeg"));
                vehicles.add(v("Chevrolet", "Cruze Premier", 2024, VehicleCategory.COMPACT, "Black",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 3500L, 200.0, null, "São Caetano do Sul",
                                "SP",
                                "https://i.imgur.com/oUZtr4L.png",
                                "Sedan médio com motor 1.4 turbo e pacote completo de segurança.",
                                "https://i.imgur.com/ixy29e1.png", "https://i.imgur.com/LdJ039A.png",
                                "https://i.imgur.com/I8WtOqE.jpeg", "https://i.imgur.com/mCPiRKN.png"));
                vehicles.add(v("GWM", "Ora 03 GT", 2024, VehicleCategory.COMPACT, "White",
                                FuelType.ELECTRIC, Transmission.AUTOMATIC, 5, 1500L, 350.0, VehicleBadge.FULL_ELECTRIC,
                                "São Paulo", "SP",
                                "https://i.imgur.com/9RfnL7U.png",
                                "Compacto 100% elétrico com 171cv e 400km de autonomia.",
                                "https://i.imgur.com/KtUbpcR.png", "https://i.imgur.com/hTuUmap.png",
                                "https://i.imgur.com/8sjvWDQ.jpeg", "https://i.imgur.com/ZrgENWS.jpeg"));
                vehicles.add(v("Hyundai", "HB20S Platinum Plus", 2024, VehicleCategory.COMPACT, "Black",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 1800L, 150.0, null, "Piracicaba", "SP",
                                "https://i.imgur.com/Pr5hnoC.png",
                                "Sedan compacto topo de linha com câmbio automático de 6 marchas.",
                                "https://i.imgur.com/2iOuIke.png", "https://i.imgur.com/RNyujJ0.png",
                                "https://i.imgur.com/huh9Sx6.png", "https://i.imgur.com/7tu2iOh.png"));
                vehicles.add(v("Caoa Chery", "Arrizo 6 Pro", 2024, VehicleCategory.COMPACT, "White",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 5000L, 135.0, null, "Anápolis", "GO",
                                "https://i.imgur.com/rn2sOhj.png",
                                "Sedan com ótimo custo-benefício e garantia de 5 anos.",
                                "https://i.imgur.com/0r1Mglf.png", "https://i.imgur.com/ToruEzR.jpeg",
                                "https://i.imgur.com/f9ZC4Lq.jpeg", "https://i.imgur.com/4rC8dTn.jpeg"));

                // ===== SUV (25 vehicles) =====
                vehicles.add(v("Chevrolet", "Tracker 1.2 Premier", 2024, VehicleCategory.SUV, "Red",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 5500L, 195.0, VehicleBadge.BEST_SELLER,
                                "São Paulo", "SP",
                                "https://i.imgur.com/iEU9RAJ.png",
                                "SUV compacto líder de vendas com motor turbo e multimídia de 8 polegadas.",
                                "https://i.imgur.com/zYwPGQS.png", "https://i.imgur.com/doji7cc.png",
                                "https://i.imgur.com/mvIk9iA.png", "https://i.imgur.com/wGQ1jIv.png"));
                vehicles.add(v("Jeep", "Renegade 1.3 T270", 2024, VehicleCategory.SUV, "Blue",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 6000L, 185.0, VehicleBadge.HOT_DEAL,
                                "Vitória", "ES",
                                "https://i.imgur.com/CO260PM.png",
                                "SUV aventureiro com motor turbo flex e tração 4x2.",
                                "https://i.imgur.com/VpYd6Ii.png", "https://i.imgur.com/DvzGKDT.png",
                                "https://i.imgur.com/cOcLeAn.png", "https://i.imgur.com/dR5BHaC.png"));
                vehicles.add(v("Volkswagen", "T-Cross 1.0 Comfort", 2024, VehicleCategory.SUV, "Silver",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 4200L, 210.0, VehicleBadge.BEST_SELLER,
                                "Florianópolis", "SC",
                                "https://i.imgur.com/tarwitQ.png",
                                "SUV premium com motor TSI e pacote de segurança completo.",
                                "https://i.imgur.com/GA3hITU.png", "https://i.imgur.com/Fvj0Ry5.png",
                                "https://i.imgur.com/YLwaHy8.png", "https://i.imgur.com/sK2uyuN.png"));
                vehicles.add(v("Fiat", "Pulse 1.0 Turbo", 2024, VehicleCategory.SUV, "Red",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 3500L, 175.0, VehicleBadge.NEW_RELEASE,
                                "Goiânia", "GO",
                                "https://i.imgur.com/wd8YOzi.png",
                                "Primeiro SUV compacto da Fiat com motor turbo e multimídia.",
                                "https://i.imgur.com/7D1buqw.png", "https://i.imgur.com/9lt09rS.png",
                                "https://i.imgur.com/MQ92pVn.png", "https://i.imgur.com/JDb3dSI.png"));
                vehicles.add(v("Nissan", "Kicks 1.6 Exclusive", 2024, VehicleCategory.SUV, "Silver",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 5000L, 180.0, null, "Manaus", "AM",
                                "https://i.imgur.com/yA5zNJw.png",
                                "SUV conectado com sistema NissanConnect e câmera 360°.",
                                "https://i.imgur.com/E5ypNee.png", "https://i.imgur.com/GUXEOBh.png",
                                "https://i.imgur.com/8yBQpyy.png", "https://i.imgur.com/sYYo0Cu.png"));
                vehicles.add(v("Hyundai", "Creta 1.0 Ultimate", 2024, VehicleCategory.SUV, "White",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 4800L, 205.0, VehicleBadge.HOT_DEAL,
                                "Natal", "RN",
                                "https://i.imgur.com/cganjAN.png",
                                "SUV top com motor turbo, teto solar panorâmico e ACC.",
                                "https://i.imgur.com/niBKAw9.png", "https://i.imgur.com/B2B6gTz.png",
                                "https://i.imgur.com/7fJv7cH.png", "https://i.imgur.com/fqmNpZe.png-"));
                vehicles.add(v("Toyota", "Corolla Cross 2.0", 2024, VehicleCategory.SUV, "Blue",
                                FuelType.HYBRID, Transmission.AUTOMATIC, 5, 2000L, 250.0, VehicleBadge.HOT_DEAL,
                                "Belém", "PA",
                                "https://i.imgur.com/H1yhVcS.png",
                                "SUV híbrido Toyota com tecnologia Full Hybrid e baixo consumo.",
                                "https://i.imgur.com/WqxmScH.png", "https://i.imgur.com/H7jObgw.png",
                                "https://i.imgur.com/8WV44qr.png", "https://i.imgur.com/kx7VkEt.png"));
                vehicles.add(v("Jeep", "Compass 1.3 T270", 2024, VehicleCategory.SUV, "Gray",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 3000L, 280.0, VehicleBadge.BEST_SELLER,
                                "São Paulo", "SP",
                                "https://i.imgur.com/cJczXDl.jpeg",
                                "SUV premium com motor turbo flex e interior em couro.",
                                "https://i.imgur.com/94QAOUS.jpeg", "https://i.imgur.com/FpmBjBx.jpeg",
                                "https://i.imgur.com/wPHBs1U.jpeg", "https://i.imgur.com/OfMs6bA.jpeg"));
                vehicles.add(v("Volkswagen", "Nivus Highline", 2024, VehicleCategory.SUV, "Blue",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 1000L, 170.0, VehicleBadge.HOT_DEAL,
                                "São Caetano do Sul", "SP",
                                "https://i.imgur.com/xI3V1xB.png",
                                "SUV coupé com design exclusivo e motor TSI.",
                                "https://i.imgur.com/luGDjyt.png", "https://i.imgur.com/YhHPnyS.png",
                                "https://i.imgur.com/ntEahaI.png", "https://i.imgur.com/6BxfYSA.png"));
                vehicles.add(v("Fiat", "Fastback Limited", 2024, VehicleCategory.SUV, "White",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 800L, 185.0, VehicleBadge.NEW_RELEASE,
                                "Betim", "MG",
                                "https://i.imgur.com/YkIrA9o.png",
                                "SUV coupé da Fiat com motor 1.3 turbo e 185cv.",
                                "https://i.imgur.com/ucE2lz6.png", "https://i.imgur.com/WPEI7t8.png",
                                "https://i.imgur.com/VHk1NX0.png", "https://i.imgur.com/sKOcT2w.png"));
                vehicles.add(v("Jeep", "Commander Overland", 2024, VehicleCategory.SUV, "Silver",
                                FuelType.FLEX, Transmission.AUTOMATIC, 7, 1500L, 290.0, VehicleBadge.BEST_SELLER,
                                "Recife", "PE",
                                "https://i.imgur.com/zcqlU38.png",
                                "SUV 7 lugares com motor turbo diesel e tração 4x4.",
                                "https://i.imgur.com/1jY2uZN.png", "https://i.imgur.com/cO0JjPu.png",
                                "https://i.imgur.com/pisvEiU.png", "https://i.imgur.com/b2l5IJN.png"));
                vehicles.add(v("Honda", "HR-V Advance", 2024, VehicleCategory.SUV, "Silver",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 2000L, 195.0, null, "Sumaré", "SP",
                                "https://i.imgur.com/2knVqvS.png",
                                "SUV compacto Honda com motor 1.5 aspirado e bom espaço interno.",
                                "https://i.imgur.com/Owx831B.png", "https://i.imgur.com/3pokWAG.png",
                                "https://i.imgur.com/R1cGIeY.png", "https://i.imgur.com/gHOm830.png"));
                vehicles.add(v("Renault", "Duster Iconic", 2024, VehicleCategory.SUV, "Silver",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 5000L, 165.0, null, "São José dos Pinhais",
                                "PR",
                                "https://i.imgur.com/Me10bv3.png",
                                "SUV robusto com motor 1.6 e boa altura do solo.",
                                "https://i.imgur.com/tGAFZzf.png", "https://i.imgur.com/xblbOXZ.png",
                                "https://i.imgur.com/SEweH4v.png", "https://i.imgur.com/zP0QWYo.png"));
                vehicles.add(v("Volvo", "EX30 Ultra", 2024, VehicleCategory.SUV, "White",
                                FuelType.ELECTRIC, Transmission.AUTOMATIC, 5, 500L, 420.0, VehicleBadge.FULL_ELECTRIC,
                                "São Paulo", "SP",
                                "https://i.imgur.com/keogTA1.png",
                                "SUV elétrico compacto Volvo com 272cv e autonomia de 480km.",
                                "https://i.imgur.com/KYH4wJ2.png", "https://i.imgur.com/uCKV2Wf.png",
                                "https://i.imgur.com/FmdBqCD.png", "https://i.imgur.com/jafmuNx.png"));
                vehicles.add(v("Caoa Chery", "Tiggo 7 Pro", 2024, VehicleCategory.SUV, "Black",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 3000L, 160.0, null, "Jacareí", "SP",
                                "https://i.imgur.com/fMvUNYO.png",
                                "SUV médio com bom custo-benefício e garantia estendida.",
                                "https://i.imgur.com/ewb1X30.png", "https://i.imgur.com/PQRXvId.png",
                                "https://i.imgur.com/x1KdBwG.png", "https://i.imgur.com/KQ2ehcL.png"));
                vehicles.add(v("Caoa Chery", "Tiggo 8 Pro", 2024, VehicleCategory.SUV, "Black",
                                FuelType.FLEX, Transmission.AUTOMATIC, 7, 2000L, 195.0, null, "Jacareí", "SP",
                                "https://i.imgur.com/Tf2iDjU.jpeg",
                                "SUV 7 lugares com motor 1.6 turbo e 187cv.",
                                "https://i.imgur.com/CQ6gP9Y.jpeg", "https://i.imgur.com/in24d2u.jpeg",
                                "https://i.imgur.com/YSsHb0V.jpeg", "https://i.imgur.com/d4s2rs8.jpeg"));
                vehicles.add(v("Mitsubishi", "Outlander HPE-S", 2024, VehicleCategory.SUV, "Silver",
                                FuelType.GASOLINE, Transmission.AUTOMATIC, 7, 4000L, 310.0, null, "Catalão", "GO",
                                "https://i.imgur.com/SCQ5d92.png",
                                "SUV 7 lugares com motor 2.0 e tração integral S-AWC.",
                                "https://i.imgur.com/9JKmojS.png", "https://i.imgur.com/PROh9Oe.png",
                                "https://i.imgur.com/hOnWb4C.png", "https://i.imgur.com/xXN43bU.png"));
                vehicles.add(v("Toyota", "RAV4 Hybrid", 2024, VehicleCategory.SUV, "Silver",
                                FuelType.HYBRID, Transmission.AUTOMATIC, 5, 3000L, 340.0, VehicleBadge.HOT_DEAL,
                                "Indaiatuba", "SP",
                                "https://i.imgur.com/E1OtqoV.png",
                                "SUV híbrido com motor 2.5 e consumo de 17km/l na cidade.",
                                "https://i.imgur.com/jRguQup.png", "https://i.imgur.com/1YBBEN6.png",
                                "https://i.imgur.com/K0G2uNu.png", "https://i.imgur.com/9dn0h5E.png"));
                vehicles.add(v("BYD", "Song Plus DM-i", 2024, VehicleCategory.SUV, "Red",
                                FuelType.HYBRID, Transmission.AUTOMATIC, 5, 1000L, 380.0, VehicleBadge.NEW_RELEASE,
                                "Camaçari", "BA",
                                "https://i.imgur.com/22fW4rv.jpeg",
                                "SUV híbrido plug-in com 197cv combinados e 1.200km de autonomia total.",
                                "https://i.imgur.com/7d4NHfr.jpeg", "https://i.imgur.com/BHM3zZP.jpeg",
                                "https://i.imgur.com/nQIboIz.jpeg", "https://i.imgur.com/bfOYlWH.jpeg"));
                vehicles.add(v("BYD", "Yuan Plus", 2024, VehicleCategory.SUV, "Gray",
                                FuelType.ELECTRIC, Transmission.AUTOMATIC, 5, 800L, 350.0, VehicleBadge.FULL_ELECTRIC,
                                "Camaçari", "BA",
                                "https://i.imgur.com/9dpwg2e.jpeg",
                                "SUV 100% elétrico com 204cv e autonomia de 401km.",
                                "https://i.imgur.com/CbtzjEd.jpeg", "https://i.imgur.com/55HSFhG.jpeg",
                                "https://i.imgur.com/Sg8panp.jpeg", "https://i.imgur.com/PYfDpJ9.jpeg"));
                vehicles.add(v("Hyundai", "Tucson Limited", 2024, VehicleCategory.SUV, "White",
                                FuelType.GASOLINE, Transmission.AUTOMATIC, 5, 3500L, 260.0, null, "Piracicaba", "SP",
                                "https://i.imgur.com/1cM1d4l.png",
                                "SUV médio com motor 1.6 turbo e design futurista.",
                                "https://i.imgur.com/xAOO4wV.png", "https://i.imgur.com/gBn7kOr.png",
                                "https://i.imgur.com/zK1Q1if.png", "https://i.imgur.com/gRAGWeb.png"));
                vehicles.add(v("Chevrolet", "Equinox Premier", 2024, VehicleCategory.SUV, "White",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 2500L, 275.0, null, "São Paulo", "SP",
                                "https://i.imgur.com/KwgPHCK.png",
                                "SUV médio com motor 1.5 turbo e interior premium.",
                                "https://i.imgur.com/ibF9HZX.png", "https://i.imgur.com/WRrsI51.png",
                                "https://i.imgur.com/NHtmyZa.png", "https://i.imgur.com/pXVVNWG.png"));

                // ===== VAN / PICKUP (15 vehicles) =====
                vehicles.add(v("Chevrolet", "Spin 1.8 Premier", 2024, VehicleCategory.VAN, "White",
                                FuelType.FLEX, Transmission.AUTOMATIC, 7, 1000L, 190.0, null, "São Paulo", "SP",
                                "https://i.imgur.com/QNdawuD.jpeg",
                                "Minivan 7 lugares ideal para famílias, econômica e confortável.",
                                "https://i.imgur.com/M6bDwlQ.jpeg", "https://i.imgur.com/VqakRaQ.jpeg",
                                "https://i.imgur.com/Y9fpVuy.jpeg", "https://i.imgur.com/woURobY.jpeg"));
                vehicles.add(v("Fiat", "Strada 1.3 Freedom CD", 2024, VehicleCategory.VAN, "White",
                                FuelType.FLEX, Transmission.MANUAL, 5, 500L, 160.0, VehicleBadge.NEW_RELEASE,
                                "Uberlândia", "MG",
                                "https://i.imgur.com/kVjGHNj.png",
                                "Picape mais vendida do Brasil com cabine dupla e motor Firefly.",
                                "https://i.imgur.com/OJygylN.png", "https://i.imgur.com/RcyCa69.png",
                                "https://i.imgur.com/NwZyh6c.png", "https://i.imgur.com/jXe1rJo.png"));
                vehicles.add(v("Volkswagen", "Saveiro 1.6 Trend CS", 2024, VehicleCategory.VAN, "White",
                                FuelType.FLEX, Transmission.MANUAL, 2, 1000L, 155.0, null, "São Paulo", "SP",
                                "https://i.imgur.com/GDiV6rz.jpeg",
                                "Picape compacta robusta para trabalho e lazer.",
                                "https://i.imgur.com/Jy2c7xo.jpeg", "https://i.imgur.com/vkreQDf.jpeg",
                                "https://i.imgur.com/273xeYt.jpeg", "https://i.imgur.com/HycTilt.jpeg"));
                vehicles.add(v("Renault", "Oroch Outsider", 2024, VehicleCategory.VAN, "White",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 2000L, 175.0, null, "Curitiba", "PR",
                                "https://i.imgur.com/SVkdQdY.png",
                                "Picape média com visual aventureiro e motor 1.3 turbo.",
                                "https://i.imgur.com/q9HHPvC.png", "https://i.imgur.com/mU4ZL9k.png",
                                "https://i.imgur.com/T4n6yY0.png", "https://i.imgur.com/RcCWPYG.png"));
                vehicles.add(v("Chevrolet", "Montana RS", 2024, VehicleCategory.VAN, "Red",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 1200L, 180.0, VehicleBadge.NEW_RELEASE,
                                "Porto Alegre", "RS",
                                "https://i.imgur.com/ECFFWlm.jpeg",
                                "Nova picape Chevrolet com motor 1.2 turbo e caçamba de 800 litros.",
                                "https://i.imgur.com/KiqplS1.jpeg", "https://i.imgur.com/895fe2v.jpeg",
                                "https://i.imgur.com/DvIf5EB.jpeg", "https://i.imgur.com/Y6vEHxV.jpeg"));
                vehicles.add(v("Toyota", "Hilux SRX", 2024, VehicleCategory.VAN, "Silver",
                                FuelType.DIESEL, Transmission.AUTOMATIC, 5, 8000L, 350.0, VehicleBadge.BEST_SELLER,
                                "Goiânia", "GO",
                                "https://i.imgur.com/MOpl2XX.png",
                                "Picape diesel 4x4 referência em durabilidade e capacidade.",
                                "https://i.imgur.com/nC3kWDs.png", "https://i.imgur.com/RJU91Wn.png",
                                "https://i.imgur.com/UvwLMUU.png", "https://i.imgur.com/9uUbMQb.png"));
                vehicles.add(v("Ford", "Ranger Limited", 2024, VehicleCategory.VAN, "Red",
                                FuelType.DIESEL, Transmission.AUTOMATIC, 5, 5000L, 380.0, VehicleBadge.HOT_DEAL,
                                "Camaçari", "BA",
                                "https://i.imgur.com/sIJdI2x.png",
                                "Picape diesel V6 turbo com 250cv e tração 4x4.",
                                "https://i.imgur.com/l8APmPe.png", "https://i.imgur.com/G6TkOU8.png",
                                "https://i.imgur.com/Vvc6beq.png", "https://i.imgur.com/QtaIJM7.png"));
                vehicles.add(v("Chevrolet", "S10 High Country", 2024, VehicleCategory.VAN, "White",
                                FuelType.DIESEL, Transmission.AUTOMATIC, 5, 6000L, 360.0, null, "São José dos Campos",
                                "SP",
                                "https://i.imgur.com/tvoRJ0r.png",
                                "Picape diesel topo de linha com interior em couro e tração 4x4.",
                                "https://i.imgur.com/zcd7fwZ.png", "https://i.imgur.com/5k17SXU.png",
                                "https://i.imgur.com/5k17SXU.png", "https://i.imgur.com/Rz789LX.png"));
                vehicles.add(v("Mitsubishi", "L200 Triton Sport", 2024, VehicleCategory.VAN, "White",
                                FuelType.DIESEL, Transmission.AUTOMATIC, 5, 7000L, 320.0, null, "Catalão", "GO",
                                "https://i.imgur.com/o4qNsfM.jpeg",
                                "Picape diesel robusta com motor 2.4 turbo e 190cv.",
                                "https://i.imgur.com/eIk007H.jpeg", "https://i.imgur.com/Mpfl8Ab.jpeg",
                                "https://i.imgur.com/IGIJ0bG.jpeg", "https://i.imgur.com/T1YPxIZ.jpeg"));
                vehicles.add(v("Nissan", "Frontier Attack", 2024, VehicleCategory.VAN, "Black",
                                FuelType.DIESEL, Transmission.AUTOMATIC, 5, 4000L, 300.0, null, "Resende", "RJ",
                                "https://i.imgur.com/0MlZllR.jpeg",
                                "Picape diesel com motor 2.3 biturbo e 190cv.",
                                "https://i.imgur.com/C3VWs6F.jpeg", "https://i.imgur.com/GW86WBU.jpeg",
                                "https://i.imgur.com/LiYbxqC.jpeg", "https://i.imgur.com/9wMsE8I.jpeg"));
                vehicles.add(v("Volkswagen", "Amarok V6 Highline", 2024, VehicleCategory.VAN, "White",
                                FuelType.DIESEL, Transmission.AUTOMATIC, 5, 3500L, 400.0, VehicleBadge.NEW_RELEASE,
                                "São Carlos", "SP",
                                "https://i.imgur.com/aqKYEmK.png",
                                "Picape premium com motor V6 3.0 turbo diesel e 258cv.",
                                "https://i.imgur.com/LwiYvqX.png", "https://i.imgur.com/o81Ymqg.png",
                                "https://i.imgur.com/IlcZV77.png", "https://i.imgur.com/NlXPBcw.png"));
                vehicles.add(v("Fiat", "Toro Ranch", 2024, VehicleCategory.VAN, "Blue",
                                FuelType.DIESEL, Transmission.AUTOMATIC, 5, 5500L, 280.0, null, "Betim", "MG",
                                "https://i.imgur.com/RVBVb6s.png",
                                "Picape média diesel com motor 2.0 turbo e 170cv.",
                                "https://i.imgur.com/FQdpxR0.png", "https://i.imgur.com/HJCF84m.png",
                                "https://i.imgur.com/JLVwAdD.png", "https://i.imgur.com/kPPaTCS.png"));
                vehicles.add(v("Ram", "Rampage Rebel", 2024, VehicleCategory.VAN, "White",
                                FuelType.DIESEL, Transmission.AUTOMATIC, 5, 2000L, 320.0, VehicleBadge.NEW_RELEASE,
                                "Goiânia", "GO",
                                "https://i.imgur.com/y07X7j9.png",
                                "Picape média Stellantis com motor 2.0 turbo diesel e 200cv.",
                                "https://i.imgur.com/4bxNwZ9.png", "https://i.imgur.com/OChTxE4.png",
                                "https://i.imgur.com/VegYgRR.png", "https://i.imgur.com/kxIZpHA.png"));

                // ===== LUXURY (10 vehicles) =====
                vehicles.add(v("Tesla", "Model 3 Performance", 2024, VehicleCategory.LUXURY, "White",
                                FuelType.ELECTRIC, Transmission.AUTOMATIC, 5, 1200L, 550.0, VehicleBadge.FULL_ELECTRIC,
                                "São Paulo", "SP",
                                "https://i.imgur.com/2tPU1Wy.jpeg",
                                "Sedan elétrico de alto desempenho com 0-100 em 3.3s e autonomia de 547km.",
                                "https://i.imgur.com/SP05GBu.jpeg", "https://i.imgur.com/D8WdMIk.jpeg",
                                "https://i.imgur.com/2j5vioZ.jpeg", "https://i.imgur.com/H5toLZK.jpeg"));
                vehicles.add(v("BMW", "iX xDrive50", 2024, VehicleCategory.LUXURY, "Black",
                                FuelType.ELECTRIC, Transmission.AUTOMATIC, 5, 1000L, 880.0, VehicleBadge.FULL_ELECTRIC,
                                "São Paulo", "SP",
                                "https://i.imgur.com/hIXo1hh.jpeg",
                                "SUV elétrico de luxo BMW com 523cv e autonomia de 630km.",
                                "https://i.imgur.com/520MnwS.jpeg", "https://i.imgur.com/Ozw93pZ.jpeg",
                                "https://i.imgur.com/1IBVXZj.jpeg", "https://i.imgur.com/2TOJNaK.jpeg"));
                vehicles.add(v("Mercedes-Benz", "EQE 350+", 2024, VehicleCategory.LUXURY, "Silver",
                                FuelType.ELECTRIC, Transmission.AUTOMATIC, 5, 800L, 920.0, VehicleBadge.FULL_ELECTRIC,
                                "São Paulo", "SP",
                                "https://i.imgur.com/47xZxe7.png",
                                "Sedan executivo elétrico com 292cv e interior hiperscreen.",
                                "https://i.imgur.com/92bXFco.png", "https://i.imgur.com/X2Q6ZYF.png",
                                "https://i.imgur.com/XwSkJfS.png", "https://i.imgur.com/evnZP41.png"));
                vehicles.add(v("Range Rover", "Sport SV", 2024, VehicleCategory.LUXURY, "White",
                                FuelType.HYBRID, Transmission.AUTOMATIC, 5, 1500L, 920.0, null, "Balneário Camboriú",
                                "SC",
                                "https://i.imgur.com/6j8biaw.png",
                                "SUV de luxo britânico com motor V8 biturbo e acabamento impecável.",
                                "https://i.imgur.com/2q0ESBB.jpeg", "https://i.imgur.com/AMRV8nn.jpeg",
                                "https://i.imgur.com/kagsUdC.png", "https://i.imgur.com/d2EV46h.jpeg"));
                vehicles.add(v("BYD", "Seal", 2024, VehicleCategory.LUXURY, "Blue",
                                FuelType.ELECTRIC, Transmission.AUTOMATIC, 5, 2000L, 480.0, VehicleBadge.FULL_ELECTRIC,
                                "São Paulo", "SP",
                                "https://i.imgur.com/LUWZmYQ.jpeg",
                                "Sedan elétrico com 313cv, autonomia de 570km e plataforma dedicada.",
                                "https://i.imgur.com/FAidZIo.jpeg", "https://i.imgur.com/jY8xlFs.jpeg",
                                "https://i.imgur.com/TiR5qMf.jpeg", "https://i.imgur.com/mrcHqHY.jpeg"));
                vehicles.add(v("BMW", "330e M Sport", 2024, VehicleCategory.LUXURY, "Gray",
                                FuelType.HYBRID, Transmission.AUTOMATIC, 5, 3000L, 650.0, null, "Araquari", "SC",
                                "https://i.imgur.com/ZlC2zpp.png",
                                "Sedan híbrido plug-in com 292cv combinados e 59km em modo elétrico.",
                                "https://i.imgur.com/zHmUDR5.png", "https://i.imgur.com/tQeqK6V.png",
                                "https://i.imgur.com/eEhnAdb.png", "https://i.imgur.com/P4kvtSu.png"));
                vehicles.add(v("Audi", "Q5 S-line", 2024, VehicleCategory.LUXURY, "Gray",
                                FuelType.GASOLINE, Transmission.AUTOMATIC, 5, 2500L, 720.0, null,
                                "São José dos Pinhais", "PR",
                                "https://i.imgur.com/aFNLsnT.jpeg",
                                "SUV premium Audi com motor 2.0 TFSI e tração quattro.",
                                "https://i.imgur.com/xk2r6Gu.jpeg", "https://i.imgur.com/vGslWua.jpeg",
                                "https://i.imgur.com/U7zg1tt.jpeg", "https://i.imgur.com/JtSLgh0.jpeg"));
                vehicles.add(v("Mercedes-Benz", "GLC 300 4MATIC", 2024, VehicleCategory.LUXURY, "Silver",
                                FuelType.GASOLINE, Transmission.AUTOMATIC, 5, 3500L, 780.0, null, "Iracemápolis", "SP",
                                "https://i.imgur.com/nRUc4Mk.jpeg",
                                "SUV premium com motor 2.0 turbo de 258cv e acabamento AMG Line.",
                                "https://i.imgur.com/KzYCXLt.jpeg", "https://i.imgur.com/h9oMphO.jpeg",
                                "https://i.imgur.com/KLNxD5r.jpeg", "https://i.imgur.com/B3fyWxy.jpeg"));
                vehicles.add(v("Volvo", "XC60 T8 R-Design", 2024, VehicleCategory.LUXURY, "White",
                                FuelType.HYBRID, Transmission.AUTOMATIC, 5, 1500L, 850.0, VehicleBadge.HOT_DEAL,
                                "Curitiba", "PR",
                                "https://i.imgur.com/bXL3epy.jpeg",
                                "SUV híbrido plug-in com 455cv combinados e segurança referência.",
                                "https://i.imgur.com/1EZhmPI.jpeg", "https://i.imgur.com/ygBtHzX.jpeg",
                                "https://i.imgur.com/HoDXuKg.jpeg", "https://i.imgur.com/kn1EhI9.jpeg"));
                vehicles.add(v("BYD", "Han EV", 2024, VehicleCategory.LUXURY, "Black",
                                FuelType.ELECTRIC, Transmission.AUTOMATIC, 5, 600L, 520.0, VehicleBadge.FULL_ELECTRIC,
                                "Camaçari", "BA",
                                "https://i.imgur.com/voKjbqg.jpeg",
                                "Sedan elétrico de luxo chinês com 517cv e 0-100 em 3.9s.",
                                "https://i.imgur.com/9oTVslq.jpeg", "https://i.imgur.com/UFeuyVA.jpeg",
                                "https://i.imgur.com/cIso2tP.jpeg", "https://i.imgur.com/LOEDpt0.jpeg"));

                // ===== SPORT (10 vehicles) =====
                vehicles.add(v("Porsche", "Taycan Turbo S", 2024, VehicleCategory.SPORT, "White",
                                FuelType.ELECTRIC, Transmission.AUTOMATIC, 4, 800L, 950.0, VehicleBadge.FULL_ELECTRIC,
                                "São Paulo", "SP",
                                "https://i.imgur.com/AByc30f.png",
                                "Esportivo elétrico com 761cv e 0-100 em 2.8s.",
                                "https://i.imgur.com/Eo8vock.png", "https://i.imgur.com/0BiVK30.png",
                                "https://i.imgur.com/fl54mtz.png", "https://i.imgur.com/5zy9CeR.png"));
                vehicles.add(v("Audi", "RS e-tron GT", 2024, VehicleCategory.SPORT, "Black",
                                FuelType.ELECTRIC, Transmission.AUTOMATIC, 4, 500L, 980.0, VehicleBadge.FULL_ELECTRIC,
                                "São Paulo", "SP",
                                "https://i.imgur.com/Gsy6TUS.jpeg",
                                "Gran turismo elétrico com 646cv e design espetacular.",
                                "https://i.imgur.com/JGpbZVl.jpeg", "https://i.imgur.com/zoarGez.jpeg",
                                "https://i.imgur.com/TZzNUSn.jpeg", "https://i.imgur.com/NQ6MRYm.jpeg"));
                vehicles.add(v("Ferrari", "SF90 Stradale", 2024, VehicleCategory.SPORT, "Gray",
                                FuelType.HYBRID, Transmission.AUTOMATIC, 2, 120L, 2500.0, VehicleBadge.NEW_RELEASE,
                                "São Paulo", "SP",
                                "https://i.imgur.com/OFMzQkB.jpeg",
                                "Superesportivo híbrido Ferrari com 1000cv e motor V8 biturbo.",
                                "https://i.imgur.com/fzP7kzS.jpeg", "https://i.imgur.com/lShlZpF.jpeg",
                                "https://i.imgur.com/Iocqm1Q.jpeg", "https://i.imgur.com/AsTcTzH.jpeg"));
                vehicles.add(v("Lamborghini", "Revuelto", 2024, VehicleCategory.SPORT, "Orange",
                                FuelType.HYBRID, Transmission.AUTOMATIC, 2, 80L, 2600.0, VehicleBadge.NEW_RELEASE,
                                "São Paulo", "SP",
                                "https://i.imgur.com/wW5WIgb.png",
                                "Superesportivo híbrido com motor V12 e 3 motores elétricos, 1015cv.",
                                "https://i.imgur.com/BLQAcIC.png", "https://i.imgur.com/YHBzNR9.png",
                                "https://i.imgur.com/BzDva7y.png", "https://i.imgur.com/XQKDRi7.png"));
                vehicles.add(v("Chevrolet", "Camaro SS", 2024, VehicleCategory.SPORT, "Yellow",
                                FuelType.GASOLINE, Transmission.AUTOMATIC, 4, 3000L, 650.0, VehicleBadge.HOT_DEAL,
                                "São Paulo", "SP",
                                "https://i.imgur.com/A3kZh1h.png",
                                "Muscle car americano com motor V8 6.2L de 461cv.",
                                "https://i.imgur.com/jgBWdpq.png", "https://i.imgur.com/pFRmf1s.png",
                                "https://i.imgur.com/rlBF9T1.png", "https://i.imgur.com/whxP0uE.png"));
                vehicles.add(v("Ford", "Mustang GT", 2024, VehicleCategory.SPORT, "Red",
                                FuelType.GASOLINE, Transmission.AUTOMATIC, 4, 2000L, 700.0, null, "São Paulo", "SP",
                                "https://i.imgur.com/S0XBOzy.png",
                                "Pony car icônico com motor Coyote V8 5.0L de 480cv.",
                                "https://i.imgur.com/cd4n4cD.png", "https://i.imgur.com/IkRPwxa.png",
                                "https://i.imgur.com/tZremMt.png", "https://i.imgur.com/5xXGJeV.png"));
                vehicles.add(v("Toyota", "GR Supra 3.0", 2024, VehicleCategory.SPORT, "Gray",
                                FuelType.GASOLINE, Transmission.AUTOMATIC, 2, 1500L, 580.0, null, "São Paulo", "SP",
                                "https://i.imgur.com/dHqF2ah.jpeg",
                                "Esportivo japonês com motor 3.0 turbo de 387cv e câmbio de 8 marchas.",
                                "https://i.imgur.com/q9VnFEA.jpeg", "https://i.imgur.com/neUGXvo.jpeg",
                                "https://i.imgur.com/uErIvHB.jpeg", "https://i.imgur.com/DguhpC0.jpeg"));
                vehicles.add(v("Porsche", "718 Cayman GTS", 2024, VehicleCategory.SPORT, "Black",
                                FuelType.GASOLINE, Transmission.AUTOMATIC, 2, 2000L, 820.0, null, "São Paulo", "SP",
                                "https://i.imgur.com/1RIium5.jpeg",
                                "Esportivo central-engine com motor boxer 4.0L de 400cv.",
                                "https://i.imgur.com/K170SCz.jpeg", "https://i.imgur.com/XPaIraz.jpeg",
                                "https://i.imgur.com/nFkJkUf.jpeg", "https://i.imgur.com/V9q41pI.jpeg"));
                vehicles.add(v("Nissan", "GT-R Nismo", 2024, VehicleCategory.SPORT, "Silver",
                                FuelType.GASOLINE, Transmission.AUTOMATIC, 4, 1000L, 1200.0, VehicleBadge.NEW_RELEASE,
                                "São Paulo", "SP",
                                "https://i.imgur.com/6Qq0qeb.jpeg",
                                "Lenda japonesa com motor V6 3.8 biturbo de 600cv e tração AWD.",
                                "https://i.imgur.com/KTAlTvf.jpeg", "https://i.imgur.com/qdBp4WE.jpeg",
                                "https://i.imgur.com/8Cgl4qt.jpeg", "https://i.imgur.com/osdgApe.jpeg"));
                vehicles.add(v("McLaren", "720S Spider", 2024, VehicleCategory.SPORT, "White",
                                FuelType.GASOLINE, Transmission.AUTOMATIC, 2, 500L, 2200.0, null, "São Paulo", "SP",
                                "https://i.imgur.com/n5d3olP.png",
                                "Superesportivo britânico com motor V8 4.0 biturbo de 720cv.",
                                "https://i.imgur.com/ZcRNWrS.png", "https://i.imgur.com/v7blllg.png",
                                "https://i.imgur.com/qxg2EVX.png", "https://i.imgur.com/5T0pC9D.png"));

                // ===== INTERMEDIATE (5 vehicles) =====
                vehicles.add(v("BYD", "Dolphin Plus", 2024, VehicleCategory.INTERMEDIATE, "Silver",
                                FuelType.ELECTRIC, Transmission.AUTOMATIC, 5, 2000L, 320.0, VehicleBadge.FULL_ELECTRIC,
                                "São Paulo", "SP",
                                "https://i.imgur.com/Rp19fOq.jpeg",
                                "Hatch elétrico com 204cv e autonomia de 400km, zero emissões.",
                                "https://i.imgur.com/5JAdnX1.jpeg", "https://i.imgur.com/x2wXo10.jpeg",
                                "https://i.imgur.com/jUL3iKv.jpeg", "https://i.imgur.com/LeSOiY4.jpeg"));
                vehicles.add(v("Renault", "Megane E-Tech", 2024, VehicleCategory.INTERMEDIATE, "Gray",
                                FuelType.ELECTRIC, Transmission.AUTOMATIC, 5, 800L, 380.0, VehicleBadge.FULL_ELECTRIC,
                                "São Paulo", "SP",
                                "https://i.imgur.com/4FykcFN.png",
                                "Hatch elétrico europeu com 220cv e autonomia de 470km.",
                                "https://i.imgur.com/o5juYud.png", "https://i.imgur.com/q3hxD9Z.png",
                                "https://i.imgur.com/CcdQ4SR.png", "https://i.imgur.com/BJj0Yqt.png"));
                vehicles.add(v("Volkswagen", "ID.4", 2024, VehicleCategory.INTERMEDIATE, "Silver",
                                FuelType.ELECTRIC, Transmission.AUTOMATIC, 5, 600L, 400.0, VehicleBadge.FULL_ELECTRIC,
                                "São Paulo", "SP",
                                "https://i.imgur.com/4JONGsu.jpeg",
                                "SUV elétrico VW com 204cv, autonomia de 520km e carregamento rápido.",
                                "https://i.imgur.com/1P41cMq.jpeg", "https://i.imgur.com/dY1nt1b.jpeg",
                                "https://i.imgur.com/NqeiGpK.jpeg", "https://i.imgur.com/0953dl9.jpeg"));
                vehicles.add(v("Chevrolet", "Equinox EV", 2025, VehicleCategory.INTERMEDIATE, "Silver",
                                FuelType.ELECTRIC, Transmission.AUTOMATIC, 5, 100L, 440.0, VehicleBadge.FULL_ELECTRIC,
                                "São Paulo", "SP",
                                "https://i.imgur.com/fqnzH2a.png",
                                "SUV elétrico com 300cv e plataforma Ultium, autonomia de 515km.",
                                "https://i.imgur.com/4RzQANS.png", "https://i.imgur.com/EcnWTVY.png",
                                "https://i.imgur.com/ZsrF7GZ.png", "https://i.imgur.com/vMZx7iJ.png"));
                vehicles.add(v("Fiat", "500e Icon", 2024, VehicleCategory.INTERMEDIATE, "Black",
                                FuelType.ELECTRIC, Transmission.AUTOMATIC, 4, 300L, 290.0, VehicleBadge.FULL_ELECTRIC,
                                "Betim", "MG", "https://i.imgur.com/eB1xWPO.png",
                                "Compacto elétrico italiano com design icônico e 118cv.",
                                "https://i.imgur.com/KaAprQA.png", "https://i.imgur.com/UKaDj0k.png",
                                "https://i.imgur.com/Fxp2NPT.png", "https://i.imgur.com/HdSe9Mx.png"));

                // ===== 9 EXTRA VEHICLES TO REACH EXACTLY 100 TOTAL =====
                vehicles.add(v("Chevrolet", "Onix Plus 1.0 Turbo", 2024, VehicleCategory.ECONOMY, "White",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 4500L, 130.0, null,
                                "São Paulo", "SP",
                                "https://i.imgur.com/o63Qq7n.png",
                                "Versão sedan do compacto mais vendido do Brasil, muito espaço e economia.",
                                "https://i.imgur.com/Exuo827.png", "https://i.imgur.com/c0ICGOT.png",
                                "https://i.imgur.com/mQliwmW.png", "https://i.imgur.com/qeSI7Yx.png"));
                vehicles.add(v("Hyundai", "HB20S 1.0 Turbo", 2024, VehicleCategory.ECONOMY, "Gray",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 3200L, 125.0, null,
                                "Belo Horizonte", "MG",
                                "https://i.imgur.com/yfRHM9J.png",
                                "Sedan compacto com design elegante, ótimo espaço interno e motor turbo esperto.",
                                "https://i.imgur.com/8qwvNQR.png", "https://i.imgur.com/Mx4ZMxd.png",
                                "https://i.imgur.com/nZMR7Ir.jpeg", "https://i.imgur.com/X2zX3G1.jpeg"));
                vehicles.add(v("Volkswagen", "Voyage 1.6", 2023, VehicleCategory.ECONOMY, "White",
                                FuelType.FLEX, Transmission.MANUAL, 5, 14000L, 100.0, null,
                                "Curitiba", "PR",
                                "https://i.imgur.com/h6YqWVL.png",
                                "Clássico sedan brasileiro, robusto, econômico e com excelente porta-malas.",
                                "https://i.imgur.com/ph2qarM.png", "https://i.imgur.com/6fRARrU.png",
                                "https://i.imgur.com/J3a1QCy.png", "https://i.imgur.com/az8e2tK.png"));
                vehicles.add(v("Honda", "City Sedan EXL", 2024, VehicleCategory.COMPACT, "White",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 2800L, 170.0, null,
                                "Campinas", "SP",
                                "https://i.imgur.com/h78iVF5.jpeg",
                                "Sedan médio-compacto premium da Honda com alta confiabilidade e espaço interno imbatível.",
                                "https://i.imgur.com/3wTHWK0.png", "https://i.imgur.com/8CZRJae.png",
                                "https://i.imgur.com/ni8BRE5.png", "https://i.imgur.com/fiB8Mvn.png"));
                vehicles.add(v("Fiat", "Grand Siena 1.6", 2022, VehicleCategory.COMPACT, "White",
                                FuelType.FLEX, Transmission.MANUAL, 5, 26000L, 95.0, null,
                                "Porto Alegre", "RS",
                                "https://i.imgur.com/aJBeaGy.jpeg",
                                "Sedan espaçoso e confortável, ideal para famílias ou motoristas de aplicativo.",
                                "https://i.imgur.com/V3JIh9C.jpeg", "https://i.imgur.com/lXZbNB9.jpeg",
                                "https://i.imgur.com/wNTHqQs.jpeg", "https://i.imgur.com/q6nG70W.jpeg"));
                vehicles.add(v("Nissan", "Versa Sense CVT", 2023, VehicleCategory.COMPACT, "Silver",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 12000L, 135.0, null,
                                "Rio de Janeiro", "RJ",
                                "https://i.imgur.com/FQiTp49.png",
                                "Sedan moderno com ótimo espaço para pernas e porta-malas muito generoso.",
                                "https://i.imgur.com/TB4ZxBw.png", "https://i.imgur.com/tY3JiQR.png",
                                "https://i.imgur.com/1Hn4Rlc.png", "https://i.imgur.com/iWchXnS.png"));
                vehicles.add(v("Ford", "EcoSport Storm 2.0", 2021, VehicleCategory.SUV, "Gray",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 32000L, 160.0, null,
                                "Salvador", "BA",
                                "https://i.imgur.com/RMxqH52.png",
                                "SUV robusto com motor 2.0 potente, visual aventureiro e tração 4x4 inteligente.",
                                "https://i.imgur.com/rHJF7hz.png", "https://i.imgur.com/4c73KWG.png",
                                "https://i.imgur.com/wo7pjyc.png", "https://i.imgur.com/jFloTLL.png"));
                vehicles.add(v("Renault", "Captur 1.3 Turbo", 2023, VehicleCategory.SUV, "White",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 9000L, 170.0, null,
                                "Florianópolis", "SC",
                                "https://i.imgur.com/gKTpZxv.png",
                                "SUV com design refinado, motor turbo potente e muito conforto.",
                                "https://i.imgur.com/G2sEpYO.png", "https://i.imgur.com/yzceylR.png",
                                "https://i.imgur.com/oXJoacX.png", "https://i.imgur.com/AT6gQRJ.png"));
                vehicles.add(v("Citroën", "C4 Cactus Shine", 2024, VehicleCategory.SUV, "White",
                                FuelType.FLEX, Transmission.AUTOMATIC, 5, 1500L, 165.0, VehicleBadge.NEW_RELEASE,
                                "Goiânia", "GO",
                                "https://i.imgur.com/A8Ufnj5.png",
                                "SUV compacto ultra moderno, motor turbo potente e excelente nível de conforto.",
                                "https://i.imgur.com/6aFyBxp.png", "https://i.imgur.com/ylyLXea.png",
                                "https://i.imgur.com/Ob7Y4rL.png", "https://i.imgur.com/lGKHdwU.png"));

                vehicleRepository.saveAll(vehicles);
        }

        private Vehicle v(String brand, String model, int year, VehicleCategory cat, String color,
                        FuelType fuel, Transmission trans, int seats, Long mileage, double price, VehicleBadge badge,
                        String city, String state, String img, String description,
                        String g2, String g3, String g4, String g5) {
                int doors = seats <= 2 ? 2 : 4;
                Vehicle vehicle = Vehicle.builder()
                                .brand(brand).model(model).year(year).category(cat).color(color)
                                .fuelType(fuel).transmission(trans).seats(seats).doors(doors).mileage(mileage)
                                .pricePerDay(new BigDecimal(price)).salePrice(new BigDecimal(price * 300))
                                .badge(badge).available(true).imageUrl(img).city(city).state(state)
                                .description(description)
                                .freeTestDrive(badge == VehicleBadge.FREE_TEST_DRIVE)
                                .isNew(year >= 2024)
                                .build();

                List<VehicleImage> gallery = new ArrayList<>();
                gallery.add(VehicleImage.builder().vehicle(vehicle).position(2).imageUrl(g2 != null ? g2 : "").build());
                gallery.add(VehicleImage.builder().vehicle(vehicle).position(3).imageUrl(g3 != null ? g3 : "").build());
                gallery.add(VehicleImage.builder().vehicle(vehicle).position(4).imageUrl(g4 != null ? g4 : "").build());
                gallery.add(VehicleImage.builder().vehicle(vehicle).position(5).imageUrl(g5 != null ? g5 : "").build());
                vehicle.setGalleryImages(gallery);

                return vehicle;
        }
}
