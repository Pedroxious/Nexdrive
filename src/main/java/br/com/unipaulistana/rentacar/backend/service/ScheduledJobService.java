package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.domain.*;
import br.com.unipaulistana.rentacar.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledJobService {

    private final VehicleViewRepository vehicleViewRepository;
    private final RentalRepository rentalRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final VehicleRepository vehicleRepository;

    // ═══════════════════════════════════════════
    // ETAPA 4: Price Drop & Availability Monitor
    // Runs daily at 08:00
    // ═══════════════════════════════════════════
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void checkPriceDropsAndAvailability() {
        log.info("[SCHEDULED] Starting price drop and availability check...");

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<User> usersWithViews = vehicleViewRepository.findDistinctUsersWithViewsSince(thirtyDaysAgo);

        int priceDropCount = 0;

        for (User user : usersWithViews) {
            List<VehicleView> views = vehicleViewRepository.findByUserOrderByViewedAtDesc(user);

            for (VehicleView view : views) {
                Vehicle vehicle = view.getVehicle();
                BigDecimal currentPrice = vehicle.getPricePerDay();
                BigDecimal viewedPrice = view.getPriceAtView();

                // Price drop detection: current price is at least 5% lower than viewed price
                if (currentPrice.compareTo(viewedPrice) < 0) {
                    BigDecimal reduction = viewedPrice.subtract(currentPrice);
                    double pctDrop = reduction.doubleValue() / viewedPrice.doubleValue() * 100;

                    if (pctDrop >= 5.0) {
                        // Avoid duplicate: check if already notified for this vehicle
                        boolean alreadyNotified = notificationRepository
                                .existsByUserAndTypeAndReferenceTypeAndReferenceId(
                                        user, NotificationType.PRECO_REDUZIDO, "VEHICLE", vehicle.getId());

                        if (!alreadyNotified) {
                            String title = "Reducao de preco";
                            String message = String.format(
                                    "O %s %s que voce visualizou teve uma reducao de preco: de R$ %.2f para R$ %.2f (%.0f%% de desconto).",
                                    vehicle.getBrand(), vehicle.getModel(),
                                    viewedPrice, currentPrice, pctDrop);

                            notificationService.createNotification(
                                    user, NotificationType.PRECO_REDUZIDO,
                                    title, message, "VEHICLE", vehicle.getId());
                            priceDropCount++;
                        }
                    }
                }
            }
        }

        log.info("[SCHEDULED] Price drop check complete. {} notifications sent.", priceDropCount);
    }

    // ═══════════════════════════════════════════
    // ETAPA 5a: Abandoned Reservations
    // Runs every 30 minutes
    // ═══════════════════════════════════════════
    @Scheduled(cron = "0 */30 * * * *")
    @Transactional
    public void checkAbandonedReservations() {
        log.info("[SCHEDULED] Checking abandoned reservations...");

        LocalDateTime twoHoursAgo = LocalDateTime.now().minusHours(2);
        List<Rental> abandoned = rentalRepository.findAbandonedPendingRentals(twoHoursAgo);

        int count = 0;
        for (Rental rental : abandoned) {
            boolean alreadyNotified = notificationRepository
                    .existsByUserAndTypeAndReferenceTypeAndReferenceId(
                            rental.getUser(), NotificationType.ABANDONO_RESERVA, "RENTAL", rental.getId());

            if (!alreadyNotified) {
                Vehicle vehicle = rental.getVehicle();
                String title = "Reserva pendente";
                String message = String.format(
                        "Voce deixou uma reserva pendente para o %s %s. Finalize antes que as datas fiquem indisponiveis.",
                        vehicle.getBrand(), vehicle.getModel());

                notificationService.createNotification(
                        rental.getUser(), NotificationType.ABANDONO_RESERVA,
                        title, message, "RENTAL", rental.getId());
                count++;
            }
        }

        log.info("[SCHEDULED] Abandoned reservation check complete. {} notifications sent.", count);
    }

    // ═══════════════════════════════════════════
    // ETAPA 5b: Post-Rental Review Request
    // Runs daily at 10:00
    // ═══════════════════════════════════════════
    @Scheduled(cron = "0 0 10 * * *")
    @Transactional
    public void checkPostRentalReviews() {
        log.info("[SCHEDULED] Checking post-rental reviews...");

        LocalDate twoDaysAgo = LocalDate.now().minusDays(2);
        LocalDate oneDayAgo = LocalDate.now().minusDays(1);
        List<Rental> recentlyCompleted = rentalRepository.findRecentlyCompletedRentals(twoDaysAgo, oneDayAgo);

        int count = 0;
        for (Rental rental : recentlyCompleted) {
            boolean alreadyNotified = notificationRepository
                    .existsByUserAndTypeAndReferenceTypeAndReferenceId(
                            rental.getUser(), NotificationType.AVALIACAO_POS_ALUGUEL, "RENTAL", rental.getId());

            if (!alreadyNotified) {
                Vehicle vehicle = rental.getVehicle();
                String title = "Avalie sua experiencia";
                String message = String.format(
                        "Como foi sua experiencia com o %s %s? Sua avaliacao ajuda outros usuarios a escolher o veiculo ideal.",
                        vehicle.getBrand(), vehicle.getModel());

                notificationService.createNotification(
                        rental.getUser(), NotificationType.AVALIACAO_POS_ALUGUEL,
                        title, message, "RENTAL", rental.getId());
                count++;
            }
        }

        log.info("[SCHEDULED] Post-rental review check complete. {} notifications sent.", count);
    }

    // ═══════════════════════════════════════════
    // ETAPA 5c: Re-engagement (30 days inactive)
    // Runs daily at 11:00
    // ═══════════════════════════════════════════
    @Scheduled(cron = "0 0 11 * * *")
    @Transactional
    public void checkInactiveUsers() {
        log.info("[SCHEDULED] Checking inactive users for re-engagement...");

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<User> inactiveUsers = userRepository.findInactiveUsersSince(thirtyDaysAgo);

        int count = 0;
        for (User user : inactiveUsers) {
            // Only send once per 30-day period
            boolean alreadySent = notificationRepository
                    .existsRecentByUserAndType(user, NotificationType.REENGAJAMENTO, thirtyDaysAgo);

            if (!alreadySent) {
                String title = "Sentimos sua falta";
                String message = "Faz um tempo que voce nao nos visita. Confira as novidades da frota e ofertas exclusivas disponíveis para voce.";

                notificationService.createNotification(
                        user, NotificationType.REENGAJAMENTO,
                        title, message, null, null);
                count++;
            }
        }

        log.info("[SCHEDULED] Inactive user check complete. {} notifications sent.", count);
    }

    // ═══════════════════════════════════════════
    // ETAPA 5d: Account Anniversary
    // Runs daily at 09:00
    // ═══════════════════════════════════════════
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void checkAccountAnniversaries() {
        log.info("[SCHEDULED] Checking account anniversaries...");

        LocalDate oneYearAgoToday = LocalDate.now().minusYears(1);
        List<User> anniversaryUsers = userRepository.findByCreatedAtDate(oneYearAgoToday);

        int count = 0;
        for (User user : anniversaryUsers) {
            boolean alreadySent = notificationRepository
                    .existsRecentByUserAndType(user, NotificationType.ANIVERSARIO_CONTA,
                            LocalDateTime.now().minusDays(1));

            if (!alreadySent) {
                String title = "Feliz aniversario de conta";
                String message = String.format(
                        "Faz 1 ano que voce faz parte do Nexdrive, %s! Obrigado por confiar em nos.",
                        user.getFullName().split(" ")[0]);

                notificationService.createNotification(
                        user, NotificationType.ANIVERSARIO_CONTA,
                        title, message, null, null);
                count++;
            }
        }

        log.info("[SCHEDULED] Account anniversary check complete. {} notifications sent.", count);
    }

    // ═══════════════════════════════════════════
    // ETAPA 3 supplement: Pickup & Return Reminders
    // Runs daily at 07:00
    // ═══════════════════════════════════════════
    @Scheduled(cron = "0 0 7 * * *")
    @Transactional
    public void checkPickupAndReturnReminders() {
        log.info("[SCHEDULED] Checking pickup and return reminders...");

        LocalDate tomorrow = LocalDate.now().plusDays(1);

        // Pickup reminders: rentals starting tomorrow
        List<Rental> pickupTomorrow = rentalRepository.findByStartDateAndStatusIn(
                tomorrow, List.of(RentalStatus.CONFIRMED, RentalStatus.PENDING));

        int count = 0;
        for (Rental rental : pickupTomorrow) {
            boolean alreadySent = notificationRepository
                    .existsByUserAndTypeAndReferenceTypeAndReferenceId(
                            rental.getUser(), NotificationType.LEMBRETE_RETIRADA, "RENTAL", rental.getId());

            if (!alreadySent) {
                Vehicle vehicle = rental.getVehicle();
                String title = "Lembrete de retirada";
                String message = String.format(
                        "Sua retirada do %s %s esta agendada para amanha em %s. Tenha em maos seu documento de identidade e CNH.",
                        vehicle.getBrand(), vehicle.getModel(), rental.getPickupLocation());

                notificationService.createNotification(
                        rental.getUser(), NotificationType.LEMBRETE_RETIRADA,
                        title, message, "RENTAL", rental.getId());
                count++;
            }
        }

        // Return reminders: rentals ending tomorrow
        List<Rental> returnTomorrow = rentalRepository.findByEndDateAndStatusIn(
                tomorrow, List.of(RentalStatus.ACTIVE, RentalStatus.CONFIRMED));

        for (Rental rental : returnTomorrow) {
            boolean alreadySent = notificationRepository
                    .existsByUserAndTypeAndReferenceTypeAndReferenceId(
                            rental.getUser(), NotificationType.LEMBRETE_DEVOLUCAO, "RENTAL", rental.getId());

            if (!alreadySent) {
                Vehicle vehicle = rental.getVehicle();
                String title = "Lembrete de devolucao";
                String message = String.format(
                        "A devolucao do %s %s esta prevista para amanha em %s. Verifique o nivel de combustivel e a condicao do veiculo.",
                        vehicle.getBrand(), vehicle.getModel(), rental.getReturnLocation());

                notificationService.createNotification(
                        rental.getUser(), NotificationType.LEMBRETE_DEVOLUCAO,
                        title, message, "RENTAL", rental.getId());
                count++;
            }
        }

        log.info("[SCHEDULED] Pickup/return reminder check complete. {} notifications sent.", count);
    }
}
