package br.com.unipaulistana.rentacar.backend.service;

import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class UserAgentParserService {

    public record UserAgentInfo(
            String deviceType,
            String browser,
            String operatingSystem
    ) {}

    private static final Pattern BOT_PATTERN = Pattern.compile(
            "(?i)(bot|crawler|spider|scraper|curl|wget|python-requests|aiohttp|scrapy|httpclient|postman|headless|phantomjs|puppeteer|selenium|bytespider|googlebot|bingbot|yandex|duckduckbot)"
    );

    private static final Pattern TABLET_PATTERN = Pattern.compile("(?i)(ipad|tablet|playbook|silk)");
    private static final Pattern MOBILE_PATTERN = Pattern.compile("(?i)(mobi|android|iphone|ipod|blackberry|windows phone|iemobile|opera mini)");

    public UserAgentInfo parse(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return new UserAgentInfo("Unknown", "Desconhecido", "Desconhecido");
        }

        String ua = userAgent.trim();

        // 1. Check Bot
        if (BOT_PATTERN.matcher(ua).find()) {
            String botName = extractBotName(ua);
            return new UserAgentInfo("Bot", botName, "Automated / Bot");
        }

        // 2. Detect Device Type
        String deviceType = "Desktop";
        if (TABLET_PATTERN.matcher(ua).find()) {
            deviceType = "Tablet";
        } else if (MOBILE_PATTERN.matcher(ua).find()) {
            deviceType = "Mobile";
        }

        // 3. Detect Operating System
        String os = extractOperatingSystem(ua);

        // 4. Detect Browser
        String browser = extractBrowser(ua);

        return new UserAgentInfo(deviceType, browser, os);
    }

    private String extractBotName(String ua) {
        String lower = ua.toLowerCase();
        if (lower.contains("curl")) return "cURL";
        if (lower.contains("python-requests") || lower.contains("python")) return "Python / Requests";
        if (lower.contains("postman")) return "Postman";
        if (lower.contains("googlebot")) return "Googlebot";
        if (lower.contains("bingbot")) return "Bingbot";
        if (lower.contains("scrapy")) return "Scrapy";
        if (lower.contains("headless")) return "Headless Chrome";
        if (lower.contains("wget")) return "Wget";
        return "Bot / Scraper";
    }

    private String extractOperatingSystem(String ua) {
        String lower = ua.toLowerCase();
        if (lower.contains("windows nt 10.0") || lower.contains("windows nt 11.0") || lower.contains("windows 11")) return "Windows 11/10";
        if (lower.contains("windows nt 6.3")) return "Windows 8.1";
        if (lower.contains("windows nt 6.1")) return "Windows 7";
        if (lower.contains("windows")) return "Windows";

        if (lower.contains("iphone") || lower.contains("ipad") || lower.contains("ipod")) {
            Matcher m = Pattern.compile("os (\\d+[._]\\d+)").matcher(lower);
            if (m.find()) {
                return "iOS " + m.group(1).replace('_', '.');
            }
            return "iOS";
        }

        if (lower.contains("mac os x") || lower.contains("macintosh")) {
            Matcher m = Pattern.compile("mac os x (\\d+[._]\\d+)").matcher(lower);
            if (m.find()) {
                return "macOS " + m.group(1).replace('_', '.');
            }
            return "macOS";
        }

        if (lower.contains("android")) {
            Matcher m = Pattern.compile("android (\\d+(\\.\\d+)?)").matcher(lower);
            if (m.find()) {
                return "Android " + m.group(1);
            }
            return "Android";
        }

        if (lower.contains("cros")) return "ChromeOS";
        if (lower.contains("linux")) return "Linux";

        return "Desconhecido";
    }

    private String extractBrowser(String ua) {
        // Order is important because modern browsers contain Chrome/Safari in their UA
        Matcher edge = Pattern.compile("Edg/(\\d+)").matcher(ua);
        if (edge.find()) return "Edge " + edge.group(1);

        Matcher opera = Pattern.compile("(OPR|Opera)/(\\d+)").matcher(ua);
        if (opera.find()) return "Opera " + opera.group(2);

        Matcher samsung = Pattern.compile("SamsungBrowser/(\\d+)").matcher(ua);
        if (samsung.find()) return "Samsung Internet " + samsung.group(1);

        Matcher chrome = Pattern.compile("Chrome/(\\d+)").matcher(ua);
        if (chrome.find() && !ua.contains("Chromium")) return "Chrome " + chrome.group(1);

        Matcher firefox = Pattern.compile("Firefox/(\\d+)").matcher(ua);
        if (firefox.find()) return "Firefox " + firefox.group(1);

        Matcher safari = Pattern.compile("Version/(\\d+).*Safari").matcher(ua);
        if (safari.find()) return "Safari " + safari.group(1);

        if (ua.contains("Safari") && !ua.contains("Chrome")) return "Safari";

        return "Navegador Web";
    }
}
