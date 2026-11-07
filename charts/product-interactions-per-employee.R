chart3 <- ggplot(
  summary_stats,
  aes(
    x = zone,
    y = interactions_per_employee,
    fill = store
  )
) +
  geom_col(
    position = position_dodge(width = 0.75),
    width = 0.65
  ) +
  geom_text(
    aes(
      label = round(interactions_per_employee, 2)
    ),
    position = position_dodge(width = 0.75),
    vjust = -0.4,
    size = 4
  ) +
  scale_y_continuous(
    expand = expansion(mult = c(0, 0.15))
  ) +
  labs(
    title = "Product Interactions per Employee",
    subtitle = "Comparison of observed activity relative to staffing",
    x = "Product category",
    y = "Interaction events per employee per 10 minutes",
    fill = "Store",
    caption = paste(
      "Product-interaction events divided by typical zone staffing.",
      "Not unique customers per employee."
    )
  ) +
  theme_minimal(base_size = 13) +
  theme(
    legend.position = "top",
    panel.grid.minor = element_blank()
  )

print(chart3)

ggsave(
  "03_Interactions_Per_Employee.png",
  chart3,
  width = 10,
  height = 6,
  dpi = 300
)