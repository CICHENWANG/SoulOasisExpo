package com.equestria.sosd_blog.Utils;

import org.springframework.stereotype.Component;

import java.util.function.Predicate;

@Component
public class LambdaCheckerUtils {

    private final Predicate<String> PASSWORD_RULE =
            password -> password != null && password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,20}$");

    private final Predicate<String> PHONE_RULE =
            phone -> phone != null && phone.matches("^1[3-9]\\d{9}$");

    private  final Predicate<String> EMAIL_RULE =
            email -> email != null && email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private final Predicate<String> USERNAME_RULE=
            username-> username != null && username.matches("^[A-Za-z0-9]{1,20}$");


    public boolean isValidPw(String password) {
        return PASSWORD_RULE.test(password);
    }

    public boolean isValidPhone(String phone) {
        return PHONE_RULE.test(phone);
    }

    public boolean isValidEmail(String email) {
        return EMAIL_RULE.test(email);
    }

    public boolean isValidUsername(String username) {
        return USERNAME_RULE.test(username);
    }

}
