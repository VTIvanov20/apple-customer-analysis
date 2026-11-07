# the formula for this goes as follows:
# interaction-to-employee ratio = (Product Interactions) / (Employees in Zone)

ratios <- estimated %>%
  left_join(
    employees,
    by = c("store", "zone")
  ) %>%
  mutate(
    interaction_employee_ratio = interactions / employee_count
  )

# Dislay of results
ratios %>%
  select(
    store,
    interval,
    zone,
    interaction_employee_ratio
  ) %>%
  pivot_wider(
    names_from = zone,
    values_from = interaction_employee_ratio
  ) %>%
  arrange(store, interval)