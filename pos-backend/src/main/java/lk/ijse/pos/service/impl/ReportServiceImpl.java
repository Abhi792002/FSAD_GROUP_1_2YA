package lk.ijse.pos.service.impl;

import lk.ijse.pos.dto.SalesReportDto;
import lk.ijse.pos.dto.UserHoursDto;
import lk.ijse.pos.entity.CheckoutEntity;
import lk.ijse.pos.entity.CheckoutItemEntity;
import lk.ijse.pos.entity.UserLoginDetailsEntity;
import lk.ijse.pos.repository.CheckoutRepository;
import lk.ijse.pos.repository.UserLoginDetailsRepository;
import lk.ijse.pos.security.UserDetailsServiceImpl;
import lk.ijse.pos.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ReportServiceImpl implements ReportService {

    @Autowired
    private CheckoutRepository checkoutRepository;

    @Autowired
    private UserLoginDetailsRepository userLoginDetailsRepository;

    @Override
    public List<UserHoursDto> getUserHoursWorked() {
        List<UserLoginDetailsEntity> logs = userLoginDetailsRepository.findAll();

        return logs.stream()
                .filter(log -> log.getLoginTime() != null && log.getLogoutTime() != null)
                .collect(Collectors.groupingBy(
                        log -> log.getUser().getUsername() + "_" + log.getLoginTime().toLocalDate(),
                        Collectors.summingDouble(log -> Duration.between(log.getLoginTime(), log.getLogoutTime()).toMinutes() / 60.0)
                ))
                .entrySet().stream()
                .map(e -> {
                    String[] parts = e.getKey().split("_");
                    return new UserHoursDto(parts[0], parts[1], e.getValue());
                })
                .collect(Collectors.toList());
    }


    @Override
    public List<UserLoginDetailsEntity> getUserLoginDetails(){
        return userLoginDetailsRepository.findAll();
    }

    @Override
    public List<String> getSalesDates(){
        return checkoutRepository.findAll().stream()
                .map(c -> c.getOrderTime().toLocalDate().toString())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    @Override
    public List<SalesReportDto> getSalesReport(String period, String reportType, LocalDate startDate, LocalDate endDate) {
        switch (reportType.toLowerCase()) {
            case "totalsales":
                return getSalesByTimePeriod(period, startDate, endDate);

            case "orderscount":
                return getOrderCountByTimePeriod(period, startDate, endDate);

            case "categorysales":
                return getSalesByCategory(startDate, endDate);

            default:
                throw new IllegalArgumentException("Unsupported report type: " + reportType);
        }
    }

    private List<SalesReportDto> getSalesByTimePeriod(String period, LocalDate startDate, LocalDate endDate) {
        List<CheckoutEntity> checkouts = filterCheckouts(startDate, endDate);

        Function<LocalDateTime, String> grouper;

        switch (period.toLowerCase()) {
            case "daily":
                DateTimeFormatter dailyFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                grouper = dt -> dt.format(dailyFormatter);
                break;
            case "weekly":
                grouper = dt -> {
                    WeekFields weekFields = WeekFields.of(Locale.getDefault());
                    int week = dt.get(weekFields.weekOfWeekBasedYear());
                    return "Week " + week + ", " + dt.getYear();
                };
                break;
            case "monthly":
                DateTimeFormatter monthlyFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
                grouper = dt -> dt.format(monthlyFormatter);
                break;
            case "yearly":
                grouper = dt -> String.valueOf(dt.getYear());
                break;
            case "custom":
                grouper = dt -> dt.toLocalDate().toString(); // Treat each day as label
                break;
            default:
                throw new IllegalArgumentException("Invalid period: " + period);
        }

        return checkouts.stream()
                .collect(Collectors.groupingBy(
                        c -> grouper.apply(c.getOrderTime()),
                        Collectors.summingDouble(CheckoutEntity::getTotal)
                ))
                .entrySet().stream()
                .map(e -> new SalesReportDto(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(SalesReportDto::getLabel))
                .collect(Collectors.toList());
    }

    private List<SalesReportDto> getOrderCountByTimePeriod(String period, LocalDate startDate, LocalDate endDate) {
        List<CheckoutEntity> checkouts = filterCheckouts(startDate, endDate);

        Function<LocalDateTime, String> grouper;

        switch (period.toLowerCase()) {
            case "daily":
                DateTimeFormatter dailyFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                grouper = dt -> dt.format(dailyFormatter);
                break;
            case "weekly":
                grouper = dt -> {
                    WeekFields weekFields = WeekFields.of(Locale.getDefault());
                    int week = dt.get(weekFields.weekOfWeekBasedYear());
                    return "Week " + week + ", " + dt.getYear();
                };
                break;
            case "monthly":
                DateTimeFormatter monthlyFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
                grouper = dt -> dt.format(monthlyFormatter);
                break;
            case "yearly":
                grouper = dt -> String.valueOf(dt.getYear());
                break;
            case "custom":
                grouper = dt -> dt.toLocalDate().toString();
                break;
            default:
                throw new IllegalArgumentException("Invalid period: " + period);
        }

        return checkouts.stream()
                .collect(Collectors.groupingBy(
                        c -> grouper.apply(c.getOrderTime()),
                        Collectors.counting()
                ))
                .entrySet().stream()
                .map(e -> new SalesReportDto(e.getKey(), e.getValue().doubleValue()))
                .sorted(Comparator.comparing(SalesReportDto::getLabel))
                .collect(Collectors.toList());
    }

    private List<SalesReportDto> getSalesByCategory(LocalDate startDate, LocalDate endDate) {
        List<CheckoutEntity> checkouts = filterCheckouts(startDate, endDate);

        return checkouts.stream()
                .flatMap(checkout -> checkout.getCheckoutItems().stream())
                .collect(Collectors.groupingBy(
                        item -> item.getItem().getCategoryEntity().getName(),
                        Collectors.summingDouble(item -> item.getItem().getPrice() * item.getQuantity())
                ))
                .entrySet().stream()
                .map(e -> new SalesReportDto(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(SalesReportDto::getLabel))
                .collect(Collectors.toList());
    }

    private List<CheckoutEntity> filterCheckouts(LocalDate start, LocalDate end) {
        if(start != null && end != null){
            return checkoutRepository.findAll().stream()
                    .filter(c -> {
                        if (start != null && end != null) {
                            LocalDate orderDate = c.getOrderTime().toLocalDate();
                            return !orderDate.isBefore(start) && !orderDate.isAfter(end);
                        }
                        return true; // no filter
                    })
                    .collect(Collectors.toList());
        }
        return checkoutRepository.findAll();
    }


}
