estimated <- crossing(
  store = c("MBS", "Orchard"),
  zone = c("iPhone", "Desktop", "Accessories"),
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

ggplot(
  estimated,
  aes(
    x = interval,
    y = interactions,
    group = zone,
    color = zone
  )
) +
  geom_line() +
  geom_point(aes(shape = source), size = 3) +
  facet_wrap(~store) +
  scale_x_continuous(
    breaks = 0:5,
    labels = c(
      "00-10", "10-20", "20-30",
      "30-40", "40-50", "50-60"
    )
  ) +
  labs(
    title = "Observed and Estimated Product Interactions",
    x = "Observation interval (minutes)",
    y = "Product interactions",
    color = "Product category",
    shape = "Data source"
  ) +
  theme_minimal()