package de.hsnv;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Entry point of the HSNV application (staff records, documents, eligibility gate). */
@SpringBootApplication
public class HsnvApplication {

    public static void main(String[] args) {
        SpringApplication.run(HsnvApplication.class, args);
    }
}
