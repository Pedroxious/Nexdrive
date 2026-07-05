package br.com.unipaulistana.rentacar.backend.presentation;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller to forward all client-side routes to Angular's index.html.
 * This enables browser refresh and deep linking on client-side paths.
 */
@Controller
public class SpaController {

    @RequestMapping(value = {
        "/",
        "/buy",
        "/rent",
        "/car/{id:\\d+}",
        "/rent/{id:\\d+}",
        "/favorites",
        "/my-rentals",
        "/profile",
        "/sell-car",
        "/about",
        "/faq",
        "/contact",
        "/privacy",
        "/terms",
        "/login",
        "/register",
        "/404"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
