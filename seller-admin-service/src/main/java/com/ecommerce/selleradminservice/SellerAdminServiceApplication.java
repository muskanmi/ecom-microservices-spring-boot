package com.ecommerce.selleradminservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class SellerAdminServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(SellerAdminServiceApplication.class, args);
	}

}
