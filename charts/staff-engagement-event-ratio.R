chart4 <- ggplot(
  summary_stats,
  aes(
    x = zone,
    y = staff_engagement_ratio,
    fill = store
  )
) +
  geom_col(
    position = position_dodge(width = 0.75),
    width = 0.65
  ) +
  geom_text(
    aes(
      label = paste0(
        round(staff_engagement_ratio, 1),
        "%"
      )
    ),
    position = position_dodge(width = 0.75),
    vjust = -0.4,
    size = 4
  ) +
  scale_y_continuous(
    expand = expansion(mult = c(0, 0.15))
  ) +
  labs(
    title = "Staff Engagement Event Ratio",
    subtitle = "Staff interactions relative to product interactions",
    x = "Product category",
    y = "Staff-interaction events / product-interaction events (%)",
    fill = "Store",
    caption = "Event-count ratio; not the percentage of unique customers assisted."
  ) +
  theme_minimal(base_size = 13) +
  theme(
    legend.position = "top",
    panel.grid.minor = element_blank()
  )

print(chart4)

ggsave(
  "04_Staff_Engagement.png",
  chart4,
  width = 10,
  height = 6,
  dpi = 300
)