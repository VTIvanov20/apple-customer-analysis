chart2 <- ggplot(
  employees,
  aes(
    x = zone,
    y = employee_count,
    fill = floor
  )
) +
  geom_col(width = 0.65) +
  geom_text(
    aes(label = employee_count),
    position = position_stack(vjust = 0.5),
    size = 4
  ) +
  facet_wrap(~store) +
  scale_y_continuous(
    breaks = seq(0, 20, 2),
    expand = expansion(mult = c(0, 0.1))
  ) +
  labs(
    title = "Employee Allocation by Product Category",
    subtitle = "Typical observed staffing distribution",
    x = "Product category",
    y = "Number of employees",
    fill = "Floor",
    caption = "Employees move between zones; counts represent typical allocations."
  ) +
  theme_minimal(base_size = 13) +
  theme(
    legend.position = "bottom",
    panel.grid.minor = element_blank()
  )

print(chart2)

ggsave(
  "02_Employee_Allocation.png",
  chart2,
  width = 11,
  height = 6,
  dpi = 300
)