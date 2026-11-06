estimated <- crossing(
  store = c("MBS", "Orchard"),
  zone = c("iPhone", "Mac", "Accessories"),
  interval = 0:5
) %>%
  left_join(growth, by = c("store", "zone")) %>%
  mutate(
    estimated_interactions =
      first_record * factor^(interval - first_interval)
  ) %>%
  left_join(
    observations %>%
      select(store, zone, interval, product_interactions),
    by = c("store", "zone", "interval")
  ) %>%
  mutate(
    source = if_else(
      is.na(product_interactions),
      "Estimated",
      "Observed"
    ),
    interactions = coalesce(
      product_interactions,
      estimated_interactions
    )
  )