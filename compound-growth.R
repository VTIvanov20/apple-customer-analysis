growth <- observations %>%
  group_by(store, zone) %>%
  arrange(interval, .by_group = TRUE) %>%
  summarise(
    first_interval = first(interval),
    first_record = first(product_interactions),
    second_record = last(product_interactions),
    
    factor = (second_record / first_record)^(1/3),
    
    growth_30min =
      (second_record / first_record - 1) * 100,
    
    .groups = "drop"
  )

print(growth)