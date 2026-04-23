package com.smartinventorypro.india.config;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.smartinventorypro.india.model.Product;
import com.smartinventorypro.india.model.Supplier;
import com.smartinventorypro.india.repository.ProductRepository;
import com.smartinventorypro.india.repository.SupplierRepository;
import com.smartinventorypro.india.service.ActivityLogService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
@SuppressWarnings("null")
public class DataLoader implements CommandLineRunner {

    private static final String MAHARASHTRA = "Maharashtra";

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final ActivityLogService activityLogService;

    @Override
    public void run(String... args) {
        if (supplierRepository.count() == 0) {
            seedSuppliers();
        }
        if (productRepository.count() == 0) {
            seedProducts();
            activityLogService.log("system", "Seeded initial suppliers and 550 products", "SYSTEM");
        }
    }

    private void seedSuppliers() {
        List<Supplier> suppliers = List.of(
                Supplier.builder().name("Tata Retail Distributors").city("Mumbai").state(MAHARASHTRA).contactEmail("tata@mailsip.in").phone("+91-9876500011").build(),
                Supplier.builder().name("Amul Foods Supply").city("Ahmedabad").state("Gujarat").contactEmail("amul@mailsip.in").phone("+91-9876500012").build(),
                Supplier.builder().name("Patanjali Essentials Hub").city("Haridwar").state("Uttarakhand").contactEmail("patanjali@mailsip.in").phone("+91-9876500013").build(),
                Supplier.builder().name("ITC SmartTrade").city("Kolkata").state("West Bengal").contactEmail("itc@mailsip.in").phone("+91-9876500014").build(),
                Supplier.builder().name("Dabur ValueChain").city("Ghaziabad").state("Uttar Pradesh").contactEmail("dabur@mailsip.in").phone("+91-9876500015").build(),
                Supplier.builder().name("Reliance Hyper Supply").city("Navi Mumbai").state(MAHARASHTRA).contactEmail("reliance@mailsip.in").phone("+91-9876500016").build(),
                Supplier.builder().name("Smart Bharat Suppliers").city("Bengaluru").state("Karnataka").contactEmail("bharat@mailsip.in").phone("+91-9876500017").build(),
                Supplier.builder().name("Punjab Wholesale Line").city("Ludhiana").state("Punjab").contactEmail("punjab@mailsip.in").phone("+91-9876500018").build(),
                Supplier.builder().name("Southern Trade Links").city("Chennai").state("Tamil Nadu").contactEmail("south@mailsip.in").phone("+91-9876500019").build(),
                Supplier.builder().name("North East Stockline").city("Guwahati").state("Assam").contactEmail("northeast@mailsip.in").phone("+91-9876500020").build()
        );
        supplierRepository.saveAll(suppliers);
    }

    private void seedProducts() {
        List<String> categories = List.of(
                "Grocery", "Electronics", "Clothing", "Stationery", "Home & Kitchen", "Personal Care",
                "Sports", "Footwear", "Health", "Books", "Appliances", "Baby Care"
        );

        List<String> brands = List.of(
                "Tata", "Amul", "Patanjali", "ITC", "Dabur", "Reliance", "Godrej", "Havells", "Parle", "Britannia"
        );

        List<String> variants = List.of(
                "500g", "1kg", "2kg", "250ml", "500ml", "Pack of 2", "Pack of 6", "Standard", "Premium", "XL"
        );

        List<String[]> cities = List.of(
                new String[]{"Amaravati", "Andhra Pradesh"},
                new String[]{"Itanagar", "Arunachal Pradesh"},
                new String[]{"Guwahati", "Assam"},
                new String[]{"Patna", "Bihar"},
                new String[]{"Raipur", "Chhattisgarh"},
                new String[]{"Panaji", "Goa"},
                new String[]{"Gandhinagar", "Gujarat"},
                new String[]{"Chandigarh", "Haryana"},
                new String[]{"Shimla", "Himachal Pradesh"},
                new String[]{"Ranchi", "Jharkhand"},
                new String[]{"Bengaluru", "Karnataka"},
                new String[]{"Thiruvananthapuram", "Kerala"},
                new String[]{"Bhopal", "Madhya Pradesh"},
                new String[]{"Mumbai", MAHARASHTRA},
                new String[]{"Imphal", "Manipur"},
                new String[]{"Shillong", "Meghalaya"},
                new String[]{"Aizawl", "Mizoram"},
                new String[]{"Kohima", "Nagaland"},
                new String[]{"Bhubaneswar", "Odisha"},
                new String[]{"Chandigarh", "Punjab"},
                new String[]{"Jaipur", "Rajasthan"},
                new String[]{"Gangtok", "Sikkim"},
                new String[]{"Chennai", "Tamil Nadu"},
                new String[]{"Hyderabad", "Telangana"},
                new String[]{"Agartala", "Tripura"},
                new String[]{"Lucknow", "Uttar Pradesh"},
                new String[]{"Dehradun", "Uttarakhand"},
                new String[]{"Kolkata", "West Bengal"}
        );

        List<BigDecimal> gstRates = List.of(new BigDecimal("5.00"), new BigDecimal("12.00"), new BigDecimal("18.00"));
        List<Supplier> suppliers = supplierRepository.findAll();

        Random random = new Random(42);
        List<Product> products = new ArrayList<>();

        for (int i = 1; i <= 550; i++) {
            String category = categories.get(random.nextInt(categories.size()));
            String brand = brands.get(random.nextInt(brands.size()));
            String variant = variants.get(random.nextInt(variants.size()));
            String[] cityState = cities.get(random.nextInt(cities.size()));
            BigDecimal gst = gstRates.get(random.nextInt(gstRates.size()));
            BigDecimal base = BigDecimal.valueOf(45L + random.nextInt(5000));
            BigDecimal finalPrice = base.add(base.multiply(gst).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
            int stock = 10 + random.nextInt(500);
            int reorder = 15 + random.nextInt(80);

            Product product = Product.builder()
                    .itemCode(String.format("SIP-%05d", i))
                    .name(category + " " + brand + " Item " + i)
                    .category(category)
                    .brand(brand)
                    .variant(variant)
                    .city(cityState[0])
                    .state(cityState[1])
                    .basePrice(base)
                    .gstPercent(gst)
                    .finalPrice(finalPrice)
                    .stockQuantity(stock)
                    .reorderLevel(reorder)
                    .imageUrl("https://picsum.photos/seed/sip" + i + "/300/200")
                    .supplier(suppliers.get(random.nextInt(suppliers.size())))
                    .build();

            products.add(product);
        }

        productRepository.saveAll(products);
    }
}
