ds_apple <- observations %>%
  left_join(
    employees,
    by = c("store", "zone")
  ) %>%
  mutate(
    interaction_employee_ratio = product_interactions / employee_count
  ) %>%
  group_by(store, zone) %>%
  summarise(
    n = n(),
    
    mean_interactions   = mean(product_interactions),
    median_interactions = median(product_interactions),
    sd_interactions     = sd(product_interactions),
    min_interactions    = min(product_interactions),
    max_interactions    = max(product_interactions),
    cv_percent          = sd_interactions / mean_interactions * 100,
    mean_CE             = mean(interaction_employee_ratio),
    .groups = "drop"
  )

print(ds_apple)
