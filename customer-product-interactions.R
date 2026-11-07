chart1 <- ggplot(
  summary_stats,
  aes(
    x = zone,
    y = mean_interactions,
    fill = store
  )
) +
  geom_col(
    position = position_dodge(width = 0.75),
    width = 0.65
  ) +
  geom_text(
    aes(label = round(mean_interactions, 1)),
    position = position_dodge(width = 0.75),
    vjust = -0.4,
    size = 4
  ) +
  scale_y_continuous(
    expand = expansion(mult = c(0, 0.15))
  ) +
  labs(
    title = "Customer Product Interactions",
    subtitle = "Apple Marina Bay Sands vs Orchard",
    x = "Product category",
    y = "Mean interactions per 10 minutes",
    fill = "Store",
    caption = "Based on two observed intervals per category and store."
  ) +
  theme_minimal(base_size = 13) +
  theme(
    legend.position = "top",
    panel.grid.minor = element_blank()
  )

print(chart1)

ggsave(
  "01_Product_Interactions.png",
  chart1,
  width = 10,
  height = 6,
  dpi = 300
)